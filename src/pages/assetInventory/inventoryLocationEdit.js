const text = value => String(value ?? '').trim();
export const LOCATION_IMPORT_HEADERS = ['资产标签号', '城市', '建筑物', '楼层/机房', '备注'];
export function buildLocationDraft(asset) {
  return { id: 'added:' + asset.tag, assetTag: asset.tag, serialNumber: asset.serialNumber || '', assetDesc: asset.assetDesc || '', quantity: asset.quantity, remark: asset.remarks || '', before: {city: asset.city || '', building: asset.building || '', floor: asset.floor || ''}, after: {city: asset.city || '', building: asset.building || '', floor: asset.floor || ''}, status: '待发起' };
}
export function validateLocation(target, optionsFor) {
  if (['city', 'building', 'floor'].some(field => !text(target[field]))) throw new Error('城市、建筑物、楼层/机房均须填写');
  const options = optionsFor(target);
  if (['city', 'building', 'floor'].some(field => !options[field].includes(target[field]))) throw new Error('地点不存在或城市、建筑物、楼层/机房不匹配');
}
// 全部行验证成功后再返回结果，避免导入部分成功。
export function parseLocationImport(matrix, assets, blockedTags, optionsFor) {
  if (!matrix.length || (LOCATION_IMPORT_HEADERS.some((header, index) => text(matrix[0][index]) !== header) || matrix[0].slice(5).some(value => text(value)))) throw new Error('导入列须为：' + LOCATION_IMPORT_HEADERS.join('、'));
  const byTag = new Map(assets.map(asset => [text(asset.tag), asset]));
  const seen = new Set(blockedTags);
  const rows = matrix.slice(1).filter(row => row.some(value => text(value)));
  if (!rows.length) throw new Error('导入文件没有资产明细');
  return rows.map((row, index) => {
    if (row.slice(5).some(value => text(value))) throw new Error('第' + (index + 2) + '行包含未定义的导入列');
    const tag = text(row[0]);
    if (!byTag.has(tag)) throw new Error('第' + (index + 2) + '行资产不在当前复盘项目范围或台账中');
    if (seen.has(tag)) throw new Error('第' + (index + 2) + '行资产重复或已在申请中');
    seen.add(tag);
    const after = {city:text(row[1]), building:text(row[2]), floor:text(row[3])};
    try { validateLocation(after, optionsFor); } catch (error) { throw new Error('第' + (index + 2) + '行：' + error.message); }
    const remark = text(row[4]);
    if (Array.from(remark).length > 150) throw new Error('第' + (index + 2) + '行备注最多150个字符');
    return {...buildLocationDraft(byTag.get(tag)), after, remark};
  });
}
