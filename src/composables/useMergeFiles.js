import { mergeFilesApi, getDownloadUrlApi } from "../services/apiServices";
import { useTrackingAndMessages } from "./useTrackingAndMessages";
import { useMergeProgressBar } from "./useMergeProgressBar";
import { computed, ref, watch } from "vue";

export function useMergeFiles(initialFilesProp, emit) {
    const currentFiles = ref([]);
    const selectedFile1 = ref(null);
    const selectedFile2 = ref(null);
    const mergeResultFile = ref(null);
    const isMerging = ref(false);
    const abortController = ref(null); // Use ref for AbortController

    const isAutoMergeMode = ref(false); // Status for Auto/Manual Mode

    // Use for another composable
    const { errorMessages, addMessage, clearErrorMessages } = useTrackingAndMessages();
    const { 
        showMergeProgressBar, 
        mergeProgress, 
        mergeStatusText, 
        startProgressBar, 
        completeProgressBar, 
        resetProgressBar 
    } = useMergeProgressBar();

    // Watcher for initialFiles: Reset when have been new files from parent component
    watch(
        initialFilesProp,
        (newVal) => {
            if (newVal && newVal.length > 0) {
                currentFiles.value = [...newVal];
                mergeResultFile.value = null;
                selectedFile1.value = null;
                selectedFile2.value = null;
                addMessage("File mới đã sẵn sàng ghép nối,", "info", "info"); // ElMessage type 'info'
                clearErrorMessages(); // Delete old error when have been new file
            } else {
                currentFiles.value = [];
                mergeResultFile.value = null;
                selectedFile1.value = null;
                selectedFile2.value = null;
                clearErrorMessages(); // Delete old error
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
            // When move to manual, if have been sum file, auto choose this file to selectedFile2
            if (mergeResultFile.value) {
                selectedFile2.value = mergeResultFile.value.id;
            }
        }
    });

    // Computed: file list to display in summary and for dropdowns
    const availableFilesToDisplay = computed(() => {
        // Only display files do not result file of merge
        return currentFiles.value.filter((file) => !file.isMergedResult);
    });

    // Computed: File list can be selected for Dropdown File 1 (Manual mode)
    const filesForSelection1 = computed(() => {
        if (mergeResultFile.value) {
            // If the total file is, the user only selects the unexpected Merge file to pair it with the total file
            return currentFiles.value.filter((f) => f.id !== mergeResultFile.value.id);
        }
        // The first Merge, displaying all files is not the Merge result
        return availableFilesToDisplay.value;
    });

    // Computed: File list can be selected for Dropdown File 2 (Manual mode)
    const filesForSelection2 = computed(() => {
        if (mergeResultFile.value) {
            // If you already have a sum file, the total file is always the second file
            return [mergeResultFile.value];
        }
        // The first Merge, displaying all files is not the Merge result
        return availableFilesToDisplay.value;
    });

    // Computed: Check if it is possible to perform Merge (for both Auto and Manual)
    const canPerformMerge = computed(() => {
        if (isMerging.value) return false;

        if (isAutoMergeMode.value) {
            // Auto mode: need at least of 2 files to merge
            return currentFiles.value.length >= 2;
        } else {
            // Manual mode
            if (mergeResultFile.value) {
                // There is a total file: Need to select file 1 (new file) and file 2 must be the total file
                return (
                    selectedFile1.value !== null && selectedFile2.value === mergeResultFile.value.id
                );
            }
            // The first Merge: Need to choose 2 different and not empty files
            return (
                selectedFile1.value !== null &&
                selectedFile2.value !== null &&
                selectedFile1.value !== selectedFile2.value
            );
        }
    });

    // Function call API merge file(for Manual mode)
    const performMerge = async () => {
        isMerging.value = true;
        startProgressBar("Đang chuẩn bị ghép nối thủ công...");
        addMessage("Bắt đầu ghép nối thủ công...", "info");

        abortController.value = new AbortController();
        const signal = abortController.value.signal;

        const file1Obj = currentFiles.value.find((f) => f.id === selectedFile1.value);
        const file2Obj = currentFiles.value.find((f) => f.id === selectedFile2.value);

        if (!file1Obj || !file2Obj) {
            addMessage("Vui lòng chọn đủ 2 file để ghép nối,", "error", "error");
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

            const mergedData = await mergeFilesApi(payload, signal); // Call service API
            completeProgressBar("Hoàn tất!");

            if (!mergedData || !mergedData.output) {
                throw new Error("Dữ liệu trả về từ API không hợp lệ.");
            }

            const newMergedFile = {
                id: `merged_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                minioObjectName: mergedData.output,
                isMergedResult: true,
            };
            mergeResultFile.value = newMergedFile;

            // Update currentFiles: Remove files has been used and import new file
            const filesAfterRemoval = currentFiles.value.filter(
                (f) => f.id !== file1Obj.id && f.id !== file2Obj.id
            );
            currentFiles.value = [...filesAfterRemoval, newMergedFile];
            selectedFile1.value = null;
            selectedFile2.value = mergeResultFile.value.id;
            addMessage(`Ghép nối thành công! File "${newMergedFile.name}" đã sẵn sàng.`, "success", "success");

            let downloadUrl = null;
            try {
                // Prepare payload for API get URL download
                const downloadUrlPayload = {
                    request_id: "evisor-1234567890",
                    user_id: "hoanvlh",
                    path_file: newMergedFile.minioObjectName
                };
                downloadUrl = await getDownloadUrlApi(downloadUrlPayload, signal);
                addMessage("Đã lấy được URL tải xuống API POST.", "info");
            } catch (downloadErr) {
                addMessage(`Không thể lấy URL tải xuống từ API POST: ${downloadErr.message}.`, "warning", "warning");
            }
            completeProgressBar("Hoàn tất!");
            emit("merge-completed", { ...newMergedFile, downloadUrl, overwork: mergedData.overwork || [] });
        } catch (err) {
            resetProgressBar();
            if (err.message.includes("bị hủy bỏ")) {
                addMessage("Quá trình ghép nối đã bị hủy", "warning", "warning");
            } else {
                addMessage(`Lỗi ghép nối thủ công: ${err.message}`, "error", "error");
            }
        } finally {
            isMerging.value = false;
            abortController.value = null;
        }
    };

    // Function call API merge file (for Auto mode)
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
            currentFiles.value = [newMergedFile];

            selectedFile1.value = null;
            selectedFile2.value = null;

            addMessage(`Tất cả ${allFileObjectsToMerge.length} file đã được tự động ghép nối thành công!`, "success", "success");

            let downloadUrl = null;
            try {
                downloadUrl = await getDownloadUrlApi(newMergedFile.minioObjectName, signal);
                addMessage("Đã lấy được URL tải xuống từ API.", "info");
            } catch (downloadErr) {
                addMessage(`Không thể lấy URL tải xuống từ API: ${downloadErr.message}.`, "warning", "warning");
            }
            completeProgressBar("Hoàn tất ghép nối tự động!");
            // Emit new file and downloadUrl to parent component
            emit("merge-completed", { ...newMergedFile, downloadUrl, overwork: mergedData.overwork || [] });
            emit("all-file-merged");
        } catch (err) {
            resetProgressBar();
            if (err.message.includes("bị hủy bỏ")) {
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
        addMessage("Quá trinh ghép nối đã bị hủy bới người dùng.", "warning", "warning");
    };

    const resetMergeProcess = () => {
        cancelMergeProcess();
        mergeResultFile.value = null;
        selectedFile1.value = null;
        selectedFile2.value = null;
        clearErrorMessages();
        currentFiles.value = [...initialFilesProp.value]; // reset to initialFiles default
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