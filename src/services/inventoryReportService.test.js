import * as XLSX from 'xlsx-js-style';
import { inventoryReportActuals } from '../data/inventoryReportActuals';
import { isAssetInInventoryReportScope, filterInventoryReportAssets, getInventoryReport, getInventoryReportSummary, getIncrementRows, getInventoryLossCategoryRows, getInventoryDetailRows, getInventoryHistoryChartRows, getGroupedRowSpans, buildInventoryReportWorkbook, DETAIL_FIELDS, companyQuantity, companyAmount, accounting } from './inventoryReportService';

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
  expect(rows[17].slice(0, 10)).toEqual([2023, 13317, 85199218, 10052457, 1, 0.00008, 6538, 0.00008, 0, 0]);
  expect(sheet.H18.w).toBe('0.008%');
  expect(sheet.I18.w).toBe('-');
  const categoryStart = 17 + report.history.length + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: categoryStart, c: 0 }, e: { r: categoryStart + 1, c: 0 } });
  const incrementStart = categoryStart + 14 + 3;
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart, c: 0 }, e: { r: incrementStart + 2, c: 0 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: incrementStart + 3, c: 0 }, e: { r: incrementStart + 3, c: 1 } });
  const exported = XLSX.utils.sheet_to_json(wb.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(exported[2]).toEqual(DETAIL_FIELDS);
  expect(sheet.A12.l.Target).toBe("#'盘亏资产明细及原因'!A4");
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
    expect(sheet.A13.l.Target).toBe("#'盘亏资产明细及原因'!A7");
    expect(wb.Sheets['盘亏资产明细及原因'].F7.v).toBe(0);
    expect(wb.Sheets['盘亏资产明细及原因'].F7.w).toBe('-');
    expect(wb.Sheets['盘亏分布'].H3.v).toBe(0);
  } else {
    expect(exported[3][12]).toBe('2023-03-15');
    expect(sheet.A13.l.Target).toBe("#'盘亏资产明细及原因'!A9");
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
  expect(companyQuantity(null)).toBe(''); expect(companyAmount(2274)).toBe('2,274.00');
  const sheet = workbook(2025).Sheets['盘亏分布'];
  expect(sheet.C2.v).toBe(0); expect(sheet.C2.w).toBe('');
  expect(sheet.K3.v).toBe(0); expect(sheet.K3.w).toBe('');
  expect(sheet.K4.w).toBe('2,274.00');
  expect(sheet['!merges']).toContainEqual({ s: { r: 1, c: 0 }, e: { r: 2, c: 0 } });
});
test('2026资产类型分布使用授权演示且单位万元，分项合计与年度汇总一致', () => {
  const report = getInventoryReport(2026);
  expect(report.distributionIsDemo).toBe(true);
  expect(report.distribution.reduce((sum, row) => sum + row.quantity, 0)).toBe(14456);
  expect(report.distribution.reduce((sum, row) => sum + row.original, 0)).toBe(78067413);
  const sheet = workbook(2026).Sheets['资产类型分布'];
  expect(sheet.A1.v).toBe('类别（演示数据）');
  expect(sheet.C1.v).toBe('原值（万元）');
  expect(sheet.C2.v).toBe(2700);
});


test.each([2025, 2026])('导出%s年实际文件保留标题、边框、汇总强调和数字格式', year => {
  const report = getInventoryReport(year);
  const styled = buildInventoryReportWorkbook(report);
  const analysis = styled.Sheets['盘点结果比较分析'];
  expect(analysis.A1.s.font).toMatchObject({ bold: true, sz: 13, name: '宋体' });
  expect(analysis.A9.s.fill.fgColor.rgb).toBe('FFFFFF');
  expect(analysis.B12.s.font.color.rgb).toBe('FF0000');
  expect(analysis.B12.z).toBe('#,##0;(#,##0);"-"');
  expect(analysis.G13.s.border.bottom.style).toBe('thin');
  expect(analysis.A12.s.font.underline).toBe(true);
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
  expect(saved.Sheets['盘点结果比较分析'].A12.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  expect(saved.Sheets['盘亏分布'].C2.w).toBe('');
});


test.each([2025, 2026])('参考样式%s双层表头和当前年灰底无重叠合并', year => {
  const sheet = buildInventoryReportWorkbook(getInventoryReport(year)).Sheets['盘点结果比较分析'];
  expect(sheet['!merges']).toContainEqual({ s: { r: 8, c: 1 }, e: { r: 8, c: 2 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 8, c: 0 }, e: { r: 9, c: 0 } });
  expect(sheet['!merges']).toContainEqual({ s: { r: 15, c: 1 }, e: { r: 15, c: 3 } });
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
  const firstCurrent = rows.findIndex(row => row[0] === '台式机、显示器' && row[1] === year);
  expect(sheet[XLSX.utils.encode_cell({ r: firstCurrent, c: 1 })].s.fill.fgColor.rgb).toBe('D9D9D9');
  expect(sheet.B11.v).toBe(getInventoryReport(year).history.find(row => row.year === year).quantity);
});


test('ES报告只排除新媒体上海广州非视频资产，不按城市或名称片段误排其他公司', () => {
  const assets = [
    { 标签号: 'SH-WEB', 子公司: '115.新媒体-上海', 板块: '11.搜狐网-web' },
    { 标签号: 'GZ-WEB', companyCode: '116', plateCode: '12' },
    { 标签号: 'SH-VIDEO', 子公司: '新媒体上海分公司', 板块: '16.视频' },
    { 标签号: 'GZ-VIDEO', 子公司: '新媒体广州', 板块: '视频' },
    { 标签号: 'SH-OTHER', 子公司: '上海其他公司', 板块: '11.搜狐网-web' },
    { 标签号: 'GZ-OTHER', 子公司: '广州新媒体服务公司', 板块: '12.搜狐网-mobile' },
    { 标签号: 'BJ', 子公司: '114.新媒体', 板块: '11.搜狐网-web' },
  ];
  expect(filterInventoryReportAssets(assets).map(row => row['标签号'])).toEqual(['SH-VIDEO', 'GZ-VIDEO', 'SH-OTHER', 'GZ-OTHER', 'BJ']);
  expect(() => isAssetInInventoryReportScope({ 标签号: 'MISSING', 子公司: '新媒体广州分公司' })).toThrow('资产MISSING缺少板块');
  expect(isAssetInInventoryReportScope({ companyCode: 115, plateCode: 16 })).toBe(true);
});

test('明细页面与导出共享分公司范围，排除明细不进入小计', () => {
  const report = getInventoryReport(2026);
  const source = report.details[0];
  const excluded = { ...source, 标签号: 'EXCLUDED-SH', 子公司: '新媒体上海分公司', 板块: '11.搜狐网-web' };
  const included = { ...source, 标签号: 'INCLUDED-GZ-VIDEO', 子公司: '新媒体广州分公司', 板块: '16.视频' };
  const scoped = { ...report, details: [...report.details, excluded, included] };
  const rows = getInventoryDetailRows(scoped);
  expect(rows.filter(row => !row.summary).map(row => row['标签号'])).toEqual(['201132100282', 'NE3737', 'INCLUDED-GZ-VIDEO']);
  expect(rows.find(row => row.label === '资产盘亏合计')['数量']).toBe(3);
  const wb = buildInventoryReportWorkbook(scoped);
  const exported = XLSX.utils.sheet_to_json(wb.Sheets['盘亏资产明细及原因'], { header: 1 });
  expect(exported.some(row => row.includes('EXCLUDED-SH'))).toBe(false);
  expect(exported.some(row => row.includes('INCLUDED-GZ-VIDEO'))).toBe(true);
  expect(report.scope).toContain('新媒体上海分公司、新媒体广州分公司仅包含16.视频板块资产');
});


test('年度报告加载先过滤明细再按公司汇总，源汇总和原始明细不改写', () => {
  const details = inventoryReportActuals.detailsByYear[2026];
  const branchAsset = { ...details[0], 标签号: 'EXCLUDED-GZ', 子公司: '116.新媒体-广州', 板块: '17.Corporate' };
  details.push(branchAsset);
  try {
    const report = getInventoryReport(2026);
    expect(report.details.some(row => row['标签号'] === 'EXCLUDED-GZ')).toBe(false);
    expect(report.companyLoss.some(row => row.company === '116.新媒体-广州')).toBe(false);
    expect(report.companyLoss.find(row => row.company === '合计' && row.year === 2026).quantity).toBe(2);
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
