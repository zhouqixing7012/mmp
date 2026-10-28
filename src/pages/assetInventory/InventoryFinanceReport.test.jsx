import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import InventoryFinanceReport from './InventoryFinanceReport';
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

test('财务独立页面共用报表表格，保留三表和19列明细，下载原始xls模板', () => {
  render(<InventoryFinanceReport />);
  const panel = screen.getByRole('main', { name: '财务盘点报告' });
  expect(within(panel).getByText(/模板预览/)).toBeInTheDocument();
  expect(within(panel).getByRole('link', { name: '导出模板' })).toHaveAttribute('href', './templates/inventory-finance-report.xls');
  const summary = within(within(panel).getByRole('tabpanel', { name: '盘点报告汇总' })).getAllByRole('table')[0];
  expect(within(summary).getByText('台账统计（A）')).toHaveAttribute('colspan', '4');
  expect(within(summary).getByText('价值差异说明')).toHaveAttribute('colspan', '6');
  expect(within(summary).getByText('PC')).toHaveAttribute('rowspan', '5');
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
