// 管理权只取项目创建人；项目负责人或现有资产人员不能替代创建人身份。
function identity(person) {
  if (person && typeof person === 'object') return { no: String(person.employeeNo || '').trim(), name: String(person.employeeName || person.name || '').trim() };
  const value = String(person || '').trim();
  const match = value.match(/^(\d+)-(.+)$/);
  return match ? { no: match[1], name: match[2] } : { no: '', name: value };
}
export function inventoryManagementBlockReason(project, operator) {
  const creator = identity(project?.creator);
  const current = identity(operator);
  if (!creator.name || creator.name === '-') return '缺少项目创建人信息，不能执行管理操作';
  if (!current.name || current.name === '-') return '无法确认当前操作人，不能执行管理操作';
  const matches = creator.no && current.no ? creator.no === current.no : creator.name === current.name;
  return matches ? '' : '仅项目创建人可以执行此管理操作';
}
export function assertInventoryManagementPermission(project, operator) {
  const reason = inventoryManagementBlockReason(project, operator);
  if (reason) throw new Error(reason);
}
