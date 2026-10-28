import * as XLSX from 'xlsx-js-style';
import { buildFinanceInventoryReport, financeAssetClassification } from './inventoryFinanceReportModel';
import { buildFinanceInventoryWorkbook, formatFinanceTemplateValue } from './inventoryFinanceReportService';

const assets = [
  { assetTag: 'A', category: 'PC', subCategory: '主机-技术', quantity: 2, ebsOriginalValue: 100, originalValue: 9999, netValue: 1, inventoryStatus: '已盘' },
  { assetTag: 'B', category: 'PC', subCategory: '主机-标准', quantity: 3, ebsOriginalValue: 200, inventoryStatus: '代盘' },
  { assetTag: 'C', category: 'OFFICE EQUIPMENT', subCategory: '移动数码-手机', quantity: 2, ebsOriginalValue: 30, inventoryStatus: '未盘' },
  { assetTag: 'D', category: 'OFFICE EQUIPMENT', subCategory: '移动数码-平板', quantity: 1, ebsOriginalValue: 50, inventoryStatus: '报失' },
  { assetTag: 'E', category: 'SERVER', subCategory: '主机-机架式', quantity: 3, ebsOriginalValue: 70, inventoryStatus: '未盘' },
  { assetTag: 'F', category: 'PC', subCategory: '手写板-其他', quantity: 10, ebsOriginalValue: 999, inventoryStatus: '已盘' },
];

test('按大类和小类A合并，Mobile只计手机，金额取EBS且跳过手写板及刻录机', () => {
  const report = buildFinanceInventoryReport({ assets });
  const summary = report.sheets[0];
  expect(summary.rows.find(row => row[0] === 'PC').slice(2, 14)).toEqual([300, 300, 5, 5, 300, 300, 5, 5, 0, 0, 0, 0]);
  const mobile = summary.rows.find(row => row[1] === 'Mobile');
  expect([mobile[2], mobile[4]]).toEqual([30, 2]);
  const tablet = summary.rows.find(row => row[1] === '移动数码');
  expect(tablet[2]).toBe(50);
  const server = summary.rows.findIndex(row => row[0] === 'Server');
  expect(summary.rows.slice(server, summary.totalRow).find(row => row[1] === '主机')[2]).toBe(70);
  expect(summary.rows[summary.totalRow][3]).toBe(450);
  expect(summary.rows[summary.totalRow][5]).toBe(11);
  expect(financeAssetClassification({ category: 'PC', subCategory: '刻录机-外置' })).toBeNull();
});

test('页面数量零为0，金额使用会计格式；缺EBS原值不以原值替代', () => {
  expect(formatFinanceTemplateValue(0, 4, true)).toBe('0');
  expect(formatFinanceTemplateValue(0, 2, true)).toBe('-');
  expect(formatFinanceTemplateValue(-12.3, 2, true)).toBe('(12.30)');
  expect(() => buildFinanceInventoryReport({ assets: [{ ...assets[0], ebsOriginalValue: undefined }] })).toThrow('缺少EBS原值');
});

test('生成当前报告三张表，保留真实分类金额、四条说明及Excel零值格式', () => {
  const report = buildFinanceInventoryReport({ assets, company: '测试公司', inventoryDate: '2026年10月28日', stockDate: '2026年6月30日' });
  const workbook = buildFinanceInventoryWorkbook(report);
  expect(workbook.SheetNames).toEqual(['盘点报告汇总', '盘亏资产明细', '待盘资产明细']);
  const sheet = workbook.Sheets['盘点报告汇总'];
  expect(sheet.C6.v).toBe(300);
  expect(sheet.C6.z).toContain('"-"');
  expect(sheet.E6.z).toBe('#,##0;-#,##0;0');
  expect(report.notes).toEqual(['1、以上数据是测试公司的资产盘点信息；', '2、以上数据是截止到2026年10月28日的盘查结果；', '3、盘点资产，为截止到2026年6月30日的入库资产。', '4、盘点表公式关系：C=A-B']);
  const readBack = XLSX.read(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }), { type: 'array' });
  expect(XLSX.utils.sheet_to_json(readBack.Sheets['盘亏资产明细'], { header: 1 })[2][6]).toBe(50);
});
