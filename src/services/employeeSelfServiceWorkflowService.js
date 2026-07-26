import {
  DEFAULT_ALLOCATION_ORDERS,
  DEFAULT_PURCHASE_SUMMARIES,
  EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY,
  EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY,
  ES_ALLOCATION_HANDLERS,
} from '../mock/employeeSelfServiceWorkflowMock';
import { readDemoData, writeDemoData } from './demoStorage';
import {
  getEmployeeSelfServiceApplications,
  updateEmployeeSelfServiceApplication,
} from './employeeSelfServiceService';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function buildAllocationOrders(application) {
  const handlers = ES_ALLOCATION_HANDLERS[application.applicant.company] || ['114111-杨芊'];
  const rows = [];
  application.materials.forEach((material, materialIndex) => {
    for (let unitIndex = 0; unitIndex < material.quantity; unitIndex += 1) {
      rows.push({
        id: `MA-${application.id.slice(3)}-${materialIndex + 1}-${unitIndex + 1}`,
        sourceApplicationId: application.id,
        sourceMaterialId: material.id,
        applicant: clone(application.applicant),
        applyDate: application.applyDate,
        handler: handlers.join(' / '),
        assetDesc: material.assetDesc,
        config: material.config,
        purpose: material.purpose,
        reason: material.reason,
        detail: material.detail,
        overStandard: material.overStandard,
        referencePrice: material.referencePrice || 0,
        matchingStatus: '',
        matchedAsset: null,
        esComment: '',
        status: '待配给',
        createdAt: nowText(),
      });
    }
  });
  return rows;
}

export function getAllocationOrders() {
  return readDemoData(EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY, DEFAULT_ALLOCATION_ORDERS);
}

export function saveAllocationOrders(orders) {
  return writeDemoData(EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY, orders);
}

export function ensureAllocationOrders() {
  const applications = getEmployeeSelfServiceApplications();
  const existing = getAllocationOrders();
  const existingApplicationIds = new Set(existing.map((item) => item.sourceApplicationId));
  const additions = applications
    .filter((application) => application.taskStatus === '待配给' && !existingApplicationIds.has(application.id))
    .flatMap(buildAllocationOrders);

  if (additions.length === 0) return existing;
  const next = [...additions, ...existing];
  saveAllocationOrders(next);
  return next;
}

export function updateAllocationOrder(orderId, updater) {
  const next = getAllocationOrders().map((order) => {
    if (order.id !== orderId) return order;
    return typeof updater === 'function' ? updater(order) : { ...order, ...updater };
  });
  saveAllocationOrders(next);
  return next;
}

export function getPurchaseSummaries() {
  return readDemoData(EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY, DEFAULT_PURCHASE_SUMMARIES);
}

export function savePurchaseSummaries(summaries) {
  return writeDemoData(EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY, summaries);
}

export function syncPurchaseSummaries() {
  const purchaseOrders = getAllocationOrders().filter((item) => item.matchingStatus === '统一采购' && item.status === '已配给');
  const existing = getPurchaseSummaries();
  const existingOrderIds = new Set(existing.flatMap((summary) => summary.items.map((item) => item.allocationOrderId)));
  const additions = purchaseOrders.filter((order) => !existingOrderIds.has(order.id));

  if (additions.length === 0) return existing;

  const grouped = new Map();
  additions.forEach((order) => {
    const key = `${order.applicant.company}|${order.applicant.department.split('.').slice(0, 2).join('.')}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(order);
  });

  const next = [...existing];
  grouped.forEach((orders, key) => {
    const [company, department] = key.split('|');
    const current = next.find((item) => item.company === company && item.department === department && item.status === '待汇总');
    const items = orders.map((order) => ({
      id: `${order.id}-SUMMARY`,
      allocationOrderId: order.id,
      applicationId: order.sourceApplicationId,
      applicant: `${order.applicant.id}-${order.applicant.name}`,
      assetDesc: order.assetDesc,
      config: order.config,
      quantity: 1,
      estimatedAmount: Number(order.referencePrice || 0),
      overStandard: order.overStandard,
      esComment: order.esComment,
      handling: '采购',
      rejectReason: '',
    }));

    if (current) {
      current.items.push(...items);
      current.updatedAt = nowText();
    } else {
      next.unshift({
        id: `SA-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${String(Date.now()).slice(-5)}`,
        company,
        department,
        status: '待汇总',
        createdAt: nowText(),
        updatedAt: nowText(),
        summaryText: '',
        projectPurpose: '',
        items,
        attachments: [],
      });
    }
  });
  savePurchaseSummaries(next);
  return next;
}

export function updatePurchaseSummary(summaryId, updater) {
  const next = getPurchaseSummaries().map((summary) => {
    if (summary.id !== summaryId) return summary;
    return typeof updater === 'function' ? updater(summary) : { ...summary, ...updater };
  });
  savePurchaseSummaries(next);
  return next;
}

export function refreshApplicationProgress(applicationId) {
  const relatedOrders = getAllocationOrders().filter((item) => item.sourceApplicationId === applicationId);
  if (relatedOrders.length === 0) return;

  const allDone = relatedOrders.every((item) => ['已配给', '已取消'].includes(item.status));
  const hasPurchase = relatedOrders.some((item) => item.matchingStatus === '统一采购' && item.status === '已配给');
  const hasStock = relatedOrders.some((item) => item.matchingStatus === '库存领用' && item.status === '已配给');
  const allCancelled = relatedOrders.every((item) => item.status === '已取消');

  updateEmployeeSelfServiceApplication(applicationId, (application) => ({
    ...application,
    status: allCancelled ? '已驳回' : '处理中',
    taskStatus: allDone
      ? (hasPurchase && hasStock ? '领用/待汇总' : hasPurchase ? '待汇总' : '待领用')
      : '待配给',
    currentNode: allDone
      ? (hasPurchase && hasStock ? '资产领用/汇总采购' : hasPurchase ? '汇总采购' : '资产领用')
      : '资产配给',
  }));
}
