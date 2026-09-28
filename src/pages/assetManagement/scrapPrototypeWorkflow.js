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
  if (record.disposalMode === '无实物处置' || record.assetScope === '软件') {
    throw new Error('无需处置资产不生成处置单');
  }
  if (record.assetScope === '机房资产') {
    if (!['北京', '非北京'].includes(record.region) || !['是', '否'].includes(record.needsCleaning)) {
      throw new Error('机房处置单缺少明确的归属地或数据清洗结果');
    }
    return [
      ...(record.region === '北京' ? ['采购专员协办', 'ES专员协办'] : []),
      ...(record.needsCleaning === '是' ? ['数据清洗'] : []),
    ];
  }
  return ['ES二级审批', 'ES一级审批', '财务审批', 'ES专员处理'];
}

function isVideoPlate(value) {
  return /视频|video/i.test(String(value || ''));
}

function accountingFinanceRule(assets) {
  const companies = [...new Set((assets || []).map((item) => item.company).filter(Boolean))];
  const specialCompany = companies.length === 1 ? companies[0] : '';
  const allNonVideo = (assets || []).length > 0 && assets.every((item) => !isVideoPlate(item.plate));

  if (allNonVideo && /上海/.test(specialCompany)) {
    return {
      initial: { id: 'finance-jiang-yan', name: '姜艳' },
      level3: { id: 'finance-jiang-yan', name: '姜艳' },
      level2: { id: 'finance-bao-yiwei', name: '包亦未' },
      includeLevel1: false,
    };
  }
  if (allNonVideo && /广州/.test(specialCompany)) {
    return {
      initial: { id: 'finance-huang-qinghua', name: '黄青华' },
      level3: { id: 'finance-huang-qinghua', name: '黄青华' },
      level2: { id: 'finance-yi-zhiqun', name: '易志群' },
      includeLevel1: false,
    };
  }
  return {
    initial: { id: 'finance-feng-liting', name: '冯丽婷' },
    level3: { id: 'finance-feng-liting', name: '冯丽婷' },
    level2: { id: 'finance-zhang-jie', name: '张洁' },
    level1: { id: 'finance-xu-bo', name: '徐博' },
    includeLevel1: true,
  };
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
  const finance = accountingFinanceRule(assets);
  const financeMappings = {
    '财务初审': finance.initial,
    '财务三级审批': finance.level3,
    '财务二级审批': finance.level2,
    ...(finance.includeLevel1 ? { '财务一级审批': finance.level1 } : {}),
  };
  const nodes = [
    '财务初审',
    ...(hasMachine ? ['NO部门5级及以上领导', 'NO部门7级及以上领导'] : []),
    ...(needsMis ? ['MIS部门5级及以上领导', 'MIS部门7级及以上领导'] : []),
    'ES二级审批',
    'ES一级审批',
    '财务三级审批',
    '财务二级审批',
    ...(finance.includeLevel1 ? ['财务一级审批'] : []),
  ];

  const dedupeNodes = new Set([
    'NO部门5级及以上领导',
    'NO部门7级及以上领导',
    'MIS部门5级及以上领导',
    'MIS部门7级及以上领导',
  ]);
  const seenConditionalApprovers = new Set();
  return nodes.map((node) => {
    const mapping = approverMappings[node] || financeMappings[node];
    const approverId = typeof mapping === 'string' ? mapping : mapping?.id || null;
    const approverName = typeof mapping === 'object' ? mapping?.name || '' : '';
    const canDedupe = dedupeNodes.has(node);
    const skipped = Boolean(canDedupe && approverId && seenConditionalApprovers.has(approverId));
    if (canDedupe && approverId && !skipped) seenConditionalApprovers.add(approverId);
    return { node, approverId, approverName, skipped, blockedByMissingMapping: !approverId };
  });
}

export function getAccountingApprovalNodes(assets, approverMappings = {}) {
  return getAccountingApprovalSteps(assets, approverMappings)
    .filter((step) => !step.skipped)
    .map((step) => step.node);
}
