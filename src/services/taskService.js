export const dummyUsers = [
  { id: 1, name: 'Võ Lý Hoàng Hoan' },
  { id: 2, name: 'Hoàng Tấn Nguyên' },
  { id: 3, name: 'Đoàn Ngọc Minh Thắng' },
  { id: 4, name: 'Hồ Nhật Huy' },
];

// Dữ liệu giả định trạng thái công việc
export const taskStatuses = [
  { value: 'pending', labelKey: 'statusPending' },
  { value: 'in_progress', labelKey: 'statusInProgress' },
  { value: 'completed', labelKey: 'statusCompleted' },
  { value: 'blocked', labelKey: 'statusBlocked' },
];

/**
 * Tạo dữ liệu tasks giả định
 * @returns {Array} Mảng các đối tượng task
 */
export const generateDummyTasks = () => {
  const tasks = [];
  for (let i = 1; i <= 30; i++) {
    const assignee = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
    const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)].value;
    const dueDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    tasks.push({
      id: i,
      title: `Task ${i}: ${['Develop Feature', 'Fix Bug', 'Write Documentation', 'Review Code'][Math.floor(Math.random() * 4)]}`,
      description: `Detailed description for task ${i}. This task involves various sub-components and careful planning.`,
      assignee: assignee,
      dueDate: dueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      status: status,
    });
  }
  return tasks;
};

/**
 * Trả về kiểu tag của Element Plus dựa trên trạng thái task.
 * @param {string} status - Trạng thái của task.
 * @returns {string|undefined} Kiểu của ElTag (success, info, danger) hoặc undefined cho kiểu mặc định.
 */
export const getStatusTagType = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return undefined; // Mặc định Element Plus sẽ không có type đặc biệt
    case 'pending': return 'info';
    case 'blocked': return 'danger';
    default: return 'info';
  }
};

/**
 * Trả về key dịch cho trạng thái task.
 * @param {string} status - Trạng thái của task.
 * @returns {string} key dịch.
 */
export const getTranslatedStatusKey = (status) => {
    const foundStatus = taskStatuses.find(s => s.value === status);
    return foundStatus ? foundStatus.labelKey : status;
};

/**
 * Formats a date string into a localized date string.
 * @param {string} dateString - The date string to format.
 * @param {string} locale - The locale to use for formatting (e.g., 'vi-VN', 'en-US').
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString, locale = 'en-US') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};