const ACTIVE_STATUSES = new Set([
  '审批中',
  '处理中',
  '待提单人确认',
  '待ES专员处理',
]);

function displayStatus(result, node) {
  if (node === '发起人提交' || result === '提交') return '已提交';
  if (result === '通过') return '已同意';
  if (result === '驳回') return '已驳回';
  return result || '待审批';
}

export function getScrapPrototypeApprovalRecords(record = {}, type) {
  const form = record.formSnapshot || record;
  const history = record.approvalHistory?.length
    ? record.approvalHistory
    : form.approvalHistory || [];
  const documentStatus = record.documentStatus || form.documentStatus;
  const rows = history.map((item) => ({
    node: item.node,
    person: item.person || (item.node === '发起人提交' ? form.creator || record.creator : ''),
    status: displayStatus(item.result, item.node),
    time: item.time || '',
    comment: item.opinion || '',
  }));

  const hasStartRecord = rows.some((item) => ['发起人提交', '系统发起'].includes(item.node));
  if (documentStatus && documentStatus !== '草稿' && !hasStartRecord) {
    const systemStarted = form.creator === '系统自动' || record.creator === '系统自动';
    rows.unshift({
      node: systemStarted ? '系统发起' : '发起人提交',
      person: form.creator || record.creator || '',
      status: '已提交',
      time: form.submittedAt || record.submittedAt || form.applicationDate || record.createdAt || '',
      comment: '',
    });
  }

  if (ACTIVE_STATUSES.has(documentStatus)) {
    const currentNode = record.currentNode || form.currentNode;
    if (!currentNode) throw new Error(`审批中单据缺少当前节点：${record.applicationNo || form.applicationNo || type}`);
    if (!rows.some((item) => item.node === currentNode && item.status === '待审批')) {
      rows.push({
        node: currentNode,
        person: record.currentApprover || form.currentApprover || '',
        status: '待审批',
        time: '',
        comment: '',
      });
    }
  }

  return rows;
}
