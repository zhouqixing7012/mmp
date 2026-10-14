// 资产维护和报表共用同一资产状态枚举。
export const ASSET_STATUS_OPTIONS = Object.freeze([
  '在用-使用中', '在库-修理', '在库-新增', '在用-借用中', '在库-待处理',
  '再利用-使用中', '已报废-已处置', '已报废-待处置', '再利用-待报废',
]);

export function formatAssetCategory(asset) {
  return [asset.category, asset.subCategory].filter(Boolean).join('.');
}

export function matchesAssetCategory(asset, selected) {
  const choices = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return !choices.length || choices.includes('全部') || choices.some((value) => (
    value === `major:${asset.category}` || value === `minor:${asset.category}|${asset.subCategory}`
    || value === asset.category || value === formatAssetCategory(asset)
  ));
}

export function matchesQuerySelection(value, selected) {
  const choices = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return !choices.length || choices.includes('全部') || choices.includes(String(value ?? ''));
}


// 耗材维护、业务校验和报表共用耗材状态字典。
export const CONSUMABLE_STATUS_OPTIONS = Object.freeze(['在用', '在库', '维修', '借用中', '待处理', '再利用', '已报废']);
