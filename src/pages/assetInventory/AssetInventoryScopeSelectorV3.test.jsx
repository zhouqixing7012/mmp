import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetInventoryScopeSelectorV3 from './AssetInventoryScopeSelectorV3';

jest.mock('./mockData', () => ({ SCOPE_ROWS: [], ASSET_ROWS: [
  { key: 'a', assetTag: 'A', organization: '甲公司', ownerDept: '研发部.一组', inventoryRange: '员工' },
  { key: 'b', assetTag: 'B', organization: '甲公司', ownerDept: '财务部', inventoryRange: '员工' },
  { key: 'c', assetTag: 'C', organization: '乙公司', ownerDept: '研发部', inventoryRange: '机房' },
] }));
jest.mock('./AssetInventoryVariantContext', () => ({
  useAssetInventoryVariant: () => ({ allowedRanges: ['员工'] }),
  isInventoryRangeAllowed: (asset, ranges) => ranges.includes(asset.inventoryRange),
}));
jest.mock('../../mock/businessRulesMock', () => Object.fromEntries(['mockBuildings', 'mockCities', 'mockLocationBasicDataData', 'mockWarehouseInfoData', 'mockWarehouses'].map(key => [key, []])));
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, OwnerLevelSelect: () => null }));
jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children, title }) => <div>{title}{children}</div>;
  const TreeSelect = ({ treeData, onChange }) => <div>{treeData.map(node => <button key={node.value} onClick={() => onChange([node.value])}>{`选择${node.title}`}</button>)}</div>;
  TreeSelect.SHOW_PARENT = 'SHOW_PARENT';
  return {
    Card: Box, Space: Box, Typography: { Text: Box }, TreeSelect,
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Select: () => null, InputNumber: () => null, DatePicker: { RangePicker: () => null }, Modal: () => null,
    Table: ({ dataSource, columns }) => <div>{dataSource.map(row => <div key={row.key}><span>{`${row.organization}: ${row.department}`}</span>{columns.find(column => column.title === '清单').render(null, row)}</div>)}</div>,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn() }, null] },
  };
});

test('项目只有公司部门合并树，候选受范围限制，选公司生成其全部部门资产', () => {
  const changed = jest.fn();
  render(<AssetInventoryScopeSelectorV3 onScopeAssetsChange={changed} />);
  expect(screen.getByText('子公司/部门:')).toBeInTheDocument();
  expect(screen.queryByText('子公司:')).toBeNull();
  expect(screen.queryByText('部门:')).toBeNull();
  expect(screen.queryByRole('button', { name: '选择乙公司' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '选择甲公司' }));
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  expect(changed).toHaveBeenLastCalledWith(['a', 'b']);
  expect(screen.getByText('甲公司: 研发部.一组、财务部')).toBeInTheDocument();
});


test('查看范围分录和查看全部通知下方明细切换，不打开清单弹窗', () => {
  const preview = jest.fn();
  render(<AssetInventoryScopeSelectorV3 onPreviewAssets={preview} />);
  fireEvent.click(screen.getByRole('button', { name: '选择甲公司' }));
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getByRole('button', { name: '查看' }));
  expect(preview).toHaveBeenLastCalledWith(['a', 'b']);
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  expect(preview).toHaveBeenLastCalledWith(null);
});


test('初始范围不展示无资产关联的示例查看按钮；生成后可查看，删除全部清空范围', () => {
  const changed = jest.fn();
  render(<AssetInventoryScopeSelectorV3 onScopeAssetsChange={changed} />);
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(screen.queryByRole('button', { name: '查看', exact: true })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  expect(changed).toHaveBeenLastCalledWith(['a', 'b']);
  fireEvent.click(screen.getByRole('button', { name: '删除全部' }));
  expect(changed).toHaveBeenLastCalledWith([]);
});
