import { CURRENT_EMPLOYEE } from '../mock/employeeSelfServiceMock';

// 复用已有演示身份，不新增业务页的角色切换入口。
// 正式账号授权接入后由调用方提供同一权限对象；此处不冒充生产权限。
export const DEFAULT_REPORT_ACCESS = Object.freeze({
  userId: CURRENT_EMPLOYEE.id,
  canView: true,
  canExport: true,
  allowedScopes: Object.freeze(['集团']),
});
export function assertReportAccess(access, action = 'view') {
  if (!access?.userId || !Array.isArray(access.allowedScopes)) throw new Error('缺少报表权限信息');
  if (action === 'export' ? !access.canExport || !access.canView : !access.canView) throw new Error(action === 'export' ? '无报表导出权限' : '无报表查看权限');
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
