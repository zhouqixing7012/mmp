import { INVENTORY_ASSET_EXPORT_FIELDS, serializeInventoryAssetExport } from './inventoryAssetExport';

test('盘点清单按新增EBS原值的35列顺序导出，不用子公司代替账套', () => {
  expect(INVENTORY_ASSET_EXPORT_FIELDS.map(([label]) => label)).toEqual([
    '计划编号', '盘点方式', '盘点状态', '盘点人', '盘点日期', '资产标签号', '印刷号', '序列号',
    '资产大类', '资产小类', '资产说明', '数量', '原值', 'EBS原值', '净值', '使用状态', 'NO位置', 'NO状态',
    '备注', '使用说明', '资产责任人编号', '资产责任人', '责任人部门', '责任人职级', 'City',
    'Building', 'Floor', '账套', '成本中心', '启用日期', 'NO扫描资产标签号', 'NO扫描序列号',
    'NO扫描型号', 'NO扫描品牌', 'NO扫描位置',
  ]);
  const result = serializeInventoryAssetExport([{ planNo: 'P1', assetTag: 'A1', organization: '集团' }]);
  expect(result.csv.split('\r\n')[1].split(',')[27]).toBe('""');
  expect(result.missingFields).toContain('账套');
  expect(result.csv).not.toContain('集团');
});
