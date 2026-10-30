import { mockDocumentNumber } from './documentNumbers';
import { warehouseCatalog } from './reference/warehouseCatalog';

// 交易与流程记录仅作申请查询原型演示；仓库/公司/地点保持参考目录的整行关联。
const warehouses = ['I0001', 'I3001', 'I3002'].map(code => {
  const row = warehouseCatalog.find(item => item.warehouseCode === code);
  if (!row) throw new Error(`申请演示仓库不存在：${code}`);
  return row;
});
const types = [['RETURN', '员工退库'], ['BORROW', '员工借用'], ['DRAW', '资产领用'], ['ASSET', '资产申请单'], ['CONSUMABLE', '耗材申请单'], ['REPLACEMENT', '资产维修更换'], ['REC', '资产接收'], ['ED', '员工确认']];
export const applicationUnfinishedRows = Array.from({ length: 18 }, (_, index) => {
  const warehouse = warehouses[index % warehouses.length];
  const [type, name] = types[index % types.length];
  const applicant = index % 2 ? '213852-孙志强' : '220784-周琦星';
  const createdAt = `2026-10-${String(15 - index % 10).padStart(2, '0')} 09:00:00`;
  const numberType = { RETURN: '员工退库申请', BORROW: '员工借用申请', DRAW: '员工领用申请', ASSET: '统一申请', CONSUMABLE: '统一申请', REPLACEMENT: '资产维修更换', REC: '接收入库', ED: '员工离职单' };
  const number = mockDocumentNumber(numberType[type], `unfinished-${index}`, createdAt, warehouse.company);
  const history = [
    { id: `${number}-1`, sequence: '1', node: '申请人提交', approver: applicant, status: '已提交', time: createdAt, opinion: '' },
    { id: `${number}-2`, sequence: '2', node: 'ES主管审批', approver: '213852-孙志强', status: '待审批', time: '', opinion: '', todo: true, account: '213852' },
  ];
  // 等待、无待办和异常审批账号仍保留处理中单头；已完成记录退出未完成范围。
  if (index === 12) history.push({ ...history[1], id: `${number}-wait`, sequence: '99', node: '等待', todo: true });
  if (index === 13) history[1].todo = false;
  if (index === 15) history[1].account = 'invalid-1';
  const userStatus = index % 3 === 0 ? null : 'Y';
  return {
    id: `unfinished-${String(index + 1).padStart(3, '0')}`, kind: 'unfinished', employeeApplication: !['REC', 'ED'].includes(type), access: { applicant: applicant.split('-')[0], department: 'DEMO-DEPT', company: warehouse.company, ledger: '资产台账' }, statusCode: index === 14 ? '1' : '3', createdAt, history,
    values: { number, type: name, businessType: ['ASSET', 'CONSUMABLE'].includes(type) ? '申请单' : name,
      status: index === 14 ? '已完成' : '处理中', node: 'ES主管审批', approver: '213852-孙志强',
      applicant, createdAt, company: warehouse.company, plate: '17.Corporate', department: '演示组织.员工服务中心', resigned: userStatus === 'Y' ? '否' : '是' },
    filters: { number, type, applicant: applicant.split('-')[0], company: warehouse.company.split('.')[0], plate: '17', department: 'DEMO-DEPT', createdAt, resigned: userStatus === 'Y' ? 'Y' : 'N' },
    lookupLabels: { company: warehouse.company, plate: '17.Corporate', applicant, department: '演示组织.员工服务中心' },
    allowProgress: true, showFlowGraph: !['DRAW', 'ASSET', 'CONSUMABLE'].includes(type),
    source: '未完成单据交易演示，非生产角色授权、HR组织或正式流程配置',
  };
});
