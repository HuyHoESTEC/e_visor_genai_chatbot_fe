export function useDateFormat() {
    /**
     * @param {string | null} dateTimeString
     * @return {string}
     */
    const formatDateTimeToDate = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            // Kiểm tra tính hợp lệ của ngày
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            // Hàm đệm số (thêm '0' phía trước nếu số < 10)
            const pad = (num) => (num < 10 ? '0' + num : num);
            // Lấy các thành phần Ngày (YYYY-MM-DD)
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());

            // Lấy các thành phần Giờ (hh:mm:ss)
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            // Trả về định dạng mới
            return `${year}-${month}-${day} / ${hours}:${minutes}:${seconds}`;
        } catch (e) {
            console.error("Lỗi khi định dạng ngày:", e);
            return 'Error Formatting';
        }
    };

    const extractDateOnly = (dateTimeString) => {
        if (!dateTimeString) return null;
        return dateTimeString.split('T')[0];
    };

    return {
        formatDateTimeToDate,
        extractDateOnly
    }
}