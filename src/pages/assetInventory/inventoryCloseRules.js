// 复盘必须逐条核验关联计划；项目级审批状态不能代替计划审批结果。
export function replayCloseBlockReason(project) {
  if (project?.projectType !== '复盘') return '';
  const plans = project.replayPlans;
  if (!Array.isArray(plans) || plans.length === 0) return '缺少复盘计划审批明细，无法核验关闭条件';
  if (plans.some((plan) => plan.approvalStatus !== '已审核')) return '所有复盘计划均审核通过后才能关闭项目';
  return '';
}
