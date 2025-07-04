import { mergeFilesApi, getDownloadUrlApi } from "../services/apiServices";
import { useTrackingAndMessages } from "./useTrackingAndMessages";
import { useMergeProgressBar } from "./useMergeProgressBar";
import { computed, ref, watch } from "vue";

export function useMergeFiles(initialFilesProp, emit) {
    const currentFiles = ref([]);
    const selectedFile1 = ref(null); // File thành phần được chọn
    const selectedFile2 = ref(null); // Chỉ dùng cho lần merge đầu tiên (nếu không có summaryFile)
    const mergeResultFile = ref(null); // Đối tượng file kết quả merge cuối cùng (id, minioObjectName, etc.)
    const isMerging = ref(false);
    const abortController = ref(null);

    const isAutoMergeMode = ref(false);

    // summaryFile sẽ lưu trữ minioObjectName của file TỔNG HỢP (kết quả merge trước đó)
    // để gửi trong payload riêng biệt.
    const summaryFile = ref(null);

    const { errorMessages, addMessage, clearErrorMessages } = useTrackingAndMessages();
    const {
        showMergeProgressBar,
        mergeProgress,
        mergeStatusText,
        startProgressBar,
        completeProgressBar,
        resetProgressBar
    } = useMergeProgressBar();

    // Watcher for initialFiles: Reset when new files come from parent component
    watch(
        initialFilesProp,
        (newVal) => {
            if (newVal && newVal.length > 0) {
                currentFiles.value = [...newVal];
                mergeResultFile.value = null;
                selectedFile1.value = null;
                selectedFile2.value = null;
                summaryFile.value = null; // Reset summaryFile khi có file mới ban đầu
                addMessage("File mới đã sẵn sàng ghép nối.", "info", "info");
                clearErrorMessages();
            } else {
                currentFiles.value = [];
                mergeResultFile.value = null;
                selectedFile1.value = null;
                selectedFile2.value = null;
                summaryFile.value = null;
                clearErrorMessages();
            }
        },
        { immediate: true, deep: true }
    );

    // Watcher for isAutoMergeMode: Reset file selection after changing mode
    watch(isAutoMergeMode, (newMode) => {
        if (newMode) {
            selectedFile1.value = null;
            selectedFile2.value = null;
            summaryFile.value = null; // Clear summaryFile if switching to auto
        } else {
            // Khi chuyển sang chế độ thủ công, nếu có file kết quả merge trước đó,
            // đặt nó làm summaryFile để sẵn sàng cho chuỗi merge.
            if (mergeResultFile.value) {
                summaryFile.value = mergeResultFile.value.minioObjectName;
                // Nếu UI vẫn sử dụng selectedFile2 cho việc hiển thị file tổng hợp,
                // bạn có thể cập nhật nó ở đây. Tuy nhiên, logic merge sẽ không dùng nó.
                // selectedFile2.value = mergeResultFile.value.id;
            }
        }
    });

    // Computed: Danh sách file để hiển thị trong dropdown cho File 1
    const filesForSelection1 = computed(() => {
        // Lọc ra file đang là summaryFile để tránh chọn lại chính nó làm file thành phần
        // (Trừ khi summaryFile không còn trong currentFiles, nhưng logic dưới sẽ đảm bảo nó luôn có)
        return currentFiles.value.filter(f => f.minioObjectName !== summaryFile.value);
    });

    // Computed: Danh sách file để hiển thị trong dropdown cho File 2 (chỉ cần thiết cho lần merge đầu)
    const filesForSelection2 = computed(() => {
        // Nếu đã có summaryFile, dropdown File 2 không cần thiết hoặc có thể tự động chọn file tổng hợp
        // Nếu chưa có summaryFile (lần merge đầu), thì hiển thị tất cả các file còn lại trừ selectedFile1
        if (summaryFile.value) {
            // Có thể trả về rỗng nếu bạn không muốn dropdown 2 xuất hiện, hoặc
            // trả về file summary để hiển thị cho người dùng biết nó đang được ghép nối với cái gì.
            const summaryFileObj = currentFiles.value.find(f => f.minioObjectName === summaryFile.value);
            return summaryFileObj ? [summaryFileObj] : [];
        }
        return currentFiles.value.filter(f => f.id !== selectedFile1.value);
    });

    // Computed: Kiểm tra xem có thể thực hiện Merge hay không
    const canPerformMerge = computed(() => {
        if (isMerging.value) return false;

        if (isAutoMergeMode.value) {
            // Auto merge requires at least 1 file to "process" (if backend supports 1-file processing)
            // or 2 files for actual merging. For consistency with manual, let's allow 1.
            return currentFiles.value.length >= 1; // Modified: allow 1 file for auto-merge as well
        } else {
            // Manual merge logic
            if (summaryFile.value) {
                // If there's an existing summary file, we need selectedFile1 to merge with it
                const file1Obj = currentFiles.value.find(f => f.id === selectedFile1.value);
                return selectedFile1.value !== null && file1Obj && file1Obj.minioObjectName !== summaryFile.value;
            } else {
                // First merge:
                // Case 1: Only 1 file available in currentFiles. Allow "merging" it (processing it).
                if (currentFiles.value.length === 1) {
                    return selectedFile1.value !== null; // Just need to select the single file
                }
                // Case 2: More than 1 file available. Need 2 distinct files for actual merge.
                return (
                    selectedFile1.value !== null &&
                    selectedFile2.value !== null &&
                    selectedFile1.value !== selectedFile2.value
                );
            }
        }
    });

    // Hàm gọi API ghép nối file (chế độ thủ công)
    const performMerge = async () => {
        isMerging.value = true;
        startProgressBar("Đang chuẩn bị ghép nối thủ công...");
        addMessage("Bắt đầu ghép nối thủ công...", "info");

        abortController.value = new AbortController();
        const signal = abortController.value.signal;

        const file1Obj = currentFiles.value.find((f) => f.id === selectedFile1.value);
        let filesToMergeForRemoval = []; // Danh sách các file ID sẽ bị xóa khỏi currentFiles

        // Xác định file thành phần cần ghép nối
        if (!file1Obj) {
            addMessage("Vui lòng chọn file thành phần để ghép nối.", "error", "error");
            isMerging.value = false;
            resetProgressBar();
            return;
        }
        filesToMergeForRemoval.push(file1Obj.id); // File này luôn bị xóa

        // Xác định path_files và summary_file dựa trên trạng thái hiện tại
        let pathFilesForApi = [];
        let summaryFileForApi = null;

        // Logic cũ cho lần merge tiếp theo (có summaryFile) vẫn giữ nguyên
        if (summaryFile.value) {
            pathFilesForApi = [file1Obj.minioObjectName];
            summaryFileForApi = summaryFile.value;

            const summaryFileObjInCurrent = currentFiles.value.find(f => f.minioObjectName === summaryFile.value);
            if (summaryFileObjInCurrent) {
                filesToMergeForRemoval.push(summaryFileObjInCurrent.id);
            }
            addMessage(`Ghép nối "${file1Obj.name}" với file tổng hợp hiện có...`, "info");
        }
        // THÊM TRƯỜNG HỢP MỚI: Chỉ có 1 file duy nhất và không có summaryFile
        else if (currentFiles.value.length === 1 && selectedFile1.value === currentFiles.value[0].id) {
            pathFilesForApi = [file1Obj.minioObjectName]; // Gửi chính nó vào path_files
            summaryFileForApi = null; // Vẫn là null vì không có file tổng hợp trước đó
            addMessage(`Đang xử lý file "${file1Obj.name}"...`, "info");
            // filesToMergeForRemoval đã bao gồm file1Obj.id
        }
        // Logic cũ cho lần merge đầu tiên (nhiều hơn 1 file, không có summaryFile)
        else {
            const file2Obj = currentFiles.value.find((f) => f.id === selectedFile2.value);
            if (!file2Obj) {
                addMessage("Vui lòng chọn đủ 2 file để ghép nối lần đầu.", "error", "error");
                isMerging.value = false;
                resetProgressBar();
                return;
            }
            pathFilesForApi = [file1Obj.minioObjectName, file2Obj.minioObjectName];
            summaryFileForApi = null;

            filesToMergeForRemoval.push(file2Obj.id);
            addMessage(`Ghép nối "${file1Obj.name}" và "${file2Obj.name}"...`, "info");
        }

        try {
            const payload = {
                request_id: "evisor-" + Date.now(),
                user_id: "hoanvlh",
                start_time: new Date().toISOString(),
                path_files: pathFilesForApi,
                summary_file: summaryFileForApi
            };

            const mergedData = await mergeFilesApi(payload, signal);
            completeProgressBar("Hoàn tất!");

            if (mergedData && mergedData.status === "error") {
                addMessage(`${mergedData.message || "Lỗi không xác định từ server."}`, "error", "error");
                resetProgressBar();
                isMerging.value = false;
                return;
            }

            if (!mergedData || !mergedData.output) {
                throw new Error("Dữ liệu trả về từ API không hợp lệ.");
            }

            const newMergedFile = {
                id: `merged_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                minioObjectName: mergedData.output,
                name: mergedData.output.split('/').pop(),
                isMergedResult: true,
            };

            // Cập nhật currentFiles: Xóa các file đã sử dụng và thêm file mới
            currentFiles.value = currentFiles.value.filter(
                (f) => !filesToMergeForRemoval.includes(f.id)
            );
            currentFiles.value.push(newMergedFile);

            // Cập nhật mergeResultFile và summaryFile với file kết quả mới nhất
            mergeResultFile.value = newMergedFile;
            summaryFile.value = newMergedFile.minioObjectName;

            // Reset selectedFile1 và selectedFile2 (nếu cần cho UI)
            selectedFile1.value = null;
            // Tự động chọn file tổng hợp mới vào selectedFile2 nếu còn file để merge
            if (currentFiles.value.length > 1) {
                selectedFile2.value = newMergedFile.id;
            } else {
                selectedFile2.value = null;
            }

            addMessage(`Xử lý file thành công! File "${newMergedFile.name}" đã sẵn sàng.`, "success", "success");

            // Quyết định emit sự kiện hoàn tất hay tiếp tục
            if (currentFiles.value.length === 1 && currentFiles.value[0].id === newMergedFile.id) {
                emit("merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
                addMessage("Tất cả các file đã được xử lý hoàn tất!", "success", "success");
            } else {
                emit("partial-merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
                addMessage("Đã xử lý một phần. Vui lòng tiếp tục ghép nối các file còn lại.", "info", "info");
            }

        } catch (err) {
            resetProgressBar();
            if (err.name === 'AbortError' || (err.message && err.message.includes("bị hủy bỏ"))) {
                addMessage("Quá trình xử lý đã bị hủy", "warning", "warning");
            } else {
                addMessage(`Lỗi xử lý file: ${err.message || 'Lỗi không xác định.'}`, "error", "error");
            }
        } finally {
            isMerging.value = false;
            abortController.value = null;
        }
    };

    // performAutoMerge: Logic giữ nguyên
    const performAutoMerge = async () => {
        isMerging.value = true;
        startProgressBar("Đang bắt đầu ghép nối tự động...");
        addMessage("Bắt đầu ghép nối tự động...", "info");

        const allFileObjectsToMerge = currentFiles.value.map(file => file.minioObjectName);

        if (allFileObjectsToMerge.length < 2) {
            addMessage("Không đủ file để tự động ghép nối (cần ít nhất 2 file).", "warning", "warning");
            isMerging.value = false;
            resetProgressBar();
            return;
        }

        abortController.value = new AbortController();
        const signal = abortController.value.signal;

        try {
            const payload = {
                request_id: "evisor-auto-merge-" + Date.now(),
                user_id: "hoanvlh",
                start_time: new Date().toISOString(),
                path_files: allFileObjectsToMerge,
                summary_file: null // Trong auto-merge, summary_file thường không cần thiết hoặc là null
            };

            const mergedData = await mergeFilesApi(payload, signal);

            if (mergedData && mergedData.status === "error") {
                addMessage(`${mergedData.message || "Lỗi không xác định từ server."}`, "error", "error");
                resetProgressBar();
                isMerging.value = false;
                return;
            }

            if (!mergedData || !mergedData.output) {
                throw new Error("Dữ liệu trả về từ API ghép nối tự động không hợp lệ.");
            }

            const newMergedFile = {
                id: `merged_final_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                minioObjectName: mergedData.output,
                name: mergedData.output.split('/').pop(),
                isMergedResult: true,
            };

            mergeResultFile.value = newMergedFile;
            currentFiles.value = [newMergedFile];

            summaryFile.value = newMergedFile.minioObjectName; // Cập nhật summaryFile sau auto-merge

            selectedFile1.value = null;
            selectedFile2.value = null;

            addMessage(`Tất cả ${allFileObjectsToMerge.length} file đã được tự động ghép nối thành công!`, "success", "success");

            completeProgressBar("Hoàn tất ghép nối tự động!");
            emit("merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
            emit("all-file-merged");
        } catch (err) {
            resetProgressBar();
            if (err.name === 'AbortError' || (err.message && err.message.includes("bị hủy bỏ"))) {
                addMessage("Quá trình ghép nối tự động đã bị hủy.", "warning", "warning");
            } else {
                addMessage(`Lỗi ghép nối tự động: ${err.message || 'Lỗi không xác định.'}`, "error", "error");
            }
        } finally {
            isMerging.value = false;
            abortController.value = null;
        }
    };

    const cancelMergeProcess = () => {
        if (abortController.value) {
            abortController.value.abort();
        }
        resetProgressBar("Đã hủy ghép nối.");
        isMerging.value = false;
        addMessage("Quá trình ghép nối đã bị hủy bởi người dùng.", "warning", "warning");
    };

    const resetMergeProcess = () => {
        cancelMergeProcess();
        mergeResultFile.value = null;
        selectedFile1.value = null;
        selectedFile2.value = null;
        summaryFile.value = null; // Reset summaryFile khi đặt lại quy trình
        clearErrorMessages();
        currentFiles.value = [...initialFilesProp.value];
        addMessage("Đã đặt lại quá trình ghép nối. Vui lòng chọn file mới.", "info", "info");
        emit("reset-workflow");
    };

    return {
        currentFiles,
        selectedFile1,
        selectedFile2,
        mergeResultFile,
        filesForSelection1,
        filesForSelection2,
        availableFilesToDisplay: currentFiles, // availableFilesToDisplay có thể đơn giản là currentFiles
        canPerformMerge,
        isMerging,
        performMerge,
        performAutoMerge,
        resetMergeProcess,
        cancelMergeProcess,

        showMergeProgressBar,
        mergeProgress,
        mergeStatusText,

        isAutoMergeMode,
        errorMessages,
        clearErrorMessages,
    };
}