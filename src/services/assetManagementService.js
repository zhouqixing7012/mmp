import {
  ASSET_MAINTENANCE_STORAGE_KEY,
  DEFAULT_ASSET_MAINTENANCE_ROWS,
} from '../mock/assetManagementMock';
import {
  CONSUMABLE_MAINTENANCE_STORAGE_KEY,
  DEFAULT_CONSUMABLE_MAINTENANCE_ROWS,
} from '../mock/consumableMaintenanceMock';
import { readDemoData, writeDemoData } from './demoStorage';

const ASSET_MAINTENANCE_EDIT_FIELDS = [
  'costCenter', 'city', 'building', 'floor', 'status', 'serialNumber', 'remarks', 'assetMark', 'usageDescription', 'purpose',
];
const CONSUMABLE_MAINTENANCE_EDIT_FIELDS = [
  'company', 'serialNumber', 'status', 'ownerId', 'ownerName', 'city', 'building', 'floor',
  'enabledDate', 'mainTag', 'mainAssetDesc', 'warehouse', 'usageDescription', 'remarks',
];
const CONSUMABLE_ALLOWED_PATCH_FIELDS = new Set(CONSUMABLE_MAINTENANCE_EDIT_FIELDS);
const CONSUMABLE_STATUS_OPTIONS = new Set(['在用', '在库', '维修', '借用中', '待处理', '再利用', '已报废']);
const CONSUMABLE_SCRAP_STATUSES = new Set(['已报废']);
const CONSUMABLE_BUILDING_BY_CITY = {
  北京: ['搜狐媒体大厦', '北京亦庄数据中心'],
  上海: ['上海新媒体办公区'],
  广州: ['广州新媒体办公区'],
  天津: ['天津飞狐办公区'],
};
const CONSUMABLE_ENABLED_FLOORS = new Set([
  'B1', '1F', '2F', '3F', '5F', '6F', '7F', '8F', '9F', '10F', '12F', '15F', '18F',
]);
const CONSUMABLE_WAREHOUSE_PURPOSE_CODES = new Set(['IU0001', 'IU0003']);
const CONSUMABLE_WAREHOUSE_MASTER = [
  { name: 'WH001.北京耗材仓', company: '新媒体', enabled: true, purposeCode: 'IU0001', purposeName: '耗材库' },
  { name: 'WH002.上海耗材仓', company: '新媒体', enabled: true, purposeCode: 'IU0001', purposeName: '耗材库' },
  { name: 'WH003.广州耗材仓', company: '新媒体', enabled: true, purposeCode: 'IU0003', purposeName: '资产高耗库' },
  { name: 'WH004.天津耗材仓', company: '天津飞狐', enabled: true, purposeCode: 'IU0001', purposeName: '耗材库' },
  { name: 'WH005.停用耗材仓', company: '新媒体', enabled: false, purposeCode: 'IU0001', purposeName: '耗材库' },
  { name: 'WH006.普通仓库', company: '新媒体', enabled: true, purposeCode: 'IU0099', purposeName: '普通仓库' },
];
const CONSUMABLE_MAIN_ASSET_BY_TAG = new Map([
  ['114111700922', { desc: '服务器.Dell PowerEdge R740', ownerId: '203938', status: '在用' }],
  ['114121700944', { desc: '服务器.HPE ProLiant DL380 Gen10', ownerId: 'SOHU01', status: '在用' }],
  ['114111700955', { desc: '台式机.Dell OptiPlex 7090', ownerId: '220687', status: '在用' }],
  ['114111700966', { desc: '台式机.历史报废主资产', ownerId: '220687', status: '已报废' }],
]);
const LEGACY_INVENTORY_TYPE_VALUES = new Set(['普通盘点', '快速盘点', '扫码枪盘点']);
const CLOSED_INVENTORY_PROJECT_STATUSES = new Set(['盘点关闭', '已关闭']);
const INVENTORY_IMPORT_WAY_MAP = {
  狐小e扫码: 'APP 导入',
  狐小e快速扫描资产: '快速盘点导入',
  扫码枪: '扫码枪导入',
  人工上传盘点结果: '',
};

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
    .filter(record => record?.time && record.projectStatus === '盘点关闭')
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))[0];
  return latest?.time ? String(latest.time).slice(0, 4) : '';
}

function normalizeInventoryRecords(records = []) {
  return records.map((record) => {
    const inventoryYear = record?.time ? String(record.time).slice(0, 4) : '';
    const projectStatus = !record.projectStatus || CLOSED_INVENTORY_PROJECT_STATUSES.has(record.projectStatus)
      ? '盘点关闭'
      : record.projectStatus;
    return {
      ...record,
      projectStatus,
      projectStartTime: record.projectStartTime || record.time || '',
      type: LEGACY_INVENTORY_TYPE_VALUES.has(record.type) ? '初盘' : record.type,
      flag: record.flag === '正常' && inventoryYear ? `年度-${inventoryYear}` : record.flag,
      status: record.status === '待盘' ? '代盘' : record.status,
      importWay: Object.prototype.hasOwnProperty.call(INVENTORY_IMPORT_WAY_MAP, record.importWay)
        ? INVENTORY_IMPORT_WAY_MAP[record.importWay]
        : record.importWay,
    };
  });
}

function deriveTransactionSortSequence(record, fallbackIndex, total) {
  const explicit = Number(record?.sortSequence);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const idMatch = String(record?.id || '').match(/-(\d{10,})$/);
  if (idMatch) return Number(idMatch[1]);
  return Math.max(1, total - fallbackIndex);
}

function normalizeTransactionHistory(records = []) {
  const total = records.length;
  return records
    .map((record, index) => {
      const normalized = !record?.documentNo && record?.applicationNo
        ? { ...record, applicationNo: '' }
        : { ...record };
      return {
        ...normalized,
        assetMark: normalized.assetMark || '',
        sortSequence: deriveTransactionSortSequence(normalized, index, total),
      };
    })
    .sort((a, b) => (
      String(b.operationDate || '').localeCompare(String(a.operationDate || ''))
      || Number(b.sortSequence || 0) - Number(a.sortSequence || 0)
      || String(b.id || '').localeCompare(String(a.id || ''), 'zh-CN', { numeric: true })
    ));
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
    esScrapPeriod: mergedRow.esScrapPeriod || mergedRow.scrapInfo?.esPeriod || '',
    inventoryRecords,
    transactionHistory: normalizeTransactionHistory(mergedRow.transactionHistory || []),
    inventoryFlag: deriveLatestInventoryYear({ ...mergedRow, inventoryRecords }),
  };
}

function normalizeConsumableMaintenanceRow(row) {
  const defaultRow = DEFAULT_CONSUMABLE_ROW_MAP.get(String(row.id)) || {};
  const assetTypeOptions = ['公司资产', '租赁资产'];
  const assetType = assetTypeOptions.includes(row.assetType)
    ? row.assetType
    : (assetTypeOptions.includes(defaultRow.assetType) ? defaultRow.assetType : '公司资产');
  return {
    ...defaultRow,
    ...row,
    assetType,
    transactionHistory: Array.isArray(row.transactionHistory)
      ? row.transactionHistory
      : (defaultRow.transactionHistory || []),
  };
}

function maintenanceAuditValues(row) {
  return ASSET_MAINTENANCE_EDIT_FIELDS.reduce((result, field) => ({
    ...result,
    [field]: row?.[field] ?? '',
  }), {});
}

function buildAssetMaintenanceTransaction(row, operationDate, beforeRow) {
  const sortSequence = Date.now();
  const beforeValues = maintenanceAuditValues(beforeRow);
  const afterValues = maintenanceAuditValues(row);
  const changedFields = ASSET_MAINTENANCE_EDIT_FIELDS.filter((field) => (
    String(beforeValues[field] ?? '') !== String(afterValues[field] ?? '')
  ));

  return {
    id: `asset-maint-${row.id}-${sortSequence}`,
    sortSequence,
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
    assetMark: row.assetMark || '',
    usageDescription: row.usageDescription || '',
    remarks: row.remarks || '',
    service: row.service || '',
    config: row.config || '',
    noLocation: row.noLocation || '',
    upgradeAmount: row.upgradeAmount ?? '',
    changedFields,
    beforeValues,
    afterValues,
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
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function calculateEnabledDateFromPurchaseDate(purchaseDate) {
  const text = String(purchaseDate || '').trim();
  if (!isValidDate(text)) return '';
  const [year, month, day] = text.split('-').map(Number);
  if (day < 26) return text;

  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthNumber = String(nextMonth.getUTCMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonthNumber}-01`;
}

function resolveSingleEditEnabledDate(row, requestedValue) {
  if (requestedValue) return requestedValue;
  return calculateEnabledDateFromPurchaseDate(row.purchaseDate);
}

function getEligibleConsumableWarehouseNames(company) {
  return CONSUMABLE_WAREHOUSE_MASTER
    .filter((item) => (
      item.enabled
      && item.company === company
      && CONSUMABLE_WAREHOUSE_PURPOSE_CODES.has(item.purposeCode)
    ))
    .map((item) => item.name);
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
  if (floor && !CONSUMABLE_ENABLED_FLOORS.has(floor)) throw new Error('当前 Floor 无效或未启用');
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
    const mainAsset = CONSUMABLE_MAIN_ASSET_BY_TAG.get(mainTag);
    if (!mainAsset) throw new Error('主资产标签号无效');
    if (CONSUMABLE_SCRAP_STATUSES.has(mainAsset.status)) throw new Error('已报废主资产不允许关联');
    if (mainAsset.ownerId !== ownerId) throw new Error('主资产责任人与当前耗材责任人不一致');
    next.mainAssetDesc = mainAsset.desc;
  } else {
    next.mainAssetDesc = '';
  }

  const eligibleWarehouses = getEligibleConsumableWarehouseNames(company);
  const warehouseIsCurrentHistoricalValue = company === String(row.company || '') && warehouse === String(row.warehouse || '');
  if (warehouse && !eligibleWarehouses.includes(warehouse) && !warehouseIsCurrentHistoricalValue) {
    throw new Error('当前仓库不符合公司、启用状态或仓库用途规则');
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
    if (!hasMaintenanceChange) return normalizeAssetMaintenanceRow(row);

    const nextRow = normalizeAssetMaintenanceRow({ ...row, ...patch });
    const operationDate = patch.updatedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
    const transaction = buildAssetMaintenanceTransaction(nextRow, operationDate, row);
    return {
      ...nextRow,
      transactionHistory: normalizeTransactionHistory([transaction, ...(nextRow.transactionHistory || [])]),
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

export {
  getContractNumberMaintenanceRows,
  updateContractNumberMaintenanceRow,
} from './contractNumberMaintenanceService';
