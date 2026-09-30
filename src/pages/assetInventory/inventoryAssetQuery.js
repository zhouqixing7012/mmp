import { matchesAssetCategory, matchesQuerySelection } from '../../components/assetQueryModel';

export const EMPTY_INVENTORY_ASSET_QUERY = {
  assetTag: '', category: [], serialNo: '', costCenter: '', description: '', useStatus: '',
  owner: [], ownerLevel: [], ownerDept: '', executor: [], supervisor: [], city: '', building: '',
  enableFrom: '', enableTo: '', inventoryMethod: '', inventoryStatus: '', noStatus: '', range: '',
};

export function filterInventoryAssets(rows, filters) {
  const textFields = ['assetTag', 'serialNo', 'costCenter', 'description'];
  const selectFields = ['useStatus', 'owner', 'ownerLevel', 'ownerDept', 'executor', 'supervisor', 'city', 'building', 'inventoryMethod', 'inventoryStatus', 'noStatus'];
  return rows.filter((row) => textFields.every((field) => !filters[field] || String(row[field] || '').toLowerCase().includes(filters[field].trim().toLowerCase()))
    && selectFields.every((field) => matchesQuerySelection(row[field], filters[field]))
    && matchesAssetCategory(row, filters.category)
    && matchesQuerySelection(row.inventoryRange, filters.range)
    && (!filters.enableFrom || (Boolean(row.enableDate) && row.enableDate >= filters.enableFrom))
    && (!filters.enableTo || (Boolean(row.enableDate) && row.enableDate <= filters.enableTo)));
}
