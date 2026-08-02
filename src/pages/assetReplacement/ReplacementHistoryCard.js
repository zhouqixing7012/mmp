import React from 'react';
import { Card, Table, Tag } from 'antd';

const STATUS_COLOR = {
  已提交: 'processing',
  待确认: 'warning',
  已确认: 'success',
  已同意: 'success',
  已完成: 'success',
  已结束: 'default',
  已驳回: 'error',
};

export default function ReplacementHistoryCard({ records = [], title = '流程记录' }) {
  const columns = [
    { title: '处理环节', dataIndex: 'node', width: 160 },
    { title: '处理人', dataIndex: 'person', width: 190 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag>,
    },
    { title: '处理时间', dataIndex: 'time', width: 180 },
    { title: '处理说明', dataIndex: 'comment' },
  ];

  return (
    <Card title={title} size="small">
      <Table
        rowKey={(record, index) => `${record.node}-${record.time}-${index}`}
        columns={columns}
        dataSource={records}
        pagination={false}
        size="small"
      />
    </Card>
  );
}
