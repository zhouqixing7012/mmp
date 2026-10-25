jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import { DetailTable } from './InventoryReportTables';
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
  expect(screen.getAllByText('2,813').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('tab', { name: '盘亏及待查明细' }));
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getByText('201132100282')).toBeInTheDocument();
  expect(within(panel).getByText('NE3737')).toBeInTheDocument();
  expect(within(panel).getByText('刘霞')).toBeInTheDocument();
  expect(within(panel).getByText('王紫荆')).toBeInTheDocument();
  expect(within(panel).queryByText(/演示数据/)).not.toBeInTheDocument();
});

test('汇总和分类数量不带小数，零短横，明细金额保持两位', () => {
  render(<AssetInventoryReportPage />);
  const summary = screen.getByText('盘亏资产', { exact: true }).closest('tr');
  expect(summary.children[1].textContent).toBe('2');
  expect(summary.children[2].textContent).toBe('0.014%');
  expect(summary.children[3].textContent).toBe('2,813');
  const pending = screen.getByText('待查资产', { exact: true }).closest('tr');
  expect(pending.children[1].textContent).toBe('-');
  const classification = screen.getByText('2026年资产盘亏统计').closest('.ant-card');
  const mobileRows = within(classification).getAllByText('2', { exact: true });
  expect(mobileRows.length).toBeGreaterThan(0);
  expect(within(classification).queryByText('2.00', { exact: true })).not.toBeInTheDocument();
  expect(within(classification).queryByText('0.00', { exact: true })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '盘亏及待查明细' }));
  const panel = screen.getByRole('tabpanel', { name: '盘亏及待查明细' });
  expect(within(panel).getByText('1,946.00')).toBeInTheDocument();
});

test('分析与年度图表共用四列窄表，不拉伸到整个宽屏', () => {
  render(<AssetInventoryReportPage />);
  const table = screen.getByTestId('inventory-increment-table');
  expect(table).toHaveStyle({ width: '100%', maxWidth: '620px', minWidth: '0' });
  expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
  fireEvent.click(screen.getByRole('tab', { name: '年度报告图表' }));
  const chartPanel = screen.getByRole('tabpanel', { name: '年度报告图表' });
  const chartTable = within(chartPanel).getByTestId('inventory-increment-table');
  expect(chartTable).toHaveStyle({ width: '100%', maxWidth: '620px' });
  expect(within(chartTable).getAllByRole('columnheader')).toHaveLength(4);
});


test('明细普通行数量真0、原值会计0短横、净值负括号、赔偿及损失按确认留空', () => {
  const detail = { 标签号: 'FORMAT-DETAIL-ZERO', 盘点状态: '盘亏', 数量: 0, 原值: 0, 报失当月资产净值: -1234.5, 赔偿金额: 0, 损失: null };
  render(<DetailTable report={{ details: [detail], hasActualDetails: true }} />);
  const row = screen.getByText('FORMAT-DETAIL-ZERO').closest('tr');
  expect(row.children[5].textContent).toBe('0');
  expect(row.children[6].textContent).toBe('-');
  expect(row.children[7].textContent).toBe('(1,234.50)');
  expect(row.children[9].textContent).toBe('');
  expect(row.children[10].textContent).toBe('');
});

test('范围文案、六月净值标题和空备注在两个增量入口一致，不出现演示字样', () => {
  render(<AssetInventoryReportPage />);
  expect(screen.getByText('资产盘点类别：电脑（笔记本、主机、显示器）、办公设备、车辆、IP电话。（注：楼宇、装修、家具及软件不在盘点范围内）')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '净值（截至2026年6月）' })).toBeInTheDocument();
  const categoryCard = screen.getByText('2026年资产盘亏统计').closest('.ant-card');
  const currentRows = within(categoryCard).getAllByRole('row').filter(row => within(row).queryByRole('cell', { name: '2026', exact: true }));
  expect(currentRows).toHaveLength(7);
  currentRows.forEach(row => within(row).getAllByRole('cell').forEach(cell => expect(cell.style.background).not.toBe('')));
  const increment = screen.getByTestId('inventory-increment-table');
  expect(within(increment).getByRole('columnheader', { name: '备注' })).toBeInTheDocument();
  expect(screen.queryByText(/演示数据/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: '年度报告图表' }));
  const panel = screen.getByRole('tabpanel', { name: '年度报告图表' });
  expect(within(panel).queryByText(/演示数据/)).not.toBeInTheDocument();
  expect(within(panel).getAllByText('2,700')).toHaveLength(2);
  expect(within(panel).getAllByText('35%').length).toBeGreaterThanOrEqual(2);
  expect(within(panel).queryByText('2,700.00')).not.toBeInTheDocument();
});
