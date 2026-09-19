import React from 'react';
import { Button, Card, Input, Space, Typography } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

export default function OutboundApprovalPage({ outbound, onApprove, onReject, onBack }) {
  const row = outbound || {};

  return (
    <div className="space-y-4">
      <Typography.Title level={4} style={{ margin: 0 }}>物资出库审批</Typography.Title>
      <Card size="small" title="出库信息">
        <DetailGrid columns={3}>
          <DetailItem label="出库单号" value={row.documentNo || '-'} />
          <DetailItem label="出库类型" value={row.outboundType || '-'} />
          <DetailItem label="当前状态" value={<StatusTag status={row.status || '审批中'} />} />
        </DetailGrid>
      </Card>
      <Card size="small" title="审批意见">
        <TextArea rows={4} placeholder="请输入审批意见" />
      </Card>
      <Space>
        <Button type="primary" onClick={() => onApprove?.(row)}>同意</Button>
        <Button danger onClick={() => onReject?.(row)}>驳回</Button>
        <Button onClick={onBack}>返回</Button>
      </Space>
    </div>
  );
}
