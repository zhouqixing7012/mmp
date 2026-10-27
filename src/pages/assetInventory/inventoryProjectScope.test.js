import { getDefaultInventoryPeriod, getInventoryPeriodOptions, inventoryProjectPeriodBlockReason, inventoryProjectScopeSource, inheritInitialInventoryPeriod, inventoryReplayScopeStatistics } from './inventoryProjectScope';

test('年度期间从2014年逐年到当前年，年度默认当前年而不是首项', () => {
  expect(getInventoryPeriodOptions('年度', 2026)).toEqual(['2014年', '2015年', '2016年', '2017年', '2018年', '2019年', '2020年', '2021年', '2022年', '2023年', '2024年', '2025年', '2026年']);
  expect(getDefaultInventoryPeriod('年度', 2026)).toBe('2026年');
  expect(getInventoryPeriodOptions('年度', 2027).at(-1)).toBe('2027年');
});

test.each(['初盘', '抽盘', '复盘'])('年度%s只接受范围内整年期间，不接受季度、空值或越界年份', (projectType) => {
  expect(inventoryProjectPeriodBlockReason({ projectType, inventoryType: '年度', period: '2014年' }, 2026)).toBe('');
  expect(inventoryProjectPeriodBlockReason({ projectType, inventoryType: '年度', period: '2026年' }, 2026)).toBe('');
  ['2013年', '2027年', '2026年Q1', '2026年1月', ''].forEach((period) => {
    expect(inventoryProjectPeriodBlockReason({ projectType, inventoryType: '年度', period }, 2026)).toBe('年度盘点期间请选择2014年至2026年之间的年份');
  });
});

test('季度和月度选项与默认期间保持原规则，关联年度初盘带出年份期间', () => {
  expect(getDefaultInventoryPeriod('季度', 2026)).toBe('2026年Q1');
  const months = getInventoryPeriodOptions('月度', 2026);
  expect(months).toHaveLength(14);
  expect(months[0]).toBe('2025年12月'); expect(months.at(-1)).toBe('2027年1月');
  expect(getDefaultInventoryPeriod('月度', 2026)).toBe('2025年12月');
  expect(inheritInitialInventoryPeriod({ projectType: '抽盘' }, { projectNo: 'CP1', inventoryType: '年度', period: '2020年' })).toMatchObject({ inventoryType: '年度', period: '2020年' });
});

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


test('复盘范围200/1000及批次50/1000按卡片计数，不汇总数量字段', () => {
  const initial = Array.from({ length: 1000 }, (_, i) => ({ key: i, quantity: i + 10, executeInventory: i < 200 }));
  expect(inventoryReplayScopeStatistics(initial.slice(0, 200), initial)).toEqual({ count: 200, total: 1000, ratio: '20.00%' });
  expect(inventoryReplayScopeStatistics(initial.slice(0, 50), initial)).toEqual({ count: 50, total: 1000, ratio: '5.00%' });
});

test('复盘范围百分比零分母、空批次、100%及普通比例显示', () => {
  const assets = [{ quantity: 99 }, { quantity: 1 }, { quantity: 500 }];
  expect(inventoryReplayScopeStatistics([], []).ratio).toBe('0%');
  expect(inventoryReplayScopeStatistics([], assets).ratio).toBe('0%');
  expect(inventoryReplayScopeStatistics(assets, assets).ratio).toBe('100%');
  expect(inventoryReplayScopeStatistics(assets.slice(0, 1), assets).ratio).toBe('33.33%');
});
