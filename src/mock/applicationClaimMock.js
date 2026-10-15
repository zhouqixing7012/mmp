import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';

// 单据、申请数量和流程为交易演示；物料及仓库关联属性按来源整行使用。
const warehouse = warehouseCatalog.find(row => row.warehouseCode === 'I0001');
const consumableWarehouse = warehouseCatalog.find(row => row.warehouseCode === 'I1001');
const assetMaterial = materialCatalog.find(row => row.materialCode === '112002002237001');
const consumableMaterial = materialCatalog.find(row => row.materialCode === '324001624003000');
const componentMaterial = materialCatalog.find(row => row.materialCode === '228001598002000');
if (!warehouse || !consumableWarehouse || !assetMaterial || !consumableMaterial || !componentMaterial) throw new Error('申请演示所需基础目录缺失');
// 在用资产按卡片记录条数统计，不按卡片数量累计。
const ledgerCards = [{ id: 'claim-ledger-1', responsibleAccount: '220784', minorCategory: assetMaterial.minorCategory, status: '6', quantity: 5 }, { id: 'claim-ledger-2', responsibleAccount: '220784', minorCategory: assetMaterial.minorCategory, status: '6', quantity: 1 }];
const people = { applicant: '220784-周琦星', manager: '213852-孙志强', es: '114111-杨芊' };
const record = (id, sequence, node, approver, status, time = '', opinion = '') => ({ id, sequence, node, approver, status, time, opinion });
const originalHistory = id => [record(id + '-1', '1', '提交申请', people.applicant, '已提交', '2026-10-13'), record(id + '-2', '2', '部门经理-审批', people.manager, '同意', '2026-10-14')];
const purchaseSections = id => [
  { title: '采购申请详情（此信息来源于采购系统）', records: [record(id + '-external1', '1', '询报价', people.es, '待审批')] },
  { title: 'PR单审批详情（此信息来源于PR系统）', records: [] },
  { title: '采购订单详情（此信息来源于采购系统）', records: [] },
];
function claim(kind, type, index) {
  const isConsumable = kind === 'consumable', purchase = type === 'PURCHASE', waiting = type === '';
  const material = isConsumable ? consumableMaterial : assetMaterial;
  const store = isConsumable ? consumableWarehouse : warehouse;
  const id = kind + '-' + index, applicationNo = (isConsumable ? 'CAC' : 'CAA') + '-DEMO-20261013-' + index;
  const subNo = waiting ? '' : (purchase ? 'SUMMARY' : 'USE') + '-DEMO-' + kind + '-' + index;
  const createdAt = '2026-10-' + (15 - index) + ' 09:30:00';
  const outboundNo = purchase || waiting ? '' : 'OS-DEMO-' + kind + '-' + index;
  const quantity = index === 1 ? 3 : 2, executedQuantity = index === 1 ? 2 : 1;
  const unitPrice = isConsumable ? 460 : 5800;
  const values = { subNo, subType: type === 'USE' ? '领用' : purchase ? '采购' : '', createdAt, applicant: people.applicant, department: '财务中心', applicationNo, outboundNo, node: waiting ? '待汇总' : purchase ? 'ES领导-审批' : '员工-领用', status: '3', approver: waiting ? '' : people.manager, overStandard: index === 1 ? '是' : '否', formalEmployee: '是', estimatedAmount: purchase ? unitPrice * quantity : null, summaryApplicant: purchase ? people.es : '', progress: '查看' };
  const head = { '当前仓库': purchase ? '' : store.warehouseCode + '.' + store.warehouseDescription, '申请人': people.applicant, '联系电话': '010-62720000', '邮箱': '', '公司': store.company, '办公区': '', '申请日期': createdAt.slice(0, 10), '成本中心': '', '部门': '财务中心', '匹配状态': type === 'USE' ? '库存领用' : purchase ? '统一采购' : '', '出库单号': outboundNo, '是否弃领': '' };
  const line = { id: id + '-line', material, materialClass: isConsumable ? '3' : '1', tag: purchase ? '' : '000' + (67001 + index), materialCode: material.materialCode, serialNo: purchase ? '' : 'DEMO-SN-' + id, componentQuantity: !isConsumable && type === 'USE' ? 1 : 0, quantity: executedQuantity, company: purchase ? '' : store.company, plate: purchase ? '' : '17.Corporate', enabledAt: purchase ? '' : '2026-09-02', actualDescription: purchase ? '' : material.materialDescription, configuration: purchase ? '' : material.config, remark: purchase ? '' : '交易演示资产', city: type === 'USE' ? store.city : '', building: type === 'USE' ? store.building : '', floor: type === 'USE' ? store.floor : '', assetPurpose: '员工用机', usage: '日常办公', requestedDescription: material.materialDescription, reason: '办公使用', detailDescription: '申请明细中的详细需求说明', components: !isConsumable && type === 'USE' ? [{ id: id + '-component', ...componentMaterial, quantity: 1 }] : [] };
  const summaryLines = [0, 1].map(offset => ({ id: id + '-summary-' + offset, applicant: people.applicant, department: '财务中心', originalDepartment: offset ? '法律中心' : '财务中心', applicationNo, materialCategory: material.minorCategory, materialDescription: material.materialDescription, configuration: material.config, purchaseQuantity: offset ? 1 : quantity, unitPrice, overStandard: offset === 0, reason: '办公使用', inUseCount: ledgerCards.filter(card => card.responsibleAccount === '220784' && card.minorCategory === material.minorCategory && card.status === '6').length, suggestion: '按审批结果采购', poNo: 'PO-DEMO-' + id, poStatus: offset ? '待下单' : '处理中' }));
  const history = [...originalHistory(id), ...(waiting ? [record(id + '-waiting', '3', 'ES采购汇总', people.es, '待汇总')] : [record(id + '-sub', '3', purchase ? 'ES采购汇总' : '员工-领用', purchase ? people.es : people.applicant, purchase ? '已汇总' : '待领用', purchase ? '2026-10-14' : '')])];
  return { id, kind, createdAt, statusCode: '3', values, filters: { ...values, statusCode: '3', applicant: '220784', department: 'D0002', approver: waiting ? '' : '213852', summaryApplicant: purchase ? '114111' : '', overStandard: index === 1 ? 'Y' : 'N', formalEmployee: '1', subType: type }, lookupLabels: { applicant: people.applicant, department: 'D0002.财务中心', approver: people.manager, summaryApplicant: people.es }, head, ledgerCards, originalQuantity: quantity, executedQuantity, unitPrice, lines: [line], history, historyPrepared: true, showFlowGraph: isConsumable && type === 'USE', progressSections: purchase ? purchaseSections(id) : [], progressTitle: purchase ? '资产申请详情（此信息来源于资产系统）' : '', source: '明确交易演示；部门取已有D0002记录，仅演示申请与当前部门，不代表正式人员组织映射', summary: purchase ? { esDescription: '按本批申请需求汇总', projectUsage: '部门日常办公', lines: summaryLines, references: isConsumable ? [] : [{ id: 'ref-' + id, category: material.minorCategory, currentQuantity: 5, currentPerPerson: 0.5, purchaseQuantity: 4, afterPerPerson: 0.9, companyPerPerson: 0.8 }], attachmentId: id + '-attachment', attachments: [{ id: id + '-file', name: '申请补充说明.txt', description: '本批申请用途说明（交易演示文件）', content: '交易演示附件：部门日常办公采购申请说明。' }] } : null };
}
function newEmployee(index) {
  const id = 'newEmployee-' + index, createdAt = '2026-10-' + (15 - index) + ' 10:00:00';
  const material = assetMaterial;
  return { id, kind: 'newEmployee', createdAt, statusCode: '3', values: { applicationNo: 'NEWEN-DEMO-' + index, applicationType: '新员工领用', status: '3', approver: people.manager, company: warehouse.company, plate: '17.Corporate', department: '财务中心', office: '', warehouse: warehouse.warehouseCode + '.' + warehouse.warehouseDescription, applicant: people.applicant, createdAt, configuration: 'CONFIG-DEMO-1' }, filters: { applicationNo: 'NEWEN-DEMO-' + index, applicant: '220784', statusCode: '3', company: warehouse.company.split('.')[0], plate: '17', department: 'D0002', office: '', majorCategory: material.majorCategory, warehouse: warehouse.warehouseCode, configuration: 'CONFIG-DEMO-1', createdAt }, head: { '申请单号': 'NEWEN-DEMO-' + index, '申请人': people.applicant, '单据状态': '3', '公司': warehouse.company, '板块': '17.Corporate', '成本中心': '', '业务线': '', '部门': '财务中心', '制单时间': createdAt.slice(0, 10), city: warehouse.city, Building: warehouse.building, floor: warehouse.floor, '单据类型': 'NEWEN', '领用单': 'OS-NEWEN-DEMO-' + index, '资产配置': 'CONFIG-DEMO-1', '仓库': warehouse.warehouseCode + '.' + warehouse.warehouseDescription, '备注': '新员工领用交易演示' }, lines: [{ id: id + '-line', tag: '000NEW' + index, serialNo: 'DEMO-NEW-SN-' + index, materialType: material.materialType, majorCategory: material.majorCategory, materialDescription: material.materialDescription, requestedQuantity: 2, receivedQuantity: index ? 1 : 2, assetStatus: '在用-使用中', prNo: 'PR-DEMO-' + index }], history: originalHistory(id), lookupLabels: { applicant: people.applicant, department: 'D0002.财务中心', company: warehouse.company, office: '', warehouse: warehouse.warehouseCode + '.' + warehouse.warehouseDescription }, source: 'NEWEN交易演示；基础目录属性读取整行；状态保留字典编码，未假定正式字典名称' };
}
export const claimApplicationRows = [...['asset', 'consumable'].flatMap(kind => [claim(kind, 'PURCHASE', 1), claim(kind, 'USE', 2), claim(kind, '', 3)]), newEmployee(0), newEmployee(1)];
