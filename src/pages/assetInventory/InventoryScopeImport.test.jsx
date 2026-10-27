import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryScopeImport from './InventoryScopeImport';
const mockWarning = jest.fn();
jest.mock('antd', () => ({ Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>, Space: ({ children }) => <div>{children}</div>, message: { useMessage: () => [{ warning: mockWarning, success: jest.fn() }, null] } }));
const ledger = [{ key: 'a', assetTag: '001', description: '台账说明' }, { key: 'b', assetTag: '002' }];
function file(sheets) {
  const book = XLSX.utils.book_new();
  sheets.forEach((rows, index) => XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), `S${index}`));
  return { name: '范围.xlsx', arrayBuffer: async () => XLSX.write(book, { type: 'array', bookType: 'xlsx' }) };
}
beforeEach(() => mockWarning.mockClear());
test('有效Excel先清空全项目缓存再重建，所有Sheet去重并仅读首列', async () => {
  const order = [];
  const onImport = jest.fn(value => order.push(value));
  render(<InventoryScopeImport project={{ projectNo: 'P' }} ledgerAssets={ledger} allowedAssets={ledger} onClear={() => order.push('clear')} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入范围Excel文件'), { target: { files: [file([[['任意表头'], ['001', '伪造说明']], [['另一个表头'], ['001'], ['002']]])] } });
  await waitFor(() => expect(onImport).toHaveBeenCalledWith(ledger));
  expect(order).toEqual(['clear', ledger]);
});
test('未知标签是在清空后报错，不恢复旧缓存也不保存已匹配项', async () => {
  let cache = ['old'];
  const onImport = jest.fn();
  render(<InventoryScopeImport project={{ projectNo: 'P' }} ledgerAssets={ledger} allowedAssets={ledger} onClear={() => { cache = []; }} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入范围Excel文件'), { target: { files: [file([[['表头'], ['001'], ['UNKNOWN']]])] } });
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('原范围已清空')));
  expect(cache).toEqual([]); expect(onImport).not.toHaveBeenCalled();
});
test('非Excel或不可读Excel不会先清空缓存', async () => {
  const onClear = jest.fn();
  render(<InventoryScopeImport project={{ projectNo: 'P' }} ledgerAssets={ledger} allowedAssets={ledger} onClear={onClear} onImport={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('导入范围Excel文件'), { target: { files: [{ name: '范围.csv', arrayBuffer: async () => new ArrayBuffer(0) }] } });
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Excel')));
  expect(onClear).not.toHaveBeenCalled();
});
