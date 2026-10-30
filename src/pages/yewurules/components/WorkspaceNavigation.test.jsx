import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
  return jest.requireActual('react-router/dist/development/index.js');
}, { virtual: true });
import { MemoryRouter, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PersonalWorkspace from '../../gerengerzuotai';

jest.mock('../config/workspaceMenuConfig', () => ({ WORKSPACE_MENU_ITEMS: ['工作台首页', '资产退库', '资产更换申请', '合约号码退库'].map(key => ({ key, label: key })) }));
jest.mock('../../assetInventory/useInventoryOperator', () => ({ useInventoryOperator: () => [{}] }));
jest.mock('../../assetInventory/inventoryReportAccess', () => ({ inventoryMenuItemsForOperator: items => items }));
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', overflow: '', overflowX: '', overflowY: '' });
});
// 保留App按location.key重新挂载的行为，验证侧栏不会二次导航丢失入口及预填参数。
function EntryPage() {
  const location = useLocation();
  const target = location.state?.workspace || new URLSearchParams(location.search).get('workspace');
  const [menu, setMenu] = useState(target ? '个人工作台' : '库存管理');
  const [sub, setSub] = useState(target || '资产接收');
  return <><AdminSidebar activeMenu={menu} activeSubMenu={sub} onMenuToggle={setMenu} onSubMenuSelect={setSub} /><output data-testid="destination">{location.pathname}|{sub}|{JSON.stringify(location.state)}</output></>;
}
function RoutingHarness() {
  const location = useLocation();
  return location.pathname === '/home' ? <PersonalWorkspace /> : <EntryPage key={location.key} />;
}
test.each(['资产退库', '资产更换申请', '资产转移审批', '合约号码退库'])('%s入口保留页面及全部预填参数，不回到默认资产接收', async workspace => {
  const state = { workspace, prefillAssetTags: ['A2024001234'], prefillContractNumbers: ['13800138000'], source: 'personal-workspace' };
  render(<MemoryRouter initialEntries={[{ pathname: '/yewurules', state }]}><RoutingHarness /></MemoryRouter>);
  await waitFor(() => expect(screen.getByTestId('destination')).toHaveTextContent(`/yewurules|${workspace}|${JSON.stringify(state)}`));
});
test.each([['退库', '/yewurules', '资产退库'], ['更换', '/yewurules', '资产更换申请'], ['转移', '/People', null]])('个人资产%s点击仍进入指定业务路由并传递选中资产', async (action, pathname, destination) => {
  render(<MemoryRouter initialEntries={['/home']}><RoutingHarness /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole('button', { name: action })[0]);
  const output = await screen.findByTestId('destination');
  expect(output.textContent.split('|')[0]).toBe(pathname);
  if (destination) expect(output.textContent.split('|')[1]).toBe(destination);
  const state = JSON.parse(output.textContent.split('|')[2]);
  expect(state.prefillAssetTags).toHaveLength(1);
  expect(state.prefillAssetTags[0]).toMatch(/^A\d+$/);
  expect(state.source).toBe('personal-workspace');
});
