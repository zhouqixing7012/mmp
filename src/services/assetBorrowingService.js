import {
  ASSET_BORROWING_STORAGE_KEY,
  DEFAULT_ASSET_BORROWING_APPLICATIONS,
} from '../mock/assetBorrowingMock';
import { readDemoData, writeDemoData } from './demoStorage';

export function getAssetBorrowingApplications() {
  return readDemoData(
    ASSET_BORROWING_STORAGE_KEY,
    DEFAULT_ASSET_BORROWING_APPLICATIONS
  );
}

export function saveAssetBorrowingApplications(applications) {
  return writeDemoData(ASSET_BORROWING_STORAGE_KEY, applications);
}

export function addAssetBorrowingApplication(application) {
  const nextApplications = [application, ...getAssetBorrowingApplications()];
  saveAssetBorrowingApplications(nextApplications);
  return nextApplications;
}

export function updateAssetBorrowingApplication(applicationId, updater) {
  const nextApplications = getAssetBorrowingApplications().map((application) => {
    if (application.id !== applicationId) return application;
    return typeof updater === 'function'
      ? updater(application)
      : { ...application, ...updater };
  });
  saveAssetBorrowingApplications(nextApplications);
  return nextApplications;
}

export function getBorrowingApplicationByNode(node) {
  return getAssetBorrowingApplications().find((application) => (
    application.status === '处理中' && application.currentNode === node
  )) || null;
}

export function getBorrowingIssueApplication() {
  return getAssetBorrowingApplications().find((application) => (
    application.status === '处理中'
    && application.currentNode === '库管员发放'
  )) || null;
}
