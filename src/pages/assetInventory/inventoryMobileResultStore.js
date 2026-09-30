import { readDemoData, writeDemoData } from '../../services/demoStorage';

const key = (projectNo) => `asset-inventory-mobile-results:${projectNo || 'demo'}`;

export function getMobileInventoryResults(projectNo) {
  return readDemoData(key(projectNo), {});
}

export function saveMobileInventoryResult(projectNo, assetTag, result) {
  const current = getMobileInventoryResults(projectNo);
  writeDemoData(key(projectNo), { ...current, [assetTag]: { ...current[assetTag], ...result } });
}
