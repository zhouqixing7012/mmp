jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ClaimApplicationDetail from './ClaimApplicationDetail';
import { claimSummaryGroups, claimSummaryPOs, summaryExportRows } from './ClaimSummaryDetail';
import { claimDefinitions } from './claimDefinitions';
import { claimApplicationRows } from '../../mock/applicationClaimMock';
import { materialCatalog } from '../../mock/reference/materialCatalog';
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '' });
});
const byKind = kind => claimDefinitions.find(item => item.id === kind);
const assetPurchase = () => claimApplicationRows.find(row => row.kind === 'asset' && row.filters.subType === 'PURCHASE');
test('原申请数量金额与执行数量分离，采购详情无凭空生成标签或仓库', () => {
  const row = assetPurchase();
  expect(row.values.estimatedAmount).toBe(3 * 5800);
  expect(row.lines[0].quantity).toBe(2);
  expect(row.lines[0].tag).toBe('');
  expect(row.head['当前仓库']).toBe('');
  expect(materialCatalog).toContain(row.lines[0].material);
  expect(row.summary.lines.map(line => line.inUseCount)).toEqual([2]);
  expect(row.ledgerCards.reduce((sum, card) => sum + card.quantity, 0)).toBe(6);
});
test('资产汇总按物资类别、耗材汇总按历史部门分组，空金额按已定义规则处理', () => {
  const lines = [{ materialCategory: '甲', originalDepartment: 'A', purchaseQuantity: 2, unitPrice: 10 }, { materialCategory: '甲', originalDepartment: 'B', purchaseQuantity: 3, unitPrice: null }];
  expect(claimSummaryGroups(lines, false)).toEqual([{ id: '甲', name: '甲', quantity: 5, amount: 20 }]);
  expect(claimSummaryGroups(lines, true)).toHaveLength(2);
});
test('PO按单号和状态同时去重，导出费用按采购数量计算', () => {
  const lines = [...assetPurchase().summary.lines, { ...assetPurchase().summary.lines[0], id: 'other-status', purchaseQuantity: 1, poStatus: '待下单' }];
  expect(claimSummaryPOs([...lines, { ...lines[0], id: 'duplicate' }])).toHaveLength(2);
  const exported = summaryExportRows(lines, false);
  expect(exported[0]['预计费用（元）']).toBe(17400);
  expect(exported[1]['预计费用（元）']).toBe(5800);
});
test('申请详情按既定规则只读展示，源单据与返回操作保持', () => {
  const row = assetPurchase(), initial = JSON.stringify(row), onBack = jest.fn();
  render(<ClaimApplicationDetail definition={byKind('asset')} record={row} onBack={onBack} />);
  expect(screen.queryByRole('textbox', { name: '单据备注' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: '使用说明' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: '建筑' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('单据备注')).toHaveTextContent(row.remark || '-');
  expect(JSON.stringify(row)).toBe(initial);
  expect(screen.queryByRole('button', { name: /保\s*存/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  expect(onBack).toHaveBeenCalledTimes(1);
});
test('资产汇总显示两个申请分区和参考用量，项目用途不保存', () => {
  const row = assetPurchase();
  render(<ClaimApplicationDetail view="summary" definition={byKind('asset')} record={row} onBack={() => {}} />);
  expect(screen.getByText('超标申请')).toBeInTheDocument();
  expect(screen.getByText('非超标申请')).toBeInTheDocument();
  expect(screen.getByText('部门现资产参考使用量')).toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: '项目用途说明' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('项目用途说明')).toHaveTextContent(row.summary.projectUsage);
  expect(row.summary.projectUsage).toBe('部门日常办公');
  expect(screen.getByRole('button', { name: '导出申请明细' })).toBeInTheDocument();
});
test('新员工保留申请与领用数量差异，无独立导出或办理按钮', () => {
  const row = claimApplicationRows.find(item => item.id === 'newEmployee-1');
  render(<ClaimApplicationDetail definition={byKind('newEmployee')} record={row} onBack={() => {}} />);
  expect(screen.getByRole('columnheader', { name: '申请数量' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '领用数量' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /导\s*出/ })).not.toBeInTheDocument();
  expect(byKind('newEmployee').filters.filter(item => item.disabledReason)).toHaveLength(0);
});

test('资产领用可打开真实目录配件，领用与采购均展示资产来源标题', () => {
  const row = claimApplicationRows.find(item => item.kind === 'asset' && item.filters.subType === 'USE');
  expect(row.progressTitle).toBe('资产申请详情（此信息来源于资产系统）');
  expect(assetPurchase().progressTitle).toBe('资产申请详情（此信息来源于资产系统）');
  expect(row.lines[0].componentQuantity).toBe(1);
  expect(row.lines[0].components[0]).toEqual(expect.objectContaining(materialCatalog.find(item => item.materialCode === '228001598002000')));
  render(<ClaimApplicationDetail definition={byKind('asset')} record={row} onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /查看.+的配件（1件）/ }));
  expect(within(screen.getByRole('dialog', { name: '配件明细' })).getByText('228001598002000')).toBeInTheDocument();
});

test.each(['asset', 'consumable'])('%s详情短字段先行、长说明整行，资产用途只在资产详情保留', kind => {
  const row = claimApplicationRows.find(item => item.kind === kind && item.filters.subType === 'USE');
  render(<ClaimApplicationDetail definition={byKind(kind)} record={row} onBack={() => {}} />);
  const card = screen.getByText('申请明细').closest('.ant-card');
  const labels = Array.from(card.querySelectorAll('dt')).map(node => node.textContent);
  ['序列号', '公司', '板块', '启用日期', '实际物资说明', '配置', '备注', '城市', '建筑', '楼层', '申请物资说明', '申请原因', '详细说明', '使用说明'].forEach(label => expect(labels).toContain(label));
  expect(labels.includes('资产用途')).toBe(kind === 'asset');
  expect(card.querySelector('dl').style.gridTemplateColumns).toBe('112px minmax(0, 1fr) 112px minmax(0, 1fr) 112px minmax(0, 1fr)');
  expect(card.querySelector('[data-prototype-detail-value="申请物资说明"]').style.gridColumn).toBe('2 / -1');
  expect(labels.indexOf('建筑')).toBe(labels.indexOf('城市') + 1);
});
