// 资产数量按卡片的数量字段累计；分页条数、扫描次数和导入行数不使用本函数。
export function inventoryAssetQuantity(asset) {
  const value = asset?.quantity;
  if (!['number', 'string'].includes(typeof value) || value === null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0) {
    throw new Error(`资产 ${asset?.assetTag || asset?.tagNo || asset?.key || '标签号缺失'} 的数量缺失或无效，无法统计盘点数量`);
  }
  return Number(value);
}

export function sumInventoryQuantity(assets) {
  return assets.reduce((total, asset) => total + inventoryAssetQuantity(asset), 0);
}
