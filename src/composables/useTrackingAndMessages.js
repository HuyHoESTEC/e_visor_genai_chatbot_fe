import { ElMessage } from "element-plus";
import { ref } from "vue";

export function useTrackingAndMessages() {
    const errorMessages = ref([]);

    // Function add error/notification into Tracking Area and display ElMesasge
    const addMessage = (message, type = "info", elMessageType = type) => {
        errorMessages.value.push({
            message,
            type,
            timestamp: new Date().toLocaleTimeString(),
        });
        // Limit number of messages to avoid overload memory
        if (errorMessages.value.length > 50) {
            errorMessages.value.shift(); // Delete older message
        }
        // Display ElMessage if needed
        if (elMessageType && ElMessage[elMessageType]) {
            ElMessage[elMessageType](message);
        }
    };

    // Function delete all error notification
    const clearErrorMessages = () => {
        errorMessages.value = [];
    };

    return {
        errorMessages,
        addMessage,
        clearErrorMessages,
    };
}