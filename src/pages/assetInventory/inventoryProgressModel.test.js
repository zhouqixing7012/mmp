import * as XLSX from 'xlsx';
import { buildInventoryProgress, createProgressWorkbook, createProgressAssetWorkbook, filterProgressRows, isUncountedProgressAsset } from './inventoryProgressModel';
import { INVENTORY_MOBILE_ASSETS } from '../../mock/inventoryMobileMock';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';

// 测试沿用既有移动资产，不在业务模型引入跨项目默认资产。
const mobileFixtureProgress = (project, ranges, assets = INVENTORY_MOBILE_ASSETS, today = new Date(), results = {}) => buildInventoryProgress(project, ranges,
  ranges.map((range) => ({ planNo: range, range })), (plan) => assets.filter((asset) => asset.area === plan.range).map((asset) => ({
    ...asset, assetTag: asset.tagNo, inventoryStatus: results[asset.tagNo]?.status ?? asset.status, organization: asset.company,
    city: String(asset.address).split('-')[0],
  })), [], today);

 test('库房公共样本可追溯已有资产且汇总与详情一致', () => {
  const { details, summary } = mobileFixtureProgress({ endDate: '2026-10-02' }, ['库房', '公共'], undefined, new Date(2026, 9, 1));
  expect(details).toHaveLength(2);
  expect(details.every((row) => row.department === '虚拟组织')).toBe(true);
  expect(details.flatMap((row) => row.assetTags)).toEqual(expect.arrayContaining(['1141300083-P', '3102200966']));
  summary.forEach((row) => { const children = details.filter((detail) => detail.range === row.range); expect(row.expected).toBe(children.reduce((total, detail) => total + detail.expected, 0)); expect(row.uncounted).toBe(row.expected - row.counted - row.lost); });
  expect(details.every((row) => row.remainingDays === 1)).toBe(true);
 });
 test('范围过滤且逾期剩余天数保留负数', () => {
  const { details, summary } = mobileFixtureProgress({ endDate: '2026-09-01' }, ['公共'], undefined, new Date(2026, 9, 1));
  expect(summary.map((row) => row.range)).toEqual(['公共']);
  expect(details.every((row) => row.remainingDays === -30)).toBe(true);
 });
 test('公共移动盘点结果更新进度且项目之间隔离', () => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  saveMobileInventoryResult('CP-public-A', '3102200966', { status: '已盘' });
  const resultFor = (projectNo) => mobileFixtureProgress({ projectNo }, ['公共'], undefined, new Date(2026, 9, 1), getMobileInventoryResults(projectNo));
  expect(resultFor('CP-public-A').details[0]).toMatchObject({ expected: 1, counted: 1, uncounted: 0, progress: 100 });
  expect(resultFor('CP-public-B').details[0]).toMatchObject({ expected: 1, counted: 0, uncounted: 1, progress: 0 });
  expect(resultFor('CP-public-A').summary[0]).toMatchObject({ counted: 1, uncounted: 0 });
 });

const plans = [
  { planNo: 'P1', range: '员工', executor: '苏伟', supervisor: '韩晓晗', financialSupervisor: '徐博', auditSupervisor: '-' },
  { planNo: 'P2', range: '公共', executor: '李磊', supervisor: '韩晓晗' },
];
const sampleAssets = {
  P1: [
    { assetTag: '3103201755', organization: '集团', city: '北京市', quantity: 1, inventoryStatus: '报失', executeInventory: true, email: 'suwei@example.com' },
    { assetTag: '114121801802', organization: '集团', city: '北京市', quantity: 1, inventoryStatus: '审核中', executeInventory: true },
  ],
  P2: [{ assetTag: '3102200966', organization: '集团', city: '北京市', quantity: 1, inventoryStatus: '已盘', executeInventory: true }],
};
const progressFor = (ranges = ['员工', '公共']) => buildInventoryProgress({ endDate: '2026-09-30' }, ranges, plans,
  (plan) => sampleAssets[plan.planNo], [{ employeeName: '苏伟', department: '搜狐媒体.智能平台.新闻产品中心' }], new Date(2026, 9, 1));

test('实际计划清单同源汇总、待审计入未盘、报失不增加已盘进度', () => {
  const result = progressFor();
  expect(result.summary.find((row) => row.range === '员工')).toMatchObject({ expected: 2, counted: 0, lost: 1, uncounted: 1, progress: 0 });
  expect(result.details.find((row) => row.range === '员工')).toMatchObject({ department: '搜狐媒体.智能平台', supervisor: '韩晓晗', financialSupervisor: '徐博', remainingDays: -1 });
  expect(result.details.find((row) => row.range === '公共')).toMatchObject({ department: '虚拟组织', counted: 1 });
  expect(result.assets.filter(isUncountedProgressAsset).map((asset) => asset.assetTag)).toEqual(['114121801802']);
  expect(progressFor(['公共']).assets.map((asset) => asset.assetTag)).toEqual(['3102200966']);
});

test('明细筛选与Excel导出使用同一范围，数量保持Excel数值类型', () => {
  const selected = filterProgressRows(progressFor().details, { range: ['员工'], expected: [2], financialSupervisor: ['徐博'] });
  expect(selected).toHaveLength(1);
  const workbook = createProgressWorkbook(selected, [['盘点范围', 'range'], ['应盘数量', 'expected']], '进度详情');
  const readBack = XLSX.read(XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }), { type: 'array' });
  expect(XLSX.utils.sheet_to_json(readBack.Sheets['进度详情'], { header: 1 })).toEqual([['盘点范围', '应盘数量'], ['员工', 2]]);
});

test('全量资产Excel保留联系字段，缺失邮箱不构造，未执行资产不计入进度', () => {
  const workbook = createProgressAssetWorkbook(progressFor().assets);
  const [headers, lost, review] = XLSX.utils.sheet_to_json(workbook.Sheets['资产清单'], { header: 1 });
  expect(lost[headers.indexOf('责任人邮箱')]).toBe('suwei@example.com');
  expect(review[headers.indexOf('责任人邮箱')]).toBe('');
  const result = buildInventoryProgress({}, ['员工'], [plans[0]], () => [{ ...sampleAssets.P1[0], executeInventory: false }]);
  expect(result.assets).toEqual([]);
  expect(result.summary[0].expected).toBe(0);
});
