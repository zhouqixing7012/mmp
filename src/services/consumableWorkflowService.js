import {
  CONSUMABLE_APPLICANT,
  CONSUMABLE_WORKFLOW_STORAGE_KEY,
  DEFAULT_CONSUMABLE_WORKFLOW_STATE,
} from '../mock/consumableWorkflowMock';
import { readDemoData, writeDemoData } from './demoStorage';

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function buildNo(prefix) {
  const now = new Date();
  return `${prefix}-${now.toISOString().slice(0, 10).replaceAll('-', '')}${String(now.getTime()).slice(-5)}`;
}

export function getConsumableWorkflowState() {
  return readDemoData(CONSUMABLE_WORKFLOW_STORAGE_KEY, DEFAULT_CONSUMABLE_WORKFLOW_STATE);
}

export function saveConsumableWorkflowState(state) {
  return writeDemoData(CONSUMABLE_WORKFLOW_STORAGE_KEY, state);
}

export function updateConsumableWorkflowState(updater) {
  const current = getConsumableWorkflowState();
  const next = typeof updater === 'function' ? updater(current) : updater;
  saveConsumableWorkflowState(next);
  return next;
}

export function createConsumableApplication(items) {
  const requiresMis = items.some((item) => item.requiresMis);
  const application = {
    id: buildNo('HCSQ'),
    status: '处理中',
    currentNode: requiresMis ? 'MIS鉴定' : '5级审批',
    applyDate: todayText(),
    applicant: CONSUMABLE_APPLICANT,
    items: items.map((item, index) => ({
      ...item,
      id: `${item.id}-${Date.now()}-${index}`,
      lineStatus: '处理中',
      misOpinion: item.requiresMis ? '' : '不涉及',
      misDescription: item.requiresMis ? '' : '-',
    })),
    history: [
      {
        node: '员工提交',
        person: `${CONSUMABLE_APPLICANT.id}-${CONSUMABLE_APPLICANT.name}`,
        status: '已提交',
        time: nowText(),
        comment: '提交耗材申请',
      },
      {
        node: requiresMis ? 'MIS鉴定' : '5级审批',
        person: requiresMis ? 'CW003379-李木勇' : CONSUMABLE_APPLICANT.level5Leader,
        status: '待审批',
        time: '-',
        comment: '-',
      },
    ],
  };

  updateConsumableWorkflowState((state) => ({
    ...state,
    applications: [application, ...state.applications],
  }));
  return application;
}

export function saveMisDraft(applicationId, itemValues) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    applications: state.applications.map((application) => (
      application.id !== applicationId
        ? application
        : {
          ...application,
          items: application.items.map((item) => (
            itemValues[item.id] ? { ...item, ...itemValues[item.id] } : item
          )),
        }
    )),
  }));
}

export function submitMisDecision(applicationId, decision, itemValues) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    applications: state.applications.map((application) => {
      if (application.id !== applicationId) return application;
      const visibleIds = new Set(Object.keys(itemValues));
      const items = application.items.map((item) => {
        if (!visibleIds.has(item.id)) return item;
        const values = itemValues[item.id];
        return {
          ...item,
          ...values,
          lineStatus: decision === '驳回' ? '已驳回' : item.lineStatus,
        };
      });
      const allRejected = items.every((item) => item.lineStatus === '已驳回');
      const history = application.history.map((record) => (
        record.node === 'MIS鉴定' && record.status === '待审批'
          ? {
            ...record,
            status: decision === '驳回' ? '已驳回' : '已同意',
            time: nowText(),
            comment: Object.values(itemValues).map((item) => item.misDescription).filter(Boolean).join('；') || decision,
          }
          : record
      ));
      if (allRejected) {
        return {
          ...application,
          items,
          status: '已驳回',
          currentNode: '流程结束',
          history,
        };
      }
      return {
        ...application,
        items,
        currentNode: '5级审批',
        history: [
          ...history,
          {
            node: '5级审批',
            person: application.applicant.level5Leader,
            status: '待审批',
            time: '-',
            comment: '-',
          },
        ],
      };
    }),
  }));
}

export function submitLeaderDecision(applicationId, decision, comment) {
  let createdAllocations = [];
  const nextState = updateConsumableWorkflowState((state) => {
    const application = state.applications.find((item) => item.id === applicationId);
    if (!application) return state;
    const approved = decision === '同意';
    const availableItems = application.items.filter((item) => item.lineStatus !== '已驳回');
    createdAllocations = approved ? availableItems.map((item, index) => ({
      id: `${buildNo('HCPG')}-${index + 1}`,
      sourceApplicationId: application.id,
      sourceLineId: item.id,
      status: '待配给',
      applyDate: application.applyDate,
      applicant: application.applicant,
      item,
      matchingStatus: '',
      rejectType: '',
      esAdvice: '',
      matchedStock: null,
      history: [
        ...application.history.map((record) => (
          record.node === '5级审批' && record.status === '待审批'
            ? { ...record, status: '已同意', time: nowText(), comment: comment || '同意' }
            : record
        )),
        { node: 'ES配给', person: '119039-刘建', status: '待处理', time: '-', comment: '-' },
      ],
    })) : [];

    return {
      ...state,
      applications: state.applications.map((item) => {
        if (item.id !== applicationId) return item;
        const history = item.history.map((record) => (
          record.node === '5级审批' && record.status === '待审批'
            ? {
              ...record,
              status: approved ? '已同意' : '已驳回',
              time: nowText(),
              comment: comment || decision,
            }
            : record
        ));
        return {
          ...item,
          status: approved ? '处理中' : '已驳回',
          currentNode: approved ? '耗材配给' : '流程结束',
          items: approved ? item.items : item.items.map((line) => ({ ...line, lineStatus: '已驳回' })),
          history,
        };
      }),
      allocations: approved ? [...createdAllocations, ...state.allocations] : state.allocations,
    };
  });
  return { state: nextState, allocations: createdAllocations };
}

function appendSummaryRow(summaries, allocation) {
  const draftIndex = summaries.findIndex((item) => item.status === '草稿' && item.company === '集团&媒体');
  if (draftIndex < 0) return summaries;
  const summary = summaries[draftIndex];
  const row = {
    id: `summary-row-${Date.now()}`,
    department: allocation.applicant.department.replaceAll('/', '.'),
    applicationId: allocation.sourceApplicationId,
    applicant: `${allocation.applicant.name}(${allocation.applicant.id})`,
    category: allocation.item.category,
    materialDesc: allocation.item.materialDesc,
    quantity: allocation.item.quantity,
    detail: allocation.item.detail,
    estimatedAmount: Number(allocation.item.referencePrice || 0) * Number(allocation.item.quantity || 0),
    esAdvice: allocation.esAdvice,
    approved: true,
    purchaseInfo: '',
  };
  return summaries.map((item, index) => index === draftIndex ? { ...summary, rows: [...summary.rows, row] } : item);
}

export function submitAllocationDecision(allocationId, values) {
  return updateConsumableWorkflowState((state) => {
    const allocation = state.allocations.find((item) => item.id === allocationId);
    if (!allocation) return state;
    const rejected = values.matchingStatus === '驳回';
    const inventory = values.matchingStatus === '库存领用';
    const updatedAllocation = {
      ...allocation,
      ...values,
      status: rejected ? '已驳回' : '已完成',
      history: allocation.history.map((record) => (
        record.node === 'ES配给' && ['待处理', '待审批'].includes(record.status)
          ? {
            ...record,
            status: rejected ? '已驳回' : '已完成',
            time: nowText(),
            comment: values.esAdvice || values.matchingStatus,
          }
          : record
      )),
    };

    const claim = inventory ? {
      id: buildNo('HCLY'),
      sourceAllocationId: allocation.id,
      status: '处理中',
      currentNode: '库管员领用',
      applicant: allocation.applicant,
      applyDate: allocation.applyDate,
      item: allocation.item,
      stock: values.matchedStock,
      warehouse: values.matchedStock?.warehouse || '北京总部耗材仓',
      documentRemark: '',
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: '8层',
      usageNote: '',
      extendScrapDate: false,
      esPhysicalScrapDate: '2029-08-05',
      confirmationMode: '狐小e电子签',
      confirmationStatus: '未发起',
      confirmationEmployeeId: '',
      confirmationMethod: '',
      confirmationTime: '',
      signatureText: '',
      history: [
        ...updatedAllocation.history,
        { node: '耗材领用', person: '号码库管员', status: '待处理', time: '-', comment: '-' },
      ],
    } : null;

    return {
      ...state,
      allocations: state.allocations.map((item) => item.id === allocationId ? updatedAllocation : item),
      claims: claim ? [claim, ...state.claims] : state.claims,
      summaries: values.matchingStatus === '统一采购'
        ? appendSummaryRow(state.summaries, updatedAllocation)
        : state.summaries,
      applications: state.applications.map((application) => {
        if (application.id !== allocation.sourceApplicationId) return application;
        const items = application.items.map((item) => (
          item.id === allocation.sourceLineId
            ? { ...item, lineStatus: rejected ? '已驳回' : inventory ? '已配给' : '处理中' }
            : item
        ));
        const allRejected = items.every((item) => item.lineStatus === '已驳回');
        return {
          ...application,
          items,
          status: allRejected ? '已驳回' : application.status,
        };
      }),
    };
  });
}

export function saveClaimFields(claimId, values) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    claims: state.claims.map((claim) => claim.id === claimId ? { ...claim, ...values } : claim),
  }));
}

export function startConsumableClaimConfirmation(claimId, values) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    claims: state.claims.map((claim) => {
      if (claim.id !== claimId) return claim;
      return {
        ...claim,
        ...values,
        currentNode: '员工领用确认',
        confirmationStatus: '待确认',
        history: [
          ...claim.history.map((record) => (
            record.node === '耗材领用' && record.status === '待处理'
              ? { ...record, status: '处理中', time: nowText(), comment: '已发起员工领用确认' }
              : record
          )),
          { node: '员工领用确认', person: `${claim.applicant.id}-${claim.applicant.name}`, status: '待确认', time: '-', comment: '-' },
        ],
      };
    }),
  }));
}

export function confirmConsumableClaim(claimId, employeeId, method, signatureText = '') {
  if (!employeeId) throw new Error('请输入员工工号');
  let confirmed = null;
  updateConsumableWorkflowState((state) => ({
    ...state,
    claims: state.claims.map((claim) => {
      if (claim.id !== claimId) return claim;
      if (claim.applicant.id !== employeeId) throw new Error('员工工号不匹配！');
      const confirmationTime = nowText();
      confirmed = {
        ...claim,
        currentNode: '库管员领用',
        confirmationStatus: '已确认',
        confirmationEmployeeId: employeeId,
        confirmationMethod: method,
        confirmationTime,
        signatureText,
        history: claim.history.map((record) => (
          record.node === '员工领用确认' && record.status === '待确认'
            ? { ...record, status: '已确认', time: confirmationTime, comment: method }
            : record
        )),
      };
      return confirmed;
    }),
  }));
  return confirmed;
}

export function completeConsumableClaim(claimId, values) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    claims: state.claims.map((claim) => {
      if (claim.id !== claimId) return claim;
      if (claim.confirmationStatus !== '已确认') throw new Error('请先完成员工领用确认');
      return {
        ...claim,
        ...values,
        status: '已完成',
        currentNode: '流程结束',
        history: [
          ...claim.history,
          { node: '执行出库', person: '号码库管员', status: '已完成', time: nowText(), comment: '已生成耗材出库单' },
        ],
      };
    }),
  }));
}

export function abandonConsumableClaim(claimId, comment) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    claims: state.claims.map((claim) => claim.id === claimId ? {
      ...claim,
      status: '已驳回',
      currentNode: '流程结束',
      history: [...claim.history, { node: '弃领', person: '号码库管员', status: '已驳回', time: nowText(), comment }],
    } : claim),
  }));
}

export function updateSummary(summaryId, updater) {
  return updateConsumableWorkflowState((state) => ({
    ...state,
    summaries: state.summaries.map((summary) => (
      summary.id === summaryId
        ? (typeof updater === 'function' ? updater(summary) : { ...summary, ...updater })
        : summary
    )),
  }));
}

export function submitSummary(summaryId) {
  return updateSummary(summaryId, (summary) => ({
    ...summary,
    status: '处理中',
    currentNode: 'ES主管',
    history: [
      ...summary.history.map((record) => (
        record.node === 'ES汇总' && record.status === '待处理'
          ? { ...record, status: '已提交', time: nowText(), comment: '提交耗材汇总申请' }
          : record
      )),
      { node: 'ES主管', person: '110088-刘倩', status: '待审批', time: '-', comment: '-' },
    ],
  }));
}

export function approveSummary(summaryId, decision, comment) {
  return updateSummary(summaryId, (summary) => {
    const approved = decision === '同意';
    const history = summary.history.map((record) => (
      record.node === summary.currentNode && record.status === '待审批'
        ? { ...record, status: approved ? '已同意' : '已驳回', time: nowText(), comment: comment || decision }
        : record
    ));
    if (!approved) {
      return {
        ...summary,
        status: '草稿',
        currentNode: 'ES汇总',
        history: [...history, { node: 'ES汇总', person: '119039-刘建', status: '待处理', time: '-', comment: '审批驳回后重新修改' }],
      };
    }
    if (summary.currentNode === 'ES主管') {
      return {
        ...summary,
        currentNode: 'ES总监',
        history: [...history, { node: 'ES总监', person: '110066-何文', status: '待审批', time: '-', comment: '-' }],
      };
    }
    return {
      ...summary,
      status: '已汇总',
      currentNode: '采购系统',
      history,
      poList: summary.poList.length ? summary.poList : [{ poNo: 'PO202608050001', status: '待下单' }],
    };
  });
}
