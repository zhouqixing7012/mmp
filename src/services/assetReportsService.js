import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import definitions from '../pages/assetReports/reportDefinitions.json';
import { assetReportRows, assetReportCatalog } from '../mock/businessRulesMock';

export const reportDefinitions = definitions;
export function getReportDefinition(id) {
  const definition = definitions.find(item => item.id === id);
  if (!definition) throw new Error(`未知报表：${id}`);
  return definition;
}
const isEmpty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
const selectedValues = value => Array.isArray(value) ? value : [value];

export function validateReportFilters(definition, filters) {
  for (const field of definition.filters) {
    const value = filters[field.label];
    if (isEmpty(value)) continue;
    if (field.unavailable) throw new Error(field.unavailable);
    if (field.type === 'amount' && !Number.isFinite(Number(String(value).replace(/,/g, '')))) throw new Error(`${field.label}须填写有效金额`);
    if (field.side === 'from') {
      const end = definition.filters.find(item => item.key === field.key && item.side === 'to');
      if (end && !isEmpty(filters[end.label]) && dayjs(value).isAfter(dayjs(filters[end.label]), 'day')) throw new Error(`${field.label}不能晚于${end.label}`);
    }
  }
  if (definition.id === 'report-5-1' && selectedValues(filters['资产状态'] || []).length > 1) throw new Error('资产状态多选的查询规则尚未确认');
}

export function matchesReportRow(definition, row, filters) {
  return definition.filters.every(field => {
    const input = filters[field.label];
    if (isEmpty(input)) return true;
    const source = row.filters?.[field.key];
    const text = String(source ?? '');
    const term = String(input).trim();
    switch (field.match) {
      case 'contains': return text.includes(term);
      case 'prefix': return text.startsWith(term);
      case 'parentOrSelf': return text.includes(term) || String(row.filters['资产标签号'] ?? '').startsWith(term);
      case 'in': return selectedValues(input).map(String).includes(text);
      case 'containsSelection': return selectedValues(input).some(value => text.includes(String(value)));
      case 'department': return selectedValues(input).some(value => text === value || text.startsWith(`${value}.`));
      case 'number': return !isEmpty(source) && Number(source) === Number(term.replace(/,/g, ''));
      case 'gteNumber': return Number(term.replace(/,/g, '')) === 0 || (!isEmpty(source) && Number(source) >= Number(term.replace(/,/g, '')));
      case 'lteNumber': return Number(term.replace(/,/g, '')) === 0 || (!isEmpty(source) && Number(source) <= Number(term.replace(/,/g, '')));
      case 'gteDate': return !isEmpty(source) && !dayjs(source).isBefore(dayjs(input), 'day');
      case 'lteDate': return !isEmpty(source) && !dayjs(source).isAfter(dayjs(input), 'day');
      default: throw new Error(`未定义的匹配规则：${field.match}`);
    }
  });
}
export function queryReport(id, filters = {}, sort = null) {
  const definition = getReportDefinition(id);
  validateReportFilters(definition, filters);
  const rows = assetReportRows[id].filter(row => (id !== 'report-8-1' || (row.deleted !== 'Y' && ['13', '14'].includes(row.statusCode) && row.values['报废日期'])) && matchesReportRow(definition, row, filters));
  if (sort?.key) rows.sort((a, b) => compareValues(a.values[sort.key], b.values[sort.key]) * (sort.order === 'descend' ? -1 : 1));
  else if (id === 'report-3-1' || id === 'report-4-1') rows.sort((a, b) => compareValues(a.id, b.id));
  else if (id === 'report-2-1') rows.sort((a, b) => compareValues(b.updatedAt, a.updatedAt) || compareValues(a.values['耗材标签号'], b.values['耗材标签号']));
  else if (['report-6-1', 'report-6-2', 'report-7-1'].includes(id)) rows.sort((a, b) => compareValues(b.values['申请单号'], a.values['申请单号']) || compareValues(b.values['申请日期'], a.values['申请日期']));
  else if (id === 'report-7-2') rows.sort((a, b) => compareValues(a.values['耗材状态'], b.values['耗材状态']) || compareValues(a.values['耗材物料编码'], b.values['耗材物料编码']) || compareValues(a.values['耗材标签号'], b.values['耗材标签号']));
  else if (id === 'report-5-1' || id === 'report-8-1') rows.sort((a, b) => compareValues(a.values['资产大类'], b.values['资产大类']) || compareValues(a.filters['公司'], b.filters['公司']) || compareValues(a.values['资产所属板块'], b.values['资产所属板块']) || compareValues(a.values[id === 'report-5-1' ? '序列号' : '资产编号'], b.values[id === 'report-5-1' ? '序列号' : '资产编号']));
  return rows;
}
function compareValues(a, b) {
  if (isEmpty(a)) return isEmpty(b) ? 0 : 1;
  if (isEmpty(b)) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
}
export function formatReportValue(value, format) {
  if (isEmpty(value)) return '';
  if (format === 'raw' || format === 'text') return value;
  if (format === 'truncateInteger') return String(Math.trunc(Number(value)));
  if (format === 'money' || format === 'moneyOptional') {
    if (!Number.isFinite(Number(value))) return value;
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: format === 'money' ? 2 : 0, maximumFractionDigits: 2 });
  }
  if (format === 'integer') return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const date = dayjs(value);
  if (!date.isValid()) return value;
  return date.format(format === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : format === 'slashDate' ? 'YYYY/MM/DD' : 'YYYY-MM-DD');
}

export function getReportOptions(definition, field, filters = {}) {
  if (field.options) return field.options.map(option => typeof option === 'string' ? { value: option, label: option, code: option } : { ...option, code: option.value });
  const { materials, warehouses } = assetReportCatalog;
  const isConsumable = ['report-2-1', 'report-7-1', 'report-7-2'].includes(definition.id);
  const materialRows = materials.filter(material => isConsumable ? material.materialType !== '资产' : material.materialType === '资产');
  const majorField = definition.filters.find(item => item.optionSet === 'major');
  const majors = majorField ? selectedValues(filters[majorField.label] || []) : [];
  let options;
  if (field.optionSet === 'major') options = materialRows.map(material => ({ value: material.majorCategory, label: material.majorCategory }));
  else if (field.optionSet === 'minor' || field.optionSet === 'category') options = materialRows.filter(material => !majors.length || majors.includes(material.majorCategory)).map(material => ({ value: field.optionSet === 'category' ? `${material.majorCategory}|${material.minorCategory}` : material.minorCategory, label: material.minorCategory, parent: material.majorCategory }));
  else if (['公司', '耗材公司', '申请人公司', '耗材责任人公司'].includes(field.key)) options = warehouses.map(w => ({ value: w.company.split('.')[0], label: w.company, code: w.company.split('.')[0] }));
  else if (['仓库', '源仓库', '目标仓库'].includes(field.key)) {
    options = warehouses.filter(w => w.status === '启用' && (definition.id !== 'report-2-1' || w.warehouseUsage.startsWith('IU0003.'))).map(w => ({ value: w.warehouseDescription, label: `${w.warehouseCode}.${w.warehouseDescription}`, code: w.warehouseCode, company: w.company }));
  } else if (field.optionSet === 'City' || field.optionSet === 'Building' || field.optionSet === 'Floor') {
    const cities = selectedValues(filters.City || []);
    options = warehouses.filter(w => field.optionSet !== 'Building' || !cities.length || cities.includes(w.city)).map(w => ({ value: w[field.optionSet.toLowerCase()], label: w[field.optionSet.toLowerCase()], parent: w.city }));
  } else {
    options = assetReportRows[definition.id].map(row => {
      const value = row.filters?.[field.key];
      const person = ['责任人编号', '员工内部ID', '申请人工号'].includes(field.key);
      const name = field.key === '申请人工号' ? row.values['申请人'] : field.key === '员工内部ID' ? row.values['员工姓名'] : row.values['责任人姓名'];
      return { value, code: value, label: person ? `${value}.${name || ''}` : row.values[field.key] || value, department: row.departmentPath || row.values['申请人部门'] || '' };
    });
  }
  // 演示卡片使用的旧标识独立保留，不猜测映射为基础目录的新编码。
  const snapshotOptions = assetReportRows[definition.id].map(row => ({
    value: row.filters?.[field.key], label: row.values[field.key] || row.filters?.[field.key],
    parent: field.optionSet === 'category' || field.optionSet === 'minor' ? row.values['资产大类'] : row.filters?.City,
  }));
  if (['仓库', '源仓库', '目标仓库', 'City', 'Building', 'Floor'].includes(field.key)) {
    options.push(...snapshotOptions.filter(option => field.key !== 'Building' || !selectedValues(filters.City || []).length || selectedValues(filters.City).includes(option.parent)));
  }
  if (['major', 'minor', 'category'].includes(field.optionSet)) {
    options.push(...snapshotOptions.filter(option => field.optionSet !== 'minor' || !majors.length || majors.includes(option.parent)));
  }
  if (field.match === 'department') {
    const ancestors = options.flatMap(option => {
      const parts = String(option.value || '').split('.');
      return parts.map((part, index) => ({ value: parts.slice(0, index + 1).join('.'), label: parts.slice(0, index + 1).join('.') }));
    });
    options.push(...ancestors);
  }
  const unique = new Map();
  options.forEach(option => { if (!isEmpty(option.value) && !unique.has(option.value)) unique.set(option.value, { code: option.value, ...option }); });
  return [...unique.values()];
}
export function updateReportFilter(definition, previous, field, value) {
  const next = { ...previous, [field.label]: value };
  if (field.optionSet === 'major') {
    const minor = definition.filters.find(item => item.optionSet === 'minor');
    if (minor) {
      const allowed = getReportOptions(definition, minor, next).map(option => option.value);
      next[minor.label] = selectedValues(previous[minor.label] || []).filter(item => allowed.includes(item));
    }
  }
  if (field.label === 'City' && !isEmpty(value)) {
    const building = definition.filters.find(item => item.label === 'Building');
    if (building) {
      const allowed = getReportOptions(definition, building, next).map(option => option.value);
      const kept = selectedValues(previous.Building || []).filter(item => allowed.includes(item));
      next.Building = building.multiple ? kept : kept[0];
    }
  }
  return next;
}
export function buildReportWorkbook(id, filters = {}, selectedKeys = [], sort = null) {
  const definition = getReportDefinition(id);
  // 明细选中导出按卡片ID取记录，其他报表按当前表单条件导出全部行。
  const rows = definition.selectRows && selectedKeys.length ? assetReportRows[id].filter(row => selectedKeys.includes(row.id)) : queryReport(id, filters, sort);
  if (id === 'report-2-1' && !sort?.key) rows.sort((a, b) => compareValues(a.values['资产大类'], b.values['资产大类']) || compareValues(a.filters['公司'], b.filters['公司']) || compareValues(a.values['板块'], b.values['板块']) || compareValues(a.values['资产编号'], b.values['资产编号']));
  const body = rows.map(row => definition.exportColumns.map(column => {
    let value = Object.prototype.hasOwnProperty.call(row.exports || {}, column.key) ? row.exports[column.key] : row.values[column.key];
    if (column.emptyValue !== undefined && isEmpty(value)) value = column.emptyValue;
    if (id === 'report-4-1' && column.key === '申请单号' && value === '-') value = '';
    return formatReportValue(value, column.format);
  }));
  const sheet = XLSX.utils.aoa_to_sheet([definition.exportColumns.map(column => column.label), ...body]);
  sheet['!cols'] = definition.exportColumns.map(column => ({ wch: Math.max(14, column.label.length * 2 + 4) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, definition.sheetName);
  return workbook;
}
export function exportReport(id, filters, selectedKeys, sort) {
  const workbook = buildReportWorkbook(id, filters, selectedKeys, sort);
  XLSX.writeFile(workbook, `${getReportDefinition(id).title}-${dayjs().format('YYYYMMDD')}.xlsx`);
}
