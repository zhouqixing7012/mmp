export function getCrossCompanyApprovalNodes(scope) {
  return scope === '办公设备'
    ? ['ES主管确认']
    : ['责任人5级及以上直属领导', '责任人7级及以上直属领导'];
}

export function getScrapApprovalNodes(scope, assets) {
  if (scope === '软件') return ['5级及以上直属领导', '7级及以上直属领导'];
  if (scope === '机房资产') return [
    '专家评估', '责任人7级及以上直属领导', 'NO部7级及以上领导',
    '采购专员', '报价处理', '采购专员填写回收商报价',
    '采购5级及以上领导', '采购专员交接资料', 'FS审批部门',
  ];
  return ['PC', 'NOTEBOOK'].includes(assets[0]?.majorCategory)
    ? ['MIS鉴定', 'ES主管确认']
    : ['ES主管确认'];
}

export function getDisposalApprovalNodes(record) {
  if (record.disposalMode === '无实物处置' || record.assetScope === '软件') return ['无实物处置确认'];
  if (record.assetScope === '机房资产') return [
    ...(record.region === '北京' ? ['采购专员协办', 'ES专员协办'] : []),
    ...(record.needsCleaning === '是' ? ['数据清洗'] : []),
    '处置确认',
  ];
  return ['ES二级审批', 'ES一级审批', '财务审批', 'ES专员处理'];
}

export function getAccountingApprovalSteps(assets, approverMappings = {}) {
  const hasMachine = assets.some((item) => (
    ['SERVER', 'NET EQUIPMENT'].includes(item.majorCategory)
    && item.scrapMethod !== '调账'
  ));
  const needsMis = assets.some((item) => (
    ['PC', 'NOTEBOOK'].includes(item.majorCategory)
    && item.scrapType !== '丢失'
    && item.scrapMethod !== '调账'
  ));
  const nodes = [
    '财务初审',
    ...(hasMachine ? ['NO部门5级及以上领导', 'NO部门7级及以上领导'] : []),
    ...(needsMis ? ['MIS部门5级及以上领导', 'MIS部门7级及以上领导'] : []),
    'ES二级审批',
    'ES一级审批',
    '财务三级审批',
    '财务二级审批',
    '财务一级审批',
  ];

  const seenApprovers = new Set();
  return nodes.map((node) => {
    const mapping = approverMappings[node];
    const approverId = typeof mapping === 'string' ? mapping : mapping?.id || null;
    const approverName = typeof mapping === 'object' ? mapping?.name || '' : '';
    // 只有经明确映射的稳定身份才能驱动去重；映射缺失时保留阻塞标记，不虚构审批人。
    const skipped = Boolean(approverId && seenApprovers.has(approverId));
    if (approverId && !skipped) seenApprovers.add(approverId);
    return { node, approverId, approverName, skipped, blockedByMissingMapping: !approverId };
  });
}

export function getAccountingApprovalNodes(assets, approverMappings = {}) {
  return getAccountingApprovalSteps(assets, approverMappings)
    .filter((step) => !step.skipped)
    .map((step) => step.node);
}
