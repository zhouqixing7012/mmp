import * as XLSX from 'xlsx-js-style';
import { downloadInventoryReportFile } from './inventoryReportFile';
import { styleInventoryReportWorkbook, positionInventoryAnalysisSheet } from './inventoryReportWorkbookStyles';
import { inventoryReportTemplate, inventoryReportActuals } from '../mock/businessRulesMock';
import { mapInventoryReportAsset, summarizeInventoryReportCategory } from './inventoryReportClassification';
import { INVENTORY_REPORT_FORMATS as formats } from './inventoryReportFormats';
import { withInventoryReportQuantityUnits } from './inventoryReportUnits';
export { amount, accountingAmount, quantity, integer, accounting, historyPercent, percent, summaryPercent, companyQuantity, companyAmount } from './inventoryReportFormats';

export const LOSS_CATEGORIES = ['台式机、显示器', '笔记本', '照摄像器材', '移动数码', '办公设备', '车辆', '电话'];
export const DETAIL_FIELDS = ['序号', '盘点状态', '资产大类', '资产小类', '资产说明', '数量', '原值', '报失当月资产净值', '是否已赔偿', '赔偿金额', '损失', '标签号', '购买日期', '责任人姓名', '责任人编号', '子公司', '一级部门', '说明'];
// 待查净值仅认报告当年六月快照，不以报失月份或当前月份替代。
export function normalizeInventoryReportDetail(row, year) {
  const month = `${year}-06`;
  const net = row.netValuesByMonth?.[month] ?? (row.netValueMonth === month ? row['报失当月资产净值'] : null);
  return { ...row, ...(row['盘点状态'] === '待查' ? { 报失当月资产净值: net } : {}), 赔偿金额: null, 损失: null };
}

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
  const hasActualDetails = Object.prototype.hasOwnProperty.call(inventoryReportActuals.detailsByYear, selectedYear);
  const details = (hasActualDetails ? inventoryReportActuals.detailsByYear[selectedYear] : isTemplateYear ? inventoryReportTemplate.details : []).map(row => normalizeInventoryReportDetail(mapInventoryReportAsset(row), selectedYear));
  return { ...inventoryReportTemplate, scope: inventoryReportTemplate.scope, year: selectedYear, period: `${selectedYear - 1}年7月—${selectedYear}年7月`, history, indicators,
    distribution: withInventoryReportQuantityUnits(isTemplateYear ? inventoryReportTemplate.distribution : inventoryReportTemplate.demoDistribution),
    companyLoss: hasActualDetails ? getActualCompanyLoss(details, selectedYear) : inventoryReportActuals.companyLoss.filter(row => [selectedYear - 1, selectedYear].includes(row.year)),
    details, hasActualDetails,
    detailsAreDemo: isTemplateYear && !hasActualDetails, companyIsDemo: false, distributionIsTemplate: isTemplateYear, distributionIsDemo: !isTemplateYear,
  };
}
export function getInventoryReportSummary(report) {
  const current = report.history.find(row => row.year === report.year);
  return [
    { name: '全部盘点资产', quantity: current.quantity, quantityRate: 1, original: current.original, originalRate: 1, net: current.net, netRate: 1 },
    { name: '盘亏资产', quantity: current.lossQuantity, quantityRate: current.lossRate, original: current.lossOriginal, originalRate: current.lossOriginalRate, net: current.lossNet, netRate: current.lossNetRate },
    report.hasActualDetails ? getActualPendingSummary(report, current) : { name: '待查资产', quantity: null, quantityRate: null, original: null, originalRate: null, net: null, netRate: null },
  ];
}
export function buildInventoryReportWorkbook(report) {
  const workbook = XLSX.utils.book_new();
  workbook.Custprops = { demoDataSources: [report.detailsAreDemo && 'details', report.distributionIsDemo && 'distribution', report.companyIsDemo && 'companyLoss'].filter(Boolean).join(',') };
  const add = (name, rows) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = Array.from({ length: Math.max(...rows.map(row => row.length)) }, () => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
    return sheet;
  };
  const current = report.history.find(row => row.year === report.year);
  const categories = getInventoryLossCategoryRows(report);
  const increments = getIncrementRows(report.year);
  const summaryStart = 10;
  const historyStart = 18;
  const analysis = [
    [`${report.year}年资产盘点情况汇总（ES管控资产）`], [],
    ['一、资产变化范围：'], ['资产变化周期', report.period], ['资产盘点类别', report.scope], [],
    ['二、盘点情况数据及分析：'],
    [`1. ${report.year}年资产盘点情况汇总：盘亏资产${current.lossQuantity}件，盘亏资产净值${current.lossNet.toLocaleString('zh-CN')}元。`],
    ['资产情况', '数量', null, '原值', null, `净值（截至${report.year}年6月）`],
    [null, '数量（件）', '在全部盘点资产中占比', '金额（元）', '在全部盘点资产中占比', '金额（元）', '在全部盘点资产中占比'],
    ...getInventoryReportSummary(report).map(r => [r.name, r.quantity, r.quantityRate, r.original, r.originalRate, r.net, r.netRate]),
    [], [], ['2. 四年盘点数据对比：'],
    ['年份', '全部盘点资产情况', null, null, '盘亏数量情况', null, '盘亏原值情况', null, '盘亏净值情况'],
    [null, '盘点总数量（件）', '盘点总原值（元）', '盘点总净值（元）', '数量（件）', '在全部盘点资产中占比', '金额（元）', '在全部盘点资产中占比', '金额（元）', '在全部盘点资产中占比'],
    ...report.history.map(r => [r.year, r.quantity, r.original, r.net, r.lossQuantity, r.lossRate, r.lossOriginal, r.lossOriginalRate, r.lossNet, r.lossNetRate]),
    [], [`3. ${report.year}年资产盘亏统计：`], ['资产类别', '盘点年份', '盘亏资产数量（件）', '盘亏资产原值（元）', '盘亏资产净值（元）', '备注'],
  ];
  const categoryStart = analysis.length;
  analysis.push(...categories.map(row => [row.category, row.year, row.quantity, row.original, row.net, null]),
    [], ['三、' + getIncrementTitle(report.year)], ['资产大类', '资产细类', '汇总', '备注']);
  const incrementStart = analysis.length;
  analysis.push(...increments.map(r => [r.category, r.name, r.value, '']), [], ['年度增长指标'], ['指标', '当前总数', '年度增长量', '年度增长率', '增长率变化']);
  const indicatorStart = analysis.length;
  analysis.push(...report.indicators.map(r => [r.name, r.total, r.change, r.rate, r.rateChange == null ? null : r.rateChange / 100]));
  const analysisSheet = add('盘点结果比较分析', analysis);
  const detailRows = getInventoryDetailRows(report);
  const details = add('盘亏资产明细及原因', [[`${report.year}年度资产盘点盘亏及待查统计（ES管控资产）`], [], DETAIL_FIELDS,
    ...detailRows.map(row => DETAIL_FIELDS.map((field, index) => row.summary && index === 0 ? row.label : row[field] ?? null))]);
  details['!merges'] = detailRows.flatMap((row, index) => row.summary ? [{ s: { r: index + 3, c: 0 }, e: { r: index + 3, c: 4 } }] : []);
  // 分析表在Excel中跳转到对应明细分组，页面保持普通文字。
  analysisSheet[XLSX.utils.encode_cell({ r: summaryStart + 1, c: 0 })].l = { Target: "#'盘亏资产明细及原因'!A4", Tooltip: '查看盘亏明细' };
  const pendingStart = detailRows.findIndex(row => row.summary && row.label === '资产盘亏合计') + 1;
  analysisSheet[XLSX.utils.encode_cell({ r: summaryStart + 2, c: 0 })].l = { Target: `#'盘亏资产明细及原因'!A${pendingStart + 4}`, Tooltip: '查看待查明细' };
  const originalTotal = report.distribution.reduce((sum, row) => sum + row.original, 0);
  const distribution = add('资产类型分布', [[report.distributionIsTemplate ? '类别（模板数据）' : '类别', '数量', '原值（万元）', '原值占比'], ...report.distribution.map(r => [r.category, r.quantity, r.original / 10000, originalTotal === 0 ? null : r.original / originalTotal])]);
  const company = add('盘亏分布', [['子公司', '年份', '笔记本', '主机', '显示器', '办公设备', '移动数码', '照摄像器材及配件', '车辆', '数量合计', '净值合计（元）'],
    ...report.companyLoss.map(r => [r.company, r.year, r.notebook, r.desktop, r.display, r.office, r.mobile, r.camera, r.vehicle, r.quantity, r.net])]);
  // 金额和百分比按单元格类型设置，保持可计算的数字而非格式化文本。
  const formatCells = (sheet, rows, moneyCols, rateCols = []) => rows.forEach(row => {
    moneyCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = formats.decimal; });
    rateCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = formats.percentTwo; });
  });
  formatCells(analysisSheet, [summaryStart, summaryStart + 1, summaryStart + 2], [3, 5], [2, 4, 6]);
  const historyRows = report.history.map((_, index) => index + historyStart);
  formatCells(analysisSheet, historyRows, [2, 3, 6, 8]);
  historyRows.forEach(row => {
    [5, 7, 9].forEach(column => {
      const cell = analysisSheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell?.t === 'n') cell.z = formats.percentThree;
    });
    const net = analysisSheet[XLSX.utils.encode_cell({ r: row, c: 8 })];
    if (net?.t === 'n') net.z = formats.accountingInteger;
  });
  formatCells(analysisSheet, [indicatorStart, indicatorStart + 1, indicatorStart + 2], [], [3, 4]);
  [indicatorStart, indicatorStart + 1, indicatorStart + 2].forEach(row => [1, 2].forEach(col => {
    const cell = analysisSheet[XLSX.utils.encode_cell({ r: row, c: col })];
    if (cell?.t === 'n') cell.z = formats.integerWithZero;
  }));
  categories.forEach((_, index) => [2, 3, 4].forEach(column => {
    const cell = analysisSheet[XLSX.utils.encode_cell({ r: categoryStart + index, c: column })];
    if (cell?.t === 'n') cell.z = formats.accountingInteger;
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
    if (cell?.t === 'n') cell.z = formats.integer;
  });
  mergeGroups(company, report.companyLoss, 'company', 1);
  report.distribution.forEach((_, index) => {
    const cell = distribution[XLSX.utils.encode_cell({ r: index + 1, c: 1 })];
    if (cell?.t === 'n') cell.z = formats.integerWithZero;
    const original = distribution[XLSX.utils.encode_cell({ r: index + 1, c: 2 })];
    if (original?.t === 'n') original.z = formats.integerWithZero;
    const originalRate = distribution[XLSX.utils.encode_cell({ r: index + 1, c: 3 })];
    if (originalRate?.t === 'n') originalRate.z = formats.fullPercent;
  });
  // 公司分布的0值留白，数字保留在单元格中用于计算。
  report.companyLoss.forEach((_, index) => {
    for (let column = 2; column <= 10; column += 1) {
      const cell = company[XLSX.utils.encode_cell({ r: index + 1, c: column })];
      if (cell?.t === 'n') cell.z = formats.companyInteger;
    }
  });
  formatCells(details, detailRows.map((_, i) => i + 3), [6, 7, 9, 10]);
  detailRows.forEach((_, index) => [5, 6, 7].forEach(column => {
    const cell = details[XLSX.utils.encode_cell({ r: index + 3, c: column })];
    if (cell?.t === 'n') cell.z = column === 5 ? formats.integerWithZero : formats.accountingDecimal;
  }));
  detailRows.forEach((row, index) => {
    if (!row.summary) return;
    [5, 6, 7].forEach(column => {
      const cell = details[XLSX.utils.encode_cell({ r: index + 3, c: column })];
      if (cell?.t === 'n') cell.z = column === 5 ? formats.integer : formats.accountingDecimal;
    });
  });
  styleInventoryReportWorkbook(workbook, { summaryStart, historyStart, historyLength: report.history.length, categoryStart, categoryCount: categories.length, incrementStart, increments, indicatorStart, detailRows, detailsAreDemo: report.detailsAreDemo, companyRows: report.companyLoss });
  positionInventoryAnalysisSheet(workbook);
  return workbook;
}
export function exportInventoryReport(report) {
  downloadInventoryReportFile(buildInventoryReportWorkbook(report), `${report.year}年度资产盘点报告-ES.xlsx`);
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
    ...Object.fromEntries(numericFields.map(field => [field, !rows.length ? (report.hasActualDetails ? 0 : null) : rows.every(row => row[field] != null)
      ? rows.reduce((sum, row) => sum + row[field], 0) : null])),
  });
  const normalized = report.details.map(row => normalizeInventoryReportDetail(row, report.year));
  const loss = normalized.filter(row => row['盘点状态'] === '盘亏');
  const pending = normalized.filter(row => row['盘点状态'] === '待查');
  const detail = rows => rows.map((source, index) => ({ ...source, 序号: index + 1, key: `detail-${source['盘点状态']}-${index}`, summary: false }));
  return [...detail(loss), total('资产盘亏合计', loss), ...detail(pending), total('资产待查合计', pending), total('总计', [...loss, ...pending])];
}

export function getInventoryLossCategoryRows(report) {
  return LOSS_CATEGORIES.flatMap((category, index) => [report.year - 1, report.year].map(year => {
    const supplied = inventoryReportActuals.categoryLoss.find(row => row.category === category && row.year === year);
    const entry = supplied || (report.hasActualDetails && year === report.year
      ? summarizeInventoryReportCategory(report.details.filter(row => row['盘点状态'] === '盘亏'), category) : null);
    return { key: `${index}-${year}`, category, year, quantity: entry ? entry.quantity : null, original: entry ? entry.original : null, net: entry ? entry.net : null };
  }));
}

// 当前年度由完整明细汇总；上一年度仅使用同名公司真实统计，不猜测合并公司对应关系。
function getActualCompanyLoss(details, year) {
  const loss = details.filter(row => row['盘点状态'] === '盘亏').map(mapInventoryReportAsset);
  const companies = [...new Set(loss.map(row => row['子公司']))];
  const keys = { 笔记本: 'notebook', 主机: 'desktop', 显示器: 'display', 办公设备: 'office', 移动数码: 'mobile', 照摄像器材: 'camera', 车辆: 'vehicle' };
  const summarize = rows => ({
    quantity: rows.reduce((sum, row) => sum + row['数量'], 0),
    net: rows.reduce((sum, row) => sum + row['报失当月资产净值'], 0),
    ...Object.fromEntries(Object.entries(keys).map(([category, key]) => [key, rows.filter(row => row.reportCompanyCategory === category).reduce((sum, row) => sum + row['数量'], 0)])),
  });
  const previous = company => inventoryReportActuals.companyLoss.find(row => row.company === company && row.year === year - 1) || { company, year: year - 1 };
  return [...companies.flatMap(company => [previous(company), { company, year, ...summarize(loss.filter(row => row['子公司'] === company)) }]),
    previous('合计'), { company: '合计', year, ...summarize(loss) }];
}
function getActualPendingSummary(report, current) {
  const rows = report.details.filter(row => row['盘点状态'] === '待查').map(row => normalizeInventoryReportDetail(row, report.year));
  const sum = field => rows.every(row => row[field] != null) ? rows.reduce((total, row) => total + row[field], 0) : null;
  const quantity = sum('数量'); const original = sum('原值'); const net = sum('报失当月资产净值');
  return { name: '待查资产', quantity, original, net, quantityRate: quantity == null || !current.quantity ? null : quantity / current.quantity, originalRate: original == null || !current.original ? null : original / current.original, netRate: net == null || !current.net ? null : net / current.net };
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
