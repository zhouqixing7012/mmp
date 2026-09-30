import { buildInventoryOrganizationTree, matchesInventoryOrganization } from './inventoryOrganizationQuery';
import { selectScopeAssets } from './inventoryScopeQuery';

const assets = [
  { key: '1', organization: '甲公司', ownerDept: '技术部.研发组.一组', enableDate: '2026-01-01' },
  { key: '2', organization: '甲公司', ownerDept: '技术部.研发组.二组', enableDate: '2026-02-01' },
  { key: '3', organization: '乙公司', ownerDept: '技术部.研发组.一组', enableDate: '2026-01-15' },
  { key: '4', organization: '甲公司', ownerDept: '技术部门', enableDate: '2026-01-15' },
];

test('组织树按公司隔离并展开到实际末级部门', () => {
  const tree = buildInventoryOrganizationTree(assets);
  expect(tree).toHaveLength(2);
  expect(tree[0].children[0].children[0].children.map((row) => row.value)).toEqual(['dept:甲公司::技术部.研发组.一组', 'dept:甲公司::技术部.研发组.二组']);
});

test('多选父部门包含下级且不串公司或相似部门名称', () => {
  expect(assets.filter((row) => matchesInventoryOrganization(row, ['dept:甲公司::技术部'])).map((row) => row.key)).toEqual(['1', '2']);
  expect(assets.filter((row) => matchesInventoryOrganization(row, ['dept:甲公司::技术部.研发组.二组', 'org:乙公司'])).map((row) => row.key)).toEqual(['2', '3']);
});

test('末级部门与日期范围组合筛选，边界日期保留', () => {
  expect(selectScopeAssets(assets, { organizationDepartments: ['dept:甲公司::技术部'], enableFrom: '2026-01-01', enableTo: '2026-01-31' }, '初盘').map((row) => row.key)).toEqual(['1']);
  expect(selectScopeAssets([...assets, { key: 'missing', organization: '甲公司', ownerDept: '技术部' }], { enableFrom: '2026-01-01' }, '初盘')).toHaveLength(4);
});
