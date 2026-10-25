import * as XLSX from 'xlsx-js-style';
import { inventoryReportActuals } from '../data/inventoryReportActuals';
import { getInventoryReport, getInventoryReportSummary, getIncrementRows, getInventoryLossCategoryRows, getInventoryDetailRows, getInventoryHistoryChartRows, getGroupedRowSpans, buildInventoryReportWorkbook, DETAIL_FIELDS, companyQuantity, companyAmount, accounting } from './inventoryReportService';

const analysisValues = (row, count = 10) => Array.from({ length: count }, (_, index) => row[index === 0 ? 1 : index + 2]);
const workbook = year => XLSX.read(XLSX.write(buildInventoryReportWorkbook(getInventoryReport(year)), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true, cellStyles: true });
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
  expect(getInventoryReport(2026).distributionIsDemo).toBe(true);
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
  expect(analysisValues(rows[18])).toEqual([2023, 13317, 85199218, 10052457, 1, 0.00008, 6538, 0.00008, 0, 0]);
  expect(sheet.J19.w).toBe('0.008%');
  expect(sheet.K19.w).toBe('-');
  const categoryStart = 18 + report.history.length + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: categoryStart, c: 1 }, e: { r: categoryStart + 1, c: 1 } });
  const incrementStart = categoryStart + 14 + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart, c: 1 }, e: { r: incrementStart + 2, c: 1 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart + 3, c: 1 }, e: { r: incrementStart + 3, c: 3 } });
  const exported = XLSX.utils.sheet_to_json(wb.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(exported[2]).toEqual(DETAIL_FIELDS);
  expect(sheet.B12.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  if (year === 2026) {
    expect(analysisValues(rows[incrementStart + 12], 3)).toEqual(['电话', '电话', 3675]);
    expect(rows[incrementStart + 13][4]).toBe(3384);
    expect(rows[incrementStart + 2][4]).toBe(0);
    expect(exported[3][11]).toBe('201132100282');
    expect(exported[3][12]).toBe('2021-10-14');
    expect(exported[4][11]).toBe('NE3737');
    expect(exported[4][12]).toBe('2021-12-03');
    expect(exported[5][5]).toBe(2);
    expect(exported[5][6]).toBe(2813);
    expect(exported[5][7]).toBe(217);
    expect(sheet.B13.l.Target).toBe("#'盘亏资产明细及原因'!A7");
    expect(wb.Sheets['盘亏资产明细及原因'].F7.v).toBe(0);
    expect(wb.Sheets['盘亏资产明细及原因'].F7.w).toBe('-');
    expect(wb.Sheets['盘亏分布'].H3.v).toBe(0);
  } else {
    expect(exported[3][12]).toBe('2023-03-15');
    expect(sheet.B13.l.Target).toBe("#'盘亏资产明细及原因'!A9");
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

test('用户分类表与两条真实明细和公司统计保持一致，上一年公司使用截图来源', () => {
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
  expect(report.companyLoss.find(row => row.company === '合计' && row.year === 2025)).toMatchObject({ quantity: 40, net: 0 });
  expect(report.companyLoss.find(row => row.company === '搜狐媒体' && row.year === 2025).quantity).toBeUndefined();
  expect(getInventoryReportSummary(report)[2]).toMatchObject({ quantity: 0, original: 0, net: 0 });
  const totals = getInventoryDetailRows(report).find(row => row.label === '总计');
  expect(totals).toMatchObject({ 数量: 2, 原值: 2813, 报失当月资产净值: 217 });
});

test('截图公司分布按真实年份录入，页面和导出零值留白', () => {
  const report = getInventoryReport(2025);
  expect(report.companyIsDemo).toBe(false);
  expect(report.companyLoss.map(row => [row.company, row.year, row.office, row.mobile, row.vehicle, row.quantity, row.net])).toEqual([
    ['集团总部', 2024, 0, 0, 0, 0, 0], ['集团总部', 2025, 33, 1, 5, 39, 0],
    ['搜狐媒体（含焦点）', 2024, 2, 0, 0, 2, 2274], ['搜狐媒体（含焦点）', 2025, 1, 0, 0, 1, 0],
    ['视频', 2024, 0, 1, 0, 1, 0], ['视频', 2025, 0, 0, 0, 0, 0],
    ['合计', 2024, 2, 1, 0, 3, 2274], ['合计', 2025, 34, 1, 5, 40, 0],
  ]);
  expect(companyQuantity(0)).toBe(''); expect(companyAmount(0)).toBe('');
  expect(companyQuantity(null)).toBe(''); expect(companyAmount(2274)).toBe('2,274');
  const sheet = workbook(2025).Sheets['盘亏分布'];
  expect(sheet.C2.v).toBe(0); expect(sheet.C2.w).toBe('');
  expect(sheet.K3.v).toBe(0); expect(sheet.K3.w).toBe('');
  expect(sheet.K4.w).toBe('2,274');
  expect(sheet['!merges']).toContainEqual({ s: { r: 1, c: 0 }, e: { r: 2, c: 0 } });
});
test('2026资产类型分布使用授权演示且单位万元，分项合计与年度汇总一致', () => {
  const report = getInventoryReport(2026);
  expect(report.distributionIsDemo).toBe(true);
  expect(report.distribution.reduce((sum, row) => sum + row.quantity, 0)).toBe(14456);
  expect(report.distribution.reduce((sum, row) => sum + row.original, 0)).toBe(78067413);
  const sheet = workbook(2026).Sheets['资产类型分布'];
  expect(sheet.A1.v).toBe('类别');
  expect(sheet.C1.v).toBe('原值（万元）');
  expect(sheet.C2.v).toBe(2700);
});


test.each([2025, 2026])('导出%s年实际文件保留标题、边框、汇总强调和数字格式', year => {
  const report = getInventoryReport(year);
  const styled = buildInventoryReportWorkbook(report);
  const analysis = styled.Sheets['盘点结果比较分析'];
  expect(analysis.A1.s.font).toMatchObject({ bold: true, sz: 13, name: '宋体' });
  expect(analysis.B9.s.fill.fgColor.rgb).toBe('FFFFFF');
  expect(analysis.D12.s.font.color.rgb).toBe('FF0000');
  expect(analysis.D12.z).toBe('#,##0;(#,##0);"-"');
  expect(analysis.I13.s.border.bottom.style).toBe('thin');
  expect(analysis.B12.s.font.underline).toBe(true);
  const details = styled.Sheets['盘亏资产明细及原因'];
  const summaryRow = getInventoryDetailRows(report).findIndex(row => row.label === '总计') + 4;
  expect(details['F' + summaryRow].s.fill.fgColor.rgb).toBe('BFBFBF');
  expect(details['I' + summaryRow].v).toBe('');
  expect(details['!cols'][4].wch).toBe(32);
  const saved = XLSX.read(XLSX.write(styled, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer', cellNF: true, cellStyles: true, bookFiles: true });
  const xml = Buffer.from(saved.files['xl/styles.xml'].content).toString('utf8');
  expect(xml).toContain('D9D9D9');
  expect(xml).toContain('B8CCE4');
  expect(xml).toContain('宋体');
  expect(xml).toContain('style="thin"');
  expect(saved.Sheets['盘点结果比较分析'].B12.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  expect(saved.Sheets['盘亏分布'].C2.w).toBe('');
});


test.each([2025, 2026])('参考样式%s双层表头和当前年灰底无重叠合并', year => {
  const sheet = buildInventoryReportWorkbook(getInventoryReport(year)).Sheets['盘点结果比较分析'];
  expect(sheet['!merges']).toContainEqual({ s: { r: 8, c: 3 }, e: { r: 8, c: 4 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 8, c: 1 }, e: { r: 9, c: 1 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 16, c: 3 }, e: { r: 16, c: 5 } });
  const occupied = new Set();
  sheet['!merges'].forEach(range => {
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        expect(occupied.has(address)).toBe(false);
        occupied.add(address);
      }
    }
  });
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const firstCurrent = rows.findIndex(row => row[1] === '台式机、显示器' && row[3] === year);
  expect(sheet[XLSX.utils.encode_cell({ r: firstCurrent, c: 3 })].s.fill.fgColor.rgb).toBe('D9D9D9');
  expect(sheet.D11.v).toBe(getInventoryReport(year).history.find(row => row.year === year).quantity);
});


test('报告范围采用确认原文，不追加项目创建权限说明', () => {
  const text = '电脑（笔记本、主机、显示器）、办公设备、车辆、IP电话。（注：楼宇、装修、家具及软件不在盘点范围内）';
  expect(getInventoryReport(2026).scope).toBe(text);
  expect(workbook(2026).Sheets['盘点结果比较分析'].D5.v).toBe(text);
});

test('明细及导出不按公司和板块二次裁剪项目来源，普通分公司与缺板块记录均保留', () => {
  const report = getInventoryReport(2026);
  const source = report.details[0];
  const branchAssets = [
    { ...source, 标签号: 'SH-WEB', 子公司: '新媒体上海分公司', 板块: '11.搜狐网-web' },
    { ...source, 标签号: 'GZ-NO-PLATE', 子公司: '新媒体广州分公司', 板块: undefined },
    { ...source, 标签号: 'GZ-VIDEO', 子公司: '新媒体广州分公司', 板块: '16.视频' },
  ];
  const scoped = { ...report, details: [...report.details, ...branchAssets] };
  const rows = getInventoryDetailRows(scoped);
  expect(rows.filter(row => !row.summary).map(row => row['标签号'])).toEqual(['201132100282', 'NE3737', 'SH-WEB', 'GZ-NO-PLATE', 'GZ-VIDEO']);
  expect(rows.find(row => row.label === '资产盘亏合计')['数量']).toBe(5);
  const exported = XLSX.utils.sheet_to_json(buildInventoryReportWorkbook(scoped).Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(exported.filter(row => branchAssets.some(asset => row.includes(asset['标签号'])))).toHaveLength(3);
  expect(report.details).toHaveLength(2);
});

test('年度加载保留来源明细后按公司汇总，源明细及已提供年度总量均不改写', () => {
  const details = inventoryReportActuals.detailsByYear[2026];
  const branchAsset = { ...details[0], 标签号: 'SOURCE-GZ', 子公司: '116.新媒体-广州', 板块: '17.Corporate' };
  details.push(branchAsset);
  try {
    const report = getInventoryReport(2026);
    expect(report.details.some(row => row['标签号'] === 'SOURCE-GZ')).toBe(true);
    expect(report.companyLoss.find(row => row.company === '116.新媒体-广州' && row.year === 2026).quantity).toBe(1);
    expect(report.companyLoss.find(row => row.company === '合计' && row.year === 2026).quantity).toBe(3);
    expect(inventoryReportActuals.detailsByYear[2026]).toContain(branchAsset);
    expect(report.history.find(row => row.year === 2026).quantity).toBe(14456);
  } finally { details.pop(); }
});

test('新分类替换逐资产旧标记并联动公司表导出，用户提供年度汇总保持原值', () => {
  const source = inventoryReportActuals.detailsByYear[2026];
  const added = { ...source[0], 标签号: 'CLASSIFICATION-CAMERA', 资产大类: 'OFFICE EQUIPMENT', 资产小类: '数码配件-三脚架', 数量: 4, 子公司: '集团总部', reportCategory: '办公设备' };
  source.push(added);
  try {
    const report = getInventoryReport(2026);
    expect(report.details.find(row => row['标签号'] === 'CLASSIFICATION-CAMERA')).toMatchObject({ reportCategory: '照摄像器材', minorCategoryA: '数码配件' });
    expect(report.companyLoss.find(row => row.company === '集团总部' && row.year === 2026)).toMatchObject({ camera: 4, office: 0 });
    const sheet = buildInventoryReportWorkbook(report).Sheets['盘亏分布'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const company = rows.find(row => row[0] === '集团总部' && row[1] === 2026);
    expect(company[7]).toBe(4);
    expect(company[5]).toBe(0);
    expect(getInventoryLossCategoryRows(report).find(row => row.category === '照摄像器材' && row.year === 2026).quantity).toBe(0);
    expect(added.reportCategory).toBe('办公设备');
  } finally { source.pop(); }
});

test('分析与图表导出按各表精度处理0、负数和缺值，不改计算数值', () => {
  const report = getInventoryReport(2026);
  const sheet = workbook(2026).Sheets['盘点结果比较分析'];
  expect(sheet['!cols'][2].hidden).toBe(true);
  expect(sheet.B9.v).toBe('资产情况');
  expect(sheet.D9.v).toBe('数量');
  expect(sheet.B17.v).toBe('年份');
  expect(sheet.B25.v).toBe('资产类别');
  expect(sheet.B42.v).toBe('资产大类');
  expect(sheet.D42.v).toBe('资产细类');
  expect(sheet.E42.v).toBe('汇总');
  expect(sheet.D12.w).toBe('2');
  expect(sheet.F12.w).toBe('2,813');
  expect(sheet.E12.w).toBe('0.014%');
  expect(sheet.E11.w).toBe('100%');
  expect(sheet.D13.w).toBe('-');
  expect(sheet.L19.w).toBe('-');
  expect(sheet.E33.w).toBe('2');
  expect(sheet.F33.w).toBe('2,813');
  expect(sheet.G33.w).toBe('217');
  expect(sheet.D61.v).toBe(report.indicators[1].total);
  expect(sheet.D61.w).toBe('7,807');
  expect(sheet.E61.w).toBe('341');
  const exported = workbook(2026);
  expect(exported.Sheets['盘亏资产明细及原因'].G4.w).toBe('1,946.00');
  expect(exported.Sheets['盘亏资产明细及原因'].J4?.v ?? '').toBe('');
  expect(exported.Sheets['资产类型分布'].C2.w).toBe('2,700');

  const modified = { ...report, history: report.history.map(row => row.year === 2026 ? { ...row, lossNet: -1234.5 } : row),
    indicators: report.indicators.map(row => ({ ...row, change: -1234.5, rateChange: null })) };
  const book = XLSX.read(XLSX.write(buildInventoryReportWorkbook(modified), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true, cellStyles: true });
  expect(book.Sheets['盘点结果比较分析'].H12.v).toBe(-1234.5);
  expect(book.Sheets['盘点结果比较分析'].H12.w).toBe('(1,235)');
  expect(book.Sheets['盘点结果比较分析'].E61.w).toBe('-1,235');
  expect(book.Sheets['盘点结果比较分析'].G61.v).toBe('');
});


test('明细普通行保存后仍区分会计0、General数量0及未提供金额', () => {
  const source = getInventoryReport(2026);
  const report = { ...source, details: [{ ...source.details[0], 数量: 0, 原值: 0, 报失当月资产净值: -1234.5, 赔偿金额: 0, 损失: null }] };
  const book = XLSX.read(XLSX.write(buildInventoryReportWorkbook(report), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true, cellStyles: true });
  const sheet = book.Sheets['盘亏资产明细及原因'];
  expect(sheet.F4.v).toBe(0);
  expect(sheet.F4.w).toBe('0');
  expect(sheet.G4.v).toBe(0);
  expect(sheet.G4.w).toBe('-');
  expect(sheet.H4.w).toBe('(1,234.50)');
  expect(sheet.J4.v).toBe(0);
  expect(sheet.J4.w).toBe('0.00');
  expect(sheet.K4.v).toBe('');
});

test.each([2025, 2026])('增量备注导出%s年位于F列、保持B/D/E和后续指标行，实际文件含备注边框', year => {
  const report = getInventoryReport(year);
  const increments = getIncrementRows(year);
  const incrementStart = 18 + report.history.length + 3 + 14 + 3;
  const styled = buildInventoryReportWorkbook(report);
  const sheet = styled.Sheets['盘点结果比较分析'];
  const row = incrementStart + 1;
  expect(sheet[`B${incrementStart}`].v).toBe('资产大类');
  expect(sheet[`D${incrementStart}`].v).toBe('资产细类');
  expect(sheet[`E${incrementStart}`].v).toBe('汇总');
  expect(sheet[`F${incrementStart}`].v).toBe('备注');
  expect(sheet[`B${row}`].v).toBe('台式机');
  expect(sheet[`D${row}`].v).toBe('PC-主机');
  expect(sheet[`E${row}`]?.v ?? '').toBe(increments[0].value ?? '');
  expect(increments.map((_, index) => sheet[`F${row + index}`].v)).toEqual(increments.map(() => ''));
  expect(sheet[`F${row}`].s.border.bottom.style).toBe('thin');
  expect(sheet[`F${row + 3}`].s.fill.fgColor.rgb).toBe('B8CCE4');
  expect(sheet[`F${row + 13}`].s.fill.fgColor.rgb).toBe('BFBFBF');
  expect(sheet[`F${row + 13}`].s.font.bold).toBe(true);
  const indicatorStart = incrementStart + increments.length + 3;
  expect(sheet[`B${indicatorStart}`].v).toBe('指标');
  expect(sheet[`D${indicatorStart + 1}`].v).toBe(report.indicators[0].total);
  const saved = XLSX.read(XLSX.write(styled, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer', cellStyles: true, cellNF: true, bookFiles: true });
  expect(saved.Sheets['盘点结果比较分析'][`F${incrementStart}`].v).toBe('备注');
  const sheetXml = new DOMParser().parseFromString(Buffer.from(saved.files['xl/worksheets/sheet1.xml'].content).toString('utf8'), 'application/xml');
  const styleIndex = Number(sheetXml.querySelector(`c[r="F${row}"]`).getAttribute('s'));
  const styleXml = new DOMParser().parseFromString(Buffer.from(saved.files['xl/styles.xml'].content).toString('utf8'), 'application/xml');
  const borderIndex = Number(styleXml.querySelectorAll('cellXfs > xf')[styleIndex].getAttribute('borderId'));
  expect(styleXml.querySelectorAll('borders > border')[borderIndex].querySelector('bottom').getAttribute('style')).toBe('thin');
});

test('分布原值万元按整数四舍五入、原值占比按整数百分比展示，源金额和计算比例不提前舍入', () => {
  const source = getInventoryReport(2026);
  const distribution = [{ category: '测试甲', quantity: 1, original: 1254999 }, { category: '测试乙', quantity: 1, original: 1255000 }, { category: '测试零值', quantity: 0, original: 0 }];
  const report = { ...source, distribution };
  const saved = XLSX.read(XLSX.write(buildInventoryReportWorkbook(report), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
  const sheet = saved.Sheets['资产类型分布'];
  expect(sheet.C2.v).toBe(125.4999); expect(sheet.C2.w).toBe('125');
  expect(sheet.C3.v).toBe(125.5); expect(sheet.C3.w).toBe('126');
  expect(sheet.C4.v).toBe(0); expect(sheet.C4.w).toBe('0');
  expect(sheet.C2.z).toBe('#,##0;-#,##0;0');
  expect(sheet.D2.v).toBe(1254999 / 2509999); expect(sheet.D2.w).toBe('50%');
  expect(sheet.D2.z).toBe('0%'); expect(sheet.D4.w).toBe('0%');
  expect(distribution.map(row => row.original)).toEqual([1254999, 1255000, 0]);
});

test('导出工作表无演示文案，元数据仅标出具体示例来源而不覆盖真实年度信息', () => {
  const report = getInventoryReport(2026);
  expect(report.distributionIsDemo).toBe(true);
  expect(report.detailsAreDemo).toBe(false);
  const saved = XLSX.read(XLSX.write(buildInventoryReportWorkbook(report), { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' });
  const values = Object.values(saved.Sheets).flatMap(sheet => Object.entries(sheet).filter(([address]) => !address.startsWith('!')).map(([, cell]) => cell.v));
  expect(values.some(value => String(value).includes('演示数据'))).toBe(false);
  expect(saved.Sheets['资产类型分布'].A1.v).toBe('类别');
  expect(saved.Custprops.demoDataSources).toBe('distribution');
  expect(saved.Custprops.isDemo).toBeUndefined();
});
