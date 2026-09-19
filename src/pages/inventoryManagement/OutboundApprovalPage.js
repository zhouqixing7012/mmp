import React, { useState } from 'react';
import { Button, Card, Input, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

export default function OutboundApprovalPage({ outbound, onApprove, onReject, onBack }) {
  const source = outbound || {};
  const lines = source.lines || [];
  const history = source.approvalHistory || [];
  const currentStep = source.approvalSteps?.[source.currentApprovalIndex || 0];
  const [opinion, setOpinion] = useState('');
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const canOperate = source.status === '审批中' && typeof onApprove === 'function';

  const approve = () => {
    onApprove(opinion.trim() || '同意');
    setOpinion('');
  };

  const reject = () => {
    if (!opinion.trim()) {
      messageApi.warning('驳回意见不能为空');
      return;
    }
    onReject?.(opinion.trim());
    setOpinion('');
  };

  const approvalColumns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '审批环节', dataIndex: 'node', width: 220 },
    { title: '申请人/审批人', dataIndex: 'handler', width: 180 },
    { title: '审批状态', dataIndex: 'action', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
    { title: '审批意见', dataIndex: 'opinion', render: (value) => value || '-' },
  ];

  const assetColumns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 330 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, render: (value) => value || '-' },
    { title: 'SN号', dataIndex: 'sn', width: 170, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'center', render: (value) => value || '-' },
    { title: '领用人', dataIndex: 'issuePerson', width: 150, render: (value) => value || '-' },
    { title: '领用日期', dataIndex: 'issueDate', width: 130, render: (value) => value || '-' },
    { title: '资产状态', dataIndex: 'outboundStatus', width: 130, render: (value) => value || '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key="outbound-approval">
      {contextHolder}
      <Typography.Title level={4} className="!mb-0">物资出库审批</Typography.Title>

      <Card size="small" title="出库单信息">
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="出库单号">{source.documentNo || '-'}</DetailItem>
          <DetailItem label="出库类型">{source.outboundType || '-'}</DetailItem>
          <DetailItem label="仓库名称">{source.warehouse || '-'}</DetailItem>
          <DetailItem label="制单人">{source.creator || '-'}</DetailItem>
          <DetailItem label="制单时间">{source.createdDate || '-'}</DetailItem>
          <DetailItem label="审批状态"><StatusTag value={source.status || '-'} /></DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title="出库物资" extra={<Typography.Text type="secondary">共 {lines.length} 条</Typography.Text>}>
        <Table
          rowKey={(record, index) => record.id || record.assetTag || `line-${index}`}
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={lines}
          columns={assetColumns}
        />
      </Card>

      <Card size="small" title="审批信息">
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="审批路线">{source.approvalRoute || '-'}</DetailItem>
          <DetailItem label="当前节点">{currentStep?.name || (source.status === '已完成' ? '审批完成' : '-')}</DetailItem>
          <DetailItem label="当前处理人">{currentStep?.approver || '-'}</DetailItem>
          <DetailItem label="发起人">{source.approvalInitiator || source.creator || '-'}</DetailItem>
          <DetailItem label="发起时间">{source.approvalStartedAt || '-'}</DetailItem>
          <DetailItem label="审批状态"><StatusTag value={source.status || '-'} /></DetailItem>
        </DetailGrid>
      </Card>

      {canOperate && (
        <Card size="small" title="审批操作">
          <TextArea
            rows={3}
            value={opinion}
            placeholder="驳回时必填；同意时可选填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" onClick={approve}>同意</Button>
            <Button danger onClick={reject}>驳回</Button>
            <Button onClick={onBack}>返回</Button>
          </div>
        </Card>
      )}

      {history.length > 0 && (
        <Card size="small" title="历史审批记录" extra={<Typography.Text type="secondary">共 {history.length} 条</Typography.Text>}>
          <Table
            rowKey={(record, index) => `${record.node || 'record'}-${index}`}
            columns={approvalColumns}
            dataSource={history}
            pagination={false}
            size="small"
            bordered
          />
        </Card>
      )}

      <div className="flex justify-center gap-3">
        {canOperate && <Button type="primary" onClick={approve}>同意</Button>}
        {canOperate && <Button danger onClick={reject}>驳回</Button>}
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
