import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryScanResultImport from './InventoryScanResultImport';
import { getMobileInventoryResults } from './inventoryMobileResultStore';
jest.mock('antd', () => {
  const React = require('react');
  return {
    Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>,
    Modal: ({ open, children, footer }) => open ? <div role="dialog">{children}{footer}</div> : null,
    Space: ({ children }) => <div>{children}</div>, Typography: { Text: ({ children }) => <span>{children}</span> },
    Alert: ({ title }) => <div>{title}</div>, Table: () => null,
  };
});
const props = { project: { projectNo: 'P', status: '盘点中', creator: '213852-孙志强' }, plan: { planNo: 'PLAN', status: '盘点中' }, operator: '213852-孙志强', assets: [{ assetTag: '001', planNo: 'PLAN', inventoryRange: '员工' }] };
function file() {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['资产标签号', '盘点备注'], ['001', '备注']]), 'Sheet1');
  const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  return { name: '扫描结果.xlsx', arrayBuffer: async () => bytes };
}
beforeEach(() => localStorage.clear());
test('从真实导入弹窗选择Excel成功写入后通知关联资产刷新', async () => {
  const onImported = jest.fn();
  render(<InventoryScanResultImport {...props} onImported={onImported} />);
  fireEvent.click(screen.getByRole('button', { name: '导入盘点结果' }));
  fireEvent.change(screen.getByLabelText('扫描结果Excel文件'), { target: { files: [file()] } });
  await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1));
  expect(getMobileInventoryResults('P')['001']).toMatchObject({ status: '已盘', inventoryRemark: '备注' });
  expect(screen.getByText('已导入 1 条扫描结果')).toBeInTheDocument();
});
test('文件读取期间计划关闭，重新校验最新状态并阻止写入', async () => {
  let complete;
  const upload = file(); const bytes = await upload.arrayBuffer();
  upload.arrayBuffer = () => new Promise(resolve => { complete = resolve; });
  const onImported = jest.fn();
  const view = render(<InventoryScanResultImport {...props} onImported={onImported} />);
  fireEvent.click(screen.getByRole('button', { name: '导入盘点结果' }));
  fireEvent.change(screen.getByLabelText('扫描结果Excel文件'), { target: { files: [upload] } });
  view.rerender(<InventoryScanResultImport {...props} plan={{ ...props.plan, status: '关闭' }} onImported={onImported} />);
  await act(async () => complete(bytes));
  expect(onImported).not.toHaveBeenCalled();
  expect(getMobileInventoryResults('P')).toEqual({});
  expect(screen.getByText('扫描结果导入失败，本批次未保存')).toBeInTheDocument();
});
test('保存后刷新回调失败仍如实提示已保存，不声称整批未保存', async () => {
  render(<InventoryScanResultImport {...props} onImported={() => { throw new Error('刷新失败'); }} />);
  fireEvent.click(screen.getByRole('button', { name: '导入盘点结果' }));
  fireEvent.change(screen.getByLabelText('扫描结果Excel文件'), { target: { files: [file()] } });
  await screen.findByText('结果已保存，页面刷新失败，请重新进入本清单查看');
  expect(getMobileInventoryResults('P')['001'].status).toBe('已盘');
  expect(screen.queryByText('扫描结果导入失败，本批次未保存')).not.toBeInTheDocument();
});
