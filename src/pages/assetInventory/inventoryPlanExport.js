import { inventoryRemark } from './inventoryRemark';
import * as XLSX from 'xlsx';
import { INVENTORY_ASSET_EXPORT_FIELDS } from './inventoryAssetExport';
import { formatAssetCategory } from '../../components/assetQueryModel';
import { inventoryResultSource } from './inventoryResultSource';

// 资产备注与盘点备注分别保存；报失原因属于盘点备注，不覆盖资产备注。
export const PLAN_ASSET_EXPORT_FIELDS = [
  ...INVENTORY_ASSET_EXPORT_FIELDS,
  ['盘点备注', 'inventoryRemark'],
];
const PLAN_FIELDS = [
  ['计划编号', 'planNo'], ['计划名称', 'planName'], ['计划状态', 'status'],
  ['子公司', 'organization'], ['盘点范围', 'range'], ['盘点开始日期', 'startDate'],
  ['盘点结束日期', 'endDate'],
];

export function hasInventoryUploadedPhoto(asset) {
  return Object.values(asset.photos || {}).some(value => Array.isArray(value) ? value.length > 0 : Boolean(value));
}

export function mergePlanInventoryResult(asset, result, photoReview) {
  if (!result && !photoReview) return asset;
  // 审核记录 status 保存盘点结论（审核中/已盘/未盘），不是页面上的图片审核状态文案。
  const exempt = ['扫码枪', '人工导入'].includes(result?.resultSource) || result?.status === '报失';
  const reviewStatus = exempt ? undefined : photoReview?.status;
  result = result || {};
  return {
    ...asset,
    ...((result.photos ?? photoReview?.photos) !== undefined ? { photos: result.photos ?? photoReview?.photos } : {}),
    ...(result.status !== undefined ? { inventoryStatus: result.status } : {}),
    ...(result.inventoryBy !== undefined ? { counter: result.inventoryBy } : {}),
    ...(result.inventoryDate !== undefined ? { inventoryDate: result.inventoryDate } : {}),
    ...(result.resultSource !== undefined ? { resultSource: result.resultSource } : {}),
    ...(result.inventoryNote !== undefined ? { inventoryNote: result.inventoryNote } : {}),
    ...(['inventoryRemark', 'inventoryNote', 'lossReason'].some(key => result[key] != null) ? { inventoryRemark: inventoryRemark(result) } : {}),
    ...(result.lossReason !== undefined ? { lossReason: result.lossReason } : {}),
    ...(reviewStatus !== undefined ? { inventoryStatus: reviewStatus } : {}),
  };
}

export function planAssetExportValues(asset) {
  return PLAN_ASSET_EXPORT_FIELDS.map(([, key]) => {
    if (key === 'assetCategory') return formatAssetCategory(asset);
    if (key === 'resultSource') return inventoryResultSource(asset);
    if (key === 'inventoryRemark') return inventoryRemark(asset);
    return asset[key] ?? '';
  });
}

export function createInventoryPlanWorkbook(plans, assetsForPlan) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    PLAN_FIELDS.map(([label]) => label),
    ...plans.map(plan => PLAN_FIELDS.map(([, key]) => plan[key] ?? '')),
  ]), '计划信息');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    PLAN_ASSET_EXPORT_FIELDS.map(([label]) => label),
    ...plans.flatMap(plan => assetsForPlan(plan).map(asset => planAssetExportValues({ ...asset, planNo: plan.planNo }))),
  ]), '关联资产清单');
  return workbook;
}

export function downloadInventoryPlans(plans, assetsForPlan, projectNo) {
  XLSX.writeFile(createInventoryPlanWorkbook(plans, assetsForPlan), `${projectNo}-盘点计划.xlsx`);
}

export function downloadInventoryPlanAssets(assets, planNo) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    PLAN_ASSET_EXPORT_FIELDS.map(([label]) => label),
    ...assets.map(asset => planAssetExportValues({ ...asset, planNo })),
  ]), '资产清单');
  XLSX.writeFile(workbook, `${planNo}-资产清单.xlsx`);
}
