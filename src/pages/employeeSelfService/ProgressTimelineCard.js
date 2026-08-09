import React from 'react';
import { Card, Timeline, Typography } from 'antd';
import StatusTag from '../../components/StatusTag';

const TIMELINE_COLOR = {
  已完成: 'green',
  处理中: 'blue',
  已驳回: 'red',
  待处理: 'gray',
  不涉及: 'gray',
};

export default function ProgressTimelineCard({ records }) {
  const items = records.map((record) => ({
    color: TIMELINE_COLOR[record.status] || 'gray',
    children: (
      <div>
        <div className="flex items-center gap-2">
          <Typography.Text strong>{record.stage}</Typography.Text>
          <StatusTag value={record.status} type="workflow" />
          <Typography.Text type="secondary">{record.time}</Typography.Text>
        </div>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
          {record.detail}
        </Typography.Paragraph>
      </div>
    ),
  }));

  return (
    <Card title="全流程进度" size="small">
      <Timeline items={items} />
    </Card>
  );
}
