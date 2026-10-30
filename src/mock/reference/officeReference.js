import source from './officeWarehouseMappings.json';

export const officeWarehouseMappings = source.records;
// User clarified that the attachment's 办公区 values are names. No separate office codes or addresses were supplied.
export const officeOptions = [...new Set(source.records.map(row => row.officeName))].map(name => ({
  id: name, value: name, code: '', name, desc: name, address: '', label: name,
}));
export const departmentPathOptions = [...new Set(source.records.map(row => row.department))].map(label => {
  const separator = label.indexOf('.'), code = label.slice(0, separator), name = label.slice(separator + 1);
  return { value: code, code, name, label };
});
export function knownDepartmentPath(value) {
  const code = String(value || '').split('.')[0];
  return departmentPathOptions.find(row => row.code === code)?.name || '';
}
// 全称须有完整路径来源；部门简称不补造中间层级。
export function departmentFullName(value) {
  const text = String(value || '').trim();
  const separator = text.indexOf('.');
  const code = separator < 0 ? text : text.slice(0, separator);
  const savedName = separator < 0 ? '' : text.slice(separator + 1);
  return knownDepartmentPath(code) || (savedName.includes('.') ? savedName : '');
}
export function displayDepartmentPath(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const code = text.split('.')[0];
  const name = departmentFullName(text);
  return name ? `${code}.${name}` : code;
}
function mappingOptions(field) {
  return [...new Set(source.records.map(row => row[field]))].map(label => {
    const separator = label.indexOf('.'), code = label.slice(0, separator), name = label.slice(separator + 1);
    return { id: code, code, name, desc: name, label };
  });
}
export const mappingCompanyOptions = mappingOptions('company');
export const mappingWarehouseOptions = mappingOptions('warehouse');
