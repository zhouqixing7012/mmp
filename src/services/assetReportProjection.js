// 每次查询重新读取当前审批源；完成节点的业务金额仍保持已保存快照。
export function projectCurrentReportRow(row) {
  const detail = row.detailSource;
  if (detail) {
    const status = String(detail.claim?.status ?? '');
    const warehouse = detail.card ? detail.card.warehouse : status === '1' ? null : detail.inbound?.warehouse;
    const warehouseName = warehouse?.warehouseCode && warehouse?.warehouseDescription ? `${warehouse.warehouseCode}.${warehouse.warehouseDescription}` : '';
    const values = { ...row.values, '税金': detail.inboundDetail?.taxAmount ?? null, '仓库': warehouseName,
      '是否领用': status === '1' ? '是' : '否', '是否占用': status === '3' ? '是' : '否' };
    row = { ...row, values, exports: { ...row.exports, ...values }, filters: { ...row.filters,
      '仓库': warehouse?.warehouseCode ?? '', '是否领用': values['是否领用'], '是否占用': values['是否占用'] } };
  }
  const source = row.approvalSource;
  if (!source) return row;
  const pending = ['已处理', '已完成', '已驳回'].includes(source.status) ? [] : source.nodes.filter(node => node.status === '待审批');
  const nodes = pending.map(node => node.name).join('；');
  const people = [...new Set(pending.flatMap(node => node.approvers.map(person => `${person.employeeNo}.${person.name}`)))].join('；');
  const personKey = row.matchStatus ? '当前审批人' : '当前审批人名称';
  const values = { ...row.values, '审批节点': nodes, [personKey]: people, '统一申请单状态': source.status };
  return { ...row, values, exports: { ...row.exports, ...values }, documentStatus: source.status,
    filters: { ...row.filters, '统一申请单状态': source.status } };
}
