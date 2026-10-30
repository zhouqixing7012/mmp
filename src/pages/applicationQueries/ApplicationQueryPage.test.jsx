jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as applicationService from '../../services/applicationQueryService';
import { queryApplications } from '../../services/applicationQueryService';
import ApplicationQueriesContent, { APPLICATION_PAGE_IDS } from './index';
import { MAIN_MENU_ITEMS, APPLICATION_MENU_ITEMS } from '../yewurules/config/menuConfig';
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test('申请菜单紧接资产报表且九个入口均有实际映射', () => {
  expect(MAIN_MENU_ITEMS.findIndex(item => item.key === '申请')).toBe(MAIN_MENU_ITEMS.findIndex(item => item.key === '资产报表') + 1);
  expect(APPLICATION_MENU_ITEMS).toEqual(Object.keys(APPLICATION_PAGE_IDS));
});
test.each(APPLICATION_MENU_ITEMS)('%s从实际菜单内容组件可进入', title => {
  render(<ApplicationQueriesContent activeSubMenu={title} />);
  expect(screen.queryByRole('heading', { name: title })).not.toBeInTheDocument();
  expect(screen.getByText(title)).not.toBeVisible();
  expect(screen.getByRole('button', { name: /查\s*询/ })).toBeInTheDocument();
});
test('查询编辑后执行才更新列表，详情返回保留查询，进度接收当前业务记录', async () => {
  render(<ApplicationQueriesContent activeSubMenu="退库单" />);
  expect(screen.queryByRole('button', { name: /删\s*除/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: '申请单号' });
  fireEvent.change(input, { target: { value: 'NO-MATCH' } });
  expect(screen.queryByLabelText('已生效筛选条件')).not.toBeInTheDocument();
  expect(screen.queryByText('暂无符合条件的退库单')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getByText('暂无符合条件的退库单')).toBeInTheDocument();
  expect(screen.getByLabelText('已生效筛选条件')).toHaveTextContent('NO-MATCH');
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  const number = queryApplications('return')[0].values.applicationNo;
  fireEvent.click(screen.getByRole('button', { name: number }));
  expect(screen.queryByRole('heading', { name: '退库单详情' })).not.toBeInTheDocument();
  expect(document.querySelector('[data-mmp-page-title="退库单详情"]')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /查看进度/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getAllByRole('row').length).toBeGreaterThan(1);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: '申请单号' })).toHaveValue(''));
});

 test('退库列表去掉赔偿列，统一导出菜单传递全部或当前分页范围', async () => {
  const download = jest.spyOn(applicationService, 'exportApplications').mockImplementation(() => {});
  try {
    render(<ApplicationQueriesContent activeSubMenu="退库单" />);
    expect(screen.queryByRole('columnheader', { name: '是否赔偿' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '导出当前页' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /导出/ }));
    fireEvent.click(await screen.findByRole('menuitem', { name: '导出全部' }));
    expect(download).toHaveBeenLastCalledWith('return', {}, null, null);
    fireEvent.click(screen.getByRole('button', { name: /导出/ }));
    fireEvent.click(await screen.findByRole('menuitem', { name: '导出当前页' }));
    expect(download).toHaveBeenLastCalledWith('return', {}, null, { current: 1, pageSize: 10 });
  } finally { download.mockRestore(); }
});

test('未完成单据不展示周报及接入说明，类型使用获权处理中单据的名称', () => {
  render(<ApplicationQueriesContent activeSubMenu="未完成单据" />);
  expect(screen.queryByText(/未完成员工申请周报|真实定时发送|原型可查询/)).not.toBeInTheDocument();
  const definition = applicationService.getApplicationDefinition('unfinished');
  const options = applicationService.getApplicationOptions('unfinished', definition.filters.find(field => field.key === 'type'));
  expect(options.map(option => option.label)).toEqual(expect.arrayContaining(['资产维修更换', '员工借用', '资产申请单', '耗材申请单']));
  options.forEach(option => expect(queryApplications('unfinished', { type: option.value }).length).toBeGreaterThan(0));
});
test('汇总提交人打开所点行对应的汇总明细，进度保留外部节点并去掉接入说明', async () => {
  const record = queryApplications('asset').find(row => row.values.summaryApplicant);
  const { unmount } = render(<ApplicationQueriesContent activeSubMenu="资产申请单" />);
  const tr = screen.getByRole('button', { name: record.values.subNo }).closest('tr');
  fireEvent.click(within(tr).getByRole('button', { name: record.values.summaryApplicant }));
  expect(document.querySelector('[data-mmp-page-title="统一申请汇总详情"]')).toBeInTheDocument();
  const info = screen.getByText('汇总信息').closest('.ant-card');
  expect(info.querySelector('.ant-card-extra')).toHaveTextContent(record.values.subNo);
  expect(screen.getByText(record.summary.projectUsage)).toBeInTheDocument();
  unmount();
  render(<ApplicationQueriesContent activeSubMenu="耗材申请单" />);
  const purchase = queryApplications('consumable').find(row => row.values.summaryApplicant);
  const purchaseTr = screen.getAllByRole('button', { name: purchase.values.subNo })[0].closest('tr');
  fireEvent.click(within(purchaseTr).getByRole('button', { name: '查看' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).queryByText(/未连接外部系统|关联流程演示记录/)).not.toBeInTheDocument();
  purchase.progressSections.forEach(section => expect(within(dialog).getByText(section.title)).toBeInTheDocument());
});

test.each([['资产申请单', 'asset'], ['耗材申请单', 'consumable'], ['新员工领用单', 'newEmployee']])('%s列表单据状态使用统一标签', (menu, id) => {
  const record = queryApplications(id)[0];
  render(<ApplicationQueriesContent activeSubMenu={menu} />);
  const tr = Array.from(document.querySelectorAll('tr[data-row-key]')).find(node => node.getAttribute('data-row-key') === record.id);
  expect(within(tr).getByText(record.values.status).closest('.ant-tag')).not.toBeNull();
});
