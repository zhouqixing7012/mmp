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
