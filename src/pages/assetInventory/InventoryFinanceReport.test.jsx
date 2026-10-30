import React from 'react';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import InventoryFinanceReport from './InventoryFinanceReport';
import * as financeService from '../../services/inventoryFinanceReportService';
import { inventoryMenuItemsForOperator } from './inventoryReportAccess';
import { ASSET_INVENTORY_MENU_ITEMS } from '../yewurules/config/menuConfig';
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

test('财务独立页面共用报表表格，保留三表和19列明细，导出当前报告', async () => {
  const download = jest.spyOn(financeService, 'exportFinanceInventoryReport').mockResolvedValue(undefined);
  const options = financeService.getFinanceInventoryQueryOptions();
  render(<InventoryFinanceReport reportInput={{ companyCode: options.companies[0].value, plates: [options.plates[0].value], year: 2026, assets: [] }} />);
  const panel = screen.getByRole('main', { name: '财务盘点报告' });
  expect(within(panel).getByRole('combobox', { name: '子公司' })).toBeInTheDocument();
  expect(within(panel).getByRole('combobox', { name: '板块' })).toBeInTheDocument();
  expect(within(panel).getByRole('textbox', { name: '年度' })).toBeInTheDocument();
  expect(within(panel).queryByRole('heading', { name: '财务盘点报告' })).not.toBeInTheDocument();
  expect(within(panel).queryByText(/模板预览/)).not.toBeInTheDocument();
  expect(within(panel).queryByText('报告说明')).not.toBeInTheDocument();
  expect(within(panel).getByText('4、盘点表公式关系：C=A-B')).toBeInTheDocument();
  fireEvent.click(within(panel).getByRole('button', { name: /导\s*出/ }));
  await waitFor(() => expect(download).toHaveBeenCalledWith(expect.objectContaining({ sheets: expect.any(Array) })));
  download.mockRestore();
  const summary = within(within(panel).getByRole('tabpanel', { name: '盘点报告汇总' })).getAllByRole('table')[0];
  expect(within(summary).getByText('台账统计（A）')).toHaveAttribute('colspan', '4');
  expect(within(summary).getByText('价值差异说明')).toHaveAttribute('colspan', '6');
  expect(within(summary).getByText('PC')).toHaveAttribute('rowspan', '3');
  fireEvent.click(within(panel).getByRole('tab', { name: '盘亏资产明细' }));
  const detail = within(within(panel).getByRole('tabpanel', { name: '盘亏资产明细' })).getAllByRole('table')[0];
  expect(within(within(detail).getAllByRole('row')[0]).getAllByRole('columnheader')).toHaveLength(19);
  ['资产编号', '资产关键字', '资产寿命（月）', '累计折旧', '财务核算板块'].forEach(label => expect(within(detail).getAllByText(label).length).toBeGreaterThan(0));
  fireEvent.click(within(panel).getByRole('tab', { name: '待盘资产明细' }));
  expect(within(within(panel).getByRole('tabpanel', { name: '待盘资产明细' })).getAllByRole('table')[0]).toBeVisible();
});

test('独立菜单沿用原页签权限，ES报表不再包含财务页签', () => {
  expect(ASSET_INVENTORY_MENU_ITEMS).toContain('财务盘点报告');
  expect(inventoryMenuItemsForOperator(ASSET_INVENTORY_MENU_ITEMS, '213852-孙志强')).toContain('财务盘点报告');
  expect(inventoryMenuItemsForOperator(ASSET_INVENTORY_MENU_ITEMS, '徐博')).not.toContain('财务盘点报告');
  render(<AssetInventoryReportPage />);
  expect(screen.queryByRole('tab', { name: '财务盘点报告' })).not.toBeInTheDocument();
});

test('财务条件点击查询才生效，导出沿用当前报告，重置清空选择', async () => {
  const selectInput = jest.spyOn(financeService, 'selectFinanceInventoryReportInput');
  const download = jest.spyOn(financeService, 'exportFinanceInventoryReport').mockResolvedValue(undefined);
  const options = financeService.getFinanceInventoryQueryOptions();
  render(<InventoryFinanceReport reportInput={{ companyCode: options.companies[0].value, plates: [options.plates[0].value], year: 2026, assets: [] }} />);
  const company = screen.getByRole('combobox', { name: '子公司' });
  const card = company.closest('.ant-card');
  expect(within(card).getByRole('button', { name: /查\s*询/ })).toBeInTheDocument();
  expect(within(card).getByRole('button', { name: /导\s*出/ })).toBeInTheDocument();
  fireEvent.click(company.closest('.ant-select').querySelector('.ant-select-clear'));
  expect(selectInput.mock.calls.at(-1)[1].company).toBe(options.companies[0].value);
  fireEvent.click(screen.getByRole('button', { name: /导\s*出/ }));
  await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(selectInput.mock.calls.at(-1)[1]).toEqual({ company: '', plates: [], year: new Date().getFullYear() });
  expect(screen.getByRole('button', { name: /导\s*出/ })).toBeDisabled();
  selectInput.mockRestore(); download.mockRestore();
});
