const ACTIVE_STATUSES = new Set([
  '审批中',
]);

const SCRAP_HANDLING_NODES = new Set([
  '采购专员选择报价接收人',
  '采购专员报价',
  '内审报价',
  '采购专员填写回收商报价',
  '采购专员交接资料',
  '采购专员线下交接',
]);

const DISPOSAL_HANDLING_NODES = new Set([
  '采购专员协办',
  'ES专员协办',
  '数据清洗',
  'ES专员处理',
]);

function isHandlingNode(type, node) {
  return (type === 'scrap' && SCRAP_HANDLING_NODES.has(node))
    || (type === 'disposal' && DISPOSAL_HANDLING_NODES.has(node));
}

function displayStatus(result, node, type) {
  if (node === '发起人提交' || node === '系统发起' || result === '提交') return '已提交';
  if (result === '通过') return isHandlingNode(type, node) ? '已办理' : '已同意';
  if (result === '驳回') return '已驳回';
  if (result === '打回') return '已打回';
  if (result === '加签') return '已加签';
  if (result === '跳过') return '已跳过';
  if (result === '完成') return '已完成';
  return result || (isHandlingNode(type, node) ? '待办理' : '待审批');
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
    status: displayStatus(item.result, item.node, type),
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
    const pendingStatus = type === 'accounting' && currentNode === '提单人确认'
      ? '待确认'
      : isHandlingNode(type, currentNode)
        ? '待办理'
        : '待审批';
    if (!rows.some((item) => item.node === currentNode && ['待审批', '待确认', '待办理'].includes(item.status))) {
      rows.push({
        node: currentNode,
        person: record.currentApprover || form.currentApprover || '',
        status: pendingStatus,
        time: '',
        comment: '',
      });
    }
  }

  return rows;
}
