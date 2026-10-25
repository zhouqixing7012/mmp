import { inventoryAssetQuantity, sumInventoryQuantity } from './inventoryQuantity';
import { calculateInventorySnapshotStats } from './inventorySnapshotStats';
import { ASSET_ROWS, UNINCLUDED_ASSET_ROWS, IMAGE_REVIEW_ROWS } from './mockData';
import { PROJECT_PLAN_ASSETS } from '../../mock/inventoryProjectPlanMock';
import { INVENTORY_MOBILE_ASSETS } from '../../mock/inventoryMobileMock';

test('一张数量10的资产按10累计，已盘比例使用数量求和', () => {
  expect(sumInventoryQuantity([{ quantity: 10 }, { quantity: '2' }])).toBe(12);
  expect(calculateInventorySnapshotStats([{ quantity: 10, inventoryStatus: '已盘' }, { quantity: 2, inventoryStatus: '未盘' }], [])).toMatchObject({ total: 12, counted: 10, uncounted: 2, rate: 83.3 });
});
test.each([undefined, null, '', ' ', 'invalid', -1, Infinity, true, false])('缺失或无效数量%s明确报错，不补1或0', quantity => {
  expect(() => inventoryAssetQuantity({ assetTag: 'A', quantity })).toThrow('资产 A 的数量缺失或无效');
});
test('已有快照、未包含、审核、计划和移动演示资产数量均可追溯，不补造缺失值', () => {
  const sources = [...ASSET_ROWS, ...UNINCLUDED_ASSET_ROWS, ...IMAGE_REVIEW_ROWS.map(row => row.asset), ...Object.values(PROJECT_PLAN_ASSETS).flat(), ...INVENTORY_MOBILE_ASSETS];
  expect(sources.length).toBeGreaterThan(0);
  sources.forEach(asset => expect(() => inventoryAssetQuantity(asset)).not.toThrow());
});
