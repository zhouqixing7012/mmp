// 资产上的明确标记优先，旧项目仅保存必盘资产键时按原键兼容读取。
function mandatoryFromKeys(asset, keys) {
  if (asset?.isMandatory === true || asset?.isMandatory === '是' || asset?.isMandatory === 1) return true;
  if (asset?.isMandatory === false || asset?.isMandatory === '否' || asset?.isMandatory === 0) return false;
  return [asset?.key, asset?.id, asset?.assetTag, asset?.tagNo]
    .some((key) => key != null && keys.has(String(key)));
}

export function isInventoryAssetMandatory(asset, project = {}) {
  return mandatoryFromKeys(asset, new Set((project?.mandatoryAssetKeys || []).map(String)));
}

export function withInventoryMandatoryFlags(assets, project = {}) {
  const keys = new Set((project?.mandatoryAssetKeys || []).map(String));
  return assets.map((asset) => ({ ...asset, isMandatory: mandatoryFromKeys(asset, keys) }));
}

// 仅调整必盘与非必盘的先后，同一组维持原顺序，不改调用方数据。
export function sortInventoryMandatoryAssets(assets, project = {}) {
  const keys = new Set((project?.mandatoryAssetKeys || []).map(String));
  return assets.map((asset, index) => ({ asset, index, mandatory: mandatoryFromKeys(asset, keys) }))
    .sort((left, right) => Number(right.mandatory) - Number(left.mandatory) || left.index - right.index)
    .map(({ asset }) => asset);
}
