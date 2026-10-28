import template from '../data/inventoryFinanceReportTemplate.json';
import * as XLSX from 'xlsx-js-style';
import { accountingAmount, INVENTORY_REPORT_FORMATS } from './inventoryReportFormats';
export { buildFinanceInventoryReport } from './inventoryFinanceReportModel';

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
  return amount ? accountingAmount(value) : value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

export function buildFinanceInventoryWorkbook(report, originalWorkbook) {
  const workbook = XLSX.utils.book_new();
  report.sheets.forEach((data, index) => {
    const original = originalWorkbook?.Sheets[originalWorkbook.SheetNames[index]];
    const sheet = XLSX.utils.aoa_to_sheet(data.rows);
    sheet['!merges'] = data.merges;
    sheet['!cols'] = original?.['!cols'] || Array.from({ length: index === 0 ? 20 : 19 }, () => ({ wch: 18 }));
    Object.entries(sheet).forEach(([address, cell]) => {
      if (address.startsWith('!')) return;
      if (original?.[address]?.s) cell.s = original[address].s;
      if (cell.t !== 'n') return;
      const column = XLSX.utils.decode_cell(address).c;
      const money = index === 0 ? [2, 3, 6, 7, 10, 11, 14, 17].includes(column) : [6, 9, 10].includes(column);
      cell.z = money ? INVENTORY_REPORT_FORMATS.accountingDecimal : INVENTORY_REPORT_FORMATS.integerWithZero;
    });
    XLSX.utils.book_append_sheet(workbook, sheet, data.name);
  });
  return workbook;
}

export async function exportFinanceInventoryReport(report) {
  const response = await fetch(inventoryFinanceTemplateUrl());
  if (!response.ok) throw new Error('报告格式文件读取失败');
  const original = XLSX.read(await response.arrayBuffer(), { type: 'array', cellStyles: true });
  const workbook = buildFinanceInventoryWorkbook(report, original);
  XLSX.writeFile(workbook, `${report.company || '财务'}盘点报告.xlsx`);
}
