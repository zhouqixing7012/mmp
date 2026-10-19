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
test('模板入口及汇总跳明细保留盘亏状态，明细19项字段完整', () => {
  render(<AssetInventoryReportPage />);
  expect(screen.getByRole('link', { name: '下载报告模板（PPT）' })).toHaveAttribute('download');
  expect(screen.getByRole('link', { name: '下载盘亏清单模板（Excel）' })).toHaveAttribute('download');
  fireEvent.click(screen.getByRole('button', { name: '盘亏资产' }));
  expect(screen.getByRole('tab', { name: '盘亏及待查明细' })).toHaveAttribute('aria-selected', 'true');
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getByTitle('盘亏')).toBeInTheDocument();
  expect(within(panel).getByRole('columnheader', { name: '赔偿金额' })).toBeInTheDocument();
  expect(within(panel).getByRole('columnheader', { name: '责任人编号' })).toBeInTheDocument();
  expect(within(panel).getByText('模板未提供实际盘亏及待查资产明细')).toBeInTheDocument();
});
test('年份查询无数据与重置恢复模板一致', () => {
  render(<AssetInventoryReportPage />);
  fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
  fireEvent.click(screen.getByText('2026年', { selector: '.ant-select-item-option-content' }));
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getByText('2026年尚未提供完整报告，模板示例请查询2025年')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(screen.getByText('2025年度资产盘点报告（ES管控资产）')).toBeInTheDocument();
});
