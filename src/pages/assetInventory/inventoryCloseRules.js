// 复盘必须逐条核验关联计划；项目级审批状态不能代替计划审批结果。
export function replayCloseBlockReason(project) {
  if (project?.projectType !== '复盘') return '';
  const plans = project.replayPlans;
  if (!Array.isArray(plans) || plans.length === 0) return '缺少复盘计划审批明细，无法核验关闭条件';
  if (plans.some((plan) => plan.approvalStatus !== '已审核')) return '所有复盘计划均审核通过后才能关闭项目';
  return '';
}

// 关闭入口必须核对本项目当前计划、实际照片审核记录和位置申请，不使用缺省为0的汇总值。
export function inventoryProjectCloseBlockReason(project, { plans, photoRows, locationRequests } = {}) {
  if (!Array.isArray(plans) || !plans.length) return '缺少当前项目盘点计划明细，无法核验关闭条件';
  if (plans.some(plan => !['草稿', '暂存', '盘点中', '审核中', '已审核', '关闭'].includes(plan.status))) return '盘点计划状态不完整，无法核验关闭条件';
  const unstarted = plans.find(plan => ['草稿', '暂存'].includes(plan.status));
  if (unstarted) return `盘点计划 ${unstarted.planNo} 尚未启动，请先启动计划后再关闭项目`;
  if (plans.some(plan => !['盘点中', '审核中', '已审核', '关闭'].includes(plan.status))) return '盘点计划状态不完整，无法核验关闭条件';
  if (!Array.isArray(photoRows)) return '缺少当前项目图片审核记录，无法核验关闭条件';
  const pending = photoRows.find(row => row.reviewStatus === '待审核');
  if (pending) return `资产 ${pending.asset.assetTag} 的盘点图片待审核，请完成审核后再关闭项目`;
  const rejected = photoRows.find(row => row.reviewStatus === '审核不通过');
  if (rejected) return `资产 ${rejected.asset.assetTag} 的盘点图片审核不通过，请处理后再关闭项目`;
  if (project.projectType === '复盘') {
    if (!Array.isArray(locationRequests)) return '缺少当前项目位置变更记录，无法核验关闭条件';
    const waiting = locationRequests.find(request => request.status === '待审批');
    if (waiting) return `位置变更申请 ${waiting.requestNo || waiting.id} 尚在审批中，请完成审批后再关闭项目`;
  }
  return replayCloseBlockReason(project);
}
