// CRA Jest 不解析依赖子路径导出，复用仓库现有方式加载同一个真实模块。
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import MaterialComprehensiveView from './MaterialComprehensiveView';

jest.mock('./MaterialComprehensiveSelectModals', () => () => null);
jest.mock('./MaterialComprehensiveFormModal', () => () => null);
jest.mock('./MaterialBatchActionModal', () => () => null);

// JSDOM没有MessageChannel，使用Node同名实现并在每项测试后关闭端口。
const channels = [];
beforeEach(() => {
  global.MessageChannel = class extends require('worker_threads').MessageChannel {
    constructor() { super(); channels.push(this); }
  };
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});

test('勾选后追加批量栏，常驻新增保留，取消后撤销勾选', () => {
  render(<MaterialComprehensiveView />);
  expect(screen.queryByRole('region', { name: '所选物料批量操作' })).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  expect(screen.getByText('已选本页 1 条')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /新增/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '取消选择' }));
  expect(screen.queryByRole('region', { name: '所选物料批量操作' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
});

test('输入不提前查询；查询无结果清选择，重置恢复列表', () => {
  render(<MaterialComprehensiveView />);
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  fireEvent.change(screen.getByRole('textbox', { name: '维度组合编码' }), { target: { value: 'no-match' } });
  expect(screen.getByText('228002052003000')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /查\s*询/ }));
  expect(screen.getByText('暂无匹配结果')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: '所选物料批量操作' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(screen.getByText('228002052003000')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: '维度组合编码' })).toHaveValue('');
});

test('更多条件展开收起保留查询草稿和表格选择', () => {
  render(<MaterialComprehensiveView />);
  fireEvent.change(screen.getByRole('textbox', { name: '维度组合描述' }), { target: { value: '闪迪' } });
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  fireEvent.click(screen.getByRole('button', { name: /展开更多/ }));
  expect(screen.getByRole('spinbutton', { name: '参考价格从' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /收起更多/ }));
  expect(screen.getByRole('textbox', { name: '维度组合描述' })).toHaveValue('闪迪');
  expect(screen.getByText('已选本页 1 条')).toBeInTheDocument();
});

test('行高四档可切换且不改正文数据', () => {
  const { container } = render(<MaterialComprehensiveView />);
  expect(container.querySelector('.material-comprehensive')).toHaveStyle('--material-row-height: 40px');
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '表格行高' }));
  const option = screen.getAllByText('行高 32px').find(element => element.closest('.ant-select-item-option'));
  fireEvent.click(option);
  expect(container.querySelector('.material-comprehensive')).toHaveStyle('--material-row-height: 32px');
  expect(within(container).getByText('228002052003000')).toBeInTheDocument();
});

afterEach(() => { channels.splice(0).forEach(channel => { channel.port1.close(); channel.port2.close(); }); });
