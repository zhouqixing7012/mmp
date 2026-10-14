import source from './materialCategoryCatalog.json';

// 用户上传分类表的原始编号均为字符串，保留小类前导零；名称必须在同一大类精确匹配。
export const materialMajorCategories = Object.freeze(source.majorRows.map(([code, name]) => Object.freeze({ code, name })));
export const materialMinorCategories = Object.freeze(source.minorRows.map(([majorCode, majorName, code, name, status]) => Object.freeze({ majorCode, majorName, code, name, status })));
export function findMaterialCategory(material) {
  const matches = materialMinorCategories.filter(row => row.majorName === material.majorCategory && row.name === material.minorCategory);
  if (new Set(matches.map(row => `${row.majorCode}|${row.code}`)).size > 1) throw new Error(`分类来源重复：${material.majorCategory}/${material.minorCategory}`);
  if (!matches.length) return null;
  const minor = matches[0];
  if (!materialMajorCategories.some(major => major.code === minor.majorCode && major.name === minor.majorName)) throw new Error(`分类来源大类不一致：${minor.majorCode}`);
  return { majorCode: minor.majorCode, minorCode: minor.code };
}
export function categoryOptions(materialRows) {
  const majors = new Set(materialRows.map(row => row.majorCategory));
  return materialMinorCategories.filter(row => majors.has(row.majorName) && row.status === '启用').map(row => ({
    value: `${row.majorName}|${row.name}`, label: `${row.code}.${row.name}`, parent: row.majorName,
    parentCode: row.majorCode, code: row.code,
  }));
}
