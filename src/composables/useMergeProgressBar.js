import { ref } from "vue";

export function useMergeProgressBar() {
    const showMergeProgressBar = ref(false);
    const mergeProgress = ref(0);
    const mergeStatusText = ref("");
    let mergeInterval = null; // To keep reference to setinterval

    const startProgressBar = (initialText = "Đang chuẩn bị...") => {
        showMergeProgressBar.value = true;
        mergeProgress.value = 0;
        mergeStatusText.value = initialText;

        clearInterval(mergeInterval); // Make sure do not old interval running
        mergeInterval = setInterval(() => {
            let progress = mergeProgress.value;
            progress += Math.floor(Math.random() * 5) + 3; // Random increase
            if (progress >= 95) {
                progress = 95;
                clearInterval(mergeInterval);
            }
            mergeProgress.value = progress;

            // Update text based on progress
            if (progress < 30) {
                mergeStatusText.value = "Đang gửi yêu cầu đến Server...";
            } else if (progress < 70) {
                mergeStatusText.value = "Server đang xử lý ghép nối...";
            } else {
                mergeStatusText.value = "Gần hoàn tất...";
            }
        }, 300);
    };

    const completeProgressBar = (finalText = "Hoàn tất!") => {
        clearInterval(mergeInterval);
        mergeProgress.value = 100;
        mergeStatusText.value = finalText;
        setTimeout(() => {
           showMergeProgressBar.value = false; 
        }, 1000); // Keep progress bar 1 second after success
    };

    const resetProgressBar = (resetText = "") => {
        clearInterval(mergeInterval);
        showMergeProgressBar.value = false;
        mergeProgress.value = 0;
        mergeStatusText.value = resetText;
    };

    return {
        showMergeProgressBar,
        mergeProgress,
        mergeStatusText,
        startProgressBar,
        completeProgressBar,
        resetProgressBar
    }
}