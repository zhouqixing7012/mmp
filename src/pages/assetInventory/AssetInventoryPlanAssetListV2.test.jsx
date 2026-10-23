import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AssetInventoryPlanAssetListV2 } from './AssetInventoryPlanViewsV2';
jest.mock('antd', () => {
  const Box = ({ children, extra, title }) => <section>{title}{extra}{children}</section>;
  const Input = ({ value, onClick, readOnly }) => <input value={value || ''} readOnly={readOnly} onClick={onClick} onChange={() => {}} />;
  return { Alert: Box, Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>, Card: Box, Space: Box, Typography: { Text: Box, Title: Box }, Input,
    DatePicker: Object.assign(() => null, { RangePicker: () => null }), Modal: () => null, Select: () => null,
    Table: ({ columns, dataSource }) => <div>{columns.map(col => <span key={col.key || col.dataIndex}>{col.title}</span>)}{dataSource.map(row => <div key={row.key}>{columns.map(col => <div key={col.key || col.dataIndex}>{col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}</div>)}</div>)}</div>,
    message: { useMessage: () => [{ error: jest.fn(), success: jest.fn() }, null] } };
});
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, AssetValueSelect: () => null, OwnerLevelSelect: () => null, formatAssetCategory: () => '', matchesAssetCategory: () => true, matchesQuerySelection: () => true }));
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: () => null, QueryItem: () => null }));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('../../components/SelectModal', () => () => null);
jest.mock('./InventoryLabelScanner', () => () => <div role="dialog">扫码枪扫描</div>);
const props = { plan: { planNo: 'P', status: '盘点中' }, project: { projectNo: 'J', projectType: '初盘' }, currentOperator: '213852-孙志强', assets: [{ key: 'a', assetTag: 'A', supervisor: '监督甲', executor: '执行乙', inventoryRemark: '盘点说明值', uncountedNote: '未盘原因值', accountBook: '账套甲' }], onAssetsChange: jest.fn() };
test('孙志强从盘点中计划资产清单进入标签扫描，启动后人员只读', () => {
  render(<AssetInventoryPlanAssetListV2 {...props} />);
  fireEvent.click(screen.getByRole('button', { name: '标签扫描' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('扫码枪扫描');
  expect(screen.getByText('监督甲')).toBeInTheDocument();
  expect(screen.getByText('执行乙')).toBeInTheDocument();
  expect(screen.queryByDisplayValue('执行乙')).not.toBeInTheDocument();
  expect(screen.getByText('盘点说明值')).toBeInTheDocument();
  expect(screen.getByText('未盘原因值')).toBeInTheDocument();
  expect(screen.getByText('账套甲')).toBeInTheDocument();
});
test('非ES、草稿或项目关闭不开放标签扫描', () => {
  const { rerender } = render(<AssetInventoryPlanAssetListV2 {...props} currentOperator="冯丽婷" />);
  expect(screen.queryByRole('button', { name: '标签扫描' })).not.toBeInTheDocument();
  rerender(<AssetInventoryPlanAssetListV2 {...props} plan={{ ...props.plan, status: '草稿' }} />);
  expect(screen.queryByRole('button', { name: '标签扫描' })).not.toBeInTheDocument();
  rerender(<AssetInventoryPlanAssetListV2 {...props} project={{ ...props.project, status: '盘点关闭' }} />);
  expect(screen.queryByRole('button', { name: '标签扫描' })).not.toBeInTheDocument();
});

test('计划资产清单显示是否必盘，兼容历史项目必盘键', () => {
  render(<AssetInventoryPlanAssetListV2 {...props} project={{ ...props.project, projectType: '复盘', mandatoryAssetKeys: ['a'] }} />);
  expect(screen.getByText('是否必盘')).toBeInTheDocument();
  expect(screen.getByText('是', { exact: true })).toBeInTheDocument();
});
