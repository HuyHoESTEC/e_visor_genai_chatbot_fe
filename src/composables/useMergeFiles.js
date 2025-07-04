import { mergeFilesApi, getDownloadUrlApi } from "../services/apiServices";
import { useTrackingAndMessages } from "./useTrackingAndMessages";
import { useMergeProgressBar } from "./useMergeProgressBar";
import { computed, ref, watch } from "vue";

export function useMergeFiles(initialFilesProp, emit) {
    const currentFiles = ref([]);
    const selectedFile1 = ref(null);
    const selectedFile2 = ref(null);
    const mergeResultFile = ref(null); // File tổng hợp cuối cùng từ các lần merge
    const isMerging = ref(false);
    const abortController = ref(null);

    const isAutoMergeMode = ref(false);

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
                mergeResultFile.value = null; // Reset result file on new initial files
                selectedFile1.value = null;
                selectedFile2.value = null;
                addMessage("File mới đã sẵn sàng ghép nối.", "info", "info");
                clearErrorMessages();
            } else {
                currentFiles.value = [];
                mergeResultFile.value = null;
                selectedFile1.value = null;
                selectedFile2.value = null;
                clearErrorMessages();
            }
        },
        { immediate: true, deep: true }
    );

    // Watcher for isAutoMergeMode: Reset file select after change mode
    watch(isAutoMergeMode, (newMode) => {
        if (newMode) {
            selectedFile1.value = null;
            selectedFile2.value = null;
        } else {
            // When moving to manual, if there's a sum file, auto choose this file to selectedFile2
            // This is an initial suggestion, but the user can change it.
            if (mergeResultFile.value) {
                selectedFile2.value = mergeResultFile.value.id;
            }
        }
    });

    // Computed: file list to display in summary and for dropdowns
    const availableFilesToDisplay = computed(() => {
        // Display all files that are not the current mergeResultFile
        // This ensures the current result file is treated as a special "target" for the next merge
        // and doesn't appear in the general selection if it's the target.
        // However, if mergeResultFile is the only file left, it should still be in currentFiles.
        return currentFiles.value;
    });

    // Computed: File list can be selected for Dropdown File 1 (Manual mode)
    const filesForSelection1 = computed(() => {
        // File 1 có thể là bất kỳ file nào trong currentFiles
        // ngoại trừ file đang được chọn cho selectedFile2 (nếu có)
        // và không phải là mergeResultFile (nếu mergeResultFile đã được chọn làm file thứ 2)
        return currentFiles.value.filter(f =>
            f.id !== selectedFile2.value // Không thể chọn cùng một file cho cả 2 dropdown
        );
    });

    // Computed: File list can be selected for Dropdown File 2 (Manual mode)
    const filesForSelection2 = computed(() => {
        // File 2 có thể là bất kỳ file nào trong currentFiles
        // ngoại trừ file đang được chọn cho selectedFile1 (nếu có)
        return currentFiles.value.filter(f =>
            f.id !== selectedFile1.value // Không thể chọn cùng một file cho cả 2 dropdown
        );
    });


    // Computed: Check if it is possible to perform Merge (for both Auto and Manual)
    const canPerformMerge = computed(() => {
        if (isMerging.value) return false;

        if (isAutoMergeMode.value) {
            return currentFiles.value.length >= 2;
        } else {
            // Manual mode:
            // Need to select 2 different files
            return (
                selectedFile1.value !== null &&
                selectedFile2.value !== null &&
                selectedFile1.value !== selectedFile2.value
            );
        }
    });

    // Function call API merge file (for Manual mode)
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

        try {
            const payload = {
                request_id: "evisor-" + Date.now(),
                user_id: "hoanvlh",
                start_time: new Date().toISOString(),
                path_files: [
                    file1Obj.minioObjectName,
                    file2Obj.minioObjectName
                ]
            };

            const mergedData = await mergeFilesApi(payload, signal);
            completeProgressBar("Hoàn tất!");

            if (mergedData && mergedData.status === "error") {
                // Nếu API trả về status "error", hiển thị message từ API
                addMessage(`${mergedData.message || "Lỗi không xác định từ server."}`, "error", "error");
                resetProgressBar(); // Reset progress bar on API error
                isMerging.value = false; // Stop merging state
                return; // Dừng hàm tại đây vì đã có lỗi
            }

            if (!mergedData || !mergedData.output) {
                throw new Error("Dữ liệu trả về từ API không hợp lệ.");
            }

            const newMergedFile = {
                id: `merged_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                minioObjectName: mergedData.output,
                name: mergedData.output.split('/').pop(), // Lấy tên file từ minioObjectName
                isMergedResult: true, // Đánh dấu đây là file kết quả merge
            };

            // Remove used files and add the new merged file to currentFiles
            const filesAfterRemoval = currentFiles.value.filter(
                (f) => f.id !== file1Obj.id && f.id !== file2Obj.id
            );
            currentFiles.value = [...filesAfterRemoval, newMergedFile];

            // Update mergeResultFile to the latest merged file
            mergeResultFile.value = newMergedFile;

            // --- Reset selections for next merge (flexible approach) ---
            selectedFile1.value = null; // Clear first selection
            // If there are still files to merge, automatically select the new merged file for the next round
            // Otherwise, clear second selection too
            if (currentFiles.value.length > 1) { // If more than one file left (current merged + others)
                 selectedFile2.value = newMergedFile.id; // Auto-select the newly merged file for file2
            } else {
                selectedFile2.value = null; // If only the merged file remains, clear both.
            }


            addMessage(`Ghép nối thành công! File "${newMergedFile.name}" đã sẵn sàng.`, "success", "success");

            // Emit the final merged file if only one file remains in currentFiles
            // or if it's the last step for the user.
            if (currentFiles.value.length === 1 && currentFiles.value[0].id === newMergedFile.id) {
                 emit("merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
            } else {
                // If there are still files to merge, emit a signal that merge was successful
                // and the process can continue.
                emit("partial-merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
            }

        } catch (err) {
            resetProgressBar();
            if (err.name === 'AbortError' || (err.message && err.message.includes("bị hủy bỏ"))) { // Check for AbortError
                addMessage("Quá trình ghép nối đã bị hủy", "warning", "warning");
            } else {
                addMessage(`Lỗi ghép nối thủ công: ${err.message}`, "error", "error");
            }
        } finally {
            isMerging.value = false;
            abortController.value = null;
        }
    };

    // Function call API merge file (for Auto mode) - No changes here for this issue.
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
                path_files: allFileObjectsToMerge
            };

            const mergedData = await mergeFilesApi(payload, signal);

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
            currentFiles.value = [newMergedFile]; // Only the final merged file remains

            selectedFile1.value = null;
            selectedFile2.value = null;

            addMessage(`Tất cả ${allFileObjectsToMerge.length} file đã được tự động ghép nối thành công!`, "success", "success");

            completeProgressBar("Hoàn tất ghép nối tự động!");
            emit("merge-completed", { ...newMergedFile, overwork: mergedData.overwork || [] });
            emit("all-file-merged"); // Indicate all initial files are merged
        } catch (err) {
            resetProgressBar();
            if (err.name === 'AbortError' || (err.message && err.message.includes("bị hủy bỏ"))) {
                addMessage("Quá trình ghép nối tự động đã bị hủy.", "warning", "warning");
            } else {
                addMessage(`Lỗi ghép nối tự động: ${err.message}`, "error", "error");
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
        clearErrorMessages();
        currentFiles.value = [...initialFilesProp.value]; // reset to initialFiles default
        addMessage("Đã đặt lại quá trình ghép nối. Vui lòng chọn file mới.", "info", "info");
        emit("reset-workflow"); // Emit to parent to reset overall workflow if needed
    };

    return {
        currentFiles,
        selectedFile1,
        selectedFile2,
        mergeResultFile,
        filesForSelection1,
        filesForSelection2,
        availableFilesToDisplay,
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