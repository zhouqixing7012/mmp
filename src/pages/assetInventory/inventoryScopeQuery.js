import { selectTopNetValueAssets } from './inventoryScopeRules';

// 在当前筛选结果中按净值降序选择资产；同净值按资产标签号稳定排序。
export function selectScopeAssets(assets, filters, projectType) {
  const matches = (value, selected) => {
    const choices = Array.isArray(selected) ? selected : selected ? [selected] : [];
    return !choices.length || choices.includes('全部') || choices.some((choice) => String(value || '').includes(choice));
  };
  const filtered = assets.filter((asset) => (
    (filters.organizationDepartments?.length
      ? filters.organizationDepartments.some((choice) => choice.startsWith('org:')
        ? asset.organization === choice.slice(4)
        : choice.startsWith('dept:') && asset.organization === choice.slice(5).split('::')[0] && asset.ownerDept === choice.slice(5).split('::')[1])
      : matches(asset.organization, filters.organization) && matches(asset.ownerDept, filters.department))
    && matches(asset.category, filters.assetCategory)
    && matches(asset.useStatus, filters.assetStatus)
    && matches(asset.warehouse, filters.warehouse)
    && matches(asset.city, filters.city)
    && matches(asset.building, filters.building)
    && matches(asset.floor, filters.floor)
    && matches(asset.owner, filters.owner)
    && matches(asset.ownerLevel, filters.ownerLevel)
    && (!filters.enableFrom || asset.enableDate >= filters.enableFrom)
    && (!filters.enableTo || asset.enableDate <= filters.enableTo)
  ));
  if (projectType !== '复盘') return filtered;
  const ranked = selectTopNetValueAssets(filtered, filters.netValueTopPercent);
  if (!filters.ratio || filters.ratio === 100) return ranked;
  const shuffled = [...ranked];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.round(ranked.length * filters.ratio / 100));
}
