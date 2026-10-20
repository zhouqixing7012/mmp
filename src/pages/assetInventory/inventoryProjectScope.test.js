import { getInventoryPeriodOptions, inventoryProjectScopeSource, inheritInitialInventoryPeriod } from './inventoryProjectScope';

test('季度包含年份，关联初盘同步类型和期间', () => {
  expect(getInventoryPeriodOptions('季度', 2026)).toEqual(['2026年Q1', '2026年Q2', '2026年Q3', '2026年Q4']);
  expect(inheritInitialInventoryPeriod({ projectType: '复盘' }, { projectNo: 'CP1', inventoryType: '月度', period: '2025年12月' })).toMatchObject({ initialProjectNo: 'CP1', inventoryType: '月度', period: '2025年12月' });
});
test('关联初盘仅取执行快照，既不取全局也不取未执行清单', () => {
  const frozen = { key: 'a', executeInventory: true, owner: '快照责任人' };
  expect(inventoryProjectScopeSource({ projectType: '复盘' }, { allAssets: [{ key: 'b' }], initialSnapshot: { assets: [frozen, { key: 'n', executeInventory: false }] } })).toEqual([frozen]);
  expect(inventoryProjectScopeSource({ projectType: '抽盘' }, { allAssets: [{ key: 'b' }] })).toEqual([]);
});
test('年度初盘严格截止创建年7月1日，季度月度不额外截止', () => {
  const allAssets = [{ key: 'a', enableDate: '2025-06-30' }, { key: 'b', enableDate: '2025-07-01' }, { key: 'c', enableDate: '2026-01-01' }];
  expect(inventoryProjectScopeSource({ projectType: '初盘', inventoryType: '年度', createdAt: '2025-08-01' }, { allAssets })).toEqual([allAssets[0]]);
  expect(inventoryProjectScopeSource({ projectType: '初盘', inventoryType: '季度' }, { allAssets })).toEqual(allAssets);
  expect(inventoryProjectScopeSource({ projectType: '初盘', inventoryType: '年度' }, { allAssets })).toEqual([]);
});
