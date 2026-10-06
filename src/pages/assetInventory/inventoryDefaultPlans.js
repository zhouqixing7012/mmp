import dayjs from 'dayjs';

export function nextInventoryPlanNumber(projectType, existingPlans, offset = 0, date = dayjs().format('YYYYMMDD')) {
  const prefix = { 初盘: 'PLAN', 复盘: 'RCT', 抽盘: 'DCT' }[projectType];
  if (!prefix) throw new Error('未知盘点项目类型');
  const stem = `${prefix}-${date}-`;
  const last = existingPlans.filter(plan => plan.planNo.startsWith(stem)).reduce((max, plan) => Math.max(max, Number(plan.planNo.slice(stem.length))), 0);
  return `${stem}${String(last + offset + 1).padStart(4, '0')}`;
}

// 当前组织树以部门路径第一段为一级；库房、公共使用虚拟组织。
export function buildDefaultInventoryPlans(project, assets, existingPlans = [], date) {
  const groups = new Map();
  assets.forEach(asset => {
    const department = ['库房', '公共'].includes(asset.inventoryRange) ? '虚拟组织' : String(asset.ownerDept || '').split('.')[0];
    const dimensions = [asset.organization, department, asset.city, asset.inventoryRange];
    const key = JSON.stringify(dimensions);
    if (!groups.has(key)) groups.set(key, { dimensions, assets: [] });
    groups.get(key).assets.push(asset);
  });
  return [...groups.values()].map((group, index) => {
    const [organization, department, city, range] = group.dimensions;
    const planNo = nextInventoryPlanNumber(project.projectType, existingPlans, index, date);
    const quantity = group.assets.reduce((total, asset) => total + Number(asset.quantity), 0);
    return { key: `generated-${project.projectNo}-${planNo}`, planNo, planName: `${city}盘点计划`, status: '草稿', organization, department, city, range,
      assetCount: quantity, uncountedCount: quantity, countedCount: 0,
      startDate: project.startDate, endDate: project.projectType === '复盘' ? project.startDate : project.endDate,
      manager: '-', supervisor: '-', executor: '-', financialSupervisor: project.projectType === '复盘' ? '徐博' : '-', auditSupervisor: '-', assets: group.assets,
    };
  });
}
