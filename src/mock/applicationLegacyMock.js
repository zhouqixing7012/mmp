import { mockDocumentNumber } from './documentNumbers';
import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';

// 单据、标签、数量及日期均为交易演示；物料与仓库固定属性始终取真实目录整行。
export const LEGACY_APPLICATION_SOURCE = { transactional: '申请菜单交互演示，非生产单据', materials: 'materialCatalog', warehouses: 'warehouseCatalog', status: '缺少运行字典，不推断未知编码名称', organization: '部门名称复用已有 D0002.财务中心；子公司集团及人员组织关联仅为交易演示，非真实人事归属', warehouseSettings: '源目录未提供库区、货位启用开关；未提供时不展示对应接收字段' };
function requiredRow(rows, key, value) {
  const row = rows.find(item => item[key] === value);
  if (!row) throw new Error('申请演示缺少基础资料：' + value);
  return row;
}
const asset = requiredRow(materialCatalog, 'materialCode', '112002002237001');
const accessory = requiredRow(materialCatalog, 'materialCode', '333006614002000');
const from = requiredRow(warehouseCatalog, 'warehouseCode', 'I0001');
const warehouseText = row => row.warehouseCode + '.' + row.warehouseDescription;
const person = '213852.孙志强';
const employee = { applicant: person, department: 'D0002.财务中心', officeArea: '', phone: '010-88882852', email: 'sunzhiqiang@sohu-inc.com', company: from.company, subsidiary: '集团' };
const asPairs = value => Object.entries(value);
function history(id, complete) {
  return [
    { id: id + '-h1', sequence: '1', node: '提交申请', approver: '213852-孙志强', status: '已提交', time: '2026-10-12', opinion: '' },
    { id: id + '-h2', sequence: '2', node: '主管审批', approver: '206984-何文', status: complete ? '已同意' : '待审批', time: complete ? '2026-10-13' : '', opinion: '' },
  ];
}
function baseLine(id, material, warehouse, quantity = 1) {
  return { id, material, warehouse, quantity, tag: material.materialType === '资产' ? '0000672' + id : '', sn: material.materialType === '资产' ? 'DEMO-SN-' + id : '', enabledDate: '2026-09-01', status: material.materialType === '资产' ? '在库-再利用' : '', mark: material.materialType === '资产' ? '员工资产' : '', note: '申请菜单交易演示', attachments: [], repairs: [], accessories: [] };
}
function assetInfo(line) {
  const m = line.material, w = line.warehouse, isAsset = m.materialType === '资产';
  return asPairs({ '资产标签号': isAsset ? line.tag : '', 'SN号': isAsset ? line.sn : '', '物资说明': m.materialDescription, '可用数量': isAsset ? line.quantity : 8, '物资总类': m.materialType, '物资大类': m.majorCategory, '物资小类': m.minorCategory, [isAsset ? '资产数量' : '在库数量']: isAsset ? line.quantity : 10, '仓库': warehouseText(w), '库区': '', '货位': '', '申请批次': 'DEMO-BATCH-20261001', '品牌': m.brand, '规格/型号': m.model, '配置': isAsset ? m.config : '', '计量单位': m.unit, '资产标记': isAsset ? line.mark : '', '原值': 1000, '净值': isAsset ? 900 : '', '资产状态': isAsset ? line.status : '', '公司': w.company, '板块': '', '部门': '', '成本中心': '', '业务线': '', '项目': '', '费用账户': '', '责任人': isAsset ? '213852-孙志强' : '', 'City': w.city, 'Building': w.building, 'Floor': w.floor, 'Room': '', '启用日期': line.enabledDate, '印刷号': '', '用途': isAsset ? '员工用机' : '', '备注': line.note });
}
function withDetail(line) { return { ...line, info: assetInfo(line) }; }

function ordinaryRecord(kind, index, state, extension = false) {
  const id = kind + '-' + index, complete = state === 'demo-completed';
  const line = withDetail(baseLine(index + '21', asset, from));
  line.accessories = [{ ...baseLine(index + '22', accessory, from, 1), tag: 'ATTACH-DEMO-' + index }];
  const second = withDetail(baseLine(index + '23', asset, from, 2));
  const createdAt = '2026-10-' + String(10 + index).padStart(2, '0') + ' 10:15:00';
  const applicationNo = mockDocumentNumber(kind === 'return' ? '员工退库申请' : extension ? '员工续借申请' : '员工借用申请', id, createdAt);
  const reason = kind === 'return' ? (index === 2 ? '离职归还' : '岗位设备调整') : extension ? '活动延长，需要继续使用' : '活动临时借用';
  const values = { applicationNo, inboundNo: complete && kind === 'return' ? mockDocumentNumber('入库单', id + '-inbound', '2026-10-14', from.company) : '', outboundNo: complete && kind === 'borrow' ? mockDocumentNumber('出库工单', id + '-outbound', '2026-10-14') : '', status: complete ? '已完成' : state === '0' ? '草稿' : '处理中', documentType: extension ? '续借' : '借用', applicant: person, createdAt, ...(kind === 'return' ? { applyTime: createdAt } : { applyDate: '2026-10-10' }), approver: '206984.何文', department: employee.department, subsidiary: employee.subsidiary, assetTag: line.tag, quantity: line.quantity + second.quantity, reason, compensation: '否', returnType: index === 2 ? '离职归还' : '资产退库' };
  const head = asPairs({ '申请人': employee.applicant, [kind === 'return' ? '申请时间' : '申请日期']: (kind === 'return' ? values.applyTime : createdAt).slice(0, 10), '公司': employee.company, '子公司': employee.subsidiary, '办公区': employee.officeArea, '联系电话': employee.phone, '邮箱': employee.email, '部门': employee.department, ...(kind === 'return' ? { '板块': '', '退库单号': applicationNo, '单据状态': values.status, '退库类型': values.returnType, 'MIS鉴定': asset.returnInspection, '退库原因': reason, '是否赔偿': values.compensation, '库管员': from.keeper } : {}) });
  const detailFor = line => extension ? asPairs({ '资产标签号': line.tag, '资产说明': asset.config, '续借次数': 1, '续借原因': reason, '续借开始日期': '2026-10-15', '续借归还日期': '2026-10-22' }) : asPairs({ '资产标签号': line.tag, [kind === 'return' ? 'SN号' : '序列号']: line.sn, '资产说明': asset.materialDescription, ...(kind === 'return' ? { '资产状态': line.status, '数量': line.quantity, '资产大类': asset.majorCategory, '资产小类': asset.minorCategory } : { '公司': from.company, '板块': '', '资产类别': asset.majorCategory + '.' + asset.minorCategory }), '配置': asset.config, '启用日期': line.enabledDate, '城市': from.city, '建筑': from.building, '楼层': from.floor || (kind === 'return' ? '缺省' : ''), '备注': line.note, '使用说明': reason, ...(kind === 'return' ? { '鉴定人': complete ? '213852.孙志强' : '', '鉴定日期': complete ? '2026-10-13' : '', '鉴定结果': complete ? '鉴定通过' : '', '鉴定说明': complete ? '外观及功能正常' : '' } : { '资产用途': '员工用机', '借用开始日期': '2026-10-12', '借用归还日期': '2026-10-15', '借用原因': reason, '需求说明': asset.config }) });
  line.detail = detailFor(line);
  second.detail = detailFor(second);
  const detail = line.detail;
  return { id, access: { applicant: '213852', department: employee.department, company: employee.company, ledger: '资产台账' }, kind, values, filters: { applicationNo, inboundNo: values.inboundNo, outboundNo: values.outboundNo, returnType: values.returnType, status: state, assetTag: [line.tag, second.tag], applicant: '213852', warehouse: from.warehouseCode, subsidiary: employee.subsidiary, department: employee.department, createdAt, ...(kind === 'return' ? { applyTime: values.applyTime } : {}), documentType: extension ? 'ERB' : 'EBA', description: [asset.materialDescription, asset.materialDescription] }, createdAt, statusCode: state, lookupLabels: { warehouse: warehouseText(from), subsidiary: employee.subsidiary, department: employee.department }, lines: [line, second], history: state === '0' ? [] : history(id, complete), head, detail, extension, source: LEGACY_APPLICATION_SOURCE };
}
export const legacyApplicationRows = [ordinaryRecord('return', 1, '0'), ordinaryRecord('return', 2, '3'), ordinaryRecord('return', 3, 'demo-completed'), ordinaryRecord('borrow', 1, '3'), ordinaryRecord('borrow', 2, 'demo-completed'), ordinaryRecord('borrow', 3, '3', true)];
