import * as XLSX from 'xlsx';
import { scopeAssetOwner } from './inventoryScopeAssetDisplay';
import { INVENTORY_PEOPLE } from './inventoryPeople';
import { EMPLOYEE_ROWS } from './mockData';
import { selectInventoryExportRows } from './inventoryPlanExport';

export const PHOTO_REVIEW_EXPORT_HEADERS = ['资产标签号', '资产信息', '资产责任人', '盘点日期', '盘点状态', '审批状态'];
export function inventoryPhotoReviewExportWorkbook(rows, people = [...INVENTORY_PEOPLE, ...EMPLOYEE_ROWS]) {
  const matrix = [PHOTO_REVIEW_EXPORT_HEADERS, ...rows.map(row => {
    const asset = row.asset;
    return [String(asset.assetTag ?? ''), [asset.category || '', asset.subCategory || '', asset.description || ''].join('/'),
      scopeAssetOwner(asset, people), asset.inventoryDate || '', asset.inventoryStatus || '', row.reviewStatus || ''];
  })];
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(matrix);
  sheet['!cols'] = [{ wch: 22 }, { wch: 60 }, { wch: 26 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(book, sheet, '图片审核');
  return book;
}
export function downloadInventoryPhotoReviewExport(filteredRows, allRows, projectNo) {
  const book = inventoryPhotoReviewExportWorkbook(selectInventoryExportRows(filteredRows, allRows));
  XLSX.writeFile(book, `${projectNo || '盘点项目'}-图片审核.xlsx`);
}
