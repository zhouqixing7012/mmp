import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import InventoryReportCharts from './InventoryReportCharts';
import { getInventoryReport } from '../../services/inventoryReportService';
// 隔离表格和主题，只验证实际Recharts的SVG轴、点标签和扇区标签。
jest.mock('./InventoryReportTables', () => ({ ReportTable: () => null, IncrementTable: () => null, CompanyLossTable: () => null }));
jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children, title }) => <div>{title}{children}</div>;
  return { Card: Box, Space: Box, Empty: Box, Typography: { Text: Box, Title: Box }, theme: { useToken: () => ({ token: { colorPrimary: '#1677ff', colorSuccess: '#52c41a', colorWarning: '#faad14', purple: '#722ed1', cyan: '#13c2c2', colorTextSecondary: '#888', colorError: '#ff4d4f', colorText: '#222', colorBgContainer: '#fff', colorBorderSecondary: '#ddd' } }) } };
});
beforeEach(() => {
  window.ResizeObserver = class { constructor(callback) { this.callback = callback; } observe(target) { this.callback([{ target, contentRect: target.getBoundingClientRect() }]); } unobserve() {} disconnect() {} };
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
    const chart = String(this.className).includes('recharts-responsive-container') || this.className === 'recharts-wrapper';
    const width = chart ? 1000 : 100;
    const height = chart ? 340 : 24;
    return { x: 0, y: 0, width, height, top: 0, left: 0, right: width, bottom: height };
  });
});
afterEach(() => jest.restoreAllMocks());
test('实际SVG显示折线点数值、整数饼图占比和外侧万元/件数', async () => {
  render(<InventoryReportCharts report={getInventoryReport(2026)} />);
  await waitFor(() => {
    expect(screen.getAllByText('13,317').length).toBeGreaterThan(0);
  }, { timeout: 5000 });
  expect(screen.getAllByText('0.361%').length).toBeGreaterThan(0);
  expect(await screen.findByText('2700万元(3120件)', {}, { timeout: 5000 })).toBeInTheDocument();
  expect(screen.getAllByText('35%').length).toBeGreaterThan(0);
}, 10000);
