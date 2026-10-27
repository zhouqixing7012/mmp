import { scopeAssetOwner, scopeAssetDepartment } from './inventoryScopeAssetDisplay';
const people = [{ employeeNo: '001', employeeName: '甲', department: '子公司.一级部门.末级部门' }];
test('责任人工号姓名复用人员资料，不重复加已有工号', () => {
  expect(scopeAssetOwner({ owner: '甲' }, people)).toBe('001-甲');
  expect(scopeAssetOwner({ owner: '001-甲' }, people)).toBe('001-甲');
});
test('缺少工号及同名歧义不编造人员编号', () => {
  expect(scopeAssetOwner({ owner: '乙' }, people)).toBe('—-乙');
  expect(scopeAssetOwner({ owner: '甲' }, [...people, { employeeNo: '002', employeeName: '甲' }])).toBe('—-甲');
});
test('部门复用已知完整路径，缺失上级资料不拼造组织', () => {
  expect(scopeAssetDepartment({ owner: '甲', ownerDept: '末级部门' }, people)).toBe('子公司.一级部门.末级部门');
  expect(scopeAssetDepartment({ owner: '乙', ownerDept: '原部门' }, people)).toBe('原部门');
  expect(scopeAssetDepartment({ owner: '甲', ownerDeptFullName: '另一子公司.末级' }, people)).toBe('另一子公司.末级');
});
