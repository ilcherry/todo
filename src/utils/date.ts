/** 全部使用本地时区的「日期键」，避免 UTC 偏移导致跨天 */

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** 本周日（周日为一周最后一天） */
export function endOfWeekKey(): string {
  const d = new Date();
  const offset = 7 - (d.getDay() === 0 ? 7 : d.getDay());
  d.setDate(d.getDate() + offset);
  return toKey(d);
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function weekdayOf(key: string): string {
  return WEEKDAYS[fromKey(key).getDay()];
}

function diffDays(target: string): number {
  const a = fromKey(target).getTime();
  const b = fromKey(todayKey()).getTime();
  return Math.round((a - b) / 86400000);
}

/** 今天 / 明天 / 昨天 / 周三 / 6月12日 */
export function dueLabel(key: string): string {
  const diff = diffDays(key);
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === 2) return '后天';
  if (diff === -1) return '昨天';
  if (diff > 2 && diff < 7) return weekdayOf(key);
  const d = fromKey(key);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isOverdue(key: string | null, completed: boolean): boolean {
  if (!key || completed) return false;
  return diffDays(key) < 0;
}

export function relativeDayLabel(key: string): string {
  const diff = diffDays(key);
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === -1) return '昨天';
  return dueLabel(key);
}

export function greeting(date = new Date()): { text: string; emoji: string } {
  const h = date.getHours();
  if (h < 6) return { text: '夜深了', emoji: '🌙' };
  if (h < 11) return { text: '早上好', emoji: '🌤' };
  if (h < 14) return { text: '中午好', emoji: '🍃' };
  if (h < 18) return { text: '下午好', emoji: '🌿' };
  if (h < 22) return { text: '晚上好', emoji: '🌛' };
  return { text: '夜深了', emoji: '🌙' };
}

export function fullDateLabel(date = new Date()): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`;
}
