import { APPLICATION_ASSET_CONFIGURATIONS } from '../config/applicationAssetConfigurations';
import { officeOptions, officeWarehouseMappings, knownDepartmentPath, departmentFullName, displayDepartmentPath } from '../mock/reference/officeReference';
import { mockOfficeWarehouseData } from '../mock/businessRulesMock';
import { getApplicationDefinition, getApplicationOptions, queryApplications } from './applicationQueryService';
import { mockProcurementNumber } from '../mock/procurementNumbers';

test('附件办公区按用户确认为名称，10条映射完整保留', () => {
  expect(mockOfficeWarehouseData).toHaveLength(10);
  expect(officeWarehouseMappings[0]).toEqual({ company: 'WIS.北京搜狐互联网信息服务有限公司', department: 'D0164.搜狐媒体.社交产品中心', officeName: 'L062', warehouse: 'I0015.资产集团前台库（互联网）', enabledDate: '2024-07-12' });
  expect(mockOfficeWarehouseData[0]).toMatchObject({ company: officeWarehouseMappings[0].company, dept: officeWarehouseMappings[0].department, enabledDate: '2024-07-12' });
  expect(knownDepartmentPath('D0164')).toBe('搜狐媒体.社交产品中心');
  expect(knownDepartmentPath('D0002')).toBe('');
  expect(officeWarehouseMappings.every(row => officeOptions.some(office => office.name === row.officeName))).toBe(true);
  expect(officeOptions.every(row => row.address === '')).toBe(true);
  expect(officeOptions.find(row => row.name === 'L062')).toMatchObject({ value: 'L062', name: 'L062', label: 'L062', code: '' });
});
test('五项资产配置完整独立于交易记录，条件及单头使用同一字典', () => {
  const definition = getApplicationDefinition('newEmployee');
  const field = definition.filters.find(row => row.key === 'configuration');
  expect(getApplicationOptions('newEmployee', field).map(row => row.value)).toEqual(APPLICATION_ASSET_CONFIGURATIONS);
  for (const row of queryApplications('newEmployee')) {
    expect(APPLICATION_ASSET_CONFIGURATIONS).toContain(row.head['资产配置']);
    expect(queryApplications('newEmployee', { configuration: row.filters.configuration }).map(item => item.id)).toContain(row.id);
    expect(row.lines[0].prNo).toMatch(/^PR\d{10}$/);
  }
});
test('采购编号沿用已有PR/PO样例形态、关联稳定且不同对象不冲突', () => {
  const pr = mockProcurementNumber('PR', 'regression-a', '2026-10-30');
  expect(pr).toMatch(/^PR261030\d{4}$/);
  expect(mockProcurementNumber('PR', 'regression-a', '2026-10-30')).toBe(pr);
  expect(mockProcurementNumber('PR', 'regression-b', '2026-10-30')).not.toBe(pr);
  expect(mockProcurementNumber('PO', 'regression-a', '2026-10-30')).toMatch(/^PO261030\d{4}$/);
  for (const row of queryApplications('asset').filter(row => row.values.poNo)) expect(row.values.poNo).toMatch(/^PO\d{10}$/);
});

test('借用部门使用完整路径，不将编码加简称误认成部门全称，筛选身份保持不变', () => {
  expect(departmentFullName('D0164')).toBe('搜狐媒体.社交产品中心');
  expect(displayDepartmentPath('D0164')).toBe('D0164.搜狐媒体.社交产品中心');
  expect(displayDepartmentPath('D0002.财务中心')).toBe('D0002');
  expect(displayDepartmentPath('D-DEMO.子公司.一级部门.末级部门')).toBe('D-DEMO.子公司.一级部门.末级部门');
  const field = getApplicationDefinition('borrow').filters.find(item => item.key === 'department');
  const options = getApplicationOptions('borrow', field);
  expect(options).toEqual([{ value: 'D0002.财务中心', code: 'D0002', label: 'D0002', name: '' }]);
  const rows = queryApplications('borrow', { department: options[0].value });
  expect(rows).toHaveLength(3);
  rows.forEach(row => {
    expect(row.values.department).toBe('D0002');
    expect(Object.fromEntries(row.head)['部门']).toBe('D0002');
    expect(row.filters.department).toBe('D0002.财务中心');
  });
});
