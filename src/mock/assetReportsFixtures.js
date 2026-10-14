import { materialCatalog } from './reference/materialCatalog';
import { findMaterialCategory } from './reference/materialCategoryMapping';
import { warehouseCatalog } from './reference/warehouseCatalog';

// 基础属性逐行取自用户提供的目录；编号、金额和流程日期是明确的业务演示记录。
export const assetMaterials = materialCatalog.filter(row => row.materialType === '资产');

const reportAssetCodes = ['113014107010000', '113020011242010', '113004011287002', '112002002237001', '112001055268001', '115005118029000'];
const reportAssetMaterials = reportAssetCodes.map(code => {
  const material = assetMaterials.find(row => row.materialCode === code);
  if (!material || !findMaterialCategory(material)) throw new Error(`演示物料分类未匹配：${code}`);
  return material;
});
export const consumableMaterials = ['耗材', '低值耐用品'].flatMap(type => materialCatalog.filter(row => row.materialType === type).slice(0, 3));
export const reportWarehouses = ['I0001', 'I3001', 'I3002'].map(code => warehouseCatalog.find(row => row.warehouseCode === code));
export const consumableWarehouses = ['I1001', 'I3011', 'I1007'].map(code => warehouseCatalog.find(row => row.warehouseCode === code));
const people = [{ code: '220784', name: '周琦星' }, { code: '215410', name: '卢铭华' }, { code: '130113', name: '李琴宝' }];
export const scopeOf = warehouse => warehouse.company.startsWith('115.') ? '上海媒体' : warehouse.company.startsWith('116.') ? '广州媒体' : '集团';
export function fixture(id, material, warehouse, overrides = {}, metadata = {}) {
  const scope = scopeOf(warehouse), person = people[scope === '集团' ? 0 : scope === '上海媒体' ? 1 : 2];
  const companyCode = warehouse.company.split('.')[0];
  const department = `演示组织.${scope}.员工服务中心.资产组.台账组.报表组`;
  const tag = `${material.materialType === '资产' ? 'REPORT' : 'CONSUM'}-${id}`;
  const values = {
    '库房': `${warehouse.warehouseCode}.${warehouse.warehouseDescription}`, '仓库': `${warehouse.warehouseCode}.${warehouse.warehouseDescription}`,
    '资产总类': material.materialType, '资产大类': material.majorCategory, '资产小类': material.minorCategory,
    '资产小类A': material.minorCategory.split('-')[0], '资产小类明细': material.minorCategory.includes('-') ? material.minorCategory.slice(material.minorCategory.indexOf('-') + 1) : '',
    '资产标签号': tag, '耗材标签号': material.materialType === '低值耐用品' ? tag : '', '序列号': `DEMO-SN-${id}`,
    '资产说明': material.materialDescription, '品牌': material.brand, '型号': material.materialDescription.includes('.') ? material.materialDescription.slice(material.materialDescription.indexOf('.') + 1) : '',
    '级别': material.level, '配置': material.config, '单位': material.unit, '数量': 1,
    '采购日期': '2026-09-01', '启用日期': '2026-09-02', '原值': 1000, 'EBS资产原值': 1000,
    '是否有差异': '否', '累计折旧': 100, '净值': 900, '折旧年限': 3, '折旧月数': 36, '折旧剩余月份': 32,
    '资产用途': '员工用机', '使用说明': '日常办公', '资产状态': '在用-使用中', '资产标记': '员工资产',
    '资产责任人工号': person.code, '资产责任人姓名': person.name,
    '资产责任人编号': person.code, '资产责任人': person.name,
    '成本中心': 'CC-REPORT.员工服务中心', '公司': warehouse.company,
    '财务核算板块': '17.Corporate', '资产所属板块': '17.Corporate', '板块': '17.Corporate', '费用账户': '演示费用账户',
    '子公司': warehouse.company, 'HR一级部门': '员工服务中心', 'HR二级部门': '资产组', 'HR三级部门': '台账组', 'HR四级部门': '报表组',
    'City': warehouse.city, 'Building': warehouse.building, 'Floor': warehouse.floor,
    'NO位置': '', '服务': '', '资产账簿': '演示资产账簿', '资产编号': `EBS-DEMO-${id}`,
    '申请单号': `APP-DEMO-${id}`, 'PO单号': '', 'PR单号': '', '入库单号': `IN-DEMO-${id}`,
    '批次号': `BATCH-DEMO-${id}`, '新增类型': '采购新增', '主资产标签号': '', '物料编码': material.materialCode,
    '报废类型': '', '报废日期': '', '报废原因': '', 'ES实物报废期': '', '升级金额': null, '升级日期': '', '备注': '报表演示记录',
    ...overrides,
  };
  values['是否有差异'] = values['原值'] == null || values['原值'] === '' || values['EBS资产原值'] == null || values['EBS资产原值'] === '' ? null : values['原值'] - values['EBS资产原值'] === 0 ? '否' : '是';
  const filters = {
    ...values, '公司': companyCode, '资产类别': `${material.majorCategory}|${material.minorCategory}`,
    '耗材类别': `${material.majorCategory}|${material.minorCategory}`, '资产责任人工号': values['资产责任人工号'],
    '仓库': warehouse.warehouseCode, 'HR部门': department, '部门': department,
    '资产配置': values['配置'], '资产用途': '70', '报废状态': values['报废日期'] ? '已报废' : '未报废',
    'PR单号': values['PR单号'], '资产所属板块': '17', '板块': '17', '成本中心': 'CC-REPORT', '用途': '70', '耗材说明': values['资产说明'], '耗材状态': values['资产状态'],
    '当前责任人': person.code, '购买日期': values['采购日期'],
  };
  const category = findMaterialCategory(material);
  const row = { id, values, filters, exports: { ...values, '责任人编号': values['资产责任人工号'], '责任人姓名': values['资产责任人姓名'], 'PR单编号': values['PR单号'] }, scope, kind: material.materialType,
    documentStatus: '已完成', sort: { majorCode: category?.majorCode ?? null, minorCode: category?.minorCode ?? null,
      companyCode, plateCode: '17', tag: values['资产标签号'], processedAt: '2026-10-01 10:00:00', retiredDate: values['报废日期'], applyDate: values['申请日期'] },
    sortCodeSource: '用户上传物料大类与小类表，名称在同一大类精确匹配', sortMappingError: category ? null : `分类未精确匹配：${material.materialCode}/${material.majorCategory}/${material.minorCategory}`, organizationSource: '报表演示层级，非正式组织映射', lookupLabels: { '资产责任人工号': `${person.code}.${person.name}`, '当前责任人': `${person.code}.${person.name}`, 'HR部门': department, '部门': department }, ...metadata };
  return row;
}
export function completedSnapshot(row, type) {
  const snapshot = Object.freeze({ ...row.values });
  return { ...row, snapshotType: type, snapshot, values: snapshot, exports: snapshot };
}
// 仅资产明细的展示源：用户财务示例与独立组织演示，不代表生产财务或组织对应关系。
export const assetReportPresentationSource = Object.freeze({
  finance: Object.freeze({ account: '112.16.909003.72101.E2104.0.0.0.0', book: 'FA_BOOK_SOHU', firstAssetNumber: '100067249', source: '用户给定财务字段格式示例' }),
  organization: Object.freeze({ subsidiaries: Object.freeze(['集团', '媒体', '焦点', '视频']),
    hr1: Object.freeze({ code: 'D0001', name: '集团总部' }), hr2: Object.freeze({ code: 'D0002', name: '财务中心' }),
    source: 'src/mock/businessRulesMock.js的mockDepartments既有演示记录；级次关系仅本报表示例，非真实映射' }),
  retirementTypes: Object.freeze(['已到报废期', '未到报废期', '丢失']),
});
export const reportAssets = reportWarehouses.flatMap((warehouse, group) => reportAssetMaterials.map((material, index) => {
  const { finance, organization, retirementTypes } = assetReportPresentationSource;
  const subsidiary = organization.subsidiaries[index % organization.subsidiaries.length];
  const department = `演示组织.${subsidiary}.${organization.hr1.name}.${organization.hr2.name}.台账组.报表组`;
  const row = fixture(`asset-${group}-${index}`, material, warehouse, {
    ...(index === 1 ? { '原值': 1100, '累计折旧': 150, '净值': 850, '升级日期': '2026-09-20', '升级金额': 1234.56 } : {}),
    '费用账户': finance.account, '资产账簿': finance.book, '资产编号': String(Number(finance.firstAssetNumber) + group * 100 + index),
    '子公司': subsidiary, 'HR一级部门': `${organization.hr1.code}.${organization.hr1.name}`,
    'HR二级部门': `${organization.hr2.code}.${organization.hr2.name}`,
    '报废类型': index < 3 ? '' : retirementTypes[index - 3],
  }, { presentationSource: assetReportPresentationSource, organizationSource: organization.source });
  Object.assign(row.filters, { 'HR部门': department, '部门': department });
  Object.assign(row.lookupLabels, { 'HR部门': department, '部门': department });
  row.exports = { ...row.exports, ...row.values };
  return row;
}));
export const reportConsumables = consumableWarehouses.flatMap((warehouse, group) => consumableMaterials.slice(0, 6).map((material, index) => {
  const row = fixture(`consumable-${group}-${index}`, material, warehouse, {
  '耗材标签号': material.materialType === '低值耐用品' ? `CONSUM-${group}-${index}` : '', '资产标签号': material.materialType === '低值耐用品' ? `CONSUM-${group}-${index}` : '',
  '原值': 100, '净值': null, 'EBS资产原值': null, '累计折旧': null, '折旧月数': null, '折旧年限': null, '折旧剩余月份': null,
  '领用单号': material.materialType === '耗材' ? `CLAIM-CONSUM-${group}-${index}` : '', '数量': material.materialType === '耗材' ? 3 : 1,
}, { grain: material.materialType === '低值耐用品' ? '耗材卡片.耗材标签号' : '耗材领用单.物料' });
  row.exports['库房'] = warehouse.warehouseDescription;
  return row;
}));
export const addedAssets = reportWarehouses.flatMap((warehouse, group) => ['新增入库', '采购接收', '自购入库'].map((type, index) => completedSnapshot(fixture(`add-${group}-${index}`, assetMaterials[index], warehouse, {
  '税金': 130, '含税金额': 1130, '入库类型': type, '新增类型': '采购新增',
  'PO单号': type === '采购接收' ? `PO-DEMO-${group}-${index}` : '',
}), '入库完成')));
addedAssets.push({ ...fixture('add-pending', assetMaterials[0], reportWarehouses[0], { '入库类型': '新增入库' }), documentStatus: '待执行' });
// 字段结构复用现有账面报废模型：已完成单据的assetsSnapshot保存金额，不在报表分摊。
export const retiredAssets = reportWarehouses.map((warehouse, group) => {
  const retirementSource = { ebsOriginalValue: 1200, assetSystemOriginalValue: 1400 };
  const tag = `REPORT-retired-${group}`;
  const accountingDetail = Object.freeze({ tagNo: tag, materialCode: assetMaterials[group].materialCode,
    cardQuantity: group === 0 ? 4 : 1, requestedScrapQuantity: 1, quantity: 1,
    detailScrapMethod: group === 0 ? '部分报废' : '全部报废', originalValue: group === 0 ? 300 : 1200, netValue: group === 0 ? 75 : 0 });
  const accountingSource = { applicationNo: `ZMBF-REPORT-DEMO-${group}`, documentStatus: '已完成',
    source: '对应报表标签的账面报废交易演示，沿用现有assetsSnapshot模型', assetsSnapshot: Object.freeze([accountingDetail]) };
  return completedSnapshot(fixture(`retired-${group}`, assetMaterials[group], warehouse, {
    '原值': retirementSource.ebsOriginalValue, 'EBS资产原值': retirementSource.ebsOriginalValue, '净值': 0, '累计折旧': 1200,
    '资产状态': group % 2 ? '已报废-已处置' : '已报废-待处置', '报废数量': 1,
    '报废原值': accountingDetail.originalValue, '报废净值': accountingDetail.netValue, '报废类型': accountingDetail.detailScrapMethod,
    '报废原因': '实物损坏', '报废日期': `2026-10-0${group + 1}`,
  }, { statusCode: group % 2 ? '14' : '13', deleted: 'N', retirementSource, accountingSource }), '报废完成');
});
