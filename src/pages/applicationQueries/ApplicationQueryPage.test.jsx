jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /查\s*询/ })).toBeInTheDocument();
});
test('查询编辑后执行才更新列表，详情返回保留查询，进度接收当前业务记录', async () => {
  render(<ApplicationQueriesContent activeSubMenu="退库单" />);
  expect(screen.queryByRole('button', { name: /删\s*除/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: '申请单号' });
  fireEvent.change(input, { target: { value: 'NO-MATCH' } });
  expect(screen.queryByText('暂无符合条件的退库单')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getByText('暂无符合条件的退库单')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  const number = queryApplications('return')[0].values.applicationNo;
  fireEvent.click(screen.getByRole('button', { name: number }));
  expect(screen.getByRole('heading', { name: '退库单详情' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /查看进度/ }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getAllByRole('row').length).toBeGreaterThan(1);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: '申请单号' })).toHaveValue(''));
});
