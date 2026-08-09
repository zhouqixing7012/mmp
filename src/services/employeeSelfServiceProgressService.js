import {
  DEFAULT_EMPLOYEE_SELF_SERVICE_APPLICATIONS,
  EMPLOYEE_SELF_SERVICE_STORAGE_KEY,
} from '../mock/employeeSelfServiceMock';
import {
  DEFAULT_ALLOCATION_ORDERS,
  DEFAULT_PURCHASE_SUMMARIES,
  EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY,
  EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY,
} from '../mock/employeeSelfServiceWorkflowMock';
import {
  DEFAULT_EMPLOYEE_SELF_SERVICE_CLAIMS,
  DEFAULT_EMPLOYEE_SELF_SERVICE_OUTBOUNDS,
  EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY,
  EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY,
} from '../mock/employeeSelfServiceClaimMock';
import { resetDemoData } from './demoStorage';
import { getEmployeeSelfServiceApplications } from './employeeSelfServiceService';
import {
  getAllocationOrders,
  getPurchaseSummaries,
} from './employeeSelfServiceWorkflowService';
import {
  getClaimOrders,
  getOutboundOrders,
} from './employeeSelfServiceClaimService';

const COMPLETED_APPROVAL_STATUSES = ['已提交', '已同意', '已跳过'];

function latestTime(values) {
  return values.filter((value) => value && value !== '-').sort().at(-1) || '-';
}

function buildApprovalStage(application) {
  const rejected = application.approvalHistory?.find((item) => item.status === '已驳回');
  if (rejected) {
    return {
      key: 'approval',
      stage: '业务审批',
      status: '已驳回',
      time: rejected.time || '-',
      detail: `${rejected.node}驳回：${rejected.comment || '-'}`,
    };
  }

  const pending = application.approvalHistory?.find((item) => item.status === '待审批');
  if (application.taskStatus === '业务审批' || pending) {
    return {
      key: 'approval',
      stage: '业务审批',
      status: '处理中',
      time: pending?.time || '-',
      detail: `当前审批节点：${application.currentNode}`,
    };
  }

  const approved = application.approvalHistory?.filter((item) => COMPLETED_APPROVAL_STATUSES.includes(item.status)) || [];
  return {
    key: 'approval',
    stage: '业务审批',
    status: approved.length > 0 ? '已完成' : '待处理',
    time: latestTime(approved.map((item) => item.time)),
    detail: approved.length > 0 ? `共完成 ${approved.length} 个审批记录` : '等待进入业务审批',
  };
}

function buildAllocationStage(application, allocations) {
  if (allocations.length === 0) {
    return {
      key: 'allocation',
      stage: 'ES 配给',
      status: application.taskStatus === '待配给' ? '处理中' : '待处理',
      time: '-',
      detail: application.taskStatus === '待配给' ? '等待 ES 生成并处理配给单' : '业务审批完成后进入',
    };
  }

  const pending = allocations.filter((item) => item.status === '待配给').length;
  const cancelled = allocations.filter((item) => item.status === '已取消').length;
  const completed = allocations.filter((item) => item.status === '已配给').length;
  return {
    key: 'allocation',
    stage: 'ES 配给',
    status: pending > 0 ? '处理中' : completed === 0 && cancelled > 0 ? '已驳回' : '已完成',
    time: latestTime(allocations.map((item) => item.processedAt || item.createdAt)),
    detail: `配给单 ${allocations.length} 张：已配给 ${completed}，待处理 ${pending}，已取消 ${cancelled}`,
  };
}

function buildPurchaseStage(allocations, summaries) {
  const purchaseAllocations = allocations.filter((item) => item.matchingStatus === '统一采购');
  if (purchaseAllocations.length === 0) {
    return {
      key: 'purchase',
      stage: '汇总采购',
      status: '不涉及',
      time: '-',
      detail: '本申请没有统一采购分支',
    };
  }
  if (summaries.length === 0) {
    return {
      key: 'purchase',
      stage: '汇总采购',
      status: '待处理',
      time: '-',
      detail: '统一采购数据等待进入部门汇总池',
    };
  }

  const allSubmitted = summaries.every((item) => item.status === '已汇总');
  return {
    key: 'purchase',
    stage: '汇总采购',
    status: allSubmitted ? '已完成' : '处理中',
    time: latestTime(summaries.map((item) => item.submittedAt || item.updatedAt || item.createdAt)),
    detail: allSubmitted
      ? `关联 ${summaries.length} 张汇总单，已提交采购系统`
      : `关联 ${summaries.length} 张汇总单，等待 ES 集中提交`,
  };
}

function buildClaimStages(allocations, claims, outbounds) {
  const activeAllocations = allocations.filter((item) => item.status === '已配给');
  if (activeAllocations.length === 0) {
    return [
      { key: 'claim', stage: '资产领用', status: '不涉及', time: '-', detail: '没有进入领用流程的配给单' },
      { key: 'employee-confirm', stage: '员工领用确认', status: '不涉及', time: '-', detail: '没有待确认领用单' },
      { key: 'outbound', stage: '库管复核与出库', status: '不涉及', time: '-', detail: '没有待出库资产' },
    ];
  }

  if (claims.length === 0) {
    return [
      { key: 'claim', stage: '资产领用', status: '待处理', time: '-', detail: '等待库存配给完成或采购入库后生成领用单' },
      { key: 'employee-confirm', stage: '员工领用确认', status: '待处理', time: '-', detail: '领用通知发送后进入' },
      { key: 'outbound', stage: '库管复核与出库', status: '待处理', time: '-', detail: '员工确认后进入' },
    ];
  }

  const claimCompleted = claims.every((item) => item.status === '已完成');
  const claimActive = claims.some((item) => ['待员工确认', '待库管复核'].includes(item.status));
  const employeeConfirmed = claims.filter((item) => Boolean(item.employeeConfirmedAt)).length;
  const waitingEmployee = claims.some((item) => item.status === '待员工确认');
  const waitingKeeper = claims.some((item) => item.status === '待库管复核');
  const signatureRejected = claims.some((item) => item.keeperReviewStatus === '签名驳回');

  return [
    {
      key: 'claim',
      stage: '资产领用',
      status: claimCompleted ? '已完成' : claimActive ? '处理中' : '待处理',
      time: latestTime(claims.map((item) => item.notifiedAt || item.createdAt)),
      detail: `已生成 ${claims.length} 张领用单，已完成 ${claims.filter((item) => item.status === '已完成').length} 张`,
    },
    {
      key: 'employee-confirm',
      stage: '员工领用确认',
      status: signatureRejected ? '已驳回' : employeeConfirmed === claims.length ? '已完成' : waitingEmployee ? '处理中' : '待处理',
      time: latestTime(claims.map((item) => item.employeeConfirmedAt)),
      detail: signatureRejected
        ? '签名被库管员退回，需要重新确认'
        : `已完成 ${employeeConfirmed}/${claims.length} 张领用确认`,
    },
    {
      key: 'outbound',
      stage: '库管复核与出库',
      status: claimCompleted && outbounds.length >= claims.length ? '已完成' : waitingKeeper ? '处理中' : '待处理',
      time: latestTime(outbounds.map((item) => item.createdAt)),
      detail: `已生成 ${outbounds.length} 张出库单`,
    },
  ];
}

function buildNotifications(application, allocations, summaries, claims, outbounds) {
  const notifications = [];
  const submitted = application.approvalHistory?.find((item) => item.node === '开始');
  notifications.push({
    id: `${application.id}-submitted`,
    channel: 'MyFamily / 狐小e',
    time: submitted?.time || application.applyDate,
    title: '资产申请提交成功',
    content: `资产申请单 ${application.id} 已提交，当前进入业务审批。`,
  });

  const rejected = application.approvalHistory?.find((item) => item.status === '已驳回');
  if (rejected) {
    notifications.push({
      id: `${application.id}-rejected`,
      channel: 'MyFamily / 狐小e',
      time: rejected.time || '-',
      title: '资产申请已驳回',
      content: `${rejected.node}驳回申请，审批意见：${rejected.comment || '-'}`,
    });
  }

  allocations.filter((item) => item.status === '已配给').forEach((item) => {
    notifications.push({
      id: `${item.id}-allocated`,
      channel: '资产系统',
      time: item.processedAt || item.createdAt || '-',
      title: item.matchingStatus === '库存领用' ? '资产已完成库存配给' : '资产已进入统一采购',
      content: `${item.assetDesc} 的配给方式为${item.matchingStatus}。`,
    });
  });

  summaries.filter((item) => item.status === '已汇总').forEach((item) => {
    notifications.push({
      id: `${item.id}-summary`,
      channel: '采购系统',
      time: item.submittedAt || '-',
      title: '统一采购汇总已提交',
      content: `汇总单 ${item.id} 已提交采购系统，采购与 PR 进度以系统回传为准。`,
    });
  });

  claims.forEach((item) => {
    if (item.notifiedAt) {
      notifications.push({
        id: `${item.id}-notice`,
        channel: '狐小e / MyFamily / 易点',
        time: item.notifiedAt,
        title: '请前往指定地点领取资产',
        content: `领用单 ${item.id}，领取地点：${item.currentWarehouse || '待确认仓库'}。`,
      });
    }
    if (item.employeeConfirmedAt) {
      notifications.push({
        id: `${item.id}-confirmed`,
        channel: '狐小e / Pad',
        time: item.employeeConfirmedAt,
        title: '员工领用确认已提交',
        content: `员工已通过${item.confirmMode}完成领用确认，等待库管复核。`,
      });
    }
    if (item.keeperReviewStatus === '签名驳回') {
      notifications.push({
        id: `${item.id}-signature-rejected`,
        channel: '狐小e / Pad',
        time: item.employeeConfirmedAt || '-',
        title: '领用签名需要重新提交',
        content: item.keeperReviewComment || '签名不合规，请重新签署。',
      });
    }
  });

  outbounds.forEach((item) => {
    notifications.push({
      id: `${item.id}-outbound`,
      channel: '资产系统',
      time: item.createdAt,
      title: '资产领用已完成',
      content: `资产 ${item.assetTag} 已出库并更新为在用-使用中。`,
    });
  });

  return notifications.sort((a, b) => String(b.time).localeCompare(String(a.time)));
}

function buildDocuments(application, allocations, summaries, claims, outbounds) {
  return [
    { id: application.id, type: '资产申请单', status: application.status, time: application.applyDate, source: '-' },
    ...allocations.map((item) => ({ id: item.id, type: '资产配给单', status: item.status, time: item.processedAt || item.createdAt, source: application.id })),
    ...summaries.map((item) => ({ id: item.id, type: '资产汇总申请单', status: item.status, time: item.submittedAt || item.createdAt, source: application.id })),
    ...claims.map((item) => ({ id: item.id, type: '资产领用单', status: item.status, time: item.outboundAt || item.createdAt, source: item.sourceOrderId })),
    ...outbounds.map((item) => ({ id: item.id, type: '出库单', status: '已完成', time: item.createdAt, source: item.claimOrderId })),
  ];
}

export function getEmployeeSelfServiceProgress() {
  const applications = getEmployeeSelfServiceApplications();
  const allocations = getAllocationOrders();
  const summaries = getPurchaseSummaries();
  const claims = getClaimOrders();
  const outbounds = getOutboundOrders();

  return applications.map((application) => {
    const relatedAllocations = allocations.filter((item) => item.sourceApplicationId === application.id);
    const relatedSummaries = summaries.filter((summary) => summary.items.some((item) => item.applicationId === application.id));
    const relatedClaims = claims.filter((item) => item.sourceApplicationId === application.id);
    const relatedOutbounds = outbounds.filter((item) => item.sourceApplicationId === application.id);
    const start = application.approvalHistory?.find((item) => item.node === '开始');
    const timeline = [
      {
        key: 'submit',
        stage: '申请提交',
        status: '已完成',
        time: start?.time || application.applyDate,
        detail: `申请人 ${application.applicant.id}-${application.applicant.name} 提交资产申请`,
      },
      buildApprovalStage(application),
      buildAllocationStage(application, relatedAllocations),
      buildPurchaseStage(relatedAllocations, relatedSummaries),
      ...buildClaimStages(relatedAllocations, relatedClaims, relatedOutbounds),
    ];

    return {
      ...application,
      materialCount: application.materials.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      timeline,
      documents: buildDocuments(application, relatedAllocations, relatedSummaries, relatedClaims, relatedOutbounds),
      notifications: buildNotifications(application, relatedAllocations, relatedSummaries, relatedClaims, relatedOutbounds),
      relatedCounts: {
        allocations: relatedAllocations.length,
        summaries: relatedSummaries.length,
        claims: relatedClaims.length,
        outbounds: relatedOutbounds.length,
      },
    };
  });
}

export function resetEmployeeSelfServiceProgress() {
  [
    EMPLOYEE_SELF_SERVICE_STORAGE_KEY,
    EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY,
    EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY,
    EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY,
    EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY,
  ].forEach(resetDemoData);

  return {
    applications: DEFAULT_EMPLOYEE_SELF_SERVICE_APPLICATIONS,
    allocations: DEFAULT_ALLOCATION_ORDERS,
    summaries: DEFAULT_PURCHASE_SUMMARIES,
    claims: DEFAULT_EMPLOYEE_SELF_SERVICE_CLAIMS,
    outbounds: DEFAULT_EMPLOYEE_SELF_SERVICE_OUTBOUNDS,
  };
}
