import { getReplayReviewForPlan, getReplaySubmission } from './inventoryReplayReviewStore';

const locked = status => ['审核中', '已审核', '审批中', '审批通过'].includes(status);
const closed = status => ['关闭', '盘点关闭'].includes(status);

// 只按项目关闭和当前审批状态锁定执行，不用计划结束日期限制盘点。
export function inventoryExecutionBlockReason({ project, plan, assetTag } = {}) {
  if (closed(project?.status) || closed(plan?.status)) return '项目或计划已关闭，不能修改盘点结果';
  if (project?.projectNo && typeof window !== 'undefined') {
    const closedNos = JSON.parse(window.sessionStorage.getItem('assetInventoryClosedProjectNos') || '[]');
    if (closedNos.includes(project.projectNo)) return '项目已关闭，不能修改盘点结果';
  }
  if (locked(project?.status) || locked(project?.approvalStatus)) return '项目审批中或已通过，不能修改盘点结果';
  const state = project?.projectNo ? getReplaySubmission(project.projectNo) : null;
  if (locked(state?.projectReview?.status)) return '项目审批中或已通过，不能修改盘点结果';
  if (locked(plan?.status) || locked(plan?.approvalStatus)) return '计划审批中或已通过，不能修改盘点结果';
  const review = plan ? getReplayReviewForPlan(state, plan, project?.projectNo)
    : assetTag ? Object.values(state?.planReviews || {}).find(item => Object.values(item.assetsByPlan || {}).some(assets => assets.some(asset => String(asset.assetTag) === String(assetTag)))) : null;
  return locked(review?.status) ? '计划审批中或已通过，不能修改盘点结果' : '';
}
