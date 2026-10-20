import { assetReportRows } from '../mock/businessRulesMock';
import { assertReportAccess, canReadReportRow, getWarehouseScope } from './assetReportAccess';
import { getAssetMaintenanceRows, getConsumableMaintenanceRows } from './assetManagementService';

// 共享已有维护记录；正式人员/成本中心基础资料尚未接入，不制造额外主数据。
export const PERSON_LOOKUP_FIELDS = [
  { name: 'code', label: '员工编号', dataIndex: 'code' },
  { name: 'name', label: '员工姓名', dataIndex: 'name' },
  { name: 'department', label: '部门', dataIndex: 'department' },
];
export const PERSON_LOOKUP_COLUMNS = PERSON_LOOKUP_FIELDS.map(({ label, dataIndex }) => ({ title: label, dataIndex }));
export const COST_CENTER_LOOKUP_FIELDS = [
  { name: 'code', label: '成本中心编码', dataIndex: 'code' },
  { name: 'name', label: '成本中心', dataIndex: 'name' },
];
export const COST_CENTER_LOOKUP_COLUMNS = COST_CENTER_LOOKUP_FIELDS.map(({ label, dataIndex }) => ({ title: label, dataIndex }));
export function costCenterCode(value) {
  const text = String(value || '').trim();
  const separator = text.indexOf('.');
  return separator > 0 ? text.slice(0, separator) : text;
}
export function costCenterLookupRecords(rows) {
  const records = new Map();
  rows.forEach(row => {
    const name = String(row.costCenter || '').trim(), code = costCenterCode(name);
    if (code && !records.has(code)) records.set(code, { id: code, value: code, code, name, label: name });
  });
  return [...records.values()];
}
export function personLookupRecords(rows) {
  const people = new Map();
  rows.forEach(row => {
    const code = String(row.ownerId || ''), name = row.ownerName;
    if (code && name && !people.has(code)) people.set(code, { id: code, value: code, code, name, label: code + '.' + name, department: row.department || '' });
  });
  return [...people.values()];
}
const notDeleted = row => row.deleted !== true && row.deleted !== 'Y';
function referenceRows(access) {
  if (access) assertReportAccess(access);
  return Object.values(assetReportRows).flat().filter(row => notDeleted(row) && (!access || canReadReportRow(row, access)));
}
function maintenanceRows(access) {
  return [...getAssetMaintenanceRows(), ...getConsumableMaintenanceRows()].filter(row => !access || (
    row.companyCode && access.allowedScopes.includes(getWarehouseScope(row.companyCode + '.'))
    && (!access.allowedAssetTags || access.allowedAssetTags.includes(row.tag))
  ));
}
export function getSharedCostCenters(access) {
  if (access) assertReportAccess(access);
  return costCenterLookupRecords([...maintenanceRows(access), ...referenceRows(access).map(row => ({ costCenter: row.values['成本中心'] }))]);
}
export function getSharedPeople(access) {
  if (access) assertReportAccess(access);
  const people = new Map(personLookupRecords(maintenanceRows(access)).map(person => [person.code, person]));
  referenceRows(access).forEach(row => ['资产责任人工号', '事务执行人', '汇总提交人名称', '申请人', '耗材责任人查询'].forEach(key => {
    const code = String(row.filters[key] || '');
    if (!code || people.has(code)) return;
    const label = row.lookupLabels?.[key] || row.values[key] || '';
    const name = key === '资产责任人工号' ? row.values['资产责任人姓名'] || '' : label.startsWith(code + '.') ? label.slice(code.length + 1) : '';
    // 资产或申请的部门不能当作事务执行人、汇总提交人的部门。
    people.set(code, { id: code, value: code, code, name, label: name ? code + '.' + name : code, department: '' });
  }));
  return [...people.values()];
}
