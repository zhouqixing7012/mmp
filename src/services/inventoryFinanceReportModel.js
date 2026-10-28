import template from '../data/inventoryFinanceReportTemplate.json';

const majorKey = value => String(value || '').replace(/^\d+\./, '').toUpperCase().replace(/[\s-]/g, '');
const majors = { PC: 'PC', NOTEBOOK: 'Notebook', NB: 'Notebook', OFFICEEQUIPMENT: 'Office-e', OFFICEE: 'Office-e', OE: 'Office-e', SERVER: 'Server', NETEQUIPMENT: 'Net-e', NETE: 'Net-e', FURNITURE: 'Furniture', SOFTWARE: 'Software', VEHICLE: 'Car', CAR: 'Car' };

export function financeAssetClassification(asset) {
  const minor = String(asset.subCategory ?? asset.minorCategory ?? '').trim();
  const minorA = minor.split('-')[0];
  if (['手写板', '手写版', '刻录机'].includes(minorA)) return null;
  const major = majors[majorKey(asset.category ?? asset.majorCategory)];
  if (!major || !minorA) throw new Error(`缺少资产分类映射：${asset.assetTag || ''}`);
  return { major, minor: minor === '移动数码-手机' ? 'Mobile' : minorA };
}

export function financeReportNotes({ company, inventoryDate, stockDate } = {}) {
  return [
    `1、以上数据是${company || 'XXX公司'}的资产盘点信息；`,
    `2、以上数据是截止到${inventoryDate || 'XXXX年X月X日'}的盘查结果；`,
    `3、盘点资产，为截止到${stockDate || 'XXXX年X月X日'}的入库资产。`,
    '4、盘点表公式关系：C=A-B',
  ];
}

const sum = (assets, field) => assets.reduce((total, asset) => total + asset[field], 0);
function metric(assets) {
  const counted = assets.filter(asset => ['已盘', '代盘'].includes(asset.inventoryStatus));
  const lost = assets.filter(asset => asset.inventoryStatus === '报失');
  const pending = assets.filter(asset => asset.inventoryStatus === '未盘');
  const value = rows => sum(rows, 'ebsOriginalValue');
  const qty = rows => sum(rows, 'quantity');
  return [value(assets), qty(assets), value(counted), qty(counted), value(assets) - value(counted), qty(assets) - qty(counted), value(lost), qty(lost), value(pending), qty(pending)];
}

function detailSheet(name, assets, input) {
  const body = assets.map(asset => {
    const month = asset.inventoryRange === '机房' ? input.reportDate?.slice(0, 7)
      : asset.inventoryStatus === '报失' ? asset.inventoryDate?.slice(0, 7) : input.year ? `${input.year}-06` : null;
    return [`${asset.category}.${asset.subCategory}`, asset.assetTag, asset.assetNo ?? '', asset.description ?? '', asset.assetKeyword ?? '', asset.quantity, asset.ebsOriginalValue,
      asset.purchaseDate ?? '', asset.lifeMonths ?? '', asset.accumulatedDepreciation ?? '', asset.netValuesByMonth?.[month] ?? '', asset.ownerNo ?? '',
      asset.owner ?? '', asset.costCenter ?? '', asset.city ?? '', asset.building ?? '', asset.floor ?? '', asset.organization ?? '', asset.plate ?? ''];
  });
  const total = Array(19).fill(''); total[0] = 'TOTAL';
  [5, 6, 9, 10].forEach(index => { total[index] = body.every(row => typeof row[index] === 'number') ? body.reduce((value, row) => value + row[index], 0) : ''; });
  return { name, rows: [[name, ...Array(18).fill('')], template.sheets[1].rows[1], ...body, total], merges: [] };
}

// 分类、金额及汇总在同一份结果中计算，页面与报告导出共用。
export function buildFinanceInventoryReport(input = {}) {
  const groups = new Map();
  let currentMajor;
  template.sheets[0].rows.slice(5, 22).forEach(row => {
    currentMajor = row[0] || currentMajor;
    if (!groups.has(currentMajor)) groups.set(currentMajor, new Map());
    if (['手写板', '手写版', '刻录机'].includes(row[1])) return;
    groups.get(currentMajor).set(row[1] === 'Notebook' ? '笔记本' : row[1], []);
  });
  const assets = [];
  (input.assets || []).forEach(asset => {
    const classification = financeAssetClassification(asset);
    if (!classification) return;
    if (typeof asset.ebsOriginalValue !== 'number' || !Number.isFinite(asset.ebsOriginalValue)) throw new Error(`资产${asset.assetTag || ''}缺少EBS原值`);
    if (typeof asset.quantity !== 'number' || !Number.isFinite(asset.quantity)) throw new Error(`资产${asset.assetTag || ''}缺少数量`);
    const minors = groups.get(classification.major);
    if (classification.minor && minors.has('') && !minors.get('').length) minors.delete('');
    // 无小类分组的模板大类，仍按本大类的小类A分别展示。
    if (!minors.has(classification.minor)) minors.set(classification.minor, []);
    minors.get(classification.minor).push(asset);
    assets.push(asset);
  });
  const rows = template.sheets[0].rows.slice(0, 5).map(row => [...row]);
  rows[0][0] = `${input.company || 'XXX公司'}盘点报告`;
  const merges = template.sheets[0].merges.filter(merge => merge.e.r < 5);
  groups.forEach((minors, major) => {
    const groupAssets = [...minors.values()].flat();
    const totals = metric(groupAssets);
    const start = rows.length;
    [...minors.entries()].forEach(([minor, items], index) => {
      const values = metric(items);
      rows.push([index === 0 ? major : '', minor, values[0], index === 0 ? totals[0] : '', values[1], index === 0 ? totals[1] : '',
        values[2], index === 0 ? totals[2] : '', values[3], index === 0 ? totals[3] : '', values[4], index === 0 ? totals[4] : '', values[5], index === 0 ? totals[5] : '',
        index === 0 ? totals[6] : '', index === 0 ? totals[7] : '', index === 0 ? '丢失' : '', index === 0 ? totals[8] : '', index === 0 ? totals[9] : '', index === 0 ? '待查' : '']);
    });
    if (rows.length - start > 1) [0, 3, 5, 7, 9, 11, 13, 14, 15, 16, 17, 18, 19].forEach(c => merges.push({ s: { r: start, c }, e: { r: rows.length - 1, c } }));
  });
  const totals = metric(assets);
  const total = Array(20).fill('');total[0] = 'TOTAL';
  [2, 3, 6, 7, 10, 11, 14, 17].forEach((column, index) => { total[column] = totals[[0, 0, 2, 2, 4, 4, 6, 8][index]]; });
  [4, 5, 8, 9, 12, 13, 15, 18].forEach((column, index) => { total[column] = totals[[1, 1, 3, 3, 5, 5, 7, 9][index]]; });
  const totalRow = rows.length; rows.push(total);
  const notes = financeReportNotes(input);
  notes.forEach(note => { const r = rows.length;rows.push([note, ...Array(19).fill('')]);merges.push({ s: { r, c: 0 }, e: { r, c: 19 } }); });
  const signature = Array(20).fill('');signature[0] = `Report time:${input.reportDate || ''}`;signature[15] = `Editor: ${input.editor || ''}`;
  rows.push(Array(20).fill(''), signature);
  const reviewer = Array(20).fill('');reviewer[15] = `Check over: ${input.reviewer || ''}`;rows.push(reviewer);
  const finance = Array(20).fill('');finance[14] = `Finance signature: ${input.financeSignature || ''}`;rows.push(finance);
  return { ...input, notes, sheets: [
    { name: '盘点报告汇总', rows, merges, totalRow },
    detailSheet('盘亏资产明细', assets.filter(asset => asset.inventoryStatus === '报失'), input),
    detailSheet('待盘资产明细', assets.filter(asset => asset.inventoryStatus === '未盘'), input),
  ] };
}
