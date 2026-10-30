import React from 'react';
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn(), useLocation: () => ({ pathname: '/yewurules' }) }), { virtual: true });
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryManagementContent } from './index';
beforeEach(() => {
  window.getComputedStyle = () => ({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.MessageChannel = class { constructor() { this.port1 = { onmessage: null }; this.port2 = { postMessage: () => Promise.resolve().then(() => this.port1.onmessage?.()) }; } };
});
test.each(['PI-202608070025', 'PI-202608060003', 'PI-202608050012', 'PI-202608010006', 'PI-CM-202608010001'])('%s从入库菜单打开单据详情并返回', number => {
  render(<InventoryManagementContent activeSubMenu="入库" />);
  fireEvent.click(screen.getByRole('button', { name: number }));
  expect(screen.getByText('入库单信息')).toBeInTheDocument();
  expect(screen.getByText(number)).toBeInTheDocument();
  expect(screen.getByText('入库物资')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  expect(screen.getByText('入库单列表')).toBeInTheDocument();
}, 20000);

test('创建入库单时未选择待入库物资也能正常初始化和返回', () => {
  render(<InventoryManagementContent activeSubMenu="入库" />);
  fireEvent.click(screen.getByRole('button', { name: /创\s*建/ }));
  expect(screen.getByText('入库单信息')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '执行入库' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /返\s*回/ }));
  expect(screen.getByText('入库单列表')).toBeInTheDocument();
}, 20000);
