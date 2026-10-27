import { INVENTORY_ASSET_EXPORT_FIELDS, serializeInventoryAssetExport, serializeInventorySnapshotExport, serializeInventoryScopeExport } from './inventoryAssetExport';
import * as XLSX from 'xlsx';

test('盘点清单分别导出盘点方式和导入方式，不用子公司代替账套', () => {
  expect(INVENTORY_ASSET_EXPORT_FIELDS.map(([label]) => label)).toEqual([
    '计划编号', '盘点方式', '导入方式', '盘点状态', '盘点人', '盘点日期', '资产标签号', '序列号',
    '资产类别', '资产说明', '数量', '原值', 'EBS原值', '净值', '使用状态', 'NO位置',
    '备注', '使用说明', '资产责任人编号', '资产责任人', '责任人部门', '责任人职级', 'City',
    'Building', 'Floor', '账套', '成本中心', '启用日期', 'NO扫描资产标签号', 'NO扫描序列号',
    'NO扫描型号', 'NO扫描品牌', 'NO扫描位置',
  ]);
  const result = serializeInventoryAssetExport([{ planNo: 'P1', assetTag: 'A1', organization: '集团' }]);
  expect(result.csv.split('\r\n')[1].split(',')[INVENTORY_ASSET_EXPORT_FIELDS.findIndex(([, key]) => key === 'accountBook')]).toBe('""');
  expect(result.missingFields).toContain('账套');
  expect(result.csv).not.toContain('集团');
});

test('复盘范围与快照导出带是否必盘，旧无选项调用保持原字段', () => {
  const rows = [{ key: 'a', assetTag: '001', isMandatory: false, executeInventory: false }, { key: 'b', assetTag: '002', executeInventory: true }];
  const options = { project: { projectType: '复盘', mandatoryAssetKeys: ['a', 'b'] } };
  const range = XLSX.read(serializeInventoryAssetExport(rows, options).csv, { type: 'string' });
  expect(XLSX.utils.sheet_to_json(range.Sheets[range.SheetNames[0]]).map((row) => row['是否必盘'])).toEqual(['否', '是']);
  const snapshot = XLSX.read(serializeInventorySnapshotExport(rows, options).csv, { type: 'string' });
  expect(XLSX.utils.sheet_to_json(snapshot.Sheets[snapshot.SheetNames[0]]).map((row) => [row['是否必盘'], row['是否执行盘点']])).toEqual([['否', '否'], ['是', '是']]);
  expect(serializeInventoryAssetExport(rows).csv.split('\r\n')[0]).not.toContain('是否必盘');
  expect(serializeInventoryAssetExport(rows, options).missingFields).not.toContain('是否必盘');
});

test('范围导出完整19列、复盘20列，与独立导入模板分开且不影响执行清单', () => {
  const rows = [{ assetTag: '0001', description: '资产说明', owner: '123-测试人', ownerDeptFullName: '子公司.部门.末级', remark: '资产备注', isMandatory: true }];
  const initial = serializeInventoryScopeExport(rows);
  expect(initial.matrix[0]).toEqual(['资产标签号','序列号','资产类别','资产说明','数量','原值','净值','状态','NO位置','备注','资产责任人','责任人部门','责任人职级','City','Building','Floor','盘点组织','成本中心','启用日期']);
  expect(initial.matrix[1][0]).toBe('0001');
  expect(initial.matrix[1][9]).toBe('资产备注');
  expect(initial.matrix[1][10]).toBe('123-测试人');
  expect(initial.matrix[1][11]).toBe('子公司.部门.末级');
  const replay = serializeInventoryScopeExport(rows, { project: { projectType: '复盘' } });
  expect(replay.matrix[0]).toHaveLength(20);
  expect(replay.matrix[0].at(-1)).toBe('是否必盘');
  expect(replay.matrix[1].at(-1)).toBe('是');
  expect(serializeInventoryAssetExport(rows).csv).toContain('盘点备注');
  expect(initial.matrix[0]).not.toContain('盘点备注');
});

test('执行清单与快照导出有效盘点备注，独立保留资产备注', () => {
  const rows = [{ assetTag: 'A', remark: '资产备注', inventoryRemark: '导入的新备注', lossReason: '旧报失原因' }];
  for (const serialize of [serializeInventoryAssetExport, serializeInventorySnapshotExport]) {
    const workbook = XLSX.read(serialize(rows).csv, { type: 'string' });
    const [asset] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    expect(asset['备注']).toBe('资产备注');
    expect(asset['盘点备注']).toBe('导入的新备注');
  }
});
