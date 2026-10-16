import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { applicationQueryRows, assetReportCatalog } from '../mock/businessRulesMock';
import { legacyDefinitions } from '../pages/applicationQueries/legacyDefinitions';
import { claimDefinitions } from '../pages/applicationQueries/claimDefinitions';
import { unfinishedDefinition } from '../pages/applicationQueries/unfinishedDefinition';
import { employeeApplicationDefinitions } from '../pages/applicationQueries/employeeApplicationDefinitions';
import { DEFAULT_APPLICATION_ACCESS, assertApplicationAccess, canReadApplication } from './applicationAccess';

export const applicationDefinitions = [...legacyDefinitions, ...claimDefinitions, ...employeeApplicationDefinitions, unfinishedDefinition];
const empty = value => value === '' || value === undefined || value === null || (Array.isArray(value) && !value.length);
const deletionStorageKey = 'mmp-application-query-deletions-v1';
function removedIds() {
  const saved = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(deletionStorageKey);
  if (!saved) return new Set();
  const ids = JSON.parse(saved);
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw new Error('申请查询会话数据格式无效');
  return new Set(ids);
}
const list = value => Array.isArray(value) ? value : empty(value) ? [] : [value];
export function getApplicationDefinition(id) {
  const definition = applicationDefinitions.find(item => item.id === id);
  if (!definition) throw new Error(`申请页面未定义：${id}`);
  return definition;
}
// 审批序号只决定顺序；不同人员及同一人的重复办理均保留，仅去除同一记录ID的重复关联。
export function applicationProgressRecords(history = []) {
  const sorted = history.slice().sort((a, b) => String(a.sequence || '').length - String(b.sequence || '').length
    || String(a.sequence || '').localeCompare(String(b.sequence || '')) || String(a.time || '').localeCompare(String(b.time || '')));
  const seen = new Set();
  return sorted.filter(row => {
    if (!row.id) throw new Error('审批记录缺少唯一标识');
    if (seen.has(row.id)) return false;
    seen.add(row.id); return true;
  });
}
export function selectUnfinishedTodo(record) {
  if (String(record.statusCode) !== '3') return null;
  const pending = applicationProgressRecords(record.history).filter(row => row.todo === true);
  if (!pending.length) return null;
  return { node: [...new Set(pending.map(row => row.node).filter(Boolean))].join('、'),
    approver: [...new Set(pending.filter(row => !String(row.account || '').endsWith('-1')).map(row => row.approver).filter(Boolean))].join('、') };
}
export function getApplicationOptions(id, field, access = DEFAULT_APPLICATION_ACCESS) {
  assertApplicationAccess(access, id);
  if (field.options) return field.options;
  if (field.label === '仓库') {
    const warehouseCodes = new Set(queryApplications(id, {}, null, access).flatMap(row => list(row.filters.warehouse)));
    return assetReportCatalog.warehouses.filter(row => row.status === '启用' && warehouseCodes.has(row.warehouseCode)).map(row => ({ value: row.warehouseCode, code: row.warehouseCode, name: row.warehouseDescription, label: row.warehouseCode + '.' + row.warehouseDescription, company: row.company }));
  }
  const found = new Map();
  const deleted = removedIds();
  applicationQueryRows.filter(row => row.kind === id && !row.deleted && !deleted.has(row.id) && canReadApplication(row, access)).forEach(row => {
    if (id === 'unfinished' && row.statusCode !== '3') return;
    list(row.filters[field.key]).filter(value => !empty(value)).forEach(value => {
      if (!found.has(String(value))) found.set(String(value), {
        value: String(value), code: String(value), label: row.optionLabels?.[field.key]?.[value] ?? row.lookupLabels?.[field.key] ?? row.values[field.key] ?? String(value),
      });
    });
  });
  return [...found.values()].map(option => ({ ...option, name: String(option.label) }));
}
export function validateApplicationFilters(definition, filters) {
  for (const [key, value] of Object.entries(filters)) {
    if (empty(value)) continue;
    const field = definition.filters.find(item => item.key === key);
    if (!field) throw new Error(`未知查询条件：${key}`);
    if (field.disabledReason) throw new Error(field.disabledReason);
    if (field.kind === 'date') {
      if (!Array.isArray(value) || value.length !== 2) throw new Error('日期范围格式不正确');
      if (value.some(date => date && !dayjs(date).isValid())) throw new Error('日期格式不正确');
      if (value[0] && value[1] && dayjs(value[0]).isAfter(dayjs(value[1]), 'day')) throw new Error('开始日期不能晚于结束日期');
    }
  }
}
export function queryApplications(id, filters = {}, sort = null, access = DEFAULT_APPLICATION_ACCESS) {
  assertApplicationAccess(access, id);
  const definition = getApplicationDefinition(id);
  validateApplicationFilters(definition, filters);
  const deleted = removedIds();
  const rows = applicationQueryRows.filter(row => row.kind === id && !row.deleted && !deleted.has(row.id) && canReadApplication(row, access)).filter(row => {
    if (id === 'unfinished' && String(row.statusCode) !== '3') return false;
    return definition.filters.every(field => {
      const selected = filters[field.key];
      if (empty(selected)) return true;
      const values = list(row.filters[field.key]);
      if (field.kind === 'date') {
        const actual = dayjs(values[0]);
        return actual.isValid() && (!selected[0] || !actual.isBefore(dayjs(selected[0]).startOf('day'))) && (!selected[1] || !actual.isAfter(dayjs(selected[1]).endOf('day')));
      }
      const choices = list(selected).map(item => String(item).trim());
      return choices.some(choice => values.some(value => {
        const text = String(value);
        if (field.match === 'contains') return text.includes(choice);
        if (field.match === 'prefix') return text.startsWith(choice);
        return text === choice;
      }));
    });
  });
  const key = id === 'unfinished' ? definition.sortKey : sort?.key || definition.sortKey;
  const direction = id !== 'unfinished' && sort?.order === 'ascend' ? 1 : -1;
  rows.sort((a, b) => {
    const first = a.values[key] ?? a[key], second = b.values[key] ?? b[key];
    return (typeof first === 'number' && typeof second === 'number' ? first - second : String(first ?? '').localeCompare(String(second ?? ''))) * direction;
  });
  const allowedOriginalLines = new Set(applicationQueryRows.filter(row => row.kind === id && !row.deleted && !deleted.has(row.id) && canReadApplication(row, access)).map(row => row.originalLineId).filter(Boolean));
  const scopedRows = rows.map(row => row.summary ? { ...row, summary: { ...row.summary, lines: row.summary.lines.filter(line => {
    if (!line.originalLineId) throw new Error('汇总明细缺少原申请明细关联');
    return allowedOriginalLines.has(line.originalLineId);
  }) } } : row);
  return scopedRows.map(row => id === 'unfinished' ? { ...row, values: { ...row.values, node: selectUnfinishedTodo(row)?.node || '', approver: selectUnfinishedTodo(row)?.approver || '' } } : row);
}
export function formatApplicationValue(value, format) {
  if (empty(value)) return '';
  if (format === 'date') { if (!dayjs(value).isValid()) throw new Error('日期数据无效'); return dayjs(value).format('YYYY-MM-DD'); }
  if (format === 'money' || format === 'number') {
    if (!Number.isFinite(Number(value))) throw new Error('数量或金额无效');
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: format === 'money' ? 2 : 0, maximumFractionDigits: 2 });
  }
  return value;
}
export function buildApplicationWorkbook(id, filters = {}, sort = null, page = null, access = DEFAULT_APPLICATION_ACCESS) {
  const definition = getApplicationDefinition(id);
  if (!definition.actions.export) throw new Error('此查询未定义导出');
  let rows = queryApplications(id, filters, sort, access);
  if (page) rows = rows.slice((page.current - 1) * page.pageSize, page.current * page.pageSize);
  const workbook = XLSX.utils.book_new();
  const sheets = definition.exportSheets || [{ name: definition.title,
    columns: definition.exportColumns || definition.columns.filter(column => !column.action), records: items => items.map(item => item.values) }];
  for (const spec of sheets) {
    const body = spec.records(rows).map(row => spec.columns.map(column => formatApplicationValue(row[column.key], column.format)));
    const sheet = XLSX.utils.aoa_to_sheet([spec.columns.map(column => column.label), ...body]);
    sheet['!cols'] = spec.columns.map(column => ({ wch: Math.max(18, column.label.length * 2 + 4) }));
    XLSX.utils.book_append_sheet(workbook, sheet, spec.name);
  }
  return workbook;
}
export function exportApplications(id, filters, sort, page, access = DEFAULT_APPLICATION_ACCESS) {
  XLSX.writeFile(buildApplicationWorkbook(id, filters, sort, page, access), `${getApplicationDefinition(id).title}-${dayjs().format('YYYYMMDD')}.xlsx`);
}
export function removeApplicationDrafts(id, keys, access = DEFAULT_APPLICATION_ACCESS) {
  assertApplicationAccess(access, id);
  const definition = getApplicationDefinition(id);
  if (!definition.actions.remove) throw new Error('此查询不支持删除');
  if (!keys.length) throw new Error('请先选择单据');
  const deleted = removedIds();
  const rows = keys.map(key => applicationQueryRows.find(row => row.kind === id && row.id === key && !row.deleted && !deleted.has(row.id) && canReadApplication(row, access)));
  if (rows.some(row => !row || String(row.statusCode) !== '0')) throw new Error('只能删除草稿单据');
  keys.forEach(key => deleted.add(key));
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(deletionStorageKey, JSON.stringify([...deleted]));
  rows.forEach(row => { row.deleted = true; });
  return { submitted: keys.length, succeeded: rows.length };
}
