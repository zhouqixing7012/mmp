import {
  ASSET_MAINTENANCE_STORAGE_KEY,
  DEFAULT_ASSET_MAINTENANCE_ROWS,
} from '../mock/assetManagementMock';
import {
  CONSUMABLE_MAINTENANCE_STORAGE_KEY,
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS,
} from '../mock/consumableMaintenanceMock';
import { readDemoData, writeDemoData } from './demoStorage';

export function getAssetMaintenanceRows() {
  return readDemoData(ASSET_MAINTENANCE_STORAGE_KEY, DEFAULT_ASSET_MAINTENANCE_ROWS);
}

export function updateAssetMaintenanceRow(id, patch) {
  const rows = getAssetMaintenanceRows();
  const nextRows = rows.map((row) => (
    row.id === id ? { ...row, ...patch } : row
  ));
  writeDemoData(ASSET_MAINTENANCE_STORAGE_KEY, nextRows);
  return nextRows;
}

export function getConsumableMaintenanceRows() {
  return readDemoData(CONSUMABLE_MAINTENANCE_STORAGE_KEY, DEFAULT_CONSUMABLE_MAINTENANCE_ROWS);
}

export function updateConsumableMaintenanceRow(id, patch) {
  const rows = getConsumableMaintenanceRows();
  const nextRows = rows.map((row) => (
    row.id === id ? { ...row, ...patch } : row
  ));
  writeDemoData(CONSUMABLE_MAINTENANCE_STORAGE_KEY, nextRows);
  return nextRows;
}
