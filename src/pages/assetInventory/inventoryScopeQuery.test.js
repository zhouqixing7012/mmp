import { selectScopeAssets } from './inventoryScopeQuery';

test('复盘净值前百分比在其他条件过滤后按净值排序', () => {
  const assets = [
    { assetTag: 'A', organization: '甲', netValue: 10 },
    { assetTag: 'B', organization: '甲', netValue: 50 },
    { assetTag: 'C', organization: '乙', netValue: 100 },
    { assetTag: 'D', organization: '甲', netValue: 30 },
  ];
  expect(selectScopeAssets(assets, { organization: '甲', netValueTopPercent: 50 }, '复盘').map((row) => row.assetTag)).toEqual(['B', 'D']);
});
