import React from 'react';
import { Card, Tooltip } from 'antd';
import Table from '../tableAlignment/AlignedTable';
import AutoWidthTable from '../tableSizing/AutoWidthTable';
import SectionCardTitle from '../SectionCardTitle';
import TableEmptyState from '../TableEmptyState';
import './businessQuery.css';

function displayText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(displayText).join('');
  if (React.isValidElement(node)) return displayText(node.props.children);
  return '';
}

// 查询和只读明细统一密度、全文提示与空状态；业务值、排序和导出由调用方维护。
export default function BusinessTable({ columns, rowHeight = 40, autoWidth = false, filtered = false, locale, className = '', ...props }) {
  const height = [32, 40, 44, 48].includes(rowHeight) ? rowHeight : 40;
  const prepare = items => items.map(column => {
    if (column.children) return { ...column, children: prepare(column.children) };
    if (column.ellipsis === false) return column;
    const render = column.render;
    return { ...column, ellipsis: { showTitle: false }, render: (value, row, index) => {
      const content = render ? render(value, row, index) : value;
      const text = displayText(content) || displayText(value);
      return text ? <Tooltip title={text}><span className="mmp-business-cell-value">{content}</span></Tooltip> : content;
    } };
  });
  const Component = autoWidth ? AutoWidthTable : Table;
  return <div className="mmp-business-table" style={{ '--mmp-table-row-height': height + 'px' }}>
    <Component size="small" bordered scroll={{ x: 'max-content' }} {...props}
      className={className} columns={prepare(columns)}
      locale={{ ...locale, emptyText: <TableEmptyState filtered={filtered} description={locale?.emptyText} /> }} />
  </div>;
}
BusinessTable.Summary = Table.Summary;

export function BusinessCard({ title, size = 'small', className = '', ...props }) {
  return <Card {...props} size={size} className={`mmp-business-card ${className}`.trim()}
    title={title ? <SectionCardTitle>{title}</SectionCardTitle> : undefined} />;
}
