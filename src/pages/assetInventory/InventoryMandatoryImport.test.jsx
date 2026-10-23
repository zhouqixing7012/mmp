import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryMandatoryImport from './InventoryMandatoryImport';

const mockWarning = jest.fn();
const mockSuccess = jest.fn();
jest.mock('antd', () => ({ Space: ({ children }) => <div>{children}</div>, Button: ({ children, onClick, disabled, loading }) => <button disabled={disabled || loading} onClick={onClick}>{children}</button>, message: { useMessage: () => [{ warning: mockWarning, success: mockSuccess }, null] } }));
jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
const assets = [{ key: 'a', assetTag: '001', isMandatory: true }, { key: 'b', assetTag: '002', isMandatory: false }];
const project = { projectNo: 'R1', projectType: '复盘', initialProjectNo: 'I1', status: '暂存' };
function fileFor(matrix) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(matrix), '必盘标记');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return { name: '必盘标记.xlsx', arrayBuffer: async () => buffer };
}
beforeEach(() => jest.clearAllMocks());

test('下载真实工作簿模板，导入实际工作簿后仅提交已校验标记', async () => {
  const onImport = jest.fn();
  render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.click(screen.getByRole('button', { name: '必盘标记模板' }));
  const [workbook, name] = XLSX.writeFile.mock.calls[0];
  expect(name).toBe('R1-必盘标记模板.xlsx');
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['必盘标记'], { header: 1 })).toEqual([['资产标签号', '是否必盘'], ['001', '是'], ['002', '否']]);
  fireEvent.change(screen.getByLabelText('导入必盘标记文件'), { target: { files: [fileFor([['资产标签号', '是否必盘'], ['001', '否'], ['002', '是']])] } });
  await waitFor(() => expect(onImport).toHaveBeenCalledWith([{ key: 'a', assetTag: '001', isMandatory: false }, { key: 'b', assetTag: '002', isMandatory: true }]));
  expect(mockSuccess).toHaveBeenCalledWith('已更新 2 条资产的必盘标记');
});

test('有效首行后存在范围外资产时不回填部分标记', async () => {
  const onImport = jest.fn();
  render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入必盘标记文件'), { target: { files: [fileFor([['资产标签号', '是否必盘'], ['001', '否'], ['999', '是']])] } });
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('不在当前盘点范围中')));
  expect(onImport).not.toHaveBeenCalled();
  expect(mockSuccess).not.toHaveBeenCalled();
});

test('读取文件期间切换关联初盘，阻止旧文件写入新范围', async () => {
  let completeRead;
  const onImport = jest.fn();
  const file = fileFor([['资产标签号', '是否必盘'], ['001', '否']]);
  const buffer = await file.arrayBuffer();
  file.arrayBuffer = () => new Promise((resolve) => { completeRead = resolve; });
  const view = render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入必盘标记文件'), { target: { files: [file] } });
  view.rerender(<InventoryMandatoryImport assets={assets} project={{ ...project, initialProjectNo: 'I2' }} onImport={onImport} />);
  await act(async () => completeRead(buffer));
  expect(mockWarning).toHaveBeenCalledWith('盘点范围或项目状态已变化，请重新核对后导入');
  expect(onImport).not.toHaveBeenCalled();
});
