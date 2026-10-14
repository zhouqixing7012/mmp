import { CURRENT_EMPLOYEE } from '../mock/employeeSelfServiceMock';

// 复用已有演示身份，不新增业务页的角色切换入口。
// 调用方传入台账及卡片的查看权限，查询、候选和导出共用，不另设报表导出授权。
// 默认值仅为已有演示身份的台账范围，不冒充生产权限接入。
export const DEFAULT_REPORT_ACCESS = Object.freeze({
  userId: CURRENT_EMPLOYEE.id,
  canView: true,
  allowedScopes: Object.freeze(['集团']),
});
export function assertReportAccess(access) {
  if (!access?.userId || !Array.isArray(access.allowedScopes)) throw new Error('缺少台账及卡片权限信息');
  if (!access.canView) throw new Error('无台账及卡片查看权限');
}
export function canReadReportRow(row, access) {
  if (!row.scope) throw new Error(`报表记录缺少台账范围：${row.id}`);
  if (!access.allowedScopes.includes(row.scope)) return false;
  if (access.allowedAssetTags) return access.allowedAssetTags.includes(row.filters['资产标签号']);
  return true;
}
export function getWarehouseScope(company) {
  const code = company.split('.')[0];
  if (code === '115') return '上海媒体';
  if (code === '116') return '广州媒体';
  return '集团';
}
