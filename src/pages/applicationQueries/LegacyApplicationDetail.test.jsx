jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import LegacyApplicationDetail from './LegacyApplicationDetail';
import LegacyStorageDetail from './LegacyStorageDetail';
import { legacyDefinitions } from './legacyDefinitions';
import { legacyApplicationRows } from '../../mock/applicationLegacyMock';

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
function open(id) {
  const record = legacyApplicationRows.find(row => row.id === id);
  render(<LegacyApplicationDetail definition={legacyDefinitions.find(item => item.id === record.kind)} record={record} onBack={jest.fn()} onProgress={jest.fn()} />);
  return record;
}
test('移库从列表记录进入只读详情，资产和耗材使用不同信息区域', async () => {
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
  expect(within(dialog).getByText('耗材信息')).toBeInTheDocument();
  expect(within(dialog).getByText('懿品佳.230A四色粉盒（国产）')).toBeInTheDocument();
});
test('退库详情只显示首条主资产，配件与附属耗材来自该条记录', async () => {
  const record = open('return-3');
  expect(screen.getByRole('button', { name: record.lines[0].tag })).toBeInTheDocument();
  expect(screen.queryByText(record.lines[1].tag)).not.toBeInTheDocument();
  expect(screen.getByText('附属耗材')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '1' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(record.lines[0].accessories[0].tag)).toBeInTheDocument();
});
test('续借有独立字段，审批代理人保持空白', () => {
  open('borrow-3');
  expect(screen.getByText('续借次数')).toBeInTheDocument();
  expect(screen.getByText('续借开始日期')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '代理人' })).toBeInTheDocument();
  expect(screen.queryByText('借用开始日期')).not.toBeInTheDocument();
});
test('移库状态1显示入库验证，其他普通状态不显示验证列', () => {
  open('storage-4');
  expect(screen.getByRole('columnheader', { name: '资产验证' })).toBeInTheDocument();
  expect(screen.getAllByText('未验证')).toHaveLength(2);
});
test('借用列表数量为所有明细数量合计，退库业务日期与导出创建时间独立', () => {
  const borrow = legacyApplicationRows.find(row => row.id === 'borrow-2');
  expect(borrow.values.quantity).toBe(borrow.lines.reduce((sum, line) => sum + line.quantity, 0));
  const returned = legacyApplicationRows.find(row => row.id === 'return-3');
  expect(returned.values.applyDate).not.toBe(returned.createdAt.slice(0, 10));
  expect(legacyDefinitions.find(item => item.id === 'return').exportColumns.find(column => column.label === '申请时间').key).toBe('createdAt');
});

test.each([['3', undefined, undefined, false], ['3', true, true, true], ['2', true, true, false]])('移库状态%s库区货位开关%s/%s按明确配置显示', async (statusCode, zoneEnabled, binEnabled, visible) => {
  const source = legacyApplicationRows.find(row => row.id === 'storage-2');
  const record = { ...source, statusCode, to: { ...source.to, zoneEnabled, binEnabled }, lines: source.lines.map(line => ({ ...line, inboundZone: '测试库区', inboundBin: '测试货位' })) };
  render(<LegacyStorageDetail record={record} />);
  fireEvent.click(screen.getAllByRole('button', { name: '查看' })[0]);
  const dialog = await screen.findByRole('dialog');
  if (visible) {
    expect(within(dialog).getByText('入库库区')).toBeInTheDocument();
    expect(within(dialog).getByText('测试货位')).toBeInTheDocument();
  } else {
    expect(within(dialog).queryByText('入库库区')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('入库货位')).not.toBeInTheDocument();
  }
});
