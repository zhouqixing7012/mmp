import { markReplayMandatoryAssets, replayMandatoryRuleKeys, selectReplaySnapshotAssets } from './inventoryReplaySampling';
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
  expect(result.assets.every((asset) => asset.isMandatory)).toBe(true);
});

test('无必盘时仅从当前范围按百分比抽样', () => {
  const result = selectReplaySnapshotAssets(assets.slice(2), {
    projectType: '复盘', samplingMode: '百分比', samplingRatio: 50,
  }, () => 0);
  expect(result.assets).toHaveLength(2);
  expect(result.mandatoryAssetKeys).toEqual([]);
  expect(result.assets.every((asset) => !asset.isMandatory)).toBe(true);
});

test('人工标记与历史必盘键进入百分比采样并集，抽样为零仍保留', () => {
  const source = [{ key: 'a', assetTag: 'A', isMandatory: true }, { key: 'b', assetTag: 'B' }, { key: 'c', assetTag: 'C' }];
  const result = selectReplaySnapshotAssets(source, { projectType: '复盘', samplingMode: '百分比', samplingRatio: 0, mandatoryAssetKeys: ['b'] });
  expect(result.assets.map((asset) => [asset.key, asset.isMandatory])).toEqual([['a', true], ['b', true]]);
  expect(result.mandatoryAssetKeys).toEqual(['a', 'b']);
  expect(source[1].isMandatory).toBeUndefined();
});

test('全量复盘保留必盘标记，而未命中资产明确为非必盘', () => {
  const result = selectReplaySnapshotAssets(assets.slice(2), { projectType: '复盘', samplingMode: '全量', mandatoryAssetKeys: ['c'] });
  expect(result.assets.map((asset) => [asset.key, asset.isMandatory])).toEqual([['b', false], ['c', true], ['d', false]]);
  expect(result.mandatoryAssetKeys).toEqual(['c']);
});

test('范围展示不随机抽样，按与快照相同的必盘条件标记全部范围资产', () => {
  const project = { projectType: '复盘', samplingMode: '百分比', samplingRatio: 0, mandatoryNetValueAbove: 200 };
  const source = [{ key: 'a', assetTag: 'A', netValue: 300 }, { key: 'b', assetTag: 'B', netValue: 100 }, { key: 'c', assetTag: 'C', netValue: 0, isMandatory: true }];
  expect(markReplayMandatoryAssets(source, project).map((asset) => [asset.key, asset.isMandatory])).toEqual([['a', true], ['b', false], ['c', true]]);
  expect([...replayMandatoryRuleKeys(source, project)]).toEqual(['a']);
  expect(selectReplaySnapshotAssets(source, project).assets.map((asset) => asset.key)).toEqual(['a', 'c']);
});

test('项目及复盘计划都可跨天', () => {
  expect(inventoryProjectDateBlockReason('2026-09-01', '2026-09-03')).toBe('');
  expect(inventoryDateBlockReason('复盘', '2026-09-01', '2026-09-03')).toBe('');
});
