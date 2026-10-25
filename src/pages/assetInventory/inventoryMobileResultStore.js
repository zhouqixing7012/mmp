import { readDemoData, writeDemoData } from '../../services/demoStorage';

const key = (projectNo) => `asset-inventory-mobile-results:${projectNo || 'demo'}`;

export function getMobileInventoryResults(projectNo) {
  return readDemoData(key(projectNo), {});
}

export function saveMobileInventoryResult(projectNo, assetTag, result) {
  const current = getMobileInventoryResults(projectNo);
  writeDemoData(key(projectNo), { ...current, [assetTag]: { ...current[assetTag], ...result } });
}

// 扫描结果整批构造、一次写入同一结果记录，任意校验或写入错误均不保存部分资产。
export function saveMobileInventoryResultsBatch(projectNo, buildResults) {
  if (!projectNo || typeof window === 'undefined' || !window.localStorage) throw new Error('当前环境无法保存本项目盘点结果');
  const raw = window.localStorage.getItem(key(projectNo));
  const current = raw ? JSON.parse(raw) : {};
  if (!current || Array.isArray(current) || typeof current !== 'object') throw new Error('已有盘点结果格式异常，请先核对记录');
  const next = buildResults(current);
  return writeDemoData(key(projectNo), next);
}
