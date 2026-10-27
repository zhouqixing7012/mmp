import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import { downloadInventoryPlanAssets } from './inventoryPlanExport';

jest.mock('./inventoryPlanExport', () => ({ ...jest.requireActual('./inventoryPlanExport'), downloadInventoryPlanAssets: jest.fn() }));
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
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: ({ children, onQuery }) => <div>{children}<button onClick={onQuery}>清册查询</button></div>, QueryItem: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/SelectModal', () => () => null);
jest.mock('../../components/StatusTag', () => () => null);

const assets = [{ key: 'a', assetTag: 'A', owner: '甲', inventoryRange: '员工', organization: '公司甲' }, { key: 'b', assetTag: 'B', owner: '乙', inventoryRange: '员工', organization: '公司甲' }];
beforeEach(() => jest.clearAllMocks());

test('自定义复盘清册空查询回退本次纳入资产并传递必盘上下文，非空照查询', () => {
  const project = { projectNo: 'R', projectType: '复盘', mandatoryAssetKeys: ['a'] };
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={project} />);
  fireEvent.change(screen.getByPlaceholderText('请输入资产标签号'), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: '清册查询' }));
  fireEvent.click(screen.getByRole('button', { name: '导出清册' }));
  expect(downloadInventoryPlanAssets).toHaveBeenLastCalledWith([assets[0]], 'R', { project });
  fireEvent.change(screen.getByPlaceholderText('请输入资产标签号'), { target: { value: '不存在' } });
  fireEvent.click(screen.getByRole('button', { name: '清册查询' }));
  fireEvent.click(screen.getByRole('button', { name: '导出清册' }));
  expect(downloadInventoryPlanAssets).toHaveBeenLastCalledWith(assets, 'R', { project });
});

test('范围批次查看直接切换下方清单，查看全部恢复全部批次，生成计划仍取完整范围', () => {
  const onConfirmPlan = jest.fn();
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={{ projectType: '初盘' }} onConfirmPlan={onConfirmPlan} />);
  fireEvent.change(screen.getByPlaceholderText('请输入标签号'), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.change(screen.getByPlaceholderText('请输入标签号'), { target: { value: 'B' } });
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: '选择-A' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '选择-B' })).toBeNull();
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[1]);
  expect(screen.getByRole('button', { name: '选择-B' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '选择-A' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '生成计划' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '确定' }));
  expect(onConfirmPlan.mock.calls[0][0].assets).toEqual(assets);
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  expect(screen.getByRole('button', { name: '选择-A' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '选择-B' })).toBeInTheDocument();
});

test('删除资产后重复生成不补回，导出使用最终资产集合', () => {
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={{ projectNo: 'P', projectType: '初盘' }} />);
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getByRole('button', { name: '选择-A' }));
  const deletes = screen.getAllByRole('button', { name: '删除' });
  fireEvent.click(deletes[deletes.length - 1]);
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getByRole('button', { name: '导出清册' }));
  expect(downloadInventoryPlanAssets).toHaveBeenCalledWith([assets[1]], 'P', { project: { projectNo: 'P', projectType: '初盘' } });
  fireEvent.click(screen.getByRole('button', { name: '删除全部' }));
  expect(screen.queryByRole('button', { name: '选择-B' })).not.toBeInTheDocument();
});

test('自定义同范围跨公司保留同一份计划草稿，不阻止或按公司拆分', () => {
  const onConfirmPlan = jest.fn();
  const source = [assets[0], { ...assets[1], organization: '公司乙' }];
  render(<AssetInventoryCustomPlanBuilder initialAssets={source} project={{ projectType: '初盘' }} onConfirmPlan={onConfirmPlan} />);
  fireEvent.click(screen.getByRole('button', { name: '生成计划' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '确定' }));
  expect(onConfirmPlan).toHaveBeenCalledTimes(1);
  expect(onConfirmPlan.mock.calls[0][0].assets).toEqual(source);
  expect(onConfirmPlan.mock.calls[0][0].rows.find(row => row.range === '员工').assets).toHaveLength(2);
});

test('自定义公共计划弹窗直接显示创建人为默认监督人，执行人空', () => {
  const onConfirmPlan = jest.fn();
  render(<AssetInventoryCustomPlanBuilder initialAssets={[{ ...assets[0], inventoryRange: '公共' }]} project={{ projectType: '初盘', creator: '213852-孙志强' }} onConfirmPlan={onConfirmPlan} />);
  fireEvent.click(screen.getByRole('button', { name: '生成计划' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByDisplayValue('孙志强')).toBeInTheDocument();
  expect(within(dialog).getAllByPlaceholderText('选填').map(input => input.value)).toEqual(['孙志强', '']);
  fireEvent.click(within(dialog).getByRole('button', { name: '确定' }));
  expect(onConfirmPlan.mock.calls[0][0].rows.find(row => row.range === '公共').assets[0]).toMatchObject({ supervisor: '孙志强', executor: '-' });
});


test('删除正在查看的范围分录后，恢复显示剩余批次资产而不残留旧查看条件', () => {
  render(<AssetInventoryCustomPlanBuilder initialAssets={assets} project={{ projectType: '初盘' }} />);
  fireEvent.change(screen.getByPlaceholderText('请输入标签号'), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.change(screen.getByPlaceholderText('请输入标签号'), { target: { value: 'B' } });
  fireEvent.click(screen.getByRole('button', { name: '生成查询' }));
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: '删除', exact: true })[0]);
  expect(screen.queryByRole('button', { name: '选择-A' })).toBeNull();
  expect(screen.getByRole('button', { name: '选择-B' })).toBeInTheDocument();
});
