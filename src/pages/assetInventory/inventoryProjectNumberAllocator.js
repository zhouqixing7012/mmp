import dayjs from 'dayjs';

export const INVENTORY_PROJECT_NUMBER_KEY = 'inventory-project-number-reservations-v1';
const prefixes = { 初盘: 'CP', 抽盘: 'DCP', 复盘: 'RCP' };
const projectNumberInKey = /(?:CP|DCP|RCP)-\d{8}-\d{4}(?=:|$)/g;

// 编号先预留，放弃草稿也不复用，避免新项目读到同号历史快照和审批。
export function reserveInventoryProjectNumber(projectType, projects = [], date = dayjs().format('YYYYMMDD')) {
  const prefix = prefixes[projectType];
  if (!prefix) throw new Error('项目类型无效，无法生成项目编号');
  if (typeof date !== 'string' || !/^\d{8}$/.test(date) || dayjs(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`).format('YYYYMMDD') !== date) {
    throw new Error('编号日期无效，无法生成项目编号');
  }
  if (typeof window === 'undefined') throw new Error('当前环境无法预留项目编号');
  const stem = `${prefix}-${date}-`;
  try {
    const storage = window.localStorage;
    const raw = storage.getItem(INVENTORY_PROJECT_NUMBER_KEY);
    const reservations = raw ? JSON.parse(raw) : {};
    if (!reservations || Array.isArray(reservations) || typeof reservations !== 'object'
      || Object.values(reservations).some(value => !Number.isInteger(value) || value < 0 || value > 9999)) {
      throw new Error('项目编号预留记录格式错误，请先核对记录');
    }
    const used = projects.map(project => typeof project === 'string' ? project : project.projectNo);
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (/^(inventory-plan-session:|inventory-replay-review-|asset-inventory-photo-snapshot:)/.test(key)) {
        used.push(...(key.match(projectNumberInKey) || []));
      }
    }
    const closedRaw = window.sessionStorage.getItem('assetInventoryClosedProjectNos');
    if (closedRaw) {
      const closed = JSON.parse(closedRaw);
      if (!Array.isArray(closed)) throw new Error('已关闭项目编号记录格式错误，请先核对记录');
      used.push(...closed);
    }
    const last = used.reduce((maximum, number) => typeof number === 'string' && number.startsWith(stem)
      && /^\d{4}$/.test(number.slice(stem.length)) ? Math.max(maximum, Number(number.slice(stem.length))) : maximum, reservations[stem] || 0);
    if (last >= 9999) throw new Error('当日该类型四位项目流水号已用尽，无法创建项目');
    storage.setItem(INVENTORY_PROJECT_NUMBER_KEY, JSON.stringify({ ...reservations, [stem]: last + 1 }));
    return `${stem}${String(last + 1).padStart(4, '0')}`;
  } catch (error) {
    throw new Error(`项目编号预留失败：${error.message}`);
  }
}
