import { isInventoryAssetMandatory } from './inventoryMandatoryAssets';

export const INVENTORY_MANDATORY_IMPORT_HEADERS = ['资产标签号', '是否必盘'];
const text = (value) => String(value ?? '').trim();

export function inventoryMandatoryTemplateRows(assets, project) {
  return [INVENTORY_MANDATORY_IMPORT_HEADERS, ...assets.map((asset) => [String(asset.assetTag), isInventoryAssetMandatory(asset, project) ? '是' : '否'])];
}

// 仅维护当前范围资产的必盘标记；先整批校验，再返回本次变更，不增加资产。
export function parseInventoryMandatoryRows(matrix, scopeAssets, requiredKeys = new Set()) {
  const header = matrix[0] || [];
  if (INVENTORY_MANDATORY_IMPORT_HEADERS.some((name, index) => text(header[index]) !== name) || header.slice(2).some((value) => text(value))) {
    throw new Error('导入列须依次为：资产标签号、是否必盘');
  }
  const assetsByTag = new Map();
  scopeAssets.forEach((asset) => {
    const tag = String(asset.assetTag);
    assetsByTag.set(tag, [...(assetsByTag.get(tag) || []), asset]);
  });
  const seen = new Set();
  const changes = [];
  matrix.slice(1).forEach((row, index) => {
    if (row.every((value) => !text(value))) return;
    const line = index + 2;
    if (row.slice(2).some((value) => text(value))) throw new Error(`第${line}行包含未定义的导入列`);
    const tag = text(row[0]);
    const candidates = assetsByTag.get(tag);
    if (!candidates?.length) throw new Error(`第${line}行资产 ${tag || '（空）'} 不在当前盘点范围中`);
    if (candidates.length !== 1) throw new Error(`第${line}行资产 ${tag} 在当前范围中不唯一，请先核对资产清单`);
    if (seen.has(tag)) throw new Error(`第${line}行资产 ${tag} 重复`);
    const flag = text(row[1]);
    if (!['是', '否'].includes(flag)) throw new Error(`第${line}行是否必盘只能填写“是”或“否”`);
    const asset = candidates[0];
    if (flag === '否' && requiredKeys.has(asset.key)) throw new Error(`第${line}行资产 ${tag} 命中必盘条件，不能改为否`);
    seen.add(tag);
    changes.push({ key: asset.key, assetTag: asset.assetTag, isMandatory: flag === '是' });
  });
  if (!changes.length) throw new Error('导入文件没有必盘标记明细');
  return changes;
}
