jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
beforeEach(() => {
  // JSDOM未提供MessageChannel，按浏览器消息任务语义补齐测试环境。
  window.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = { postMessage: () => Promise.resolve().then(() => this.port1.onmessage?.()) };
    }
  };
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
test('页面只留即时年份下拉，盘亏和待查使用同一张含合计的表', () => {
  render(<AssetInventoryReportPage />);
  expect(screen.getAllByRole('combobox')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: /查\s*询/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /下载/ })).not.toBeInTheDocument();
  expect(screen.queryByText('原始模板')).not.toBeInTheDocument();
  expect(screen.queryByText('备注：-')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '盘亏资产' }));
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getAllByRole('table')).toHaveLength(1);
  expect(within(panel).queryByRole('combobox')).not.toBeInTheDocument();
  expect(within(panel).getByRole('columnheader', { name: '赔偿金额' })).toBeInTheDocument();
  expect(within(panel).getByText('资产盘亏合计').closest('td')).toHaveAttribute('colspan', '5');
  expect(within(panel).getByText('资产待查合计')).toBeInTheDocument();
  expect(within(panel).getByText('总计')).toBeInTheDocument();
});
test('年份选择后立即刷新，无需查询按钮，再选2025恢复报告', async () => {
  render(<AssetInventoryReportPage />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(screen.getByText('2026年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getByText('2026年暂无盘点报告')).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(await screen.findByText('2025年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getByText('2025年度资产盘点报告（ES管控资产）')).toBeInTheDocument();
});
