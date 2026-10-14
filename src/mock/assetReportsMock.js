import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';
import { reportAssets, reportConsumables, addedAssets, retiredAssets } from './assetReportsFixtures';
import { reportTransactions } from './assetReportsTransactions';
import { newEmployeeClaims, stockClaims, purchaseClaims, consumableClaims, consumableClaimDetails } from './assetReportsClaims';

// 报表数据仅用于原型演示；完成节点快照与当前台账分别保存。
export const assetReportRows = {
  'report-1-1': reportAssets, 'report-2-1': reportConsumables, 'report-3-1': reportTransactions,
  'report-4-1': newEmployeeClaims, 'report-5-1': addedAssets,
  'report-6-1': stockClaims, 'report-6-2': purchaseClaims,
  'report-7-1': consumableClaims, 'report-7-2': consumableClaimDetails,
  'report-8-1': retiredAssets,
};
export const assetReportCatalog = { materials: materialCatalog, warehouses: warehouseCatalog };
