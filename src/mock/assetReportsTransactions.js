import { mockDocumentNumber } from './documentNumbers';
import definitions from '../pages/assetReports/reportDefinitions.json';
import { assetMaterials, reportWarehouses, fixture, completedSnapshot, retiredAssets } from './assetReportsFixtures';

const transactionOptions = definitions.find(row => row.id === 'report-3-1').filters.find(row => row.key === '事务类型').options;
const documentType = code => ['10', '13', '15', '30', '112', '113', '114', '115'].includes(code) ? '入库单'
  : ['20', '21'].includes(code) ? '出库单' : ['24', '25'].includes(code) ? '库存转移'
    : code === '40' ? '资产转移' : ['70', '71', '80', '81', '82'].includes(code) ? '资产报废' : '资产变更';
// 各类变更分别演示；不适用于当前事务的前后字段保持空值。
export const reportTransactions = transactionOptions.flatMap((option, index) => reportWarehouses.map((warehouse, group) => {
  const type = documentType(option.value);
  const values = { '事务处理日期': `2026-10-${String(14 - (index % 14)).padStart(2, '0')} 09:00:00`,
    '单据编号': ['70', '71'].includes(option.value) ? retiredAssets[group].accountingSource.applicationNo : `CHANGE-DEMO-${group}-${option.value}`, '单据类型': type, '事务类型': option.label,
    '事务执行人': '213852.孙志强', '业务原因': '演示已完成事务' };
  const ruleType = type === '入库单' ? '入库单' : type === '出库单' ? '出库工单'
    : type === '库存转移' ? '库存转移' : type === '资产转移' ? '资产转移'
      : type === '资产报废' ? '资产报废' : option.value === '104' ? '序列号变更'
        : option.value === '101' ? '资产升级' : option.value === '103' ? '延长报废期'
        : ['93', '105'].includes(option.value) ? '位置变更' : option.value === '92' ? '担保职责转移' : null;
  if (ruleType) values['单据编号'] = mockDocumentNumber(ruleType, `report-transaction-${group}-${option.value}`, values['事务处理日期'], warehouse.company);
  const accountingSource = ['70', '71'].includes(option.value) ? retiredAssets[group].accountingSource : null;
  if (accountingSource) {
    values['资产标签号'] = accountingSource.assetsSnapshot[0].tagNo;
    values['单据编号'] = accountingSource.applicationNo;
  }
  const pairs = {
    '104': { '原序列号': 'DEMO-SN-BEFORE', '现序列号': 'DEMO-SN-AFTER' },
    '110': { '原资产用途': '部门公用', '现资产用途': '员工用机' },
    '109': { '原成本中心': 'CC-BEFORE.原成本中心', '现成本中心': 'CC-AFTER.现成本中心' },
    '107': { '原使用说明': '原办公用途', '现使用说明': '现办公用途', '原备注': '原备注', '现备注': '现备注' },
    '108': { '原资产标记': '公共资产', '现资产标记': '员工资产' },
    '92': { '原资产担保人': '114111.杨芊', '现资产担保人': '213852.孙志强' },
  };
  Object.assign(values, pairs[option.value]);
  if (type === '库存转移') Object.assign(values, { '原仓库': `${warehouse.warehouseCode}.${warehouse.warehouseDescription}`, '现仓库': `${reportWarehouses[0].warehouseCode}.${reportWarehouses[0].warehouseDescription}` });
  if (type === '资产转移') Object.assign(values, { '原资产责任人': '114111.杨芊', '现资产责任人': '213852.孙志强',
    '原资产责任人部门': 'DEMO-ES.员工服务中心', '现资产责任人部门': 'DEMO-ASSET.员工服务中心.资产组' });
  if (['93', '105'].includes(option.value)) Object.assign(values, {
    '原City': warehouse.city, '原Building': warehouse.building, '原Floor': warehouse.floor,
    '现City': reportWarehouses[0].city, '现Building': reportWarehouses[0].building, '现Floor': reportWarehouses[0].floor,
  });
  if (option.value === '93') Object.assign(values, { '原NO位置': 'DEMO-NO-BEFORE', '现NO位置': 'DEMO-NO-AFTER' });
  const row = fixture(`transaction-${group}-${option.value}`, accountingSource ? assetMaterials[group] : assetMaterials[index % assetMaterials.length], warehouse, values, { documentStatus: '已处理', accountingSource, sourceDocumentName: accountingSource ? '账面报废单' : type });
  // 清空配置定义内不适用的条件列，使导出与页面具有同样的空值规则。
  definitions.find(item => item.id === 'report-3-1').columns.filter(item => /^[原现]/.test(item.key)).forEach(item => {
    if (!(item.key in values)) row.values[item.key] = '';
  });
  Object.assign(row.filters, { '单据类型': type, '事务类型': option.value, '事务执行人': '213852', '板块': '17', '资产所属板块': '17' });
  row.lookupLabels['事务执行人'] = '213852.孙志强'; row.sort.processedAt = values['事务处理日期'];
  return completedSnapshot(row, '变更完成');
}));
reportTransactions.push({ ...fixture('transaction-pending', assetMaterials[0], reportWarehouses[0]), documentStatus: '处理中' });
