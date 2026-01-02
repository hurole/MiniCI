import dayjs from 'dayjs';

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss
 * @param date 时间字符串或 Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化时间为 YYYY-MM-DD
 * @param date 时间字符串或 Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * 格式化时间为 HH:mm:ss
 * @param date 时间字符串或 Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).format('HH:mm:ss');
}
