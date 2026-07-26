import {
  DEFAULT_CLAIM_LOCATION,
  DEFAULT_EMPLOYEE_SELF_SERVICE_CLAIMS,
  DEFAULT_EMPLOYEE_SELF_SERVICE_OUTBOUNDS,
  EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY,
  EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY,
} from '../mock/employeeSelfServiceClaimMock';
import { readDemoData, writeDemoData } from './demoStorage';
import {
  getAllocationOrders,
  getPurchaseSummaries,
} from './employeeSelfServiceWorkflowService';
import { updateEmployeeSelfServiceApplication } from './employeeSelfServiceService';

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildClaimFromAllocation(order) {
  return {
    id: `CL-${order.id.slice(3)}`,
    sourceType: '库存领用',
    sourceOrderId: order.id,
    sourceApplicationId: order.sourceApplicationId,
    applicant: clone(order.applicant),
    currentWarehouse: order.matchedAsset?.warehouse || '',
    asset: clone(order.matchedAsset),
    assetDesc: order.assetDesc,
    config: order.config,
    purpose: order.purpose,
    usageDescription: order.detail || '',
    esComment: order.esComment,
    location: clone(DEFAULT_CLAIM_LOCATION),
    inventoryPerson: '',
    inventoryStatus: '',
    confirmMode: '狐小e电子签',
    employeeNumber: '',
    employeeSignature: '',
    employeeConfirmedAt: '',
    keeperReviewStatus: '待员工确认',
    keeperReviewComment: '',
    status: '待通知',
    createdAt: nowText(),
    notifiedAt: '',
    outboundAt: '',
  };
}

export function getClaimOrders() {
  return readDemoData(EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY, DEFAULT_EMPLOYEE_SELF_SERVICE_CLAIMS);
}

export function saveClaimOrders(orders) {
  return writeDemoData(EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY, orders);
}

export function getOutboundOrders() {
  return readDemoData(EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY, DEFAULT_EMPLOYEE_SELF_SERVICE_OUTBOUNDS);
}

export function saveOutboundOrders(orders) {
  return writeDemoData(EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY, orders);
}

export function ensureStockClaimOrders() {
  const allocations = getAllocationOrders().filter((item) => (
    item.matchingStatus === '库存领用'
    && item.status === '已配给'
    && item.matchedAsset
  ));
  const existing = getClaimOrders();
  const existingSourceIds = new Set(existing.map((item) => item.sourceOrderId));
  const additions = allocations
    .filter((item) => !existingSourceIds.has(item.id))
    .map(buildClaimFromAllocation);
  if (additions.length === 0) return existing;
  const next = [...additions, ...existing];
  saveClaimOrders(next);
  return next;
}

export function simulatePurchaseInbound(summaryId) {
  const summary = getPurchaseSummaries().find((item) => item.id === summaryId);
  if (!summary || summary.status !== '已汇总') return getClaimOrders();
  const existing = getClaimOrders();
  const existingSourceIds = new Set(existing.map((item) => item.sourceOrderId));
  const additions = summary.items
    .filter((item) => item.handling === '采购' && !existingSourceIds.has(item.allocationOrderId))
    .map((item, index) => ({
      id: `CL-PO-${summary.id.slice(3)}-${index + 1}`,
      sourceType: '采购入库领用',
      sourceOrderId: item.allocationOrderId,
      sourceApplicationId: item.applicationId,
      applicant: {
        id: item.applicant.split('-')[0],
        name: item.applicant.split('-').slice(1).join('-'),
        company: summary.company,
        department: summary.department,
        officeArea: '北京-搜狐媒体大厦',
        phone: '010-00000001',
        email: 'employee@sohu-lab.com',
        costCenter: '162001.员工服务中心',
        employeeStatus: '正式员工',
        jobType: '非技术人员',
      },
      currentWarehouse: 'I0018-资产集团前台库（新动力）',
      asset: {
        id: `PO-ASSET-${summary.id}-${index + 1}`,
        assetTag: `PO${String(Date.now()).slice(-8)}${index + 1}`,
        assetDesc: item.assetDesc,
        config: item.config,
        warehouse: 'I0018-资产集团前台库（新动力）',
        assetStatus: '在库-新增',
        enabledDate: new Date().toISOString().slice(0, 10),
      },
      assetDesc: item.assetDesc,
      config: item.config,
      purpose: '员工用机',
      usageDescription: '',
      esComment: item.esComment,
      location: clone(DEFAULT_CLAIM_LOCATION),
      inventoryPerson: '',
      inventoryStatus: '',
      confirmMode: '狐小e电子签',
      employeeNumber: '',
      employeeSignature: '',
      employeeConfirmedAt: '',
      keeperReviewStatus: '待员工确认',
      keeperReviewComment: '',
      status: '待通知',
      createdAt: nowText(),
      notifiedAt: '',
      outboundAt: '',
    }));
  if (additions.length === 0) return existing;
  const next = [...additions, ...existing];
  saveClaimOrders(next);
  return next;
}

export function updateClaimOrder(orderId, updater) {
  const next = getClaimOrders().map((order) => {
    if (order.id !== orderId) return order;
    return typeof updater === 'function' ? updater(order) : { ...order, ...updater };
  });
  saveClaimOrders(next);
  return next;
}

export function sendClaimNotification(orderId) {
  return updateClaimOrder(orderId, {
    status: '待员工确认',
    keeperReviewStatus: '待员工确认',
    notifiedAt: nowText(),
  });
}

export function employeeConfirmClaim(orderId, payload) {
  return updateClaimOrder(orderId, {
    ...payload,
    status: '待库管复核',
    keeperReviewStatus: '待库管复核',
    employeeConfirmedAt: nowText(),
  });
}

export function rejectEmployeeSignature(orderId, comment) {
  return updateClaimOrder(orderId, {
    keeperReviewStatus: '签名驳回',
    keeperReviewComment: comment,
    status: '待员工确认',
    employeeSignature: '',
    employeeConfirmedAt: '',
  });
}

export function completeClaimOutbound(orderId, keeperComment) {
  const order = getClaimOrders().find((item) => item.id === orderId);
  if (!order) return null;
  const outbound = {
    id: `OUT-${order.id.slice(3)}`,
    claimOrderId: order.id,
    sourceApplicationId: order.sourceApplicationId,
    assetTag: order.asset.assetTag,
    assetDesc: order.assetDesc,
    applicant: `${order.applicant.id}-${order.applicant.name}`,
    warehouse: order.currentWarehouse,
    location: `${order.location.city}/${order.location.building}/${order.location.floor}`,
    purpose: order.purpose,
    assetStatus: '在用-使用中',
    keeperComment,
    createdAt: nowText(),
  };
  const outbounds = [outbound, ...getOutboundOrders()];
  saveOutboundOrders(outbounds);
  updateClaimOrder(orderId, {
    status: '已完成',
    keeperReviewStatus: '已复核',
    keeperReviewComment: keeperComment,
    outboundAt: nowText(),
    asset: {
      ...order.asset,
      warehouse: '',
      assetStatus: '在用-使用中',
      responsiblePerson: `${order.applicant.id}-${order.applicant.name}`,
      department: order.applicant.department,
      costCenter: order.applicant.costCenter,
      city: order.location.city,
      building: order.location.building,
      floor: order.location.floor,
      purpose: order.purpose,
      usageDescription: order.usageDescription,
    },
  });
  const related = getClaimOrders().filter((item) => item.sourceApplicationId === order.sourceApplicationId);
  const allCompleted = related.length > 0 && related.every((item) => item.id === orderId || item.status === '已完成');
  if (allCompleted) {
    updateEmployeeSelfServiceApplication(order.sourceApplicationId, {
      status: '已完成',
      taskStatus: '已完成',
      currentNode: '流程结束',
    });
  } else {
    updateEmployeeSelfServiceApplication(order.sourceApplicationId, {
      status: '处理中',
      taskStatus: '资产领用中',
      currentNode: '资产领用',
    });
  }
  return outbound;
}
