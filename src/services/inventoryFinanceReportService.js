import template from '../data/inventoryFinanceReportTemplate.json';

// 用户提供的空白模板独立于ES年度统计，保持三张表的字段、合并及零值。
export function getInventoryFinanceReportTemplate() {
  return template.sheets;
}

export function inventoryFinanceTemplateUrl() {
  return `${process.env.PUBLIC_URL || '.'}/templates/inventory-finance-report.xls`;
}

export function financeTemplateCellSpan(sheet, row, column) {
  const merge = sheet.merges.find(item => row >= item.s.r && row <= item.e.r
    && column >= item.s.c && column <= item.e.c);
  if (!merge) return { rowSpan: 1, colSpan: 1 };
  if (row !== merge.s.r || column !== merge.s.c) return null;
  return { rowSpan: merge.e.r - row + 1, colSpan: merge.e.c - column + 1 };
}

export function formatFinanceTemplateValue(value, column, summary) {
  if (typeof value !== 'number') return value;
  const amount = summary ? [2, 3, 6, 7, 10, 11, 14, 17].includes(column)
    : [6, 9, 10].includes(column);
  return value.toLocaleString('zh-CN', { minimumFractionDigits: amount ? 2 : 0, maximumFractionDigits: amount ? 2 : 0 });
}
