import { findMaterialCategory } from './reference/materialCategoryMapping';

// 仅用于报表交易演示，格式依据标签打印 PRD 4.3；不占用正式标签流水。
// 以同一业务对象的 id 缓存标签，来源、投影和快照不能各自重新造号。
const tags = new Map();
const sequences = new Map();
function next(key, start, width) {
  const value = (sequences.get(key) ?? start) + 1;
  if (value >= 10 ** width) throw new Error(`报表演示标签流水已满：${key}`);
  sequences.set(key, value);
  return String(value).padStart(width, '0');
}
export function reportTag(id, material, warehouse) {
  if (material.materialType === '耗材') return '';
  const key = `${id}|${material.materialCode}|${warehouse.company}`;
  if (tags.has(key)) return tags.get(key);
  let tag;
  if (material.materialType === '低值耐用品') {
    const prefix = material.majorCategory === '合约机'
      ? (material.minorCategory === '合约手机' ? 'P' : 'N') : 'QT';
    tag = `${prefix}-26${next(`high:${prefix}:26`, 4500, 4)}`;
  } else if (material.majorCategory === 'FURNITURE') {
    const suffix = /椅/.test(material.minorCategory) ? 'Y' : /桌/.test(material.minorCategory) ? 'E'
      : /柜/.test(material.minorCategory) ? 'D' : /工位/.test(material.minorCategory) ? 'A' : 'Q';
    tag = `${next('furniture', 618000, 6)}${suffix}`;
  } else {
    const ledger = warehouse.company.split('.')[0];
    // 笔记本沿用标签打印页的16类型编码，不直接拿物料大类12充当标签类型。
    const type = material.majorCategory === 'NOTEBOOK' ? '16'
      : (findMaterialCategory(material)?.majorCode || material.materialCode.slice(1, 3));
    const suffix = material.majorCategory === 'PC' && material.minorCategory.startsWith('显示器') ? '-V' : '';
    const sequence = next(`normal:${ledger}:${type}:26`, 2000, 5);
    tag = `${ledger}${type}26${sequence}${suffix}`;
    if (tag.length > 15) tag = `${ledger}${type}${sequence}${suffix}`;
  }
  tags.set(key, tag);
  return tag;
}
