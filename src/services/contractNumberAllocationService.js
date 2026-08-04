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
  return getContractNumberAllocationApplications()[0] || null;
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
