export function getCrossCompanyApprovalNodes(scope) {
  return scope === '办公设备'
    ? ['ES主管确认']
    : ['责任人5级及以上直属领导', '责任人7级及以上直属领导'];
}

export function getScrapApprovalNodes(scope, assets) {
  if (scope === '软件') return ['5级及以上直属领导', '7级及以上直属领导'];
  if (scope !== '办公设备') return null;
  return ['PC', 'NOTEBOOK'].includes(assets[0]?.majorCategory)
    ? ['MIS鉴定', 'ES主管确认']
    : ['ES主管确认'];
}

export function getAccountingApprovalNodes(assets) {
  const hasMachine = assets.some((item) => item.scope === '机房资产' && item.scrapMethod !== '调账');
  const needsMis = assets.some((item) => (
    ['PC', 'NOTEBOOK'].includes(item.majorCategory)
    && item.scrapType !== '丢失'
    && item.scrapMethod !== '调账'
  ));
  return [
    '财务初审',
    ...(hasMachine ? ['NO部门5级及以上领导', 'NO部门7级及以上领导'] : []),
    ...(needsMis ? ['MIS部门5级及以上领导', 'MIS部门7级及以上领导'] : []),
    'ES二级审批',
    'ES一级审批',
    '财务三级审批',
    '财务二级审批',
    '财务一级审批',
  ];
}
