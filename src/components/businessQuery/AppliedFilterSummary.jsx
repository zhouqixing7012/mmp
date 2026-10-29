import React from 'react';
import { Button, Tag, Tooltip, Typography } from 'antd';

export function filterSummaryItems(fields, values, keyFor, optionsFor) {
  return fields.flatMap(field => {
    const value = values[keyFor(field)];
    if (value == null || value === '' || (Array.isArray(value) && !value.some(item => item != null && item !== ''))) return [];
    const dateRange = field.type === 'daterange' || field.kind === 'date';
    const options = !dateRange && optionsFor ? optionsFor(field) : [];
    const display = item => item == null || item === '' ? '不限' : String(options.find(option => String(option.value) === String(item))?.label ?? item);
    return [{ label: field.label, text: Array.isArray(value) ? value.map(display).join(dateRange ? ' 至 ' : '、') : display(value) }];
  });
}

export default function AppliedFilterSummary({ items, onClear }) {
  if (!items.length) return null;
  const all = items.map(item => item.label + '：' + item.text).join('；');
  return <div className="mmp-applied-filters" aria-label="已生效筛选条件">
    <Typography.Text type="secondary">结果筛选：</Typography.Text>
    {items.slice(0, 3).map(item => <Tag key={item.label}><Tooltip title={item.label + '：' + item.text}><span className="mmp-filter-summary-value">{item.label}：{item.text}</span></Tooltip></Tag>)}
    {items.length > 3 && <Tooltip title={all}><Typography.Text type="secondary">另 {items.length - 3} 项</Typography.Text></Tooltip>}
    {onClear && <Button type="link" size="small" onClick={onClear}>清除筛选</Button>}
  </div>;
}
