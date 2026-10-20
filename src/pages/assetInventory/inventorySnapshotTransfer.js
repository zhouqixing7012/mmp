// 先校验整份导入文件，再返回待转移资产；任何错误都不得部分转移。
export function parseSnapshotTransferRows(matrix, sourceRows) {
  if (!matrix.length || String(matrix[0][0] || '').trim() !== '资产标签号' || matrix[0].slice(1).some(value => String(value || '').trim())) {
    throw new Error('导入列须为：资产标签号');
  }
  const byTag = new Map(sourceRows.map(asset => [String(asset.assetTag), asset]));
  const seen = new Set();
  const result = [];
  matrix.slice(1).forEach((row, index) => {
    if (row.every(value => !String(value || '').trim())) return;
    if (row.slice(1).some(value => String(value || '').trim())) throw new Error(`第${index + 2}行包含未定义的导入列`);
    const tag = String(row[0] || '').trim();
    if (!byTag.has(tag)) throw new Error(`第${index + 2}行资产 ${tag} 不在当前资产清单中`);
    if (seen.has(tag)) throw new Error(`第${index + 2}行资产 ${tag} 重复`);
    seen.add(tag); result.push(byTag.get(tag));
  });
  if (!result.length) throw new Error('导入文件没有资产明细');
  return result;
}
