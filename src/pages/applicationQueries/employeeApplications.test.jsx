jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import * as XLSX from 'xlsx';
import { queryApplications, buildApplicationWorkbook } from '../../services/applicationQueryService';
import { fireEvent, render, screen } from '@testing-library/react';
import EmployeeApplicationDetail from './EmployeeApplicationDetail';
import { employeeApplicationRows } from '../../mock/applicationEmployeeMock';
import { employeeApplicationDefinitions } from './employeeApplicationDefinitions';
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
test('无执行单的转移申请保留双方和全部资产', () => {
  const record = employeeApplicationRows.find(row => row.kind === 'transfer' && row.values.status === '处理中');
  expect(record.values.transferNo).toBe('');
  render(<EmployeeApplicationDetail definition={employeeApplicationDefinitions[0]} record={record} onBack={jest.fn()} onProgress={jest.fn()} />);
  expect(screen.getByText('转出人信息')).toBeInTheDocument(); expect(screen.getByText('接收人信息')).toBeInTheDocument();
  record.lines.forEach(line => expect(screen.getByText(line.tag)).toBeInTheDocument());
  expect(screen.queryByRole('button', { name: '执行转移' })).not.toBeInTheDocument();
});
test('更换分别展示退回待发放鉴定和进度，不出现办理按钮', () => {
  const record = employeeApplicationRows.find(row => row.kind === 'replacement' && row.values.status === '已完成');
  const onProgress = jest.fn();
  render(<EmployeeApplicationDetail definition={employeeApplicationDefinitions[1]} record={record} onBack={jest.fn()} onProgress={onProgress} />);
  expect(screen.getByText('退回物资信息')).toBeInTheDocument(); expect(screen.getByText('待发放物资信息')).toBeInTheDocument();
  expect(screen.getByText(record.identification.explanation)).toBeInTheDocument();
  record.lines.concat(record.pendingLines).forEach(line => expect(screen.getByText(line.tag)).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: '查看进度' })); expect(onProgress).toHaveBeenCalledWith(record);
  expect(screen.queryByRole('button', { name: '添加' })).not.toBeInTheDocument();
});
test('部件入口只读取对应资产部件', () => {
  const record = employeeApplicationRows.find(row => row.kind === 'replacement');
  render(<EmployeeApplicationDetail definition={employeeApplicationDefinitions[1]} record={record} onBack={jest.fn()} onProgress={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: '1' }));
  expect(screen.getByRole('dialog', { name: '部件明细' })).toBeInTheDocument();
  expect(screen.getByText(record.lines[0].accessories[0].tag)).toBeInTheDocument();
});
test('导出逐条明细部件审批且空待发放不补行', () => {
  employeeApplicationDefinitions.forEach(definition => {
    const rows = employeeApplicationRows.filter(row => row.kind === definition.id);
    expect(definition.exportSheets.find(sheet => sheet.name === '申请单头').records(rows)).toHaveLength(rows.length);
    const detail = definition.exportSheets.find(sheet => ['转移资产', '退回物资'].includes(sheet.name));
    expect(detail.records(rows)).toHaveLength(rows.reduce((sum, row) => sum + row.lines.length, 0));
    expect(definition.exportSheets.find(sheet => sheet.name === '审批记录').records(rows)).toHaveLength(rows.reduce((sum, row) => sum + row.history.length, 0));
  });
  expect(employeeApplicationDefinitions[1].exportSheets.find(sheet => sheet.name === '待发放物资').records(employeeApplicationRows.filter(row => row.kind === 'replacement' && row.values.status === '处理中'))).toHaveLength(0);
});

test('申请菜单查询覆盖未生成执行单状态并按申请时间排序', () => {
  const rows = queryApplications('transfer');
  expect(rows).toHaveLength(3);
  expect(rows.map(row => row.values.status)).toEqual(['已驳回', '已完成', '处理中']);
  expect(queryApplications('transfer', { status: '处理中' })[0].values.transferNo).toBe('');
  expect(queryApplications('transfer', { sender: '114111', receiver: '213852' })).toHaveLength(3);
  expect(queryApplications('transfer', { sender: '213852' })).toHaveLength(0);
});
test('集成导出尊重条件和权限，不把未生成执行单申请漏掉', () => {
  const book = buildApplicationWorkbook('transfer', { status: '处理中' });
  expect(book.SheetNames).toEqual(['申请单头', '转移资产', '部件明细', '审批记录']);
  expect(XLSX.utils.sheet_to_json(book.Sheets['申请单头'])).toHaveLength(1);
  expect(XLSX.utils.sheet_to_json(book.Sheets['转移资产'])).toHaveLength(2);
  const access = { userId: 'auditor', canView: true, grants: { people: [], departments: [], companies: [] }, ledgers: ['资产台账'], administratorIds: [] };
  expect(queryApplications('replacement', {}, null, access)).toHaveLength(0);
  expect(XLSX.utils.sheet_to_json(buildApplicationWorkbook('replacement', {}, null, null, access).Sheets['申请单头'])).toHaveLength(0);
});

test('子公司筛选与财务公司字段分别使用明确演示归属', () => {
  const transfer = employeeApplicationRows.find(row => row.kind === 'transfer');
  expect(transfer.filters.sourceSubsidiary).toBe('集团');
  expect(transfer.values.sourceCompany).not.toBe('集团');
  expect(queryApplications('transfer', { sourceSubsidiary: '集团' })).toHaveLength(3);
  expect(queryApplications('replacement', { subsidiary: '集团' })).toHaveLength(3);
  expect(queryApplications('replacement', { subsidiary: transfer.values.company })).toHaveLength(0);
});
