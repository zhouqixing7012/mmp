import React from 'react';
import { Tag } from 'antd';

const STATUS_MAP = {
  yes: { text: '是', color: 'success' },
  no: { text: '否', color: 'default' },
  enabled: { text: '启用', color: 'success' },
  disabled: { text: '停用', color: 'error' },
  warning: { text: '停产', color: 'warning' },
};

const WORKFLOW_STATUS_COLOR = {
  待处理: 'default',
  待审批: 'warning',
  待配给: 'warning',
  待汇总: 'warning',
  待通知: 'warning',
  待员工确认: 'warning',
  待库管复核: 'warning',
  处理中: 'processing',
  业务审批: 'processing',
  资产领用中: 'processing',
  已提交: 'processing',
  已同意: 'success',
  已配给: 'success',
  已汇总: 'success',
  已复核: 'success',
  已完成: 'success',
  已驳回: 'error',
  已取消: 'default',
  签名驳回: 'error',
  已跳过: 'default',
  不涉及: 'default',
};

export default function StatusTag({ value, type = 'yesNo' }) {
  if (value === undefined || value === null || value === '') {
    return <Tag>-</Tag>;
  }

  if (type === 'workflow') {
    return <Tag color={WORKFLOW_STATUS_COLOR[value] || 'default'}>{value}</Tag>;
  }

  if (type === 'enabled') {
    return value === '1' || value === true ? (
      <Tag color={STATUS_MAP.enabled.color}>{STATUS_MAP.enabled.text}</Tag>
    ) : (
      <Tag color={STATUS_MAP.disabled.color}>{STATUS_MAP.disabled.text}</Tag>
    );
  }

  if (type === 'stop') {
    return value === '1' || value === true ? (
      <Tag color={STATUS_MAP.warning.color}>停产</Tag>
    ) : (
      <Tag>未停产</Tag>
    );
  }

  return value === '1' || value === true || value === '是' ? (
    <Tag color={STATUS_MAP.yes.color}>{STATUS_MAP.yes.text}</Tag>
  ) : (
    <Tag>{STATUS_MAP.no.text}</Tag>
  );
}
