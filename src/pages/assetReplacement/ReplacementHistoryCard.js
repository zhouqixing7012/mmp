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

export default function ReplacementHistoryCard({
  records = [],
  title = '流程记录',
  children,
  showAgent = true,
}) {
  const columns = [
    { title: '审批环节', dataIndex: 'node', width: 160 },
    { title: '申请人/审批人', dataIndex: 'person', width: 190 },
    ...(showAgent ? [{ title: '代理人', width: 110, render: () => '-' }] : []),
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag>,
    },
    { title: '审批时间', dataIndex: 'time', width: 180 },
    { title: '审批意见', dataIndex: 'comment' },
  ];

  return (
    <Card title={title} size="small">
      <Table
        rowKey={(record, index) => `${record.node}-${record.time}-${index}`}
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
