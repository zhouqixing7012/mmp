import * as XLSX from 'xlsx';
import { amount, buildInventoryReportWorkbook, DETAIL_FIELDS, getInventoryReport, getInventoryReportSummary } from './inventoryReportService';

test('模板数字与两类分布合计一致，未提供明细不伪造', () => {
  const report = getInventoryReport(2025);
  expect(report.distribution.reduce((sum, row) => sum + row.quantity, 0)).toBe(11072);
  expect(report.distribution.reduce((sum, row) => sum + row.original, 0)).toBe(74660000);
  expect(report.details).toEqual([]);
  expect(getInventoryReport(2026)).toBeNull();
});
test('盘亏与全量金额分开，缺失金额不冒用总额或0', () => {
  const rows = getInventoryReportSummary(getInventoryReport(2025));
  expect(rows[1].quantity).toBe(40);
  expect(rows[1].quantityRate).toBe(40 / 11072);
  expect(rows[1].original).toBeNull();
  expect(rows[1].net).toBeNull();
  expect(rows[2].quantity).toBeNull();
  expect(amount(null)).toBe('-');
  expect(amount(0)).toBe('0.00');
});
test('导出保留分析、19项明细、类别分布和子公司分布，空值不变0', () => {
  const workbook = buildInventoryReportWorkbook(getInventoryReport(2025));
  const roundTrip = XLSX.read(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }), { type: 'array' });
  expect(roundTrip.SheetNames).toEqual(['盘点结果比较分析', '盘亏资产明细及原因', '资产类型分布', '盘亏分布']);
  const sheet = roundTrip.Sheets['盘点结果比较分析'];
  expect(sheet.E6.v).toBe(74660000);
  expect(sheet.E7).toBeUndefined();
  expect(sheet.J15).toBeUndefined();
  expect(sheet.G15.v).toBe(0.00361);
  const analysisRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  expect(analysisRows.some(row => row[0] === '资产净值（万元）' && row[2] === -154)).toBe(true);
  const details = XLSX.utils.sheet_to_json(roundTrip.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(details[2]).toEqual(DETAIL_FIELDS);
  expect(details[3][0]).toBe('资产盘亏合计');
});
