export const INVENTORY_CREATORS = [
  { value: '213852-孙志强', label: 'ES-孙志强', projectTypes: ['初盘', '抽盘'] },
  { value: '冯丽婷', label: '财务-冯丽婷', projectTypes: ['复盘'] },
];

export function allowedProjectTypes(operator) {
  return INVENTORY_CREATORS.find((person) => person.value === operator)?.projectTypes || [];
}
