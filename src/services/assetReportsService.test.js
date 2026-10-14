import * as XLSX from 'xlsx';
import { assetReportRows } from '../mock/businessRulesMock';
import { buildReportWorkbook, formatReportValue, getReportDefinition, getReportOptions, queryReport, updateReportFilter } from './assetReportsService';
const sort = { key: '资产标签号', order: 'ascend' };
const permission = scopes => ({ userId: 'test-user', canView: true, canExport: true, allowedScopes: scopes });
const all = permission(['集团', '上海媒体', '广州媒体']);
const query = (id, filters = {}, access = all) => queryReport(id, filters, sort, access);
const exported = (id, filters = {}, selected = [], access = all) => {
  const book = buildReportWorkbook(id, filters, selected, sort, access);
  return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, defval: '' });
};
test.each(['集团', '上海媒体', '广州媒体'])('%s查询与导出仅含授权台账', scope => {
  const access = permission([scope]), rows = query('report-1-1', {}, access), data = exported('report-1-1', {}, [], access);
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(row => row.scope === scope)).toBe(true);
  expect(data.slice(1).map(row => row[data[0].indexOf('资产标签号')])).toEqual(rows.map(row => row.values['资产标签号']));
});
test('缺少授权立即失败，选中其他台账不能绕过权限', () => {
  expect(() => query('report-1-1', {}, { ...all, canView: false })).toThrow('无报表查看权限');
  expect(() => exported('report-1-1', {}, [], { ...all, canExport: false })).toThrow('无报表导出权限');
  const outside = assetReportRows['report-2-1'].find(row => row.scope === '上海媒体');
  expect(exported('report-2-1', {}, [outside.id], permission(['集团']))).toHaveLength(1);
});
test('卡片授权限制列表和导出', () => {
  const tag = assetReportRows['report-1-1'][0].filters['资产标签号'], access = { ...all, allowedAssetTags: [tag] };
  expect(query('report-1-1', {}, access).map(row => row.values['资产标签号'])).toEqual([tag]);
  expect(exported('report-1-1', {}, [], access)).toHaveLength(2);
  const definition = getReportDefinition('report-1-1'), field = definition.filters.find(item => item.label === '资产标签号');
  expect(getReportOptions(definition, field, {}, access).map(option => option.value)).toEqual([tag]);
});
test('缺类别编码明确报错，不用名称冒充编码排序', () => {
  ['report-1-1', 'report-2-1', 'report-5-1'].forEach(id => {
    expect(() => queryReport(id, {}, null, all)).toThrow('无法执行默认排序');
    expect(query(id).length).toBeGreaterThan(0);
  });
});
test('多选标签和公司取交集，分类父节点匹配小类', () => {
  const rows = assetReportRows['report-1-1'].filter(row => row.scope === '集团').slice(0, 2);
  expect(query('report-1-1', { '资产标签号': rows.map(row => row.filters['资产标签号']), '公司': [rows[0].filters['公司']] }).map(row => row.id)).toEqual(rows.map(row => row.id));
  expect(query('report-1-1', { '资产标签号': [rows[0].filters['资产标签号']], '公司': ['115'] })).toHaveLength(0);
  const major = rows[0].values['资产大类'];
  expect(query('report-1-1', { '资产类别': [`major:${major}`] }).every(row => row.values['资产大类'] === major)).toBe(true);
});
test('部门包含下级，邻接名称不能误命中', () => {
  const rows = query('report-1-1', { 'HR部门': ['演示组织.集团'] });
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(row => row.scope === '集团')).toBe(true);
  expect(query('report-1-1', { 'HR部门': ['演示组织.集团其他'] })).toHaveLength(0);
});
test('入职查询与展示日期一致，领用区间包含当天，逆序日期报错', () => {
  const rows = queryReport('report-4-1', { '入职日期从': '2026-09-02', '入职日期至': '2026-09-02' }, null, all);
  expect(rows).toHaveLength(3);
  expect(rows.every(row => row.values['入职日期'] === '2026-09-02' && row.values['数量'] === 1)).toBe(true);
  expect(query('report-4-1', { '领用日期从': '2026-10-02', '领用日期至': '2026-10-02' })).toHaveLength(3);
  expect(() => query('report-4-1', { '入职日期从': '2026-09-03', '入职日期至': '2026-09-02' })).toThrow('不能晚于');
});
test('延期可见，刷卡按员工确认方式判断', () => {
  const rows = query('report-4-1');
  expect(rows.some(row => row.values['领用状态'] === '延期' && row.values['是否领用'] === '否')).toBe(true);
  expect(rows.every(row => row.values['是否刷卡'] === (row.values['员工确认方式'] === '刷卡' ? '是' : '否'))).toBe(true);
});
test('City改变后仅保留合法Building', () => {
  const definition = getReportDefinition('report-1-1'), field = definition.filters.find(item => item.label === 'City');
  const next = updateReportFilter(definition, { Building: ['127.瑞安广场', '129753.搜狐媒体大厦'] }, field, ['37.上海市']);
  expect(next.Building).toEqual(['127.瑞安广场']);
  expect(getReportOptions(definition, definition.filters.find(item => item.label === 'Building'), next).every(item => item.value === '127.瑞安广场')).toBe(true);
});
test('新增仅已完成的三种入库，完成快照不可修改', () => {
  const rows = query('report-5-1');
  expect(new Set(rows.map(row => row.values['入库类型']))).toEqual(new Set(['新增入库', '采购接收', '自购入库']));
  expect(rows.every(row => row.documentStatus === '已完成' && row.kind === '资产')).toBe(true);
  expect(rows.some(row => row.id === 'add-pending')).toBe(false);
  expect(Object.isFrozen(rows[0].snapshot)).toBe(true);
  expect(() => { rows[0].snapshot['原值'] = 99999; }).toThrow();
});
test('事务单据类型和操作类型独立筛选，不适用的变更字段为空', () => {
  const rows = queryReport('report-3-1', { '单据类型': ['资产变更'], '事务类型': ['104'] }, null, all);
  expect(rows).toHaveLength(3);
  expect(rows.every(row => row.documentStatus === '已处理' && row.values['原序列号'] !== row.values['现序列号'] && row.values['原仓库'] === '' && row.values['现资产责任人'] === '')).toBe(true);
  expect(query('report-3-1').some(row => row.id === 'transaction-pending')).toBe(false);
  const data = exported('report-3-1', { '事务类型': ['104'] });
  expect(data[1][data[0].indexOf('事务执行人')]).toBe('213852.孙志强');
});
test('事务处理日期默认从新到旧', () => {
  const rows = queryReport('report-3-1', {}, null, all);
  expect(rows.every((row, index) => !index || rows[index - 1].sort.processedAt >= row.sort.processedAt)).toBe(true);
});
test.each(['report-6-1', 'report-6-2'])('%s拆行共享单头物料，保持来源数量和价格', id => {
  const rows = query(id, {}, permission(['集团'])), split = rows.find(row => row.grain === '资产配给单.物料.数量');
  const same = rows.filter(row => row.values['申请单号'] === split.values['申请单号']);
  expect(same).toHaveLength(2);
  expect(same[0].claimSource).toBe(same[1].claimSource);
  expect(same[0].values['物料编码']).toBe(same[1].values['物料编码']);
  expect(same[0].values['申请日期']).toBe(same[1].values['申请日期']);
  expect(same.every(row => row.values['申请数量'] === 2)).toBe(true);
  expect(rows.filter(row => row.grain === '资产配给单.物料')).toHaveLength(1);
  expect(same.every(row => row.values['预计采购金额'] === (id === 'report-6-2' ? 2000 : null) && row.values['实际采购金额'] === (id === 'report-6-2' ? 1130 : null))).toBe(true);
});
test('采购有PO未领用已拆行，库存领用标签优先于配给标签', () => {
  const purchased = query('report-6-2').filter(row => row.values['PO单号'] && !row.values['领用出库单号']);
  expect(purchased).toHaveLength(6);
  expect(purchased.every(row => row.values['完成时间'] === '' && row.values['领用数量'] === null)).toBe(true);
  const received = query('report-6-1').filter(row => row.tagSource === '领用单');
  expect(received).toHaveLength(6);
  expect(received.every(row => row.claimSource.claim.tags.includes(row.values['资产标签号']) && !row.claimSource.line.assignedTags.includes(row.values['资产标签号']) && row.values['领用数量'] === 2)).toBe(true);
});
test('耗材两种粒度齐全，普通耗材不生成卡片标签和EBS净值', () => {
  const rows = query('report-2-1');
  expect(new Set(rows.map(row => row.kind))).toEqual(new Set(['耗材', '低值耐用品']));
  expect(rows.filter(row => row.kind === '耗材').every(row => row.grain === '耗材领用单.物料' && !row.filters['资产标签号'] && !row.filters['耗材标签号'] && row.values['净值'] === null)).toBe(true);
  expect(rows.filter(row => row.kind === '低值耐用品').every(row => row.grain === '耗材卡片.耗材标签号' && row.values['耗材标签号'])).toBe(true);
  expect(exported('report-2-1', {}, [rows[0].id])).toHaveLength(2);
  const data = exported('report-2-1', {}, [rows[0].id]);
  expect(data[1][data[0].indexOf('库房')]).toBe(rows[0].exports['库房']);
  expect(data[1][data[0].indexOf('库房')]).not.toMatch(/^I\d+\./);
});
test('耗材结果标记独立取源，不以出库推算领用占用', () => {
  const rows = query('report-7-2');
  expect(rows.some(row => !row.values['领用出库单号'] && row.values['是否领用'] === '是')).toBe(true);
  expect(rows.every(row => row.values['是否领用'] === row.sourceFlags.received && row.values['是否占用'] === row.sourceFlags.occupied)).toBe(true);
});
test('报废仅资产，EBS原值不分摊，未定义价值导出为空，标签可文本查询', () => {
  const rows = queryReport('report-8-1', {}, null, all), data = exported('report-8-1');
  expect(rows.every(row => row.kind === '资产' && row.values['原值'] === row.values['EBS资产原值'])).toBe(true);
  expect(rows.every(row => row.values['原值'] === row.retirementSource.ebsOriginalValue && row.values['原值'] !== row.retirementSource.assetSystemOriginalValue)).toBe(true);
  data.slice(1).forEach(row => {
    expect(row[data[0].indexOf('报废原值')]).toBe('');
    expect(row[data[0].indexOf('报废净值')]).toBe('');
  });
  expect(query('report-8-1', { '资产标签号': 'retired-0' })).toHaveLength(1);
});
test('财务差异及升级金额可见，零和空保留各自含义', () => {
  const row = query('report-1-1').find(item => item.values['是否有差异'] === '是');
  expect(row.values['原值'] - row.values['EBS资产原值']).not.toBe(0);
  const data = exported('report-1-1', { '资产标签号': [row.values['资产标签号']] });
  expect(data[1][data[0].indexOf('升级金额')]).toBe('1,234.56');
  expect(formatReportValue(0, 'money')).toBe('0.00');
  expect(formatReportValue(null, 'money')).toBe('');
  expect(() => formatReportValue('错误金额', 'money')).toThrow();
});
