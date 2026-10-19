import * as XLSX from 'xlsx';
import { inventoryReportTemplate } from '../mock/businessRulesMock';

export const LOSS_CATEGORIES = ['台式机、显示器（PC）', '笔记本（NB）', '照摄像器材', '移动数码', '办公设备', '电话', '车辆'];
export const DETAIL_FIELDS = ['序号', '盘点状态', '资产大类', '资产小类', '资产说明', '数量', '原值', '报失当月资产净值', '是否已赔偿', '赔偿金额', '损失', '标签号', '启用日期', '责任人姓名', '责任人编号', '子公司', '一级部门', '说明', '备注'];
export const amount = value => value == null ? '-' : value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const percent = value => value == null ? '-' : `${(value * 100).toFixed(2)}%`;
export const quantity = value => value == null ? '-' : String(value);
export function getInventoryReport(year) {
  return Number(year) === inventoryReportTemplate.year ? inventoryReportTemplate : null;
}
export function getInventoryReportSummary(report) {
  const current = report.history.find(row => row.year === report.year);
  return [
    { name: '全部盘点资产', quantity: current.quantity, quantityRate: 1, original: current.original, originalRate: 1, net: current.net, netRate: 1 },
    { name: '盘亏资产', quantity: current.lossQuantity, quantityRate: current.lossQuantity / current.quantity, original: null, originalRate: null, net: null, netRate: null },
    { name: '待查资产', quantity: null, quantityRate: null, original: null, originalRate: null, net: null, netRate: null },
  ];
}
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
    ['数据性质', '用户附件PPT模板示例，非在线项目盘点结果；空值表示未提供'],
    ['资产变化周期', report.period], ['资产盘点类别', report.scope],
    ['资产情况', '资产管控方', '数量（件）', '数量占比', '原值（元）', '原值占比', '净值（元）', '净值占比'],
    ...getInventoryReportSummary(report).map(r => [r.name, 'ES', r.quantity, r.quantityRate, r.original, r.originalRate, r.net, r.netRate]),
    [], ['四年盘点数据对比'],
    ['年份', '资产管控方', '盘点总数量（件）', '盘点总原值（元）', '盘点总净值（元）', '盘亏数量（件）', '盘亏数量占比', '盘亏原值（元）', '盘亏原值占比', '盘亏净值（元）', '盘亏净值占比'],
    ...report.history.map(r => [r.year, 'ES', r.quantity, r.original, r.net, r.lossQuantity, r.lossRate, null, null, null, null]),
    [], ['资产盘亏统计'], ['资产类别', '资产管控方', '盘点年份', '盘亏数量（件）', '盘亏原值（元）', '盘亏净值（元）', '备注'],
    ...LOSS_CATEGORIES.flatMap(c => [report.year - 1, report.year].map(y => [c, 'ES', y, null, null, null, null])),
    [], ['资产变化情况概述'], ['资产大类', '资产管控方', '资产细类', '增量（件）'],
    ...getIncrementRows().map(r => [r.category, 'ES', r.name, null]),
  ];
  const indicatorStart = analysis.length + 3;
  analysis.push([], ['年度增长指标'], ['指标', '当前总数', '年度增长量', '年度增长率', '增长率变化（百分点）'], ...report.indicators.map(r => [r.name, r.total, r.change, r.rate, r.rateChange]));
  const analysisSheet = add('盘点结果比较分析', analysis);
  const detailRows = getInventoryDetailRows(report);
  const details = add('盘亏资产明细及原因', [[`${report.year}年度资产盘点盘亏及待查统计（ES管控资产）`], ['附件未提供实际明细，以下小计为空'], DETAIL_FIELDS,
    ...detailRows.map(row => DETAIL_FIELDS.map((field, index) => row.summary && index === 0 ? row.label : row[field] ?? null))]);
  details['!merges'] = detailRows.flatMap((row, index) => row.summary ? [{ s: { r: index + 3, c: 0 }, e: { r: index + 3, c: 4 } }] : []);
  const originalTotal = report.distribution.reduce((sum, row) => sum + row.original, 0);
  const distribution = add('资产类型分布', [['类别', '数量（件）', '原值（元）', '原值占比'], ...report.distribution.map(r => [r.category, r.quantity, r.original, originalTotal === 0 ? null : r.original / originalTotal])]);
  const company = add('盘亏分布', [['子公司', '年份', '笔记本', '主机', '显示器', '办公设备', '移动数码', '照摄像器材及配件', '车辆', '数量合计', '净值合计（元）'],
    ...report.companyLoss.map(r => [r.company, r.year, null, null, null, r.office, r.mobile, null, r.vehicle, r.quantity, r.net])]);
  // 金额和百分比按单元格类型设置，保持可计算的数字而非格式化文本。
  const formatCells = (sheet, rows, moneyCols, rateCols = []) => rows.forEach(row => {
    moneyCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = '#,##0.00'; });
    rateCols.forEach(col => { const c = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (c?.t === 'n') c.z = '0.00%'; });
  });
  formatCells(analysisSheet, [5, 6, 7], [4, 6], [3, 5, 7]);
  formatCells(analysisSheet, [11, 12, 13, 14], [3, 4, 7, 9], [6, 8, 10]);
  [11, 12, 13, 14].forEach(row => {
    const cell = analysisSheet[XLSX.utils.encode_cell({ r: row, c: 6 })];
    if (cell?.t === 'n') cell.z = '0.000%';
  });
  formatCells(analysisSheet, [indicatorStart], [4], [3]);
  formatCells(analysisSheet, [indicatorStart + 1, indicatorStart + 2], [1, 2, 4], [3]);
  formatCells(distribution, report.distribution.map((_, i) => i + 1), [2], [3]);
  formatCells(company, report.companyLoss.map((_, i) => i + 1), [10]);
  formatCells(details, detailRows.map((_, i) => i + 3), [6, 7, 9, 10]);
  return workbook;
}
export function exportInventoryReport(report) {
  XLSX.writeFile(buildInventoryReportWorkbook(report), `${report.year}年度资产盘点报告-ES模板示例.xlsx`);
}
export function getIncrementRows() {
  return [
    ['台式机', 'PC-主机'], ['台式机', 'PC-显示器'], ['台式机', 'PC-配件'], ['台式机', '小计'],
    ['笔记本', '笔记本'], ['笔记本', '笔记本-配件'], ['笔记本', '小计'],
    ['办公设备', '办公设备'], ['办公设备', '移动数码'], ['办公设备', '照摄像器材'], ['办公设备', '小计'], ['车辆', '车辆'], ['合计', '合计'],
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
  const detail = rows => rows.map((row, index) => ({ ...row, key: `detail-${row['盘点状态']}-${index}`, summary: false }));
  return [...detail(loss), total('资产盘亏合计', loss), ...detail(pending), total('资产待查合计', pending), total('总计', [...loss, ...pending])];
}
