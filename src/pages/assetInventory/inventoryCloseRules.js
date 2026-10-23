const unfinished = status => ['待审核', '审核中', '待审批', '审批中', '待流转'].includes(status);

// 关闭只阻止正在进行的审核；尚未提交和已经通过、驳回均不属于未结束审核。
export function replayCloseBlockReason(project, submission) {
  if (unfinished(submission?.status || project?.approvalStatus)) return '复盘结果仍在审核中，请结束审核后再关闭项目';
  const plans = submission?.plans ?? project?.replayPlans ?? [];
  return plans.some(plan => unfinished(plan.approvalStatus) || unfinished(plan.status))
    ? '复盘计划仍有未结束的审核，请结束审核后再关闭项目' : '';
}

export function inventoryProjectCloseBlockReason(project, { plans = [], photoRows = [], locationRequests = [], replaySubmission } = {}) {
  if (['盘点关闭', '关闭'].includes(project?.status)) return '项目已关闭，不能重复关闭';
  const pendingPhoto = photoRows.find(row => unfinished(row.reviewStatus));
  if (pendingPhoto) return `资产 ${pendingPhoto.asset?.assetTag || ''} 的盘点图片待审核，请结束审核后再关闭项目`;
  const location = locationRequests.find(request => unfinished(request.status));
  if (location) return `位置变更申请 ${location.requestNo || location.id} 尚在审批中，请结束审核后再关闭项目`;
  return replayCloseBlockReason({ ...project, replayPlans: plans.length ? plans : project?.replayPlans }, replaySubmission);
}
