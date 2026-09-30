import { buildSupplementalProgress, serializeProgressExport } from './inventoryProgressModel';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';

 test('库房公共样本可追溯已有资产且汇总与详情一致', () => {
  const { details, summary } = buildSupplementalProgress({ endDate: '2026-10-02' }, ['库房', '公共'], undefined, new Date(2026, 9, 1));
  expect(details).toHaveLength(2);
  expect(details.every((row) => row.department === '虚拟组织')).toBe(true);
  expect(details.flatMap((row) => row.assetTags)).toEqual(expect.arrayContaining(['1141300083-P', '3102200966']));
  summary.forEach((row) => { const children = details.filter((detail) => detail.range === row.range); expect(row.expected).toBe(children.reduce((total, detail) => total + detail.expected, 0)); expect(row.uncounted).toBe(row.expected - row.counted - row.lost); });
  expect(details.every((row) => row.remainingDays === 1)).toBe(true);
 });
 test('范围过滤和关闭期间不产生负剩余天数', () => {
  const { details, summary } = buildSupplementalProgress({ endDate: '2026-09-01' }, ['公共'], undefined, new Date(2026, 9, 1));
  expect(summary.map((row) => row.range)).toEqual(['公共']);
  expect(details.every((row) => row.remainingDays === 0)).toBe(true);
 });
 test('导出实际明细及正确转义引号', () => {
  expect(serializeProgressExport([{ department: '虚拟组织', counted: 2, name: 'A"B' }], [['一级部门', 'department'], ['已盘数量', 'counted'], ['姓名', 'name']])).toBe('"一级部门","已盘数量","姓名"\r\n"虚拟组织","2","A""B"');
 });

 test('公共移动盘点结果更新进度且项目之间隔离', () => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  saveMobileInventoryResult('CP-public-A', '3102200966', { status: '已盘' });
  const resultFor = (projectNo) => buildSupplementalProgress({ projectNo }, ['公共'], undefined, new Date(2026, 9, 1), getMobileInventoryResults(projectNo));
  expect(resultFor('CP-public-A').details[0]).toMatchObject({ expected: 1, counted: 1, uncounted: 0, progress: 100 });
  expect(resultFor('CP-public-B').details[0]).toMatchObject({ expected: 1, counted: 0, uncounted: 1, progress: 0 });
  expect(resultFor('CP-public-A').summary[0]).toMatchObject({ counted: 1, uncounted: 0 });
 });
