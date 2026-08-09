import React from 'react';
import { Card, Empty, List, Tag, Typography } from 'antd';

export default function NotificationRecordsCard({ records }) {
  return (
    <Card title="通知记录" size="small">
      {records.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知记录" />
      ) : (
        <List
          dataSource={records}
          renderItem={(record) => (
            <List.Item>
              <List.Item.Meta
                title={(
                  <div className="flex items-center gap-2">
                    <Typography.Text strong>{record.title}</Typography.Text>
                    <Tag>{record.channel}</Tag>
                  </div>
                )}
                description={(
                  <div>
                    <div>{record.content}</div>
                    <Typography.Text type="secondary">{record.time}</Typography.Text>
                  </div>
                )}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
