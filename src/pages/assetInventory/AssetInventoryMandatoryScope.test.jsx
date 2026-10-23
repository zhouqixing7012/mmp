import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as XLSX from 'xlsx';
import { CreateProjectView } from './AssetInventoryProjectPage';
import { ASSET_ROWS, PROJECT_INFO } from './mockData';
import { getInventoryPhotoSnapshot } from './inventoryPhotoRules';

jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children, title, extra }) => <div>{title}{extra}{children}</div>;
  const Input = ({ value, onChange }) => <input value={value ?? ''} onChange={onChange} />;
  Input.TextArea = Input;
  const DatePicker = Object.assign(() => null, { RangePicker: () => null });
  const Modal = ({ open, children }) => open ? <div role="dialog">{children}</div> : null;
  Modal.confirm = jest.fn();
  return { Alert: Box, Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>, Card: Box,
    Checkbox: Object.assign(Box, { Group: Box }), Collapse: Box, DatePicker, Input, InputNumber: () => null, Modal, Progress: Box, Radio: Box, Select: () => null,
    Space: Box, Statistic: Box, Switch: () => null, Tabs: Box, Tag: Box, Typography: { Text: Box, Title: Box },
    Table: ({ columns = [], dataSource = [] }) => <table aria-label={columns.some((column) => column.title === '是否必盘') ? '必盘范围资产' : '范围分录'}><thead><tr>{columns.map((column, index) => <th key={index}>{column.title}</th>)}</tr></thead><tbody>{dataSource.map((row) => <tr key={row.key}>{columns.map((column, index) => <td key={index}>{column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}</td>)}</tr>)}</tbody></table>,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), info: jest.fn() }, null] },
  };
});
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, DetailItem: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('../../components/AssetQueryControls', () => ({ AssetPersonSelect: () => null, OwnerLevelSelect: () => null, formatAssetCategory: (asset) => asset.subCategory, matchesQuerySelection: () => true }));
const chosen = ASSET_ROWS.slice(2, 4);
const base = { ...PROJECT_INFO, projectNo: 'MAND-SCOPE', projectType: '复盘', initialProjectNo: 'CP-202608180001', createdAt: '2026-08-01', samplingMode: '百分比', samplingRatio: 0, mandatoryNetValueAbove: null, mandatoryNetValueTopPercent: null, photoConfig: { rules: [] } };
beforeEach(() => window.localStorage.clear());

function mandatoryCell(assetTag, table = screen.getByRole('table', { name: '必盘范围资产' })) {
  const row = within(table).getByRole('row', { name: new RegExp(assetTag) });
  return within(row).getAllByRole('cell').at(-1);
}

test('复盘创建范围按必盘阈值标记，查看全部只显示当前范围，快照保留标记', () => {
  render(<CreateProjectView creator="冯丽婷" initialProject={{ ...base, mandatoryNetValueAbove: 0 }} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  chosen.forEach((asset) => expect(mandatoryCell(asset.assetTag)).toHaveTextContent(Number(asset.netValue) > 0 ? '是' : '否'));
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  expect(within(screen.getByRole('dialog')).getAllByRole('row')).toHaveLength(chosen.length + 1);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(getInventoryPhotoSnapshot('MAND-SCOPE').assets.map((asset) => [asset.key, asset.isMandatory])).toEqual(chosen.map((asset) => [asset.key, Number(asset.netValue) > 0]));
});

test('实际导入只更新必盘标记，零比例快照仍纳入人工必盘资产并保存布尔标记', async () => {
  const onGenerated = jest.fn();
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['资产标签号', '是否必盘'], [chosen[0].assetTag, '是'], [chosen[1].assetTag, '否']]), '必盘标记');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  fireEvent.change(screen.getByLabelText('导入必盘标记文件'), { target: { files: [{ name: '必盘标记.xlsx', arrayBuffer: async () => buffer }] } });
  await waitFor(() => expect(mandatoryCell(chosen[0].assetTag)).toHaveTextContent('是'));
  expect(mandatoryCell(chosen[1].assetTag)).toHaveTextContent('否');
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated.mock.calls[0][0].snapshotAssetKeys).toEqual([chosen[0].key]);
  expect(getInventoryPhotoSnapshot('MAND-SCOPE').assets.map((asset) => [asset.key, asset.isMandatory, asset.executeInventory])).toEqual([[chosen[0].key, true, true], [chosen[1].key, false, false]]);
});

test('初盘创建范围不增加复盘专属列和必盘导入入口', () => {
  render(<CreateProjectView creator="213852-孙志强" initialProject={{ ...base, projectType: '初盘' }} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  expect(screen.queryByRole('columnheader', { name: '是否必盘' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '导入必盘标记' })).not.toBeInTheDocument();
});
