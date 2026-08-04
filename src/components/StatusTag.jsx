import React from 'react';
import { Tag } from 'antd';

const STATUS_MAP = {
  yes: { text: '是', color: 'success' },
  no: { text: '否', color: 'default' },
  enabled: { text: '启用', color: 'success' },
  disabled: { text: '停用', color: 'error' },
  warning: { text: '停产', color: 'warning' },
};

const BUSINESS_STATUS_COLOR = {
  已提交: 'processing',
  处理中: 'processing',
  在库: 'processing',
  '在库-新增': 'processing',
  待审批: 'warning',
  待确认: 'warning',
  等待员工确认: 'warning',
  '在库-待处理': 'warning',
  待维修: 'warning',
  未发起: 'default',
  未盘: 'error',
  已确认: 'success',
  已同意: 'success',
  已完成: 'success',
  已处理: 'success',
  已出库: 'success',
  已入库: 'success',
  鉴定通过: 'success',
  正式员工: 'success',
  '在用-使用中': 'success',
  '在用-借用中': 'success',
  '再利用-使用中': 'success',
  '在库-再利用': 'success',
  已驳回: 'error',
  鉴定不通过: 'error',
  限制出库: 'error',
  已结束: 'default',
  外包员工: 'default',
  实习员工: 'default',
};

export default function StatusTag({ value, type = 'yesNo' }) {
  if (value === undefined || value === null || value === '') {
    return <Tag>-</Tag>;
  }

  if (type === 'business') {
    return <Tag color={BUSINESS_STATUS_COLOR[value] || 'default'}>{value}</Tag>;
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
