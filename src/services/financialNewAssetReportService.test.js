import * as XLSX from 'xlsx-js-style';
import { getFinancialAssetCompanyOptions, financialAssetFields, financialAssetExportFields, financialAssetCompanies, queryFinancialNewAssets, totalFinancialNewAssets, buildFinancialNewAssetWorkbook } from './financialNewAssetReportService';

test('列表15列（公司/板块在附件13列之前）、两条真实明细和13个映射Sheet原样保留', () => {
  expect(financialAssetFields).toEqual(['公司', '板块', 'PO单号', '资产大类', '资产说明', '配置', '数量', '原值', '税金', '含税金额', '启用日期', '使用说明', 'PR单号', '资产标签号', '服务']);
  expect(financialAssetCompanies).toHaveLength(13);
  const rows = queryFinancialNewAssets();
  expect(rows).toHaveLength(2);
  expect(rows[0].values).toMatchObject({ 公司: '114.新媒体', 板块: null, PO单号: '自购', 资产标签号: '114122602627', 服务: null });
  expect(totalFinancialNewAssets(rows)).toEqual({ 数量: 2, 原值: 19070.8, 税金: 2479.2, 含税金额: 21550 });
});
test('公司和日期组合、边界及无结果匹配，非法条件及时报错', () => {
  expect(queryFinancialNewAssets({ companies: ['Media'], dates: ['2026-07-23', '2026-07-23'] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ dates: [null, '2026-07-23'] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ dates: ['2026-07-24', null] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ companies: ['Media'], dates: ['2026-07-24', null] })).toHaveLength(0);
  expect(queryFinancialNewAssets({ companies: ['Internet'] })).toHaveLength(0);
  expect(queryFinancialNewAssets({ plates: ['17'] })).toHaveLength(0);
  expect(() => queryFinancialNewAssets({ plates: '17' })).toThrow('板块条件无效');
  expect(() => queryFinancialNewAssets({ dates: ['2026-08-01', '2026-07-01'] })).toThrow('开始日期不能晚于结束日期');
  expect(() => queryFinancialNewAssets({ dates: ['2026-02-31'] })).toThrow('启用日期无效');
  expect(() => queryFinancialNewAssets({ companies: ['未知公司'] })).toThrow('公司不存在');
});
test('导出一个Excel按公司分Sheet，数据和合计不重复，空公司保留表头及0合计', () => {
  const book = XLSX.read(XLSX.write(buildFinancialNewAssetWorkbook(), { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
  expect(book.SheetNames).toEqual(financialAssetCompanies);
  const media = XLSX.utils.sheet_to_json(book.Sheets.Media, { header: 1 });
  expect(media[0]).toEqual(financialAssetExportFields);
  expect(media[0]).toHaveLength(13);
  expect(media[0]).not.toContain('公司');
  expect(media[0]).not.toContain('板块');
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


test('公司选项与资产明细报表同源，真实映射支持系统公司和板块筛选', () => {
  const { getReportOptions } = require('./assetReportOptions');
  const definitions = require('../pages/assetReports/reportDefinitions.json');
  const definition = definitions.find(item => item.id === 'report-1-1');
  expect(getFinancialAssetCompanyOptions()).toEqual(getReportOptions(definition, definition.filters.find(field => field.label === '公司')));
  const configured = require('../data/financialReportCompanyMapping.json');
  configured.forEach(mapping => expect(getFinancialAssetCompanyOptions().some(option => option.value === mapping.company.split('.')[0])).toBe(true));
  expect(queryFinancialNewAssets({ companies: ['114'] })).toHaveLength(1);
  expect(queryFinancialNewAssets({ companies: ['112'], plates: ['16.视频'] })[0].values).toMatchObject({ 公司: '112.北京新动力', 板块: '16.视频' });
  expect(queryFinancialNewAssets({ companies: ['114'], plates: ['17.Corporate'] })).toHaveLength(0);
  expect(buildFinancialNewAssetWorkbook({ companies: ['112'] }).SheetNames).toEqual(['Momentum', 'Momentum ENTMT']);
  expect(buildFinancialNewAssetWorkbook({ companies: ['112'], plates: ['16.视频'] }).SheetNames).toEqual(['Momentum ENTMT']);
  expect(() => buildFinancialNewAssetWorkbook({ companies: ['112'], plates: ['53.家居'] })).toThrow('未配置报表Sheet');
  const unmapped = getFinancialAssetCompanyOptions().find(option => !['001','101','102','112','114','115','116','123','124','132','201'].includes(option.value));
  if (unmapped) expect(() => queryFinancialNewAssets({ companies: [unmapped.value] })).toThrow('尚未配置报表英文名');
});

test('真实账套43行保留原始标签空值和空格，财务映射独立于标签名', () => {
  const accounts = require('../mock/reference/accountBookContents.json');
  const mappings = require('../data/financialReportCompanyMapping.json');
  expect(accounts).toHaveLength(43);
  expect(accounts[13]).toMatchObject({ company: '焦点新干线', plate: '新房', cnName: '', enName: '' });
  expect(accounts[10].cnName).toBe('汽  车');
  expect(mappings.find(row => row.sheetName === 'Focus Interactive').plates).toEqual(['51.焦点 Corporate','52.房产','53.家居']);
  expect(mappings.find(row => row.sheetName === 'Media').plates).toEqual(['11.搜狐网-web','12.搜狐网-mobile','13.汽车','17.Corporate']);
  expect(buildFinancialNewAssetWorkbook().SheetNames).toContain('ENTMT GZ');
});
