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
const CONSUMABLE_MAINTENANCE_EDIT_FIELDS = [
  'company', 'serialNumber', 'status', 'ownerId', 'ownerName', 'city', 'building', 'floor',
  'enabledDate', 'mainTag', 'mainAssetDesc', 'warehouse', 'usageDescription', 'remarks',
];
const CONSUMABLE_ALLOWED_PATCH_FIELDS = new Set([...CONSUMABLE_MAINTENANCE_EDIT_FIELDS, 'updatedAt']);
const LEGACY_INVENTORY_TYPE_VALUES = new Set(['普通盘点', '快速盘点', '扫码枪盘点']);

const DEFAULT_ASSET_ROW_MAP = new Map(
  DEFAULT_ASSET_MAINTENANCE_ROWS.map((row) => [String(row.id), row]),
);
const DEFAULT_CONSUMABLE_ROW_MAP = new Map(
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS.map((row) => [String(row.id), row]),
);
const CONSUMABLE_COMPANY_CODE_BY_NAME = new Map(
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS.map((row) => [String(row.company), row.companyCode || '']),
);
const CONSUMABLE_OWNER_DEPARTMENT_BY_ID = new Map(
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS.map((row) => [String(row.ownerId), row.department || '']),
);

function deriveLatestInventoryYear(row) {
  const latest = [...(row.inventoryRecords || [])]
    .filter(record => record?.time && record.projectStatus === '已关闭')
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))[0];
  return latest?.time ? String(latest.time).slice(0, 4) : '';
}

function normalizeInventoryRecords(records = []) {
  return records.map((record) => {
    const inventoryYear = record?.time ? String(record.time).slice(0, 4) : '';
    return {
      ...record,
      projectStatus: record.projectStatus || '已关闭',
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
    assetType: mergedRow.assetType || '公司资产',
    inventoryRecords,
    transactionHistory: normalizeTransactionHistory(mergedRow.transactionHistory || []),
    inventoryFlag: deriveLatestInventoryYear({ ...mergedRow, inventoryRecords }),
  };
}

function normalizeConsumableMaintenanceRow(row) {
  const defaultRow = DEFAULT_CONSUMABLE_ROW_MAP.get(String(row.id)) || {};
  return {
    ...defaultRow,
    ...row,
    transactionHistory: Array.isArray(row.transactionHistory)
      ? row.transactionHistory
      : (defaultRow.transactionHistory || []),
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

function buildConsumableMaintenanceTransaction(row, operationDate, changes) {
  return {
    id: `consumable-maint-${row.id}-${Date.now()}`,
    operationType: '耗材维护修改',
    operationDate,
    operator: '115102-王英',
    documentNo: '',
    applicationNo: '',
    tag: row.tag || '',
    serialNumber: row.serialNumber || '',
    category: [row.majorCategory, row.minorCategory].filter(Boolean).join('.'),
    assetDesc: row.assetDesc || '',
    owner: [row.ownerId, row.ownerName].filter(Boolean).join('.'),
    company: [row.companyCode, row.company].filter(Boolean).join('.'),
    location: [row.city, row.building, row.floor].filter(Boolean).join('.'),
    status: row.status || '',
    usageDescription: row.usageDescription || '',
    remarks: row.remarks || '',
    mainTag: row.mainTag || '',
    changes,
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
  return readDemoData(CONSUMABLE_MAINTENANCE_STORAGE_KEY, DEFAULT_CONSUMABLE_MAINTENANCE_ROWS)
    .map(normalizeConsumableMaintenanceRow);
}

export function updateConsumableMaintenanceRow(id, patch) {
  const invalidFields = Object.keys(patch).filter((field) => !CONSUMABLE_ALLOWED_PATCH_FIELDS.has(field));
  if (invalidFields.length) {
    throw new Error(`耗材维护存在不允许修改的字段：${invalidFields.join('、')}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'mainAssetDesc') && !Object.prototype.hasOwnProperty.call(patch, 'mainTag')) {
    throw new Error('主资产说明只能随主资产标签号一起更新');
  }

  const rows = getConsumableMaintenanceRows();
  let targetFound = false;
  const nextRows = rows.map((row) => {
    if (row.id !== id) return row;
    targetFound = true;

    const changes = CONSUMABLE_MAINTENANCE_EDIT_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(patch, field))
      .filter((field) => String(row[field] ?? '') !== String(patch[field] ?? ''))
      .map((field) => ({ field, before: row[field] ?? '', after: patch[field] ?? '' }));

    if (!changes.length) return row;

    let derivedPatch = { ...patch };
    if (Object.prototype.hasOwnProperty.call(patch, 'company')) {
      derivedPatch.companyCode = CONSUMABLE_COMPANY_CODE_BY_NAME.get(String(patch.company)) || '';
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'ownerId')) {
      derivedPatch.department = CONSUMABLE_OWNER_DEPARTMENT_BY_ID.get(String(patch.ownerId)) || '';
    }
    const nextRow = normalizeConsumableMaintenanceRow({ ...row, ...derivedPatch });
    const operationDate = patch.updatedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
    const transaction = buildConsumableMaintenanceTransaction(nextRow, operationDate, changes);
    return {
      ...nextRow,
      updatedAt: operationDate,
      transactionHistory: [...(row.transactionHistory || []), transaction],
    };
  });

  if (!targetFound) throw new Error('耗材标签号不存在');
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
