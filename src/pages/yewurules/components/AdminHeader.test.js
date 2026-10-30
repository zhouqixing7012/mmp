import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminHeader from './AdminHeader';
jest.mock('../../assetInventory/useInventoryOperator', () => ({ useInventoryOperator: () => ['213852-孙志强'] }));
test('账户显示员工姓名并通过菜单退出演示会话', async () => {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  sessionStorage.removeItem('mmp-demo-signed-out');
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const listener = jest.fn();
  window.addEventListener('mmp-demo-session-change', listener);
  render(<AdminHeader activeSubMenu="我的资产" />);
  fireEvent.click(screen.getByRole('button', { name: '孙志强，账户菜单' }));
  fireEvent.click(await screen.findByText('退出登录'));
  expect(sessionStorage.getItem('mmp-demo-signed-out')).toBe('1');
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener('mmp-demo-session-change', listener);
  sessionStorage.removeItem('mmp-demo-signed-out');
});
