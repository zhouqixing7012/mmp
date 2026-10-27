import * as XLSX from 'xlsx';
import { parseInventoryScopeWorkbook } from './inventoryScopeImport';
import { serializeInventoryScopeExport } from './inventoryAssetExport';
const ledger = [{ key: 'a', assetTag: '001', description: '台账说明', quantity: 10 }, { key: 'b', assetTag: '002', description: '另一个资产' }, { key: 'c', assetTag: '003' }];
const workbook = sheets => {
  const book = XLSX.utils.book_new();
  sheets.forEach((rows, index) => XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), `S${index + 1}`));
  return book;
};
test('全部Sheet跳表头，只读第一列，跨Sheet去重且信息从台账带出', () => {
  const result = parseInventoryScopeWorkbook(workbook([[['表头'], ['001', '伪造说明', 900], ['001']], [['表头'], ['002'], ['001']]]), ledger, ledger);
  expect(result).toEqual(ledger.slice(0, 2));
  expect(result[0].description).toBe('台账说明');
  expect(result[0].quantity).toBe(10);
});
test('全字段导出xlsx的首列可重建初抽范围，其他列不反写', () => {
  const exported = serializeInventoryScopeExport([ledger[0]]);
  exported.matrix[1][3] = '篡改说明';
  const bytes = XLSX.write(workbook([exported.matrix]), { type: 'array', bookType: 'xlsx' });
  expect(parseInventoryScopeWorkbook(XLSX.read(bytes, { type: 'array' }), ledger, ledger)).toEqual([ledger[0]]);
});
test('未知或项目范围外标签均明确报错，不静默忽略', () => {
  expect(() => parseInventoryScopeWorkbook(workbook([[['表头'], ['UNKNOWN'], ['003']]]), ledger, ledger.slice(0, 2))).toThrow('UNKNOWN');
  expect(() => parseInventoryScopeWorkbook(workbook([[['表头'], ['003']]]), ledger, ledger.slice(0, 2))).toThrow('允许的数据范围');
});
