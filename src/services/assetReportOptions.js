import { ASSET_PLATE_OPTIONS } from '../config/assetPlates';
import { ASSET_PURPOSE_OPTIONS, ASSET_ADD_TYPE_OPTIONS, CONSUMABLE_ADD_TYPE_OPTIONS } from '../config/assetFieldOptions';
import { getSharedCostCenters, getSharedPeople } from './assetReferenceOptions';
import { categoryOptions } from '../mock/reference/materialCategoryMapping';
import { assetReportRows, assetReportCatalog } from '../mock/businessRulesMock';
import { DEFAULT_REPORT_ACCESS, assertReportAccess, canReadReportRow, getWarehouseScope } from './assetReportAccess';

const isEmpty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);
const directoryName = value => String(value ?? '').includes('.') ? String(value).slice(String(value).indexOf('.') + 1) : String(value ?? '');
const list = value => Array.isArray(value) ? value : isEmpty(value) ? [] : [value];
const COMPANY_FIELDS = new Set(['company', '公司', '耗材公司', '申请人公司', '耗材责任人公司']);
const WAREHOUSE_FIELDS = new Set(['warehouse', '仓库', '源仓库', '目标仓库']);
const CATEGORY_FIELDS = new Set(['category', 'consumableCategory']);
const PERSON_FIELDS = new Set(['person', '责任人编号', '当前责任人']);
const NAME_FIELDS = { '资产责任人工号': '资产责任人姓名', '责任人编号': '资产责任人', '当前责任人': '资产责任人', '汇总提交人名称': '汇总提交人' };
function uniqueOptions(options) {
  const unique = new Map();
  options.forEach(option => {
    if (!isEmpty(option.value) && !unique.has(String(option.value))) unique.set(String(option.value), { code: String(option.value), ...option, value: String(option.value) });
  });
  return [...unique.values()];
}
function rowOptions(rows, field) {
  return rows.map(row => {
    const value = row.filters[field.key];
    let label = row.lookupLabels?.[field.key] ?? row.values[field.key];
    if (PERSON_FIELDS.has(field.optionSet) && NAME_FIELDS[field.key] && !row.lookupLabels?.[field.key]) {
      const name = row.values[NAME_FIELDS[field.key]];
      label = name ? `${value}.${name}` : value;
    }
    return { value, label: isEmpty(label) ? value : label, name: PERSON_FIELDS.has(field.optionSet) ? row.values[NAME_FIELDS[field.key]] ?? label : undefined,
      department: row.filters['HR部门'] ?? row.filters['申请人部门'] ?? row.filters['部门'] ?? '' };
  });
}
export function getReportOptions(definition, field, filters = {}, access = DEFAULT_REPORT_ACCESS) {
  assertReportAccess(access);
  if (field.optionSet === 'plate') return ASSET_PLATE_OPTIONS.map(label => ({ value: label.split('.')[0], code: label.split('.')[0], label }));
  if (field.optionSet === 'purpose') return ASSET_PURPOSE_OPTIONS;
  if (field.optionSet === 'addType') return (definition.id === 'report-2-1' ? CONSUMABLE_ADD_TYPE_OPTIONS : ASSET_ADD_TYPE_OPTIONS).map(value => ({ value, label: value }));
  if (field.optionSet === 'person') return getSharedPeople(access);
  if (field.optionSet === 'costCenter') return getSharedCostCenters(access);
  if (field.options) return field.options.map(option => typeof option === 'string' ? { value: option, label: option, code: option } : { ...option, code: option.value });
  const { materials, warehouses } = assetReportCatalog;
  const rows = assetReportRows[definition.id].filter(row => canReadReportRow(row, access) && row.deleted !== true && row.deleted !== 'Y');
  const consumable = ['report-2-1', 'report-7-1', 'report-7-2'].includes(definition.id);
  const materialRows = materials.filter(material => material.status === '启用' && (consumable ? material.materialType !== '资产' : material.materialType === '资产'));
  const group = field.optionSet;
  if (CATEGORY_FIELDS.has(group)) {
    return uniqueOptions(categoryOptions(materialRows));
  }
  if (group === 'major') return uniqueOptions(materialRows.map(material => ({ value: material.majorCategory, label: material.majorCategory })));
  if (group === 'minor') {
    const major = definition.filters.find(item => item.optionSet === 'major');
    const chosen = major ? list(filters[major.label]) : [];
    return uniqueOptions(materialRows.filter(material => !chosen.length || chosen.includes(material.majorCategory))
      .map(material => ({ value: material.minorCategory, label: material.minorCategory, parent: material.majorCategory })));
  }
  if (group === 'brand') return uniqueOptions(materialRows.map(material => ({ value: material.brand, label: material.brand })));
  if (group === 'consumableMaterial') return materialRows.map(material => ({ value: material.materialCode, code: material.materialCode, label: material.materialDescription }));
  if (COMPANY_FIELDS.has(group)) return uniqueOptions(warehouses.map(warehouse => ({ value: warehouse.company.split('.')[0], label: warehouse.company })));
  if (WAREHOUSE_FIELDS.has(group)) {
    return warehouses.filter(warehouse => warehouse.status === '启用' && access.allowedScopes.includes(getWarehouseScope(warehouse.company))
      && (!access.allowedWarehouseCodes || access.allowedWarehouseCodes.includes(warehouse.warehouseCode))
      && (definition.id !== 'report-2-1' || warehouse.warehouseUsage.startsWith('IU0003.')))
      .map(warehouse => ({ value: warehouse.warehouseCode, label: `${warehouse.warehouseCode}.${warehouse.warehouseDescription}`, code: warehouse.warehouseCode, company: warehouse.company }));
  }
  if (['City', 'Building', 'Floor'].includes(group)) {
    const cities = list(filters.City);
    const key = group.toLowerCase();
    return uniqueOptions(warehouses.filter(warehouse => group !== 'Building' || !cities.length || cities.includes(warehouse.city))
      .map(warehouse => ({ value: warehouse[key], label: group === 'Floor' ? directoryName(warehouse.floor) : warehouse[key],
        name: directoryName(warehouse[key]), city: directoryName(warehouse.city) })));
  }
  const options = rowOptions(rows, field);
  if (group === 'department' || field.match === 'department') {
    // 演示组织保存明确的完整层级路径，父节点以同一路径表示，不猜部门编号。
    const nodes = options.flatMap(option => {
      const parts = String(option.value || '').split('.');
      return parts.map((_, index) => ({ value: parts.slice(0, index + 1).join('.'), label: parts[index],
        parent: index ? parts.slice(0, index).join('.') : null }));
    });
    return uniqueOptions(nodes);
  }
  return uniqueOptions(options);
}
export function buildReportTree(options, department = false) {
  if (department) {
    const nodes = new Map(options.map(option => [option.value, { title: option.label, value: option.value, children: [] }]));
    const roots = [];
    options.forEach(option => {
      const node = nodes.get(option.value);
      if (option.parent && nodes.has(option.parent)) nodes.get(option.parent).children.push(node);
      else roots.push(node);
    });
    return roots;
  }
  return [...new Set(options.map(option => option.parent))].map(parent => ({
    title: `${options.find(option => option.parent === parent).parentCode}.${parent}`, value: `major:${parent}`,
    children: options.filter(option => option.parent === parent).map(option => ({ title: option.label, value: option.value })),
  }));
}
export function updateReportFilter(definition, previous, field, value) {
  const next = { ...previous, [field.label]: value };
  if (field.optionSet === 'major') {
    const minor = definition.filters.find(item => item.optionSet === 'minor');
    if (minor) {
      const allowed = getReportOptions(definition, minor, next).map(option => option.value);
      const kept = list(previous[minor.label]).filter(item => allowed.includes(item));
      next[minor.label] = minor.multiple ? kept : kept[0];
    }
  }
  if (field.label === 'City') {
    const building = definition.filters.find(item => item.label === 'Building');
    if (building) {
      const allowed = getReportOptions(definition, building, next).map(option => option.value);
      const kept = list(previous.Building).filter(item => allowed.includes(item));
      next.Building = building.multiple ? kept : kept[0];
    }
  }
  return next;
}
