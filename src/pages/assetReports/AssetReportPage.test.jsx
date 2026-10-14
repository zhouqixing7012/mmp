// CRA的Jest版本不解析这些已安装依赖的子路径导出，测试显式加载同一真实模块。
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AssetReportPage from './AssetReportPage';
import AssetReportsContent from './index';
import { reportDefinitions } from '../../services/assetReportsService';

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test.each(reportDefinitions.map(definition => [definition.id, definition.title]))('%s从实际内容组件渲染%s', (id, title) => {
  const definition = reportDefinitions.find(item => item.id === id);
  render(<AssetReportsContent activeSubMenu={definition.menu} activeTab={definition.menu === title ? '' : title} />);
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /查\s*询/ })).toBeInTheDocument();
  expect(screen.getByText('查询结果')).toBeInTheDocument();
});
test('条件编辑不改变列表，回车执行查询后结果改变', async () => {
  render(<AssetReportPage reportId="report-1-1" />);
  const text = screen.getByRole('textbox', { name: '资产标签号' });
  fireEvent.change(text, { target: { value: 'NO-MATCH-RECORD' } });
  expect(screen.getByText('NE3810')).toBeInTheDocument();
  fireEvent.keyDown(text, { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });
  await waitFor(() => expect(screen.queryByText('NE3810')).not.toBeInTheDocument());
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
  const links = screen.getAllByRole('button').filter(button => /^C\d/.test(button.textContent));
  expect(links.length).toBeGreaterThan(0);
  fireEvent.click(links[0]);
  await waitFor(() => expect(screen.getByText('耗材详情')).toBeInTheDocument());
});
