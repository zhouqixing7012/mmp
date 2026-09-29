import { selectTopNetValueAssets } from './inventoryScopeRules';

test('净值前百分比按净值排序取资产条数', () => {
  const rows = [{ assetTag: 'A', netValue: 10 }, { assetTag: 'B', netValue: 30 }, { assetTag: 'C', netValue: 20 }];
  expect(selectTopNetValueAssets(rows, 34).map((row) => row.assetTag)).toEqual(['B', 'C']);
  expect(rows[0].assetTag).toBe('A');
});
