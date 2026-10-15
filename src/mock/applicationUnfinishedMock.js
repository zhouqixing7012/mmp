import { warehouseCatalog } from './reference/warehouseCatalog';

// 交易与流程记录仅作申请查询原型演示；仓库/公司/地点保持参考目录的整行关联。
const warehouses = ['I0001', 'I3001', 'I3002'].map(code => {
  const row = warehouseCatalog.find(item => item.warehouseCode === code);
  if (!row) throw new Error(`申请演示仓库不存在：${code}`);
  return row;
});
const types = [['RETURN', '退库单'], ['BORROW', '借用单'], ['DRAW', '资产领用'], ['PURCHASE', '资产采购'], ['REC', '资产接收'], ['ED', '员工确认']];
export const applicationUnfinishedRows = Array.from({ length: 18 }, (_, index) => {
  const warehouse = warehouses[index % warehouses.length];
  const [type, name] = types[index % types.length];
  const number = `APPLY-PENDING-DEMO-${String(index + 1).padStart(3, '0')}`;
  const applicant = index % 2 ? '213852-孙志强' : '220784-周琦星';
  const createdAt = `2026-10-${String(15 - index % 10).padStart(2, '0')} 09:00:00`;
  const history = [
    { id: `${number}-1`, sequence: '1', node: '申请人提交', approver: applicant, status: '已提交', time: createdAt, opinion: '' },
    { id: `${number}-2`, sequence: '2', node: 'ES主管审批', approver: '213852-孙志强', status: '待审批', time: '', opinion: '', todo: true, account: '213852' },
  ];
  // 覆盖“首条等待则排除”、非待办、已完成及无效审批账号等固定查询边界。
  if (index === 12) history.push({ ...history[1], id: `${number}-wait`, sequence: '99', node: '等待', todo: true });
  if (index === 13) history[1].todo = false;
  if (index === 15) history[1].account = 'invalid-1';
  const userStatus = index % 3 === 0 ? null : 'Y';
  return {
    id: number, kind: 'unfinished', statusCode: index === 14 ? '1' : '3', createdAt, history,
    values: { number, type: name, businessType: type === 'PURCHASE' ? '统一采购' : name,
      status: index === 14 ? '已完成' : '处理中', node: 'ES主管审批', approver: '213852-孙志强',
      applicant, createdAt, company: warehouse.company, plate: '17.Corporate', department: '演示组织.员工服务中心', resigned: userStatus === 'Y' ? '否' : '是' },
    filters: { number, type, applicant: applicant.split('-')[0], company: warehouse.company.split('.')[0], plate: '17', department: 'DEMO-DEPT', createdAt, resigned: userStatus === 'Y' ? 'Y' : 'N' },
    lookupLabels: { company: warehouse.company, plate: '17.Corporate', applicant, department: '演示组织.员工服务中心' },
    allowProgress: !['REC', 'ED'].includes(type), showFlowGraph: !['DRAW', 'PURCHASE'].includes(type),
    source: '未完成单据交易演示，非生产角色授权、HR组织或正式流程配置',
  };
});
