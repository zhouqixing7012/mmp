import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
jest.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/yewurules', search: '', state: null, key: 'test' }), useNavigate: () => jest.fn() }), { virtual: true });
import AdminSidebar from './AdminSidebar';

jest.mock('../config/workspaceMenuConfig', () => ({ WORKSPACE_MENU_ITEMS: [{ key: '工作台首页', label: '工作台首页' }] }));
jest.mock('../../assetInventory/useInventoryOperator', () => ({ useInventoryOperator: () => [{}] }));
jest.mock('../../assetInventory/inventoryReportAccess', () => ({ inventoryMenuItemsForOperator: items => items }));

function Harness() {
  const [menu, setMenu] = useState('库存管理');
  const [sub, setSub] = useState('资产接收');
  return <><AdminSidebar activeMenu={menu} activeSubMenu={sub} onMenuToggle={setMenu} onSubMenuSelect={setSub} /><output>{menu}/{sub}</output></>;
}

test('收折不切换当前路径，展开恢复选中菜单，正文不卸载', async () => {
  render(<Harness />);
  const output = screen.getByRole('status');
  const toggle = screen.getByRole('button', { name: '收起侧栏' });
  fireEvent.click(toggle);
  expect(screen.getByRole('button', { name: '展开侧栏' })).toHaveAttribute('aria-expanded', 'false');
  expect(output).toHaveTextContent('库存管理/资产接收');
  fireEvent.click(screen.getByRole('button', { name: '展开侧栏' }));
  await waitFor(() => expect(screen.getByRole('menuitem', { name: '资产接收' })).toHaveClass('ant-menu-item-selected'));
  expect(screen.getByRole('status')).toBe(output);
});

test('仅展开其他分组保留当前业务，选择子菜单才切换模块和路径', async () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('menuitem', { name: '资产管理' }));
  expect(screen.getByRole('status')).toHaveTextContent('库存管理/资产接收');
  fireEvent.click(await screen.findByRole('menuitem', { name: '资产维护' }));
  expect(screen.getByRole('status')).toHaveTextContent('资产管理/资产维护');
});

test('键盘可展开菜单并选择子项', async () => {
  render(<Harness />);
  const group = screen.getByRole('menuitem', { name: '资产管理' });
  act(() => group.focus());
  fireEvent.keyDown(group, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
  const child = await screen.findByRole('menuitem', { name: '资产维护' });
  act(() => child.focus());
  fireEvent.keyDown(child, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
  expect(screen.getByRole('status')).toHaveTextContent('资产管理/资产维护');
});

test('八个一级菜单分别使用不同图标，收折后仍能通过名称识别', () => {
  render(<Harness />);
  const names = ['个人工作台', '资产管理', '无形资产', '库存管理', '资产盘点', '资产报表', '申请', '后台基础配置'];
  const icons = names.map(name => {
    const item = screen.getByRole('menuitem', { name });
    const icon = item.querySelector('svg');
    expect(icon).not.toBeNull();
    return icon.getAttribute('class');
  });
  expect(new Set(icons).size).toBe(names.length);
  fireEvent.click(screen.getByRole('button', { name: '收起侧栏' }));
  names.forEach(name => expect(screen.getByRole('menuitem', { name })).toBeInTheDocument());
});
