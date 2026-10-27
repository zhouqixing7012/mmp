// 范围明细展示复用已有人员资料；缺少工号或完整组织路径时不补造。
function ownerParts(row, people) {
  const raw = String(row.owner || '').trim();
  const parts = raw.match(/^([A-Za-z0-9]+)-(.+)$/);
  const no = String(row.ownerNo || row.ownerEmployeeNo || parts?.[1] || '').trim();
  const name = parts?.[2] || raw;
  const matches = people.filter(person => no ? String(person.employeeNo) === no : person.employeeName === name);
  const person = matches.length === 1 ? matches[0] : null;
  return { no: no || person?.employeeNo || '', name: person?.employeeName || name, person };
}
export function scopeAssetOwner(row, people = []) {
  const { no, name } = ownerParts(row, people);
  if (!name || name === '-') return '-';
  return `${no || '—'}-${name}`;
}
export function scopeAssetDepartment(row, people = []) {
  const { person } = ownerParts(row, people);
  return row.ownerDeptFullName || row.ownerDeptPath || person?.department || row.ownerDept || '-';
}
