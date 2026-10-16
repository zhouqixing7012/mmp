import { CURRENT_EMPLOYEE } from '../mock/employeeSelfServiceMock';

// 仅为原型的明确授权配置，复用已有身份；不代表正式管理员名单或生产授权。
export const DEFAULT_APPLICATION_ACCESS = Object.freeze({
  userId: CURRENT_EMPLOYEE.id, canView: true,
  grants: Object.freeze({ people: ['220784', '213852', '114111'], departments: [], companies: [] }),
  administratorIds: Object.freeze([CURRENT_EMPLOYEE.id]), ledgers: Object.freeze(['资产台账']),
});
export function assertApplicationAccess(access, id) {
  if (!access?.userId || !access.grants || !Array.isArray(access.ledgers)) throw new Error('缺少申请数据权限配置');
  if (!access.canView) throw new Error('无申请查看权限');
  for (const key of ['people', 'departments', 'companies']) {
    if (!Array.isArray(access.grants[key])) throw new Error('申请数据权限配置不完整');
  }
  if (id === 'unfinished' && !access.administratorIds?.includes(access.userId)) throw new Error('无未完成单据管理员权限');
}
export function canReadApplication(row, access) {
  if (!row.access || !['applicant', 'department', 'company', 'ledger'].every(key => typeof row.access[key] === 'string')) {
    throw new Error(`申请记录缺少明确的数据归属：${row.id}`);
  }
  if (!access.ledgers.includes(row.access.ledger)) return false;
  return access.grants.people.includes(row.access.applicant)
    || access.grants.departments.includes(row.access.department)
    || access.grants.companies.includes(row.access.company);
}
