import React from 'react';
import { Button, Card, Space, Table, Typography } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

function displayWarehouseName(value) {
  return String(value || '').replace(/^[^.\-]+[-.]/, '');
}

export default function OutboundApprovalHistoryPage({ outbound, onBack }) {
  const source = outbound || {};
  const lines = source.lines || [];
  const records = source.approvalHistory || [];

  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '审批环节', dataIndex: 'node', width: 220 },
    { title: '申请人/审批人', dataIndex: 'handler', width: 180 },
    { title: '审批状态', dataIndex: 'action', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
    { title: '审批意见', dataIndex: 'opinion', render: (value) => value || '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key="outbound-approval-history">
      <Typography.Title level={3} className="!mb-0">出库审批记录</Typography.Title>

      <Card size="small" title="出库单信息">
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="出库单号">{source.documentNo || '-'}</DetailItem>
          <DetailItem label="单据状态"><StatusTag value={source.status || '-'} /></DetailItem>
          <DetailItem label="出库类型">{source.outboundType || '-'}</DetailItem>
          <DetailItem label="出库仓库">{displayWarehouseName(source.warehouse) || '-'}</DetailItem>
          <DetailItem label="制单人">{source.creator || '-'}</DetailItem>
          <DetailItem label="制单时间">{source.createdDate || '-'}</DetailItem>
          <DetailItem label="审批路线">{source.approvalRoute || '-'}</DetailItem>
          <DetailItem label="发起人">{source.approvalInitiator || source.creator || '-'}</DetailItem>
          <DetailItem label="发起时间">{source.approvalStartedAt || '-'}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title="审批记录" extra={<Typography.Text type="secondary">共 {records.length} 条</Typography.Text>}>
        <Table
          rowKey={(record, index) => `${record.node || 'record'}-${index}`}
          columns={columns}
          dataSource={records}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: '暂无审批记录' }}
        />
      </Card>

      <Card size="small" title="出库物资" extra={<Typography.Text type="secondary">共 {lines.length} 条</Typography.Text}>
        <Table
          rowKey={(record, index) => record.id || record.assetTag || `line-${index}`}
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={lines}
          columns={[
            { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
            { title: '物资说明', dataIndex: 'materialDesc', width: 320 },
            { title: '资产标签号', dataIndex: 'assetTag', width: 160, render: (value) => value || '-' },
            { title: 'SN号', dataIndex: 'sn', width: 170, render: (value) => value || '-' },
            { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || '-' },
            { title: '领用人', dataIndex: 'issuePerson', width: 150, render: (value) => value || '-' },
            { title: '领用日期', dataIndex: 'issueDate', width: 130, render: (value) => value || '-' },
          ]}
        />
      </Card>

      <div className="flex justify-center gap-3">
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
