import { selectTopNetValueAssets } from './inventoryScopeRules';
import { isInventoryAssetMandatory, withInventoryMandatoryFlags } from './inventoryMandatoryAssets';

// 范围展示和生成快照共用必盘条件，展示时不执行随机抽样。
export function replayMandatoryRuleKeys(assets, project) {
  const mandatory = new Set();
  if (project.projectType !== '复盘' || project.samplingMode !== '百分比') return mandatory;
  const threshold = project.mandatoryNetValueAbove;
  if (threshold !== '' && threshold != null) {
    assets.filter((asset) => Number(asset.netValue) > Number(threshold))
      .forEach((asset) => mandatory.add(asset.key));
  }
  const topPercent = project.mandatoryNetValueTopPercent;
  if (topPercent !== '' && topPercent != null) {
    selectTopNetValueAssets(assets, Number(topPercent))
      .forEach((asset) => mandatory.add(asset.key));
  }
  return mandatory;
}

export function markReplayMandatoryAssets(assets, project) {
  const rules = replayMandatoryRuleKeys(assets, project);
  return withInventoryMandatoryFlags(assets, project).map((asset) => ({ ...asset, isMandatory: asset.isMandatory || rules.has(asset.key) }));
}

// 先取必盘并集，再仅对剩余资产按项目抽样比例随机抽取。
export function selectReplaySnapshotAssets(assets, project, random = Math.random) {
  const uniqueAssets = markReplayMandatoryAssets([...new Map(assets.map((asset) => [asset.assetTag || asset.key, asset])).values()], project);
  const mandatory = new Set(uniqueAssets.filter((asset) => isInventoryAssetMandatory(asset, project)).map((asset) => asset.key));
  if (project.projectType !== '复盘' || project.samplingMode !== '百分比') {
    return { assets: uniqueAssets, mandatoryAssetKeys: [...mandatory] };
  }
  const remainder = uniqueAssets.filter((asset) => !mandatory.has(asset.key));
  const count = Math.round(remainder.length * Number(project.samplingRatio ?? 100) / 100);
  const shuffled = [...remainder];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const picked = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[picked]] = [shuffled[picked], shuffled[index]];
  }
  const selected = new Set([...mandatory, ...shuffled.slice(0, count).map((asset) => asset.key)]);
  return { assets: uniqueAssets.filter((asset) => selected.has(asset.key)).map((asset) => ({ ...asset, isMandatory: mandatory.has(asset.key) })), mandatoryAssetKeys: [...mandatory] };
}
