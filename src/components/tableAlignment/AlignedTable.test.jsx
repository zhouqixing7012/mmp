import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AlignedTable from './AlignedTable';
jest.mock('antd', () => {
  const React = require('react');
  const Summary = () => null;
  const Table = React.forwardRef(({ columns, dataSource, onChange, rowSelection, summary }, ref) => {
    React.useImperativeHandle(ref, () => ({ scrollTo: jest.fn() }));
    return <><table><thead><tr>{columns.map(c => <th key={c.key} style={c.onHeaderCell?.().style}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map(r => <tr key={r.id}>{columns.map(c => <td key={c.key} style={c.onCell?.(r).style}>{c.render ? c.render(r[c.dataIndex], r) : r[c.dataIndex]}</td>)}</tr>)}</tbody></table><button onClick={() => onChange({ current: 2 }, {}, { columnKey: 'amount' }, { action: 'paginate' })}>下一页</button><button onClick={() => rowSelection.onChange(['one'])}>选择</button>{summary?.()}</>;
  }); Table.Summary = Summary; return { Table };
});
test('对齐保持渲染值、选择、分页回调、汇总接口及ref', () => {
  const onChange = jest.fn(), selected = jest.fn(), ref = createRef();
  render(<AlignedTable ref={ref} columns={[{ key: 'tag', title: '标签号', dataIndex: 'tag' }, { key: 'amount', title: '金额', dataIndex: 'amount', render: value => value.toFixed(2) }]} dataSource={[{ id: 'one', tag: '000123', amount: 0 }]} onChange={onChange} rowSelection={{ onChange: selected }} summary={() => <AlignedTable.Summary />} />);
  expect(screen.getByRole('columnheader', { name: '标签号' })).toHaveStyle({ textAlign: 'left' });
  expect(screen.getByRole('columnheader', { name: '金额' })).toHaveStyle({ textAlign: 'right' });
  expect(screen.getByRole('cell', { name: '000123' })).toHaveStyle({ textAlign: 'left' });
  expect(screen.getByRole('cell', { name: '0.00' })).toHaveStyle({ textAlign: 'right' });
  fireEvent.click(screen.getByText('下一页')); expect(onChange.mock.calls[0][0]).toEqual({ current: 2 });
  fireEvent.click(screen.getByText('选择')); expect(selected).toHaveBeenCalledWith(['one']);
  expect(ref.current.scrollTo).toBeDefined();
});
