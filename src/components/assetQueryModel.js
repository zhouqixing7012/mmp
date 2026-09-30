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

