import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });

beforeEach(() => {
  window.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = { postMessage: () => Promise.resolve().then(() => this.port1.onmessage?.()) };
    }
  };
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});

test('财务新页签保留三表、合并表头和19列明细，下载原始xls模板', () => {
  render(<AssetInventoryReportPage />);
  fireEvent.click(screen.getByRole('tab', { name: '财务盘点报告' }));
  const panel = screen.getByRole('tabpanel', { name: '财务盘点报告' });
  expect(within(panel).getByText(/模板预览/)).toBeInTheDocument();
  expect(within(panel).getByRole('link', { name: '导出模板' })).toHaveAttribute('href', './templates/inventory-finance-report.xls');
  const summary = within(panel).getByRole('table', { name: '盘点报告汇总' });
  expect(within(summary).getByText('台账统计（A)')).toHaveAttribute('colspan', '4');
  expect(within(summary).getByText('价值差异说明')).toHaveAttribute('colspan', '6');
  expect(within(summary).getByText('PC')).toHaveAttribute('rowspan', '5');
  fireEvent.click(within(panel).getByRole('tab', { name: '盘亏资产明细' }));
  const detail = within(panel).getByRole('table', { name: '盘亏资产明细' });
  expect(within(within(detail).getAllByRole('row')[1]).getAllByRole('columnheader')).toHaveLength(19);
  ['资产编号', '资产关键字', '资产寿命（月）', '累计折旧', '财务核算板块'].forEach(label => expect(within(detail).getByText(label)).toBeInTheDocument());
  fireEvent.click(within(panel).getByRole('tab', { name: '待盘资产明细' }));
  expect(within(panel).getByRole('table', { name: '待盘资产明细' })).toBeVisible();
});

test('无ES年度报告时仍可打开财务模板，原ES页签保留空状态', () => {
  render(<AssetInventoryReportPage />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(screen.getByText('2022年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getByText('2022年暂无盘点报告')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '财务盘点报告' }));
  expect(screen.getByRole('table', { name: '盘点报告汇总' })).toBeVisible();
});
