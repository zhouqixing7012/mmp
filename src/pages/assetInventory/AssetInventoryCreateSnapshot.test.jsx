import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreateProjectView } from './AssetInventoryProjectPage';
import { ASSET_ROWS, PROJECT_INFO } from './mockData';
import { getInventoryPhotoSnapshot } from './inventoryPhotoRules';

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
    initialProject={{ ...PROJECT_INFO, projectNo: 'PHOTO1', photoConfig }}
    scopeAssetKeys={chosen.map(asset => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated.mock.calls[0][0].photoConfig).toEqual(photoConfig);
  expect(getInventoryPhotoSnapshot('PHOTO1').assets.map(asset => asset.needPhoto)).toEqual(chosen.map(asset => asset.inventoryRange === chosen[0].inventoryRange));
  view.unmount();
  render(<CreateProjectView creator="213852-孙志强"
    initialProject={{ ...PROJECT_INFO, projectNo: 'PHOTO2', photoConfig: { ...photoConfig, enabled: false } }}
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
    initialProject={{ ...PROJECT_INFO, projectType: '复盘', initialProjectNo: 'CP-202607010001', samplingMode: '百分比', samplingRatio: 0, mandatoryNetValueAbove: 0, startDate: '2026-09-01', endDate: '2026-09-03' }}
    scopeAssetKeys={chosen.map((asset) => asset.key)}
    onBack={() => {}}
    onGenerated={onGenerated}
  />);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated).toHaveBeenCalledTimes(1);
  const generated = onGenerated.mock.calls[0][0];
  expect(generated.endDate).toBe('2026-09-03');
  expect(generated.scopeSnapshotAssetKeys).toEqual(chosen.map((asset) => asset.key));
  expect(generated.snapshotAssetKeys).toEqual(chosen.filter((asset) => asset.executeInventory && Number(asset.netValue) > 0).map((asset) => asset.key));
});
