import * as XLSX from 'xlsx-js-style';
import dayjs from 'dayjs';
import source from '../data/financialNewAssets.json';

// 原型仅读取附件真实样本；工作表名称原样作为公司标识，不推断财务公司映射。
export const financialAssetFields = ['公司', '板块', ...source.fields];
export const financialAssetExportFields = source.fields;
export const financialAssetCompanies = source.companies;
const numericFields = ['数量', '原值', '税金', '含税金额'];
export function validateFinancialAssetFilters({ companies = [], plates = [], dates = [] } = {}) {
  if (!Array.isArray(companies) || companies.some(company => !source.companies.includes(company))) throw new Error('公司不存在');
  if (!Array.isArray(plates) || plates.some(value => typeof value !== 'string' || !value.trim())) throw new Error('板块条件无效');
  if (!Array.isArray(dates) || dates.length > 2) throw new Error('启用日期范围无效');
  dates.forEach(value => {
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !dayjs(value).isValid() || dayjs(value).format('YYYY-MM-DD') !== value)) throw new Error('启用日期无效');
  });
  if (dates[0] && dates[1] && dates[0] > dates[1]) throw new Error('启用日期的开始日期不能晚于结束日期');
}
export function queryFinancialNewAssets(filters = {}) {
  validateFinancialAssetFilters(filters);
  const { companies = [], plates = [], dates = [] } = filters;
  return source.rows.map(row => ({ ...row, values: { 公司: row.company, 板块: null, ...row.values } })).filter(row => (!companies.length || companies.includes(row.company))
    && (!plates.length || plates.includes(String(row.values['板块'] ?? '').split('.')[0]))
    && (!dates[0] || row.values['启用日期'] >= dates[0]) && (!dates[1] || row.values['启用日期'] <= dates[1]));
}
export function totalFinancialNewAssets(rows) {
  return Object.fromEntries(numericFields.map(field => [field, rows.reduce((sum, row) => sum + row.values[field], 0)]));
}
export function formatFinancialAssetValue(value, field) {
  if (value == null) return '';
  if (numericFields.includes(field)) return value.toLocaleString('zh-CN', { minimumFractionDigits: field === '数量' ? 0 : 2, maximumFractionDigits: field === '数量' ? 0 : 2 });
  return value;
}
export function buildFinancialNewAssetWorkbook(filters = {}) {
  const rows = queryFinancialNewAssets(filters);
  const companies = filters.companies?.length ? source.companies.filter(company => filters.companies.includes(company)) : source.companies;
  const workbook = XLSX.utils.book_new();
  companies.forEach(company => {
    const companyRows = rows.filter(row => row.company === company);
    const totals = totalFinancialNewAssets(companyRows);
    const values = [financialAssetExportFields, ...companyRows.map(row => financialAssetExportFields.map(field => row.values[field])),
      financialAssetExportFields.map(field => field === '资产说明' ? 'Total' : numericFields.includes(field) ? totals[field] : null)];
    const sheet = XLSX.utils.aoa_to_sheet(values);
    sheet['!cols'] = [22, 20, 34, 58, 10, 20, 20, 20, 17, 42, 24, 24, 22].map(wch => ({ wch }));
    sheet['!rows'] = values.map((_, index) => ({ hpt: index === 0 ? 28 : index === values.length - 1 ? 24 : 42 }));
    values.forEach((row, rowIndex) => financialAssetExportFields.forEach((field, col) => {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      const cell = sheet[address] || (sheet[address] = { t: 's', v: '' });
      cell.s = {
        font: { name: '宋体', sz: 11, bold: rowIndex === 0 || rowIndex === values.length - 1 },
        alignment: { vertical: 'center', horizontal: rowIndex === 0 ? 'center' : numericFields.includes(field) ? 'right' : 'left', wrapText: true },
        border: Object.fromEntries(['top', 'bottom', 'left', 'right'].map(side => [side, { style: 'thin', color: { rgb: '000000' } }])),
      };
      if (cell.t === 'n') cell.z = field === '数量' ? '#,##0' : '#,##0.00';
    }));
    XLSX.utils.book_append_sheet(workbook, sheet, company);
  });
  return workbook;
}
export function exportFinancialNewAssets(filters) {
  XLSX.writeFile(buildFinancialNewAssetWorkbook(filters), '固定资产新增报表.xlsx');
}
