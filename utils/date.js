/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getTodayDate() {
  return formatDate(new Date());
}

/**
 * Get date that is n days before/after a date
 */
function getDateOffset(baseDate, offsetDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
}

/**
 * Get date that is 30 days before today
 */
function getThirtyDaysAgoDate() {
  return getDateOffset(new Date(), -30);
}

/**
 * Format date for display (e.g., "2026年5月22日 周四")
 */
function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

/**
 * Check if date is today
 */
function isToday(dateStr) {
  return dateStr === getTodayDate();
}

module.exports = {
  formatDate,
  getTodayDate,
  getDateOffset,
  getThirtyDaysAgoDate,
  formatDateDisplay,
  isToday
};