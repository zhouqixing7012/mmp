import dayjs from 'dayjs';
import { initializeInventoryPlanPersonnel, INVENTORY_FINANCIAL_SUPERVISOR } from './inventoryPlanPersonnel';

export function nextInventoryPlanNumber(projectType, existingPlans, offset = 0, date = dayjs().format('YYYYMMDD')) {
  const prefix = { 初盘: 'PLAN', 复盘: 'RCT', 抽盘: 'DCT' }[projectType];
  if (!prefix) throw new Error('未知盘点项目类型');
  const stem = `${prefix}-${date}-`;
  const last = existingPlans.filter(plan => plan.planNo.startsWith(stem)).reduce((max, plan) => Math.max(max, Number(plan.planNo.slice(stem.length))), 0);
  return `${stem}${String(last + offset + 1).padStart(4, '0')}`;
}

const validLocation = value => Boolean(String(value || '').trim()) && !['-', '—'].includes(String(value).trim());
const summarize = values => [...new Set(values.filter(validLocation))].join('、');

export function inventoryDefaultPlanBlockReason(project, assets) {
  if (project.projectType !== '复盘') return '';
  if (assets.some(asset => asset.inventoryRange === '机房')) {
    return '机房复盘默认计划需要机房标识及资产与机房的关联信息，当前资料尚未提供，不能按楼层或NO位置代替机房生成';
  }
  const missing = assets.find(asset => ![asset.city, asset.building, asset.floor].every(validLocation));
  return missing ? `资产 ${missing.assetTag || missing.key || '标签号缺失'} 缺少完整的City、Building或Floor，不能按楼层生成复盘计划` : '';
}

// 初盘、抽盘按子公司与范围分组；非机房复盘按完整楼层身份汇总。
export function buildDefaultInventoryPlans(project, assets, existingPlans = [], date) {
  const reason = inventoryDefaultPlanBlockReason(project, assets);
  if (reason) throw new Error(reason);
  const replay = project.projectType === '复盘';
  const groups = new Map();
  initializeInventoryPlanPersonnel(project, assets).forEach(asset => {
    const dimensions = replay
      ? [String(asset.city).trim(), String(asset.building).trim(), String(asset.floor).trim()]
      : [asset.organization, asset.inventoryRange];
    const key = JSON.stringify(dimensions);
    if (!groups.has(key)) groups.set(key, { dimensions, assets: [] });
    groups.get(key).assets.push(asset);
  });
  return [...groups.values()].map((group, index) => {
    const organization = summarize(group.assets.map(asset => asset.organization));
    const ranges = [...new Set(group.assets.map(asset => asset.inventoryRange))];
    const range = ranges.join('、');
    const department = summarize(group.assets.map(asset => ['库房', '公共'].includes(asset.inventoryRange) ? '虚拟组织' : String(asset.ownerDept || '').split('.')[0]));
    const city = summarize(group.assets.map(asset => asset.city));
    const building = replay ? group.dimensions[1] : summarize(group.assets.map(asset => asset.building));
    const floor = replay ? group.dimensions[2] : summarize(group.assets.map(asset => asset.floor));
    const planNo = nextInventoryPlanNumber(project.projectType, existingPlans, index, date);
    const quantity = group.assets.length;
    return { key: `generated-${project.projectNo}-${planNo}`, planNo,
      planName: replay ? `${city} ${building} ${floor}复盘计划` : `${city}盘点计划`,
      status: '草稿', organization, department, city, building, floor, range, ranges,
      assetCount: quantity, uncountedCount: quantity, countedCount: 0,
      startDate: project.startDate, endDate: project.endDate,
      supervisor: '-', executor: '-', financialSupervisor: replay ? INVENTORY_FINANCIAL_SUPERVISOR : '-', assets: group.assets,
    };
  });
}
