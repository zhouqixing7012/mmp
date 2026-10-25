import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryMandatoryImport from './InventoryMandatoryImport';
import { INVENTORY_MANDATORY_IMPORT_HEADERS as header } from './inventoryMandatoryImport';
import { serializeInventoryScopeExport } from './inventoryAssetExport';

const mockWarning = jest.fn();
const mockSuccess = jest.fn();
jest.mock('antd', () => ({ Space: ({ children }) => <div>{children}</div>, Button: ({ children, onClick, disabled, loading }) => <button disabled={disabled || loading} onClick={onClick}>{children}</button>, message: { useMessage: () => [{ warning: mockWarning, success: mockSuccess }, null] } }));
jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
const assets = [{ key: 'a', assetTag: '001', isMandatory: true }, { key: 'b', assetTag: '002', isMandatory: false }];
const project = { projectNo: 'R1', projectType: '复盘', initialProjectNo: 'I1', status: '暂存' };
function fileFor(inputRows) {
  const matrix = [header, ...inputRows.slice(1).map(([tag, flag]) => header.map((name) => name === '资产标签号' ? tag : name === '是否必盘' ? flag : ''))];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(matrix), '必盘标记');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return { name: '必盘标记.xlsx', arrayBuffer: async () => buffer };
}
beforeEach(() => jest.clearAllMocks());

test('下载真实工作簿模板，导入实际工作簿后仅提交已校验标记', async () => {
  const onImport = jest.fn();
  render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.click(screen.getByRole('button', { name: '清单模板' }));
  const [workbook, name] = XLSX.writeFile.mock.calls[0];
  expect(name).toBe('R1-盘点范围资产清单模板.xlsx');
  const template = XLSX.utils.sheet_to_json(workbook.Sheets['盘点范围资产清单'], { header: 1 });
  expect(template[0]).toEqual(header);
  expect(template[0]).toHaveLength(2);
  expect(template[1][header.indexOf('资产标签号')]).toBe('001');
  expect(template[1][header.indexOf('是否必盘')]).toBe('是');
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [fileFor([['资产标签号', '是否必盘'], ['001', '否'], ['002', '是']])] } });
  await waitFor(() => expect(onImport).toHaveBeenCalledWith([{ key: 'a', assetTag: '001', isMandatory: false }, { key: 'b', assetTag: '002', isMandatory: true }]));
  expect(mockSuccess).toHaveBeenCalledWith('已按文件替换盘点范围，共 2 条资产');
});

test('有效首行后存在范围外资产时不回填部分标记', async () => {
  const onImport = jest.fn();
  render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [fileFor([['资产标签号', '是否必盘'], ['001', '否'], ['999', '是']])] } });
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('不在当前项目关联初盘的可选执行资产中')));
  expect(onImport).not.toHaveBeenCalled();
  expect(mockSuccess).not.toHaveBeenCalled();
});

test('当前导出CSV文件可直接回导，保留前导零标签并匹配可选初盘执行源', async () => {
  const onImport = jest.fn();
  const candidateAssets = [...assets, { key: 'c', assetTag: '003', isMandatory: true }];
  render(<InventoryMandatoryImport assets={assets} candidateAssets={candidateAssets} project={project} onImport={onImport} />);
  const { csv } = serializeInventoryScopeExport([candidateAssets[2]], { project: { ...project, projectType: '复盘' } });
  const bytes = Uint8Array.from(Buffer.from('\ufeff' + csv, 'utf8'));
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [{ name: '导出清单.csv', arrayBuffer: async () => bytes.buffer }] } });
  await waitFor(() => expect(onImport).toHaveBeenCalledWith([{ key: 'c', assetTag: '003', isMandatory: true }]));
});

test('读取文件期间切换关联初盘，阻止旧文件写入新范围', async () => {
  let completeRead;
  const onImport = jest.fn();
  const file = fileFor([['资产标签号', '是否必盘'], ['001', '否']]);
  const buffer = await file.arrayBuffer();
  file.arrayBuffer = () => new Promise((resolve) => { completeRead = resolve; });
  const view = render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [file] } });
  view.rerender(<InventoryMandatoryImport assets={assets} project={{ ...project, initialProjectNo: 'I2' }} onImport={onImport} />);
  await act(async () => completeRead(buffer));
  expect(mockWarning).toHaveBeenCalledWith('盘点范围或项目状态已变化，请重新核对后导入');
  expect(onImport).not.toHaveBeenCalled();
});

test('整批拒绝后可下载实际错误明细工作簿', async () => {
  const onImport = jest.fn();
  render(<InventoryMandatoryImport assets={assets} project={project} onImport={onImport} />);
  fireEvent.change(screen.getByLabelText('导入盘点清单文件'), { target: { files: [fileFor([header, ['999', '是'], ['998', '否']])] } });
  const download = await screen.findByRole('button', { name: '下载错误明细' });
  fireEvent.click(download);
  const workbook = XLSX.writeFile.mock.calls[0][0];
  const errors = XLSX.utils.sheet_to_json(workbook.Sheets['错误明细']);
  expect(errors.map(error => error['资产标签号'])).toEqual(['999', '998']);
  expect(errors.map(error => error['行号'])).toEqual([2, 3]);
  expect(onImport).not.toHaveBeenCalled();
});
