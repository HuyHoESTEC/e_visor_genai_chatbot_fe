import { ref, onMounted, onUnmounted, watch } from "vue";

export function useWebSocket(urlRef) {
    const socket = ref(null);
    const isConnected = ref(false);
    const messages = ref([]);
    const error = ref(null);

    // Map để lưu trữ các Promise đang chờ phản hồi
    const pendingRequests = new Map();
    let requestIdCounter = 0; // Bộ đếm cho requestId

    // Biến reactive cục bộ để giữ URL hiện tại
    // const currentUrl = ref(typeof urlRef === 'string' ? urlRef : urlRef.value);
    const currentUrl = ref('');
    let isInitialConnection = true; // Cờ để theo dõi lần kết nối đầu tiên
    // Watcher để theo dõi sự thay đổi của urlRef (nếu nó là một  ref/computed)
    // if (typeof urlRef !== 'string') {
    //     watch(urlRef, (newUrl, oldUrl) => {
    //         // Chỉ kết nối lại nếu URL thực sự thay đổi
    //         if (newUrl && (currentUrl.value !== newUrl || isInitialConnection)) {
    //             console.log('useWebSocket: URL ref changed from', currentUrl.value,'to', newUrl);
    //             currentUrl.value = newUrl;
    //             reconnect(); // Gọi hàm reconnect khi URL thay đổi
    //             isInitialConnection = false;
    //         } else if (!newUrl) {
    //             console.warn('[useWebSocket] URL is empty, skipping connection.');
    //             if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
    //                 disconnect();
    //             }
    //         }
    //     }, { immediate: true });
    // }
    const connect = () => {
        if (!currentUrl.value) {
            console.error('useWebSocket: No URL provided for connection');
            error.value = new Error('No WebSocket URL Provided.');
            return;
        }
        // Tránh kết nối lại nếu đã kết nối hoặc đang trong quá trình kết nối
        if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket already connected or connecting, skipping new connection.');
            return;
        }
        console.log('useWebSocket: Attemping to connect to:', currentUrl.value);
        socket.value = new WebSocket(currentUrl.value);

        socket.value.onopen = () => {
            isConnected.value = true;
            console.log('WebSocket connected!');
            error.value = null; // Clear any previous errors
            console.log('useWebSocket: WebSocket Connected!');
        };

        socket.value.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('(message.requestId:', message);
                
                // Xử lý phản hồi cho các request đang chờ
                if (message.requestId && pendingRequests.has(message.requestId)) {
                    const { resolve, reject, onStream } = pendingRequests.get(message.requestId);
                    const responseError = message.error;
                    const responseText = message.response;
                    const responseAction = message.action;
                    const responseStatus = message.statusCode;
                    const responseImage = message.url;
                    
                    if (responseAction === 'chatMessageStream' && onStream) {
                        onStream(responseText);
                    } else if (responseAction === 'sendMessage') {
                        pendingRequests.delete(message.requestId); // Xóa request khỏi danh sách

                        if (responseStatus === 200) {
                            const finalRes = {
                                response: responseText,
                                action: responseAction,
                                imageUrl: responseImage,
                            }
                            resolve(finalRes);
                        } else {
                            reject(responseError || new Error('Unknown WebSocket error'));
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };

        socket.value.onclose = (event) => {
            isConnected.value = false;
            console.log('WebSocket disconnected', event);
            // Xóa tất cả các request đang chờ khi kết nối đóng
            pendingRequests.forEach(({ reject }) => reject(new Error('WebSocket disconnected')));
            pendingRequests.clear();
            if (!event.wasClean) {
                error.value = new Error('WebSocket connection closed unexpectedly.');
            }
        };

        socket.value.onerror = (err) => {
            error.value = err;
            console.error('WebSocket error:', err);
            // Từ chối tất cả các request đang chờ nếu có lỗi
            pendingRequests.forEach(({ reject }) => {
                reject(new Error('WebSocket error occurred'));
            });
            pendingRequests.clear();
            socket.value.close() //  Đảm bảo socket được đóng khi có lỗi
        };
    };

    const disconnect = () => {
        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
            console.log('useWebSocket: Closing WebSocket connection...');
            socket.value.close(1000, 'User initial disconnect or URL changed'); // 1000 là mã đóng bình thường
        }
        socket.value = null; // Xóa instance socket
        isConnected.value = false;
        error.value = null // Xóa lỗi khi ngắt kết nối
    };

    const reconnect = () => {
        disconnect(); // Đóng kết nối cũ
        // Đợi một chút trước khi kết nối lại để tránh lỗi liên tiếp
        setTimeout(() => {
            connect(); // Mở kết nối mới
        }, 1000); // 10ms delay
    };

    watch(urlRef, (newUrl, oldUrl) => {
        // Chỉ kết nối lại nếu URL thực sự thay đổi
        if (newUrl && (currentUrl.value !== newUrl || isInitialConnection)) {
            console.log('useWebSocket: URL ref changed from', currentUrl.value,'to', newUrl);
            currentUrl.value = newUrl;
            reconnect(); // Gọi hàm reconnect khi URL thay đổi
            isInitialConnection = false;
        } else if (!newUrl) {
            console.warn('[useWebSocket] URL is empty, skipping connection.');
            if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
                disconnect();
            }
        }
    }, { immediate: true });

    /**
     * Gửi yêu cầu qua WebSocket và trả về một Promise để chờ phản hồi
    //  * @param {string} type - Loại hành động yêu cầu
     * @param {Object} requestData - Dữ liệu payload cho yêu cầu
     * @param {Function} [onStream] - Callback để xử lý từng chunk dữ liệu trong streaming
     * @returns {Promise<any} Promise sẽ resolve với dữ liệu phản hồi hơặc reject nếu có lỗi
     */
    const sendRequest = (requestData, onStream = null) => {
        return new Promise((resolve, reject) => {
            if (!isConnected.value || !socket.value || socket.value.readyState !== WebSocket.OPEN) {
                error.value = new Error('WebSocket is not connected or ready. Please try again!');
                console.error('useWebSocket: sendRequest failed -', error.value.message);
                return reject(error.value);
            }

            const currentRequestId = `req-${Date.now()}-${requestIdCounter++}`;
            pendingRequests.set(currentRequestId, { resolve, reject, onStream }); // Lưu Promise đang chờ
            
            const payload = {
                requestId: currentRequestId, // Vẫn cần requestId để khớp phản hồi
                action: requestData.action,
                inputText: requestData.inputText,
                sessionId: requestData.sessionId
            };
            socket.value.send(JSON.stringify(payload));
        });
    };

    // Tự động kết nối khi component được mounted và ngắt kết nối khi unmounted
    onMounted(() => {
        if (typeof urlRef === 'string') {
            connect();
        }
    });
    onUnmounted(() => {
        disconnect();
    });

    return {
        socket,
        isConnected,
        messages,
        error,
        connect,
        disconnect,
        sendRequest,
        reconnect,
        currentUrl: currentUrl // Trả về currentUrl để tiện debug hoặc hiển thị
    };
}