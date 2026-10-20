import dayjs from 'dayjs';
import { inventoryLocationPhotoBlockReason } from './inventoryLocationPhotoRules';
import { buildLocationDraft, validateLocation } from './inventoryLocationEdit';
import { getInventoryLocationOptions } from './inventoryMobileLocationService';
import { CURRENT_BORROWER } from '../../mock/assetBorrowingMock';
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
const currentTime = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

export function getInventoryLocationApplicant(operator) {
  const value = text(operator);
  const [id, ...parts] = value.split('-');
  const name = parts.join('-');
  return {value, displayName:name ? `${name} (${id})` : value || '-', department:value === `${CURRENT_BORROWER.id}-${CURRENT_BORROWER.name}` ? CURRENT_BORROWER.department : ''};
}

export function canCreateInventoryLocationChange(project, operator) {
  return project?.projectType === '复盘' && project?.status !== '盘点关闭'
    && Boolean(text(project?.creator)) && text(project.creator) === text(operator);
}

export function getInventoryLocationApprovalRecords(request) {
  if (request.approvalRecords) return request.approvalRecords;
  // 历史演示申请按原有单头和审批结论还原一轮记录。
  return [
    {key:'start', node:'提交申请', person:request.applicant, status:'已提交', time:request.appliedAt, opinion:request.reason},
    {key:'review', node:'ES主管审批', person:request.approver, status:request.status === '待审批' ? '待审批' : request.status, time:request.approvedAt, opinion:request.opinion},
  ];
}

function submissionRecords(applicant, reason, time, round) {
  return [
    {key:'start-' + round, node:'提交申请', person:applicant, status:'已提交', time, opinion:reason},
    {key:'review-' + round, node:'ES主管审批', person:APPROVER, status:'待审批', time:'', opinion:''},
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
    quantity: asset.quantity,
    remark: asset.remarks || '',
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

export function submitInventoryLocationChangeRequest({ projectNo, projectType, projectCreator, projectStatus, requestId = '', reason, applicant, applicantDepartment = '', draftLocations = {}, draftRemarks = {}, addedAssets = [], permittedAssetTags = [], projectAssets = [] }) {
  if (projectType !== '复盘') throw new Error('只有复盘项目可以发起位置变更');
  if (!text(projectNo)) throw new Error('缺少盘点项目编号');
  if (!text(reason)) throw new Error('请填写变更原因');
  if (!text(applicant)) throw new Error('缺少申请人');
  if (!canCreateInventoryLocationChange({projectType, creator:projectCreator, status:projectStatus}, applicant)) throw new Error('仅盘点项目创建人可以发起位置变更，已关闭项目不可提交');
  const state = readState();
  const previousRequest = requestId ? state.requests.find(item => item.id === requestId) : null;
  if (requestId && (!previousRequest || previousRequest.projectNo !== projectNo)) throw new Error('位置变更申请不存在或不属于当前项目');
  if (previousRequest && (previousRequest.status !== '已驳回' || previousRequest.applicant !== text(applicant))) throw new Error('仅原申请人可以修改并重新提交已驳回的位置变更申请');
  const waiting = state.changes.filter((change) => change.projectNo === projectNo && (previousRequest ? previousRequest.changeIds.includes(change.id) : change.status === '待发起'));
  if (previousRequest && waiting.length !== previousRequest.changeIds.length) throw new Error('位置变更明细不完整，不能重新提交');
  const pending = waiting;
  const tags = new Set(waiting.map(change => change.assetTag));
  const additions = addedAssets.map(change => {
    if (!permittedAssetTags.includes(change.assetTag)) throw new Error('添加资产不在当前复盘项目范围');
    if (tags.has(change.assetTag) || state.changes.some(item => item.projectNo === projectNo && item.assetTag === change.assetTag && item.status === '待审批')) throw new Error('添加资产重复或已提交审批');
    tags.add(change.assetTag);
    const asset = requireLedgerAsset(change.assetTag);
    const draft = buildLocationDraft(asset);
    if (!sameLocation(change.before, draft.before)) throw new Error(change.assetTag + ' 的台账位置已变化，请重新添加');
    return {...draft, after:draftLocations[change.id] || change.after, remark:draftRemarks[change.id] ?? change.remark, projectNo, projectType, operator:applicant, recordedAt:currentTime(), id:'inventory-location-' + Date.now() + '-' + Math.random().toString(36).slice(2,8)};
  });
  const changes = [...pending, ...additions];
  if (!changes.length) throw new Error('当前项目没有待发起的位置变更');
  const prepared = changes.map((change) => {
    if (state.changes.some(item => item.projectNo === projectNo && item.assetTag === change.assetTag && item.status === '待审批' && item.requestId !== requestId)) throw new Error('该资产的位置变更已提交审批，不能重复提交');
    const photoBlockReason = inventoryLocationPhotoBlockReason(projectNo, change.assetTag, projectAssets);
    if (photoBlockReason) throw new Error(photoBlockReason);
    const target = location(draftLocations[change.id] || change.after);
    if (FIELDS.some((field) => !target[field])) throw new Error(`${change.assetTag} 的新位置不完整`);
    validateLocation(target, getInventoryLocationOptions);
    const asset = requireLedgerAsset(change.assetTag);
    if (!sameLocation(asset, change.before)) throw new Error(`${change.assetTag} 的台账位置已变化，请核对后再发起`);
    const remark = text(draftRemarks[change.id] ?? change.remark ?? asset.remarks ?? '');
    if (Array.from(remark).length > 150) throw new Error(`${change.assetTag} 的备注最多150个字符`);
    return { ...change, quantity:change.quantity ?? asset.quantity, remark, after: target };
  }).filter((change) => !sameLocation(change.before, change.after));
  if (!prepared.length) throw new Error('当前项目没有待发起的位置变更');
  const appliedAt = currentTime();
  const previousRecords = previousRequest ? getInventoryLocationApprovalRecords(previousRequest) : [];
  const request = {
    id: previousRequest?.id || `ILC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectNo,
    projectType,
    reason: text(reason),
    applicant: text(applicant),
    applicantDepartment: text(applicantDepartment),
    appliedAt,
    approver: APPROVER,
    status: '待审批',
    changeIds: prepared.map((change) => change.id),
    opinion: '',
    approvedAt: '',
    approvalRecords: [...previousRecords, ...submissionRecords(text(applicant), text(reason), appliedAt, previousRecords.length / 2 + 1)],
  };
  const preparedById = new Map(prepared.map((change) => [change.id, change]));
  const revertedIds = new Set(changes.filter((change) => !preparedById.has(change.id)).map((change) => change.id));
  writeState({
    requests: previousRequest ? state.requests.map(item => item.id === request.id ? request : item) : [...state.requests, request],
    changes: [...state.changes, ...additions].filter((change) => !revertedIds.has(change.id)).map((change) => preparedById.has(change.id)
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
  const approvedAt = currentTime();
  const records = getInventoryLocationApprovalRecords(request);
  const next = {
    changes: state.changes.map((change) => request.changeIds.includes(change.id) ? { ...change, status } : change),
    requests: state.requests.map((item) => item.id === id
      ? { ...item, status, opinion: text(opinion), approvedAt, approvalRecords: records.map((record, index) => index === records.length - 1 ? {...record, status, time:approvedAt, opinion:text(opinion)} : record) }
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
