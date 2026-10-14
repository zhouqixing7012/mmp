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
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test('资产明细类别与状态直接多选下拉，标签是文本，按钮统一命名', () => {
  render(<AssetReportPage reportId="report-1-1" />);
  expect(screen.getByRole('combobox', { name: '资产类别' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '资产状态' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: '资产标签号' })).not.toHaveAttribute('readonly');
  expect(screen.getByRole('button', { name: /重\s*置/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /导\s*出/ })).toBeInTheDocument();
  expect(screen.queryByText('采购日期从')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '更多' }));
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
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
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
  fireEvent.click(screen.getByRole('button', { name: '更多' }));
  expect(screen.getByRole('textbox', { name: '原值' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  expect(screen.queryByRole('textbox', { name: '原值' })).not.toBeInTheDocument();
});
test('耗材标签打开只读详情弹窗', async () => {
  render(<AssetReportPage reportId="report-2-1" />);
  fireEvent.click(screen.getByRole('columnheader', { name: /公司/ }));
  await waitFor(() => expect(screen.queryByText('数据条件未满足，暂无法显示结果')).not.toBeInTheDocument());
  const links = screen.getAllByRole('button').filter(button => /^CONSUM-/.test(button.textContent));
  expect(links.length).toBeGreaterThan(0);
  fireEvent.click(links[0]);
  await waitFor(() => expect(screen.getByText('耗材详情')).toBeInTheDocument());
  expect(screen.queryByText('净值：')).not.toBeInTheDocument();
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
