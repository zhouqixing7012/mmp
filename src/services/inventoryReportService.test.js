import * as XLSX from 'xlsx';
import { amount, buildInventoryReportWorkbook, DETAIL_FIELDS, getInventoryReport, getInventoryReportSummary, getInventoryDetailRows, getInventoryLossCategoryRows, getInventoryHistoryChartRows, getGroupedRowSpans, getIncrementRows, getIncrementTitle, accounting } from './inventoryReportService';

test('模板总数保留，新增演示明细覆盖盘亏待查两类', () => {
  const report = getInventoryReport(2025);
  expect(report.distribution.reduce((sum, row) => sum + row.quantity, 0)).toBe(11072);
  expect(report.distribution.reduce((sum, row) => sum + row.original, 0)).toBe(74660000);
  expect(report.details).toHaveLength(7);
  expect(report.details.filter(row => row['盘点状态'] === '盘亏').reduce((sum, row) => sum + row['数量'], 0)).toBe(40);
  expect(getInventoryReport(2026)).toBeNull();
  const categories = getInventoryLossCategoryRows(report).filter(row => row.year === 2025);
  expect(categories.reduce((sum, row) => sum + row.quantity, 0)).toBe(40);
  expect(categories.find(row => row.category === '办公设备').original).toBe(68000);
});
test('盘亏与全量金额分开，缺失金额不冒用总额或0', () => {
  const rows = getInventoryReportSummary(getInventoryReport(2025));
  expect(rows[1].quantity).toBe(40);
  expect(rows[1].quantityRate).toBe(40 / 11072);
  expect(rows[1].original).toBe(322800);
  expect(rows[1].net).toBe(90400);
  expect(rows[2].quantity).toBe(4);
  expect(rows[2].net).toBeNull();
  expect(amount(null)).toBe('-');
  expect(amount(0)).toBe('0.00');
});
test('导出保留分析、19项明细、类别分布和子公司分布，空值不变0', () => {
  const workbook = buildInventoryReportWorkbook(getInventoryReport(2025));
  const roundTrip = XLSX.read(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }), { type: 'array' });
  expect(roundTrip.SheetNames).toEqual(['盘点结果比较分析', '盘亏资产明细及原因', '资产类型分布', '盘亏分布']);
  const sheet = roundTrip.Sheets['盘点结果比较分析'];
  expect(sheet.D6.v).toBe(74660000);
  expect(sheet.D7.v).toBe(322800);
  expect(sheet.I15.v).toBe(90400);
  expect(sheet.F15.v).toBe(0.00361);
  const analysisRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  expect(analysisRows.some(row => row[0] === '资产净值（万元）' && row[2] === -154)).toBe(true);
  const details = XLSX.utils.sheet_to_json(roundTrip.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(details[2]).toEqual(DETAIL_FIELDS);
  expect(details[2]).toHaveLength(18);
  expect(details[2][12]).toBe('购买日期');
  expect(details[2]).not.toContain('备注');
  expect(details[3][12]).toBe('2023-03-15');
  [8, 9, 10].forEach(index => expect(details[3][index]).toBeUndefined());
  expect(sheet.A7.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  expect(sheet.A8.l.Target).toBe("#'盘亏资产明细及原因'!A9");
  expect(XLSX.utils.sheet_to_json(sheet, { header: 1 }).flat()).not.toContain('资产管控方');
  expect(details[7][0]).toBe('资产盘亏合计');
  expect(roundTrip.Sheets['资产类型分布'].C1.v).toBe('原值（万元）');
  expect(roundTrip.Sheets['资产类型分布'].C2.v).toBe(2567);
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

test('报告单位、分组序号、合并单元格与会计格式在导出保持一致', () => {
  const report = getInventoryReport(2025);
  const chart = getInventoryHistoryChartRows(report).find(row => row.year === 2025);
  expect(chart.originalMillion).toBe(74.66);
  expect(chart.netMillion).toBe(6.56);
  expect(report.indicators[1].total).toBe(7466);
  expect(getIncrementTitle(2026)).toBe('2026年资产变化情况概述：2025-2026年盘点范围内各类资产增量情况');
  expect(accounting(0)).toBe('-');
  expect(accounting(34)).toBe('34.00');
  const details = getInventoryDetailRows(report).filter(row => !row.summary && row['盘点状态'] === '待查');
  expect(details.map(row => row['序号'])).toEqual([1, 2, 3]);
  expect(getGroupedRowSpans(getIncrementRows(), 'category', row => !['小计', '合计'].includes(row.name)).slice(0, 4)).toEqual([3, 0, 0, 1]);
  const wb = XLSX.read(XLSX.write(buildInventoryReportWorkbook(report), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
  const sheet = wb.Sheets['盘点结果比较分析'];
  expect(sheet.A2.v).toBe('资产变化范围');
  expect(sheet.C20.v).toBe(0);
  expect(sheet.C20.w).toBe('-');
  expect(sheet['!merges']).toContainEqual({ s: { r: 18, c: 0 }, e: { r: 19, c: 0 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 35, c: 0 }, e: { r: 37, c: 0 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 38, c: 0 }, e: { r: 38, c: 1 } });
  expect(wb.Sheets['盘亏分布']['!merges']).toContainEqual({ s: { r: 1, c: 0 }, e: { r: 2, c: 0 } });
  expect(wb.Sheets['盘亏资产明细及原因'].A9.v).toBe(1);
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rowIndex = rows.findIndex(row => row[0] === '资产数量（件）');
  const growth = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: 4 })];
  expect(growth.v).toBe(0.0013);
  expect(growth.w).toBe('0.13%');
});
