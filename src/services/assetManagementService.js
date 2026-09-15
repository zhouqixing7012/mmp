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
const CONSUMABLE_STATUS_OPTIONS = new Set(['在用', '在库', '维修', '借用中', '待处理', '再利用', '已报废']);
const CONSUMABLE_SCRAP_STATUSES = new Set(['已报废']);
const CONSUMABLE_BUILDING_BY_CITY = {
  北京: ['搜狐媒体大厦', '北京亦庄数据中心'],
  上海: ['上海新媒体办公区'],
  广州: ['广州新媒体办公区'],
  天津: ['天津飞狐办公区'],
};
const CONSUMABLE_FLOOR_BY_BUILDING = {
  搜狐媒体大厦: ['B1', '8F', '10F', '12F', '15F', '18F'],
  北京亦庄数据中心: ['1F', '2F', '3F'],
  上海新媒体办公区: ['8F', '9F'],
  广州新媒体办公区: ['6F', '7F'],
  天津飞狐办公区: ['5F'],
};
const CONSUMABLE_WAREHOUSES_BY_COMPANY = {
  新媒体: ['WH001.北京耗材仓', 'WH002.上海耗材仓', 'WH003.广州耗材仓'],
  天津飞狐: ['WH004.天津耗材仓'],
};
const CONSUMABLE_MAIN_ASSET_BY_TAG = new Map([
  ['114111700922', '服务器.Dell PowerEdge R740'],
  ['114121700944', '服务器.HPE ProLiant DL380 Gen10'],
  ['114111700955', '台式机.Dell OptiPlex 7090'],
]);
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
const CONSUMABLE_OWNER_BY_ID = new Map(
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS.map((row) => [String(row.ownerId), {
    ownerName: row.ownerName || '',
    department: row.department || '',
  }]),
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

function isValidDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function resolveSingleEditEnabledDate(row, requestedValue) {
  if (requestedValue) return requestedValue;
  // 正式系统留空时调用既有“按购置日期计算启用日期”规则。
  // 原型没有该算法来源，不能编造公式；这里保留当前可见结果，仅表达“留空不会直接落空值”。
  return row.enabledDate || '';
}

function buildCanonicalConsumablePatch(row, patch, rows) {
  const next = { ...patch };
  const company = Object.prototype.hasOwnProperty.call(patch, 'company') ? String(patch.company || '') : String(row.company || '');
  const ownerId = Object.prototype.hasOwnProperty.call(patch, 'ownerId') ? String(patch.ownerId || '') : String(row.ownerId || '');
  const city = Object.prototype.hasOwnProperty.call(patch, 'city') ? String(patch.city || '') : String(row.city || '');
  const building = Object.prototype.hasOwnProperty.call(patch, 'building') ? String(patch.building || '') : String(row.building || '');
  const floor = Object.prototype.hasOwnProperty.call(patch, 'floor') ? String(patch.floor || '') : String(row.floor || '');
  const status = Object.prototype.hasOwnProperty.call(patch, 'status') ? String(patch.status || '') : String(row.status || '');
  const warehouse = Object.prototype.hasOwnProperty.call(patch, 'warehouse') ? String(patch.warehouse || '') : String(row.warehouse || '');
  const mainTag = Object.prototype.hasOwnProperty.call(patch, 'mainTag') ? String(patch.mainTag || '') : String(row.mainTag || '');
  const serialNumber = Object.prototype.hasOwnProperty.call(patch, 'serialNumber') ? String(patch.serialNumber || '').trim() : String(row.serialNumber || '').trim();
  const requestedEnabledDate = Object.prototype.hasOwnProperty.call(patch, 'enabledDate') ? String(patch.enabledDate || '') : String(row.enabledDate || '');
  const enabledDate = resolveSingleEditEnabledDate(row, requestedEnabledDate);

  if (!company || !CONSUMABLE_COMPANY_CODE_BY_NAME.has(company)) throw new Error('公司不能为空且必须有效');
  if (!ownerId || !CONSUMABLE_OWNER_BY_ID.has(ownerId)) throw new Error('责任人不能为空且必须有效');
  if (!city || !CONSUMABLE_BUILDING_BY_CITY[city]) throw new Error('City不能为空且必须有效');
  if (!building || !CONSUMABLE_BUILDING_BY_CITY[city].includes(building)) throw new Error('Building不能为空且必须属于当前 City');
  if (floor && !(CONSUMABLE_FLOOR_BY_BUILDING[building] || []).includes(floor)) throw new Error('当前 Floor 与 Building 关系无效');
  if (!CONSUMABLE_STATUS_OPTIONS.has(status)) throw new Error('当前耗材状态无效');
  if (!CONSUMABLE_SCRAP_STATUSES.has(row.status) && CONSUMABLE_SCRAP_STATUSES.has(status)) {
    throw new Error('资产状态为报废请走报废功能处理');
  }
  if (CONSUMABLE_SCRAP_STATUSES.has(row.status) && status !== row.status) {
    throw new Error('已报废耗材状态不允许通过耗材维护修改');
  }
  if (serialNumber.length > 120) throw new Error('序列号最多120字');
  if (serialNumber && serialNumber !== '缺省' && rows.some((item) => (
    item.id !== row.id
    && String(item.serialNumber || '').trim() !== '缺省'
    && String(item.serialNumber || '').trim().toLowerCase() === serialNumber.toLowerCase()
  ))) {
    throw new Error('序列号不唯一');
  }
  if (!isValidDate(enabledDate)) throw new Error('启用日期格式无效');
  if (mainTag) {
    if (mainTag === row.tag) throw new Error('主资产标签号不得关联自身');
    if (!CONSUMABLE_MAIN_ASSET_BY_TAG.has(mainTag)) throw new Error('主资产标签号无效');
    next.mainAssetDesc = CONSUMABLE_MAIN_ASSET_BY_TAG.get(mainTag);
  } else {
    next.mainAssetDesc = '';
  }

  const warehouseIsCurrentHistoricalValue = company === String(row.company || '') && warehouse === String(row.warehouse || '');
  if (warehouse && !(CONSUMABLE_WAREHOUSES_BY_COMPANY[company] || []).includes(warehouse) && !warehouseIsCurrentHistoricalValue) {
    throw new Error('当前仓库不属于所选公司');
  }

  const owner = CONSUMABLE_OWNER_BY_ID.get(ownerId);
  if (!owner.department && !ownerId.startsWith('SOHU')) {
    throw new Error('该员工对应的部门为空，请联系管理员添加');
  }

  next.company = company;
  next.companyCode = CONSUMABLE_COMPANY_CODE_BY_NAME.get(company) || '';
  next.ownerId = ownerId;
  next.ownerName = owner.ownerName;
  next.department = owner.department;
  next.city = city;
  next.building = building;
  next.floor = floor;
  next.status = status;
  next.warehouse = warehouse;
  next.mainTag = mainTag;
  next.serialNumber = serialNumber;
  next.enabledDate = enabledDate;
  delete next.updatedAt;
  return next;
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

  const rows = getConsumableMaintenanceRows();
  let targetFound = false;
  const nextRows = rows.map((row) => {
    if (row.id !== id) return row;
    targetFound = true;

    const canonicalPatch = buildCanonicalConsumablePatch(row, patch, rows);
    const changes = CONSUMABLE_MAINTENANCE_EDIT_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(canonicalPatch, field))
      .filter((field) => String(row[field] ?? '') !== String(canonicalPatch[field] ?? ''))
      .map((field) => ({ field, before: row[field] ?? '', after: canonicalPatch[field] ?? '' }));

    if (!changes.length) return row;

    const nextRow = normalizeConsumableMaintenanceRow({ ...row, ...canonicalPatch });
    const operationDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
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
