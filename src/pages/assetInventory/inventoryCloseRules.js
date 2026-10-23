const unfinished = status => ['待审核', '审核中', '待审批', '审批中', '待流转'].includes(status);

// 关闭只阻止正在进行的审核；尚未提交和已经通过、驳回均不属于未结束审核。
export function replayCloseBlockReason(project, submission) {
  if (project?.projectType !== '复盘') return '';
  const reviews = [...Object.values(submission?.planReviews || {}), submission?.projectReview, submission?.legacySubmission].filter(Boolean);
  if (reviews.some(review => unfinished(review.status))) return '复盘计划或项目仍有未结束的审核，请结束审核后再关闭项目';
  if (unfinished(submission?.status || project?.approvalStatus)) return '复盘结果仍在审核中，请结束审核后再关闭项目';
  if (submission?.records?.some(record => unfinished(record.status))) return '复盘仍有未结束的审批节点，请结束审核后再关闭项目';
  const plans = submission?.plans ?? project?.replayPlans ?? [];
  return plans.some(plan => unfinished(plan.approvalStatus) || unfinished(plan.status))
    ? '复盘计划仍有未结束的审核，请结束审核后再关闭项目' : '';
}

export function inventoryProjectCloseBlockReason(project, { plans = [], photoRows = [], replaySubmission } = {}) {
  if (['盘点关闭', '关闭'].includes(project?.status)) return '项目已关闭，不能重复关闭';
  const pendingPhoto = photoRows.find(row => unfinished(row.reviewStatus));
  if (pendingPhoto) return `资产 ${pendingPhoto.asset?.assetTag || ''} 的盘点图片待审核，请结束审核后再关闭项目`;
  return replayCloseBlockReason({ ...project, replayPlans: plans.length ? plans : project?.replayPlans }, replaySubmission);
}
