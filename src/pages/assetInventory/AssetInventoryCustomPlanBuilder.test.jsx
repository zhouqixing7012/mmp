import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import { downloadInventoryPlanAssets } from './inventoryPlanExport';

jest.mock('./inventoryPlanExport', () => ({ downloadInventoryPlanAssets: jest.fn() }));
jest.mock('antd', () => {
  const Box = ({ children, title, extra }) => <section>{title}{extra}{children}</section>;
  const Input = ({ value, onChange, placeholder, readOnly, onClick }) => <input value={value || ''} readOnly={readOnly} onChange={onChange} placeholder={placeholder} onClick={onClick} />;
  const DatePicker = Object.assign(() => null, { RangePicker: () => null });
  return { Card: Box, Space: Box, Typography: { Text: Box, Title: Box }, Input, DatePicker, TreeSelect: () => null, InputNumber: () => null, Checkbox: { Group: () => null },
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Modal: ({ open, children, title, footer, onOk }) => open ? <div role="dialog" aria-label={title}>{children}{footer}{onOk && <button onClick={onOk}>确定</button>}</div> : null,
    Table: ({ columns, dataSource, rowSelection }) => <div>{dataSource.map(row => <div key={row.key}>{rowSelection && <button onClick={() => rowSelection.onChange([row.key])}>选择-{row.assetTag}</button>}{columns.map((column, index) => <span key={index}>{column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}</span>)}</div>)}</div>,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), error: jest.fn() }, null] } };
});
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, AssetValueSelect: () => null, OwnerLevelSelect: () => null, formatAssetCategory: asset => asset.category, matchesQuerySelection: () => true }));
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, QueryItem: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/SelectModal', () => () => null);
jest.mock('../../components/StatusTag', () => () => null);

const assets = [{ key: 'a', assetTag: 'A', owner: '甲', inventoryRange: '员工', organization: '公司甲' }, { key: 'b', assetTag: 'B', owner: '乙', inventoryRange: '员工', organization: '公司甲' }];
beforeEach(() => jest.clearAllMocks());

test('初始资产可见，生成查询后单范围查看及查看全部展示真实匹配清单', () => {
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={{ projectType: '初盘' }} />);
  expect(screen.getByRole('button', { name: '选择-A' })).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('请输入标签号'), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  expect(screen.queryByRole('button', { name: '选择-B' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '查看' }));
  expect(within(screen.getByRole('dialog', { name: '范围资产清单' })).getByText('A')).toBeInTheDocument();
  expect(within(screen.getByRole('dialog')).queryByText('B')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '关闭' }));
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  expect(within(screen.getByRole('dialog', { name: '全部范围资产清单' })).getByText('A')).toBeInTheDocument();
});

test('删除资产后重复生成不补回，导出使用最终资产集合', () => {
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={{ projectNo: 'P', projectType: '初盘' }} />);
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getByRole('button', { name: '选择-A' }));
  const deletes = screen.getAllByRole('button', { name: '删除' });
  fireEvent.click(deletes[deletes.length - 1]);
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getByRole('button', { name: '导出清册' }));
  expect(downloadInventoryPlanAssets).toHaveBeenCalledWith([assets[1]], 'P');
  fireEvent.click(screen.getByRole('button', { name: '删除全部' }));
  expect(screen.queryByRole('button', { name: '选择-B' })).not.toBeInTheDocument();
});
