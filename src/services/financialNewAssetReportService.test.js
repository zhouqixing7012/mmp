import * as XLSX from 'xlsx-js-style';
import { financialAssetFields, financialAssetCompanies, queryFinancialNewAssets, totalFinancialNewAssets, buildFinancialNewAssetWorkbook } from './financialNewAssetReportService';

test('附件13列、两条真实明细和12家公司Sheet原样保留', () => {
  expect(financialAssetFields).toEqual(['PO单号', '资产大类', '资产说明', '配置', '数量', '原值', '税金', '含税金额', '启用日期', '使用说明', 'PR单号', '资产标签号', '服务']);
  expect(financialAssetCompanies).toHaveLength(12);
  const rows = queryFinancialNewAssets();
  expect(rows).toHaveLength(2);
  expect(rows[0].values).toMatchObject({ PO单号: '自购', 资产标签号: '114122602627', 服务: null });
  expect(totalFinancialNewAssets(rows)).toEqual({ 数量: 2, 原值: 19070.8, 税金: 2479.2, 含税金额: 21550 });
});
test('公司和日期组合、边界及无结果匹配，非法条件及时报错', () => {
  expect(queryFinancialNewAssets({ companies: ['Media'], dates: ['2026-07-23', '2026-07-23'] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ dates: [null, '2026-07-23'] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ dates: ['2026-07-24', null] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ companies: ['Media'], dates: ['2026-07-24', null] })).toHaveLength(0);
  expect(queryFinancialNewAssets({ companies: ['Internet'] })).toHaveLength(0);
  expect(() => queryFinancialNewAssets({ dates: ['2026-08-01', '2026-07-01'] })).toThrow('开始日期不能晚于结束日期');
  expect(() => queryFinancialNewAssets({ dates: ['2026-02-31'] })).toThrow('启用日期无效');
  expect(() => queryFinancialNewAssets({ companies: ['未知公司'] })).toThrow('公司不存在');
});
test('导出一个Excel按公司分Sheet，数据和合计不重复，空公司保留表头及0合计', () => {
  const book = XLSX.read(XLSX.write(buildFinancialNewAssetWorkbook(), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
  expect(book.SheetNames).toEqual(financialAssetCompanies);
  const media = XLSX.utils.sheet_to_json(book.Sheets.Media, { header: 1 });
  expect(media[0]).toEqual(financialAssetFields);
  expect(media[1][11]).toBe('114122602627');
  expect(media[2][2]).toBe('Total');
  expect(media[2].slice(4, 8)).toEqual([1, 10486.73, 1363.27, 11850]);
  expect(book.Sheets.Media.F2.w).toBe('10,486.73');
  expect(book.Sheets.Media.M2.v).toBe('');
  expect(XLSX.utils.sheet_to_json(book.Sheets.Momentum, { header: 1 })[1].slice(4, 8)).toEqual([0, 0, 0, 0]);
  const selected = buildFinancialNewAssetWorkbook({ companies: ['Media'], dates: ['2026-07-24', null] });
  expect(selected.SheetNames).toEqual(['Media']);
  expect(XLSX.utils.sheet_to_json(selected.Sheets.Media, { header: 1 })).toHaveLength(2);
});
