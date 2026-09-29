const keyFor = (projectNo) => `assetInventoryPhotoReview:${projectNo || 'demo'}`;

export function getPhotoReviewResults(projectNo) {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.sessionStorage.getItem(keyFor(projectNo)) || '[]'); }
  catch { return []; }
}

export function savePhotoReviewResult(projectNo, entry) {
  if (typeof window === 'undefined') return;
  const existing = getPhotoReviewResults(projectNo).filter((item) => item.assetTag !== entry.assetTag);
  window.sessionStorage.setItem(keyFor(projectNo), JSON.stringify([...existing, entry]));
}
