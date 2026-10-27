// 用户于2026-10-27确认的盘点人员资料；操作权限仍由各业务角色规则决定。
export const INVENTORY_PEOPLE = [
  { employeeName: '孙志强', employeeNo: '213852', department: '员工服务中心_资产组' },
  { employeeName: '何文', employeeNo: '206984', department: '员工服务中心_资产组' },
  { employeeName: '吕静', employeeNo: '115720', department: '员工服务中心_资产组' },
  { employeeName: '穆晓丹', employeeNo: '150690', department: '员工服务中心_资产组' },
  { employeeName: '冯丽婷', employeeNo: '220570', department: '财务中心_集团业务支持部' },
  { employeeName: '徐博', employeeNo: '115577', department: '财务中心_集团业务支持部' },
];

export function inventoryPerson(name) {
  return INVENTORY_PEOPLE.find(person => person.employeeName === name);
}
