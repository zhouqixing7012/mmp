import * as XLSX from 'xlsx';
import { applicationQueryRows } from '../mock/businessRulesMock';
import { applicationDefinitions, applicationProgressRecords, buildApplicationWorkbook, getApplicationDefinition, queryApplications, removeApplicationDrafts } from './applicationQueryService';

const exported = (id, filters = {}, page) => {
  const book = buildApplicationWorkbook(id, filters, null, page);
  return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, defval: '' });
};
test.each(applicationDefinitions.map(definition => [definition.id]))('%s读取对应业务单据源且可查询', id => {
  expect(queryApplications(id).length).toBeGreaterThan(0);
  const field = getApplicationDefinition(id).filters.find(item => item.kind === 'text');
  expect(queryApplications(id, { [field.key]: 'NO-MATCH-RECORD' })).toHaveLength(0);
});
test('日期单端及全天范围和导出相同，逆序查询立即失败', () => {
  const row = queryApplications('return')[0], date = row.createdAt.slice(0, 10);
  const filtered = queryApplications('return', { createdAt: [date, date] });
  expect(filtered.length).toBeGreaterThan(0);
  expect(exported('return', { createdAt: [date, date] }).length).toBe(filtered.length + 1);
  expect(queryApplications('return', { createdAt: [date, null] }).length).toBeGreaterThan(0);
  expect(() => queryApplications('return', { createdAt: ['2026-10-20', '2026-10-01'] })).toThrow('开始日期不能晚于结束日期');
});
test('退库标签前缀匹配包含整单，列表业务日期和导出创建日期分别保留', () => {
  const row = queryApplications('return')[0], tag = row.filters.assetTag[0];
  expect(queryApplications('return', { assetTag: tag.slice(0, 4) }).some(item => item.id === row.id)).toBe(true);
  expect(queryApplications('return', { assetTag: tag.slice(1) }).some(item => item.id === row.id)).toBe(false);
  const data = exported('return');
  const index = data[0].indexOf('申请时间');
  expect(data[1][index]).toBe(row.values.createdAt);
});
test('退库批删只允许草稿，混选失败不产生部分删除', () => {
  const rows = queryApplications('return'), draft = rows.find(row => row.statusCode === '0'), other = rows.find(row => row.statusCode !== '0');
  expect(() => removeApplicationDrafts('return', [draft.id, other.id])).toThrow('只能删除草稿单据');
  expect(queryApplications('return').some(row => row.id === draft.id)).toBe(true);
  removeApplicationDrafts('return', [draft.id]);
  expect(queryApplications('return').some(row => row.id === draft.id)).toBe(false);
  expect(JSON.parse(sessionStorage.getItem('mmp-application-query-deletions-v1'))).toContain(draft.id);
  applicationQueryRows.find(row => row.id === draft.id).deleted = false;
  expect(queryApplications('return').some(row => row.id === draft.id)).toBe(false);
  sessionStorage.removeItem('mmp-application-query-deletions-v1');
  // 测试恢复的是测试对象标记，不执行业务删除或覆盖源数据。
  applicationQueryRows.find(row => row.id === draft.id).deleted = false;
});
test('未完成保留全部处理中单据，包括等待与无有效待办；全流程入口可达', () => {
  const rows = queryApplications('unfinished');
  expect(rows).toHaveLength(17);
  expect(rows.every(row => row.statusCode === '3')).toBe(true);
  expect(rows.find(row => row.id.endsWith('013')).values.node).toContain('等待');
  expect(rows.find(row => row.id.endsWith('014')).values.node).toBe('');
  expect(rows.filter(row => ['REC', 'ED'].includes(row.filters.type)).every(row => row.allowProgress)).toBe(true);
  expect(exported('unfinished', {}, { current: 2, pageSize: 10 })).toHaveLength(8);
  expect(exported('unfinished')).toHaveLength(18);
});
test('进度排序保留多人及历史办理，仅去重同一记录ID', () => {
  const rows = applicationProgressRecords([
    { id: 'last', sequence: '10', time: '', node: '等待' },
    { id: 'second', sequence: '2', time: '2026-10-15' },
    { id: 'first', sequence: '2', time: '2026-10-14' },
    { id: 'empty', sequence: '', time: '' },
  ]);
  expect(rows.map(row => row.id)).toEqual(['empty', 'first', 'second', 'last']);
});
test('资产和耗材预计金额按原申请数量，领用为空；未定义导出入口不得导出', () => {
  for (const id of ['asset', 'consumable']) {
    const rows = queryApplications(id), purchase = rows.find(row => row.filters.subType === 'PURCHASE');
    expect(purchase.values.estimatedAmount).not.toBeNull();
    expect(rows.find(row => row.filters.subType === 'USE').values.estimatedAmount).toBeNull();
  }
  expect(() => buildApplicationWorkbook('newEmployee')).toThrow('此查询未定义导出');
  expect(() => queryApplications('newEmployee', { plate: '17' })).toThrow('板块提交字段');
});
