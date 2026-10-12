import { matchesAssetCategory, matchesQuerySelection } from '../../components/assetQueryModel';
import { readDemoData, writeDemoData } from '../../services/demoStorage';

const storageKey = (projectNo) => `asset-inventory-photo-snapshot:${projectNo}`;
const fields = { ownerLevel: 'ownerLevel', department: 'ownerDept', assetStatus: 'useStatus', organization: 'organization', city: 'city', building: 'building', floor: 'floor' };

export function validateInventoryPhotoConfig(config) {
  if (!config.enabled) return;
  config.rules.forEach(rule => {
    if (rule.percent === null || rule.percent === '' || !Number.isFinite(Number(rule.percent)) || Number(rule.percent) < 0 || Number(rule.percent) > 100) {
      throw new Error('请填写0～100的图片上传百分比');
    }
  });
}

export function saveInventoryPhotoConfig(projectNo, config) {
  validateInventoryPhotoConfig(config);
  return writeDemoData(`${storageKey(projectNo)}:config`, config);
}

export function getInventoryPhotoConfig(projectNo) {
  return readDemoData(`${storageKey(projectNo)}:config`, null);
}

export function matchesInventoryPhotoRule(asset, rule) {
  return asset.inventoryRange === rule.range
    && Object.entries(fields).every(([field, assetField]) => matchesQuerySelection(asset[assetField], rule[field]))
    && matchesAssetCategory(asset, rule.category);
}

// 每条规则独立使用 Fisher–Yates 抽取，按标签号合并，快照生成后固定结果。
export function selectInventoryPhotoAssets(assets, rules, enabled, random = Math.random) {
  const unique = [...new Map(assets.map(asset => [asset.assetTag, asset])).values()];
  if (unique.some(asset => !asset.assetTag)) throw new Error('图片规则资产缺少标签号');
  validateInventoryPhotoConfig({ enabled, rules });
  const selected = new Set();
  if (enabled) rules.forEach(rule => {
    const matches = unique.filter(asset => matchesInventoryPhotoRule(asset, rule));
    const count = Math.round(matches.length * Number(rule.percent) / 100);
    for (let i = 0; i < count; i += 1) {
      const j = i + Math.floor(random() * (matches.length - i));
      [matches[i], matches[j]] = [matches[j], matches[i]];
      selected.add(matches[i].assetTag);
    }
  });
  return unique.map(asset => ({ ...asset, needPhoto: selected.has(asset.assetTag) }));
}

export function saveInventoryPhotoSnapshot(project, assets) {
  const config = project.photoConfig === undefined
    ? getInventoryPhotoSnapshot(project.projectNo)?.config
    : project.photoConfig;
  return writeDemoData(storageKey(project.projectNo), { config, assets });
}

export function getInventoryPhotoSnapshot(projectNo) {
  return projectNo ? readDemoData(storageKey(projectNo), null) : null;
}

export function applyInventoryPhotoSnapshot(projectNo, assets) {
  const snapshot = getInventoryPhotoSnapshot(projectNo);
  if (!snapshot) return assets;
  const byTag = new Map(snapshot.assets.map(asset => [asset.assetTag, asset]));
  return assets.filter(asset => byTag.has(asset.assetTag)).map(asset => ({ ...asset, needPhoto: byTag.get(asset.assetTag).needPhoto }));
}
