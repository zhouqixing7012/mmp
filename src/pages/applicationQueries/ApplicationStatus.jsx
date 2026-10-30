import React from 'react';
import StatusTag from '../../components/StatusTag';

// 申请菜单统一业务状态样式；空值保持缺省，数字编码不按是/否解释。
export default function ApplicationStatus({ value }) {
  if (value == null || (typeof value === 'string' && (!value.trim() || value.trim() === '-'))) return '-';
  return <StatusTag value={value} type="business" />;
}
export const renderApplicationStatus = value => <ApplicationStatus value={value} />;
