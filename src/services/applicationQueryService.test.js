import * as XLSX from 'xlsx';
import { applicationDefinitions, applicationProgressRecords, buildApplicationWorkbook, getApplicationDefinition, getApplicationOptions, queryApplications, removeApplicationDrafts } from './applicationQueryService';

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
  const row = queryApplications('return')[0], date = row.values.applyTime.slice(0, 10);
  const filtered = queryApplications('return', { applyTime: [date, date] });
  expect(filtered.length).toBeGreaterThan(0);
  expect(exported('return', { applyTime: [date, date] }).length).toBe(filtered.length + 1);
  expect(queryApplications('return', { applyTime: [date, null] }).length).toBeGreaterThan(0);
  expect(() => queryApplications('return', { applyTime: ['2026-10-20', '2026-10-01'] })).toThrow('开始日期不能晚于结束日期');
});
test('退库标签前缀匹配包含整单，导出与详情使用同一申请时间', () => {
  const row = queryApplications('return')[0], tag = row.filters.assetTag[0];
  expect(queryApplications('return', { assetTag: tag.slice(0, 4) }).some(item => item.id === row.id)).toBe(true);
  expect(queryApplications('return', { assetTag: tag.slice(1) }).some(item => item.id === row.id)).toBe(false);
  const data = exported('return');
  const index = data[0].indexOf('申请时间');
  expect(data[1][index]).toBe(row.values.applyTime.slice(0, 10));
  expect(Object.fromEntries(row.head)['申请时间']).toBe(data[1][index]);
});
test('申请状态遵循PRD名称，筛选与导出使用一致状态', () => {
  for (const id of ['return', 'borrow', 'asset', 'consumable', 'newEmployee']) {
    const definition = getApplicationDefinition(id);
    const field = definition.filters.find(item => item.label === '单据状态');
    expect(field.key).toBe('status');
    expect(getApplicationOptions(id, field).map(item => item.label)).toEqual(['处理中', '已完成', '已驳回']);
    const rows = queryApplications(id, { status: '处理中' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.values.status === '处理中')).toBe(true);
    expect(queryApplications(id, { status: '已驳回' })).toHaveLength(0);
    if (definition.actions.export) {
      const sheet = exported(id, { status: '处理中' });
      expect(sheet.length).toBeGreaterThan(1);
      const statusColumn = sheet[0].indexOf('单据状态');
      if (statusColumn >= 0) expect(sheet.slice(1).every(row => row[statusColumn] === '处理中')).toBe(true);
    }
  }
  const employee = queryApplications('newEmployee')[0];
  expect(employee.head['单据状态']).toBe('处理中');
  expect(employee.head['资产配置']).toBe('资产配置示例（演示）');
  const configuration = getApplicationDefinition('newEmployee').filters.find(field => field.key === 'configuration');
  expect(getApplicationOptions('newEmployee', configuration)).toContainEqual(
    expect.objectContaining({ value: employee.filters.configuration, label: '资产配置示例（演示）' }),
  );
});
test('退库查询不提供删除，调用删除也不改变申请或业务锁', () => {
  const before = queryApplications('return');
  const snapshot = JSON.stringify(before);
  expect(getApplicationDefinition('return').actions.remove).toBeUndefined();
  expect(() => removeApplicationDrafts('return', [before[0].id])).toThrow('此查询不支持删除');
  expect(JSON.stringify(queryApplications('return'))).toBe(snapshot);
  expect(sessionStorage.getItem('mmp-application-query-deletions-v1')).toBeNull();
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
  const employee = queryApplications('newEmployee')[0];
  const filters = { plate: employee.filters.plate, configuration: employee.filters.configuration, status: employee.values.status };
  expect(queryApplications('newEmployee', filters).map(row => row.id)).toContain(employee.id);
  for (const key of Object.keys(filters)) {
    expect(queryApplications('newEmployee', { ...filters, [key]: 'NO-MATCH' })).toHaveLength(0);
  }
});

// 创建时间刻意与申请时间不同，防止同值样本掩盖回退到创建时间的问题。
test('退库筛选排序和Excel使用原申请时间，不被独立创建时间影响', () => {
  const rows = queryApplications('return');
  const row = rows[rows.length - 1], date = row.values.applyTime.slice(0, 10);
  const before = { createdAt: row.createdAt, value: row.values.createdAt, filter: row.filters.createdAt };
  try {
    row.createdAt = '2099-01-01 09:00:00';
    row.values.createdAt = row.createdAt;
    row.filters.createdAt = row.createdAt;
    const matched = queryApplications('return', { applyTime: [date, date] });
    expect(matched.map(item => item.id)).toContain(row.id);
    expect(queryApplications('return', { applyTime: ['2099-01-01', '2099-01-01'] })).toHaveLength(0);
    expect(queryApplications('return')[0].id).toBe(rows[0].id);
    const data = exported('return', { applicationNo: row.values.applicationNo });
    expect(data[1][data[0].indexOf('申请时间')]).toBe(date);
    const definition = getApplicationDefinition('return');
    expect(definition.sortKey).toBe('applyTime');
    expect(definition.columns.find(column => column.label === '申请时间').key).toBe('applyTime');
    expect(Object.fromEntries(row.head)['申请时间']).toBe(date);
  } finally {
    row.createdAt = before.createdAt;
    row.values.createdAt = before.value;
    row.filters.createdAt = before.filter;
  }
});
