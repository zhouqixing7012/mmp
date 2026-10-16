import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';

// 以下单号、状态、关联关系均为交易演示；物料和仓库的属性保持参考目录整行一致。
const material = materialCatalog.find(row => row.materialCode === '112002002237001');
const accessory = materialCatalog.find(row => row.materialCode === '333006614002000');
const warehouse = warehouseCatalog.find(row => row.warehouseCode === 'I0001');
if (!material || !accessory || !warehouse) throw new Error('员工申请演示缺少指定基础资料');
const company = warehouse.company;
const people = {
  sender: { account: '114111', name: '114111.杨芊', company, subsidiary: '集团', department: 'D0001.集团总部', phone: '010-88881111', email: '' },
  receiver: { account: '213852', name: '213852.孙志强', company, subsidiary: '集团', department: 'D0002.财务中心', phone: '010-88882852', email: 'sunzhiqiang@sohu-inc.com' },
};
function approval(id, state) {
  const final = state === '已完成' || state === '已驳回';
  return [
    { id: id + '-submitted', sequence: '1', node: '提交申请', approver: people.sender.name, agent: '', status: '已提交', time: '2026-10-12 09:00:00', opinion: '' },
    { id: id + '-leader', sequence: '2', node: '主管审批', approver: '206984.何文', agent: '', status: state === '已驳回' ? '已驳回' : final ? '已同意' : '待审批', time: final ? '2026-10-13 10:00:00' : '', opinion: state === '已驳回' ? '请核对资产用途后重新申请' : '' },
    ...(state === '已完成' ? [{ id: id + '-receive', sequence: '3', node: '接收确认', approver: people.receiver.name, agent: '', status: '已完成', time: '2026-10-14 15:00:00', opinion: '已确认接收' }] : []),
  ];
}
function line(id, index) {
  return { id: id + '-line-' + index, tag: '000081' + String(index).padStart(4, '0'), sn: 'EMP-DEMO-SN-' + index, material,
    quantity: 1, status: '在用-使用中', purpose: '员工用机', company, city: warehouse.city, building: warehouse.building, floor: warehouse.floor,
    warehouse: warehouse.warehouseCode + '.' + warehouse.warehouseDescription, enabledDate: '2026-09-01', module: '', note: '员工申请交易演示', consumableInfo: '', materialNote: '',
    accessories: index % 2 ? [{ id: id + '-accessory-' + index, tag: 'EMP-ATTACH-' + index, material: accessory, quantity: 1 }] : [] };
}
function record(kind, index, state) {
  const transfer = kind === 'transfer', id = kind + '-employee-' + index;
  const createdAt = '2026-10-' + String(10 + index).padStart(2, '0') + ' 09:00:00';
  const applicationNo = (transfer ? 'ETA' : 'EXCHANGE') + '-DEMO-202610-' + index;
  const executionNo = state === '已完成' ? (transfer ? 'ZY' : 'GH') + '-DEMO-202610-' + index : '';
  const lines = [line(id, index * 10 + 1), line(id, index * 10 + 2)];
  const values = { applicationNo, transferNo: transfer ? executionNo : '', replacementNo: transfer ? '' : executionNo, status: state,
    applicant: people.sender.name, company, sender: people.sender.name, sourceCompany: company, receiver: people.receiver.name,
    targetCompany: company, createdAt, transferType: '一般转移', replacementType: '', quantity: lines.reduce((sum, item) => sum + item.quantity, 0),
    reason: transfer ? '工作需要' : '设备无法正常使用，申请更换', usage: '工作', department: people.sender.department };
  return { id, kind, createdAt, access: { applicant: people.sender.account, department: people.sender.department, company, ledger: '资产台账' }, statusCode: state, values, historyPrepared: true, history: approval(id, state), lines,
    sourcePerson: people.sender, targetPerson: people.receiver,
    filters: { applicationNo, transferNo: values.transferNo, replacementNo: values.replacementNo, status: state, sender: people.sender.account,
      receiver: people.receiver.account, sourceSubsidiary: people.sender.subsidiary, sourceDepartment: people.sender.department,
      applicant: people.sender.account, subsidiary: people.sender.subsidiary, department: people.sender.department, createdAt, assetTag: lines.map(item => item.tag) },
    lookupLabels: { sender: people.sender.name, receiver: people.receiver.name, applicant: people.sender.name },
    head: Object.entries({ '申请人': people.sender.name, '更换类型': values.replacementType, '更换原因': values.reason,
      '申请时间': createdAt, '联系电话': people.sender.phone, '邮箱': people.sender.email, '部门': people.sender.department, '公司': company }),
    pendingLines: !transfer && state === '已完成' ? [line(id + '-issued', index * 10 + 3)] : [],
    identification: !transfer && state === '已完成' ? { result: '资产更换', explanation: '设备故障，已确认需要更换' } : { result: '', explanation: '' },
    source: { transactional: '员工转移／更换申请演示，非生产记录', materials: 'materialCatalog', warehouses: 'warehouseCatalog', types: '更换类型完整枚举尚未提供，缺失保留空白', organization: '集团与演示人员的关联仅为明确交易演示，不代表真实公司或仓库组织映射' } };
}
export const employeeApplicationRows = ['transfer', 'replacement'].flatMap(kind => [record(kind, 1, '处理中'), record(kind, 2, '已完成'), record(kind, 3, '已驳回')]);
