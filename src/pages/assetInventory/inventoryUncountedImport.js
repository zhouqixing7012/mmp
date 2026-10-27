import { inventoryManagementBlockReason } from './inventoryManagementPermissions';
export const UNCOUNTED_HEADERS = ['资产标签号', '未盘说明'];
const text = value => String(value ?? '').trim();
export function uncountedImportBlockReason({ project, plan, plans, operator }) {
  if (['关闭', '盘点关闭'].includes(project?.status) || ['关闭', '盘点关闭'].includes(plan?.status)) return '项目或计划已关闭，不能导入未盘说明';
  const targets = plan ? [plan] : plans || [];
  if (!targets.length || targets.some(item => !['审核中', '已审核'].includes(item.status))) return '仅审核中或已审核的计划可以导入未盘说明';
  return inventoryManagementBlockReason(project, operator);
}
export function parseUncountedImport(sheets, assets) {
  const errors = []; const updates = []; const seen = new Set();
  sheets.forEach(({ name, rows }) => {
    const header = (rows[0] || []).map(text);
    if (header.length !== 2 || UNCOUNTED_HEADERS.some(field => header.filter(value => value === field).length !== 1)) {
      errors.push({ sheet: name, row: 1, message: '模板须且仅包含资产标签号、未盘说明两列' }); return;
    }
    rows.slice(1).forEach((row, index) => {
      if (row.every(value => !text(value))) return;
      const tag = text(row[header.indexOf('资产标签号')]);
      const note = text(row[header.indexOf('未盘说明')]);
      const matches = assets.filter(asset => String(asset.assetTag) === tag);
      let message = '';
      if (row.slice(2).some(value => text(value))) message = '包含模板外的数据列';
      else if (!tag) message = '资产标签号不能为空';
      else if (seen.has(tag)) message = '文件内资产标签号重复';
      else if (matches.length !== 1) message = matches.length ? '资产标签号匹配不唯一' : '资产不属于当前计划';
      seen.add(tag);
      if (message) errors.push({ sheet: name, row: index + 2, assetTag: tag, message });
      else if (note) updates.push({ assetTag: tag, uncountedNote: note });
    });
  });
  return { errors, updates: errors.length ? [] : updates };
}
export function applyUncountedImport(assets, updates) {
  const byTag = new Map(updates.map(update => [update.assetTag, update.uncountedNote]));
  return assets.map(asset => byTag.has(String(asset.assetTag)) ? { ...asset, uncountedNote: byTag.get(String(asset.assetTag)) } : asset);
}
