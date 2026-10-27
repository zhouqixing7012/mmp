import * as XLSX from 'xlsx';

// 范围重建只读各工作表第一列，不把导出中的其他列反写台账。
export function parseInventoryScopeWorkbook(workbook, ledgerAssets, allowedAssets) {
  const ledger = new Map(ledgerAssets.map(asset => [String(asset.assetTag).trim(), asset]));
  const allowed = new Set(allowedAssets.map(asset => asset.key));
  const seen = new Set();
  const assets = [];
  const errors = [];
  workbook.SheetNames.forEach(sheet => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: '', raw: false });
    rows.slice(1).forEach((row, index) => {
      const tag = String(row[0] ?? '').trim();
      if (!tag || seen.has(tag)) return;
      seen.add(tag);
      const asset = ledger.get(tag);
      if (!asset) errors.push({ sheet, row: index + 2, assetTag: tag, message: '资产标签号不在资产台账中' });
      else if (!allowed.has(asset.key)) errors.push({ sheet, row: index + 2, assetTag: tag, message: '资产不在本项目允许的数据范围内' });
      else assets.push({ ...asset });
    });
  });
  if (errors.length) {
    const error = new Error(errors.map(item => `${item.sheet}第${item.row}行：${item.assetTag} ${item.message}`).join('；'));
    error.errors = errors;
    throw error;
  }
  return assets;
}
