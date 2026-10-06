import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as XLSX from 'xlsx';
import AssetInventoryProgressV2 from './AssetInventoryProgressV2';

jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
jest.mock('antd', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Card: ({ title, extra, children }) => <section>{title}{extra}{children}</section>,
  Space: ({ children }) => <div>{children}</div>,
  Progress: ({ percent }) => <span>{percent}%</span>,
  Typography: { Title: ({ children }) => <h4>{children}</h4> },
  Table: ({ columns, dataSource, pagination, onChange }) => <div>
    <div>{columns.map((column) => <span key={column.dataIndex || column.title}>{column.title}</span>)}</div>
    {dataSource.map((row) => <div key={row.key}>{columns.map((column) => <span key={column.dataIndex || column.title}>{column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}</span>)}</div>)}
    {pagination && <><span>{pagination.showTotal(dataSource.length)}</span><button onClick={() => onChange({ current: 1 }, { counted: [1] }, {}, { action: 'filter' })}>筛选已盘1</button></>}
  </div>,
}));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, DetailItem: ({ children }) => <span>{children}</span> }));
jest.mock('./InventoryProgressAssetsModal', () => ({ title, assets }) => <div role="dialog">{title}|{assets.map((asset) => asset.assetTag).join(',')}</div>);
const plans = [{ planNo: 'P1', range: '公共', executor: '李磊', supervisor: '韩晓晗', financialSupervisor: '徐博', auditSupervisor: '-' }];
const assets = [
  { assetTag: '3102200966', inventoryStatus: '已盘', organization: '集团', city: '北京市', quantity: 1 },
  { assetTag: '114121801802', inventoryStatus: '审核中', organization: '集团', city: '上海市', quantity: 1 },
];
const setup = (projectType) => render(<AssetInventoryProgressV2 project={{ projectNo: 'CP-test', projectType }} plans={plans} assetsForPlan={() => assets} onBack={() => {}} />);

test('角色列按项目类型展示，详情分页筛选导出只取匹配记录且重置恢复', () => {
  setup('复盘');
  fireEvent.click(screen.getAllByText('查看详情')[1]);
  expect(screen.getByText('财务监督人')).toBeInTheDocument();
  expect(screen.getByText('内审监督人')).toBeInTheDocument();
  expect(screen.queryByText('计划监督人')).not.toBeInTheDocument();
  expect(screen.getByText('共 2 条')).toBeInTheDocument();
  fireEvent.click(screen.getByText('筛选已盘1'));
  expect(screen.getByText('共 1 条')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导出'));
  const workbook = XLSX.writeFile.mock.calls.at(-1)[0];
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['公共进度详情'])).toEqual([expect.objectContaining({ City: '北京市', 已盘数量: 1 })]);
  fireEvent.click(screen.getByText('重置筛选'));
  expect(screen.getByText('共 2 条')).toBeInTheDocument();
});

test('初盘不展示复盘角色，未盘清单含审核中且排除已盘', () => {
  setup('初盘');
  fireEvent.click(screen.getByText('查看未盘资产'));
  expect(screen.getByRole('dialog')).toHaveTextContent('114121801802');
  expect(screen.getByRole('dialog')).not.toHaveTextContent('3102200966');
  fireEvent.click(screen.getAllByText('查看详情')[1]);
  expect(screen.getByText('计划监督人')).toBeInTheDocument();
  expect(screen.queryByText('财务监督人')).not.toBeInTheDocument();
});
