import { isInventoryAssetMandatory, sortInventoryMandatoryAssets, withInventoryMandatoryFlags } from './inventoryMandatoryAssets';

test('资产明确是或否优先于历史项目键，缺省才兼容历史键', () => {
  const project = { mandatoryAssetKeys: ['b', 'TAG-C', 8] };
  expect(isInventoryAssetMandatory({ key: 'a', isMandatory: true }, project)).toBe(true);
  expect(isInventoryAssetMandatory({ key: 'b', isMandatory: false }, project)).toBe(false);
  expect(isInventoryAssetMandatory({ key: 'b' }, project)).toBe(true);
  expect(isInventoryAssetMandatory({ assetTag: 'TAG-C' }, project)).toBe(true);
  expect(isInventoryAssetMandatory({ id: '8' }, project)).toBe(true);
  expect(isInventoryAssetMandatory({ key: 'd' }, project)).toBe(false);
});

test('中文及数值是/否统一为布尔标记，不修改原资产', () => {
  const assets = [{ key: 'a', isMandatory: '是' }, { key: 'b', isMandatory: '否' }, { key: 'c', isMandatory: 1 }, { key: 'd', isMandatory: 0 }];
  expect(withInventoryMandatoryFlags(assets).map((asset) => asset.isMandatory)).toEqual([true, false, true, false]);
  expect(assets[0].isMandatory).toBe('是');
});

test('必盘优先且两组内部稳定，排序不改变调用方数组', () => {
  const assets = [{ key: 'a' }, { key: 'b', isMandatory: true }, { key: 'c' }, { key: 'd', isMandatory: true }];
  expect(sortInventoryMandatoryAssets(assets).map((asset) => asset.key)).toEqual(['b', 'd', 'a', 'c']);
  expect(assets.map((asset) => asset.key)).toEqual(['a', 'b', 'c', 'd']);
});
