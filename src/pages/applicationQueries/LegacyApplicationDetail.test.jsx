jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import LegacyApplicationDetail from './LegacyApplicationDetail';
import LegacyStorageDetail from './LegacyStorageDetail';
import { legacyDefinitions } from './legacyDefinitions';
import { legacyApplicationRows } from '../../mock/applicationLegacyMock';
import { queryApplications } from '../../services/applicationQueryService';

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
function open(id) {
  const record = id.startsWith('storage-') ? queryApplications('storage').find(row => row.id === id) : legacyApplicationRows.find(row => row.id === id);
  render(<LegacyApplicationDetail definition={legacyDefinitions.find(item => item.id === record.kind)} record={record} onBack={jest.fn()} onProgress={jest.fn()} />);
  return record;
}
test('移库从库存源单进入只读详情，各行展示对应源资产', async () => {
  open('storage-3');
  expect(screen.getByText('移库单信息')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /保存|接收/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  let dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('资产信息')).toBeInTheDocument();
  expect(within(dialog).getByText('费用账户')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: /关\s*闭/ }));
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[1]);
  dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('资产信息')).toBeInTheDocument();
  expect(within(dialog).getByText(queryApplications('storage').find(row => row.id === 'storage-3').lines[1].material.materialDescription)).toBeInTheDocument();
});
test('退库详情只显示首条主资产，配件与附属耗材来自该条记录', async () => {
  const record = open('return-3');
  expect(screen.getByRole('button', { name: record.lines[0].tag })).toBeInTheDocument();
  expect(screen.queryByText(record.lines[1].tag)).not.toBeInTheDocument();
  expect(screen.getByText('附属耗材')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /查看.+的配件（1件）/ }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(record.lines[0].accessories[0].tag)).toBeInTheDocument();
});
test('续借全部资产放在同一张表格，三个卡片分区且保留审批记录', () => {
  const record = open('borrow-3');
  expect(Array.from(document.querySelectorAll('.ant-card-head-title')).map(node => node.textContent)).toEqual(['申请人信息', '续借资产信息', '审批记录']);
  const card = screen.getByText('续借资产信息').closest('.ant-card');
  const table = within(card).getByRole('table');
  expect(within(table).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['资产标签号', '资产说明', '续借次数', '续借原因', '续借开始日期', '续借归还日期']);
  expect(within(table).getAllByRole('row')).toHaveLength(record.lines.length + 1);
  record.lines.forEach(line => expect(within(table).getByText(line.tag)).toBeInTheDocument());
  expect(within(table).getByRole('columnheader', { name: '资产说明' }).style.textAlign).toBe('left');
  expect(within(table).getByRole('columnheader', { name: '续借次数' }).style.textAlign).toBe('right');
  expect(within(table).getByRole('columnheader', { name: '续借开始日期' }).style.textAlign).toBe('center');
  expect(screen.getByRole('columnheader', { name: '代理人' })).toBeInTheDocument();
  expect(screen.queryByText('借用开始日期')).not.toBeInTheDocument();
});
test('出库待接收移库单展示源明细的验证结果', () => {
  open('storage-3');
  expect(screen.getByRole('columnheader', { name: '资产验证' })).toBeInTheDocument();
  expect(screen.getAllByText('未验证')).toHaveLength(1);
  expect(screen.getByText('已验证')).toBeInTheDocument();
});
test('借用数量按明细合计，退库列表与导出使用同一申请时间', () => {
  const borrow = legacyApplicationRows.find(row => row.id === 'borrow-2');
  expect(borrow.values.quantity).toBe(borrow.lines.reduce((sum, line) => sum + line.quantity, 0));
  const returned = legacyApplicationRows.find(row => row.id === 'return-3');
  expect(Object.fromEntries(returned.head)['申请时间']).toBe(returned.values.applyTime.slice(0, 10));
  expect(legacyDefinitions.find(item => item.id === 'return').exportColumns.find(column => column.label === '申请时间').key).toBe('applyTime');
});

test.each(['出库待接收', '草稿', '已完成'])('移库状态%s查看弹窗按用户精简库区货位等字段', async statusCode => {
  const source = queryApplications('storage').find(row => row.id === 'storage-3');
  const record = { ...source, values: { ...source.values, status: statusCode }, statusCode, to: { ...source.to, zoneEnabled: true, binEnabled: true }, lines: source.lines.map(line => ({ ...line, inboundZone: '测试库区', inboundBin: '测试货位' })) };
  render(<LegacyStorageDetail record={record} />);
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  const dialog = await screen.findByRole('dialog');
  ['库区', '货位', '入库库区', '入库货位', '印刷号', '品牌', '规格/型号', 'Room', '物资总类'].forEach(label => {
    expect(within(dialog).queryByText(label, { selector: 'dt' })).not.toBeInTheDocument();
  });
  expect(within(dialog).getByText('资产说明', { selector: 'dt' })).toBeInTheDocument();
  Array.from(dialog.querySelectorAll('dl')).forEach(grid => expect(grid.style.gridTemplateColumns).toBe('128px minmax(0, 1fr) 128px minmax(0, 1fr) 128px minmax(0, 1fr)'));
  expect(dialog.querySelector('[data-prototype-detail-value="出库仓库"]').style.gridColumn).toBe('span 3');
});

test('移库数量不补小数，详情表格按语义对齐，验证列先于移库状态', () => {
  open('storage-3');
  expect(document.querySelector('[data-prototype-detail-value="资产数量"]')).not.toHaveTextContent('2.0');
  const table = screen.getByRole('table');
  const headings = within(table).getAllByRole('columnheader');
  expect(headings.findIndex(cell => cell.textContent === '资产验证')).toBeLessThan(headings.findIndex(cell => cell.textContent === '移库状态'));
  expect(within(table).getByRole('columnheader', { name: '资产说明' }).style.textAlign).toBe('left');
  expect(within(table).getByRole('columnheader', { name: '数量' }).style.textAlign).toBe('right');
  expect(within(table).getByRole('columnheader', { name: '资产验证' }).style.textAlign).toBe('center');
  expect(within(table).getByRole('columnheader', { name: '启用日期' }).style.textAlign).toBe('center');
  expect(within(table).queryByRole('columnheader', { name: '物资总类' })).not.toBeInTheDocument();
  const cells = within(within(table).getAllByRole('row')[1]).getAllByRole('cell');
  [['资产说明', 'left'], ['数量', 'right'], ['资产验证', 'center'], ['启用日期', 'center']].forEach(([label, align]) => {
    expect(cells[headings.findIndex(cell => cell.textContent === label)].style.textAlign).toBe(align);
  });
});

test('已完成移库打印与返回属于同一个居中操作栏，返回真实回调', () => {
  const record = queryApplications('storage').find(row => row.values.status === '已完成');
  const onBack = jest.fn();
  render(<LegacyApplicationDetail definition={legacyDefinitions.find(item => item.id === 'storage')} record={record} onBack={onBack} />);
  const back = screen.getByRole('button', { name: /返\s*回/ });
  const print = screen.getByRole('button', { name: /打\s*印/ });
  expect(back.closest('.ant-space')).toBe(print.closest('.ant-space'));
  expect(back.closest('.ant-space').style.justifyContent).toBe('center');
  fireEvent.click(back); expect(onBack).toHaveBeenCalledTimes(1);
});

test('退库信息独立分区，退库仓库显示于右上角，鉴定记录按有效PRD保留', () => {
  const record = open('return-3');
  const info = screen.getByText('退库信息').closest('.ant-card');
  expect(Array.from(info.querySelectorAll('dt')).map(node => node.textContent)).toEqual(['退库单号', '单据状态', '退库类型', '退库原因', 'MIS鉴定']);
  expect(within(info).getByText(record.values.applicationNo)).toBeInTheDocument();
  expect(info.querySelector('[data-prototype-detail-value="MIS鉴定"]')).toHaveTextContent('否');
  const applicant = screen.getByText('申请人信息').closest('.ant-card');
  expect(applicant.querySelector('.ant-card-extra')).toHaveTextContent(`退库仓库：${record.lookupLabels.warehouse}`);
  expect(within(applicant).queryByText('退库类型')).not.toBeInTheDocument();
  ['鉴定人', '鉴定日期', '鉴定结果', '鉴定说明'].forEach(label => expect(screen.getByText(label, { selector: 'dt' })).toBeInTheDocument());
  expect(screen.queryByRole('button', { name: '查看进度' })).not.toBeInTheDocument();
});
