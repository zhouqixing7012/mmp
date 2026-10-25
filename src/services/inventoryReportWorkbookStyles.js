import { utils } from 'xlsx-js-style';
import { INVENTORY_REPORT_FORMATS as formats } from './inventoryReportFormats';

// 按用户Excel参考设置外观；数字仍保留为数值，业务合并和内部链接不变。
export function styleInventoryReportWorkbook(workbook, { summaryStart, historyStart, historyLength, categoryStart, categoryCount, incrementStart, increments, indicatorStart, detailRows, detailsAreDemo, companyRows }) {
  const colors = { black: '000000', white: 'FFFFFF', gray: 'D9D9D9', blue: 'B8CCE4', total: 'BFBFBF', red: 'FF0000' };
  const border = Object.fromEntries(['top', 'bottom', 'left', 'right'].map(side => [side, { style: 'thin', color: { rgb: colors.black } }]));
  const cellAt = (sheet, row, col) => {
    const address = utils.encode_cell({ r: row, c: col });
    if (!sheet[address]) sheet[address] = { t: 's', v: '' };
    return sheet[address];
  };
  const paint = (sheet, row, columns, options = {}) => {
    for (let col = 0; col < columns; col += 1) {
      const cell = cellAt(sheet, row, col);
      cell.s = {
        font: { name: '宋体', sz: options.size || 11, color: { rgb: options.color || colors.black }, bold: Boolean(options.bold) },
        alignment: { vertical: 'center', horizontal: options.center ? 'center' : cell.t === 'n' ? 'right' : 'left', wrapText: true },
        fill: { patternType: 'solid', fgColor: { rgb: options.fill || colors.white } },
        ...(options.borders ? { border } : {}),
      };
      if (cell.l) cell.s.font = { ...cell.s.font, color: { rgb: '0000FF' }, underline: true };
    }
    sheet['!rows'] = sheet['!rows'] || [];
    sheet['!rows'][row] = { hpt: options.height || 21 };
  };
  const merge = (sheet, row, start, end, endRow = row) => {
    sheet['!merges'] = [...(sheet['!merges'] || []), { s: { r: row, c: start }, e: { r: endRow, c: end } }];
  };
  const heading = (sheet, row, columns, main = false, bold = true) => {
    paint(sheet, row, columns, { bold, size: main ? 13 : 11, height: main ? 28 : 25 });
    merge(sheet, row, 0, columns - 1);
  };
  const table = (sheet, start, count, columns, headerRows = 1) => {
    for (let row = start; row < start + headerRows; row += 1) paint(sheet, row, columns, { bold: row === start, center: true, borders: true, height: 28 });
    for (let row = start + headerRows; row < start + headerRows + count; row += 1) paint(sheet, row, columns, { borders: true });
  };
  const widths = (sheet, values) => { sheet['!cols'] = values.map(wch => ({ wch })); };
  const format = (sheet, row, cols, code) => cols.forEach(col => {
    const cell = cellAt(sheet, row, col);
    if (cell.t === 'n') cell.z = code;
  });
  const analysis = workbook.Sheets['盘点结果比较分析'];
  widths(analysis, [16, 17, 23, 23, 23, 25, 23, 25, 23, 25]);
  heading(analysis, 0, 10, true);
  heading(analysis, 2, 10);
  [3, 4].forEach(row => {
    paint(analysis, row, 10, { height: row === 4 ? 32 : 21 });
    merge(analysis, row, 1, 9);
  });
  heading(analysis, 6, 10);
  heading(analysis, 7, 10, false, false);
  table(analysis, summaryStart - 2, 3, 7, 2);
  merge(analysis, summaryStart - 2, 0, 0, summaryStart - 1);
  [[1, 2], [3, 4], [5, 6]].forEach(([start, end]) => merge(analysis, summaryStart - 2, start, end));
  for (let row = summaryStart; row < summaryStart + 3; row += 1) {
    if (row > summaryStart) paint(analysis, row, 7, { color: colors.red, borders: true });
    cellAt(analysis, row, 0).s.font = { ...cellAt(analysis, row, 0).s.font, color: { rgb: row === summaryStart + 1 ? '0000FF' : colors.black }, bold: true };
    format(analysis, row, [1], row === summaryStart ? formats.integer : formats.accountingInteger);
    format(analysis, row, [3, 5], formats.accountingInteger);
    format(analysis, row, [2, 4, 6], row === summaryStart ? formats.fullPercent : formats.percentThree);
  }
  heading(analysis, historyStart - 3, 10, false, false);
  table(analysis, historyStart - 2, historyLength, 10, 2);
  merge(analysis, historyStart - 2, 0, 0, historyStart - 1);
  [[1, 3], [4, 5], [6, 7], [8, 9]].forEach(([start, end]) => merge(analysis, historyStart - 2, start, end));
  for (let row = historyStart; row < historyStart + historyLength; row += 1) {
    format(analysis, row, [0], '0"年"');
    format(analysis, row, [1, 2, 3, 4, 6], formats.integer);
    format(analysis, row, [8], formats.accountingInteger);
  }
  heading(analysis, categoryStart - 2, 10, false, false);
  table(analysis, categoryStart - 1, categoryCount, 7);
  merge(analysis, categoryStart - 1, 5, 6);
  for (let index = 0; index < categoryCount; index += 1) {
    const row = categoryStart + index;
    if (index % 2 === 1) paint(analysis, row, 7, { fill: colors.gray, borders: true });
    merge(analysis, row, 5, 6);
    format(analysis, row, [1], '0"年"');
    format(analysis, row, [2, 3, 4], formats.accountingInteger);
  }
  heading(analysis, incrementStart - 2, 10);
  table(analysis, incrementStart - 1, increments.length, 4);
  increments.forEach((row, index) => {
    if (row.name === '小计' || ['车辆', '电话', '合计'].includes(row.category)) paint(analysis, incrementStart + index, 4, { bold: row.name === '合计', fill: row.name === '合计' ? colors.total : colors.blue, borders: true });
  });
  heading(analysis, indicatorStart - 2, 10);
  table(analysis, indicatorStart - 1, 3, 5);

  const details = workbook.Sheets['盘亏资产明细及原因'];
  widths(details, [9, 12, 24, 26, 32, 10, 19, 21, 14, 19, 19, 23, 16, 14, 16, 24, 24, 32]);
  heading(details, 0, 18, true);
  if (detailsAreDemo) {
    paint(details, 1, 18, { height: 21 });
    merge(details, 1, 0, 17);
  }
  table(details, 2, detailRows.length, 18);
  details['!rows'][2] = { hpt: 34 };
  detailRows.forEach((row, index) => {
    if (row.summary) paint(details, index + 3, 18, { bold: true, fill: row.label === '总计' ? colors.total : colors.blue, borders: true });
  });
  const distribution = workbook.Sheets['资产类型分布'];
  widths(distribution, [30, 16, 24, 18]);
  table(distribution, 0, utils.decode_range(distribution['!ref']).e.r, 4);
  const company = workbook.Sheets['盘亏分布'];
  widths(company, [28, 12, 13, 13, 13, 15, 15, 25, 13, 16, 22]);
  table(company, 0, companyRows.length, 11);
  company['!rows'][0] = { hpt: 34 };
  companyRows.forEach((row, index) => paint(company, index + 1, 11, { bold: row.company === '合计', fill: index % 2 === 1 ? colors.gray : colors.white, borders: true }));
}

// 保留模板B列起始位置及隐藏C列；隐藏列不增加可见业务字段。
export function positionInventoryAnalysisSheet(workbook) {
  const source = workbook.Sheets['盘点结果比较分析'];
  const column = value => value === 0 ? 1 : value + 2;
  const positioned = {};
  Object.entries(source).forEach(([address, cell]) => {
    if (address.startsWith('!')) return;
    const point = utils.decode_cell(address);
    positioned[utils.encode_cell({ r: point.r, c: point.r === 0 && point.c === 0 ? 0 : column(point.c) })] = cell;
  });
  positioned['!rows'] = source['!rows'];
  positioned['!cols'] = [{ wch: 4.375 }, source['!cols'][0], { wch: 11.5, hidden: true }, ...source['!cols'].slice(1)];
  positioned['!merges'] = source['!merges'].map(range => ({
    s: { r: range.s.r, c: range.s.r === 0 && range.s.c === 0 ? 0 : column(range.s.c) }, e: { r: range.e.r, c: column(range.e.c) },
  }));
  positioned['!ref'] = utils.encode_range({ s: { r: 0, c: 0 }, e: { r: utils.decode_range(source['!ref']).e.r, c: column(utils.decode_range(source['!ref']).e.c) } });
  workbook.Sheets['盘点结果比较分析'] = positioned;
}
