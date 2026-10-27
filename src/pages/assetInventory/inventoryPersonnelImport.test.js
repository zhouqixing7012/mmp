import { parseInventoryPersonnelImport, PERSONNEL_IMPORT_HEADERS } from './inventoryPersonnelImport';
const assets = [{ key: 'a', assetTag: 'A', supervisor: '原监督', executor: '原执行', inventoryRange: '员工' }, { key: 'b', assetTag: 'B', executor: '旧人员', inventoryRange: '员工' }];
const context = { project: { projectType: '初盘' }, plans: [{ key: 'p', status: '草稿' }], assetsForPlan: () => assets };
const parse = (rows, extra = {}) => parseInventoryPersonnelImport([{ name: 'Sheet1', rows: [PERSONNEL_IMPORT_HEADERS, ...rows] }], { ...context, ...extra });
test('按工号匹配而非姓名，空白保留，不修改其他资产', () => {
  const result = parse([['A', '', '213852-输入的姓名']]);
  expect(result).toEqual({ updates: [{ planKey: 'p', assetKey: 'a', patch: { executor: '孙志强' } }], errors: [] });
  expect(assets[0].supervisor).toBe('原监督'); expect(assets[1].executor).toBe('旧人员');
});
test('不存在人员整行跳过，其他有效行正常保存', () => {
  const result = parse([['A', '213852-孙志强', '999-不存在'], ['B', '', '206984-何文']]);
  expect(result.updates).toEqual([{ planKey: 'p', assetKey: 'b', patch: { executor: '何文' } }]);
  expect(result.errors[0]).toMatchObject({ sheet: 'Sheet1', row: 2, assetTag: 'A' });
  expect(result.errors[0].message).toContain('不存在');
});
test('范围外资产及非法格式报错，空人员不清空', () => {
  const result = parse([['X', '', '213852-孙志强'], ['A', '孙志强', ''], ['B', '', '']]);
  expect(result.updates).toHaveLength(0); expect(result.errors).toHaveLength(2);
});
test('启动后及机房初盘锁定，不绕过复盘财务限制', () => {
  expect(parse([['A', '', '213852-孙志强']], { plans: [{ key: 'p', status: '盘点中' }] }).errors).toHaveLength(1);
  expect(parse([['A', '', '213852-孙志强']], { assetsForPlan: () => [{ ...assets[0], inventoryRange: '机房' }] }).errors).toHaveLength(1);
  expect(parse([['A', '', '213852-孙志强']], { project: { projectType: '复盘' } }).errors[0].message).toContain('财务');
});
test('表头仅允许三列，支持调序，跨sheet重复报错', () => {
  const sheets = [{ name: '一', rows: [['盘点执行人', '资产标签号', '盘点监督人'], ['213852-孙志强', 'A', '']] }, { name: '二', rows: [PERSONNEL_IMPORT_HEADERS, ['A', '', '213852-孙志强']] }];
  const result = parseInventoryPersonnelImport(sheets, context);
  expect(result.updates).toHaveLength(1); expect(result.errors[0].message).toContain('重复');
  expect(parseInventoryPersonnelImport([{ name: '错', rows: [['资产标签号']] }], context).errors).toHaveLength(1);
});
