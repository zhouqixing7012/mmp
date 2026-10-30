import React, { useState } from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import AdminContent from './AdminContent';
import QueryBar, { QueryItem } from '../../../components/QueryBar';
jest.mock('../../../components/PageMotionBoundary', () => ({ children }) => <div>{children}</div>);
function Page({ label }) {
  const [value, setValue] = useState('');
  return <><QueryBar><QueryItem label={label}><input aria-label={label} value={value} onChange={e => setValue(e.target.value)} /></QueryItem></QueryBar><div>结果表格</div></>;
}
function Harness() {
  const [tab, setTab] = useState('物料大类');
  return <AdminContent activeMenu="后台基础配置" activeSubMenu="物料数据维护" activeTab={tab} tabs={['物料大类', '品牌']} onTabChange={setTab}>
    <Page key={tab} label={tab} />
  </AdminContent>;
}
beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
test('业务标签与查询在同一Card，切回保留输入，无重复面包屑', async () => {
  render(<Harness />);
  const input = screen.getByRole('textbox', { name: '物料大类' });
  expect(within(input.closest('.ant-card')).getByRole('tab', { name: '品牌' })).toBeInTheDocument();
  fireEvent.change(input, { target: { value: 'PC' } });
  fireEvent.click(screen.getByRole('tab', { name: '品牌' }));
  await waitFor(() => expect(within(screen.getByRole('textbox', { name: '品牌' }).closest('.ant-card')).getByRole('tab', { name: '物料大类' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('tab', { name: '物料大类' }));
  expect(screen.getByRole('textbox', { name: '物料大类' })).toHaveValue('PC');
  expect(screen.queryByRole('navigation', { name: '面包屑' })).not.toBeInTheDocument();
});
