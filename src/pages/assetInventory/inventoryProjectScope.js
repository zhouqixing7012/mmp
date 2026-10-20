import dayjs from 'dayjs';

export function getInventoryPeriodOptions(inventoryType, year = dayjs().year()) {
  if (inventoryType === '月度') return Array.from({ length: 14 }, (_, index) => {
    const month = dayjs(`${year - 1}-12-01`).add(index, 'month');
    return `${month.year()}年${month.month() + 1}月`;
  });
  return Array.from({ length: 4 }, (_, index) => `${year}年Q${index + 1}`);
}

// 抽盘/复盘只读所关联初盘的执行快照；缺少快照时不得退回全量资产。
export function inventoryProjectScopeSource(project, { allAssets, initialSnapshot, initialAssets }) {
  if (project.projectType !== '初盘') {
    return (initialSnapshot?.assets ?? initialAssets ?? []).filter(asset => asset.executeInventory);
  }
  if (project.inventoryType !== '年度') return allAssets;
  if (!project.createdAt || !dayjs(project.createdAt).isValid()) return [];
  const year = dayjs(project.createdAt).year();
  const cutoff = dayjs(`${year}-07-01`);
  return allAssets.filter(asset => asset.enableDate && dayjs(asset.enableDate).isValid() && dayjs(asset.enableDate).isBefore(cutoff));
}

export function inheritInitialInventoryPeriod(project, initialProject) {
  return { ...project, initialProjectNo: initialProject.projectNo, inventoryType: initialProject.inventoryType,
    period: initialProject.period, projectName: `${initialProject.period}-${initialProject.inventoryType}盘点` };
}
