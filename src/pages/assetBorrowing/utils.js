export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayText() {
  return formatDate(new Date());
}

export function addDate(startDate, { days = 0, months = 0 }) {
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  if (months) date.setMonth(date.getMonth() + months);
  if (days) date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function maxBorrowEndDate(startDate) {
  return addDate(startDate, { months: 3 });
}

export function isBorrowPeriodValid(startDate, endDate) {
  if (!startDate || !endDate) return false;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const max = new Date(`${maxBorrowEndDate(startDate)}T00:00:00`);
  return end >= start && end <= max;
}

export function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

export function buildBorrowingId() {
  const now = new Date();
  return `JY-${formatDate(now).replaceAll('-', '')}${String(now.getTime()).slice(-6)}`;
}
