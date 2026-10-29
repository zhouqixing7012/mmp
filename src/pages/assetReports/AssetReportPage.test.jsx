// CRA的Jest版本不解析这些已安装依赖的子路径导出，测试显式加载同一真实模块。
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import AssetReportPage from './AssetReportPage';
import AssetReportsContent from './index';
import ReportFilter from './ReportFilter';
import { queryReport, reportDefinitions } from '../../services/assetReportsService';

beforeEach(() => {
  window.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = { postMessage: () => Promise.resolve().then(() => this.port1.onmessage?.()) };
    }
  };
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test('资产明细类别与状态直接多选下拉，标签是文本，按钮统一命名', () => {
  render(<AssetReportPage reportId="report-1-1" />);
  expect(screen.getByRole('combobox', { name: '资产类别' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'HR部门' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '仓库' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: '库房' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: '级别' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '资产状态' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: '资产标签号' })).not.toHaveAttribute('readonly');
  expect(screen.getByRole('button', { name: /重\s*置/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /导\s*出/ })).toBeInTheDocument();
  expect(screen.queryByText('采购日期从')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '展开更多' }));
  expect(screen.getByRole('textbox', { name: '主资产标签号' })).not.toHaveAttribute('readonly');
  expect(screen.queryByRole('combobox', { name: '级别' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: '报废状态' })).not.toBeInTheDocument();
});
test.each([['仓库', ['编码', '名称', '公司']], ['Building', ['Building名称', 'City名称']]])('%s选择弹窗包含要求的查询列表列', async (label, titles) => {
  const definition = reportDefinitions.find(item => item.id === 'report-1-1');
  render(<ReportFilter definition={definition} field={definition.filters.find(field => field.label === label)} filters={{}} onChange={jest.fn()} onQuery={jest.fn()} />);
  fireEvent.click(screen.getByPlaceholderText('请选择'));
  const dialog = await screen.findByRole('dialog');
  titles.forEach(title => expect(within(dialog).getByRole('columnheader', { name: title })).toBeInTheDocument());
});
test.each(reportDefinitions.map(definition => [definition.id, definition.title]))('%s从实际内容组件渲染%s', (id, title) => {
  const definition = reportDefinitions.find(item => item.id === id);
  render(<AssetReportsContent activeSubMenu={definition.menu} activeTab={definition.menu === title ? '' : title} />);
  expect(screen.queryByRole('heading', { name: title })).not.toBeInTheDocument();
  expect(screen.getByText(title)).not.toBeVisible();
  expect(screen.getByRole('button', { name: /查\s*询/ })).toBeInTheDocument();
  expect(screen.getByText('查询结果')).toBeInTheDocument();
  if (id === 'report-8-1') expect(screen.queryByRole('columnheader', { name: '处置类型' })).not.toBeInTheDocument();
  if (id === 'report-2-1') expect(screen.queryByRole('columnheader', { name: '净值' })).not.toBeInTheDocument();
  if (id === 'report-1-1') expect(screen.getByRole('columnheader', { name: '净值' })).toBeInTheDocument();
});
test('条件编辑不改变列表，回车执行查询后结果改变', async () => {
  const document = queryReport('report-3-1')[0].values['单据编号'];
  render(<AssetReportPage reportId="report-3-1" />);
  const text = screen.getByRole('textbox', { name: '单据编号' });
  fireEvent.change(text, { target: { value: 'NO-MATCH-RECORD' } });
  expect(screen.getAllByText(document).length).toBeGreaterThan(0);
  fireEvent.keyDown(text, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });
  await waitFor(() => expect(screen.queryByText(document)).not.toBeInTheDocument());
});
test('更多展开隐藏条件，收起后条件控件离开页面', () => {
  render(<AssetReportPage reportId="report-1-1" />);
  expect(screen.queryByRole('textbox', { name: '原值' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '展开更多' }));
  expect(screen.getByRole('textbox', { name: '原值' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '收起更多' }));
  expect(screen.queryByRole('textbox', { name: '原值' })).not.toBeInTheDocument();
});
test('耗材明细不增加标签详情入口，字段按耗材口径展示', () => {
  render(<AssetReportPage reportId="report-2-1" />);
  expect(screen.getByRole('columnheader', { name: '不含税单价' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '耗材数量' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: '原值' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Building' })).not.toBeInTheDocument();
  const tags = queryReport('report-2-1').map(row => row.values['耗材标签号']).filter(Boolean);
  expect(tags.length).toBeGreaterThan(0);
  tags.forEach(tag => expect(screen.queryByRole('button', { name: tag })).not.toBeInTheDocument());
  expect(screen.queryByText('耗材详情')).not.toBeInTheDocument();
});
test.each(['report-1-1', 'report-2-1', 'report-5-1'])('%s接入分类编码后默认查询显示结果并允许导出', id => {
  render(<AssetReportPage reportId={id} />);
  expect(screen.queryByText('数据条件未满足，暂无法显示结果')).not.toBeInTheDocument();
  expect(screen.getByText(/共 \d+ 条/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /导\s*出|Excel/i })).toBeEnabled();
});
test('页面使用传入的台账卡片权限，不扩大默认演示范围', () => {
  const rows = queryReport('report-1-1'), tag = rows[0].values['资产标签号'];
  const access = { userId: 'inherited-ledger-user', canView: true, allowedScopes: ['集团'], allowedAssetTags: [tag] };
  render(<AssetReportsContent activeSubMenu="资产明细报表" access={access} />);
  expect(screen.getByText(tag)).toBeInTheDocument();
  expect(screen.queryByText(rows[1].values['资产标签号'])).not.toBeInTheDocument();
  expect(screen.getByText('共 1 条')).toBeInTheDocument();
});
test('无台账卡片查看权限时显示原因且不提供查询导出', () => {
  render(<AssetReportPage reportId="report-1-1" access={{ userId: 'denied-ledger-user', canView: false, allowedScopes: [] }} />);
  expect(screen.getByText('无台账及卡片查看权限')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /导出/ })).not.toBeInTheDocument();
  expect(screen.queryByText('查询结果')).not.toBeInTheDocument();
});
test('并行审批完整展示，再次查询读取已完成结果并清空审批信息', async () => {
  const record = queryReport('report-6-1').find(row => row.approvalSource.status === '处理中' && row.grain === '资产配给单.物料');
  const source = record.approvalSource, previousStatus = source.status;
  try {
    render(<AssetReportPage reportId="report-6-1" />);
    fireEvent.change(screen.getByRole('textbox', { name: '申请单号' }), { target: { value: record.values['申请单号'] } });
    fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
    const pendingNodes = await screen.findByText('ES主管审批；财务审批');
    expect(pendingNodes.style.whiteSpace).toBe('pre-wrap');
    expect(screen.getByText('213852.孙志强；220784.周琦星')).toBeInTheDocument();
    source.status = '已处理';
    fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
    await waitFor(() => expect(screen.queryByText('ES主管审批；财务审批')).not.toBeInTheDocument());
    expect(screen.queryByText('213852.孙志强；220784.周琦星')).not.toBeInTheDocument();
    expect(screen.getByText(record.values['申请单号'])).toBeInTheDocument();
  } finally { source.status = previousStatus; }
});

test("事务报表复用直接类别树与标签文本，秒级日期并移除担保人列", () => {
  render(<AssetReportPage reportId="report-3-1" />);
  expect(screen.getByRole("combobox", { name: "资产类别" })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "资产标签号" })).not.toHaveAttribute("readonly");
  expect(screen.queryByRole("columnheader", { name: "原资产担保人" })).not.toBeInTheDocument();
  expect(screen.queryByRole("columnheader", { name: "现资产担保人" })).not.toBeInTheDocument();
  const date = queryReport("report-3-1")[0].values["事务处理日期"];
  expect(screen.getAllByText(date).length).toBeGreaterThan(0);
});

test.each(reportDefinitions.flatMap(d => d.filters.filter(f => ["treeSelect", "departmentTreeSelect", "assetStatusSelect", "consumableStatusSelect"].includes(f.type)).map(f => [d.id, f.label]))) ("%s的%s直接使用公共下拉", (id, label) => {
  const definition = reportDefinitions.find(d => d.id === id);
  render(<ReportFilter definition={definition} field={definition.filters.find(f => f.label === label)} filters={{}} onChange={jest.fn()} onQuery={jest.fn()} />);
  expect(screen.getByRole("combobox", { name: label })).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
test.each([["report-5-1", "仓库", ["编码", "名称", "公司"]], ["report-8-1", "Building", ["Building名称", "City名称"]]])("%s的%s选择列表统一列", async (id, label, titles) => {
  const definition = reportDefinitions.find(d => d.id === id);
  render(<ReportFilter definition={definition} field={definition.filters.find(f => f.label === label)} filters={{ City: "北京" }} onChange={jest.fn()} onQuery={jest.fn()} />);
  fireEvent.click(screen.getByPlaceholderText("请选择"));
  const dialog = await screen.findByRole("dialog");
  titles.forEach(title => expect(within(dialog).getByRole("columnheader", { name: title })).toBeInTheDocument());
});

test('新增类型直接下拉，人员弹窗使用工号回填并支持清空', async () => {
  const definition = reportDefinitions.find(item => item.id === 'report-5-1');
  const change = jest.fn();
  const { rerender } = render(<ReportFilter definition={definition} field={definition.filters.find(field => field.label === '新增类型')} filters={{}} onChange={change} />);
  expect(screen.getByRole('combobox', { name: '新增类型' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const field = definition.filters.find(field => field.label === '资产责任人工号');
  rerender(<ReportFilter definition={definition} field={field} filters={{ '资产责任人工号': ['213852'] }} onChange={change} />);
  expect(screen.getByDisplayValue('213852.孙志强')).toBeInTheDocument();
  fireEvent.click(screen.getByDisplayValue('213852.孙志强'));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('columnheader', { name: '员工编号' })).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: /确.*定/ }));
  expect(change).toHaveBeenLastCalledWith(field, ['213852']);
});

test('公共人员选择保留同名不同工号，确认返回工号而非姓名', async () => {
  const { AssetPersonSelect } = require('../../components/AssetQueryControls');
  const change = jest.fn();
  render(<AssetPersonSelect title="选择人员" options={[
    { value: '0001', code: '0001', name: '同名人员', label: '0001.同名人员' },
    { value: '0002', code: '0002', name: '同名人员', label: '0002.同名人员' },
  ]} value={[]} onChange={change} />);
  fireEvent.click(screen.getByRole('textbox', { name: '人员' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getAllByText('同名人员')).toHaveLength(2);
  fireEvent.click(within(dialog).getAllByRole('checkbox')[0]);
  fireEvent.click(within(dialog).getByRole('button', { name: /确.*定/ }));
  expect(change).toHaveBeenCalledWith(['0001', '0002']);
});


test('统一申领页签分别恢复未查询输入与最近查询结果', async () => {
  const stock = reportDefinitions.find(item => item.id === 'report-6-1');
  const purchase = reportDefinitions.find(item => item.id === 'report-6-2');
  const record = queryReport(stock.id)[0].values['申请单号'];
  const { rerender } = render(<AssetReportsContent activeSubMenu={stock.menu} activeTab={stock.title} />);
  fireEvent.change(screen.getByRole('textbox', { name: '申请单号' }), { target: { value: record } });
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getAllByText(record).length).toBeGreaterThan(0);
  fireEvent.change(screen.getByRole('textbox', { name: '申请单号' }), { target: { value: 'STOCK-UNAPPLIED' } });
  rerender(<AssetReportsContent activeSubMenu={purchase.menu} activeTab={purchase.title} />);
  expect(screen.getByRole('textbox', { name: '申请单号' })).toHaveValue('');
  fireEvent.change(screen.getByRole('textbox', { name: '申请单号' }), { target: { value: 'PURCHASE-NO-MATCH' } });
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  rerender(<AssetReportsContent activeSubMenu={stock.menu} activeTab={stock.title} />);
  expect(screen.getByRole('textbox', { name: '申请单号' })).toHaveValue('STOCK-UNAPPLIED');
  expect(screen.getAllByText(record).length).toBeGreaterThan(0);
  rerender(<AssetReportsContent activeSubMenu={purchase.menu} activeTab={purchase.title} />);
  expect(screen.getByRole('textbox', { name: '申请单号' })).toHaveValue('PURCHASE-NO-MATCH');
  expect(screen.getByText('暂无数据')).toBeInTheDocument();
});

test('行高切换保留分页和查询结果，统一申领页签分别保存密度', async () => {
  const stock = reportDefinitions.find(item => item.id === 'report-6-1');
  const purchase = reportDefinitions.find(item => item.id === 'report-6-2');
  const access = { userId: 'density-test', canView: true, allowedScopes: ['集团', '上海媒体', '广州媒体'] };
  const rows = queryReport(stock.id, {}, null, access);
  expect(rows.length).toBeGreaterThan(10);
  const view = render(<AssetReportsContent activeSubMenu={stock.menu} activeTab={stock.title} access={access} />);
  expect(document.querySelector('.mmp-business-table').style.getPropertyValue('--mmp-table-row-height')).toBe('40px');
  fireEvent.click(screen.getByTitle('2'));
  expect(document.querySelector('.ant-pagination-item-active')).toHaveAttribute('title', '2');
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '表格行高' }));
  fireEvent.click(await screen.findByText('行高 32px', { selector: '.ant-select-item-option-content' }));
  expect(document.querySelector('.mmp-business-table').style.getPropertyValue('--mmp-table-row-height')).toBe('32px');
  expect(document.querySelector('.ant-pagination-item-active')).toHaveAttribute('title', '2');
  expect(screen.getByText('共 ' + rows.length + ' 条')).toBeInTheDocument();
  view.rerender(<AssetReportsContent activeSubMenu={purchase.menu} activeTab={purchase.title} access={access} />);
  expect(document.querySelector('.mmp-business-table').style.getPropertyValue('--mmp-table-row-height')).toBe('40px');
  view.rerender(<AssetReportsContent activeSubMenu={stock.menu} activeTab={stock.title} access={access} />);
  expect(document.querySelector('.mmp-business-table').style.getPropertyValue('--mmp-table-row-height')).toBe('32px');
  expect(document.querySelector('.ant-pagination-item-active')).toHaveAttribute('title', '2');
});
