import { INVENTORY_LOCATION_CHANGE_DEMO } from '../../mock/inventoryLocationChangeMock';
import { writeDemoData } from '../../services/demoStorage';
import { applyInventoryLocationApproval, getAssetMaintenanceRows } from '../../services/assetManagementService';

const STORAGE_KEY = 'asset-inventory-location-changes-v1';
const FIELDS = ['city', 'building', 'floor'];
const APPROVER = '206984-何文';

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
const currentTime = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

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
  const existing = state.changes.find((change) => change.projectNo === projectNo && change.assetTag === assetTag && change.status === '待发起');
  if (state.changes.some((change) => change.projectNo === projectNo && change.assetTag === assetTag && change.status === '待审批')) {
    throw new Error('该资产的位置变更已提交审批，不能修改');
  }
  if (existing) {
    if (!sameLocation(existing.after, original) && !sameLocation(existing.before, original)) throw new Error('该资产的待发起位置与当前页面不一致，请刷新后重试');
    if (!sameLocation(asset, existing.before)) throw new Error('资产台账位置已变化，请重新获取当前位置');
    if (sameLocation(existing.before, target)) {
      throw new Error('新位置与台账位置相同，已有待发起变更须先处理');
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
    before: original,
    after: target,
    operator,
    recordedAt: currentTime(),
    status: '待发起',
    requestId: '',
  };
  writeState({ ...state, changes: [...state.changes, change] });
  return change;
}

export function submitInventoryLocationChangeRequest({ projectNo, projectType, reason, applicant, draftLocations = {} }) {
  if (projectType !== '复盘') throw new Error('只有复盘项目可以发起位置变更');
  if (!text(projectNo)) throw new Error('缺少盘点项目编号');
  if (!text(reason)) throw new Error('请填写变更原因');
  if (!text(applicant)) throw new Error('缺少申请人');
  const state = readState();
  const changes = state.changes.filter((change) => change.projectNo === projectNo && change.status === '待发起');
  if (!changes.length) throw new Error('当前项目没有待发起的位置变更');
  const prepared = changes.map((change) => {
    const target = location(draftLocations[change.id] || change.after);
    if (FIELDS.some((field) => !target[field])) throw new Error(`${change.assetTag} 的新位置不完整`);
    const asset = requireLedgerAsset(change.assetTag);
    if (!sameLocation(asset, change.before)) throw new Error(`${change.assetTag} 的台账位置已变化，请核对后再发起`);
    return { ...change, after: target };
  }).filter((change) => !sameLocation(change.before, change.after));
  if (!prepared.length) throw new Error('当前项目没有待发起的位置变更');
  const request = {
    id: `ILC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectNo,
    projectType,
    reason: text(reason),
    applicant: text(applicant),
    appliedAt: currentTime(),
    approver: APPROVER,
    status: '待审批',
    changeIds: prepared.map((change) => change.id),
    opinion: '',
    approvedAt: '',
  };
  const preparedById = new Map(prepared.map((change) => [change.id, change]));
  const revertedIds = new Set(changes.filter((change) => !preparedById.has(change.id)).map((change) => change.id));
  writeState({
    requests: [...state.requests, request],
    changes: state.changes.filter((change) => !revertedIds.has(change.id)).map((change) => preparedById.has(change.id)
      ? { ...preparedById.get(change.id), status: '待审批', requestId: request.id }
      : change),
  });
  return request;
}

export function approveInventoryLocationChangeRequest(id, { approver, decision, opinion = '' }) {
  const state = readState();
  const request = state.requests.find((item) => item.id === id);
  if (!request) throw new Error('位置变更申请不存在');
  if (request.status !== '待审批') throw new Error('位置变更申请已处理，不能重复审批');
  if (text(approver) !== APPROVER) throw new Error('仅何文可以审批位置变更');
  if (!['同意', '驳回'].includes(decision)) throw new Error('请选择有效审批结果');
  if (decision === '驳回' && !text(opinion)) throw new Error('驳回时须填写审批意见');

  const changes = state.changes.filter((change) => request.changeIds.includes(change.id));
  if (changes.length !== request.changeIds.length) throw new Error('位置变更明细不完整，不能审批');
  if (decision === '同意') applyInventoryLocationApproval({ requestId: id, changes, approver: text(approver) });
  const status = decision === '同意' ? '已通过' : '已驳回';
  const next = {
    changes: state.changes.map((change) => request.changeIds.includes(change.id) ? { ...change, status } : change),
    requests: state.requests.map((item) => item.id === id
      ? { ...item, status, opinion: text(opinion), approvedAt: currentTime() }
      : item),
  };
  writeState(next);
  return next.requests.find((item) => item.id === id);
}

// 演示入口显式创建待发起记录，继续复用正常提交与审批链路。
export function createInventoryLocationChangeDemo(project) {
  if (project?.projectNo !== INVENTORY_LOCATION_CHANGE_DEMO.projectNo || project.projectType !== '复盘') throw new Error('该项目没有位置变更演示数据');
  const existing = getInventoryLocationChanges(project.projectNo).find(change => change.assetTag === INVENTORY_LOCATION_CHANGE_DEMO.assetTag && ['待发起', '待审批'].includes(change.status));
  if (existing) return existing;
  const asset = requireLedgerAsset(INVENTORY_LOCATION_CHANGE_DEMO.assetTag);
  const target = getAssetMaintenanceRows().find(row => row.city === asset.city && row.building === asset.building && row.floor && row.floor !== asset.floor);
  if (!target) throw new Error('当前台账没有可用于演示的同建筑其他楼层');
  return recordInventoryLocationChange({ ...INVENTORY_LOCATION_CHANGE_DEMO, projectType:'复盘', before:asset, after:target });
}
