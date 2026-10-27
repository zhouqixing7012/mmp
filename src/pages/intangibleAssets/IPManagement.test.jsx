import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import IPManagement from './IPManagement';
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('antd', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Card: ({ children, title }) => <section><h3>{title}</h3>{children}</section>,
  Input: ({ onPressEnter, allowClear, ...props }) => <input {...props} onKeyDown={event => event.key === 'Enter' && onPressEnter()} />,
  Select: () => null,
  Modal: ({ children, open }) => open ? <div>{children}</div> : null,
  Space: ({ children }) => <div>{children}</div>,
  Typography: { Text: ({ children }) => <span>{children}</span>, Title: ({ children }) => <h2>{children}</h2> },
}));
jest.mock('../../components/DetailGrid', () => ({
  DetailGrid: ({ children }) => <dl>{children}</dl>,
  DetailItem: ({ label, children }) => <div>{label}: {children}</div>,
}));
jest.mock('../../components/QueryBar', () => ({
  __esModule: true,
  default: ({ children, onQuery, onReset }) => <div>{children}<button onClick={onQuery}>查询</button><button onClick={onReset}>重置</button></div>,
  QueryItem: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/tableSizing/AutoWidthTable', () => function Table({ columns, dataSource }) {
  return <table><tbody>{dataSource.map(row => <tr key={row.id}>{columns.map((col, i) => <td key={i}>{col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}</td>)}</tr>)}</tbody></table>;
});
beforeAll(() => {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
});
test('查询后进入详情再返回，筛选内容与结果保留；没有办理按钮', () => {
  render(<IPManagement />);
  const input = screen.getByPlaceholderText('请输入IP代码或名称');
  fireEvent.change(input, { target: { value: 'IP2021' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
  expect(screen.queryByText('IP2019CN0060')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('查看详情'));
  expect(screen.getByText('800,000.00')).toBeInTheDocument();
  expect(screen.getByText('已驳回')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '新增采购' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('返回列表'));
  expect(screen.getByPlaceholderText('请输入IP代码或名称')).toHaveValue('IP2021');
  expect(screen.queryByText('IP2019CN0060')).not.toBeInTheDocument();
});
