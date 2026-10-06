import * as XLSX from 'xlsx';
import { getPhotoReviewResults, savePhotoReviewResult } from './inventoryPhotoReviewStore';
import { createInventoryPlanWorkbook, mergePlanInventoryResult, PLAN_ASSET_EXPORT_FIELDS } from './inventoryPlanExport';

test('计划导出分别保留资产备注和报失原因，并合并类别', () => {
  const asset = mergePlanInventoryResult({ assetTag:'A1', category:'NOTEBOOK', subCategory:'办公笔记本', remark:'资产备注' }, { status:'报失', inventoryNote:'设备遗失', inventoryRemark:'设备遗失', lossReason:'设备遗失' });
  const workbook = createInventoryPlanWorkbook([{planNo:'P1'}], () => [asset]);
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['关联资产清单']);
  expect(rows[0]).toMatchObject({'计划编号':'P1','资产类别':'NOTEBOOK.办公笔记本','备注':'资产备注','盘点备注':'设备遗失','盘点状态':'报失'});
  expect(PLAN_ASSET_EXPORT_FIELDS.filter(([label]) => label === '盘点备注')).toHaveLength(1);
});

test('报失后继续盘点，既有盘点备注仍保留；只导出所传计划', () => {
  const asset = mergePlanInventoryResult({ inventoryRemark:'遗失原因', lossReason:'遗失原因' }, {status:'已盘'});
  expect(asset.inventoryRemark).toBe('遗失原因');
  const workbook = createInventoryPlanWorkbook([{planNo:'P2'}], plan => [{assetTag:plan.planNo}]);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['计划信息'])).toHaveLength(1);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['关联资产清单'])[0]['资产标签号']).toBe('P2');
});

test('PC计划列表和导出优先读取同项目照片审核结论并保留盘点备注', () => {
  const original = { category: 'NOTEBOOK', subCategory: '技术笔记本', inventoryRemark: '遗失原因' };
  const mobile = { status: '审核中', inventoryBy: '苏伟' };
  const approved = mergePlanInventoryResult(original, mobile, { status: '已盘' });
  const rejected = mergePlanInventoryResult(original, mobile, { status: '未盘' });
  expect(approved).toMatchObject({ inventoryStatus: '已盘', counter: '苏伟', inventoryRemark: '遗失原因' });
  expect(rejected.inventoryStatus).toBe('未盘');
  const workbook = createInventoryPlanWorkbook([{ planNo: 'P1' }], () => [approved]);
  expect(XLSX.utils.sheet_to_json(workbook.Sheets['关联资产清单'])[0]).toMatchObject({ '盘点状态': '已盘', '盘点备注': '遗失原因' });
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
  expect(XLSX.utils.sheet_to_json(p1.Sheets['关联资产清单'])[0]['盘点状态']).toBe('未盘');
  expect(XLSX.utils.sheet_to_json(p2.Sheets['关联资产清单'])[0]['盘点状态']).toBe('已盘');
});
