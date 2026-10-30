import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import { getInventoryReport, getInventoryReportProjects, exportInventoryReport } from '../../services/inventoryReportService';

jest.mock('./useInventoryOperator', () => ({ useInventoryOperator: () => ['213852-孙志强'] }));
jest.mock('../../services/inventoryReportService', () => ({ getInventoryReport: jest.fn(), getInventoryReportProjects: jest.fn(), exportInventoryReport: jest.fn() }));
jest.mock('./InventoryReportTables', () => ({ AnalysisTables: ({ report }) => <div>{report.period} {report.data}</div>, DetailTable: () => null }));
jest.mock('./InventoryReportCharts', () => () => null);
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: ({ children, buttons }) => <div>{children}{buttons}</div>, QueryItem: ({ children }) => <div>{children}</div> }));
jest.mock('antd', () => ({
  Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>,
  Card: ({ children }) => <div>{children}</div>, Empty: ({ description }) => <p>{description}</p>, Result: () => null,
  Select: ({ options, value, onChange, 'aria-label': label }) => <select aria-label={label} value={value ?? ''} onChange={event => onChange(label === '盘点年份' ? Number(event.target.value) : event.target.value)}><option value="">请选择</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>,
  Space: ({ children }) => <div>{children}</div>, Tabs: ({ items }) => <div>{items[0].children}</div>,
  Typography: { Title: ({ children }) => <h1>{children}</h1>, Text: ({ children }) => <span>{children}</span> },
  message: { success: jest.fn(), error: jest.fn() },
}));

beforeEach(() => { getInventoryReportProjects.mockReturnValue([]); getInventoryReport.mockReturnValue(null); });

test('同年多项目切换各自报告及导出，切换年度后重新选择', () => {
  const year = new Date().getFullYear();
  const complete = { year, history: [{ year, lossQuantity: 1, lossNet: 1 }], indicators: [], distribution: [], companyLoss: [], details: [], categoryLoss: [], increments: [] };
  const reportA = { ...complete, data: '仅项目甲' };
  const reportB = { ...complete, data: '仅项目乙' };
  getInventoryReportProjects.mockImplementation(value => value === year ? [
    { projectNo: 'P-A', projectName: '年度初盘甲', report: reportA },
    { projectNo: 'P-B', projectName: '年度初盘乙', report: reportB },
  ] : []);
  render(<AssetInventoryReportPage />);
  expect(screen.getByText('请选择盘点项目')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '导出' })).toBeDisabled();
  fireEvent.change(screen.getByRole('combobox', { name: '盘点项目' }), { target: { value: 'P-A' } });
  expect(screen.queryByText(/仅项目甲/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '查询' }));
  expect(screen.getByText(`${year - 1}年7月—${year}年7月 仅项目甲`)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(exportInventoryReport).toHaveBeenLastCalledWith(expect.objectContaining({ projectNo: 'P-A', data: '仅项目甲' }));
  fireEvent.change(screen.getByRole('combobox', { name: '盘点项目' }), { target: { value: 'P-B' } });
  expect(screen.getByText(`${year - 1}年7月—${year}年7月 仅项目甲`)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(exportInventoryReport).toHaveBeenLastCalledWith(expect.objectContaining({ projectNo: 'P-A' }));
  fireEvent.click(screen.getByRole('button', { name: '查询' }));
  expect(screen.getByText(`${year - 1}年7月—${year}年7月 仅项目乙`)).toBeInTheDocument();
  expect(screen.queryByText(/仅项目甲/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(exportInventoryReport).toHaveBeenLastCalledWith(expect.objectContaining({ projectNo: 'P-B', data: '仅项目乙' }));
  fireEvent.change(screen.getByRole('combobox', { name: '盘点年份' }), { target: { value: '2025' } });
  expect(screen.queryByRole('combobox', { name: '盘点项目' })).toBeNull();
  fireEvent.change(screen.getByRole('combobox', { name: '盘点年份' }), { target: { value: String(year) } });
  fireEvent.click(screen.getByRole('button', { name: '重置' }));
  expect(screen.getByText('请选择盘点项目')).toBeInTheDocument();
});

test('项目未绑定报告时不回退为年度汇总', () => {
  const year = new Date().getFullYear();
  getInventoryReportProjects.mockReturnValue([{ projectNo: 'P-A', projectName: '无报告' }, { projectNo: 'P-B', projectName: '有报告', report: { year } }]);
  render(<AssetInventoryReportPage />);
  fireEvent.change(screen.getByRole('combobox', { name: '盘点项目' }), { target: { value: 'P-A' } });
  fireEvent.click(screen.getByRole('button', { name: '查询' }));
  expect(screen.getByText('该项目暂无盘点报告')).toBeInTheDocument();
  expect(getInventoryReport).not.toHaveBeenCalled();
});

test('首次打开使用当前年，无报告展示该年空状态', () => {
  const year = jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2027);
  try {
    render(<AssetInventoryReportPage />);
    expect(screen.getByRole('combobox', { name: '盘点年份' })).toHaveValue('2027');
    expect(screen.getByText('2027年暂无盘点报告')).toBeInTheDocument();
  } finally { year.mockRestore(); }
});


test('项目报告缺少历史或其他必要数据时提示不完整，不混入年度汇总', () => {
  const year = new Date().getFullYear();
  getInventoryReportProjects.mockReturnValue([{ projectNo: 'P-A', projectName: '数据不完整', report: { year, history: [] } }]);
  render(<AssetInventoryReportPage />);
  expect(screen.getByText('该项目报告数据不完整')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '导出' })).toBeDisabled();
  expect(getInventoryReport).not.toHaveBeenCalled();
});


test('项目缺少分类或增量数据时不显示报告、不借年度数据', () => {
  const year = new Date().getFullYear();
  const report = { year, history: [{ year, lossQuantity: 1, lossNet: 1 }], indicators: [], distribution: [], companyLoss: [], details: [] };
  getInventoryReportProjects.mockReturnValue([{ projectNo: 'P-A', projectName: '缺分类', report }]);
  render(<AssetInventoryReportPage />);
  expect(screen.getByText('该项目报告数据不完整')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '导出' })).toBeDisabled();
  expect(getInventoryReport).not.toHaveBeenCalled();
});
