import React from 'react';
import { Tag } from 'antd';

// 状态标签统一组件，替换页面里散落的 是/否、启用/停用 渲染逻辑
const STATUS_MAP = {
  yes: { text: '是', color: 'success' },
  no: { text: '否', color: 'default' },
  enabled: { text: '启用', color: 'success' },
  disabled: { text: '停用', color: 'error' },
  warning: { text: '停产', color: 'warning' },
};

export default function StatusTag({ value, type = 'yesNo' }) {
  // 空值显示 -
  if (value === undefined || value === null || value === '') {
    return <Tag>-</Tag>;
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

  // yesNo 类型：兼容 '1'、true、'是' 三种真值
  return value === '1' || value === true || value === '是' ? (
    <Tag color={STATUS_MAP.yes.color}>{STATUS_MAP.yes.text}</Tag>
  ) : (
    <Tag>{STATUS_MAP.no.text}</Tag>
  );
}
