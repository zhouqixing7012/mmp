import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import definitions from '../pages/assetReports/reportDefinitions.json';
import { assetReportRows } from '../mock/businessRulesMock';
import { DEFAULT_REPORT_ACCESS, assertReportAccess, canReadReportRow } from './assetReportAccess';
export { getReportOptions, updateReportFilter } from './assetReportOptions';

export const reportDefinitions = definitions;
export function getReportDefinition(id) {
  const definition = definitions.find(item => item.id === id);
  if (!definition) throw new Error(`未知报表：${id}`);
  return definition;
}
export const isReportValueEmpty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
const selectedValues = value => Array.isArray(value) ? value : [value];

export function validateReportFilters(definition, filters) {
  for (const field of definition.filters) {
    const value = filters[field.label];
    if (isReportValueEmpty(value)) continue;
    if (field.type === 'amount' && !Number.isFinite(Number(String(value).replace(/,/g, '')))) throw new Error(`${field.label}须填写有效金额`);
    if (field.type === 'date' && !dayjs(value).isValid()) throw new Error(`${field.label}须填写有效日期`);
    if (field.side === 'from') {
      const end = definition.filters.find(item => item.key === field.key && item.side === 'to');
      if (end && !isReportValueEmpty(filters[end.label]) && dayjs(value).isAfter(dayjs(filters[end.label]), 'day')) throw new Error(`${field.label}不能晚于${end.label}`);
    }
  }
}
export function matchesReportRow(definition, row, filters) {
  return definition.filters.every(field => {
    const input = filters[field.label];
    if (isReportValueEmpty(input)) return true;
    const source = row.filters[field.key];
    const text = String(source ?? '');
    const term = String(input).trim();
    const values = selectedValues(input).map(String);
    switch (field.match) {
      case 'contains': return text.includes(term);
      case 'prefix': return text.startsWith(term);
      case 'parentOrSelf': return text.includes(term) || String(row.filters['资产标签号'] ?? '').startsWith(term);
      case 'in': return values.includes(text);
      case 'category': return values.includes(text) || values.some(value => value.startsWith('major:') && text.split('|')[0] === value.slice(6));
      case 'department': return values.some(value => text === value || text.startsWith(`${value}.`) || row.departmentAncestors?.[field.key]?.includes(value));
      case 'number': return !isReportValueEmpty(source) && Number(source) === Number(term.replace(/,/g, ''));
      case 'gteDate': return !isReportValueEmpty(source) && !dayjs(source).isBefore(dayjs(input), 'day');
      case 'lteDate': return !isReportValueEmpty(source) && !dayjs(source).isAfter(dayjs(input), 'day');
      case 'gteNumber': return !isReportValueEmpty(source) && Number(source) >= Number(term.replace(/,/g, ''));
      case 'lteNumber': return !isReportValueEmpty(source) && Number(source) <= Number(term.replace(/,/g, ''));
      default: throw new Error(`未定义的匹配规则：${field.match}`);
    }
  });
}
export function isInReportRange(definition, row) {
  if (row.deleted === true || row.deleted === 'Y') return false;
  switch (definition.range) {
    case 'assetCards': return row.kind === '资产';
    case 'consumableDetails': return ['低值耐用品', '耗材'].includes(row.kind);
    case 'processedAssetTransactions': return row.kind === '资产' && row.documentStatus === '已处理';
    case 'newEmployeeClaims': return true;
    case 'completedInboundAssets': return row.kind === '资产' && row.documentStatus === '已完成' && ['新增入库', '采购接收', '自购入库'].includes(row.values['入库类型']);
    case 'assetStockClaims': return row.kind === '资产' && row.matchStatus === '库存领用';
    case 'assetPurchaseClaims': return row.kind === '资产' && row.matchStatus === '统一采购';
    case 'consumableClaims':
    case 'consumableClaimDetails': return ['低值耐用品', '耗材'].includes(row.kind);
    case 'scrappedAssets': return row.kind === '资产' && ['已报废-待处置', '已报废-已处置'].includes(row.values['资产状态']);
    default: throw new Error(`未定义的报表范围：${definition.range}`);
  }
}
export function compareReportValues(a, b, order = 'ascend') {
  if (isReportValueEmpty(a)) return isReportValueEmpty(b) ? 0 : 1;
  if (isReportValueEmpty(b)) return -1;
  const compared = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
  return compared * (order === 'descend' ? -1 : 1);
}
export function queryReport(id, filters = {}, sort = null, access = DEFAULT_REPORT_ACCESS) {
  const definition = getReportDefinition(id);
  assertReportAccess(access);
  validateReportFilters(definition, filters);
  const rows = assetReportRows[id].filter(row => canReadReportRow(row, access) && isInReportRange(definition, row) && matchesReportRow(definition, row, filters));
  if (!sort?.key && definition.sortSourceGap && rows.some(row => definition.sortKeys.some(item => ['majorCode', 'minorCode'].includes(item.key) && isReportValueEmpty(row.sort[item.key])))) {
    throw new Error(definition.sortSourceGap + '，无法执行默认排序');
  }
  rows.sort((a, b) => {
    if (sort?.key) return compareReportValues(a.values[sort.key], b.values[sort.key], sort.order);
    for (const item of definition.sortKeys) {
      const comparison = compareReportValues(a.sort[item.key], b.sort[item.key], item.order);
      if (comparison) return comparison;
    }
    return 0;
  });
  return rows;
}
export function formatReportValue(value, format) {
  if (isReportValueEmpty(value)) return '';
  if (format === 'raw' || format === 'text') return value;
  if (format === 'truncateInteger') return String(Math.trunc(Number(value)));
  if (format === 'money' || format === 'moneyOptional') {
    if (!Number.isFinite(Number(value))) throw new Error(`报表金额数据无效：${value}`);
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: format === 'money' ? 2 : 0, maximumFractionDigits: 2 });
  }
  if (format === 'integer') {
    if (!Number.isFinite(Number(value))) throw new Error(`报表数量数据无效：${value}`);
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  const date = dayjs(value);
  if (!date.isValid()) throw new Error(`报表日期数据无效：${value}`);
  return date.format(format === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : format === 'slashDate' ? 'YYYY/MM/DD' : 'YYYY-MM-DD');
}
export function buildReportWorkbook(id, filters = {}, selectedKeys = [], sort = null, access = DEFAULT_REPORT_ACCESS) {
  const definition = getReportDefinition(id);
  assertReportAccess(access, 'export');
  // 选中与全部导出均重用查询及权限，选中记录不能绕过数据范围。
  const matching = queryReport(id, filters, sort, access);
  const rows = definition.selectRows && selectedKeys.length ? matching.filter(row => selectedKeys.includes(row.id)) : matching;
  const body = rows.map(row => definition.exportColumns.map(column => {
    const value = Object.prototype.hasOwnProperty.call(row.exports || {}, column.key) ? row.exports[column.key] : row.values[column.key];
    return formatReportValue(value, column.format);
  }));
  const sheet = XLSX.utils.aoa_to_sheet([definition.exportColumns.map(column => column.label), ...body]);
  sheet['!cols'] = definition.exportColumns.map(column => ({ wch: Math.max(14, column.label.length * 2 + 4) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, definition.sheetName);
  return workbook;
}
export function exportReport(id, filters, selectedKeys, sort, access = DEFAULT_REPORT_ACCESS) {
  const workbook = buildReportWorkbook(id, filters, selectedKeys, sort, access);
  XLSX.writeFile(workbook, `${getReportDefinition(id).title}-${dayjs().format('YYYYMMDD')}.xlsx`);
}
