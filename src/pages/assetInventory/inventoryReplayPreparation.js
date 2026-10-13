import dayjs from 'dayjs';

// 准备通知取启动日和开始前三天中较晚的一天；晚启动当天通知。
export function replayPreparationDate(startDate, startedOn) {
  const start = dayjs(startDate);
  const launched = dayjs(startedOn);
  if (!startDate || !startedOn || !start.isValid() || !launched.isValid()) throw new Error('复盘通知日期不完整');
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
    content: dayjs(startedOn).isAfter(dayjs(plan.startDate), 'day')
      ? '复盘计划已启动，请准备资产。'
      : `复盘计划将于${plan.startDate}开始，请提前将资产准备好。`,
    status: '待发送',
  })).filter(notice => notice.recipients.length > 0);
}
