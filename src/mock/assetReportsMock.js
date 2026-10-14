import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';
import { DEFAULT_ASSET_MAINTENANCE_ROWS } from './assetManagementMock';
import { DEFAULT_CONSUMABLE_MAINTENANCE_ROWS } from './consumableMaintenanceMock';

// 报表为产品演示快照。基础物料、仓库沿用真实目录；交易字段沿用本项目演示卡片。
// 报表源没有定义的字段留空，不由当前卡片推断采购金额、审批状态或领用标记。
function cardSnapshot(card, consumable = false) {
  const minor = card.minorCategory || '';
  const values = {
    '仓库': card.warehouse, '资产大类': card.majorCategory, '资产小类': minor,
    '资产小类A': minor.split('-')[0], '资产小类明细': minor.split('-')[1],
    '资产标签号': card.tag, '耗材标签号': card.tag, '序列号': card.serialNumber,
    '品牌': card.brand, '型号': card.model, '级别': card.level, '资产说明': card.assetDesc,
    '配置': card.config, '备注': card.remarks, '数量': card.quantity, '单位': card.unit,
    '采购日期': card.purchaseDate, '启用日期': card.enabledDate,
    '原值': card.originalValue, 'EBS资产原值': card.ebsOriginalValue, '净值': card.ebsNetValue,
    '折旧月数': card.depreciationYears == null ? null : card.depreciationYears * 12,
    '资产用途': card.purpose, '使用说明': card.usageDescription, '资产状态': card.status,
    '资产标记': card.assetMark, '责任人编号': card.ownerId, '责任人姓名': card.ownerName,
    '资产责任人编号': card.ownerId, '资产责任人': card.ownerName,
    '成本中心': card.costCenter, '公司': consumable ? card.company : `${card.companyCode}.${card.company}`,
    '资产所属板块': card.plate, '板块': card.plate, '业务线': card.businessLine,
    '项目': card.project, '费用账户': card.feeAccount, 'HR一级部门': card.department,
    'City': card.city, 'Building': card.building, 'Floor': card.floor, 'NO位置': card.noLocation,
    '服务': card.service, '资产编号': card.assetNo, '申请单号': card.applicationNo,
    'PO单号': card.poNo, 'PR单编号': card.prNo, '入库单号': card.inboundNo,
    '新增类型': card.addType, '主资产标签号': card.mainTag, '折旧年限': card.depreciationYears,
    '折旧剩余月份': card.remainingMonths, '升级日期': card.upgradeDate,
    '升级金额': card.upgradeAmount, 'ES实物报废期': card.esScrapPeriod,
    '报废日期': card.scrapDate || card.scrapInfo?.date,
    '报废原因': card.scrapReason || card.scrapInfo?.reason,
    '报废类型': card.scrapType || card.scrapInfo?.type,
    '报废数量': card.scrapInfo?.quantity ?? card.quantity,
  };
  // 耗材列表没有独立的当前价值演示字段，保持空值。
  const filters = { ...values, '公司': card.companyCode, '责任人编号': card.ownerId,
    '资产类别': `${card.majorCategory}|${card.minorCategory}`, 'HR部门': card.department, '报废状态': values['报废日期'] ? '已报废' : '未报废',
    '资产种类': consumable ? '2' : '1' };
  const exports = { ...values, '公司': `${card.companyCode}.${card.company}`,
    '库房': card.warehouse, '资产小类明细': minor.includes('-') ? minor.slice(minor.indexOf('-') + 1) : minor };
  return { id: card.id, values, filters, exports, updatedAt: card.updatedAt, departmentPath: card.department };
}
const assets = DEFAULT_ASSET_MAINTENANCE_ROWS.map(card => cardSnapshot(card));
const consumables = DEFAULT_CONSUMABLE_MAINTENANCE_ROWS.map(card => cardSnapshot(card, true));
const transactions = DEFAULT_ASSET_MAINTENANCE_ROWS.flatMap(card => (card.transactionHistory || []).map(event => ({
  id: event.id, values: {
    '事务处理日期': event.operationDate, '单据编号': event.documentNo, '单据类型': event.operationType,
    '事务类型': event.operationType, '申请单号': event.applicationNo, '资产标签号': event.tag,
    'SN号': event.serialNumber, '资产说明': event.assetDesc, '资产状态': event.status,
    '现资产责任人': event.owner, '现资产责任人部门': event.department,
    '公司': event.company, '创建人': event.operator, '使用说明': event.usageDescription, '备注': event.remarks,
  }, filters: { '单据编号': event.documentNo, '单据类型': event.operationType, '事务类型': event.operationType,
    '资产标签号': event.tag, '资产说明': event.assetDesc, '事务处理日期': event.operationDate,
    '资产状态': event.status, '创建人': event.operator, '公司': event.company?.split('.')[0] },
})));

// 其余报表使用明确的独立演示记录，绝不把资产卡片当作真实报表源。
function reportFixture(id, material, warehouse, overrides) {
  const values = {
    '仓库': warehouse.warehouseDescription, '资产种类': '资产',
    '资产大类': material.majorCategory, '资产小类': material.minorCategory,
    '品牌': material.brand, '级别': material.level, '资产说明': material.materialDescription,
    '配置': material.config, '单位': material.unit, '公司': warehouse.company,
    'City': warehouse.city, 'Building': warehouse.building, 'Floor': warehouse.floor,
    '物料编码': material.materialCode, '物料名称': material.materialDescription,
    ...overrides,
  };
  return { id, values, filters: { ...values, '公司': warehouse.company.split('.')[0],
    '资产类别': `${material.majorCategory}|${material.minorCategory}` }, exports: { ...values } };
}
const assetMaterial = materialCatalog.filter(m => m.materialType === '资产');
const consumableMaterial = materialCatalog.filter(m => m.materialType !== '资产');
const warehouse = warehouseCatalog.find(w => w.warehouseCode === 'I0001');
const consumableWarehouse = warehouseCatalog.find(w => w.warehouseCode === 'I1001');
const fixtures = Array.from({ length: 12 }, (_, index) => {
  const m = assetMaterial[index % assetMaterial.length];
  return reportFixture(`report-demo-${index + 1}`, m, warehouse, {
    '申请单号': `CA202610${String(index + 1).padStart(4, '0')}`, '申请日期': '2026-10-01',
    '资产标签号': `REPORT2026${String(index + 1).padStart(4, '0')}`, '序列号': `REPORT-SN-${index + 1}`,
    '申请人': '213852.孙志强', '申请人部门': '集团.员工服务中心.资产部',
    '申请人部门名称': '集团.员工服务中心.资产部', '申请人办公区': '北京-搜狐媒体大厦',
    '申请数量': 2, '数量': 1, '统一申请单状态': index < 6 ? '处理中' : '已完成',
    '申请原因': '日常办公使用', '详细说明': '办公设备配置', '是否超标描述': '否',
    '物资大类名称': m.majorCategory, '资产小类名称': m.minorCategory,
    '物资总类名称': '资产', '物资总类': '资产', '是否弃领': index < 6 ? '' : '否',
    '是否刷卡领用': index < 6 ? '' : '是', '汇总提交人名称': index < 6 ? '' : '213852.孙志强',
  });
});
fixtures.forEach(row => Object.assign(row.filters, { '申请人工号': '213852', '超标标记': 'N',
  '申请人部门': row.values['申请人部门'], 'HR部门': row.values['申请人部门'] }));
const newEmployees = assetMaterial.slice(0, 3).map((m, index) => reportFixture(`new-${index}`, m, warehouse, {
  '员工编号': '213852', '员工姓名': '孙志强', '入职日期': '2026-09-01',
  'PS配置': m.config, '办公地点': '北京-搜狐媒体大厦', '数量': 1,
  '资产标签号': `NEW2026${index + 1}`, '原值': null,
}));
newEmployees.forEach(row => Object.assign(row.filters, { '查询入职日期': '2026-08-25', '员工内部ID': '213852' }));
const added = assetMaterial.slice(0, 12).map((m, index) => reportFixture(`inbound-${index}`, m, warehouse, {
  '资产标签号': `ADD2026${index + 1}`, '数量': 1, '采购日期': '2026-10-01', '启用日期': '2026-10-02',
  '原值': 1000, '税金': 130, '含税金额': 1130, '入库来源类型': index % 2 ? '采购收货' : '新增',
  '入库单号': `PI202610${index + 1}`, '责任人编号': '213852', '责任人姓名': '孙志强',
}));
added.forEach(row => {
  Object.assign(row.filters, { '资产种类': '1', '查询原值': 1000, '查询级别': row.values['级别'] });
  Object.assign(row.exports, { '公司': warehouse.company.split('.').slice(1).join('.'), '仓库':     `${warehouse.warehouseCode}.${warehouse.warehouseDescription}` });
});
const consumableClaims = consumableMaterial.slice(0, 12).map((m, index) => reportFixture(`consum-apply-${index}`, m, consumableWarehouse, {
  '申请单号': `CO202610${index + 1}`, '申请日期': '2026-10-01 09:00:00', '申请人': '213852',
  '统一申请单状态': index % 2 ? '已完成' : '处理中', '物资总类名称': m.materialType,
  '耗材大类名称': m.majorCategory, '耗材小类名称': m.minorCategory,
  '领用数量': index % 2 ? 2 : null, '是否弃领': index % 2 ? '否' : '',
  '是否刷卡领用': index % 2 ? '是' : '', '申请人部门名称': '集团.员工服务中心.资产部',
  '申请人办公区': '北京-搜狐媒体大厦',
}));
consumableClaims.forEach(row => Object.assign(row.filters, { '申请人工号': '213852', '申请人部门': row.values['申请人部门名称'] }));
const consumableResults = consumableMaterial.slice(0, 12).map((m, index) => reportFixture(`consum-result-${index}`, m, consumableWarehouse, {
  '耗材物料编码': m.materialCode, '耗材物料描述': m.materialDescription,
  '耗材标签号': `CONS2026${index + 1}`, '耗材大类': m.majorCategory, '耗材小类': m.minorCategory,
  '总类': m.materialType, '耗材数量': 2, '耗材公司': consumableWarehouse.company.split('.').slice(1).join('.'),
  '申请人': '孙志强', '申请单号': `CO202610${index + 1}`, '是否领用': index % 2 ? '是' : '否',
  '是否占用': index % 2 ? '否' : '是', '耗材责任人': '213852.孙志强',
}));
consumableResults.forEach(row => Object.assign(row.filters, { '资产标签号': row.values['耗材标签号'],
  '耗材公司': consumableWarehouse.company.split('.')[0], '耗材责任人查询': '213852孙志强' }));
const scrapRows = [
  ...assets.filter(row => row.values['报废日期']).map(row => ({ ...row, statusCode: '13', deleted: 'N' })),
  { ...reportFixture('scrap-consumable', consumableMaterial[0], consumableWarehouse, {
    '报废日期': '2026-10-01', '报废数量': 1, '数量': 1, '资产标签号': 'SCRAP-CONS2026001',
  }), statusCode: '14', deleted: 'N' },
];
scrapRows.forEach(row => { row.filters['资产种类'] = row.id === 'scrap-consumable' ? '2' : '1'; });
export const assetReportRows = {
  'report-1-1': assets, 'report-2-1': consumables, 'report-3-1': transactions,
  'report-4-1': newEmployees, 'report-5-1': added,
  'report-6-1': fixtures, 'report-6-2': fixtures.map(row => ({ ...row, id: `purchase-${row.id}` })),
  'report-7-1': consumableClaims, 'report-7-2': consumableResults,
  'report-8-1': scrapRows,
};
export const assetReportCatalog = { materials: materialCatalog, warehouses: warehouseCatalog };
