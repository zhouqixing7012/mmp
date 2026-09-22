import React from 'react';
import { Table } from 'antd';
import StatusTag from '../../components/StatusTag';

export default function OutboundApprovalHistoryPage({ outbound }) {
  const records = outbound?.approvalHistory || [];

  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '审批环节', dataIndex: 'node', width: 220 },
    { title: '申请人/审批人', dataIndex: 'handler', width: 180 },
    { title: '审批状态', dataIndex: 'action', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
    { title: '审批意见', dataIndex: 'opinion', render: (value) => value || '-' },
  ];

  return (
    <Table
      rowKey={(record, index) => `${record.node || 'record'}-${index}`}
      columns={columns}
      dataSource={records}
      pagination={false}
      size="small"
      bordered
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: '暂无审批记录' }}
      data-page-view-key="outbound-approval-history"
    />
  );
}
