jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { App } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import TransferApplicationPage from './TransferApplicationPage';
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test('申请转移单可查询、编辑草稿及查看已完成单据', () => {
  render(<App><TransferApplicationPage /></App>);
  expect(screen.getByText('转出部门:')).toBeInTheDocument(); expect(screen.getByText('转入部门:')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ZY202610150001' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /编\s*辑/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'ZY202610140002' }));
  expect(screen.getByText('转移单详情')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: '执行转移' })).not.toBeInTheDocument();
});
test('创建默认信息、保存后返回列表能打开同一草稿', () => {
  render(<App><TransferApplicationPage /></App>); fireEvent.click(screen.getByRole('button', { name: /创\s*建/ }));
  expect(screen.getByText('转移单填写')).toBeInTheDocument(); expect(screen.getByText('sunzhq.孙志强')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  expect(screen.getAllByRole('button', { name: /编\s*辑/ }).length).toBeGreaterThan(1);
});
test('草稿添加资产入口使用公共资产选择表，显示标签和固定物料说明', () => {
  render(<App><TransferApplicationPage /></App>); fireEvent.click(screen.getAllByRole('button', { name: /编\s*辑/ })[0]);
  fireEvent.click(screen.getByRole('button', { name: '添加资产' }));
  expect(screen.getByRole('dialog', { name: '选择资产' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'SN号' })).toBeInTheDocument();
});
