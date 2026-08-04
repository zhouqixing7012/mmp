import {
  CONTRACT_NUMBER_ALLOCATION_STORAGE_KEY,
  DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS,
} from '../mock/contractNumberAllocationMock';
import { readDemoData, writeDemoData } from './demoStorage';

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
