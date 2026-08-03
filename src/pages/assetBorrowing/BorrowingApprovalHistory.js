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

export default function BorrowingApprovalHistory({ records = [], children }) {
  const columns = [
    { title: '审批环节', dataIndex: 'node', width: 160 },
    { title: '申请人/审批人', dataIndex: 'person', width: 190 },
    { title: '代理人', width: 120, render: () => '-' },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag>,
    },
    { title: '审批时间', dataIndex: 'time', width: 180 },
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
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
