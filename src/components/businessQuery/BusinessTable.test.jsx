import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BusinessTable from './BusinessTable';
import { filterSummaryItems } from './AppliedFilterSummary';

jest.mock('antd', () => {
  const React = require('react');
  const Table = ({ columns, dataSource, pagination, onChange, locale }) => <><table><tbody>{dataSource.map(row => <tr key={row.id}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row[column.dataIndex], row, 0) : row[column.dataIndex]}</td>)}</tr>)}</tbody></table>{pagination && <button onClick={() => onChange({ current: 2, pageSize: pagination.pageSize })}>下一页</button>}{!dataSource.length && locale.emptyText}</>;
  return { Table, Tooltip: ({ children, title }) => <span data-tooltip={title}>{children}</span>, Empty: ({ description }) => <div>{description}</div>,
    theme: { useToken: () => ({ token: { fontSize: 14, fontFamily: 'sans-serif' } }) } };
});

beforeEach(() => {
  window.ResizeObserver = class { observe() {} disconnect() {} };
});
test('自动列宽表格保留分页回调及原始格式化结果，完整值提供提示', () => {
  const changed = jest.fn();
  render(<BusinessTable autoWidth rowHeight={48} rowKey="id" columns={[{ key: 'amount', dataIndex: 'amount', title: '金额', render: value => value.toFixed(2) }]}
    dataSource={[{ id: 'one', amount: 0 }]} pagination={{ current: 1, pageSize: 10 }} onChange={changed} />);
  expect(screen.getByText('0.00')).toBeInTheDocument();
  expect(document.querySelector('[data-tooltip]')).toHaveAttribute('data-tooltip', '0.00');
  expect(document.querySelector('.mmp-business-table').style.getPropertyValue('--mmp-table-row-height')).toBe('48px');
  fireEvent.click(screen.getByRole('button', { name: '下一页' }));
  expect(changed).toHaveBeenCalledWith({ current: 2, pageSize: 10 });
});
test('空结果保留专属提示，条件摘要保留零值、真实名称及单端日期', () => {
  render(<BusinessTable columns={[]} dataSource={[]} locale={{ emptyText: '暂无待发放物资记录' }} />);
  expect(screen.getByText('暂无待发放物资记录')).toBeInTheDocument();
  const fields = [{ key: 'company', label: '公司' }, { key: 'amount', label: '金额' }, { key: 'dates', label: '日期', type: 'daterange' }, { key: 'blank', label: '空值' }];
  expect(filterSummaryItems(fields, { company: '114', amount: 0, dates: [null, '2026-10-29'], blank: [] }, field => field.key, () => [{ value: '114', label: '新媒体' }])).toEqual([
    { label: '公司', text: '新媒体' }, { label: '金额', text: '0' }, { label: '日期', text: '不限 至 2026-10-29' },
  ]);
});
