import { selectTopNetValueAssets } from './inventoryScopeRules';

// 先取必盘并集，再仅对剩余资产按项目抽样比例随机抽取。
export function selectReplaySnapshotAssets(assets, project, random = Math.random) {
  const uniqueAssets = [...new Map(assets.map((asset) => [asset.assetTag || asset.key, asset])).values()];
  if (project.projectType !== '复盘' || project.samplingMode !== '百分比') {
    return { assets: uniqueAssets, mandatoryAssetKeys: [] };
  }
  const mandatory = new Set();
  const threshold = project.mandatoryNetValueAbove;
  if (threshold !== '' && threshold != null) {
    uniqueAssets.filter((asset) => Number(asset.netValue) > Number(threshold))
      .forEach((asset) => mandatory.add(asset.key));
  }
  const topPercent = project.mandatoryNetValueTopPercent;
  if (topPercent !== '' && topPercent != null) {
    selectTopNetValueAssets(uniqueAssets, Number(topPercent))
      .forEach((asset) => mandatory.add(asset.key));
  }
  const remainder = uniqueAssets.filter((asset) => !mandatory.has(asset.key));
  const count = Math.round(remainder.length * Number(project.samplingRatio ?? 100) / 100);
  const shuffled = [...remainder];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const picked = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[picked]] = [shuffled[picked], shuffled[index]];
  }
  const selected = new Set([...mandatory, ...shuffled.slice(0, count).map((asset) => asset.key)]);
  return { assets: uniqueAssets.filter((asset) => selected.has(asset.key)), mandatoryAssetKeys: [...mandatory] };
}
