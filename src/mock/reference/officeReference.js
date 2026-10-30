import source from './officeWarehouseMappings.json';

export const officeWarehouseMappings = source.records;
// Previously supplied demo office names. The new mapping file contains codes only, and no office addresses.
const existingOffices = [
  { code: 'L062', name: '北京-搜狐媒体大厦' },
  { code: 'L063', name: '北京-搜狐网络大厦' },
  { code: 'L064', name: '上海-搜狐媒体大厦' },
];
export const officeOptions = [...new Set([...existingOffices.map(row => row.code), ...source.records.map(row => row.officeCode)])].map(code => {
  const name = existingOffices.find(row => row.code === code)?.name || '';
  return { id: code, value: code, code, name, desc: name, address: '', label: name ? `${code}.${name}` : code };
});
export const departmentPathOptions = [...new Set(source.records.map(row => row.department))].map(label => {
  const separator = label.indexOf('.'), code = label.slice(0, separator), name = label.slice(separator + 1);
  return { value: code, code, name, label };
});
export function knownDepartmentPath(value) {
  const code = String(value || '').split('.')[0];
  return departmentPathOptions.find(row => row.code === code)?.name || '';
}
function mappingOptions(field) {
  return [...new Set(source.records.map(row => row[field]))].map(label => {
    const separator = label.indexOf('.'), code = label.slice(0, separator), name = label.slice(separator + 1);
    return { id: code, code, name, desc: name, label };
  });
}
export const mappingCompanyOptions = mappingOptions('company');
export const mappingWarehouseOptions = mappingOptions('warehouse');
