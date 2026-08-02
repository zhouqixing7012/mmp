import React from 'react';
import { Card, Table, Tag } from 'antd';

const STATUS_COLOR = {
  已提交: 'processing',
  已同意: 'success',
  已驳回: 'error',
  待审批: 'warning',
  等待员工确认: 'warning',
  已确认: 'success',
  已出库: 'success',
};

export default function BorrowingApprovalHistory({ records = [] }) {
  const columns = [
    { title: '节点', dataIndex: 'node', width: 160 },
    { title: '处理人', dataIndex: 'person', width: 190 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag>,
    },
    { title: '处理时间', dataIndex: 'time', width: 180 },
    { title: '处理意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  return (
    <Card title="审批信息" size="small">
      <Table
        rowKey={(record, index) => `${record.node}-${index}`}
        columns={columns}
        dataSource={records}
        pagination={false}
        size="small"
      />
    </Card>
  );
}
