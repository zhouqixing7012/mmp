import { formatAssetCategory } from '../../components/assetQueryModel';
// 三类盘点资产清单共用同一套导出字段，字段只从对应资产记录取值。
export const INVENTORY_ASSET_EXPORT_FIELDS = [
  ['计划编号', 'planNo'],
  ['盘点方式', 'inventoryMethod'],
  ['盘点状态', 'inventoryStatus'],
  ['盘点人', 'counter'],
  ['盘点日期', 'inventoryDate'],
  ['资产标签号', 'assetTag'],
  ['印刷号', 'printNo'],
  ['序列号', 'serialNo'],
  ['资产类别', 'assetCategory'],
  ['资产说明', 'description'],
  ['数量', 'quantity'],
  ['原值', 'originalValue'],
  ['EBS原值', 'ebsOriginalValue'],
  ['净值', 'netValue'],
  ['使用状态', 'useStatus'],
  ['NO位置', 'noLocation'],
  ['NO状态', 'noStatus'],
  ['备注', 'remark'],
  ['使用说明', 'useDescription'],
  ['资产责任人编号', 'ownerNo'],
  ['资产责任人', 'owner'],
  ['责任人部门', 'ownerDept'],
  ['责任人职级', 'ownerLevel'],
  ['City', 'city'],
  ['Building', 'building'],
  ['Floor', 'floor'],
  ['账套', 'accountBook'],
  ['成本中心', 'costCenter'],
  ['启用日期', 'enableDate'],
  ['NO扫描资产标签号', 'noScanAssetTag'],
  ['NO扫描序列号', 'noScanSerialNo'],
  ['NO扫描型号', 'noScanModel'],
  ['NO扫描品牌', 'noScanBrand'],
  ['NO扫描位置', 'noScanLocation'],
];

export function serializeInventoryAssetExport(rows) {
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [INVENTORY_ASSET_EXPORT_FIELDS.map(([label]) => cell(label)).join(',')];
  rows.forEach((row) => lines.push(INVENTORY_ASSET_EXPORT_FIELDS.map(([, key]) => cell(key === 'assetCategory' ? formatAssetCategory(row) : row[key])).join(',')));
  const missingFields = INVENTORY_ASSET_EXPORT_FIELDS
    .filter(([, key]) => rows.some((row) => key === 'assetCategory' ? !row.category || !row.subCategory : !Object.prototype.hasOwnProperty.call(row, key)))
    .map(([label]) => label);
  return { csv: lines.join('\r\n'), missingFields };
}
