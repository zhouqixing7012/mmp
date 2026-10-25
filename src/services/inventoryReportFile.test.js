import * as XLSX from 'xlsx-js-style';
import { unzipSync, strFromU8 } from 'fflate';
import { serializeInventoryReportFile } from './inventoryReportFile';
import { buildInventoryReportWorkbook, getInventoryReport } from './inventoryReportService';

test.each([2025, 2026])('%s实际导出四张表隐藏网格线并保留边框、格式、合并、链接', year => {
  const workbook = buildInventoryReportWorkbook(getInventoryReport(year));
  const bytes = serializeInventoryReportFile(workbook);
  const files = unzipSync(bytes);
  workbook.SheetNames.forEach((_, index) => {
    const xml = new DOMParser().parseFromString(strFromU8(files[`xl/worksheets/sheet${index + 1}.xml`]), 'application/xml');
    expect(xml.querySelector('parsererror')).toBeNull();
    expect(xml.getElementsByTagName('sheetView')[0].getAttribute('showGridLines')).toBe('0');
  });
  const saved = XLSX.read(bytes, { type: 'array', cellNF: true });
  expect(saved.SheetNames).toEqual(workbook.SheetNames);
  workbook.SheetNames.forEach(name => {
    expect(XLSX.utils.sheet_to_json(saved.Sheets[name], { header: 1, defval: null })).toEqual(XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: null }));
  });
  expect(saved.Sheets['盘点结果比较分析'].B12.l.Target).toBe("#'盘亏资产明细及原因'!A4");
  expect(saved.Sheets['盘点结果比较分析']['!merges']).toEqual(workbook.Sheets['盘点结果比较分析']['!merges']);
  expect(saved.Sheets['盘点结果比较分析'].J19.w).toBe('0.008%');
  expect(strFromU8(files['xl/styles.xml'])).toContain('style="thin"');
  expect(saved.Sheets['盘亏分布'].C2.w).toBe('');
});
