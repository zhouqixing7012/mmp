import { utils } from 'xlsx-js-style';

// 仅设置导出外观，保留单元格原值、数字格式、链接和已有业务合并。
export function styleInventoryReportWorkbook(workbook, { historyLength, categoryStart, categoryCount, incrementStart, increments, indicatorStart, detailRows, detailsAreDemo, companyRows }) {
  const palette = { text: '1D2126', blue: '145CFF', border: 'D3D9E5', header: 'EAF1FF', subtotal: 'F2F5FA', total: 'DBE7FF' };
  const border = Object.fromEntries(['top', 'bottom', 'left', 'right'].map(side => [side, { style: 'thin', color: { rgb: palette.border } }]));
  const cellAt = (sheet, row, col) => {
    const address = utils.encode_cell({ r: row, c: col });
    if (!sheet[address]) sheet[address] = { t: 's', v: '' };
    return sheet[address];
  };
  const paint = (sheet, row, columns, options = {}) => {
    for (let col = 0; col < columns; col += 1) {
      const cell = cellAt(sheet, row, col);
      cell.s = {
        font: { name: '微软雅黑', sz: options.size || 11, color: { rgb: options.color || palette.text }, bold: Boolean(options.bold) },
        alignment: { vertical: 'center', horizontal: options.center ? 'center' : cell.t === 'n' ? 'right' : 'left', wrapText: true },
        ...(options.borders ? { border } : {}),
        ...(options.fill ? { fill: { patternType: 'solid', fgColor: { rgb: options.fill } } } : {}),
      };
      if (cell.l) cell.s.font = { ...cell.s.font, color: { rgb: palette.blue }, underline: true };
    }
    sheet['!rows'] = sheet['!rows'] || [];
    sheet['!rows'][row] = { hpt: options.height || 28 };
  };
  const merge = (sheet, row, start, end) => {
    sheet['!merges'] = [...(sheet['!merges'] || []), { s: { r: row, c: start }, e: { r: row, c: end } }];
  };
  const heading = (sheet, row, columns, main = false) => {
    paint(sheet, row, columns, { bold: true, size: main ? 16 : 12, color: palette.blue, fill: main ? palette.header : palette.subtotal, height: main ? 38 : 32 });
    merge(sheet, row, 0, columns - 1);
  };
  const table = (sheet, start, count, columns) => {
    paint(sheet, start, columns, { bold: true, center: true, fill: palette.header, borders: true, height: 42 });
    for (let row = start + 1; row <= start + count; row += 1) paint(sheet, row, columns, { borders: true });
  };
  const widths = (sheet, values) => { sheet['!cols'] = values.map(wch => ({ wch })); };
  const analysis = workbook.Sheets['盘点结果比较分析'];
  widths(analysis, [26, 24, 24, 24, 22, 24, 22, 22, 22, 22]);
  heading(analysis, 0, 10, true);
  heading(analysis, 1, 10);
  [2, 3].forEach(row => {
    paint(analysis, row, 10, { height: row === 3 ? 44 : 28 });
    cellAt(analysis, row, 0).s.font.bold = true;
    merge(analysis, row, 1, 9);
  });
  table(analysis, 4, 3, 7);
  heading(analysis, 9, 10);
  table(analysis, 10, historyLength, 10);
  heading(analysis, categoryStart - 2, 10);
  table(analysis, categoryStart - 1, categoryCount, 6);
  heading(analysis, incrementStart - 2, 10);
  table(analysis, incrementStart - 1, increments.length, 3);
  increments.forEach((row, index) => {
    if (['小计', '合计'].includes(row.name)) paint(analysis, incrementStart + index, 3, { bold: true, fill: row.name === '合计' ? palette.total : palette.subtotal, borders: true, height: 30 });
  });
  heading(analysis, indicatorStart - 2, 10);
  table(analysis, indicatorStart - 1, 3, 5);

  const details = workbook.Sheets['盘亏资产明细及原因'];
  widths(details, [9, 12, 24, 26, 32, 10, 19, 21, 14, 19, 19, 23, 16, 14, 16, 24, 24, 32]);
  heading(details, 0, 18, true);
  if (detailsAreDemo) {
    paint(details, 1, 18, { color: '545B66', height: 24 });
    merge(details, 1, 0, 17);
  }
  table(details, 2, detailRows.length, 18);
  detailRows.forEach((row, index) => {
    if (row.summary) paint(details, index + 3, 18, { bold: true, fill: row.label === '总计' ? palette.total : palette.subtotal, borders: true, height: 30 });
  });

  const distribution = workbook.Sheets['资产类型分布'];
  widths(distribution, [30, 16, 24, 18]);
  table(distribution, 0, utils.decode_range(distribution['!ref']).e.r, 4);
  const company = workbook.Sheets['盘亏分布'];
  widths(company, [28, 12, 13, 13, 13, 15, 15, 25, 13, 16, 22]);
  table(company, 0, companyRows.length, 11);
  companyRows.forEach((row, index) => {
    if (row.company === '合计') paint(company, index + 1, 11, { bold: true, fill: palette.total, borders: true, height: 30 });
  });
}
