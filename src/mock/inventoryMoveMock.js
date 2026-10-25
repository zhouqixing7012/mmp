import { INVENTORY_ASSET_POOL } from './inventoryAssetPool';
export const MOVE_WAREHOUSES = [
  { id: 1, name: 'I0001.资产集团总库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: 'B2', keeper: 'SOHU05-库房管理员' },
  { id: 2, name: 'I0013.资产集团前台库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '1F', keeper: 'SOHU13-前台库管员' },
  { id: 3, name: 'I0024.资产网络大厦库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129754.搜狐网络大厦', floor: 'B1', keeper: 'SOHU24-库房管理员' },
  { id: 4, name: 'I0033.资产MIS备货库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '17F', keeper: 'SOHU33-MIS库管员' },
  { id: 5, name: 'I0022.资产集团前台库（焦点互动）', financeCompany: '117.焦点互动', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '2F', keeper: 'SOHU22-前台库管员' },
  { id: 6, name: 'I0010.资产集团总库（焦点互动）', financeCompany: '117.焦点互动', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: 'B2', keeper: 'SOHU10-库房管理员' },
];
const ASSET_POOL = INVENTORY_ASSET_POOL;
const TRANSIT_WAREHOUSE = 'V00001.集团在途总库';

export const MOVE_DOCUMENT_STATUSES = Object.freeze(['草稿', '出库待接收', '已完成', '已驳回']);

function cloneLine(asset, extras = {}) {
  return {
    ...asset,
    id: extras.id || `${asset.id}-${Math.random().toString(36).slice(2, 7)}`,
    lineNo: extras.lineNo || 1,
    moveDesc: extras.moveDesc || '',
    receiveDesc: extras.receiveDesc || '',
    verification: extras.verification || '未验证',
    verificationDesc: extras.verificationDesc || '',
    verificationMethod: extras.verificationMethod || '',
    verificationTime: extras.verificationTime || '',
    moveStatus: extras.moveStatus || '草稿',
    receiver: extras.receiver || '',
    receiveTime: extras.receiveTime || '',
    rejectReason: extras.rejectReason || '',
    transactionOut: extras.transactionOut || '',
    transactionIn: extras.transactionIn || '',
    originalLockStatus: Boolean(asset.locked),
    snapshot: extras.snapshot || null,
    ...extras,
  };
}

const HISTORICAL_ASSET = {
  ...ASSET_POOL[0],
  id: 'hist-asset-1',
  assetTag: '1141100184-V',
  sn: 'SOHUXX156170',
  materialDesc: '惠普.LE2202x显示器',
  originalValue: 888.89,
  netValue: 0,
  enabledDate: '2013-03-15',
  plate: '16.视频',
};

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    documentNo: 'TS-202609120001',
    status: '草稿',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-12',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '待提交普通资产移库',
    lines: [cloneLine(ASSET_POOL[1], { id: 'draft-1', lineNo: 1, moveDesc: '前台库存调整' })],
  },
  {
    id: 2,
    documentNo: 'TS-202609110002',
    status: '草稿',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0033.资产MIS备货库（新媒体）',
    createdDate: '2026-09-11',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '资产移库演示',
    lines: [cloneLine(ASSET_POOL[4], { id: 'draft-2', lineNo: 1, moveDesc: 'MIS备货' })],
  },
  {
    id: 3,
    documentNo: 'TS-202609090004',
    status: '出库待接收',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-09',
    creator: '114111-杨芊',
    quantity: 2,
    remark: '部分已验证，支持分批接收',
    notificationStatus: '已通知',
    reminderStatus: '未超期',
    lines: [
      cloneLine(HISTORICAL_ASSET, { id: 'receive-1', lineNo: 1, warehouse: TRANSIT_WAREHOUSE, moveStatus: '待接收', verification: '已验证', verificationDesc: '扫码验证通过', verificationMethod: '扫码', verificationTime: '2026-09-09 10:20', transactionOut: '24', snapshot: { ...HISTORICAL_ASSET } }),
      cloneLine({ ...ASSET_POOL[4], assetTag: 'CON-26070019', sn: 'MXK-0019' }, { id: 'receive-2', lineNo: 2, warehouse: TRANSIT_WAREHOUSE, moveStatus: '待接收', verification: '未验证', transactionOut: '24', snapshot: { ...ASSET_POOL[4], assetTag: 'CON-26070019', sn: 'MXK-0019' } }),
    ],
  },
  {
    id: 4,
    documentNo: 'TS-202609050003',
    status: '已完成',
    lastUpdatedAt: '2026-09-05 15:30',
    fromWarehouse: 'I0013.资产集团前台库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-05',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '正常移库完成',
    notificationStatus: '已结束',
    reminderStatus: '已结束',
    lines: [cloneLine({ ...ASSET_POOL[4], assetTag: 'AST-HIS-0091' }, { id: 'completed-1', lineNo: 1, moveStatus: '已接收', verification: '已验证', receiveDesc: '核对无误', receiver: '114111-杨芊', receiveTime: '2026-09-05 15:30', transactionOut: '24', transactionIn: '25', warehouse: 'I0001.资产集团总库（新媒体）', snapshot: { ...ASSET_POOL[4], assetTag: 'AST-HIS-0091' } })],
  },
  {
    id: 5,
    documentNo: 'TS-202609040004',
    status: '已完成',
    lastUpdatedAt: '2026-09-04 17:00',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-04',
    creator: '114111-杨芊',
    quantity: 2,
    remark: '部分接收、部分驳回',
    reverseDocumentNos: ['TS-R202609040001'],
    lines: [
      cloneLine({ ...HISTORICAL_ASSET, assetTag: 'AST-MIX-0001', sn: 'MIX-SN-001' }, { id: 'mix-1', lineNo: 1, moveStatus: '已接收', verification: '已验证', receiver: '114111-杨芊', receiveTime: '2026-09-04 17:00', transactionOut: '24', transactionIn: '25', warehouse: 'I0024.资产网络大厦库（新媒体）', snapshot: { ...HISTORICAL_ASSET, assetTag: 'AST-MIX-0001', sn: 'MIX-SN-001' } }),
      cloneLine({ ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' }, { id: 'mix-2', lineNo: 2, moveStatus: '已驳回', verification: '已验证', rejectReason: '目标仓无对应存放位置', transactionOut: '24', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' } }),
    ],
  },
  {
    id: 6,
    documentNo: 'TS-R202609040001',
    status: '出库待接收',
    fromWarehouse: 'I0024.资产网络大厦库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-04',
    creator: 'system-系统',
    quantity: 1,
    remark: '目标仓无对应存放位置',
    reverseMove: true,
    sourceDocumentNo: 'TS-202609040004',
    notificationStatus: '已通知',
    reminderStatus: '未超期',
    lines: [cloneLine({ ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' }, { id: 'reverse-1', lineNo: 1, moveStatus: '待接收', verification: '未验证', transactionOut: '', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' } })],
  },
  {
    id: 7,
    documentNo: 'TS-202609030007',
    status: '已驳回',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0033.资产MIS备货库（新媒体）',
    createdDate: '2026-09-03',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '整单驳回演示',
    reverseDocumentNos: ['TS-R202609030001'],
    lines: [cloneLine({ ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' }, { id: 'reject-1', lineNo: 1, moveStatus: '已驳回', verification: '已验证', rejectReason: '目标仓拒绝接收', transactionOut: '24', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' } })],
  },
  {
    id: 8,
    documentNo: 'TS-R202609030001',
    status: '出库待接收',
    fromWarehouse: 'I0033.资产MIS备货库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-03',
    creator: 'system-系统',
    quantity: 1,
    remark: '目标仓拒绝接收',
    reverseMove: true,
    sourceDocumentNo: 'TS-202609030007',
    notificationStatus: '已通知',
    reminderStatus: '每日催办中',
    lines: [cloneLine({ ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' }, { id: 'reverse-2', lineNo: 1, moveStatus: '待接收', verification: '未验证', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' } })],
  },
];

const storageKey = 'mmp.inventory.move.documents.v1';
const copy = value => JSON.parse(JSON.stringify(value));
let memory = copy(INITIAL_DOCUMENTS);
export function readMoveDocuments() {
  const saved = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(storageKey);
  const rows = saved ? JSON.parse(saved) : memory;
  if (!Array.isArray(rows)) throw new Error('移库单数据格式无效');
  return copy(rows);
}
export function writeMoveDocuments(rows) {
  if (!Array.isArray(rows)) throw new Error('移库单数据格式无效');
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(storageKey, JSON.stringify(rows));
  memory = copy(rows);
}
export { cloneLine };
