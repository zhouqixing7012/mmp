import * as XLSX from 'xlsx';
import { serializeInventoryScopeExport } from './inventoryAssetExport';

// 清单导入、模板和导出使用同一字段定义，不维护另一套必盘标记模板。
export const INVENTORY_MANDATORY_IMPORT_HEADERS = ['资产标签号', '是否必盘'];
const text = (value) => String(value ?? '').trim();

export function inventoryMandatoryTemplateRows(assets, project) {
  const { csv } = serializeInventoryScopeExport(assets, { project, includeMandatory: true });
  const workbook = XLSX.read(csv, { type: 'string', raw: true });
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '', raw: false });
}

// 以关联初盘执行源匹配资产，只维护范围及是否必盘。
export function parseInventoryMandatoryRows(matrix, scopeAssets, requiredKeys = new Set()) {
  const header = matrix[0] || [];
  const fields = header.map(text);
  const nonempty = fields.filter(Boolean);
  if (new Set(nonempty).size !== nonempty.length) throw new Error('导入表头包含重复列，请使用清单模板');
  const unknown = nonempty.filter((name) => !INVENTORY_MANDATORY_IMPORT_HEADERS.includes(name));
  if (unknown.length) throw new Error(`导入表头包含未定义列：${unknown.join('、')}`);
  const missing = INVENTORY_MANDATORY_IMPORT_HEADERS.filter((name) => !fields.includes(name));
  if (missing.length) throw new Error(`导入清单缺少列：${missing.join('、')}`);
  const tagIndex = fields.indexOf('资产标签号');
  const mandatoryIndex = fields.indexOf('是否必盘');
  const assetsByTag = new Map();
  scopeAssets.forEach((asset) => {
    const tag = String(asset.assetTag);
    assetsByTag.set(tag, [...(assetsByTag.get(tag) || []), asset]);
  });
  const seen = new Set();
  const changes = [];
  const sourceLines = [];
  const errors = [];
  matrix.slice(1).forEach((row, index) => {
    try {
      if (row.every((value) => !text(value))) return;
      const line = index + 2;
      if (row.some((value, column) => !fields[column] && text(value))) throw new Error(`第${line}行包含未定义的导入列`);
      const tag = text(row[tagIndex]);
      const candidates = assetsByTag.get(tag);
      if (!candidates?.length) throw new Error(`第${line}行资产 ${tag || '（空）'} 不在当前项目关联初盘的可选执行资产中`);
      if (candidates.length !== 1) throw new Error(`第${line}行资产 ${tag} 在可选初盘执行源中不唯一，请先核对资产清单`);
      if (seen.has(tag)) throw new Error(`第${line}行资产 ${tag} 重复`);
      seen.add(tag);
      const flag = text(row[mandatoryIndex]);
      if (!['是', '否'].includes(flag)) throw new Error(`第${line}行是否必盘只能填写“是”或“否”`);
      const asset = candidates[0];
      changes.push({ key: asset.key, assetTag: asset.assetTag, isMandatory: flag === '是' });
      sourceLines.push(line);
    } catch (error) { errors.push({ row: index + 2, assetTag: text(row[tagIndex]), message: error.message }); }
  });
  if (errors.length) {
    const error = new Error(errors.map(item => item.message).join("；"));
    error.errors = errors;
    throw error;
  }
  if (!changes.length) throw new Error('导入文件没有资产明细');
  const mandatory = typeof requiredKeys === 'function' ? requiredKeys(changes) : requiredKeys;
  changes.forEach((asset, index) => {
    if (!asset.isMandatory && mandatory.has(asset.key)) errors.push({ row: sourceLines[index], assetTag: asset.assetTag, message: `第${sourceLines[index]}行资产 ${asset.assetTag} 命中必盘条件，不能改为否` });
  });
  if (errors.length) {
    const error = new Error(errors.map(item => item.message).join('；'));
    error.errors = errors;
    throw error;
  }
  return changes;
}
