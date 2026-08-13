import React from 'react';
import { Card, Table } from 'antd';
import StatusTag from '../../components/StatusTag';

export default function ApprovalHistoryCard({ records }) {
  const columns = [
    { title: '审批环节', dataIndex: 'node', width: 150 },
    { title: '申请人/审批人', dataIndex: 'person', width: 180 },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '审批时间', dataIndex: 'time', width: 170, render: (value) => value || '-' },
    { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  return (
    <Card title="审批信息" size="small">
      <Table
        rowKey={(record, index) => `${record.node}-${index}`}
        columns={columns}
        dataSource={records}
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  );
}
