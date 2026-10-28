import { inventoryPerson } from './inventoryPeople';

export const INVENTORY_REPORT_USERS = [
  { value: '213852-孙志强', name: '孙志强', employeeNo: '213852' },
  { value: '206984-何文', name: '何文', employeeNo: '206984' },
  { value: '115720-吕静', name: '吕静', employeeNo: '115720' },
  { value: '穆晓丹', name: '穆晓丹', employeeNo: '150690' },
].map(person => ({ ...person, ...inventoryPerson(person.name) }));

export function canAccessInventoryReport(operator) {
  return INVENTORY_REPORT_USERS.some(person => person.value === operator);
}

export function inventoryMenuItemsForOperator(items, operator) {
  return items.filter(item => !['盘点报表', '财务盘点报告'].includes(item) || canAccessInventoryReport(operator));
}
