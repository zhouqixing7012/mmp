import { AssetInventoryVariantProvider } from './AssetInventoryVariantContext';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreateProjectView } from './AssetInventoryProjectPage';
import { ASSET_ROWS, PROJECT_INFO } from './mockData';
import { getInventoryPhotoSnapshot, normalizeInventoryPhotoConfig } from './inventoryPhotoRules';

beforeEach(() => window.localStorage.clear());

jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children, title, extra }) => <div>{title}{extra}{children}</div>;
  const Input = ({ value, onChange }) => <input value={value ?? ''} onChange={onChange} />;
  Input.TextArea = Input;
  const Select = () => <div />;
  const DatePicker = () => <div />;
  DatePicker.RangePicker = () => <div />;
  const Modal = ({ children, open }) => open ? <div>{children}</div> : null;
  Modal.confirm = jest.fn();
  return {
    Alert: Box, Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Card: Box, Checkbox: Box, Collapse: Box, DatePicker, Input,
    InputNumber: () => <div />, Modal, Progress: Box, Radio: Box, Select,
    Space: Box, Statistic: Box, Switch: () => <div />, Table: () => <div />,
    Tabs: Box, Tag: Box, Typography: { Text: Box, Title: Box },
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), info: jest.fn() }, null] },
  };
});

test('生成快照写入配置抽取标记，关闭上传清除预置标记', () => {
  const chosen = ASSET_ROWS.slice(2, 4);
  const onGenerated = jest.fn();
  const photoConfig = { enabled: true, rules: [{ range: chosen[0].inventoryRange, percent: 100 }] };
  const view = render(<CreateProjectView creator="213852-孙志强"
    initialProject={{ ...PROJECT_INFO, createdAt: '2026-08-01', projectNo: 'PHOTO1', photoConfig }}
    scopeAssetKeys={chosen.map(asset => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  expect(screen.getByText('盘点资产范围明细').compareDocumentPosition(screen.getByText('图片上传规则配置')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated.mock.calls[0][0].photoConfig).toEqual(normalizeInventoryPhotoConfig(photoConfig));
  expect(getInventoryPhotoSnapshot('PHOTO1').assets.map(asset => asset.needPhoto)).toEqual(chosen.map(asset => asset.inventoryRange === chosen[0].inventoryRange));
  view.unmount();
  render(<CreateProjectView creator="213852-孙志强"
    initialProject={{ ...PROJECT_INFO, createdAt: '2026-08-01', projectNo: 'PHOTO2', photoConfig: { ...photoConfig, enabled: false } }}
    scopeAssetKeys={chosen.map(asset => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(getInventoryPhotoSnapshot('PHOTO2').assets.every(asset => !asset.needPhoto)).toBe(true);
});
jest.mock('../../components/DetailGrid', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
  DetailItem: ({ children }) => <div>{children}</div>,
}));

beforeAll(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {} }));
  global.ResizeObserver = global.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
});

test('创建复盘快照仅取当前范围并应用必盘规则，保留跨天项目日期', () => {
  const onGenerated = jest.fn();
  const chosen = ASSET_ROWS.slice(2, 4);
  render(<CreateProjectView
    creator="冯丽婷"
    initialProject={{ ...PROJECT_INFO, createdAt: '2026-08-01', projectType: '复盘', initialProjectNo: 'CP-202608180001', samplingMode: '百分比', samplingRatio: 0, mandatoryNetValueAbove: 0, startDate: '2026-09-01', endDate: '2026-09-03' }}
    scopeAssetKeys={chosen.map((asset) => asset.key)}
    onBack={() => {}}
    onGenerated={onGenerated}
  />);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated).toHaveBeenCalledTimes(1);
  const generated = onGenerated.mock.calls[0][0];
  expect(generated.endDate).toBe('2026-09-03');
  expect(generated.scopeSnapshotAssetKeys).toEqual(chosen.map((asset) => asset.key));
  expect(generated.snapshotAssetKeys).toEqual(chosen.filter((asset) => Number(asset.netValue) > 0).map((asset) => asset.key));
});


test('机房复盘展示人工图片规则区域，机房初盘不展示人工规则', () => {
  const props = { creator: '冯丽婷', onBack: () => {}, initialProject: { ...PROJECT_INFO, projectNo: 'MR', projectType: '复盘' } };
  const view = render(<AssetInventoryVariantProvider allowedRanges={['机房']}><CreateProjectView {...props} /></AssetInventoryVariantProvider>);
  expect(screen.getByText('图片上传规则配置')).toBeInTheDocument();
  view.unmount();
  render(<AssetInventoryVariantProvider allowedRanges={['机房']}><CreateProjectView {...props} initialProject={{ ...props.initialProject, projectType: '初盘' }} /></AssetInventoryVariantProvider>);
  expect(screen.queryByText('图片上传规则配置')).not.toBeInTheDocument();
});


test('关联新非机房初盘后直接带出4条执行范围，生成查询有真实资产可纳入', () => {
  const { NON_ROOM_REPLAY_DEMO_PROJECT } = require('../../mock/inventoryNonRoomReplayDemo');
  render(<CreateProjectView creator="冯丽婷" initialProject={{ ...PROJECT_INFO, projectNo: 'RCP-NR-DEMO', projectType: '复盘', initialProjectNo: NON_ROOM_REPLAY_DEMO_PROJECT.projectNo }} onBack={() => {}} onGenerated={() => {}} />);
  expect(screen.getByText('共 4 条')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  expect(screen.getByText('共 4 条')).toBeInTheDocument();
});
