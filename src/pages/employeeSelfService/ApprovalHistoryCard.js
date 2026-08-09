import React from 'react';
import { Card, Table, Tag } from 'antd';

const STATUS_COLOR = {
  已提交: 'processing',
  已同意: 'success',
  待审批: 'warning',
  已驳回: 'error',
  已跳过: 'default',
};

export default function ApprovalHistoryCard({ records }) {
  const columns = [
    { title: '审批环节', dataIndex: 'node', width: 150 },
    { title: '申请人/审批人', dataIndex: 'person', width: 180 },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag>,
    },
    { title: '审批时间', dataIndex: 'time', width: 170 },
    { title: '审批意见', dataIndex: 'comment' },
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
