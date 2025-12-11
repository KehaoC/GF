/**
 * 日期格式化工具函数
 * 用于将后端返回的 ISO 日期字符串转换为前端显示格式
 */

/**
 * 检查两个日期是否为同一天
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * 格式化日期时间字符串
 * @param isoString - ISO 8601 格式的日期字符串
 * @returns 格式化后的日期字符串
 *
 * @example
 * formatDateTime('2025-12-11T10:30:00') // "Today"（如果是今天）
 * formatDateTime('2025-12-10T10:30:00') // "Yesterday"（如果是昨天）
 * formatDateTime('2025-09-18T10:30:00') // "Sep 18 2025"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // 今天显示 "Today"
  if (isSameDay(date, now)) {
    return 'Today';
  }

  // 昨天显示 "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  // 其他日期显示格式: "Sep 18 2025"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
