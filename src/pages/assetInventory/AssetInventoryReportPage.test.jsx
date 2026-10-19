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
test('页面只留即时年份下拉，2025演示明细保持原字段', async () => {
  render(<AssetInventoryReportPage />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(await screen.findByText('2025年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getAllByRole('combobox')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: /查\s*询/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /下载/ })).not.toBeInTheDocument();
  expect(screen.queryByText('原始模板')).not.toBeInTheDocument();
  expect(screen.queryByText('备注：-')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '盘亏资产' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: '资产管控方' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '盘亏及待查明细' }));
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getAllByRole('table')).toHaveLength(1);
  expect(within(panel).queryByRole('combobox')).not.toBeInTheDocument();
  expect(within(panel).getByRole('columnheader', { name: '赔偿金额' })).toBeInTheDocument();
  expect(within(panel).getByRole('columnheader', { name: '购买日期' })).toBeInTheDocument();
  expect(within(panel).queryByRole('columnheader', { name: '启用日期' })).not.toBeInTheDocument();
  expect(within(panel).queryByRole('columnheader', { name: '备注' })).not.toBeInTheDocument();
  const row = within(panel).getByText('ES-DEMO-001').closest('tr');
  [8, 9, 10].forEach(index => expect(row.children[index].textContent).toBe(''));
  expect(row.children[12]).toHaveTextContent('2023-03-15');
  expect(within(panel).getByText('资产盘亏合计').closest('td')).toHaveAttribute('colspan', '5');
  expect(within(panel).getByText('资产待查合计')).toBeInTheDocument();
  expect(within(panel).getByText('ES-DEMO-001')).toBeInTheDocument();
  expect(within(panel).getByText('ES-DEMO-007')).toBeInTheDocument();
  expect(within(panel).getByText('总计')).toBeInTheDocument();
});
test('默认2026真实报告，年份即时切换并能回到真实报告', async () => {
  render(<AssetInventoryReportPage />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(screen.getByText('2022年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getByText('2022年暂无盘点报告')).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '盘点年份' }));
  fireEvent.click(await screen.findByText('2026年', { selector: '.ant-select-item-option-content' }));
  expect(screen.getByText('2026年度资产盘点报告（ES管控资产）')).toBeInTheDocument();
});

test('资产增量的小计是独立汇总行，不再充当细类', () => {
  render(<AssetInventoryReportPage />);
  const subtotal = screen.getByText('台式机小计');
  expect(subtotal.closest('td')).toHaveAttribute('colspan', '2');
  expect(screen.getByText('PC-主机').closest('td')).not.toHaveAttribute('colspan', '2');
});

test('范围仅在比较分析中显示，分类和增量按组纵向合并', () => {
  render(<AssetInventoryReportPage />);
  const panel = screen.getByRole('tabpanel', { name: '盘点结果比较分析' });
  expect(within(panel).getByText('资产变化范围')).toBeInTheDocument();
  expect(within(panel).getByText('台式机、显示器').closest('td')).toHaveAttribute('rowspan', '2');
  expect(within(panel).getAllByText('台式机', { exact: true })[0].closest('td')).toHaveAttribute('rowspan', '3');
  expect(within(panel).getByRole('columnheader', { name: '汇总' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '盘亏及待查明细' }));
  expect(screen.queryByText('资产变化周期：2025年7月—2026年7月')).not.toBeVisible();
});

test('2026显示真实两条明细及真实分类金额，无演示标记', () => {
  render(<AssetInventoryReportPage />);
  expect(screen.getAllByText('2,813.00').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('tab', { name: '盘亏及待查明细' }));
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getByText('201132100282')).toBeInTheDocument();
  expect(within(panel).getByText('NE3737')).toBeInTheDocument();
  expect(within(panel).getByText('刘霞')).toBeInTheDocument();
  expect(within(panel).getByText('王紫荆')).toBeInTheDocument();
  expect(within(panel).queryByText(/演示数据/)).not.toBeInTheDocument();
});
