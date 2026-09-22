import React, { useMemo } from 'react';
import { Alert, Card, Steps, Typography } from 'antd';

const { Text } = Typography;

function crossCompanySteps(scope) {
  if (scope === '办公设备') {
    return ['ES专员提交', 'ES主管确认', '进入待报废池', '流程结束'];
  }
  return ['责任人提交', '5级及以上直属领导', '7级及以上直属领导', '进入待报废池', '流程结束'];
}

function scrapSteps(scope, majorCategory) {
  if (scope === '软件') {
    return ['责任人提交', '5级及以上直属领导', '7级及以上直属领导', '进入待报废池', '流程结束'];
  }
  if (scope === '办公设备') {
    if (['PC', 'NOTEBOOK'].includes(majorCategory)) {
      return ['ES专员提交', 'MIS鉴定', 'ES主管确认', '进入待报废池', '流程结束'];
    }
    return ['ES专员提交', 'ES主管确认', '进入待报废池', '流程结束'];
  }
  return [
    '责任人提交',
    '专家评估',
    '责任人7级及以上直属领导',
    'NO部7级及以上领导',
    '采购专员',
    '报价处理',
    '采购专员确定回收商',
    '采购5级及以上领导',
    '采购专员交接资料',
    'FS审批',
    '归属地处理',
    '进入待报废池',
    '流程结束',
  ];
}

function accountingSteps({ hasMachine, needsMis }) {
  return [
    'ES账务提交',
    '财务初审',
    ...(hasMachine ? ['NO部门5级及以上领导', 'NO部门7级及以上领导'] : []),
    ...(needsMis ? ['MIS部门5级及以上领导', 'MIS部门7级及以上领导'] : []),
    'ES二级审批',
    'ES一级审批',
    '财务三级审批',
    '财务二级审批',
    '财务一级审批',
    '提单人确认',
    '更新台账/生成事务/生成报废单',
    '流程结束',
  ];
}

function disposalSteps(scope, region, needsCleaning) {
  if (scope === '办公设备') {
    return ['ES专员提交', 'ES二级审批', 'ES一级审批', '财务审批', 'ES专员实物处置', '已报废-已处置'];
  }
  if (region === '北京') {
    return [
      '采购专员协办',
      'ES专员协办',
      ...(needsCleaning === '是' ? ['采购专员数据清洗'] : []),
      '已报废-已处置',
    ];
  }
  return [
    ...(needsCleaning === '是' ? ['采购专员数据清洗'] : []),
    '已报废-已处置',
  ];
}

export default function ScrapWorkflowCard({
  type,
  assetScope,
  selectedAssets = [],
  region = '北京',
  needsCleaning = '否',
  currentNode = '',
}) {
  const majorCategory = selectedAssets[0]?.majorCategory || '';
  const hasMachine = selectedAssets.some((item) => item.scope === '机房资产');
  const needsMis = selectedAssets.some((item) => (
    ['PC', 'NOTEBOOK'].includes(item.majorCategory)
    && item.scrapType !== '丢失'
    && item.scrapMethod !== '调账'
  ));

  const steps = useMemo(() => {
    if (type === 'crossCompany') return crossCompanySteps(assetScope);
    if (type === 'scrap') return scrapSteps(assetScope, majorCategory);
    if (type === 'accounting') return accountingSteps({ hasMachine, needsMis });
    return disposalSteps(assetScope, region, needsCleaning);
  }, [type, assetScope, majorCategory, hasMachine, needsMis, region, needsCleaning]);

  const current = Math.max(0, steps.findIndex((item) => currentNode && item.includes(currentNode)));
  const alert = type === 'crossCompany'
    ? '机房资产、软件、办公设备必须分别建单；进入待报废池后，在库资产变为“在库-待报废”，员工名下资产状态不变。'
    : type === 'scrap'
      ? '机房资产达到500台及以上时强制由内审接收报价；PC/NOTEBOOK需MIS鉴定，其余办公设备跳过MIS。'
      : type === 'accounting'
        ? 'NO审批仅针对非调账机房资产；MIS审批仅针对非丢失、非调账的PC/NOTEBOOK类资产；重复审批人只审批一次。'
        : assetScope === '机房资产'
          ? '机房处置按归属地分支；“是否需要数据清洗”读取报废申请明细中的数据清洗结果。'
          : '办公设备处置需完成报价、盖章报价单和接收报价人，审批后由ES专员完成线下取货、打款和交接。';

  return (
    <Card size="small" title="业务流程">
      <Alert type="info" showIcon message={alert} className="mb-4" />
      <Steps
        size="small"
        current={current}
        responsive
        items={steps.map((title) => ({ title }))}
      />
      {currentNode && (
        <div className="mt-3">
          <Text type="secondary">当前节点：</Text>
          <Text>{currentNode}</Text>
        </div>
      )}
    </Card>
  );
}
