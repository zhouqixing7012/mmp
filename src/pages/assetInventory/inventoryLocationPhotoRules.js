import { getPhotoReviewResults } from './inventoryPhotoReviewStore';

// 发起审批前读取当前项目的真实审核结果；已盘状态只有照片审核通过后写入审核记录。
export function inventoryLocationPhotoBlockReason(projectNo, assetTag, projectAssets) {
  const matches = projectAssets.filter((asset) => String(asset.assetTag || asset.tag || asset.tagNo) === String(assetTag));
  if (matches.length !== 1) return assetTag + ' 不在当前复盘项目资产范围或存在重复记录';
  const asset = matches[0];
  const range = asset.inventoryRange ?? asset.area;
  if (!range) return assetTag + ' 缺少盘点范围，不能核对照片审核要求';
  if (range === '机房') return '';
  const needsPhoto = asset.needPhoto ?? asset.photoRequired;
  if (typeof needsPhoto !== 'boolean') return assetTag + ' 缺少当前项目的照片要求';
  if (!needsPhoto) return '';
  const review = getPhotoReviewResults(projectNo).find((item) => item.assetTag === assetTag);
  return review?.status === '已盘' ? '' : assetTag + ' 的盘点照片须审核通过后才能发起位置变更';
}
