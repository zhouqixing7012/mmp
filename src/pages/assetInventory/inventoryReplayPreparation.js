import dayjs from 'dayjs';

// 启动不得晚于盘点开始日；正常范围内较晚日期离开始日更近。
export function replayPreparationDate(startDate, startedOn) {
  const start = dayjs(startDate);
  const launched = dayjs(startedOn);
  if (!startDate || !startedOn || !start.isValid() || !launched.isValid()) throw new Error('复盘通知日期不完整');
  if (launched.isAfter(start, 'day')) throw new Error('复盘计划不能在盘点开始日之后启动，请调整盘点日期');
  const threeDaysBefore = start.subtract(3, 'day');
  return (launched.isAfter(threeDaysBefore, 'day') ? launched : threeDaysBefore).format('YYYY-MM-DD');
}

export function buildReplayPreparationNotices(project, plans, assetsForPlan, startedOn) {
  if (project.projectType !== '复盘') return [];
  return plans.map(plan => ({
    id: `${project.projectNo}:${plan.planNo}:资产准备`,
    projectNo: project.projectNo,
    planNo: plan.planNo,
    scheduledDate: replayPreparationDate(plan.startDate, startedOn),
    recipients: [...new Set(assetsForPlan(plan).filter(asset => asset.inventoryRange === '员工').map(asset => asset.owner).filter(owner => owner && owner !== '-'))],
    channel: '服务号',
    content: `复盘计划将于${plan.startDate}开始，请提前将资产准备好。`,
    status: '待发送',
  })).filter(notice => notice.recipients.length > 0);
}
