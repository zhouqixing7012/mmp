import { INVENTORY_MOBILE_ASSETS } from '../../mock/inventoryMobileMock';

// 进度演示样本取已有计划资产，叠加当前项目盘点结果；不代表真实项目全量进度。
export function buildSupplementalProgress(project, allowedRanges, assets = INVENTORY_MOBILE_ASSETS, today = new Date(), results = {}) {
  const endDate = project?.endDate || '';
  const end = endDate ? new Date(endDate.slice(0, 10) + 'T00:00:00') : null;
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const remainingDays = end ? Math.max(0, Math.ceil((end - current) / 86400000)) : '-';
  const groups = new Map();
  assets.filter((asset) => ['库房', '公共'].includes(asset.area) && allowedRanges.includes(asset.area)).forEach((asset) => {
    const status = results[asset.tagNo]?.status ?? asset.status;
    const city = String(asset.address || '').split('-')[0];
    const key = [asset.area, asset.company, city].join('::');
    if (!groups.has(key)) groups.set(key, { key, range: asset.area, organization: asset.company, department: '虚拟组织', city, expected: 0, counted: 0, lost: 0, assetTags: [], supervisor: '-', financialSupervisor: '-', remainingDays });
    const row = groups.get(key);
    row.assetTags.push(asset.tagNo);
    if (status === '未执行盘点') return;
    row.expected += Number(asset.quantity);
    if (['已盘', '代盘'].includes(status)) row.counted += Number(asset.quantity);
    if (status === '报失') row.lost += Number(asset.quantity);
  });
  const details = [...groups.values()].map((row) => ({ ...row, uncounted: row.expected - row.counted - row.lost, progress: row.expected ? Number((row.counted / row.expected * 100).toFixed(1)) : 0 }));
  const summary = ['库房', '公共'].filter((range) => allowedRanges.includes(range)).map((range) => {
    const rows = details.filter((row) => row.range === range);
    const sum = (field) => rows.reduce((total, row) => total + row[field], 0);
    const expected = sum('expected'), counted = sum('counted');
    return { key: 'progress-' + range, range, startDate: project?.startDate || '-', endDate: endDate || '-', expected, counted, lost: sum('lost'), uncounted: sum('uncounted'), progress: expected ? Number((counted / expected * 100).toFixed(1)) : 0 };
  });
  return { details, summary };
}

export function serializeProgressExport(rows, columns) {
  const cell = (value) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  return [columns.map(([label]) => cell(label)).join(','), ...rows.map((row) => columns.map(([, field]) => cell(row[field])).join(','))].join('\r\n');
}
