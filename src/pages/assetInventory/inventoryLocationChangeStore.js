import dayjs from 'dayjs';
import { CURRENT_BORROWER } from '../../mock/assetBorrowingMock';
import { INVENTORY_LOCATION_CHANGE_DEMO } from '../../mock/inventoryLocationChangeMock';
import { writeDemoData } from '../../services/demoStorage';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';

const STORAGE_KEY = 'asset-inventory-location-changes-v1';
const FIELDS = ['city', 'building', 'floor'];

const readState = () => {
  if (typeof window === 'undefined') return { changes: [], requests: [] };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { changes: [], requests: [] };
  const state = JSON.parse(raw);
  if (!Array.isArray(state.changes) || !Array.isArray(state.requests)) throw new Error('位置变更记录格式错误');
  return state;
};
const writeState = (state) => writeDemoData(STORAGE_KEY, state);
const text = (value) => String(value ?? '').trim();
const location = (value) => Object.fromEntries(FIELDS.map((field) => [field, text(value?.[field])]));
const sameLocation = (left, right) => FIELDS.every((field) => text(left?.[field]) === text(right?.[field]));
const currentTime = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

export function getInventoryLocationApplicant(operator) {
  const value = text(operator);
  const [id, ...parts] = value.split('-');
  const name = parts.join('-');
  return {value, displayName:name ? `${name} (${id})` : value || '-', department:value === `${CURRENT_BORROWER.id}-${CURRENT_BORROWER.name}` ? CURRENT_BORROWER.department : ''};
}

export function canCreateInventoryLocationChange() { return false; }

export function getInventoryLocationApprovalRecords(request) {
  if (request.approvalRecords) return request.approvalRecords;
  // 历史演示申请按原有单头和审批结论还原一轮记录。
  return [
    {key:'start', node:'提交申请', person:request.applicant, status:'已提交', time:request.appliedAt, opinion:request.reason},
    {key:'review', node:'ES主管审批', person:request.approver, status:request.status === '待审批' ? '待审批' : request.status, time:request.approvedAt, opinion:request.opinion},
  ];
}

function requireLedgerAsset(assetTag) {
  const matches = getAssetMaintenanceRows().filter((row) => text(row.tag) === text(assetTag));
  if (matches.length !== 1) throw new Error(matches.length ? '资产标签号对应多条台账记录' : '资产标签号在当前台账中不存在');
  return matches[0];
}

export function getInventoryLocationChanges(projectNo) {
  return readState().changes.filter((change) => change.projectNo === projectNo);
}

export function getInventoryLocationChangeRequests(projectNo) {
  return readState().requests.filter((request) => request.projectNo === projectNo);
}

export function getInventoryLocationChangeRequest(id) {
  return readState().requests.find((request) => request.id === id) || null;
}

export function recordInventoryLocationChange({ projectNo, projectType, planNo = '', assetTag, before, after, operator }) {
  if (projectType !== '复盘') throw new Error('只有复盘项目可以记录盘点位置变更');
  if (!text(projectNo)) throw new Error('缺少盘点项目编号');
  if (!text(assetTag)) throw new Error('缺少资产标签号');
  if (!text(operator)) throw new Error('缺少位置变更操作人');
  const original = location(before);
  const target = location(after);
  if (FIELDS.some((field) => !target[field])) throw new Error('City、Building、Floor 均须填写');
  if (sameLocation(original, target)) return null;
  const asset = requireLedgerAsset(assetTag);
  const state = readState();
  const existing = state.changes.find(change => change.projectNo === projectNo && change.assetTag === assetTag && change.status === '待变更');
  if (existing) {
    if (!sameLocation(existing.after, original) && !sameLocation(existing.before, original)) throw new Error('该资产的待变更位置与当前页面不一致，请刷新后重试');
    if (!sameLocation(asset, existing.before)) throw new Error('资产台账位置已变化，请重新获取当前位置');
    if (sameLocation(existing.before, target)) {
      throw new Error('新位置与台账位置相同，已有待变更记录须先处理');
    }
    const updated = { ...existing, after: target, operator, recordedAt: currentTime() };
    writeState({ ...state, changes: state.changes.map((change) => change.id === existing.id ? updated : change) });
    return updated;
  }
  if (!sameLocation(asset, original)) throw new Error('资产台账位置已变化，请重新获取当前位置');
  const change = {
    id: `inventory-location-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    projectNo,
    projectType,
    planNo,
    assetTag,
    assetDesc: asset.assetDesc || '',
    serialNumber: asset.serialNumber || '',
    quantity: asset.quantity,
    remark: asset.remarks || '',
    before: original,
    after: target,
    operator,
    recordedAt: currentTime(),
    status: '待变更',
    requestId: '',
  };
  writeState({ ...state, changes: [...state.changes, change] });
  return change;
}

// 历史申请仍可查询；已取消的写入口明确拒绝，避免旧调用继续审批或更新台账。
export function submitInventoryLocationChangeRequest() { throw new Error('盘点位置审批流程已取消，请查看位置变更池'); }
export function approveInventoryLocationChangeRequest() { throw new Error('盘点位置审批流程已取消，不能通过原申请更新台账'); }

// 兼容已有演示调用，只创建位置建议，不再发起审批。
export function createInventoryLocationChangeDemo(project) {
  if (project?.projectNo !== INVENTORY_LOCATION_CHANGE_DEMO.projectNo || project.projectType !== '复盘') throw new Error('该项目没有位置变更演示数据');
  const existing = getInventoryLocationChanges(project.projectNo).find(change => change.assetTag === INVENTORY_LOCATION_CHANGE_DEMO.assetTag && ['待变更', '待发起', '待审批', '已驳回'].includes(change.status));
  if (existing) return existing;
  const asset = requireLedgerAsset(INVENTORY_LOCATION_CHANGE_DEMO.assetTag);
  const target = getAssetMaintenanceRows().find(row => row.city === asset.city && row.building === asset.building && row.floor && row.floor !== asset.floor);
  if (!target) throw new Error('当前台账没有可用于演示的同建筑其他楼层');
  return recordInventoryLocationChange({ ...INVENTORY_LOCATION_CHANGE_DEMO, projectType:'复盘', before:asset, after:target });
}

// 旧审批记录不迁移或删除；池按资产显示尚未实际更新台账的最新位置建议。
export function getInventoryLocationChangePool(projectNo) {
  const latest = new Map();
  getInventoryLocationChanges(projectNo).forEach(change => latest.set(change.assetTag, change));
  return [...latest.values()].filter(change => ['待变更', '待发起', '待审批', '已驳回'].includes(change.status))
    .map(change => ({ ...change, historicalStatus: change.status, status: '待变更' }));
}

export function getInventoryLocationPoolCloseNotifications(projectNo) {
  return (readState().notifications || []).filter(item => item.projectNo === projectNo);
}

export function ensureInventoryLocationPoolCloseNotification(project) {
  if (project?.projectType !== '复盘') return null;
  if (!['盘点关闭', '关闭'].includes(project.status)) throw new Error('项目关闭后才可生成位置变更池处理通知');
  const state = readState();
  const previous = (state.notifications || []).find(item => item.projectNo === project.projectNo);
  if (previous) return previous;
  const changes = getInventoryLocationChangePool(project.projectNo);
  if (!changes.length) return null;
  const notice = { id: 'inventory-location-pool-close:' + project.projectNo, projectNo: project.projectNo,
    projectName: project.projectName || '', recipient: '213852-孙志强', employeeNo: '213852', employeeName: '孙志强',
    channel: '服务号', status: '待发送', createdAt: currentTime(),
    assetTags: changes.map(change => change.assetTag), changeIds: changes.map(change => change.id),
    content: '复盘项目已关闭，请处理位置变更池中的' + changes.length + '项资产位置建议。' };
  writeState({ ...state, notifications: [...(state.notifications || []), notice] });
  return notice;
}
