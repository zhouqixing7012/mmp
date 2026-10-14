import * as XLSX from 'xlsx';
import { assetReportRows } from '../mock/businessRulesMock';
import { buildReportWorkbook, formatReportValue, getReportDefinition, getReportOptions, matchesReportRow, queryReport, reportDefinitions, updateReportFilter } from './assetReportsService';
import { MAIN_MENU_ITEMS, ASSET_REPORT_MENU_ITEMS } from '../pages/yewurules/config/menuConfig';

const sheetRows = workbook => XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });
test('资产报表在资产盘点之后，八个入口十个独立页面', () => {
  const index = MAIN_MENU_ITEMS.findIndex(item => item.key === '资产盘点');
  expect(MAIN_MENU_ITEMS[index + 1].key).toBe('资产报表');
  expect(ASSET_REPORT_MENU_ITEMS).toHaveLength(8);
  expect(reportDefinitions).toHaveLength(10);
});
test.each([
  ['report-1-1',36,64,64], ['report-2-1',27,17,61], ['report-3-1',13,34,34],
  ['report-4-1',15,30,30], ['report-5-1',32,38,39], ['report-6-1',12,30,30],
  ['report-6-2',13,36,36], ['report-7-1',13,31,31], ['report-7-2',16,27,27], ['report-8-1',34,34,34],
])('%s保留完整字段并支持仅表头导出', (id, filters, columns, exports) => {
  const definition = getReportDefinition(id);
  expect(definition.filters).toHaveLength(filters);
  expect(definition.columns).toHaveLength(columns);
  expect(definition.exportColumns).toHaveLength(exports);
  const textField = definition.filters.find(field => field.type === 'text');
  const data = sheetRows(buildReportWorkbook(id, { [textField.label]: 'NO-MATCH-RECORD' }));
  expect(data).toHaveLength(1);
  expect(data[0]).toHaveLength(exports);
  expect(data[0]).not.toContain('序号');
});
test('标签包含和前缀分别匹配，主标签可匹配自身前缀', () => {
  const row = { filters: { '资产标签号': 'ABC123', '主资产标签号': 'PARENT' } };
  expect(matchesReportRow(getReportDefinition('report-1-1'), row, { '资产标签号': '123' })).toBe(true);
  expect(matchesReportRow(getReportDefinition('report-8-1'), row, { '资产标签号': '123' })).toBe(false);
  expect(matchesReportRow(getReportDefinition('report-8-1'), row, { '主资产标签号': 'ABC' })).toBe(true);
});
test('金额零值精确匹配，耗材原值范围零不筛选', () => {
  expect(matchesReportRow(getReportDefinition('report-1-1'), { filters: { '原值': 1 } }, { '原值': '0' })).toBe(false);
  expect(matchesReportRow(getReportDefinition('report-2-1'), { filters: { '原值': 1 } }, { '原值至': '0' })).toBe(true);
});
test('报废值为空，不补0或按数量分摊，导出排除印刷号', () => {
  const definition = getReportDefinition('report-8-1');
  expect(definition.exportColumns.map(field => field.label)).not.toContain('印刷号');
  const data = sheetRows(buildReportWorkbook(definition.id));
  expect(data.length).toBeGreaterThan(1);
  for (const row of data.slice(1)) {
    expect(row[data[0].indexOf('报废原值')]).toBe('');
    expect(row[data[0].indexOf('报废净值')]).toBe('');
  }
});
test('耗材选中导出只包含选中卡片，未选导出全查询结果', () => {
  const rows = queryReport('report-2-1');
  const data = sheetRows(buildReportWorkbook('report-2-1', {}, [rows[0].id]));
  expect(data).toHaveLength(2);
  expect(sheetRows(buildReportWorkbook('report-2-1'))).toHaveLength(rows.length + 1);
});
test('目录和快照类别可选且能匹配，仓库选项能匹配当前卡片', () => {
  for (const id of ['report-2-1', 'report-8-1']) {
    const definition = getReportDefinition(id), row = queryReport(id)[0];
    const category = definition.filters.find(field => field.type === 'tree');
    const options = getReportOptions(definition, category);
    expect(options.some(option => option.value === row.filters['资产类别'])).toBe(true);
    expect(queryReport(id, { [category.label]: [row.filters['资产类别']] }).some(item => item.id === row.id)).toBe(true);
    const warehouse = definition.filters.find(field => field.label === '仓库');
    expect(getReportOptions(definition, warehouse).some(option => option.value === row.filters['仓库'])).toBe(true);
  }
});
test('部门包含下级，新员工部门仅精确匹配', () => {
  const row = { filters: { 'HR部门': '总部.技术部' } };
  expect(matchesReportRow(getReportDefinition('report-1-1'), row, { 'HR部门': ['总部'] })).toBe(true);
  expect(matchesReportRow(getReportDefinition('report-4-1'), row, { 'HR部门': ['总部'] })).toBe(false);
});
test('新员工入职条件使用独立查询日期字段', () => {
  expect(queryReport('report-4-1', { '入职日期至': '2026-08-31' })).toHaveLength(3);
  expect(queryReport('report-4-1')[0].values['入职日期']).toBe('2026-09-01');
});
test('大类联动小类，清City保持Building', () => {
  const definition = getReportDefinition('report-1-1');
  const city = definition.filters.find(field => field.label === 'City');
  expect(updateReportFilter(definition, { Building: ['现有地点'] }, city, [])).toEqual({ City: [], Building: ['现有地点'] });
  const major = definition.filters.find(field => field.label === '资产大类');
  expect(updateReportFilter(definition, { '资产小类': ['不属于所选大类'] }, major, ['PC'])['资产小类']).toEqual([]);
});
test('错误日期和未定义的新增查询尽早报错', () => {
  expect(() => queryReport('report-1-1', { '采购日期从': '2026-10-02', '采购日期至': '2026-10-01' })).toThrow();
  expect(() => queryReport('report-5-1', { '折旧月数': '12' })).toThrow('尚未确认');
  expect(() => queryReport('report-5-1', { '资产状态': ['A','B'] })).toThrow('尚未确认');
});
test('统一采购导出弃领和出库号分别取本字段', () => {
  const row = assetReportRows['report-6-2'][6];
  const data = sheetRows(buildReportWorkbook('report-6-2', { '申请单号': row.values['申请单号'] }));
  expect(data[1][data[0].indexOf('是否弃领')]).toBe('否');
  expect(data[1][data[0].indexOf('领用出库单号')]).toBe('');
});
test('显示及导出保留金额零、空值和整数截断', () => {
  expect(formatReportValue(0,'money')).toBe('0.00');
  expect(formatReportValue(null,'money')).toBe('');
  expect(formatReportValue(1.9,'truncateInteger')).toBe('1');
});
