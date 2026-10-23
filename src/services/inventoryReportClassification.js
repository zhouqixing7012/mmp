// ES报告类别使用用户确认的业务分类；基础目录名称与明确简称统一识别。
const majorName = value => String(value ?? '').trim().replace(/^\d+\./, '').toUpperCase().replace(/[.\s]/g, '');
const majorAliases = {
  PC: 'PC', NB: 'NB', NOTEBOOK: 'NB', OE: 'OE', OFFICEEQUIPMENT: 'OE',
  NETE: 'NETE', NETEQUIPMENT: 'NETE', VEC: 'VEC', VEHICLE: 'VEC',
};
const specialOfficeMinors = new Set(['数码配给-组装零件', '数码配件-组装零件', '数码配件-影棚灯|灯架']);
const valueFrom = (asset, fields) => fields.map(field => asset[field]).find(value => value != null && value !== '') ?? '';
export function getInventoryMinorCategoryA(value) {
  return String(value ?? '').trim().split('-')[0];
}
export function classifyInventoryReportAsset(asset) {
  const major = majorAliases[majorName(valueFrom(asset, ['资产大类', 'majorCategory', 'category']))];
  const minor = String(valueFrom(asset, ['资产小类', 'minorCategory', 'subCategory'])).trim();
  const minorA = getInventoryMinorCategoryA(minor);
  let category = null;
  if (major === 'PC') category = '台式机、显示器';
  else if (major === 'NB') category = '笔记本';
  else if (major === 'NETE' && minorA === '电话') category = '电话';
  else if (major === 'VEC') category = '车辆';
  else if (['摄影摄像', '数码配件'].includes(minorA) && !specialOfficeMinors.has(minor)) category = '照摄像器材';
  else if (minorA.includes('移动数码')) category = '移动数码';
  else if (major === 'OE') category = '办公设备';
  return { category, minorCategoryA: minorA };
}
export function mapInventoryReportAsset(asset) {
  const classification = classifyInventoryReportAsset(asset);
  const reportCategory = classification.category;
  const companyCategory = reportCategory === '台式机、显示器'
    ? ['主机', '显示器'].includes(classification.minorCategoryA) ? classification.minorCategoryA : null
    : reportCategory;
  return { ...asset, reportCategory, reportCompanyCategory: companyCategory, minorCategoryA: classification.minorCategoryA };
}
export function summarizeInventoryReportCategory(assets, category) {
  const mapped = assets.map(mapInventoryReportAsset);
  if (mapped.some(asset => !asset.reportCategory)) return null;
  const rows = mapped.filter(asset => asset.reportCategory === category);
  const sum = fields => rows.every(row => Number.isFinite(Number(valueFrom(row, fields))) && valueFrom(row, fields) !== '')
    ? rows.reduce((total, row) => total + Number(valueFrom(row, fields)), 0) : null;
  return { quantity: sum(['数量', 'quantity']), original: sum(['原值', 'originalValue']), net: sum(['报失当月资产净值', 'netValue']) };
}
