import { parseUncountedImport, applyUncountedImport, uncountedImportBlockReason } from './inventoryUncountedImport';
const assets = [{ assetTag: 'A', uncountedNote: '旧说明', inventoryStatus: '未盘', counter: '甲', inventoryDate: '2026-10-01' }, { assetTag: 'B', uncountedNote: '原说明', inventoryStatus: '已盘' }];
const sheets = rows => [{ name: 'Sheet1', rows: [['资产标签号', '未盘说明'], ...rows] }];
test('仅更新匹配资产的说明，空白保留，状态人员时间不变', () => {
 const result = parseUncountedImport(sheets([['A', '维修中'], ['B', '']]), assets);
 expect(result.errors).toEqual([]);
 expect(applyUncountedImport(assets, result.updates)).toEqual([{ ...assets[0], uncountedNote: '维修中' }, assets[1]]);
});
test.each([[['A', '说明'], ['X', '范围外']], [['A', '说明'], ['A', '重复']], [['', '缺标签']]].map(rows => [rows]))('任一错误整批不保存且定位行号', rows => {
 const result = parseUncountedImport(sheets(rows), assets);
 expect(result.updates).toEqual([]); expect(result.errors[0]).toMatchObject({ sheet: 'Sheet1', row: expect.any(Number), message: expect.any(String) });
});
test('只允许审核中或已审核、项目创建人操作，关闭后禁用', () => {
 const context = { project: { creator: '甲', status: '盘点中' }, operator: '甲', plan: { status: '审核中' } };
 expect(uncountedImportBlockReason(context)).toBe('');
 expect(uncountedImportBlockReason({ ...context, plan: { status: '已审核' } })).toBe('');
 expect(uncountedImportBlockReason({ ...context, plan: { status: '盘点中' } })).toContain('仅审核中');
 expect(uncountedImportBlockReason({ ...context, operator: '乙' })).toContain('创建人');
 expect(uncountedImportBlockReason({ ...context, project: { ...context.project, status: '盘点关闭' } })).toContain('关闭');
});
test('表头校验及跨sheet重复标签', () => {
 expect(parseUncountedImport([{ name: '错', rows: [['资产标签号']] }], assets).errors).toHaveLength(1);
 expect(parseUncountedImport([...sheets([['A', '1']]), ...sheets([['A', '2']])], assets).updates).toEqual([]);
});
