import {
  ASSET_RETURN_DRAFT_KEY,
  ASSET_RETURN_STORAGE_KEY,
  CONTRACT_RETURN_DRAFT_KEY,
  CONTRACT_RETURN_STORAGE_KEY,
  DEFAULT_ASSET_RETURN_APPLICATIONS,
  DEFAULT_CONTRACT_RETURN_APPLICATIONS,
  EMPLOYEE_CONTRACT_NUMBERS,
  RETURN_CONFIRMATION_KEY,
} from '../mock/assetReturnMock';
import {
  CURRENT_REPLACEMENT_APPLICANT,
  EMPLOYEE_REPLACEMENT_ASSETS,
} from '../mock/assetReplacementMock';
import { readDemoData, writeDemoData } from './demoStorage';

const clone = (value) => JSON.parse(JSON.stringify(value));

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function todayText() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function buildNo(prefix, index = 0) {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${prefix}-${date}${String(now.getTime()).slice(-5)}${String(index + 1).padStart(2, '0')}`;
}

function updateCollection(storageKey, defaults, id, updater) {
  const records = readDemoData(storageKey, defaults);
  const next = records.map((record) => (
    record.id === id ? (typeof updater === 'function' ? updater(record) : { ...record, ...updater }) : record
  ));
  writeDemoData(storageKey, next);
  return next;
}

function appendHistory(application, node, status, comment, person = '213852-孙志强') {
  return [
    ...(application.history || []),
    { node, status, comment: comment || '-', person, time: nowText() },
  ];
}

function assetConsumables(asset) {
  if (!asset.consumables || asset.consumables === '无') return [];
  return [{
    id: `${asset.id}-C01`,
    assetTag: `QT-${asset.assetTag.replace(/\D/g, '').slice(-6) || '000001'}`,
    assetDesc: asset.consumables,
    config: '随主资产退库',
    quantity: 1,
    status: asset.status,
  }];
}

export function getAssetReturnApplications() {
  return readDemoData(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS);
}

export function addAssetReturnAttachment(id, attachment) {
  const record = {
    id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: attachment.name,
    size: attachment.size || 0,
    type: attachment.type || '',
    node: attachment.node,
    uploaderId: attachment.uploaderId,
    uploaderName: attachment.uploaderName,
    uploadedAt: nowText(),
  };
  updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    attachments: [...(application.attachments || []), record],
  }));
  return record;
}

export function removeAssetReturnAttachment(id, attachmentId, operator) {
  const application = getAssetReturnApplications().find((item) => item.id === id);
  const attachment = application?.attachments?.find((item) => item.id === attachmentId);
  if (!attachment) throw new Error('附件不存在或已被删除');
  if (attachment.node !== operator.node || attachment.uploaderId !== operator.uploaderId) {
    throw new Error('只能删除当前节点本人上传的附件');
  }
  return updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (current) => ({
    ...current,
    attachments: (current.attachments || []).filter((item) => item.id !== attachmentId),
  }));
}

export function getContractReturnApplications() {
  return readDemoData(CONTRACT_RETURN_STORAGE_KEY, DEFAULT_CONTRACT_RETURN_APPLICATIONS);
}

export function getAssetReturnDraftIds() {
  return readDemoData(ASSET_RETURN_DRAFT_KEY, []);
}

export function setAssetReturnDraftIds(ids) {
  return writeDemoData(ASSET_RETURN_DRAFT_KEY, ids);
}

export function getContractReturnDraftIds() {
  return readDemoData(CONTRACT_RETURN_DRAFT_KEY, []);
}

export function setContractReturnDraftIds(ids) {
  return writeDemoData(CONTRACT_RETURN_DRAFT_KEY, ids);
}

export function getAssetReturnAssets() {
  const activeTags = new Set(
    getAssetReturnApplications()
      .filter((application) => application.status === '处理中')
      .map((application) => application.asset.assetTag)
  );
  return EMPLOYEE_REPLACEMENT_ASSETS.map((asset) => ({
    ...clone(asset),
    returnBusinessLocked: activeTags.has(asset.assetTag),
    returnMisRequired: ['笔记本电脑', '工作站', '苹果笔记本'].includes(asset.subCategory),
    relatedConsumables: assetConsumables(asset),
  }));
}

export function getAssetReturnEligibility(asset) {
  if (!['在用-使用中', '再利用-使用中'].includes(asset.status)) {
    return { allowed: false, reason: '资产状态不支持退库' };
  }
  if (asset.locked || asset.returnBusinessLocked) {
    return { allowed: false, reason: '资产已被其他单据锁定' };
  }
  return { allowed: true, reason: '' };
}

export function createAssetReturnApplications(assetIds, values) {
  const assets = getAssetReturnAssets();
  const selected = assetIds.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean);
  if (!selected.length) throw new Error('请至少选择一项退库资产');
  const invalid = selected.find((asset) => !getAssetReturnEligibility(asset).allowed);
  if (invalid) throw new Error(`资产（资产标签号：${invalid.assetTag}）${getAssetReturnEligibility(invalid).reason}`);

  const created = selected.map((asset, index) => {
    const needsLeader = asset.purpose === '部门公用';
    const currentNode = needsLeader ? '领导审批' : (asset.returnMisRequired ? 'MIS鉴定' : 'ES退库办理');
    return {
      id: buildNo('TK', index),
      status: '处理中',
      result: '',
      currentNode,
      applyTime: nowText(),
      applicant: CURRENT_REPLACEMENT_APPLICANT,
      returnType: values.returnType,
      reason: values.reason,
      asset,
      relatedConsumables: asset.relatedConsumables,
      attachments: [],
      leader: { decision: '', comment: '', person: '', time: '' },
      mis: { result: '', description: '', decision: '', comment: '', person: '', time: '' },
      handling: {
        warehouse: asset.warehouse || '北京总部资产仓',
        city: asset.city || '北京市',
        building: asset.building || '搜狐媒体大厦',
        floor: asset.floor || '8层',
        responsiblePerson: 'SOHU01-库房管理员-SOHU',
        assetMark: '',
        returnDate: todayText(),
        usageNote: '',
        confirmationStatus: '未发起',
        confirmationMethod: '',
        confirmationEmployeeId: '',
        confirmationTime: '',
        inboundOrderNo: '',
        opinion: '',
      },
      history: [{ node: '员工提交', status: '已提交', comment: values.reason, person: `${CURRENT_REPLACEMENT_APPLICANT.id}-${CURRENT_REPLACEMENT_APPLICANT.name}`, time: nowText() }],
    };
  });

  writeDemoData(ASSET_RETURN_STORAGE_KEY, [...created, ...getAssetReturnApplications()]);
  setAssetReturnDraftIds([]);
  return created;
}

export function submitAssetReturnLeaderDecision(id, decision, comment) {
  return updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => {
    const approved = decision === '同意';
    return {
      ...application,
      status: approved ? '处理中' : '已驳回',
      currentNode: approved ? (application.asset.returnMisRequired ? 'MIS鉴定' : 'ES退库办理') : '流程结束',
      leader: { decision, comment, person: '110139-张雪梅', time: nowText() },
      history: appendHistory(application, '领导审批', approved ? '已同意' : '已驳回', comment, '110139-张雪梅'),
    };
  });
}

export function submitAssetReturnMisDecision(id, values) {
  const approved = values.decision === '同意';
  return updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    status: approved ? '处理中' : '已驳回',
    currentNode: approved ? 'ES退库办理' : '流程结束',
    mis: { ...values, person: 'CW003379-李木勇', time: nowText() },
    history: appendHistory(application, 'MIS鉴定', approved ? '已同意' : '已驳回', values.comment || values.description, 'CW003379-李木勇'),
  }));
}

export function requestAssetReturnConfirmation(id, handlingValues = {}) {
  updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    currentNode: '员工退库确认',
    handling: { ...application.handling, ...handlingValues, confirmationStatus: '待确认' },
    history: appendHistory(application, '申请人退库确认', '待确认', '已发起扫码、刷卡或工号确认', '119039-刘建'),
  }));
  return writeDemoData(RETURN_CONFIRMATION_KEY, { kind: 'asset', applicationId: id });
}

export function confirmReturnEmployee(employeeId, method) {
  const target = readDemoData(RETURN_CONFIRMATION_KEY, null);
  if (!target) throw new Error('暂无待确认退库单');
  if (employeeId !== CURRENT_REPLACEMENT_APPLICANT.id) throw new Error('员工工号不匹配！');
  if (target.kind === 'asset') {
    updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, target.applicationId, (application) => ({
      ...application,
      currentNode: 'ES退库办理',
      handling: {
        ...application.handling,
        confirmationStatus: '已确认',
        confirmationMethod: method,
        confirmationEmployeeId: employeeId,
        confirmationTime: nowText(),
      },
      history: appendHistory(application, '员工退库确认', '已确认', `${method}确认成功`),
    }));
  } else {
    updateCollection(CONTRACT_RETURN_STORAGE_KEY, DEFAULT_CONTRACT_RETURN_APPLICATIONS, target.applicationId, (application) => ({
      ...application,
      currentNode: '号码退库办理',
      handling: {
        ...application.handling,
        confirmationStatus: '已确认',
        confirmationMethod: method,
        confirmationEmployeeId: employeeId,
        confirmationTime: nowText(),
      },
      history: appendHistory(application, '员工号码退库确认', '已确认', `${method}确认成功`),
    }));
  }
  return target;
}

export function getActiveReturnConfirmation(kind) {
  const target = readDemoData(RETURN_CONFIRMATION_KEY, null);
  if (!target || target.kind !== kind) return null;
  const records = kind === 'asset' ? getAssetReturnApplications() : getContractReturnApplications();
  return records.find((record) => record.id === target.applicationId) || null;
}

export function completeAssetReturn(id, handlingValues) {
  return updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => {
    if (application.handling.confirmationStatus !== '已确认') throw new Error('请先完成员工退库确认');
    const inboundOrderNo = buildNo('RK');
    return {
      ...application,
      status: '已处理',
      result: '正常退库',
      currentNode: '流程结束',
      handling: { ...application.handling, ...handlingValues, inboundOrderNo },
      history: appendHistory(application, '执行入库', '已完成', `入库单号：${inboundOrderNo}`, '119039-刘建'),
    };
  });
}

export function finishAssetReturn(id, result, opinion) {
  const rejected = result === '驳回';
  return updateCollection(ASSET_RETURN_STORAGE_KEY, DEFAULT_ASSET_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    status: rejected ? '已驳回' : '已处理',
    result: rejected ? '' : '放弃退库',
    currentNode: '流程结束',
    handling: { ...application.handling, opinion },
    history: appendHistory(application, rejected ? 'ES驳回' : '放弃退库', rejected ? '已驳回' : '已处理', opinion, '119039-刘建'),
  }));
}

export function getEmployeeContractNumbers() {
  const activeNumbers = new Set(
    getContractReturnApplications().filter((item) => item.status === '处理中').map((item) => item.contractNumber.number)
  );
  return EMPLOYEE_CONTRACT_NUMBERS.map((item) => ({ ...clone(item), businessLocked: activeNumbers.has(item.number) }));
}

export function getContractReturnEligibility(record) {
  if (record.status !== '在用') return { allowed: false, reason: '号码状态非在用' };
  if (record.locked || record.businessLocked) return { allowed: false, reason: '号码已被其他单据锁定' };
  return { allowed: true, reason: '' };
}

export function createContractReturnApplications(ids, values) {
  const numbers = getEmployeeContractNumbers();
  const selected = ids.map((id) => numbers.find((item) => item.id === id)).filter(Boolean);
  if (!selected.length) throw new Error('请至少选择一个合约号码');
  const invalid = selected.find((item) => !getContractReturnEligibility(item).allowed);
  if (invalid) throw new Error(`合约号码（${invalid.number}）${getContractReturnEligibility(invalid).reason}`);
  const created = selected.map((contractNumber, index) => ({
    id: buildNo('HTTK', index),
    status: '处理中',
    result: '',
    currentNode: '号码退库办理',
    applyTime: nowText(),
    applicant: CURRENT_REPLACEMENT_APPLICANT,
    reason: values.reason,
    attachment: values.attachment || '',
    contractNumber,
    handling: {
      warehouse: '北京总部号码仓',
      returnDate: todayText(),
      opinion: '',
      confirmationStatus: '未发起',
      confirmationMethod: '',
      confirmationEmployeeId: '',
      confirmationTime: '',
      inboundOrderNo: '',
    },
    history: [{ node: '员工提交', status: '已提交', comment: values.reason, person: `${CURRENT_REPLACEMENT_APPLICANT.id}-${CURRENT_REPLACEMENT_APPLICANT.name}`, time: nowText() }],
  }));
  writeDemoData(CONTRACT_RETURN_STORAGE_KEY, [...created, ...getContractReturnApplications()]);
  setContractReturnDraftIds([]);
  return created;
}

export function requestContractReturnConfirmation(id) {
  updateCollection(CONTRACT_RETURN_STORAGE_KEY, DEFAULT_CONTRACT_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    currentNode: '员工号码退库确认',
    handling: { ...application.handling, confirmationStatus: '待确认' },
    history: appendHistory(application, '申请人退库确认', '待确认', '已发起扫码、刷卡或工号确认', '号码库管员'),
  }));
  return writeDemoData(RETURN_CONFIRMATION_KEY, { kind: 'contract', applicationId: id });
}

export function completeContractReturn(id, handlingValues) {
  return updateCollection(CONTRACT_RETURN_STORAGE_KEY, DEFAULT_CONTRACT_RETURN_APPLICATIONS, id, (application) => {
    if (application.handling.confirmationStatus !== '已确认') throw new Error('请先完成员工号码退库确认');
    const inboundOrderNo = buildNo('HRK');
    return {
      ...application,
      status: '已处理',
      result: '正常退还',
      currentNode: '流程结束',
      handling: { ...application.handling, ...handlingValues, inboundOrderNo },
      history: appendHistory(application, '执行入库', '已完成', `号码入库单号：${inboundOrderNo}`, '号码库管员'),
    };
  });
}

export function finishContractReturn(id, result, opinion) {
  const rejected = result === '驳回';
  return updateCollection(CONTRACT_RETURN_STORAGE_KEY, DEFAULT_CONTRACT_RETURN_APPLICATIONS, id, (application) => ({
    ...application,
    status: rejected ? '已驳回' : '已处理',
    result: rejected ? '' : '放弃退还',
    currentNode: '流程结束',
    handling: { ...application.handling, opinion },
    history: appendHistory(application, rejected ? '库管员驳回' : '放弃退还', rejected ? '已驳回' : '已处理', opinion, '号码库管员'),
  }));
}
