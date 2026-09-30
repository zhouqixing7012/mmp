import { readDemoData, writeDemoData } from '../../services/demoStorage';

const storageKey = projectNo => `inventory-preparation-notices:${projectNo}`;

export function getPreparationNotices(projectNo) {
  return readDemoData(storageKey(projectNo), []);
}

// 原型保存待发送任务；真实服务号投递由通知服务执行，不用提示冒充发送成功。
export function schedulePreparationNotices(projectNo, notices) {
  if (!notices.length) return [];
  const current = getPreparationNotices(projectNo);
  const existingIds = new Set(current.map(notice => notice.id));
  const added = notices.filter(notice => !existingIds.has(notice.id));
  writeDemoData(storageKey(projectNo), [...current, ...added]);
  return added;
}
