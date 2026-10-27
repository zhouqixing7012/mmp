import { getReplayProjectReview, getReplayReviewForPlan } from './inventoryReplayReviewStore';
const unfinished = status => ['待审核', '审核中', '待审批', '审批中', '待流转'].includes(status);

// 关闭只阻止正在进行的审核；尚未提交和已经通过、驳回均不属于未结束审核。
export function replayCloseBlockReason(project, submission) {
  if (project?.projectType !== '复盘') return '';
  if (submission?.version === 2) {
    // 聚合status/plans及历史不代表当前实例，只核对实际计划集合绑定的两级审批。
    const plans = Array.isArray(project.replayPlans) ? project.replayPlans : [];
    const active = [...plans.map(plan => getReplayReviewForPlan(submission, plan, project.projectNo)), getReplayProjectReview(submission, plans, project.projectNo)].filter(Boolean);
    if (active.some(review => unfinished(review.status))) return '复盘计划或项目仍有未结束的审核，请结束审核后再关闭项目';
    if (submission.legacySubmission && replayCloseBlockReason(project, submission.legacySubmission)) return '复盘历史仍有未结束的审核，请结束审核后再关闭项目';
    return '';
  }
  const reviews = [...Object.values(submission?.planReviews || {}), submission?.projectReview, submission?.legacySubmission].filter(Boolean);
  if (reviews.some(review => unfinished(review.status))) return '复盘计划或项目仍有未结束的审核，请结束审核后再关闭项目';
  if (unfinished(submission?.status || project?.approvalStatus)) return '复盘结果仍在审核中，请结束审核后再关闭项目';
  if (submission?.records?.some(record => unfinished(record.status))) return '复盘仍有未结束的审批节点，请结束审核后再关闭项目';
  const plans = submission?.plans ?? project?.replayPlans ?? [];
  return plans.some(plan => unfinished(plan.approvalStatus) || unfinished(plan.status))
    ? '复盘计划仍有未结束的审核，请结束审核后再关闭项目' : '';
}

export function inventoryProjectCloseBlockReason(project, { plans, assets, photoRows = [], replaySubmission } = {}) {
  if (['盘点关闭', '关闭'].includes(project?.status)) return '项目已关闭，不能重复关闭';
  if (Number(project?.unfinishedReviewCount || 0) > 0) return '审核未结束数量大于零，请结束审核后再关闭项目';
  const pendingPhoto = photoRows.find(row => unfinished(row.reviewStatus));
  if (pendingPhoto) return `资产 ${pendingPhoto.asset?.assetTag || ''} 的盘点图片待审核，请结束审核后再关闭项目`;
  const currentPlans = Array.isArray(plans) ? plans : project?.replayPlans;
  const reviewBlock = replayCloseBlockReason({ ...project, replayPlans: currentPlans }, replaySubmission);
  if (reviewBlock) return reviewBlock;
  if (['初盘', '复盘'].includes(project?.projectType) && !['盘点中', '已启动', '启动'].includes(project?.status)) return '还未开启盘点或已关闭';
  if (project?.projectType !== '复盘') return '';
  if (!Array.isArray(currentPlans) || !Array.isArray(assets)) return '缺少复盘范围或计划明细，无法校验关闭条件';
  const assignedKeys = new Set(currentPlans.flatMap(plan => plan.assetKeys || []));
  const assignedTags = new Set(currentPlans.flatMap(plan => (plan.assets || []).map(asset => asset.assetTag || asset.tagNo)).filter(Boolean));
  const planNos = new Set(currentPlans.map(plan => plan.planNo).filter(Boolean));
  if (assets.some(asset => !assignedKeys.has(asset.key) && !assignedTags.has(asset.assetTag || asset.tagNo) && !(asset.planNo && planNos.has(asset.planNo)))) return '存在未创建计划的资产，请先创建盘点计划';
  const unapproved = currentPlans.find(plan => {
    const review = replaySubmission?.version === 2 ? getReplayReviewForPlan(replaySubmission, plan, project.projectNo) : null;
    return (review?.status ?? plan.approvalStatus ?? plan.status) !== '已审核';
  });
  return unapproved ? `盘点计划 ${unapproved.planNo || ''} 未通过审批，请先完成计划审批` : '';
}
