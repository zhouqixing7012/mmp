import { filterInventoryAssets, EMPTY_INVENTORY_ASSET_QUERY } from './inventoryAssetQuery';
import { formatAssetCategory } from '../../components/assetQueryModel';
import { serializeInventoryAssetExport } from './inventoryAssetExport';

const rows = [
  { key: 'a', assetTag: 'A1', category: '电脑', subCategory: '笔记本', owner: '甲', ownerLevel: '1', city: '北京', enableDate: '2026-01-01', inventoryStatus: '未盘', inventoryMethod: '扫码枪', noStatus: '正常', executor: '乙', supervisor: '丙', costCenter: '财务' },
  { key: 'b', assetTag: 'B1', category: '电脑', subCategory: '台式机', owner: '乙', ownerLevel: '10', city: '上海', enableDate: '2026-06-01', inventoryStatus: '已盘', inventoryMethod: '人工上传盘点结果', noStatus: '异常' },
  { key: 'c', assetTag: 'C1', category: '手机', subCategory: '智能手机', owner: '公共管理员', ownerLevel: '公共', city: '北京', enableDate: '2026-01-01' },
];
const query = (filters) => filterInventoryAssets(rows, { ...EMPTY_INVENTORY_ASSET_QUERY, ...filters }).map((row) => row.key);

test('类别父节点包含所有小类，叶节点和多选按明确层级匹配', () => {
  expect(query({ category: ['major:电脑'] })).toEqual(['a', 'b']);
  expect(query({ category: ['minor:电脑|笔记本', 'minor:手机|智能手机'] })).toEqual(['a', 'c']);
  expect(query({ category: ['minor:电脑|笔记本'], owner: ['乙'] })).toEqual([]);
});

test('职级、人员和公共按所选值精确匹配，1不能命中10', () => {
  expect(query({ ownerLevel: ['1'] })).toEqual(['a']);
  expect(query({ ownerLevel: ['1', '公共'] })).toEqual(['a', 'c']);
  expect(query({ owner: ['甲', '乙'], city: '北京' })).toEqual(['a']);
});

test('新增的执行人、监督人、盘点方式、NO状态和日期条件实际筛选', () => {
  expect(query({ executor: ['乙'], supervisor: ['丙'], inventoryMethod: '扫码枪', noStatus: '正常', enableFrom: '2026-01-01', enableTo: '2026-01-01' })).toEqual(['a']);
  expect(query({ noStatus: '异常' })).toEqual(['b']);
  expect(query({ enableFrom: '2026-01-02' })).toEqual(['b']);
  expect(query({})).toEqual(['a', 'b', 'c']);
});

test('类别显示和导出使用同一大类.小类值', () => {
  expect(formatAssetCategory(rows[0])).toBe('电脑.笔记本');
  const result = serializeInventoryAssetExport([rows[0]]);
  expect(result.csv).toContain('"资产类别"');
  expect(result.csv).toContain('"电脑.笔记本"');
  expect(result.csv).not.toContain('"资产大类"');
  expect(result.missingFields).not.toContain('资产类别');
});
