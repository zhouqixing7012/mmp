import * as XLSX from 'xlsx';
import { inventoryRemark } from './inventoryRemark';
import { createInventoryPlanWorkbook, mergePlanInventoryResult } from './inventoryPlanExport';
import { createProgressAssetWorkbook } from './inventoryProgressModel';

test('旧结果备注在统一读取、计划导出及进度导出一致，其他说明独立', () => {
  const asset = { assetTag: 'A', inventoryNote: '旧盘点备注', remark: '资产备注', uncountedNote: '未盘原因', description: '资产说明' };
  expect(inventoryRemark(asset)).toBe('旧盘点备注');
  const plan = createInventoryPlanWorkbook([{ planNo: 'P' }], () => [asset]);
  const row = XLSX.utils.sheet_to_json(plan.Sheets['关联资产清单'])[0];
  expect(row['盘点备注']).toBe(inventoryRemark(asset));
  expect(row['备注']).toBe('资产备注');
  expect(row).not.toHaveProperty('盘点说明');
  const progress = XLSX.utils.sheet_to_json(createProgressAssetWorkbook([asset]).Sheets['资产清单'])[0];
  expect(progress['盘点备注']).toBe('旧盘点备注');
  expect(progress['未盘说明']).toBe('未盘原因');
});

test('新提交仅含旧字段时更新有效备注，不被资产旧值遮盖', () => {
  const merged = mergePlanInventoryResult({ inventoryRemark: '旧值', remark: '资产原备注' }, { inventoryNote: '新提交' });
  expect(inventoryRemark(merged)).toBe('新提交');
  expect(merged.remark).toBe('资产原备注');
});

test('空备注不会回填旧原因，项目说明和未盘说明不充当盘点备注', () => {
  expect(inventoryRemark({ inventoryRemark: '', inventoryNote: '旧值', lossReason: '历史原因' })).toBe('');
  expect(inventoryRemark({ description: '项目说明', uncountedNote: '未盘原因', remark: '资产备注' })).toBe('');
  expect(inventoryRemark({ lossReason: '报失原因' })).toBe('报失原因');
  expect(inventoryRemark(mergePlanInventoryResult({ inventoryRemark: '保留值' }, { inventoryNote: null }))).toBe('保留值');
});
