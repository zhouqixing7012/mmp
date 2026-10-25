// 编号依据：孙志强、何文沿用现有盘点身份；吕静见InfoChangeEdit、SerialNumberEdit原始页面。
// 穆晓丹尚无可核验工号，仅使用用户明确的姓名，不生成工号。
export const INVENTORY_REPORT_USERS = [
  { value: '213852-孙志强', name: '孙志强', employeeNo: '213852' },
  { value: '206984-何文', name: '何文', employeeNo: '206984' },
  { value: '115720-吕静', name: '吕静', employeeNo: '115720' },
  { value: '穆晓丹', name: '穆晓丹', employeeNo: '' },
];

export function canAccessInventoryReport(operator) {
  return INVENTORY_REPORT_USERS.some(person => person.value === operator);
}

export function inventoryMenuItemsForOperator(items, operator) {
  return items.filter(item => item !== '盘点报表' || canAccessInventoryReport(operator));
}
