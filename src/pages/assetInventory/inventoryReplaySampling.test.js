import { selectReplaySnapshotAssets } from './inventoryReplaySampling';
import { inventoryProjectDateBlockReason, inventoryDateBlockReason } from './inventoryDateRules';

const assets = [
  { key: 'a', assetTag: 'A', netValue: 300 },
  { key: 'a-copy', assetTag: 'A', netValue: 300 },
  { key: 'b', assetTag: 'B', netValue: 200 },
  { key: 'c', assetTag: 'C', netValue: 100 },
  { key: 'd', assetTag: 'D', netValue: 50 },
];

test('两项必盘条件取并集、按标签去重，且净值等于门槛不命中', () => {
  const result = selectReplaySnapshotAssets(assets, {
    projectType: '复盘', samplingMode: '百分比', samplingRatio: 0,
    mandatoryNetValueAbove: 200, mandatoryNetValueTopPercent: 50,
  });
  expect(result.assets.map((asset) => asset.assetTag)).toEqual(['A', 'B']);
  expect(result.mandatoryAssetKeys).toHaveLength(2);
});

test('无必盘时仅从当前范围按百分比抽样', () => {
  const result = selectReplaySnapshotAssets(assets.slice(2), {
    projectType: '复盘', samplingMode: '百分比', samplingRatio: 50,
  }, () => 0);
  expect(result.assets).toHaveLength(2);
  expect(result.mandatoryAssetKeys).toEqual([]);
});

test('项目可跨天，复盘计划仍限单日', () => {
  expect(inventoryProjectDateBlockReason('2026-09-01', '2026-09-03')).toBe('');
  expect(inventoryDateBlockReason('复盘', '2026-09-01', '2026-09-03')).toBe('复盘执行期间只能为同一天');
});
