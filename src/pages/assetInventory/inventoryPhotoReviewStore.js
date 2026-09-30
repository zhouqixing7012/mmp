import { readDemoData, writeDemoData } from '../../services/demoStorage';

const keyFor = (projectNo) => `assetInventoryPhotoReview:${projectNo || 'demo'}`;

export function getPhotoReviewResults(projectNo) {
  if (typeof window === 'undefined') return [];
  const key = keyFor(projectNo);
  // 接续旧会话中的审核记录，之后与移动盘点结果使用相同的持久存储。
  if (!window.localStorage.getItem(key) && window.sessionStorage.getItem(key)) {
    const legacy = JSON.parse(window.sessionStorage.getItem(key));
    if (!Array.isArray(legacy)) throw new Error('图片审核记录格式不正确');
    writeDemoData(key, legacy);
  }
  return readDemoData(key, []);
}

export function savePhotoReviewResult(projectNo, entry) {
  if (typeof window === 'undefined') return;
  const existing = getPhotoReviewResults(projectNo).filter((item) => item.assetTag !== entry.assetTag);
  writeDemoData(keyFor(projectNo), [...existing, entry]);
}
