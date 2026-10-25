import * as XLSX from 'xlsx';
import { getPhotoReviewResults, savePhotoReviewResult } from './inventoryPhotoReviewStore';
import { createInventoryPlanWorkbook, mergePlanInventoryResult, PLAN_ASSET_EXPORT_FIELDS, selectInventoryExportRows } from './inventoryPlanExport';

test('计划导出分别保留资产备注和报失原因，并合并类别', () => {
  const asset = mergePlanInventoryResult({ assetTag:'A1', category:'NOTEBOOK', subCategory:'办公笔记本', remark:'资产备注' }, { status:'报失', inventoryNote:'设备遗失', inventoryRemark:'设备遗失', lossReason:'设备遗失' });
  const workbook = createInventoryPlanWorkbook([{planNo:'P1'}], () => [asset]);
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单']);
  expect(rows[0]).toMatchObject({'计划编号':'P1','资产类别':'NOTEBOOK.办公笔记本','备注':'资产备注','盘点备注':'设备遗失','盘点状态':'报失'});
  expect(PLAN_ASSET_EXPORT_FIELDS.filter(([label]) => label === '盘点备注')).toHaveLength(1);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'], { header: 1 })[0]).not.toContain('计划负责人');
  expect(workbook.SheetNames).toEqual(['计划资产清单']);
});

test('每计划全部资产逐行导出，并保留计划元信息和原有全部资产字段', () => {
  const plans = [{ planNo: 'P1', planName: '计划甲', status: '草稿', startDate: '2026-10-26' }, { planNo: 'P2', planName: '计划乙' }];
  const workbook = createInventoryPlanWorkbook(plans, plan => Array.from({ length: 12 }, (_, index) => ({ assetTag: `${plan.planNo}-${index}` })));
  const sheet = workbook.Sheets['计划资产清单'];
  const rows = XLSX.utils.sheet_to_json(sheet);
  expect(rows).toHaveLength(24);
  expect(rows[0]).toMatchObject({ '计划编号': 'P1', '计划名称': '计划甲', '计划状态': '草稿', '盘点开始日期': '2026-10-26' });
  const header = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
  expect(header).toEqual(expect.arrayContaining(PLAN_ASSET_EXPORT_FIELDS.map(([label]) => label)));
});

test('非空查询照查询导出，空查询只回退当前权限母集并保留勾选限制', () => {
  const permitted = [{ key: 'a' }, { key: 'b' }];
  expect(selectInventoryExportRows([permitted[1]], permitted)).toEqual([permitted[1]]);
  expect(selectInventoryExportRows([], permitted)).toEqual(permitted);
  expect(selectInventoryExportRows([], permitted, ['b', 'outside-project'])).toEqual([permitted[1]]);
  expect(selectInventoryExportRows([permitted[1]], permitted, ['a'])).toEqual([]);
  expect(selectInventoryExportRows([], [])).toEqual([]);
});

test('关联资产导出明确是否必盘，与计划明细使用同一判断和历史键兜底', () => {
  const workbook = createInventoryPlanWorkbook([{ planNo: 'P' }], () => [{ key: 'a', assetTag: '001', isMandatory: false }, { key: 'b', assetTag: '002' }], { project: { projectType: '复盘', mandatoryAssetKeys: ['a', 'b'] } });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单']);
  expect(rows.map((row) => row['是否必盘'])).toEqual(['否', '是']);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'], { header: 1 })[0].filter((label) => label === '是否必盘')).toHaveLength(1);
  expect(PLAN_ASSET_EXPORT_FIELDS.map(([label]) => label)).not.toContain('是否必盘');
});

test('报失后继续盘点，既有盘点备注仍保留；只导出所传计划', () => {
  const asset = mergePlanInventoryResult({ inventoryRemark:'遗失原因', lossReason:'遗失原因' }, {status:'已盘'});
  expect(asset.inventoryRemark).toBe('遗失原因');
  const workbook = createInventoryPlanWorkbook([{planNo:'P2'}], plan => [{assetTag:plan.planNo}]);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'])).toHaveLength(1);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'])[0]['资产标签号']).toBe('P2');
});

test('本次结果来源覆盖旧渠道且导出不把配置方式当执行来源', () => {
  const asset = mergePlanInventoryResult({ inventoryMethod: '扫码枪', importMode: '手工导入' }, { status: '审核中', resultSource: '狐小e快速扫描' });
  const workbook = createInventoryPlanWorkbook([{ planNo: 'P1' }], () => [asset, { inventoryMethod: '狐小e', importMode: 'APP导入' }]);
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'], { defval: '' });
  expect(rows[0]).toMatchObject({ 盘点方式: '扫码枪', 结果来源: '狐小e快速扫描' });
  expect(rows[1].结果来源).toBe('');
});

test('PC计划列表和导出优先读取同项目照片审核结论并保留盘点备注', () => {
  const original = { category: 'NOTEBOOK', subCategory: '技术笔记本', inventoryRemark: '遗失原因' };
  const mobile = { status: '审核中', inventoryBy: '苏伟' };
  const approved = mergePlanInventoryResult(original, mobile, { status: '已盘' });
  const rejected = mergePlanInventoryResult(original, mobile, { status: '未盘' });
  expect(approved).toMatchObject({ inventoryStatus: '已盘', counter: '苏伟', inventoryRemark: '遗失原因' });
  expect(rejected.inventoryStatus).toBe('未盘');
  const workbook = createInventoryPlanWorkbook([{ planNo: 'P1' }], () => [approved]);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划资产清单'])[0]).toMatchObject({ '盘点状态': '已盘', '盘点备注': '遗失原因' });
  expect(mergePlanInventoryResult(original, undefined, { status: '未盘' }).inventoryStatus).toBe('未盘');
});

test('审核存储的盘点状态按项目合并，其他项目审核不影响导出', () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  savePhotoReviewResult('P1', { assetTag: 'A1', status: '未盘' });
  savePhotoReviewResult('P2', { assetTag: 'A1', status: '已盘' });
  const mobile = { status: '审核中' };
  const assetsForProject = projectNo => {
    const reviews = new Map(getPhotoReviewResults(projectNo).map(row => [row.assetTag, row]));
    return [mergePlanInventoryResult({ assetTag: 'A1' }, mobile, reviews.get('A1'))];
  };
  const p1 = createInventoryPlanWorkbook([{ planNo: 'PLAN1' }], () => assetsForProject('P1'));
  const p2 = createInventoryPlanWorkbook([{ planNo: 'PLAN2' }], () => assetsForProject('P2'));
  expect(XLSX.utils.sheet_to_json(p1.Sheets['计划资产清单'])[0]['盘点状态']).toBe('未盘');
  expect(XLSX.utils.sheet_to_json(p2.Sheets['计划资产清单'])[0]['盘点状态']).toBe('已盘');
});


test('新扫码枪结果及再次报失不被旧图片审核覆盖，照片来源保留', () => {
  const photos = { overall: { id: 'photo-1' } };
  expect(mergePlanInventoryResult({ assetTag: 'A' }, { status: '代盘', resultSource: '扫码枪', photos }, { status: '未盘' })).toMatchObject({ inventoryStatus: '代盘', photos });
  expect(mergePlanInventoryResult({ assetTag: 'A' }, { status: '报失', lossReason: '再次报失' }, { status: '未盘' })).toMatchObject({ inventoryStatus: '报失', lossReason: '再次报失' });
});
