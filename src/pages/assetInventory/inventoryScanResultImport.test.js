import * as XLSX from 'xlsx';
import { applyInventoryScanResults, importInventoryScanResults, inventoryScanErrorsWorkbook, readInventoryScanWorkbook } from './inventoryScanResultImport';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';
import { serializeInventoryAssetExport } from './inventoryAssetExport';
const assets = [
  { assetTag: '001', key: 'a', planNo: 'P1', owner: '另一个责任人', inventoryRange: '员工', inventoryMethod: '狐小e', inventoryRemark: '原备注' },
  { assetTag: '002', key: 'b', planNo: 'P1', inventoryRange: '员工', inventoryRemark: '保留备注' },
];
const context = { project: { projectNo: 'I1', status: '盘点中', creator: '213852-孙志强' }, plan: { planNo: 'P1', status: '盘点中' }, assets, operator: '213852-孙志强' };
const entry = (assetTag, remark = '', sheet = '第一页', row = 2) => ({ assetTag, remark, sheet, row });
beforeEach(() => window.localStorage.clear());
function workbook() {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['资产标签号', '盘点备注', '盘点状态'], ['001', '新备注', '代盘']]), '第一页');
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['不同表头也跳过'], ['002', '   ', '报失']]), '第二页');
  return XLSX.read(XLSX.write(book, { type: 'array', bookType: 'xlsx' }), { type: 'array', cellNF: true });
}
test('实际Excel遍历全部Sheet跳首行，只读A/B；原子保存固定已盘/导入人/时间，不改方式', () => {
  const entries = readInventoryScanWorkbook(workbook());
  expect(entries.map(row => row.assetTag)).toEqual(['001', '002']);
  const now = new Date('2026-10-26T01:02:03Z');
  const result = importInventoryScanResults(entries, context, now);
  expect(result.success).toBe(true);
  const stored = getMobileInventoryResults('I1');
  expect(stored['001']).toMatchObject({ status: '已盘', inventoryBy: '孙志强', inventoryDate: now.toISOString(), inventoryRemark: '新备注' });
  expect(stored['002'].inventoryRemark).toBe('保留备注');
  expect(stored['001']).not.toHaveProperty('inventoryMethod');
  const updated = applyInventoryScanResults(assets, result.updates);
  expect(updated[0].inventoryMethod).toBe('狐小e');
  const csv = serializeInventoryAssetExport(updated).csv;
  expect(csv).toContain('新备注');
});
test('跨Sheet重复、越界或缺标签收集全部错误，任何有效行也不落库并可导出错误文件', () => {
  const result = importInventoryScanResults([entry('001'), entry('001', '', '第二页'), entry('999'), entry('', '缺标签')], context);
  expect(result.success).toBe(false);
  expect(result.errors).toHaveLength(3);
  expect(getMobileInventoryResults('I1')).toEqual({});
  const book = inventoryScanErrorsWorkbook(result.errors);
  expect(XLSX.utils.sheet_to_json(book.Sheets['导入错误'])).toHaveLength(3);
});
test('空备注优先保留已持久化新值，不恢复旧报失原因；新备注可直接覆盖', () => {
  saveMobileInventoryResult('I1', '001', { status: '报失', inventoryRemark: '持久备注', lossReason: '旧报失' });
  expect(importInventoryScanResults([entry('001', ' ')], context).success).toBe(true);
  expect(getMobileInventoryResults('I1')['001'].inventoryRemark).toBe('持久备注');
  importInventoryScanResults([entry('001', '覆盖备注')], context);
  expect(getMobileInventoryResults('I1')['001'].inventoryRemark).toBe('覆盖备注');
});
test.each(['草稿', '审核中', '盘点关闭'])('项目%s不允许导入', status => {
  expect(importInventoryScanResults([entry('001')], { ...context, project: { ...context.project, status } }).success).toBe(false);
});
test('负责人不是创建人，不能因owner字段获得导入权', () => {
  const result = importInventoryScanResults([entry('001')], { ...context, project: { ...context.project, creator: '其他人', owner: '孙志强' } });
  expect(result.success).toBe(false);
});
test('项目入口逐资产校验计划状态，未执行无计划资产允许在项目盘点中导入', () => {
  const projectContext = { ...context, plan: undefined, entryType: 'execution', plans: [{ planNo: 'P1', status: '草稿' }] };
  expect(importInventoryScanResults([entry('001')], projectContext).success).toBe(false);
  expect(importInventoryScanResults([entry('001')], { ...projectContext, plans: [{ planNo: 'P1', status: '盘点中' }] }).success).toBe(true);
  expect(importInventoryScanResults([entry('002')], { ...projectContext, entryType: 'notExecution', assets: [{ ...assets[1], planNo: '-' }] }).success).toBe(true);
});
test('机房执行人只能导入本人执行资产，混入他人资产整批失败', () => {
  const room = { ...context, project: { ...context.project, creator: '其他人', scopeRanges: ['机房'] }, assets: assets.map((asset, i) => ({ ...asset, inventoryRange: '机房', executor: i ? '其他人' : '孙志强' })) };
  expect(importInventoryScanResults([entry('001'), entry('002')], room).success).toBe(false);
  expect(getMobileInventoryResults('I1')).toEqual({});
  expect(importInventoryScanResults([entry('001')], room).success).toBe(true);
});
test('存储写入失败不留下部分资产，不返回成功', () => {
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('空间不足'); });
  const result = importInventoryScanResults([entry('001'), entry('002')], context);
  set.mockRestore();
  expect(result.success).toBe(false);
  expect(result.errors[0].reason).toContain('空间不足');
  expect(getMobileInventoryResults('I1')).toEqual({});
});
