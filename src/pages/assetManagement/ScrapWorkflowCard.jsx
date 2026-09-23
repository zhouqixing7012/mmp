import React from 'react';
import { Alert, Card, Steps, Typography } from 'antd';
import {
  getAccountingApprovalNodes,
  getCrossCompanyApprovalNodes,
  getScrapApprovalNodes,
} from './scrapPrototypeWorkflow';

const { Text } = Typography;

function crossCompanySteps(scope) {
  return [
    scope === '办公设备' ? 'ES专员提交' : '责任人提交',
    ...getCrossCompanyApprovalNodes(scope),
    '进入待报废池',
    '流程结束',
  ];
}

function scrapSteps(scope, assets) {
  const nodes = getScrapApprovalNodes(scope, assets);
  if (nodes) {
    return [scope === '软件' ? '责任人提交' : 'ES专员提交', ...nodes, '进入待报废池', '流程结束'];
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

function accountingSteps(assets) {
  return [
    'ES账务提交',
    ...getAccountingApprovalNodes(assets),
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
  const machineQuantity = selectedAssets
    .filter((item) => item.scope === '机房资产')
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const hasSpecialTransferCompany = selectedAssets.some((item) => (
    /上海|广州/.test(String(item.company || ''))
    || /上海|广州/.test(String(item.newCompany || ''))
  ));
  let steps;
  if (type === 'crossCompany') steps = crossCompanySteps(assetScope);
  else if (type === 'scrap') steps = scrapSteps(assetScope, selectedAssets);
  else if (type === 'accounting') steps = accountingSteps(selectedAssets);
  else if (type === 'disposal') steps = disposalSteps(assetScope, region, needsCleaning);
  else throw new Error(`未知报废业务类型：${type}`);

  const current = Math.max(0, steps.findIndex((item) => currentNode && item.includes(currentNode)));
  const alert = type === 'crossCompany'
    ? (
      hasSpecialTransferCompany
        ? '机房资产、软件、办公设备必须分别建单；本单涉及上海/广州新媒体，后续账面报废按特殊资产号同步规则处理。'
        : '机房资产、软件、办公设备必须分别建单；进入待报废池后，在库资产变为“在库-待报废”，员工名下资产状态不变。'
    )
    : type === 'scrap'
      ? (
        machineQuantity >= 500
          ? '本单机房资产数量达到500台及以上，报价接收人强制为内审。'
          : '机房资产达到500台及以上时强制由内审接收报价；PC/NOTEBOOK（含PC类显示器）需MIS鉴定，其余办公设备跳过MIS。'
      )
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
