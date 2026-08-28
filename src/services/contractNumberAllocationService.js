import {
  DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS,
} from '../mock/contractNumberAllocationMock';

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const EXTRA_APPLICATION_ATTACHMENT = {
  id: 'attachment-2',
  name: '身份证补充材料（演示）.jpg',
  size: 186240,
  type: 'image/jpeg',
  content: '合约号码申请补充附件演示文件。',
};

function normalizeApplication(record) {
  const applicationAttachments = Array.isArray(record.applicationAttachments)
    ? record.applicationAttachments
    : record.attachment
      ? [record.attachment]
      : [];
  const allocationAttachments = Array.isArray(record.allocationAttachments)
    ? record.allocationAttachments
    : record.allocationAttachment
      ? [record.allocationAttachment]
      : [];

  return {
    ...record,
    applicationAttachments,
    attachment: applicationAttachments[0] || null,
    allocationAttachments,
    allocationAttachment: allocationAttachments[0] || null,
  };
}

function createInitialApplications() {
  return DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS
    .filter((record) => record.id !== 'PCMFL202409100002')
    .map((record) => {
      const normalized = normalizeApplication(record);
      if (record.id !== 'PCMFL202409100001' || normalized.applicationAttachments.length !== 1) {
        return normalized;
      }
      const applicationAttachments = [
        ...normalized.applicationAttachments,
        EXTRA_APPLICATION_ATTACHMENT,
      ];
      return {
        ...normalized,
        applicationAttachments,
        attachment: applicationAttachments[0],
      };
    });
}

let runtimeApplications = createInitialApplications();

export function getContractNumberAllocationApplications() {
  return cloneValue(runtimeApplications);
}

export function saveContractNumberAllocationApplications(applications) {
  runtimeApplications = cloneValue(applications);
  return getContractNumberAllocationApplications();
}

export function resetContractNumberAllocationApplications() {
  runtimeApplications = createInitialApplications();
  return getContractNumberAllocationApplications();
}

export function getCurrentContractNumberAllocation() {
  return getContractNumberAllocationApplications().find((application) => (
    application.currentNode === 'ES审批' && application.status === '待审批'
  )) || null;
}

export function getContractNumberSupervisorApproval() {
  return getContractNumberAllocationApplications().find((application) => (
    application.currentNode === '合约号码配给主管审批' && application.status === '待审批'
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
    const nextRecord = typeof updater === 'function'
      ? updater(application)
      : { ...application, ...updater };
    return normalizeApplication(nextRecord);
  });
  saveContractNumberAllocationApplications(nextApplications);
  return nextApplications;
}

export function submitCurrentContractNumberApplication({ applyReason, attachments = [] }) {
  const current = getCurrentContractNumberAllocation();
  if (!current) {
    throw new Error('当前没有可更新的合约号码申请');
  }

  const applicationAttachments = attachments.map((attachment, index) => ({
    id: attachment.id || `application-attachment-${Date.now()}-${index}`,
    name: attachment.name,
    size: attachment.size,
    type: attachment.type,
  }));

  updateContractNumberAllocation(current.id, {
    applyReason,
    applicationAttachments,
    attachment: applicationAttachments[0] || null,
  });

  return getCurrentContractNumberAllocation();
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
