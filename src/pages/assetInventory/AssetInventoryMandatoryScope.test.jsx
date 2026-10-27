import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as XLSX from 'xlsx';
import { CreateProjectView } from './AssetInventoryProjectPage';
import AssetInventoryProjectPageV3 from './AssetInventoryProjectPageV3';
import { ASSET_ROWS, PROJECT_INFO } from './mockData';
import { getInventoryPhotoSnapshot, saveInventoryPhotoSnapshot } from './inventoryPhotoRules';
import { INVENTORY_MANDATORY_IMPORT_HEADERS as importHeader } from './inventoryMandatoryImport';
import { INVENTORY_PROJECT_NUMBER_KEY } from './inventoryProjectNumberAllocator';

const mockWarning = jest.fn();
jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));

jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children, title, extra }) => <div>{title}{extra}{children}</div>;
  const Input = ({ value, onChange, 'aria-label': ariaLabel }) => <input aria-label={ariaLabel} value={value ?? ''} onChange={onChange} />;
  Input.TextArea = Input;
  const DatePicker = Object.assign(() => null, { RangePicker: () => null });
  const Modal = ({ open, children }) => open ? <div role="dialog">{children}</div> : null;
  Modal.confirm = jest.fn();
  const Card = ({ children, title, extra }) => <div className="ant-card"><div className="ant-card-head-title">{title}</div>{extra}{children}</div>;
  return { Alert: Box, TreeSelect: ({ treeData, onChange }) => <div>{treeData.map(node => <button key={node.value} onClick={() => onChange([node.value])}>{`筛选组织${node.title}`}</button>)}</div>, Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>, Card,
    Checkbox: Object.assign(Box, { Group: Box }), Collapse: Box, DatePicker, Input, InputNumber: () => null, Modal, Progress: Box, Radio: Box,
    Select: ({ 'aria-label': ariaLabel, value, options, onChange, disabled }) => ['项目类型', '盘点类型', '盘点期间'].includes(ariaLabel) ? <select aria-label={ariaLabel} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : null,
    Space: Box, Statistic: Box, Switch: () => null, Tabs: Box, Tag: Box, Typography: { Text: Box, Title: ({ children }) => <h4 className="ant-typography">{children}</h4> },
    Table: ({ columns = [], dataSource = [], rowSelection }) => <table aria-label={columns.some((column) => column.title === '是否必盘') ? '必盘范围资产' : '范围分录'}><thead><tr>{columns.map((column, index) => <th key={index}>{column.title}</th>)}</tr></thead><tbody>{dataSource.map((row) => <tr key={row.key}>{columns.map((column, index) => <td key={index}>{index === 0 && rowSelection && <input type="checkbox" aria-label={`选择资产${row.assetTag || row.key}`} onChange={() => rowSelection.onChange([row.key])} />}{column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}</td>)}</tr>)}</tbody></table>,
    message: { useMessage: () => [{ warning: mockWarning, success: jest.fn(), info: jest.fn() }, null] },
  };
});
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, DetailItem: ({ children, label }) => <div role="group" aria-label={label}>{children}</div> }));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, OwnerLevelSelect: () => null, formatAssetCategory: (asset) => asset.subCategory, matchesQuerySelection: () => true }));
const chosen = ASSET_ROWS.slice(2, 4);
const base = { ...PROJECT_INFO, creator: '冯丽婷', projectNo: 'MAND-SCOPE', projectType: '复盘', initialProjectNo: 'CP-202608180001', createdAt: '2026-08-01', samplingMode: '百分比', samplingRatio: 0, mandatoryNetValueAbove: null, mandatoryNetValueTopPercent: null, photoConfig: { rules: [] } };
beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); mockWarning.mockClear(); XLSX.writeFile.mockClear(); });

function mandatoryCell(assetTag, table = screen.getByRole('table', { name: '必盘范围资产' })) {
  const row = within(table).getByRole('row', { name: new RegExp(assetTag) });
  return within(row).getAllByRole('cell').at(-1);
}

function scopeFile(assets) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([importHeader, ...assets.map((asset) => importHeader.map((name) => name === '资产标签号' ? asset.assetTag : name === '是否必盘' ? asset.isMandatory ? '是' : '否' : ''))]), '盘点清单');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return { name: '盘点清单.xlsx', arrayBuffer: async () => buffer };
}

function importFile(assets) {
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [scopeFile(assets)] } });
}

test('复盘创建范围按必盘阈值标记，查看全部只显示当前范围，快照保留标记', () => {
  render(<CreateProjectView creator="冯丽婷" initialProject={{ ...base, mandatoryNetValueAbove: 0 }} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  chosen.forEach((asset) => expect(mandatoryCell(asset.assetTag)).toHaveTextContent(Number(asset.netValue) > 0 ? '是' : '否'));
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(within(screen.getByRole('table', { name: '必盘范围资产' })).getAllByRole('row')).toHaveLength(chosen.length + 1);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(getInventoryPhotoSnapshot('MAND-SCOPE').assets.map((asset) => [asset.key, asset.isMandatory])).toEqual(chosen.map((asset) => [asset.key, Number(asset.netValue) > 0]));
});

test('实际导入只更新必盘标记，零比例快照仍纳入人工必盘资产并保存布尔标记', async () => {
  const onGenerated = jest.fn();
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([importHeader, ...chosen.map((asset, index) => importHeader.map((name) => name === '资产标签号' ? asset.assetTag : name === '是否必盘' ? index === 0 ? '是' : '否' : ''))]), '盘点清单');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [{ name: '盘点清单.xlsx', arrayBuffer: async () => buffer }] } });
  await waitFor(() => expect(mandatoryCell(chosen[0].assetTag)).toHaveTextContent('是'));
  expect(mandatoryCell(chosen[1].assetTag)).toHaveTextContent('否');
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated.mock.calls[0][0].snapshotAssetKeys).toEqual([chosen[0].key]);
  expect(getInventoryPhotoSnapshot('MAND-SCOPE').assets.map((asset) => [asset.key, asset.isMandatory, asset.executeInventory])).toEqual([[chosen[0].key, true, true], [chosen[1].key, false, false]]);
});

test('初盘创建范围不增加复盘专属列和必盘导入入口', () => {
  render(<CreateProjectView creator="213852-孙志强" initialProject={{ ...base, projectType: '初盘' }} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  expect(screen.queryByRole('columnheader', { name: '是否必盘' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '清单模板' })).not.toBeInTheDocument();
});

test('清单替换整个范围并能重新纳入当前查询内已删除的初盘资产，数量比例同步', async () => {
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  expect(screen.getAllByRole('button', { name: '导入', exact: true })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: '导入必盘标记' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(`选择资产${chosen[1].assetTag}`));
  fireEvent.click(screen.getAllByRole('button', { name: '删除', exact: true }).at(-1));
  importFile([{ ...chosen[1], isMandatory: true }]);
  await waitFor(() => expect(mandatoryCell(chosen[1].assetTag)).toHaveTextContent('是'));
  expect(within(screen.getByRole('table', { name: '必盘范围资产' })).queryByRole('row', { name: new RegExp(chosen[0].assetTag) })).not.toBeInTheDocument();
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^1$/);
  const initialCount = require('../../mock/inventoryProjectPlanMock').PROJECT_PLAN_ASSETS[base.initialProjectNo].length;
  expect(screen.getByRole('group', { name: '复盘比例' })).toHaveTextContent(`${(100 / initialCount).toFixed(2)}%`);
  importFile([{ ...chosen[0], isMandatory: true }]);
  await waitFor(() => expect(mandatoryCell(chosen[0].assetTag)).toHaveTextContent('是'));
  expect(within(screen.getByRole('table', { name: '必盘范围资产' })).queryByRole('row', { name: new RegExp(chosen[1].assetTag) })).not.toBeInTheDocument();
});

test('尚未查询的输入不限制导入，已生效查询限制整批，模板仅带出当前查询结果', async () => {
  const onGenerated = jest.fn();
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  fireEvent.change(screen.getByLabelText('范围资产标签号'), { target: { value: chosen[0].assetTag } });
  importFile(chosen.map((asset) => ({ ...asset, isMandatory: true })));
  await waitFor(() => expect(mandatoryCell(chosen[1].assetTag)).toHaveTextContent('是'));
  fireEvent.click(screen.getByRole('button', { name: '查询', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '清单模板' }));
  const workbook = XLSX.writeFile.mock.calls[0][0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['盘点范围资产清单'], { header: 1 });
  expect(rows).toHaveLength(2);
  expect(rows[1][importHeader.indexOf('资产标签号')]).toBe(chosen[0].assetTag);
  importFile([{ ...chosen[1], isMandatory: true }]);
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('可选执行资产')));
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated.mock.calls[0][0].scopeSnapshotAssetKeys).toEqual(chosen.map((asset) => asset.key));
});

test('清空已生成范围不能回退全初盘源，外部范围约束也不能被文件突破', async () => {
  const view = render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={[chosen[0].key]} onBack={() => {}} onGenerated={() => {}} />);
  importFile([{ ...chosen[1], isMandatory: true }]);
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('可选执行资产')));
  expect(mandatoryCell(chosen[0].assetTag)).toHaveTextContent('否');
  view.unmount(); mockWarning.mockClear();
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={() => {}} />);
  fireEvent.click(screen.getByLabelText('选择资产scope-1'));
  fireEvent.click(screen.getAllByRole('button', { name: '删除', exact: true })[0]);
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^0$/);
  importFile([{ ...chosen[0], isMandatory: true }]);
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('可选执行资产')));
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^0$/);
});

test('新建项目编号跨重新进入和类型切换唯一，编辑历史不重分配', () => {
  const firstDraft = jest.fn();
  const { unmount: firstUnmount } = render(<CreateProjectView creator="213852-孙志强" scopeAssetKeys={chosen.map((asset) => asset.key)} onDraftProjectChange={firstDraft} onBack={() => {}} onGenerated={() => {}} />);
  const first = firstDraft.mock.calls.at(-1)[0].projectNo;
  expect(first).toMatch(/^CP-\d{8}-\d{4}$/);
  fireEvent.change(screen.getByLabelText('项目类型'), { target: { value: '抽盘' } });
  expect(firstDraft.mock.calls.at(-1)[0].projectNo).toMatch(/^DCP-\d{8}-\d{4}$/);
  fireEvent.change(screen.getByLabelText('项目类型'), { target: { value: '初盘' } });
  expect(firstDraft.mock.calls.at(-1)[0].projectNo).not.toBe(first);
  firstUnmount();
  const secondDraft = jest.fn();
  const { unmount: secondUnmount } = render(<CreateProjectView creator="213852-孙志强" scopeAssetKeys={chosen.map((asset) => asset.key)} onDraftProjectChange={secondDraft} onBack={() => {}} onGenerated={() => {}} />);
  expect(secondDraft.mock.calls.at(-1)[0].projectNo).not.toBe(first);
  secondUnmount();
  const reservations = localStorage.getItem(INVENTORY_PROJECT_NUMBER_KEY);
  const editing = jest.fn();
  render(<CreateProjectView creator="冯丽婷" initialProject={base} scopeAssetKeys={chosen.map((asset) => asset.key)} onDraftProjectChange={editing} onBack={() => {}} onGenerated={() => {}} />);
  expect(editing.mock.calls.at(-1)[0].projectNo).toBe(base.projectNo);
  expect(localStorage.getItem(INVENTORY_PROJECT_NUMBER_KEY)).toBe(reservations);
});

test('编号预留失败显示错误并阻止无号保存或生成，零初盘分母不显示伪比例', () => {
  localStorage.setItem(INVENTORY_PROJECT_NUMBER_KEY, '{');
  const onGenerated = jest.fn();
  const view = render(<CreateProjectView creator="213852-孙志强" scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  expect(screen.getByText(/项目编号预留失败/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '保存', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(mockWarning).toHaveBeenCalledTimes(2);
  expect(onGenerated).not.toHaveBeenCalled();
  view.unmount();
  render(<CreateProjectView creator="冯丽婷" initialProject={{ ...base, initialProjectNo: 'NO-INITIAL-SOURCE' }} onBack={() => {}} onGenerated={() => {}} />);
  expect(screen.getByRole('group', { name: '复盘比例' })).toHaveTextContent(/^0%$/);
});

test('实际新建入口年度默认当前年，类型切换后期间联动且季度月度选项不变', () => {
  const year = new Date().getFullYear();
  const onDraftProjectChange = jest.fn();
  render(<CreateProjectView creator="213852-孙志强" onBack={() => {}} onGenerated={() => {}} onDraftProjectChange={onDraftProjectChange} />);
  const period = screen.getByLabelText('盘点期间');
  expect(period).toHaveValue(`${year}年`);
  expect(within(period).getAllByRole('option')).toHaveLength(year - 2014 + 1);
  expect(within(period).getByRole('option', { name: '2014年', exact: true })).toBeInTheDocument();
  expect(within(period).getByRole('option', { name: `${year}年`, exact: true, selected: true })).toBeInTheDocument();
  expect(onDraftProjectChange.mock.calls.at(-1)[0].projectName).toBe(`${year}年-年度盘点`);
  fireEvent.change(screen.getByLabelText('盘点类型'), { target: { value: '季度' } });
  expect(period).toHaveValue(`${year}年Q1`);
  expect(within(period).getAllByRole('option')).toHaveLength(4);
  fireEvent.change(screen.getByLabelText('盘点类型'), { target: { value: '月度' } });
  expect(period).toHaveValue(`${year - 1}年12月`);
  expect(within(period).getAllByRole('option')).toHaveLength(14);
  fireEvent.change(screen.getByLabelText('盘点类型'), { target: { value: '年度' } });
  expect(period).toHaveValue(`${year}年`);
  expect(onDraftProjectChange.mock.calls.at(-1)[0].period).toBe(`${year}年`);
});

test.each(['初盘', '抽盘', '复盘'])('实际编辑年度%s保存和快照均拒绝旧季度期间，改成范围内年份后正常保存快照', (projectType) => {
  const onGenerated = jest.fn();
  render(<CreateProjectView creator={projectType === '复盘' ? '冯丽婷' : '213852-孙志强'} initialProject={{ ...base, creator: projectType === '复盘' ? '冯丽婷' : '213852-孙志强', projectType, inventoryType: '年度', period: '2026年Q1' }} scopeAssetKeys={chosen.map((asset) => asset.key)} onBack={() => {}} onGenerated={onGenerated} />);
  fireEvent.click(screen.getByRole('button', { name: '保存', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(mockWarning).toHaveBeenCalledTimes(2);
  expect(onGenerated).not.toHaveBeenCalled();
  expect(getInventoryPhotoSnapshot(base.projectNo)).toBeNull();
  fireEvent.change(screen.getByLabelText('盘点期间'), { target: { value: '2020年' } });
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(onGenerated).toHaveBeenCalledTimes(1);
  expect(onGenerated.mock.calls[0][0].period).toBe('2020年');
});


test('清单选择更新范围卡片条数及占比，查看全部恢复项目范围统计', () => {
  const props = { initialProject: base, creator: '冯丽婷', onBack: jest.fn(), onGenerated: jest.fn() };
  const view = render(<CreateProjectView {...props} scopePreviewAssetKeys={[chosen[0].key]} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  const table = screen.getByRole('table', { name: '必盘范围资产' });
  expect(within(table).getByRole('row', { name: new RegExp(chosen[0].assetTag) })).toBeInTheDocument();
  expect(within(table).queryByRole('row', { name: new RegExp(chosen[1].assetTag) })).toBeNull();
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^1$/);
  view.rerender(<CreateProjectView {...props} scopePreviewAssetKeys={null} />);
  expect(within(screen.getByRole('table', { name: '必盘范围资产' })).getByRole('row', { name: new RegExp(chosen[1].assetTag) })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(String(require('../../mock/inventoryProjectPlanMock').PROJECT_PLAN_ASSETS[base.initialProjectNo].filter(asset => asset.executeInventory).length));
});


test('批次查询统计卡片而非数量，初盘全部明细含未执行和已盘记录，查看全部不改保存范围', () => {
  const initialNo = 'INITIAL-ALL-CARDS';
  const assets = [
    { ...chosen[0], key: 'card-a', assetTag: 'CARD-A', quantity: 100, executeInventory: true },
    { ...chosen[1], key: 'card-b', assetTag: 'CARD-B', quantity: 20, executeInventory: true },
    { ...chosen[0], key: 'card-c', assetTag: 'CARD-C', quantity: 999, executeInventory: false, inventoryStatus: '已盘' },
  ];
  saveInventoryPhotoSnapshot({ projectNo: initialNo }, assets);
  const onGenerated = jest.fn();
  const props = { initialProject: { ...base, initialProjectNo: initialNo }, creator: '冯丽婷', onBack: jest.fn(), onGenerated };
  const view = render(<CreateProjectView {...props} scopePreviewAssetKeys={null} />);
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^2$/);
  expect(screen.getByRole('group', { name: '复盘比例' })).toHaveTextContent(/^66.67%$/);
  view.rerender(<CreateProjectView {...props} scopePreviewAssetKeys={['card-a', 'card-b']} />);
  fireEvent.change(screen.getByLabelText('范围资产标签号'), { target: { value: 'CARD-B' } });
  fireEvent.click(screen.getByRole('button', { name: '查询', exact: true }));
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^1$/);
  expect(screen.getByRole('group', { name: '复盘比例' })).toHaveTextContent(/^33.33%$/);
  fireEvent.change(screen.getByLabelText('范围资产标签号'), { target: { value: 'NO-MATCH' } });
  fireEvent.click(screen.getByRole('button', { name: '查询', exact: true }));
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^0$/);
  expect(screen.getByRole('group', { name: '复盘比例' })).toHaveTextContent(/^0%$/);
  view.rerender(<CreateProjectView {...props} scopePreviewAssetKeys={null} />);
  expect(screen.getByRole('group', { name: '本次复盘数量' })).toHaveTextContent(/^2$/);
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(getInventoryPhotoSnapshot(base.projectNo).assets.map(asset => asset.key)).toEqual(['card-a', 'card-b']);
});


test('编辑项目生成的新范围优先于旧范围，查看该批次下方资产可见且没有额外初盘统计字段', () => {
  render(<CreateProjectView creator="冯丽婷" initialProject={{ ...base, scopeSnapshotAssetKeys: [chosen[0].key], scopeQueryAssetKeys: [chosen[0].key] }} scopeAssetKeys={chosen.map(asset => asset.key)} scopePreviewAssetKeys={[chosen[1].key]} onBack={() => {}} onGenerated={() => {}} />);
  const table = screen.getByRole('table', { name: '必盘范围资产' });
  expect(within(table).getByRole('row', { name: new RegExp(chosen[1].assetTag) })).toBeInTheDocument();
  expect(within(table).queryByRole('row', { name: new RegExp(chosen[0].assetTag) })).toBeNull();
  expect(screen.queryByRole('group', { name: '初盘资产明细总条数' })).toBeNull();
  expect(screen.queryByRole('group', { name: '初盘执行盘点数量' })).toBeNull();
});


jest.mock('./AssetInventoryProjectPageV2', () => {
  const { CreateProjectView } = jest.requireActual('./AssetInventoryProjectPage');
  return (props) => <CreateProjectView {...props} creator="冯丽婷" initialProject={{ projectNo: 'INTEGRATION-REPLAY', projectType: '复盘', initialProjectNo: 'INTEGRATION-SOURCE', creator: '冯丽婷', inventoryType: '年度', period: '2026年', samplingMode: '全盘' }} onBack={() => {}} onGenerated={() => {}} />;
});

test('当前V3页面入口生成两条范围后，查看经外层参数切换真实下方表，查看全部恢复', async () => {
  saveInventoryPhotoSnapshot({ projectNo: 'INTEGRATION-SOURCE' }, [
    { ...chosen[0], key: 'v3-a', assetTag: 'V3-A', organization: '公司甲', executeInventory: true },
    { ...chosen[1], key: 'v3-b', assetTag: 'V3-B', organization: '公司乙', executeInventory: true },
  ]);
  render(<AssetInventoryProjectPageV3 />);
  await waitFor(() => expect(screen.getByRole('button', { name: '筛选组织公司甲' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: '筛选组织公司甲' }));
  fireEvent.click(screen.getByRole('button', { name: '生成查询', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '筛选组织公司乙' }));
  fireEvent.click(screen.getByRole('button', { name: '生成查询', exact: true }));
  fireEvent.click(screen.getAllByRole('button', { name: '查看', exact: true })[0]);
  await waitFor(() => {
    const table = screen.getByRole('table', { name: '必盘范围资产' });
    expect(within(table).getByRole('row', { name: /V3-A/ })).toBeInTheDocument();
    expect(within(table).queryByRole('row', { name: /V3-B/ })).toBeNull();
  });
  fireEvent.click(screen.getAllByRole('button', { name: '查看', exact: true })[1]);
  await waitFor(() => expect(within(screen.getByRole('table', { name: '必盘范围资产' })).getByRole('row', { name: /V3-B/ })).toBeInTheDocument());
  expect(within(screen.getByRole('table', { name: '必盘范围资产' })).queryByRole('row', { name: /V3-A/ })).toBeNull();
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '查看全部' }));
  await waitFor(() => expect(within(screen.getByRole('table', { name: '必盘范围资产' })).getAllByRole('row')).toHaveLength(3));
});
