import { ASSET_APPLICATION_STORAGE_KEY, DEFAULT_ASSET_APPLICATIONS } from '../mock/assetApplicationMock';

const canUseLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

export function readDemoData(key, defaultValue) {
  if (!canUseLocalStorage()) {
    return cloneValue(defaultValue);
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return cloneValue(defaultValue);
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`读取演示数据失败：${key}`, error);
    return cloneValue(defaultValue);
  }
}

export function writeDemoData(key, value) {
  if (!canUseLocalStorage()) {
    return value;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function resetDemoData(key) {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(key);
  }
}

export function getAssetApplications() {
  return readDemoData(ASSET_APPLICATION_STORAGE_KEY, DEFAULT_ASSET_APPLICATIONS);
}

export function saveAssetApplications(applications) {
  return writeDemoData(ASSET_APPLICATION_STORAGE_KEY, applications);
}

export function addAssetApplication(application) {
  const nextApplications = [application, ...getAssetApplications()];
  saveAssetApplications(nextApplications);
  return nextApplications;
}

export function resetAssetApplications() {
  resetDemoData(ASSET_APPLICATION_STORAGE_KEY);
  return getAssetApplications();
}
