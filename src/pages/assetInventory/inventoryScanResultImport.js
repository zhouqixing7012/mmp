import { inventoryExecutionBlockReason } from './inventoryExecutionRules';
import * as XLSX from 'xlsx';
import { INVENTORY_CREATORS } from './inventoryCreatorPermissions';
import { inventoryRemark } from './inventoryRemark';
import { saveMobileInventoryResultsBatch } from './inventoryMobileResultStore';

const text = value => String(value ?? '').trim();
export function inventoryScanImporter(operator) {
  if (operator && typeof operator === 'object') return { name: text(operator.employeeName || operator.name), employeeNo: text(operator.employeeNo), value: text(operator.value) };
  const value = text(operator);
  const known = INVENTORY_CREATORS.find(person => person.value === value);
  const match = value.match(/^(\d+)-(.+)$/);
  return { name: known ? known.label.split('-').slice(1).join('-') : match ? match[2] : value, employeeNo: match?.[1] || '', value };
}
const samePerson = (value, person) => {
  const other = inventoryScanImporter(value);
  if (!other.name || !person.name || ['-', '系统', '系统管理员'].includes(other.name)) return false;
  return other.employeeNo && person.employeeNo ? other.employeeNo === person.employeeNo : other.name === person.name;
};
const creator = (project, person) => samePerson(project?.creator, person);
const roomProject = context => context.project?.scopeRanges?.length
  ? context.project.scopeRanges.every(range => range === '机房') : context.assets.length > 0 && context.assets.every(asset => asset.inventoryRange === '机房');
const canImportAsset = (context, asset, person) => creator(context.project, person)
  || (roomProject(context) && asset.inventoryRange === '机房' && samePerson(asset.executorNo ? { employeeNo: asset.executorNo, name: asset.executor } : asset.executor, person));

export function inventoryScanResultImportBlockReason(context) {
  const { project, plan, operator, assets = [] } = context;
  if (!project?.projectNo) return '缺少盘点项目编号，不能导入扫描结果';
  const executionBlock = inventoryExecutionBlockReason({ project, plan });
  if (executionBlock) return executionBlock;
  if (project.status !== '盘点中') return '仅盘点中的项目可以导入扫描结果';
  if (plan && plan.status !== '盘点中') return '仅盘点中的计划可以导入扫描结果';
  const person = inventoryScanImporter(operator);
  if (!person.name || person.name === '-') return '无法确认当前登录导入人';
  if (!plan && !['execution', 'notExecution'].includes(context.entryType)) return '无法确认当前扫描结果导入入口';
  if (!creator(project, person) && !assets.some(asset => canImportAsset({ ...context, assets }, asset, person))) return '仅项目创建人或机房项目本人执行资产的执行人可以导入扫描结果';
  return '';
}

function assetPlanBlockReason(asset, context) {
  const executionBlock = inventoryExecutionBlockReason({ project: context.project, plan: context.plan, assetTag: asset.assetTag });
  if (executionBlock) return executionBlock;
  if (context.plan) return asset.planNo && asset.planNo !== '-' && asset.planNo !== context.plan.planNo ? '资产不属于当前盘点计划' : '';
  const planNo = text(asset.planNo);
  if (!planNo || planNo === '-') return context.entryType === 'notExecution' ? '' : '执行资产尚未进入盘点计划，不能导入扫描结果';
  const plan = (context.plans || []).find(item => item.planNo === planNo);
  if (!plan) return '无法核验资产所属盘点计划状态，不能导入扫描结果';
  return plan.status === '盘点中' ? '' : `资产所属计划${planNo}不是盘点中，不能导入扫描结果`;
}

const cellText = cell => cell == null || cell.v == null ? '' : cell.t === 'n' && (!cell.z || cell.z === 'General') ? String(cell.v) : String(cell.w ?? cell.v);
// 每张工作表均跳过第一行，只读取A/B，不把额外列当作标签或备注。
export function readInventoryScanWorkbook(workbook) {
  const entries = [];
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet?.['!ref']) return;
    const end = XLSX.utils.decode_range(sheet['!ref']).e.r;
    for (let row = 1; row <= end; row += 1) {
      const assetTag = text(cellText(sheet[`A${row + 1}`]));
      const remark = cellText(sheet[`B${row + 1}`]);
      if (!assetTag && !remark.trim()) continue;
      entries.push({ sheet: sheetName, row: row + 1, assetTag, remark });
    }
  });
  return entries;
}

export function validateInventoryScanEntries(entries, context) {
  const errors = [];
  const blocked = inventoryScanResultImportBlockReason(context);
  if (blocked) return [{ sheet: '', row: '', assetTag: '', reason: blocked }];
  const byTag = new Map();
  context.assets.forEach(asset => {
    const tag = String(asset.assetTag);
    byTag.set(tag, [...(byTag.get(tag) || []), asset]);
  });
  const seen = new Map();
  const person = inventoryScanImporter(context.operator);
  entries.forEach(entry => {
    let reason = '';
    const matches = byTag.get(entry.assetTag);
    if (!entry.assetTag) reason = '资产标签号不能为空';
    else if (seen.has(entry.assetTag)) { const first = seen.get(entry.assetTag); reason = `文件内标签重复，首次位于${first.sheet}第${first.row}行`; }
    else if (!matches?.length) reason = '资产不属于当前入口授权的盘点资产清单';
    else if (matches.length !== 1) reason = '当前清单中资产标签号不唯一';
    else if (!canImportAsset(context, matches[0], person)) reason = '无权导入该资产，仅可处理本人执行的机房资产';
    else reason = assetPlanBlockReason(matches[0], context);
    if (reason) errors.push({ ...entry, reason });
    if (entry.assetTag && !seen.has(entry.assetTag)) seen.set(entry.assetTag, entry);
  });
  if (!entries.length) errors.push({ sheet: '', row: '', assetTag: '', reason: 'Excel中没有有效扫描结果' });
  return errors;
}

export function importInventoryScanResults(entries, context, now = new Date()) {
  const errors = validateInventoryScanEntries(entries, context);
  if (errors.length) return { success: false, errors, updates: [] };
  const person = inventoryScanImporter(context.operator);
  const byTag = new Map(context.assets.map(asset => [String(asset.assetTag), asset]));
  let updates;
  try {
    saveMobileInventoryResultsBatch(context.project.projectNo, previous => {
      const next = { ...previous };
      updates = entries.map(entry => {
        const asset = byTag.get(entry.assetTag);
        const old = previous[entry.assetTag] || {};
        const hasSavedRemark = ['inventoryRemark', 'inventoryNote', 'lossReason'].some(field => old[field] != null);
        const remark = entry.remark.trim() !== '' ? entry.remark : inventoryRemark(hasSavedRemark ? old : asset);
        // EXISTS在当前盘点模型中对应“已盘”，不按责任人关系改成代盘。
        const result = { ...old, status: '已盘', inventoryBy: person.name, inventoryDate: now.toISOString(), inventoryRemark: remark, resultSource: '人工导入', ...(context.plan?.planNo ? { planNo: context.plan.planNo } : {}) };
        next[entry.assetTag] = result;
        return { assetTag: entry.assetTag, result };
      });
      return next;
    });
    return { success: true, errors: [], updates };
  } catch (error) {
    return { success: false, errors: [{ sheet: '', row: '', assetTag: '', reason: `扫描结果保存失败，本批次未保存：${error.message}` }], updates: [] };
  }
}

export function applyInventoryScanResults(assets, updates) {
  const byTag = new Map(updates.map(update => [update.assetTag, update.result]));
  return assets.map(asset => {
    const result = byTag.get(String(asset.assetTag));
    return result ? { ...asset, inventoryStatus: result.status, counter: result.inventoryBy, inventoryBy: result.inventoryBy, inventoryDate: result.inventoryDate, inventoryRemark: result.inventoryRemark, resultSource: result.resultSource } : asset;
  });
}

export function inventoryScanErrorsWorkbook(errors) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['工作表', '行号', '资产标签号', '盘点备注', '错误原因'], ...errors.map(error => [error.sheet, error.row, error.assetTag, error.remark ?? '', error.reason])]), '导入错误');
  return workbook;
}
