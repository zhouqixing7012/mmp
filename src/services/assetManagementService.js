import {
  ASSET_MAINTENANCE_STORAGE_KEY,
  DEFAULT_ASSET_MAINTENANCE_ROWS,
} from '../mock/assetManagementMock';
import {
  CONSUMABLE_MAINTENANCE_STORAGE_KEY,
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS,
} from '../mock/consumableMaintenanceMock';
import {
  CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY,
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS,
} from '../mock/contractNumberMaintenanceMock';
import { readDemoData, writeDemoData } from './demoStorage';

const ASSET_MAINTENANCE_EDIT_FIELDS = [
  'costCenter', 'city', 'building', 'floor', 'status', 'serialNumber', 'remarks', 'assetMark', 'usageDescription', 'purpose',
];
const LEGACY_INVENTORY_TYPE_VALUES = new Set(['普通盘点', '快速盘点', '扫码枪盘点']);

const DEFAULT_ASSET_ROW_MAP = new Map(
  DEFAULT_ASSET_MAINTENANCE_ROWS.map((row) => [String(row.id), row]),
);

function deriveLatestInventoryYear(row) {
  const latest = [...(row.inventoryRecords || [])]
    .filter(record => record?.time)
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))[0];
  return latest?.time ? String(latest.time).slice(0, 4) : '';
}

function normalizeInventoryRecords(records = []) {
  return records.map((record) => {
    const inventoryYear = record?.time ? String(record.time).slice(0, 4) : '';
    return {
      ...record,
      projectStartTime: record.projectStartTime || record.time || '',
      type: LEGACY_INVENTORY_TYPE_VALUES.has(record.type) ? '初盘' : record.type,
      flag: record.flag === '正常' && inventoryYear ? `年度-${inventoryYear}` : record.flag,
      status: record.status === '待盘' ? '代盘' : record.status,
    };
  });
}

function normalizeTransactionHistory(records = []) {
  return records.map((record) => {
    if (!record?.documentNo && record?.applicationNo) {
      return { ...record, applicationNo: '' };
    }
    return record;
  });
}

function normalizeAssetMaintenanceRow(row) {
  const defaultRow = DEFAULT_ASSET_ROW_MAP.get(String(row.id)) || {};
  const mergedRow = {
    ...defaultRow,
    ...row,
  };
  const inventoryRecords = normalizeInventoryRecords(mergedRow.inventoryRecords || []);

  return {
    ...mergedRow,
    inventoryRecords,
    transactionHistory: normalizeTransactionHistory(mergedRow.transactionHistory || []),
    inventoryFlag: deriveLatestInventoryYear({ ...mergedRow, inventoryRecords }),
  };
}

function buildAssetMaintenanceTransaction(row, operationDate) {
  return {
    id: `asset-maint-${row.id}-${Date.now()}`,
    operationType: '资产维护修改',
    operationDate,
    operator: '115102-王英',
    documentNo: '',
    applicationNo: '',
    tag: row.tag || '',
    serialNumber: row.serialNumber || '',
    mainTag: row.mainTag || '',
    category: [row.majorCategory, row.minorCategory].filter(Boolean).join('.'),
    assetDesc: row.assetDesc || '',
    owner: [row.ownerId, row.ownerName].filter(Boolean).join('-'),
    costCenter: row.costCenter || '',
    feeAccount: row.feeAccount || '',
    company: [row.companyCode, row.company].filter(Boolean).join('.'),
    location: [row.city, row.building, row.floor].filter(Boolean).join('.'),
    purpose: row.purpose || '',
    status: row.status || '',
    usageDescription: row.usageDescription || '',
    remarks: row.remarks || '',
    service: row.service || '',
    config: row.config || '',
    noLocation: row.noLocation || '',
    upgradeAmount: row.upgradeAmount || 0,
  };
}

export function getAssetMaintenanceRows() {
  return readDemoData(ASSET_MAINTENANCE_STORAGE_KEY, DEFAULT_ASSET_MAINTENANCE_ROWS)
    .map(normalizeAssetMaintenanceRow);
}

export function updateAssetMaintenanceRow(id, patch) {
  const rows = getAssetMaintenanceRows();
  const nextRows = rows.map((row) => {
    if (row.id !== id) return row;
    const hasMaintenanceChange = ASSET_MAINTENANCE_EDIT_FIELDS.some((field) => (
      Object.prototype.hasOwnProperty.call(patch, field)
      && String(row[field] ?? '') !== String(patch[field] ?? '')
    ));
    const nextRow = normalizeAssetMaintenanceRow({ ...row, ...patch });
    if (!hasMaintenanceChange) return nextRow;

    const operationDate = patch.updatedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
    const transaction = buildAssetMaintenanceTransaction(nextRow, operationDate);
    return {
      ...nextRow,
      transactionHistory: [transaction, ...(nextRow.transactionHistory || [])],
    };
  });
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

export function getContractNumberMaintenanceRows() {
  return readDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS);
}

export function updateContractNumberMaintenanceRow(id, patch) {
  const rows = getContractNumberMaintenanceRows();
  const nextRows = rows.map((row) => (
    row.id === id ? { ...row, ...patch } : row
  ));
  writeDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, nextRows);
  return nextRows;
}
