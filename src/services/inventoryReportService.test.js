import * as XLSX from 'xlsx';
import { amount, buildInventoryReportWorkbook, DETAIL_FIELDS, getInventoryReport, getInventoryReportSummary, getInventoryDetailRows } from './inventoryReportService';

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
  expect(roundTrip.Sheets['资产类型分布'].D1.v).toBe('原值占比');
  expect(roundTrip.Sheets['资产类型分布'].D2.v).toBeCloseTo(25670000 / 74660000);
});

test('混排明细按盘亏和待查分组，小计与总计同列，缺值不补0', () => {
  const report = { ...getInventoryReport(2025), details: [
    { 盘点状态: '待查', 标签号: 'TEST-PENDING', 数量: 3, 原值: 20, 报失当月资产净值: null },
    { 盘点状态: '盘亏', 标签号: 'TEST-LOSS', 数量: 2, 原值: 10, 报失当月资产净值: 5 },
  ] };
  const rows = getInventoryDetailRows(report);
  expect(rows.map(row => row.label || row['标签号'])).toEqual(['TEST-LOSS', '资产盘亏合计', 'TEST-PENDING', '资产待查合计', '总计']);
  expect(rows[4]['数量']).toBe(5);
  expect(rows[4]['原值']).toBe(30);
  expect(rows[4]['报失当月资产净值']).toBeNull();
  const sheet = buildInventoryReportWorkbook(report).Sheets['盘亏资产明细及原因'];
  expect(sheet.F8.v).toBe(5);
  expect(sheet.G8.v).toBe(30);
  expect(sheet.H8).toBeUndefined();
  expect(sheet['!merges']).toContainEqual({ s: { r: 7, c: 0 }, e: { r: 7, c: 4 } });
});
