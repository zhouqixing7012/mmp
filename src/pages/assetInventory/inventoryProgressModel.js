import { inventoryAssetQuantity } from './inventoryQuantity';
import { matchesAssetCategory, matchesQuerySelection } from '../../components/assetQueryModel';
import * as XLSX from 'xlsx';
import { hasInventoryUploadedPhoto } from './inventoryPlanExport';
import { executionAssetFields } from './inventoryExecutionAssetFields';
import { inventoryResultSource } from './inventoryResultSource';
import { inventoryRemark } from './inventoryRemark';
import { formatAssetCategory } from '../../components/assetQueryModel';

export const isUncountedProgressAsset = (asset) => !['已盘', '代盘'].includes(asset.inventoryStatus);

export function progressAssetDepartment(asset) {
  if (['库房', '公共'].includes(asset.inventoryRange)) return '虚拟组织';
  return asset.executorDepartment ? asset.executorDepartment.split('.').slice(0, 2).join('.') : '-';
}

export function filterProgressAssets(assets, query = {}) {
  return assets.filter(asset => ['assetTag', 'serialNo', 'description'].every(field => !query[field]
    || String(asset[field] || '').toLowerCase().includes(query[field].trim().toLowerCase()))
    && matchesAssetCategory(asset, query.category)
    && ['owner', 'ownerLevel', 'inventoryStatus', 'city', 'executor', 'inventoryRange', 'organization'].every(field => matchesQuerySelection(asset[field], query[field]))
    && matchesQuerySelection(progressAssetDepartment(asset), query.firstLevelDepartment));
}

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
      ...asset, planNo: plan.planNo, inventoryRange: plan.range, uploadedPhoto: hasInventoryUploadedPhoto(asset),
      supervisor: asset.supervisor ?? plan.supervisor,
      financialSupervisor: project.projectType === '复盘' ? '徐博' : plan.financialSupervisor,
      executor: asset.executor ?? plan.executor,
      executorDepartment: plan.executorDepartment ?? employees.find((person) => person.employeeName === (asset.executor ?? plan.executor))?.department,
    })));
  const groups = new Map();
  assets.forEach((asset) => {
    const department = progressAssetDepartment(asset);
    const key = [asset.inventoryRange, asset.organization, department, asset.city].join('::');
    if (!groups.has(key)) groups.set(key, { key, range: asset.inventoryRange, organization: asset.organization, department, city: asset.city,
      expected: 0, counted: 0, assets: [], supervisor: [], financialSupervisor: [], remainingDays: remainingDays(project, today) });
    const row = groups.get(key);
    const quantity = inventoryAssetQuantity(asset);
    row.expected += quantity;
    if (['已盘', '代盘'].includes(asset.inventoryStatus)) row.counted += quantity;
    row.assets.push(asset);
    ['supervisor', 'financialSupervisor'].forEach((field) => {
      if (asset[field] && asset[field] !== '-' && !row[field].includes(asset[field])) row[field].push(asset[field]);
    });
  });
  const details = [...groups.values()].map((row) => ({ ...row,
    ...Object.fromEntries(['supervisor', 'financialSupervisor'].map((field) => [field, row[field].join('、') || '-'])),
    assetTags: row.assets.map((asset) => asset.assetTag), uncounted: row.expected - row.counted,
    progress: row.expected ? Number((row.counted / row.expected * 100).toFixed(1)) : 0,
  }));
  const summary = allowedRanges.map((range) => {
    const children = details.filter((row) => row.range === range);
    const sum = (field) => children.reduce((total, row) => total + row[field], 0);
    const expected = sum('expected'), counted = sum('counted');
    return { key: 'progress-' + range, range, startDate: project?.startDate || '-', endDate: project?.endDate || '-',
      expected, counted, uncounted: sum('uncounted'), progress: expected ? Number((counted / expected * 100).toFixed(1)) : 0 };
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

export function createProgressAssetWorkbook(assets, includeNo = true) {
  const workbook = XLSX.utils.book_new();
  const fields = executionAssetFields(includeNo);
  const value = (asset, key) => key === 'assetCategory' ? formatAssetCategory(asset)
    : key === 'resultSource' ? inventoryResultSource(asset)
      : key === 'inventoryRemark' ? inventoryRemark(asset) : asset[key] ?? '';
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    fields.map(([title]) => title), ...assets.map(asset => fields.map(([, key]) => value(asset, key))),
  ]), '资产清单');
  return workbook;
}

export function createInventoryProgressExportWorkbook({ summaryRows, summaryColumns = [], detailRows, detailColumns, includeNo = true }) {
  const workbook = XLSX.utils.book_new();
  const append = (rows, columns, name) => {
    const sheet = createProgressWorkbook(rows, columns, name);
    XLSX.utils.book_append_sheet(workbook, sheet.Sheets[name], name);
  };
  if (summaryRows) append(summaryRows, summaryColumns, '项目进度');
  append(detailRows, detailColumns, '进度详情');
  const assets = [...new Map(detailRows.flatMap(row => row.assets).map(asset => [asset.assetTag || asset.key || asset, asset])).values()];
  const assetBook = createProgressAssetWorkbook(assets, includeNo);
  XLSX.utils.book_append_sheet(workbook, assetBook.Sheets['资产清单'], '资产清单');
  return workbook;
}
