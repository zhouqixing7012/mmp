import { materialCatalog, MATERIAL_CATALOG_SOURCE } from '../mock/reference/materialCatalog';
import { classifyInventoryReportAsset } from './inventoryReportClassification';

const normalizedCategory = category => category === '笔记本及配件' ? '笔记本'
  : category === '照摄像器材及配件' ? '照摄像器材' : category;

// 从已有物料组合的真实整行单位解析，不把报表类别或物料大类本身当作单位目录。
export function resolveInventoryReportQuantityUnit(category, materials = materialCatalog) {
  const target = normalizedCategory(category);
  const matches = materials.filter(material => material.materialType === '资产'
    && material.status === '启用' && classifyInventoryReportAsset(material).category === target);
  const units = [...new Set(matches.map(material => String(material.unit || '').trim()).filter(Boolean))];
  const resolved = units.length === 1 && matches.every(material => String(material.unit || '').trim());
  return {
    quantityUnit: resolved ? units[0] : null,
    quantityUnits: units,
    quantityUnitStatus: !matches.length || !units.length ? 'missing' : resolved ? 'resolved' : 'mixed',
    quantityUnitSource: MATERIAL_CATALOG_SOURCE.sourceFile,
    quantityUnitMaterialCodes: matches.map(material => material.materialCode),
  };
}

export function withInventoryReportQuantityUnits(distribution) {
  return distribution.map(row => {
    const resolved = resolveInventoryReportQuantityUnit(row.category);
    // 用户已确认混合单位类别按件计数；缺少物料覆盖不等于混合，不据此补默认单位。
    const mixedCount = resolved.quantityUnitStatus === 'mixed' && resolved.quantityUnits.length > 1;
    // 本轮用户明确车辆显示“辆”、电话显示“部”。电话尚未覆盖于67行参考抽样中，
    // 车辆参考含汽车“辆”和装载机“台”；保留来源差异，不能伪称目录中整个类别只有一种单位。
    const confirmedUnit = row.category === '车辆' ? '辆' : row.category === '电话' ? '部' : null;
    return { ...row, ...resolved, ...(mixedCount ? { quantityUnit: '件', quantityUnitStatus: 'mixed-count' } : {}), ...(confirmedUnit ? {
      quantityUnit: confirmedUnit,
      quantityUnitStatus: 'user-confirmed',
      quantityUnitConfirmation: '本轮用户明确的报表类别展示单位',
    } : {}) };
  });
}
