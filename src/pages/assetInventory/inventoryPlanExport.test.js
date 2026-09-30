import * as XLSX from 'xlsx';
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
