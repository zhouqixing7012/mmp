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

test('子公司部门树与其他多选条件按组组合', () => {
  const assets = [
    { assetTag: 'A', organization: '甲', ownerDept: '技术', city: '北京', category: '电脑' },
    { assetTag: 'B', organization: '甲', ownerDept: '财务', city: '上海', category: '电脑' },
    { assetTag: 'C', organization: '乙', ownerDept: '技术', city: '北京', category: '手机' },
  ];
  expect(selectScopeAssets(assets, { organizationDepartments: ['dept:甲::技术', 'org:乙'], city: ['北京'], assetCategory: ['电脑', '手机'] }, '初盘').map((row) => row.assetTag)).toEqual(['A', 'C']);
  expect(selectScopeAssets(assets, { organizationDepartments: [], city: [] }, '初盘')).toHaveLength(3);
});
