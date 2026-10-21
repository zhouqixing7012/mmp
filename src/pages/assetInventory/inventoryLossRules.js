// 照片驳回可恢复报失资格，但已提交的新报失不能被旧审核结论覆盖。
export function canReportInventoryLoss(asset, photoReview) {
  return asset?.status === '未盘'
    && (!asset.lossReported || photoReview?.status === '未盘');
}

export function applyPhotoReviewToInventoryAsset(asset, photoReview) {
  if (!photoReview || asset.status === '报失') return asset;
  return { ...asset, status: photoReview.status };
}
