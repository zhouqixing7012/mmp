import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as XLSX from 'xlsx';
import AssetInventoryProgressV2 from './AssetInventoryProgressV2';

jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
jest.mock('antd', () => ({
  Button: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  message: { info: jest.fn(), warning: jest.fn() },
  Card: ({ title, extra, children }) => <section>{title}{extra}{children}</section>,
  Space: ({ children }) => <div>{children}</div>,
  Progress: ({ percent }) => <span>{percent}%</span>,
  Typography: { Title: ({ children }) => <h4>{children}</h4> },
  Table: ({ columns, dataSource, pagination, onChange, rowSelection }) => <div>
    {rowSelection && <button onClick={() => rowSelection.onChange(dataSource.map(row => row.key))}>勾选全部进度</button>}
    <div>{columns.map((column) => <span key={column.dataIndex || column.title}>{column.title}</span>)}</div>
    {dataSource.map((row) => <div key={row.key}>{columns.map((column) => <span key={column.dataIndex || column.title}>{column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}</span>)}</div>)}
    {pagination && <><span>{pagination.showTotal(dataSource.length)}</span><button onClick={() => onChange({ current: 1 }, { counted: [1] }, {}, { action: 'filter' })}>筛选已盘1</button><button onClick={() => onChange({ current: 1 }, { counted: [999] }, {}, { action: 'filter' })}>筛选无结果</button></>}
  </div>,
}));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, DetailItem: ({ children }) => <span>{children}</span> }));
const plans = [{ planNo: 'P1', range: '公共', executor: '李磊', supervisor: '韩晓晗', financialSupervisor: '徐博', auditSupervisor: '-' }];
const assets = [
  { assetTag: '3102200966', inventoryStatus: '已盘', organization: '集团', city: '北京市', quantity: 1 },
  { assetTag: '114121801802', inventoryStatus: '审核中', organization: '集团', city: '上海市', quantity: 1 },
];
const setup = (projectType) => render(<AssetInventoryProgressV2 project={{ projectNo: 'CP-test', projectType }} plans={plans} assetsForPlan={() => assets} onBack={() => {}} />);

test('角色列按项目类型展示，详情分页筛选导出只取匹配记录，已移除重置按钮', () => {
  setup('复盘');
  fireEvent.click(screen.getAllByText('查看详情')[1]);
  expect(screen.getByText('财务监督人')).toBeInTheDocument();
  expect(screen.queryByText('内审监督人')).not.toBeInTheDocument();
  expect(screen.getByText('计划监督人')).toBeInTheDocument();
  expect(screen.getByText('共 2 条')).toBeInTheDocument();
  fireEvent.click(screen.getByText('筛选已盘1'));
  expect(screen.getByText('共 1 条')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导出'));
  const workbook = XLSX.writeFile.mock.calls.at(-1)[0];
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['公共进度详情'])).toEqual([expect.objectContaining({ City: '北京市', 已盘数量: 1 })]);
  expect(screen.queryByText('重置筛选')).not.toBeInTheDocument();
});

test('初盘不展示复盘角色，删除资产清单入口并保留催盘', () => {
  setup('初盘');
  expect(screen.queryByText('查看未盘资产')).not.toBeInTheDocument();
  expect(screen.queryByText('查看盘点全量资产')).not.toBeInTheDocument();
  expect(screen.getByText('催盘')).toBeDisabled();
  fireEvent.click(screen.getByText('勾选全部进度'));
  expect(screen.getByText('催盘')).not.toBeDisabled();
  expect(screen.queryByText('查看资产清单')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByText('查看详情')[1]);
  expect(screen.getByText('计划监督人')).toBeInTheDocument();
  expect(screen.queryByText('财务监督人')).not.toBeInTheDocument();
});

test('进度详情查询无结果时导出本范围权限全部记录', () => {
  setup('初盘');
  fireEvent.click(screen.getAllByText('查看详情')[1]);
  fireEvent.click(screen.getByText('筛选无结果'));
  expect(screen.getByText('共 0 条')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导出'));
  const workbook = XLSX.writeFile.mock.calls.at(-1)[0];
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['公共进度详情'])).toHaveLength(2);
});

 test('项目进度导出仅含七项汇总字段', () => {
  setup('初盘');
  fireEvent.click(screen.getByText('导出'));
  const workbook = XLSX.writeFile.mock.calls.at(-1)[0];
  const [headers] = XLSX.utils.sheet_to_json(workbook.Sheets['项目进度'], { header: 1 });
  expect(headers).toEqual(['盘点范围', '启动时间', '结束时间', '应盘数量', '已盘数量', '未盘数量', '数量进度']);
});
