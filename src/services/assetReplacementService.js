import {
  ASSET_REPLACEMENT_DRAFT_KEY,
  ASSET_REPLACEMENT_STORAGE_KEY,
  CURRENT_REPLACEMENT_APPLICANT,
  DEFAULT_ASSET_REPLACEMENT_APPLICATIONS,
  EMPLOYEE_REPLACEMENT_ASSETS,
  REPLACEMENT_ALLOCATABLE_ASSETS,
} from '../mock/assetReplacementMock';
import { readDemoData, writeDemoData } from './demoStorage';

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function todayText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function buildApplicationId(index) {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `GH-${date}${String(now.getTime()).slice(-4)}${String(index + 1).padStart(2, '0')}`;
}

function buildOrderNo(prefix) {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${prefix}-${date}${String(now.getTime()).slice(-6)}`;
}

export function getAssetReplacementApplications() {
  return readDemoData(ASSET_REPLACEMENT_STORAGE_KEY, DEFAULT_ASSET_REPLACEMENT_APPLICATIONS);
}

export function saveAssetReplacementApplications(applications) {
  return writeDemoData(ASSET_REPLACEMENT_STORAGE_KEY, applications);
}

export function updateAssetReplacementApplication(applicationId, updater) {
  const nextApplications = getAssetReplacementApplications().map((application) => {
    if (application.id !== applicationId) return application;
    return typeof updater === 'function'
      ? updater(application)
      : { ...application, ...updater };
  });
  saveAssetReplacementApplications(nextApplications);
  return nextApplications;
}

export function getReplacementDraftAssetIds() {
  return readDemoData(ASSET_REPLACEMENT_DRAFT_KEY, []);
}

export function setReplacementDraftAssetIds(assetIds) {
  return writeDemoData(ASSET_REPLACEMENT_DRAFT_KEY, assetIds);
}

export function getEmployeeReplacementAssets() {
  const activeTags = new Set(
    getAssetReplacementApplications()
      .filter((application) => application.status === '处理中')
      .map((application) => application.oldAsset.assetTag)
  );

  return EMPLOYEE_REPLACEMENT_ASSETS.map((asset) => ({
    ...asset,
    businessLocked: activeTags.has(asset.assetTag),
  }));
}

export function getReplacementEligibility(asset) {
  if (CURRENT_REPLACEMENT_APPLICANT.employeeType === '外包员工') {
    return { allowed: false, reason: '外包员工不支持资产更换' };
  }
  if (!asset.replaceEnabled) {
    return { allowed: false, reason: '物料未启用更换' };
  }
  if (asset.status !== '在用-使用中') {
    return { allowed: false, reason: '资产状态非在用-使用中' };
  }
  if (asset.locked || asset.businessLocked) {
    return { allowed: false, reason: '资产已被其他单据锁定' };
  }
  if (asset.excludedType) {
    return { allowed: false, reason: '该资产小类不支持更换' };
  }
  return { allowed: true, reason: '' };
}

export function createAssetReplacementApplications(assetIds, reason) {
  const assets = getEmployeeReplacementAssets();
  const selectedAssets = assetIds.map((assetId) => assets.find((asset) => asset.id === assetId)).filter(Boolean);
  const invalidAsset = selectedAssets.find((asset) => !getReplacementEligibility(asset).allowed);
  if (invalidAsset) {
    const eligibility = getReplacementEligibility(invalidAsset);
    throw new Error(`资产（资产标签号：${invalidAsset.assetTag}）${eligibility.reason}`);
  }

  const created = selectedAssets.map((asset, index) => ({
    id: buildApplicationId(index),
    applyDate: todayText(),
    applyTime: nowText(),
    status: '处理中',
    currentNode: 'MIS鉴定',
    applicant: CURRENT_REPLACEMENT_APPLICANT,
    replacementType: '故障更换',
    reason,
    oldAsset: asset,
    mis: { result: '', description: '', decision: '', comment: '', person: '', time: '' },
    returnProcess: { warehouse: asset.warehouse || '北京总部仓', confirmStatus: '未发起', confirmMethod: '', confirmedAt: '', inboundStatus: '未入库', inboundOrderNo: '', inboundAt: '' },
    newAsset: null,
    issueProcess: { warehouse: asset.warehouse || '北京总部仓', confirmStatus: '未发起', confirmMethod: '', confirmedAt: '', outboundStatus: '未出库', outboundOrderNo: '', outboundAt: '', city: asset.city || '北京市', building: asset.building || '搜狐媒体大厦', floor: asset.floor || '8层', startDate: '', returnDate: '', purpose: asset.purpose || '员工用机', usageNote: '' },
    history: [
      { node: '员工提交', person: `${CURRENT_REPLACEMENT_APPLICANT.id}-${CURRENT_REPLACEMENT_APPLICANT.name}`, status: '已提交', time: nowText(), comment: reason },
    ],
  }));

  saveAssetReplacementApplications([...created, ...getAssetReplacementApplications()]);
  setReplacementDraftAssetIds([]);
  return created;
}

export function getReplacementApplicationsByNodes(nodes) {
  return getAssetReplacementApplications().filter((application) => (
    application.status === '处理中' && nodes.includes(application.currentNode)
  ));
}

export function getPendingMisApplications() {
  return getReplacementApplicationsByNodes(['MIS鉴定']);
}

export function getPendingHandlingApplications() {
  return getReplacementApplicationsByNodes(['旧资产退回', '旧资产确认', '新资产发放', '新资产确认']);
}

export function getAvailableReplacementAssets(oldAsset, warehouse) {
  const usedTags = new Set(
    getAssetReplacementApplications()
      .filter((application) => application.status === '处理中' && application.newAsset)
      .map((application) => application.newAsset.assetTag)
  );

  return REPLACEMENT_ALLOCATABLE_ASSETS.filter((asset) => (
    asset.subCategory === oldAsset?.subCategory
    && (!warehouse || asset.warehouse === warehouse)
    && ['在库-新增', '在库-待处理', '在库-再利用'].includes(asset.status)
    && !asset.locked
    && !usedTags.has(asset.assetTag)
  ));
}

export function submitMisDecision(applicationId, values) {
  return updateAssetReplacementApplication(applicationId, (application) => {
    const approved = values.decision === '同意';
    return {
      ...application,
      status: approved ? '处理中' : '已驳回',
      currentNode: approved ? '旧资产退回' : '流程结束',
      mis: {
        result: values.result,
        description: values.description,
        decision: values.decision,
        comment: values.comment,
        person: 'CW003379-李木勇',
        time: nowText(),
      },
      history: [
        ...application.history,
        {
          node: 'MIS鉴定',
          person: 'CW003379-李木勇',
          status: approved ? '已同意' : '已驳回',
          time: nowText(),
          comment: values.comment || values.description,
        },
      ],
    };
  });
}

export function requestReplacementConfirmation(applicationId, scene, method) {
  return updateAssetReplacementApplication(applicationId, (application) => {
    if (scene === '旧资产退回') {
      return {
        ...application,
        currentNode: '旧资产确认',
        returnProcess: { ...application.returnProcess, confirmStatus: '待确认', confirmMethod: method },
        history: [
          ...application.history,
          { node: '旧资产退回确认', person: `${application.applicant.id}-${application.applicant.name}`, status: '待确认', time: nowText(), comment: `确认方式：${method}` },
        ],
      };
    }
    return {
      ...application,
      currentNode: '新资产确认',
      issueProcess: { ...application.issueProcess, confirmStatus: '待确认', confirmMethod: method },
      history: [
        ...application.history,
        { node: '新资产领取确认', person: `${application.applicant.id}-${application.applicant.name}`, status: '待确认', time: nowText(), comment: `确认方式：${method}` },
      ],
    };
  });
}

export function confirmReplacementByEmployee(applicationId, scene, method) {
  return updateAssetReplacementApplication(applicationId, (application) => {
    const time = nowText();
    if (scene === '旧资产退回') {
      return {
        ...application,
        currentNode: '旧资产退回',
        returnProcess: { ...application.returnProcess, confirmStatus: '已确认', confirmMethod: method, confirmedAt: time },
        history: application.history.map((record) => (
          record.node === '旧资产退回确认' && record.status === '待确认'
            ? { ...record, status: '已确认', time, comment: '员工确认已交还旧资产及相关配件' }
            : record
        )),
      };
    }
    return {
      ...application,
      currentNode: '新资产发放',
      issueProcess: { ...application.issueProcess, confirmStatus: '已确认', confirmMethod: method, confirmedAt: time },
      history: application.history.map((record) => (
        record.node === '新资产领取确认' && record.status === '待确认'
          ? { ...record, status: '已确认', time, comment: '员工确认已领取新资产及相关配件' }
          : record
      )),
    };
  });
}

export function executeReplacementInbound(applicationId, warehouse) {
  const orderNo = buildOrderNo('RK');
  return updateAssetReplacementApplication(applicationId, (application) => ({
    ...application,
    currentNode: '新资产发放',
    returnProcess: { ...application.returnProcess, warehouse, inboundStatus: '已入库', inboundOrderNo: orderNo, inboundAt: nowText() },
    history: [
      ...application.history,
      { node: '执行入库', person: 'SOHU01-库房管理员', status: '已完成', time: nowText(), comment: `入库单号：${orderNo}` },
    ],
  }));
}

export function executeReplacementOutbound(applicationId, values) {
  const orderNo = buildOrderNo('CK');
  return updateAssetReplacementApplication(applicationId, (application) => ({
    ...application,
    status: '已完成',
    currentNode: '流程结束',
    newAsset: values.newAsset,
    issueProcess: { ...application.issueProcess, ...values.issueProcess, outboundStatus: '已出库', outboundOrderNo: orderNo, outboundAt: nowText() },
    history: [
      ...application.history,
      { node: '执行出库', person: 'SOHU01-库房管理员', status: '已完成', time: nowText(), comment: `出库单号：${orderNo}` },
    ],
  }));
}

export function endReplacementApplication(applicationId, comment) {
  return updateAssetReplacementApplication(applicationId, (application) => {
    const oldAssetReturned = application.returnProcess.inboundStatus === '已入库';
    return {
      ...application,
      status: oldAssetReturned ? '已完成' : '已驳回',
      currentNode: '流程结束',
      newAsset: null,
      history: [
        ...application.history,
        { node: 'ES办理', person: 'SOHU01-库房管理员', status: oldAssetReturned ? '已结束' : '已驳回', time: nowText(), comment },
      ],
    };
  });
}
