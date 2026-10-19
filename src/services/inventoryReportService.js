import * as XLSX from 'xlsx';
import { inventoryReportTemplate, inventoryReportActuals } from '../mock/businessRulesMock';

export const LOSS_CATEGORIES = ['台式机、显示器（PC）', '笔记本（NB）', '照摄像器材', '移动数码', '办公设备', '电话', '车辆'];
export const DETAIL_FIELDS = ['序号', '盘点状态', '资产大类', '资产小类', '资产说明', '数量', '原值', '报失当月资产净值', '是否已赔偿', '赔偿金额', '损失', '标签号', '购买日期', '责任人姓名', '责任人编号', '子公司', '一级部门', '说明'];
export const amount = value => value == null ? '-' : value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const accounting = value => value == null || value === 0 ? '-' : value < 0 ? `(${amount(-value)})` : amount(value);
export const percent = value => value == null ? '-' : `${(value * 100).toFixed(2)}%`;
export const quantity = value => value == null ? '-' : String(value);
export function getInventoryReport(year) {
  const selectedYear = Number(year);
  if (![inventoryReportTemplate.year, inventoryReportActuals.year].includes(selectedYear)) return null;
  const history = inventoryReportActuals.history.filter(row => row.year <= selectedYear).slice(-4);
  const current = history.find(row => row.year === selectedYear);
  const previous = history.find(row => row.year === selectedYear - 1);
  const previous2 = history.find(row => row.year === selectedYear - 2);
  const growth = (now, before) => before == null || before === 0 ? null : (now - before) / before;
  const indicators = [['资产数量（件）', 'quantity', 1], ['资产原值（万元）', 'original', 10000], ['资产净值（万元）', 'net', 10000]].map(([name, field, unit]) => {
    const rate = growth(current[field], previous?.[field]);
    const lastRate = previous2 ? growth(previous[field], previous2[field]) : null;
    return { name, total: current[field] / unit, change: previous ? (current[field] - previous[field]) / unit : null, rate, rateChange: rate == null || lastRate == null ? null : (rate - lastRate) * 100 };
  });
  const isTemplateYear = selectedYear === inventoryReportTemplate.year;
  return { ...inventoryReportTemplate, year: selectedYear, period: `${selectedYear - 1}年7月—${selectedYear}年7月`, history, indicators,
    distribution: isTemplateYear ? inventoryReportTemplate.distribution : [],
    companyLoss: isTemplateYear ? inventoryReportTemplate.companyLoss : [],
    details: isTemplateYear ? inventoryReportTemplate.details : [],
    detailsAreDemo: isTemplateYear, companyIsDemo: isTemplateYear, distributionIsTemplate: isTemplateYear,
  };
}
export function getInventoryReportSummary(report) {
  const current = report.history.find(row => row.year === report.year);
  return [
    { name: '全部盘点资产', quantity: current.quantity, quantityRate: 1, original: current.original, originalRate: 1, net: current.net, netRate: 1 },
    { name: '盘亏资产', quantity: current.lossQuantity, quantityRate: current.lossRate, original: current.lossOriginal, originalRate: current.lossOriginalRate, net: current.lossNet, netRate: current.lossNetRate },
    { name: '待查资产', quantity: null, quantityRate: null, original: null, originalRate: null, net: null, netRate: null },
  ];
}
export const historyPercent = value => value == null ? '-' : value === 0 ? '0%' : `${(value * 100).toFixed(3)}%`;
export function buildInventoryReportWorkbook(report) {
  const workbook = XLSX.utils.book_new();
  const add = (name, rows) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = Array.from({ length: Math.max(...rows.map(row => row.length)) }, () => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
    return sheet;
  };
  const analysis = [
    [`${report.year}年资产盘点情况汇总（ES管控资产）`],
    ['资产变化范围'],
    ['资产变化周期', report.period], ['资产盘点类别', report.scope],
    ['资产情况', '数量（件）', '数量占比', '原值（元）', '原值占比', '净值（元）', '净值占比'],
    ...getInventoryReportSummary(report).map(r => [r.name, r.quantity, r.quantityRate, r.original, r.originalRate, r.net, r.netRate]),
    [], ['四年盘点数据对比'],
    ['年份', '盘点总数量（件）', '盘点总原值（元）', '盘点总净值（元）', '盘亏数量（件）', '盘亏数量占比', '盘亏原值（元）', '盘亏原值占比', '盘亏净值（元）', '盘亏净值占比'],
    ...report.history.map(r => [r.year, r.quantity, r.original, r.net, r.lossQuantity, r.lossRate, r.lossOriginal, r.lossOriginalRate, r.lossNet, r.lossNetRate]),
    [], [`${report.year}年资产盘亏统计${report.detailsAreDemo ? '（演示数据）' : ''}`], ['资产类别', '盘点年份', '盘亏数量（件）', '盘亏原值（元）', '盘亏净值（元）', '备注'],
    ...getInventoryLossCategoryRows(report).map(row => [row.category, row.year, row.quantity, row.original, row.net, null]),
    [], [getIncrementTitle(report.year)], ['资产大类', '资产细类', '汇总'],
    ...getIncrementRows(report.year).map(r => [r.category, r.name, r.value]),
  ];
  const indicatorStart = analysis.length + 3;
  analysis.push([], ['年度增长指标'], ['指标', '当前总数', '年度增长量', '年度增长率', '增长率变化'], ...report.indicators.map(r => [r.name, r.total, r.change, r.rate, r.rateChange / 100]));
  const analysisSheet = add('盘点结果比较分析', analysis);
  const detailRows = getInventoryDetailRows(report);
  const details = add('盘亏资产明细及原因', [[`${report.year}年度资产盘点盘亏及待查统计（ES管控资产）`], report.detailsAreDemo ? ['演示数据'] : [], DETAIL_FIELDS,
    ...detailRows.map(row => DETAIL_FIELDS.map((field, index) => row.summary && index === 0 ? row.label : row[field] ?? null))]);
  details['!merges'] = detailRows.flatMap((row, index) => row.summary ? [{ s: { r: index + 3, c: 0 }, e: { r: index + 3, c: 4 } }] : []);
  // 分析表在Excel中跳转到对应明细分组，页面保持普通文字。
  analysisSheet.A7.l = { Target: "#'盘亏资产明细及原因'!A4", Tooltip: '查看盘亏明细' };
  const pendingStart = detailRows.findIndex(row => row.summary && row.label === '资产盘亏合计') + 1;
  analysisSheet.A8.l = { Target: `#'盘亏资产明细及原因'!A${pendingStart + 4}`, Tooltip: '查看待查明细' };
  const originalTotal = report.distribution.reduce((sum, row) => sum + row.original, 0);
  const distribution = add('资产类型分布', [[report.distributionIsTemplate ? '类别（模板数据）' : '类别', '数量（件）', '原值（万元）', '原值占比'], ...report.distribution.map(r => [r.category, r.quantity, r.original / 10000, originalTotal === 0 ? null : r.original / originalTotal])]);
  const company = add('盘亏分布', [[report.companyIsDemo ? '子公司（演示数据）' : '子公司', '年份', '笔记本', '主机', '显示器', '办公设备', '移动数码', '照摄像器材及配件', '车辆', '数量合计', '净值合计（元）'],
    ...report.companyLoss.map(r => [r.company, r.year, null, null, null, r.office, r.mobile, null, r.vehicle, r.quantity, r.net])]);
  // 金额和百分比按单元格类型设置，保持可计算的数字而非格式化文本。
  const formatCells = (sheet, rows, moneyCols, rateCols = []) => rows.forEach(row => {
    moneyCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = '#,##0.00'; });
    rateCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = '0.00%'; });
  });
  formatCells(analysisSheet, [5, 6, 7], [3, 5], [2, 4, 6]);
  const historyRows = report.history.map((_, index) => index + 11);
  formatCells(analysisSheet, historyRows, [2, 3, 6, 8]);
  historyRows.forEach(row => {
    [5, 7, 9].forEach(column => {
      const cell = analysisSheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell?.t === 'n') cell.z = '0.000%;-0.000%;"0%"';
    });
    const net = analysisSheet[XLSX.utils.encode_cell({ r: row, c: 8 })];
    if (net?.t === 'n') net.z = '#,##0.00;(#,##0.00);"-"';
  });
  formatCells(analysisSheet, [indicatorStart], [], [3, 4]);
  formatCells(analysisSheet, [indicatorStart + 1, indicatorStart + 2], [1, 2], [3, 4]);
  const categories = getInventoryLossCategoryRows(report);
  const increments = getIncrementRows(report.year);
  const categoryStart = 11 + report.history.length + 3;
  const incrementStart = categoryStart + categories.length + 3;
  categories.forEach((_, index) => [2, 3, 4].forEach(column => {
    const cell = analysisSheet[XLSX.utils.encode_cell({ r: categoryStart + index, c: column })];
    if (cell?.t === 'n') cell.z = '#,##0.00;(#,##0.00);"-"';
  }));
  const mergeGroups = (sheet, rows, key, startRow, canMerge) => {
    const spans = getGroupedRowSpans(rows, key, canMerge);
    sheet['!merges'] = [...(sheet['!merges'] || []), ...spans.flatMap((span, index) => span > 1 ? [{ s: { r: startRow + index, c: 0 }, e: { r: startRow + index + span - 1, c: 0 } }] : [])];
  };
  mergeGroups(analysisSheet, categories, 'category', categoryStart);
  mergeGroups(analysisSheet, increments, 'category', incrementStart, row => !['小计', '合计'].includes(row.name));
  analysisSheet['!merges'].push(...increments.flatMap((row, index) => ['小计', '合计'].includes(row.name) ? [{ s: { r: incrementStart + index, c: 0 }, e: { r: incrementStart + index, c: 1 } }] : []));
  increments.forEach((row, index) => {
    if (row.name === '小计') analysisSheet[XLSX.utils.encode_cell({ r: incrementStart + index, c: 0 })].v = row.category + '小计';
  });
  increments.forEach((_, index) => {
    const cell = analysisSheet[XLSX.utils.encode_cell({ r: incrementStart + index, c: 2 })];
    if (cell?.t === 'n') cell.z = '#,##0;-#,##0;"-"';
  });
  mergeGroups(company, report.companyLoss, 'company', 1);
  formatCells(distribution, report.distribution.map((_, i) => i + 1), [2], [3]);
  formatCells(company, report.companyLoss.map((_, i) => i + 1), [10]);
  formatCells(details, detailRows.map((_, i) => i + 3), [6, 7, 9, 10]);
  return workbook;
}
export function exportInventoryReport(report) {
  XLSX.writeFile(buildInventoryReportWorkbook(report), `${report.year}年度资产盘点报告-ES.xlsx`);
}
export function getIncrementRows(year = inventoryReportActuals.year) {
  if (Number(year) === inventoryReportActuals.year) return inventoryReportActuals.increments;
  return [
    ['台式机', 'PC-主机'], ['台式机', 'PC-显示器'], ['台式机', 'PC-配件'], ['台式机', '小计'],
    ['笔记本', '笔记本'], ['笔记本', '笔记本-配件'], ['笔记本', '小计'],
    ['办公设备', '办公设备'], ['办公设备', '移动数码'], ['办公设备', '照摄像器材'], ['办公设备', '小计'], ['车辆', '车辆'], ['电话', '电话'], ['合计', '合计'],
  ].map(([category, name], i) => ({ key: i, category, name, value: null }));
}

// 明细、分类小计和总计使用同一列结构；没有来源值时保持空值。
export function getInventoryDetailRows(report) {
  const numericFields = ['数量', '原值', '报失当月资产净值'];
  const total = (label, rows) => ({
    key: `total-${label}`, summary: true, label,
    ...Object.fromEntries(numericFields.map(field => [field, rows.length && rows.every(row => row[field] != null)
      ? rows.reduce((sum, row) => sum + row[field], 0) : null])),
  });
  const loss = report.details.filter(row => row['盘点状态'] === '盘亏');
  const pending = report.details.filter(row => row['盘点状态'] === '待查');
  const detail = rows => rows.map((row, index) => ({ ...row, 序号: index + 1, key: `detail-${row['盘点状态']}-${index}`, summary: false }));
  return [...detail(loss), total('资产盘亏合计', loss), ...detail(pending), total('资产待查合计', pending), total('总计', [...loss, ...pending])];
}

export function getInventoryLossCategoryRows(report) {
  const loss = report.details.filter(row => row['盘点状态'] === '盘亏');
  return LOSS_CATEGORIES.flatMap((category, index) => [report.year - 1, report.year].map(year => {
    const rows = loss.filter(row => row.reportCategory === category);
    const total = field => year !== report.year || !loss.length ? null
      : rows.every(row => row[field] != null) ? rows.reduce((sum, row) => sum + row[field], 0) : null;
    return { key: `${index}-${year}`, category, year, quantity: total('数量'), original: total('原值'), net: total('报失当月资产净值') };
  }));
}

export const getIncrementTitle = year => `${year}年资产变化情况概述：${year - 1}-${year}年盘点范围内各类资产增量情况`;

// 精确合并相邻同组，汇总行作为边界，不跨组或跨小计合并。
export function getGroupedRowSpans(rows, key, canMerge = () => true) {
  const spans = Array(rows.length).fill(0);
  let index = 0;
  while (index < rows.length) {
    let end = index + 1;
    if (canMerge(rows[index])) {
      while (end < rows.length && canMerge(rows[end]) && rows[end][key] === rows[index][key]) end += 1;
    }
    spans[index] = end - index;
    index = end;
  }
  return spans;
}

export function getInventoryHistoryChartRows(report) {
  return report.history.map(row => ({ ...row,
    originalMillion: row.original == null ? null : row.original / 1000000,
    netMillion: row.net == null ? null : row.net / 1000000,
    lossPercent: row.lossRate == null ? null : row.lossRate * 100,
  }));
}
