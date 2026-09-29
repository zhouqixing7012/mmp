// 净值前 X% 按资产条数选取；相同净值按标签号稳定排序。
export function selectTopNetValueAssets(assets, percent) {
  if (percent == null) return assets;
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) throw new Error('净值比例必须为1至100的整数');
  const sorted = [...assets].sort((a, b) => Number(b.netValue) - Number(a.netValue) || String(a.assetTag).localeCompare(String(b.assetTag)));
  return sorted.slice(0, Math.ceil(sorted.length * percent / 100));
}
