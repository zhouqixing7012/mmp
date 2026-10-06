import * as XLSX from 'xlsx';
import { PLAN_ASSET_EXPORT_FIELDS, planAssetExportValues } from './inventoryPlanExport';

export const PROGRESS_ASSET_FIELDS = [
  ...PLAN_ASSET_EXPORT_FIELDS,
  ['责任人办公电话', 'officePhone'], ['责任人邮箱', 'email'],
  ['现资产责任人', 'currentOwner'], ['现资产责任人部门', 'currentOwnerDept'],
  ['盘点组织', 'organization'], ['计划负责人', 'planManager'],
  ['盘点监督人', 'supervisor'], ['盘点执行人', 'executor'],
  ['NO扫描数据核对差异', 'noScanDiff'], ['未盘说明', 'inventoryNote'], ['是否上传图片', 'needPhoto'],
];

export const isUncountedProgressAsset = (asset) => !['已盘', '代盘', '报失'].includes(asset.inventoryStatus);

function remainingDays(project, today) {
  if (!project?.endDate) return '-';
  const end = new Date(project.endDate.slice(0, 10) + 'T00:00:00');
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end - current) / 86400000);
}

// 所有数量及下钻明细均来自本项目实际关联的计划资产，不独立编造汇总数量。
export function buildInventoryProgress(project, allowedRanges, plans, assetsForPlan, employees = [], today = new Date()) {
  const assets = plans.filter((plan) => allowedRanges.includes(plan.range)).flatMap((plan) => assetsForPlan(plan)
    .filter((asset) => asset.executeInventory !== false && asset.inventoryStatus !== '未执行盘点')
    .map((asset) => ({
      ...asset, planNo: plan.planNo, inventoryRange: plan.range,
      planManager: plan.manager, supervisor: plan.supervisor,
      financialSupervisor: plan.financialSupervisor, auditSupervisor: plan.auditSupervisor,
      executor: plan.executor,
      executorDepartment: plan.executorDepartment ?? employees.find((person) => person.employeeName === plan.executor)?.department,
    })));
  const groups = new Map();
  assets.forEach((asset) => {
    const department = ['库房', '公共'].includes(asset.inventoryRange) ? '虚拟组织'
      : asset.executorDepartment ? asset.executorDepartment.split('.').slice(0, 2).join('.') : '-';
    const key = [asset.inventoryRange, asset.organization, department, asset.city].join('::');
    if (!groups.has(key)) groups.set(key, { key, range: asset.inventoryRange, organization: asset.organization, department, city: asset.city,
      expected: 0, counted: 0, lost: 0, assets: [], supervisor: [], financialSupervisor: [], auditSupervisor: [], remainingDays: remainingDays(project, today) });
    const row = groups.get(key);
    const quantity = Number(asset.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) throw new Error('盘点资产数量不正确');
    row.expected += quantity;
    if (['已盘', '代盘'].includes(asset.inventoryStatus)) row.counted += quantity;
    if (asset.inventoryStatus === '报失') row.lost += quantity;
    row.assets.push(asset);
    ['supervisor', 'financialSupervisor', 'auditSupervisor'].forEach((field) => {
      if (asset[field] && asset[field] !== '-' && !row[field].includes(asset[field])) row[field].push(asset[field]);
    });
  });
  const details = [...groups.values()].map((row) => ({ ...row,
    ...Object.fromEntries(['supervisor', 'financialSupervisor', 'auditSupervisor'].map((field) => [field, row[field].join('、') || '-'])),
    assetTags: row.assets.map((asset) => asset.assetTag), uncounted: row.expected - row.counted - row.lost,
    progress: row.expected ? Number((row.counted / row.expected * 100).toFixed(1)) : 0,
  }));
  const summary = allowedRanges.map((range) => {
    const children = details.filter((row) => row.range === range);
    const sum = (field) => children.reduce((total, row) => total + row[field], 0);
    const expected = sum('expected'), counted = sum('counted');
    return { key: 'progress-' + range, range, startDate: project?.startDate || '-', endDate: project?.endDate || '-',
      expected, counted, lost: sum('lost'), uncounted: sum('uncounted'), progress: expected ? Number((counted / expected * 100).toFixed(1)) : 0 };
  });
  return { assets, details, summary };
}

export function filterProgressRows(rows, filters) {
  return rows.filter((row) => Object.entries(filters).every(([field, selected]) => !selected?.length || selected.some((value) => String(value) === String(row[field]))));
}

export function createProgressWorkbook(rows, columns, sheetName) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    columns.map(([title]) => title), ...rows.map((row) => columns.map(([, field]) => row[field] ?? '')),
  ]), sheetName);
  return workbook;
}

export function createProgressAssetWorkbook(assets) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    PROGRESS_ASSET_FIELDS.map(([title]) => title),
    ...assets.map((asset) => [...planAssetExportValues(asset), ...PROGRESS_ASSET_FIELDS.slice(PLAN_ASSET_EXPORT_FIELDS.length)
      .map(([, field]) => field === 'needPhoto' ? (asset.needPhoto === undefined ? '' : asset.needPhoto ? '是' : '否') : asset[field] ?? '')]),
  ]), '资产清单');
  return workbook;
}

