import XLSX from 'xlsx-js-style';

export const ACCOUNTING_SUMMARY_PROJECTS = [
  '主机',
  '显示器',
  '主机（配件）',
  '笔记本',
  '笔记本（配件）',
  '办公设备',
  '办公设备（配件）',
  '服务器',
  '服务器（配件）',
  '网络设备',
  '网络设备（配件）',
  '家具',
  'VEHICLE',
];

export function accountingSummaryProject(asset) {
  const category = String(asset?.majorCategory || '').trim().toUpperCase();
  const minor = String(asset?.minorCategory || '');
  const description = String(asset?.description || '');
  const accessory = Boolean(
    asset?.parentAssetTag
    || asset?.mainAssetTag
    || asset?.mainTagNo
    || asset?.mainTag
    || asset?.isAccessory
    || /配件/.test(minor)
    || /配件/.test(description)
  );
  let base = category;
  if (category === 'PC') base = '主机';
  else if (category === 'DISPLAY' || /显示器/.test(minor) || /显示器/.test(description)) base = '显示器';
  else if (category === 'NOTEBOOK') base = '笔记本';
  else if (category === 'OFFICE EQUIPMENT') base = '办公设备';
  else if (category === 'SERVER') base = '服务器';
  else if (category === 'NET EQUIPMENT') base = '网络设备';
  else if (category === 'FURNITURE') base = '家具';
  else if (category === 'VEHICLE') base = 'VEHICLE';
  return accessory && ['主机', '笔记本', '办公设备', '服务器', '网络设备'].includes(base)
    ? `${base}（配件）`
    : base || '未分类';
}

const KINDS = ['已到报废期', '未到报废期', '丢失'];
export const ACCOUNTING_EXPORT_HEADERS = [
  '资产类别', '资产标签号', '资产编号', '资产说明', '资产关键字', '数量', '原值',
  '购买日期', '资产寿命（月）', '累计折旧', '净值', '责任人工号', '责任人姓名',
  '资产所在城市', '资产所在地点', '资产所在楼层',
];
const AMOUNT_FORMAT = '#,##0.00_);[Red]\\(#,##0.00\\)';
const SUMMARY_FORMAT = '#,##0.00;[Red](#,##0.00);"-"';
const thin = { style: 'thin', color: { rgb: '000000' } };

function numeric(value) {
  if (value === '' || value === undefined || value === null) return null;
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error('资产数量或金额格式无效，请更正后导出');
  return result;
}

function totals(rows) {
  return ['quantity', 'originalValue', 'accumulatedDepreciation', 'netValue'].map((key) => {
    const values = rows.map((row) => numeric(row[key]));
    if (!values.length || values.some((value) => value === null)) return null;
    const sum = values.reduce((result, value) => result + value, 0);
    return key === 'quantity' ? sum : Math.round((sum + Number.EPSILON) * 100) / 100;
  });
}

function cell(sheet, row, col, value, { bold = false, red = false, size = 11, center = false, border = false, format, font = '宋体' } = {}) {
  sheet[XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })] = {
    t: typeof value === 'number' ? 'n' : 's',
    v: value ?? '',
    s: {
      font: { name: font, sz: size, bold, color: { rgb: red ? 'FF0000' : '000000' } },
      alignment: { vertical: 'center', horizontal: center ? 'center' : typeof value === 'number' ? 'right' : 'left', wrapText: true },
      ...(border ? { border: { top: thin, bottom: thin, left: thin, right: thin } } : {}),
      ...(format ? { numFmt: format } : {}),
    },
    ...(format ? { z: format } : {}),
  };
}

function merge(sheet, row, col, lastRow, lastCol) {
  sheet['!merges'].push({ s: { r: row - 1, c: col - 1 }, e: { r: lastRow - 1, c: lastCol - 1 } });
}

function detailSheet(kind, rows) {
  const sheet = { '!merges': [], '!rows': [{ hpt: 14.25 }, { hpt: 46 }], '!cols':
    [14, 16, 14, 26, 20, 8, 14, 12, 12, 14, 14, 14, 16, 16, 24, 16].map((wch) => ({ wch })) };
  cell(sheet, 1, 1, kind === '已到报废期' ? '已到报废期资产' : kind, { bold: true, red: true, size: 10 });
  ACCOUNTING_EXPORT_HEADERS.forEach((title, index) => cell(sheet, 2, index + 1, title, { bold: true, size: 10 }));
  const groups = new Map();
  rows.forEach((asset) => {
    const category = asset.majorCategory || '未分类';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(asset);
  });
  let rowIndex = 3;
  groups.forEach((assets, category) => {
    assets.forEach((asset) => {
      const owner = String(asset.responsiblePerson || '').match(/^([^-]+)-(.*)$/);
      const values = [
        asset.majorCategory || '', asset.tagNo, asset.assetNo, asset.description, asset.assetKeyword,
        numeric(asset.quantity), numeric(asset.originalValue), asset.purchaseDate || '', numeric(asset.assetLifeMonths),
        numeric(asset.accumulatedDepreciation), numeric(asset.netValue),
        asset.ownerId ?? owner?.[1] ?? '', asset.ownerName ?? owner?.[2] ?? asset.responsiblePerson ?? '',
        asset.city, asset.building, asset.floor,
      ];
      values.forEach((value, index) => cell(sheet, rowIndex, index + 1, value, {
        size: 10,
        format: [6, 9, 10].includes(index) ? AMOUNT_FORMAT : [1, 2, 11].includes(index) ? '@' : undefined,
      }));
      sheet['!rows'][rowIndex - 1] = { hpt: 28 };
      rowIndex += 1;
    });
    writeTotal(category, totals(assets), false);
  });
  writeTotal('TOTAL', totals(rows), true);
  sheet['!ref'] = `A1:P${rowIndex - 1}`;
  return sheet;

  function writeTotal(label, values, red) {
    cell(sheet, rowIndex, 1, label, { size: 10, bold: true, red });
    [6, 7, 10, 11].forEach((column, index) => cell(sheet, rowIndex, column, values[index], {
      size: 10, bold: true, red, format: column === 6 ? '0.########' : AMOUNT_FORMAT,
    }));
    sheet['!rows'][rowIndex - 1] = { hpt: 22 };
    rowIndex += 1;
  }
}

export function buildAccountingScrapWorkbook(assets, form = {}) {
  if (!assets.length) throw new Error('当前无可导出数据');
  if (assets.some((asset) => !KINDS.includes(asset.scrapType))) {
    throw new Error('存在未明确报废类型的资产，请更正后导出');
  }
  const normalizedAssets = assets.map((asset) => ({
    ...asset,
    accumulatedDepreciation: asset.accumulatedDepreciation ?? (
      numeric(asset.originalValue) !== null && numeric(asset.netValue) !== null
        ? Math.round((Number(asset.originalValue) - Number(asset.netValue)) * 100) / 100 : null
    ),
  }));
  const workbook = XLSX.utils.book_new();
  const sheet = { '!merges': [], '!cols': [17.625, 5.625, 11.625, 11.25, 11.25, 5.625, 10.5, 11.25, 11.625, 5.625, 10.5, 11.25, 10.625].map((wch) => ({ wch })), '!rows': [] };
  const period = String(form.scrapPeriod || '');
  const reportDate = period.replace(/^(\d{4})年(\d{1,2})月$/, (_, reportYear, month) => `${reportYear}/${month.padStart(2, '0')}`);
  const year = period.match(/\d{4}/)?.[0] || '';
  const company = String(form.company || '').replace(/^[^.]+\./, '');
  cell(sheet, 2, 5, `${year}Disposal Application`, { font: 'Times New Roman', size: 16, bold: true });
  cell(sheet, 4, 5, form.scrapFormName || `${company}固定资产报废申请表`, { size: 16, bold: true });
  [[6, 4, '申请人'], [6, 5, form.creator], [6, 8, '部门'], [6, 9, form.department],
    [8, 4, '部门经理'], [8, 5, form.departmentManager], [8, 8, '报废日期'], [8, 9, reportDate]].forEach(([r, c, v]) => cell(sheet, r, c, v, { size: 12 }));
  const projects = [...ACCOUNTING_SUMMARY_PROJECTS];
  normalizedAssets.forEach((asset) => {
    const project = accountingSummaryProject(asset) || '未分类';
    if (!projects.includes(project)) projects.push(project);
  });
  const totalRow = 12 + projects.length;
  for (let r = 10; r <= totalRow; r += 1) {
    sheet['!rows'][r - 1] = { hpt: 26.1 };
    for (let c = 1; c <= 13; c += 1) cell(sheet, r, c, '', { border: true, center: true });
  }
  cell(sheet, 10, 1, '项目', { bold: true, center: true, border: true });
  merge(sheet, 10, 1, 11, 1);
  projects.concat('TOTAL').forEach((project, index) => cell(sheet, 12 + index, 1, project, { bold: true, border: true }));
  KINDS.forEach((kind, kindIndex) => {
    const start = 2 + kindIndex * 4;
    cell(sheet, 10, start, `${kind}资产`, { bold: true, center: true, border: true });
    merge(sheet, 10, start, 10, start + 3);
    ['数量', '原值', '账面净值', '报废原因'].forEach((title, index) => cell(sheet, 11, start + index, title, { center: true, border: true }));
    const subset = normalizedAssets.filter((asset) => asset.scrapType === kind);
    projects.concat('TOTAL').forEach((project, index) => {
      const matches = project === 'TOTAL' ? subset : subset.filter((asset) => (accountingSummaryProject(asset) || '未分类') === project);
      const values = totals(matches);
      [values[0], values[1], values[3]].forEach((value, offset) => cell(sheet, 12 + index, start + offset, matches.length ? value : '-', {
        border: true, bold: project === 'TOTAL', font: 'Times New Roman', format: offset ? SUMMARY_FORMAT : '0.########;[Red](0.########);"-"',
      }));
    });
    const reason = Object.prototype.hasOwnProperty.call(form.scrapReasons || {}, kind)
      ? form.scrapReasons[kind] : [...new Set(subset.map((asset) => asset.reason).filter(Boolean))].join('\n');
    cell(sheet, 12, start + 3, reason, { border: true, center: true });
    merge(sheet, 12, start + 3, totalRow, start + 3);
    XLSX.utils.book_append_sheet(workbook, detailSheet(kind, subset), kind);
  });
  // 净值备注按确认后的模板原文固定展示，部门经理由组织数据提供。
  cell(sheet, totalRow + 2, 1, "Remark：资产净值为Dec.2024US Gaap净值,仅供参考.", { font: 'Times New Roman', size: 12, bold: true, red: true });
  merge(sheet, totalRow + 3, 1, totalRow + 3, 13);
  cell(sheet, totalRow + 4, 1, '审批流程');
  const historyHeader = totalRow + 5;
  ['序号', '节点', '审批人', '审批时间', '审批意见'].forEach((title, index) => {
    const col = index ? 2 + (index - 1) * 3 : 1;
    cell(sheet, historyHeader, col, title, { bold: true, center: true });
    if (index) merge(sheet, historyHeader, col, historyHeader, col + 2);
  });
  const history = form.approvalRecords || [];
  history.forEach((record, index) => {
    const row = historyHeader + index + 1;
    [index + 1, record.node, record.person, record.time, record.comment].forEach((value, field) => {
      const col = field ? 2 + (field - 1) * 3 : 1;
      cell(sheet, row, col, value, { center: true });
      if (field) merge(sheet, row, col, row, col + 2);
    });
    sheet['!rows'][row - 1] = { hpt: 40 };
  });
  sheet['!ref'] = `A1:M${historyHeader + history.length}`;
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  workbook.SheetNames = ['Sheet1', ...KINDS];
  return workbook;
}

export function exportAccountingScrapWorkbook(assets, form) {
  const workbook = buildAccountingScrapWorkbook(assets, form);
  const name = String(form.scrapFormName || '账面报废申请表').replace(/[\\/:*?"<>|]/g, '_');
  XLSX.writeFile(workbook, `${name}.xlsx`);
}
