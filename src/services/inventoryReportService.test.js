import * as XLSX from 'xlsx';
import { getInventoryReport, getInventoryReportSummary, getIncrementRows, getInventoryLossCategoryRows, getInventoryDetailRows, getInventoryHistoryChartRows, getGroupedRowSpans, buildInventoryReportWorkbook, DETAIL_FIELDS, accounting } from './inventoryReportService';

const workbook = year => XLSX.read(XLSX.write(buildInventoryReportWorkbook(getInventoryReport(year)), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
test('四年真实数据逐项保留且演示明细不能覆盖真实汇总', () => {
  expect(getInventoryReport(2026).history.map(row => [row.year, row.quantity, row.original, row.net, row.lossQuantity, row.lossRate, row.lossOriginal, row.lossOriginalRate, row.lossNet, row.lossNetRate])).toEqual([
    [2023, 13317, 85199218, 10052457, 1, 0.00008, 6538, 0.00008, 0, 0],
    [2024, 12134, 80401393, 8100123, 3, 0.00025, 9292, 0.00012, 2274, 0.00028],
    [2025, 11072, 74656619, 6559666, 40, 0.00361, 813957, 0.01090, 0, 0],
    [2026, 14456, 78067413, 4604109, 2, 0.00014, 2813, 0.00004, 217, 0.00005],
  ]);
  const report = getInventoryReport(2025);
  expect(report.details).toHaveLength(7);
  expect(getInventoryReportSummary(report)[1]).toMatchObject({ original: 813957, net: 0 });
  expect(getInventoryReportSummary(report)[2].quantity).toBeNull();
  expect(getInventoryReport(2026).details).toHaveLength(2);
  expect(getInventoryReport(2026).distribution).toEqual([]);
});
test('增量明细、小计、电话和合计对应2025至2026年', () => {
  const rows = getIncrementRows(2026);
  expect(rows.map(row => row.value)).toEqual([-85, -45, 0, -130, -49, 0, -49, -58, -30, -19, -107, -5, 3675, 3384]);
  const detailTotal = rows.filter(row => !['小计', '合计'].includes(row.name)).reduce((sum, row) => sum + row.value, 0);
  expect(detailTotal).toBe(3384);
  expect(detailTotal).toBe(getInventoryReport(2026).history[3].quantity - getInventoryReport(2026).history[2].quantity);
  expect(getIncrementRows(2025).every(row => row.value === null)).toBe(true);
});
test('图表百万元与指标万元换算正确，同比来自真实相邻年份', () => {
  const report = getInventoryReport(2026);
  expect(getInventoryHistoryChartRows(report)[3]).toMatchObject({ originalMillion: 78.067413, netMillion: 4.604109 });
  expect(report.indicators[1].total).toBe(7806.7413);
  expect(report.indicators[1].change).toBe(341.0794);
  expect(report.indicators[0].rate).toBe(3384 / 11072);
  expect(report.indicators[0].rateChange).toBeCloseTo((3384 / 11072 - (11072 - 12134) / 12134) * 100);
});
test.each([2025, 2026])('导出%s年历史、分类和增量合并位置无偏移', year => {
  const report = getInventoryReport(year);
  const wb = workbook(year);
  const sheet = wb.Sheets['盘点结果比较分析'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  expect(rows[11].slice(0, 10)).toEqual([2023, 13317, 85199218, 10052457, 1, 0.00008, 6538, 0.00008, 0, 0]);
  expect(sheet.H12.w).toBe('0.008%');
  expect(sheet.I12.w).toBe('-');
  const categoryStart = 11 + report.history.length + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: categoryStart, c: 0 }, e: { r: categoryStart + 1, c: 0 } });
  const incrementStart = categoryStart + 14 + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart, c: 0 }, e: { r: incrementStart + 2, c: 0 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart + 3, c: 0 }, e: { r: incrementStart + 3, c: 1 } });
  const exported = XLSX.utils.sheet_to_json(wb.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(exported[2]).toEqual(DETAIL_FIELDS);
  expect(sheet.A7.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  if (year === 2026) {
    expect(rows[incrementStart + 12]).toEqual(['电话', '电话', 3675]);
    expect(rows[incrementStart + 13][2]).toBe(3384);
    expect(rows[incrementStart + 2][2]).toBe(0);
    expect(exported[3][11]).toBe('201132100282');
    expect(exported[3][12]).toBe('2021-10-14');
    expect(exported[4][11]).toBe('NE3737');
    expect(exported[4][12]).toBe('2021-12-03');
    expect(exported[5][5]).toBe(2);
    expect(exported[5][6]).toBe(2813);
    expect(exported[5][7]).toBe(217);
    expect(sheet.A8.l.Target).toBe("#'盘亏资产明细及原因'!A7");
    expect(wb.Sheets['盘亏资产明细及原因'].F7.v).toBe(0);
    expect(wb.Sheets['盘亏资产明细及原因'].F7.w).toBe('-');
    expect(wb.Sheets['盘亏分布'].H3.v).toBe(0);
  } else {
    expect(exported[3][12]).toBe('2023-03-15');
    expect(sheet.A8.l.Target).toBe("#'盘亏资产明细及原因'!A9");
    expect(wb.Sheets['盘亏资产明细及原因'].A9.v).toBe(1);
  }
});
test('分组编号和缺失净值不被真实汇总改写，合并不跨小计', () => {
  const rows = getInventoryDetailRows(getInventoryReport(2025));
  expect(rows.filter(row => row['盘点状态'] === '待查').map(row => row['序号'])).toEqual([1, 2, 3]);
  expect(rows.find(row => row.label === '资产待查合计')['报失当月资产净值']).toBeNull();
  expect(getGroupedRowSpans(getIncrementRows(2026), 'category', row => !['小计', '合计'].includes(row.name)).slice(0, 4)).toEqual([3, 0, 0, 1]);
  expect(accounting(0)).toBe('-');
});

test('用户分类表与两条真实明细和公司统计保持一致，未补前年公司数据', () => {
  const report = getInventoryReport(2026);
  const categories = getInventoryLossCategoryRows(report);
  [2025, 2026].forEach(year => {
    const rows = categories.filter(row => row.year === year);
    const history = report.history.find(row => row.year === year);
    expect(rows.reduce((sum, row) => sum + row.quantity, 0)).toBe(history.lossQuantity);
    expect(rows.reduce((sum, row) => sum + row.original, 0)).toBe(history.lossOriginal);
    expect(rows.reduce((sum, row) => sum + row.net, 0)).toBe(history.lossNet);
  });
  expect(report.details[0]).toMatchObject({ 资产说明: '华为.MatePad', 资产小类: '移动数码-平板电脑', 责任人姓名: '刘霞', 责任人编号: '150193', 子公司: '搜狐媒体', 一级部门: '智能平台' });
  expect(report.details[1]).toMatchObject({ 资产说明: '小米.红米Note9', 资产小类: '移动数码-手机', 责任人姓名: '王紫荆', 责任人编号: '220965', 子公司: '集团总部', 一级部门: '市场部' });
  expect(report.detailsAreDemo).toBe(false);
  expect(report.companyIsDemo).toBe(false);
  expect(report.companyLoss.find(row => row.company === '搜狐媒体' && row.year === 2026)).toMatchObject({ mobile: 1, quantity: 1, net: 130 });
  expect(report.companyLoss.find(row => row.company === '集团总部' && row.year === 2026)).toMatchObject({ mobile: 1, quantity: 1, net: 87 });
  expect(report.companyLoss.find(row => row.company === '合计' && row.year === 2026)).toMatchObject({ mobile: 2, quantity: 2, net: 217 });
  expect(report.companyLoss.find(row => row.company === '合计' && row.year === 2025).quantity).toBeUndefined();
  expect(getInventoryReportSummary(report)[2]).toMatchObject({ quantity: 0, original: 0, net: 0 });
  const totals = getInventoryDetailRows(report).find(row => row.label === '总计');
  expect(totals).toMatchObject({ 数量: 2, 原值: 2813, 报失当月资产净值: 217 });
});
