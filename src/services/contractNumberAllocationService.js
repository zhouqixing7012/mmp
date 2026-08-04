import {
  CONTRACT_NUMBER_ALLOCATION_STORAGE_KEY,
  DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS,
} from '../mock/contractNumberAllocationMock';
import { readDemoData, writeDemoData } from './demoStorage';

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

export function getContractNumberAllocationApplications() {
  return readDemoData(
    CONTRACT_NUMBER_ALLOCATION_STORAGE_KEY,
    DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS
  );
}

export function saveContractNumberAllocationApplications(applications) {
  return writeDemoData(CONTRACT_NUMBER_ALLOCATION_STORAGE_KEY, applications);
}

export function getCurrentContractNumberAllocation() {
  return getContractNumberAllocationApplications().find((application) => (
    application.currentNode === 'ES审批' && application.status === '待审批'
  )) || null;
}

export function getWarehouseContractNumberAllocation() {
  return getContractNumberAllocationApplications().find((application) => (
    application.currentNode === '库管员领用' && application.status === '处理中'
  )) || null;
}

export function getEmployeeContractNumberConfirmation() {
  return getContractNumberAllocationApplications().find((application) => (
    application.currentNode === '员工领取确认'
    && application.status === '处理中'
    && application.warehouseHandling?.confirmationStatus === '待确认'
  )) || null;
}

export function updateContractNumberAllocation(applicationId, updater) {
  const nextApplications = getContractNumberAllocationApplications().map((application) => {
    if (application.id !== applicationId) return application;
    return typeof updater === 'function'
      ? updater(application)
      : { ...application, ...updater };
  });
  saveContractNumberAllocationApplications(nextApplications);
  return nextApplications;
}

export function confirmContractNumberReceipt(applicationId, employeeId, method) {
  const applications = getContractNumberAllocationApplications();
  let confirmedApplication = null;

  const nextApplications = applications.map((application) => {
    if (application.id !== applicationId) return application;
    if (application.currentNode !== '员工领取确认') {
      throw new Error('当前单据不在员工领取确认节点');
    }
    if (employeeId !== application.applicant.id) {
      throw new Error('员工工号不匹配！');
    }

    const confirmationTime = nowText();
    confirmedApplication = {
      ...application,
      status: '已完成',
      currentNode: '结束',
      assignedNumber: application.assignedNumber
        ? { ...application.assignedNumber, status: '已领用' }
        : null,
      warehouseHandling: {
        ...application.warehouseHandling,
        status: '已完成',
        confirmationStatus: '已确认',
        confirmationEmployeeId: employeeId,
        confirmationMethod: method,
        confirmationTime,
      },
      history: (application.history || []).map((item) => (
        item.node === '员工领取确认' && item.status === '待确认'
          ? {
            ...item,
            status: '已确认',
            time: confirmationTime,
            comment: method,
          }
          : item
      )),
    };
    return confirmedApplication;
  });

  if (!confirmedApplication) {
    throw new Error('未找到待确认的合约号码领取任务');
  }

  saveContractNumberAllocationApplications(nextApplications);
  return confirmedApplication;
}
