export function formatDepartment(value) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value).replace(/\s*\/\s*/g, '.');
}

export function formatDateText(value) {
  if (value === undefined || value === null || value === '') return '-';
  const text = String(value).trim();
  const matched = text.match(/\d{4}[./-]\d{1,2}[./-]\d{1,2}/);
  return matched ? matched[0].replace(/[./]/g, '-') : text;
}
