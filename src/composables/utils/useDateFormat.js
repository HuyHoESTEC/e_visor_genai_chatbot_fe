export function useDateFormat() {
    /**
     * @param {string | null} dateTimeString
     * @return {string}
     */
    const formatDateTimeToDate = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        return dateTimeString.split('T')[0];
    };

    return {
        formatDateTimeToDate
    }
}