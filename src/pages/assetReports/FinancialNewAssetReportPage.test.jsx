// CRA的Jest版本不解析这些已安装依赖的子路径导出，测试显式加载同一真实模块。
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetReportsContent from './index';
import { ASSET_REPORT_MENU_ITEMS } from '../yewurules/config/menuConfig';
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
test('资产报表菜单可进入新查询页，13列无多余字段，重置恢复数据', () => {
  expect(ASSET_REPORT_MENU_ITEMS).toContain('固定资产新增报表');
  render(<AssetReportsContent activeSubMenu="固定资产新增报表" />);
  expect(screen.getByRole('heading', { name: '固定资产新增报表' })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(13);
  expect(screen.getByText('114122602627')).toBeInTheDocument();
  expect(screen.getByText('11216122601019')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('开始日期')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('结束日期')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(screen.getByText('共 2 条', { selector: 'span.ant-typography' })).toBeInTheDocument();
});
test('公司复用公共弹窗，可搜索和筛选公司', async () => {
  render(<AssetReportsContent activeSubMenu="固定资产新增报表" />);
  fireEvent.click(screen.getByPlaceholderText('请选择公司'));
  const modal = await screen.findByRole('dialog');
  const media = within(modal).getByText('Media').closest('tr');
  fireEvent.click(within(media).getByRole('checkbox'));
  fireEvent.click(within(modal).getByRole('button', { name: /确\s*定/ }));
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getByText('114122602627')).toBeInTheDocument();
  expect(screen.queryByText('11216122601019')).not.toBeInTheDocument();
});
