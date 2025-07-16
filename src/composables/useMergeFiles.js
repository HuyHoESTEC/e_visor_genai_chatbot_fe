import { mergeFilesApi, getDownloadUrlApi } from "../services/auth.service";
import { useTrackingAndMessages } from "./useTrackingAndMessages";
import { useMergeProgressBar } from "./useMergeProgressBar";
import { computed, ref, watch } from "vue";
import { useAuthStore } from "../stores/auth";

export function useMergeFiles(initialFilesProp, sumInitFileProp, emit) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const currentFiles = ref([]);
    const selectedFile1 = ref(null); // File thành phần được chọn
    const selectedFile2 = ref(null); // File thứ hai được chọn
    const mergeResultFile = ref(null); // Đối tượng file kết quả merge cuối cùng (id, minioObjectName, etc.)
    const isMerging = ref(false);
    const abortController = ref(null);

    const isAutoMergeMode = ref(false);

    // summaryFile sẽ lưu trữ minioObjectName của file TỔNG HỢP (kết quả merge trước đó hoặc từ sumInitFileProp)
    // Nó chỉ là một tham chiếu nội bộ để xác định đâu là file tổng hợp trong payload.
    // Nó không còn ảnh hưởng trực tiếp đến việc hiển thị dropdown nữa.
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

    // Watcher for initialFiles and sumInitFileProp: Reset and populate currentFiles
    watch(
        [initialFilesProp, sumInitFileProp],
        ([newInitialFiles, newSumInitFileProp]) => {
            let updatedFiles = [];
            summaryFile.value = null; // Reset summaryFile khi có props mới

            // 1. Xử lý sumInitFileProp trước và thêm vào updatedFiles
            if (newSumInitFileProp && newSumInitFileProp.minioObjectName) {
                const syntheticSummaryFileObj = {
                    id: newSumInitFileProp.id || `summary_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    minioObjectName: newSumInitFileProp.minioObjectName,
                    name: newSumInitFileProp.name || newSumInitFileProp.minioObjectName.split('/').pop(),
                    isInitialSummary: true, // Đánh dấu đây là file tổng hợp ban đầu từ prop
                };
                updatedFiles.push(syntheticSummaryFileObj);
                summaryFile.value = syntheticSummaryFileObj.minioObjectName; // Cập nhật summaryFile nội bộ
                addMessage("Đã phát hiện file tổng hợp ban đầu.", "info", "info");
            }

            // 2. Thêm initialFilesProp vào updatedFiles, lọc bỏ những file trùng với summaryFile
            if (newInitialFiles && newInitialFiles.length > 0) {
                const filteredInitialFiles = newInitialFiles.filter(
                    // Loại bỏ file tổng hợp nếu nó cũng có trong initialFiles (tránh trùng lặp)
                    // Hoặc đảm bảo id khác nhau nếu bạn muốn coi chúng là cùng một file nhưng từ nguồn khác nhau
                    f => f.minioObjectName !== (sumInitFileProp.value ? sumInitFileProp.value.minioObjectName : null)
                );
                updatedFiles = updatedFiles.concat(filteredInitialFiles);
            }

            currentFiles.value = updatedFiles;
            mergeResultFile.value = null;
            selectedFile1.value = null;
            selectedFile2.value = null;

            // Mặc định chọn file tổng hợp từ sumInitFileProp vào selectedFile1 nếu có
            if (sumInitFileProp.value && sumInitFileProp.value.minioObjectName) {
                const summaryFileFromProp = currentFiles.value.find(f => f.minioObjectName === sumInitFileProp.value.minioObjectName);
                if (summaryFileFromProp) {
                    selectedFile1.value = summaryFileFromProp.id;
                }
            }

            addMessage("Các file đã sẵn sàng để ghép nối.", "info", "info");
            clearErrorMessages();
        },
        { immediate: true, deep: true }
    );

    // Watcher for isAutoMergeMode: Reset file selection after changing mode
    watch(isAutoMergeMode, (newMode) => {
        if (newMode) {
            selectedFile1.value = null;
            selectedFile2.value = null;
        } else {
            // Khi chuyển sang chế độ thủ công, ưu tiên summaryFile từ prop hoặc kết quả merge trước đó
            if (sumInitFileProp.value && sumInitFileProp.value.minioObjectName) {
                summaryFile.value = sumInitFileProp.value.minioObjectName;
                const summaryFileFromProp = currentFiles.value.find(f => f.minioObjectName === sumInitFileProp.value.minioObjectName);
                if (summaryFileFromProp) {
                    selectedFile1.value = summaryFileFromProp.id; // Tự động chọn lại file tổng hợp vào selectedFile1
                }
            } else if (mergeResultFile.value) {
                summaryFile.value = mergeResultFile.value.minioObjectName;
                selectedFile1.value = mergeResultFile.value.id; // Tự động chọn lại file tổng hợp vào selectedFile1
            } else {
                summaryFile.value = null;
                selectedFile1.value = null; // Reset nếu không có summaryFile mặc định
            }
            selectedFile2.value = null; // Luôn reset selectedFile2
        }
    });

    // Computed: Danh sách file để hiển thị trong dropdown cho File 1
    const filesForSelection1 = computed(() => {
        // Hiển thị tất cả các file trừ file đã chọn ở selectedFile2 (để đảm bảo chọn 2 file khác nhau)
        return currentFiles.value.filter(f => f.id !== selectedFile2.value);
    });

    // Computed: Danh sách file để hiển thị trong dropdown cho File 2
    const filesForSelection2 = computed(() => {
        // Hiển thị tất cả các file trừ file đã chọn ở selectedFile1 (để đảm bảo chọn 2 file khác nhau)
        return currentFiles.value.filter(f => f.id !== selectedFile1.value);
    });

    // Computed: Kiểm tra xem có thể thực hiện Merge hay không
    const canPerformMerge = computed(() => {
        if (isMerging.value) return false;

        if (isAutoMergeMode.value) {
            // Chế độ tự động, cần ít nhất 1 file để xử lý, hoặc nhiều hơn để merge
            return currentFiles.value.length >= 1;
        } else {
            // Chế độ thủ công, luôn cần 2 file được chọn và khác nhau
            return (
                selectedFile1.value !== null &&
                selectedFile2.value !== null &&
                selectedFile1.value !== selectedFile2.value
            );
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
        const file2Obj = currentFiles.value.find((f) => f.id === selectedFile2.value);

        if (!file1Obj || !file2Obj) {
            addMessage("Vui lòng chọn đủ 2 file để ghép nối.", "error", "error");
            isMerging.value = false;
            resetProgressBar();
            return;
        }

        let pathFilesForApi = [];
        let summaryFileForApi = null;
        let filesToMergeForRemoval = [file1Obj.id, file2Obj.id]; // Cả 2 file được chọn đều sẽ bị xóa

        // Logic mới: xác định file tổng hợp cho payload dựa trên summaryFile.value
        // Nếu một trong hai file được chọn là summaryFile.value, thì nó sẽ là summary_file
        // và file còn lại là path_files.
        // Nếu không, cả hai đều là path_files.

        if (file1Obj.minioObjectName === summaryFile.value) {
            summaryFileForApi = file1Obj.minioObjectName;
            pathFilesForApi = [file2Obj.minioObjectName];
            addMessage(`Ghép nối "${file2Obj.name}" với file tổng hợp "${file1Obj.name}"...`, "info");
        } else if (file2Obj.minioObjectName === summaryFile.value) {
            summaryFileForApi = file2Obj.minioObjectName;
            pathFilesForApi = [file1Obj.minioObjectName];
            addMessage(`Ghép nối "${file1Obj.name}" với file tổng hợp "${file2Obj.name}"...`, "info");
        } else {
            // Nếu không có file nào khớp với summaryFile.value, đây là lần merge đầu tiên hoặc tạo summary mới
            pathFilesForApi = [file1Obj.minioObjectName, file2Obj.minioObjectName];
            summaryFileForApi = null; // Backend sẽ tạo summary mới
            addMessage(`Ghép nối "${file1Obj.name}" và "${file2Obj.name}" để tạo file tổng hợp mới...`, "info");
        }
        
        try {
            const payload = {
                request_id: "evisor-" + Date.now(),
                user_id: loggedInUserId,
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

            // ***** QUAN TRỌNG: SỬA LỖI Ở ĐÂY *****
            // Sau khi merge thành công, tự động chọn file tổng hợp mới vào selectedFile1
            // và reset selectedFile2 để người dùng chọn file tiếp theo.
            selectedFile1.value = newMergedFile.id;
            selectedFile2.value = null; // Reset selectedFile2 để người dùng chọn file mới

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

    // performAutoMerge
    const performAutoMerge = async () => {
        isMerging.value = true;
        startProgressBar("Đang bắt đầu ghép nối tự động...");
        addMessage("Bắt đầu ghép nối tự động...", "info");

        abortController.value = new AbortController();
        const signal = abortController.value.signal;

        let pathFilesForApi = [];
        let summaryFileForApi = summaryFile.value; // summaryFile.value giờ sẽ chứa giá trị từ sumInitFileProp hoặc mergeResultFile
        let mergeMessage = "";
        let filesToMergeForRemoval = []; // Danh sách các file ID sẽ bị xóa khỏi currentFiles

        // Nếu có summaryFile (từ prop hoặc kết quả merge trước đó)
        if (summaryFileForApi) {
            // Lấy tất cả các file trong currentFiles (trừ chính summaryFile) vào pathFilesForApi
            pathFilesForApi = currentFiles.value
                .filter(f => f.minioObjectName !== summaryFileForApi)
                .map(file => file.minioObjectName);

            filesToMergeForRemoval = currentFiles.value
                .filter(f => f.minioObjectName !== summaryFileForApi)
                .map(file => file.id);

            // Đánh dấu file summary hiện có để xóa khỏi danh sách (vì nó sẽ được thay thế bằng file tổng hợp mới)
            const summaryFileObjInCurrent = currentFiles.value.find(f => f.minioObjectName === summaryFileForApi);
            if (summaryFileObjInCurrent && !filesToMergeForRemoval.includes(summaryFileObjInCurrent.id)) {
                filesToMergeForRemoval.push(summaryFileObjInCurrent.id);
            }
            
            // Nếu không có file nào khác để merge với summary, báo lỗi
            if (pathFilesForApi.length === 0) {
                 addMessage("Không có file nào khác để tự động ghép nối với file tổng hợp.", "warning", "warning");
                 isMerging.value = false;
                 resetProgressBar();
                 return;
            }
            mergeMessage = `Ghép nối tự động: File tổng hợp hiện có sẽ được sử dụng.`;

        } else {
            // Trường hợp không có summaryFile, tất cả các file trong currentFiles sẽ được merge
            if (currentFiles.value.length < 1) { 
                 addMessage("Không đủ file để tự động ghép nối (cần ít nhất 1 file).", "warning", "warning");
                 isMerging.value = false;
                 resetProgressBar();
                 return;
            }

            // Nếu chỉ có 1 file, nó sẽ trở thành summary_file
            if (currentFiles.value.length === 1) {
                pathFilesForApi = [];
                summaryFileForApi = currentFiles.value[0].minioObjectName;
                filesToMergeForRemoval.push(currentFiles.value[0].id);
                mergeMessage = `Đang xử lý file duy nhất "${currentFiles.value[0].name}"...`;
            } else {
                // Nhiều hơn 1 file, tất cả đều là path_files, summary_file là null (API sẽ tạo ra summary mới)
                pathFilesForApi = currentFiles.value.map(file => file.minioObjectName);
                summaryFileForApi = null;
                filesToMergeForRemoval = currentFiles.value.map(file => file.id);
                mergeMessage = `Ghép nối tự động: ${currentFiles.value.length} file sẽ được ghép nối.`;
            }
        }
        addMessage(mergeMessage, "info");

        try {
            const payload = {
                request_id: "evisor-auto-merge-" + Date.now(),
                user_id: loggedInUserId,
                start_time: new Date().toISOString(),
                path_files: pathFilesForApi,
                summary_file: summaryFileForApi
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
            // Sau auto-merge, currentFiles chỉ chứa file kết quả mới
            currentFiles.value = [newMergedFile]; 

            summaryFile.value = newMergedFile.minioObjectName; // Cập nhật summaryFile sau auto-merge

            selectedFile1.value = null;
            selectedFile2.value = null;

            addMessage(`Tất cả file đã được tự động ghép nối thành công!`, "success", "success");

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

        // Tái tạo lại currentFiles từ initial props
        let resetFiles = [];
        if (sumInitFileProp.value && sumInitFileProp.value.minioObjectName) {
            const syntheticSummaryFileObj = {
                id: sumInitFileProp.value.id || `summary_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                minioObjectName: sumInitFileProp.value.minioObjectName,
                name: sumInitFileProp.value.name || sumInitFileProp.value.minioObjectName.split('/').pop(),
                isInitialSummary: true,
            };
            resetFiles.push(syntheticSummaryFileObj);
            summaryFile.value = syntheticSummaryFileObj.minioObjectName;
            selectedFile1.value = syntheticSummaryFileObj.id; // Mặc định chọn lại nếu có
        } else {
            selectedFile1.value = null;
        }

        if (initialFilesProp.value && initialFilesProp.value.length > 0) {
            const filteredInitialFiles = initialFilesProp.value.filter(
                f => f.minioObjectName !== (sumInitFileProp.value ? sumInitFileProp.value.minioObjectName : null)
            );
            resetFiles = resetFiles.concat(filteredInitialFiles);
        }
        currentFiles.value = resetFiles;
        
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
        availableFilesToDisplay: currentFiles,
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