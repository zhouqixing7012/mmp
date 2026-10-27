import * as XLSX from 'xlsx';
import { downloadInventoryPhotoReviewExport, inventoryPhotoReviewExportWorkbook, PHOTO_REVIEW_EXPORT_HEADERS } from './inventoryPhotoReviewExport';
jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
const make = (tag, status = '待审核') => ({ asset: { assetTag: tag, category: 'PC', subCategory: '主机', description: '办公电脑', ownerNo: '00123', owner: '张某', inventoryDate: '2026-10-28', inventoryStatus: '审核中' }, reviewStatus: status, photos: { overall: { src: 'https://private/photo' } } });
beforeEach(() => XLSX.writeFile.mockClear());
test('六列xlsx按规定顺序与文本标签导出，不包含图片或链接', () => {
  const book = inventoryPhotoReviewExportWorkbook([make('000001')]);
  const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  const parsed = XLSX.read(bytes, { type: 'array' });
  const matrix = XLSX.utils.sheet_to_json(parsed.Sheets['图片审核'], { header: 1 });
  expect(matrix[0]).toEqual(PHOTO_REVIEW_EXPORT_HEADERS);
  expect(matrix[1]).toEqual(['000001', 'PC/主机/办公电脑', '00123-张某', '2026-10-28', '审核中', '待审核']);
  expect(parsed.Sheets['图片审核'].A2.t).toBe('s');
  expect(JSON.stringify(matrix)).not.toContain('https://');
  expect(parsed.Sheets['图片审核'].A2.l).toBeUndefined();
});
test('责任人姓名通过唯一人员资料带出工号', () => {
  const row = make('A'); delete row.asset.ownerNo;
  const book = inventoryPhotoReviewExportWorkbook([row], [{ employeeName: '张某', employeeNo: '009' }]);
  expect(book.Sheets['图片审核'].C2.v).toBe('009-张某');
});
test('导出全部查询记录，空查询回退本项目全集', () => {
  const all = Array.from({ length: 12 }, (_, i) => make(String(i)));
  downloadInventoryPhotoReviewExport(all.slice(0, 8), all, 'P');
  let book = XLSX.writeFile.mock.calls.at(-1)[0];
  expect(XLSX.utils.sheet_to_json(book.Sheets['图片审核'], { header: 1 })).toHaveLength(9);
  downloadInventoryPhotoReviewExport([], all, 'P');
  book = XLSX.writeFile.mock.calls.at(-1)[0];
  expect(XLSX.utils.sheet_to_json(book.Sheets['图片审核'], { header: 1 })).toHaveLength(13);
  expect(XLSX.writeFile.mock.calls.at(-1)[1]).toBe('P-图片审核.xlsx');
});
