import {
  CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY,
  CONTRACT_NUMBER_MAINTENANCE_USERS,
  CURRENT_CONTRACT_NUMBER_OPERATOR,
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS,
} from '../mock/contractNumberMaintenanceMock';
import { readDemoData, writeDemoData } from './demoStorage';

export const CONTRACT_NUMBER_EDIT_FIELDS = [
  'useCompany',
  'ownerId',
  'packageContent',
  'contractStartDate',
  'contractEndDate',
  'amount',
  'status',
  'warehouse',
  'usageDescription',
  'scrapDate',
  'scrapReason',
  'claimDate',
  'claimReason',
];

export const CONTRACT_NUMBER_BATCH_FIELDS = [
  { header: '标签号', key: 'tag', locate: true },
  { header: '使用公司', key: 'useCompany' },
  { header: '责任人工号', key: 'ownerId' },
  { header: '套餐内容', key: 'packageContent' },
  { header: '合约开始日期', key: 'contractStartDate', date: true },
  { header: '合约结束日期', key: 'contractEndDate', date: true },
  { header: '金额', key: 'amount' },
  { header: '号码状态', key: 'status' },
  { header: '仓库', key: 'warehouse' },
  { header: '使用说明', key: 'usageDescription' },
  { header: '报废原因', key: 'scrapReason' },
  { header: '报废日期', key: 'scrapDate', date: true },
  { header: '领用日期', key: 'claimDate', date: true },
  { header: '领用原因', key: 'claimReason' },
];

const ALLOWED_PATCH_FIELDS = new Set(CONTRACT_NUMBER_EDIT_FIELDS);
const STATUS_OPTIONS = new Set(['在用-使用中', '在库（新）', '在库（旧）', '已报废']);
const CLAIM_REASON_OPTIONS = new Set(['业务申请', '个人申请', '管理者配发']);
const WAREHOUSE_OPTIONS = new Set(['I10086.集团合约机库']);
const PHONE_PATTERN = /^(13|14|15|17|18)\d{9}$/;

const DEFAULT_ROW_MAP = new Map(
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS.map((row) => [String(row.id), row]),
);
const COMPANY_OPTIONS = new Set(['搜狐', '畅游']);
const LEGACY_COMPANY_NAMES = new Map([
  ['北京搜狐新媒体信息技术有限公司', '搜狐'],
  ['广州搜狐新媒体信息技术有限公司', '搜狐'],
]);
const OWNER_BY_ID = new Map(
  DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS.map((row) => [String(row.ownerId), {
    ownerName: row.ownerName || '',
    subsidiary: row.subsidiary || '',
    department: row.department || '',
    jobLevel: row.jobLevel || '',
  }]),
);

function employeeId(value) {
  return String(value || '').split('-')[0].trim();
}

export function hasContractNumberMaintenanceAccess(operator = CURRENT_CONTRACT_NUMBER_OPERATOR) {
  const currentId = employeeId(operator);
  return CONTRACT_NUMBER_MAINTENANCE_USERS.some((user) => employeeId(user) === currentId);
}

function assertAccess(operator) {
  if (!hasContractNumberMaintenanceAccess(operator)) {
    throw new Error('无合约号码维护权限');
  }
}

function normalizeRow(row) {
  const defaultRow = DEFAULT_ROW_MAP.get(String(row.id)) || {};
  const merged = { ...defaultRow, ...row };
  const transactionHistory = Array.isArray(merged.transactionHistory)
    ? merged.transactionHistory
    : (defaultRow.transactionHistory || []);
  return {
    ...merged,
    useCompany: LEGACY_COMPANY_NAMES.get(String(merged.useCompany || '')) || String(merged.useCompany || ''),
    claimReason: merged.claimReason === '管理者配送' ? '管理者配发' : (merged.claimReason || ''),
    assetMajorCode: '34',
    minorCategory: '合约号码',
    transactionHistory: transactionHistory.map((item) => ({
      ...item,
      useCompany: LEGACY_COMPANY_NAMES.get(String(item.useCompany || '')) || String(item.useCompany || ''),
      claimReason: item.claimReason === '管理者配送' ? '管理者配发' : (item.claimReason || ''),
    })),
  };
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeDateValue(value) {
  if (isBlank(value)) return '';
  const text = String(value).trim().replaceAll('/', '-');
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return text;
  return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
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
  return String(status || '') === '已报废';
}

function buildTransaction(row, operationDate, changes, operator) {
  return {
    id: `contract-number-maint-${row.id}-${Date.now()}`,
    operationType: '合约号码维护修改',
    operationDate,
    operator,
    source: '合约号码台账维护',
    documentNo: '',
    applicationNo: row.applicationNo || '',
    tag: row.tag || '',
    contractNumber: row.contractNumber || '',
    useCompanyCode: row.useCompanyCode || '',
    useCompany: row.useCompany || '',
    minorCategory: '合约号码',
    contractDesc: row.contractDesc || '',
    packageContent: row.packageContent || '',
    contractStartDate: row.contractStartDate || '',
    contractEndDate: row.contractEndDate || '',
    quantity: row.quantity ?? '',
    amount: row.amount ?? '',
    status: row.status || '',
    warehouse: row.warehouse || '',
    usageDescription: row.usageDescription || '',
    scrapReason: row.scrapReason || '',
    scrapDate: row.scrapDate || '',
    ownerId: row.ownerId || '',
    ownerName: row.ownerName || '',
    department: row.department || '',
    jobLevel: row.jobLevel || '',
    claimDate: row.claimDate || '',
    claimReason: row.claimReason || '',
    applicationType: row.applicationType || '',
    changes,
  };
}

function canonicalizePatch(row, patch) {
  const next = { ...patch };
  const useCompany = Object.prototype.hasOwnProperty.call(patch, 'useCompany')
    ? String(patch.useCompany || '').trim()
    : String(row.useCompany || '').trim();
  const ownerId = Object.prototype.hasOwnProperty.call(patch, 'ownerId')
    ? String(patch.ownerId || '').trim()
    : String(row.ownerId || '').trim();
  const contractNumber = String(row.contractNumber || '').trim();
  const contractStartDate = Object.prototype.hasOwnProperty.call(patch, 'contractStartDate')
    ? normalizeDateValue(patch.contractStartDate)
    : String(row.contractStartDate || '');
  const contractEndDate = Object.prototype.hasOwnProperty.call(patch, 'contractEndDate')
    ? normalizeDateValue(patch.contractEndDate)
    : String(row.contractEndDate || '');
  const amount = Object.prototype.hasOwnProperty.call(patch, 'amount') ? patch.amount : row.amount;
  const status = Object.prototype.hasOwnProperty.call(patch, 'status')
    ? String(patch.status || '').trim()
    : String(row.status || '');
  let warehouse = Object.prototype.hasOwnProperty.call(patch, 'warehouse')
    ? String(patch.warehouse || '').trim()
    : String(row.warehouse || '');
  const usageDescription = Object.prototype.hasOwnProperty.call(patch, 'usageDescription')
    ? String(patch.usageDescription || '')
    : String(row.usageDescription || '');
  let scrapDate = Object.prototype.hasOwnProperty.call(patch, 'scrapDate')
    ? normalizeDateValue(patch.scrapDate)
    : String(row.scrapDate || '');
  let scrapReason = Object.prototype.hasOwnProperty.call(patch, 'scrapReason')
    ? String(patch.scrapReason || '')
    : String(row.scrapReason || '');
  const claimDate = Object.prototype.hasOwnProperty.call(patch, 'claimDate')
    ? normalizeDateValue(patch.claimDate)
    : String(row.claimDate || '');
  const claimReason = Object.prototype.hasOwnProperty.call(patch, 'claimReason')
    ? String(patch.claimReason || '').trim()
    : (row.claimReason === '管理者配送' ? '管理者配发' : String(row.claimReason || ''));
  const packageContent = Object.prototype.hasOwnProperty.call(patch, 'packageContent')
    ? String(patch.packageContent || '')
    : String(row.packageContent || '');

  if (!useCompany || !COMPANY_OPTIONS.has(useCompany)) throw new Error('使用公司不能为空且必须有效');
  if (!ownerId || !OWNER_BY_ID.has(ownerId)) throw new Error('责任人不能为空且必须有效');
  if (!contractNumber || !PHONE_PATTERN.test(contractNumber)) {
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
  if (!isValidDate(claimDate)) throw new Error('领用日期格式无效');
  if (claimReason && !CLAIM_REASON_OPTIONS.has(claimReason)) throw new Error('领用原因无效');

  if (status === '在用-使用中') {
    warehouse = '';
  } else if (!WAREHOUSE_OPTIONS.has(warehouse)) {
    throw new Error('仓库和状态不匹配。');
  }

  if (isScrapStatus(status)) {
    if (!scrapDate || !isValidDate(scrapDate)) throw new Error('报废日期不能为空且必须有效');
    if (!scrapReason.trim()) throw new Error('报废原因不能为空');
  } else {
    scrapDate = '';
    scrapReason = '';
  }

  const owner = OWNER_BY_ID.get(ownerId);
  if (!owner.department && !ownerId.startsWith('SOHU')) {
    throw new Error('该员工对应的部门为空，请联系管理员添加');
  }

  next.useCompany = useCompany;
  next.useCompanyCode = row.useCompanyCode || '';
  next.ownerId = ownerId;
  next.ownerName = owner.ownerName;
  next.subsidiary = owner.subsidiary;
  next.department = owner.department;
  next.jobLevel = owner.jobLevel;
  next.contractNumber = contractNumber;
  next.packageContent = packageContent;
  next.contractStartDate = contractStartDate;
  next.contractEndDate = contractEndDate;
  next.amount = numberAmount;
  next.status = status;
  next.warehouse = warehouse;
  next.usageDescription = usageDescription;
  next.scrapDate = scrapDate;
  next.scrapReason = scrapReason;
  next.claimDate = claimDate;
  next.claimReason = claimReason;
  return next;
}

function errorField(message) {
  const text = String(message || '');
  if (text.includes('使用公司')) return '使用公司';
  if (text.includes('责任人') || text.includes('部门')) return '责任人工号';
  if (text.includes('合约号码')) return '合约号码';
  if (text.includes('合约期限')) return '合约期限';
  if (text.includes('金额')) return '金额';
  if (text.includes('号码状态')) return '号码状态';
  if (text.includes('仓库')) return '仓库';
  if (text.includes('报废日期')) return '报废日期';
  if (text.includes('报废原因')) return '报废原因';
  if (text.includes('领用日期')) return '领用日期';
  if (text.includes('领用原因')) return '领用原因';
  return '';
}

function buildBatchPatch(line) {
  return CONTRACT_NUMBER_BATCH_FIELDS.reduce((patch, field) => {
    if (field.locate) return patch;
    const value = line[field.header];
    if (isBlank(value)) return patch;
    return {
      ...patch,
      [field.key]: field.date ? normalizeDateValue(value) : value,
    };
  }, {});
}

function prepareBatch(batchRows, operator) {
  assertAccess(operator);
  const rows = getContractNumberMaintenanceRows(operator);
  const rowsByTag = new Map(rows.map((row) => [String(row.tag || '').trim(), row]));
  const seenTags = new Map();
  const errors = [];
  const prepared = [];

  batchRows.forEach((line, index) => {
    const rowNo = Number(line.rowNo || index + 2);
    const tag = String(line['标签号'] || '').trim();
    if (!tag) {
      errors.push({ id: `batch-${rowNo}-tag-empty`, rowNo, tag: '', field: '标签号', reason: '标签号不能为空' });
      return;
    }
    if (seenTags.has(tag)) {
      errors.push({ id: `batch-${rowNo}-tag-repeat`, rowNo, tag, field: '标签号', reason: '同一文件标签号不得重复' });
      return;
    }
    seenTags.set(tag, rowNo);

    const target = rowsByTag.get(tag);
    if (!target) {
      errors.push({ id: `batch-${rowNo}-tag-missing`, rowNo, tag, field: '标签号', reason: '合约号码标签号不存在' });
      return;
    }

    try {
      const patch = buildBatchPatch(line);
      const canonicalPatch = canonicalizePatch(target, patch);
      prepared.push({
        rowNo,
        tag,
        id: target.id,
        baseUpdatedAt: target.updatedAt || '',
        canonicalPatch,
      });
    } catch (error) {
      errors.push({
        id: `batch-${rowNo}-validation`,
        rowNo,
        tag,
        field: errorField(error.message),
        reason: error.message || '数据校验失败',
      });
    }
  });

  if (!errors.length) {
    const preparedById = new Map(prepared.map((item) => [item.id, item]));
    const finalRows = rows.map((row) => {
      const item = preparedById.get(row.id);
      return item ? { ...row, ...item.canonicalPatch } : row;
    });
    const numberCounts = new Map();
    finalRows.forEach((row) => {
      const number = String(row.contractNumber || '').trim();
      numberCounts.set(number, (numberCounts.get(number) || 0) + 1);
    });
    prepared.forEach((item) => {
      const number = String(item.canonicalPatch.contractNumber || '').trim();
      if ((numberCounts.get(number) || 0) > 1) {
        errors.push({
          id: `batch-${item.rowNo}-number-repeat`,
          rowNo: item.rowNo,
          tag: item.tag,
          field: '合约号码',
          reason: '合约号码已存在',
        });
      }
    });
  }

  return {
    rows,
    prepared,
    errors,
    versions: Object.fromEntries(prepared.map((item) => [item.tag, item.baseUpdatedAt])),
  };
}

function applyCanonicalPatch(row, canonicalPatch, operator, operationDate) {
  const changes = CONTRACT_NUMBER_EDIT_FIELDS
    .filter((field) => Object.prototype.hasOwnProperty.call(canonicalPatch, field))
    .filter((field) => String(row[field] ?? '') !== String(canonicalPatch[field] ?? ''))
    .map((field) => ({ field, before: row[field] ?? '', after: canonicalPatch[field] ?? '' }));

  const derivedChanges = ['useCompanyCode', 'ownerName', 'subsidiary', 'department', 'jobLevel']
    .filter((field) => Object.prototype.hasOwnProperty.call(canonicalPatch, field))
    .filter((field) => String(row[field] ?? '') !== String(canonicalPatch[field] ?? ''))
    .map((field) => ({ field, before: row[field] ?? '', after: canonicalPatch[field] ?? '' }));
  const allChanges = [...changes, ...derivedChanges];
  if (!allChanges.length) return { row, changed: false };

  const nextRow = normalizeRow({ ...row, ...canonicalPatch, updatedAt: operationDate });
  const transaction = buildTransaction(nextRow, operationDate, allChanges, operator);
  return {
    row: {
      ...nextRow,
      transactionHistory: [...(row.transactionHistory || []), transaction],
    },
    changed: true,
  };
}

export function getContractNumberMaintenanceRows(operator = CURRENT_CONTRACT_NUMBER_OPERATOR) {
  assertAccess(operator);
  return readDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, DEFAULT_CONTRACT_NUMBER_MAINTENANCE_ROWS)
    .map(normalizeRow)
    .filter((row) => row.assetMajorCode === '34' && row.minorCategory === '合约号码');
}

export function updateContractNumberMaintenanceRow(
  id,
  patch,
  operator = CURRENT_CONTRACT_NUMBER_OPERATOR,
) {
  assertAccess(operator);

  const invalidFields = Object.keys(patch).filter((field) => !ALLOWED_PATCH_FIELDS.has(field));
  if (invalidFields.length) {
    throw new Error(`合约号码维护存在不允许修改的字段：${invalidFields.join('、')}`);
  }

  const rows = getContractNumberMaintenanceRows(operator);
  const target = rows.find((row) => row.id === id);
  if (!target) throw new Error('合约号码标签号不存在');

  const canonicalPatch = canonicalizePatch(target, patch);
  const duplicate = rows.some((other) => (
    other.id !== target.id
    && String(other.contractNumber || '').trim() === canonicalPatch.contractNumber
  ));
  if (duplicate) throw new Error('合约号码已存在');

  const operationDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const applied = applyCanonicalPatch(target, canonicalPatch, operator, operationDate);
  if (!applied.changed) return rows;

  const nextRows = rows.map((row) => row.id === id ? applied.row : row);
  writeDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, nextRows);
  return nextRows;
}

export function validateContractNumberBatchRows(
  batchRows,
  operator = CURRENT_CONTRACT_NUMBER_OPERATOR,
) {
  const prepared = prepareBatch(batchRows, operator);
  return {
    status: prepared.errors.length ? 'failed' : 'passed',
    errors: prepared.errors,
    versions: prepared.versions,
  };
}

export function batchUpdateContractNumberMaintenanceRows(
  batchRows,
  operator = CURRENT_CONTRACT_NUMBER_OPERATOR,
  expectedVersions = {},
) {
  const prepared = prepareBatch(batchRows, operator);
  if (prepared.errors.length) {
    return { status: 'failed', errors: prepared.errors };
  }

  const currentByTag = new Map(prepared.rows.map((row) => [String(row.tag || '').trim(), row]));
  const versionErrors = prepared.prepared
    .filter((item) => Object.prototype.hasOwnProperty.call(expectedVersions, item.tag))
    .filter((item) => String(currentByTag.get(item.tag)?.updatedAt || '') !== String(expectedVersions[item.tag] || ''))
    .map((item) => ({
      id: `batch-${item.rowNo}-version`,
      rowNo: item.rowNo,
      tag: item.tag,
      field: '',
      reason: '号码信息已发生变化，请重新校验',
    }));
  if (versionErrors.length) {
    return { status: 'failed', errors: versionErrors };
  }

  const preparedById = new Map(prepared.prepared.map((item) => [item.id, item]));
  const operationDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
  let modifiedCount = 0;
  let unchangedCount = 0;

  const nextRows = prepared.rows.map((row) => {
    const item = preparedById.get(row.id);
    if (!item) return row;
    const applied = applyCanonicalPatch(row, item.canonicalPatch, operator, operationDate);
    if (applied.changed) modifiedCount += 1;
    else unchangedCount += 1;
    return applied.row;
  });

  writeDemoData(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY, nextRows);
  return {
    status: 'passed',
    errors: [],
    rows: nextRows,
    modifiedCount,
    unchangedCount,
  };
}
