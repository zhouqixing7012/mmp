import {
  CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY,
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS,
} from '../mock/contractNumberMaintenanceMock';
import { readDemoData, writeDemoData } from './demoStorage';

export const CONTRACT_NUMBER_EDIT_FIELDS = [
  'useCompany',
  'ownerId',
  'contractNumber',
  'contractDesc',
  'packageContent',
  'contractStartDate',
  'contractEndDate',
  'amount',
  'status',
  'warehouse',
  'remarks',
  'scrapDate',
  'scrapReason',
  'claimReason',
  'claimDescription',
];

const ALLOWED_PATCH_FIELDS = new Set(CONTRACT_NUMBER_EDIT_FIELDS);
const STATUS_OPTIONS = new Set(['在用-使用中', '在库（新）', '在库（旧）', '已报废']);
const CLAIM_REASON_OPTIONS = new Set(['', '4级升5级', '5级（含）以上入职', '业务使用']);
const WAREHOUSE_OPTIONS = new Set(['I10086.集团合约机库']);
const PHONE_PATTERN = /^(13|14|15|17|18)\d{9}$/;

const DEFAULT_ROW_MAP = new Map(
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS.map((row) => [String(row.id), row]),
);
const COMPANY_BY_NAME = new Map(
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS.map((row) => [String(row.useCompany), row.useCompanyCode || '']),
);
const OWNER_BY_ID = new Map(
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS.map((row) => [String(row.ownerId), {
    ownerName: row.ownerName || '',
    subsidiary: row.subsidiary || '',
    department: row.department || '',
    jobLevel: row.jobLevel || '',
    idCard: row.idCard || '',
  }]),
);

function normalizeRow(row) {
  const defaultRow = DEFAULT_ROW_MAP.get(String(row.id)) || {};
  return {
    ...defaultRow,
    ...row,
    assetMajorCode: '34',
    transactionHistory: Array.isArray(row.transactionHistory)
      ? row.transactionHistory
      : (defaultRow.transactionHistory || []),
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

function isScrapStatus(status) {
  return String(status || '').includes('报废');
}

function buildTransaction(row, operationDate, changes) {
  return {
    id: `contract-number-maint-${row.id}-${Date.now()}`,
    operationType: '合约号码维护修改',
    operationDate,
    operator: '115102-王英',
    source: '合约号码台账维护',
    documentNo: '',
    applicationNo: row.applicationNo || '',
    tag: row.tag || '',
    contractNumber: row.contractNumber || '',
    category: `合约号码.${row.minorCategory || ''}`,
    assetDesc: row.assetDesc || '',
    owner: [row.ownerId, row.ownerName].filter(Boolean).join('-'),
    company: [row.useCompanyCode, row.useCompany].filter(Boolean).join('.'),
    status: row.status || '',
    warehouse: row.warehouse || '',
    remarks: row.remarks || '',
    changes,
  };
}

function canonicalizePatch(row, patch) {
  const next = { ...patch };
  const useCompany = Object.prototype.hasOwnProperty.call(patch, 'useCompany')
    ? String(patch.useCompany || '')
    : String(row.useCompany || '');
  const ownerId = Object.prototype.hasOwnProperty.call(patch, 'ownerId')
    ? String(patch.ownerId || '')
    : String(row.ownerId || '');
  const contractNumber = Object.prototype.hasOwnProperty.call(patch, 'contractNumber')
    ? String(patch.contractNumber || '').trim()
    : String(row.contractNumber || '').trim();
  const contractDesc = Object.prototype.hasOwnProperty.call(patch, 'contractDesc')
    ? String(patch.contractDesc || '')
    : String(row.contractDesc || '');
  const packageContent = Object.prototype.hasOwnProperty.call(patch, 'packageContent')
    ? String(patch.packageContent || '')
    : String(row.packageContent || '');
  const contractStartDate = Object.prototype.hasOwnProperty.call(patch, 'contractStartDate')
    ? String(patch.contractStartDate || '')
    : String(row.contractStartDate || '');
  const contractEndDate = Object.prototype.hasOwnProperty.call(patch, 'contractEndDate')
    ? String(patch.contractEndDate || '')
    : String(row.contractEndDate || '');
  const amount = Object.prototype.hasOwnProperty.call(patch, 'amount') ? patch.amount : row.amount;
  const status = Object.prototype.hasOwnProperty.call(patch, 'status')
    ? String(patch.status || '')
    : String(row.status || '');
  const warehouse = Object.prototype.hasOwnProperty.call(patch, 'warehouse')
    ? String(patch.warehouse || '')
    : String(row.warehouse || '');
  const remarks = Object.prototype.hasOwnProperty.call(patch, 'remarks')
    ? String(patch.remarks || '')
    : String(row.remarks || '');
  const scrapDate = Object.prototype.hasOwnProperty.call(patch, 'scrapDate')
    ? String(patch.scrapDate || '')
    : String(row.scrapDate || '');
  const scrapReason = Object.prototype.hasOwnProperty.call(patch, 'scrapReason')
    ? String(patch.scrapReason || '')
    : String(row.scrapReason || '');
  const claimReason = Object.prototype.hasOwnProperty.call(patch, 'claimReason')
    ? String(patch.claimReason || '')
    : String(row.claimReason || '');
  const claimDescription = Object.prototype.hasOwnProperty.call(patch, 'claimDescription')
    ? String(patch.claimDescription || '')
    : String(row.claimDescription || '');

  if (!useCompany || !COMPANY_BY_NAME.has(useCompany)) throw new Error('使用公司不能为空且必须有效');
  if (!ownerId || !OWNER_BY_ID.has(ownerId)) throw new Error('责任人不能为空且必须有效');
  if (!contractNumber || contractNumber.length > 25 || !PHONE_PATTERN.test(contractNumber)) {
    throw new Error('合约号码必须为有效的11位手机号');
  }
  if (!STATUS_OPTIONS.has(status)) throw new Error('号码状态无效');
  if (amount === '' || amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    throw new Error('金额必须为数字');
  }
  const numberAmount = Number(amount);
  if (numberAmount < 0 || numberAmount > 99999999.99 || !/^\d{1,8}(\.\d{1,2})?$/.test(String(amount))) {
    throw new Error('金额最多8位整数和2位小数');
  }
  if (!isValidDate(contractStartDate) || !isValidDate(contractEndDate)) throw new Error('合约期限日期格式无效');
  if (contractStartDate && contractEndDate && contractStartDate > contractEndDate) {
    throw new Error('合约期限开始日期不得晚于结束日期');
  }
  if (remarks.length > 120) throw new Error('备注最多120字');
  if (!CLAIM_REASON_OPTIONS.has(claimReason)) throw new Error('领用原因无效');

  if (status.includes('在用')) {
    if (warehouse) throw new Error('仓库和状态不匹配。');
  } else {
    if (!warehouse || !WAREHOUSE_OPTIONS.has(warehouse)) throw new Error('仓库和状态不匹配。');
  }

  if (isScrapStatus(status)) {
    if (!scrapDate || !isValidDate(scrapDate)) throw new Error('报废日期不能为空且必须有效');
    if (!scrapReason.trim()) throw new Error('报废原因不能为空');
  } else if (scrapDate || scrapReason) {
    throw new Error('非报废状态不允许填写报废日期或报废原因');
  }

  const owner = OWNER_BY_ID.get(ownerId);
  if (!owner.department && !ownerId.startsWith('SOHU')) {
    throw new Error('该员工对应的部门为空，请联系管理员添加');
  }

  next.useCompany = useCompany;
  next.useCompanyCode = COMPANY_BY_NAME.get(useCompany) || '';
  next.ownerId = ownerId;
  next.ownerName = owner.ownerName;
  next.subsidiary = owner.subsidiary;
  next.department = owner.department;
  next.jobLevel = owner.jobLevel;
  next.idCard = owner.idCard;
  next.contractNumber = contractNumber;
  next.contractDesc = contractDesc;
  next.packageContent = packageContent;
  next.contractStartDate = contractStartDate;
  next.contractEndDate = contractEndDate;
  next.amount = numberAmount;
  next.status = status;
  next.warehouse = warehouse;
  next.remarks = remarks;
  next.scrapDate = scrapDate;
  next.scrapReason = scrapReason;
  next.claimReason = claimReason;
  next.claimDescription = claimDescription;
  return next;
}

export function getContractNumberMaintenanceRows() {
  return readDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS)
    .map(normalizeRow);
}

export function updateContractNumberMaintenanceRow(id, patch) {
  const invalidFields = Object.keys(patch).filter((field) => !ALLOWED_PATCH_FIELDS.has(field));
  if (invalidFields.length) {
    throw new Error(`合约号码维护存在不允许修改的字段：${invalidFields.join('、')}`);
  }

  const rows = getContractNumberMaintenanceRows();
  let targetFound = false;
  const nextRows = rows.map((row) => {
    if (row.id !== id) return row;
    targetFound = true;
    const canonicalPatch = canonicalizePatch(row, patch);
    const changes = CONTRACT_NUMBER_EDIT_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(canonicalPatch, field))
      .filter((field) => String(row[field] ?? '') !== String(canonicalPatch[field] ?? ''))
      .map((field) => ({ field, before: row[field] ?? '', after: canonicalPatch[field] ?? '' }));

    const derivedChanges = ['useCompanyCode', 'ownerName', 'subsidiary', 'department', 'jobLevel', 'idCard']
      .filter((field) => String(row[field] ?? '') !== String(canonicalPatch[field] ?? ''))
      .map((field) => ({ field, before: row[field] ?? '', after: canonicalPatch[field] ?? '' }));
    const allChanges = [...changes, ...derivedChanges];
    if (!allChanges.length) return row;

    const operationDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const nextRow = normalizeRow({ ...row, ...canonicalPatch, updatedAt: operationDate });
    const transaction = buildTransaction(nextRow, operationDate, allChanges);
    return {
      ...nextRow,
      transactionHistory: [...(row.transactionHistory || []), transaction],
    };
  });

  if (!targetFound) throw new Error('合约号码标签号不存在');
  writeDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, nextRows);
  return nextRows;
}
