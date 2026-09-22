import { getInitialBusinessRows } from '../pages/assetManagement/scrapPrototypeData';
import { readDemoData, writeDemoData } from './demoStorage';

const STORAGE_VERSION = 'v1';

function storageKey(type) {
  return `asset_scrap_prototype_${type}_${STORAGE_VERSION}`;
}

export function getScrapPrototypeRecords(type) {
  return readDemoData(storageKey(type), getInitialBusinessRows(type));
}

export function saveScrapPrototypeRecords(type, records) {
  return writeDemoData(storageKey(type), records);
}
