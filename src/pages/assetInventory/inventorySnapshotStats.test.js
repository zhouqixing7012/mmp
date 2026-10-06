import { calculateInventorySnapshotStats } from './inventorySnapshotStats';
import { serializeInventorySnapshotExport } from './inventoryAssetExport';

test('快照统计按当前清单及资产数量计算，不混入未执行清单盘点状态', () => {
  const execution = [{ quantity: 3, inventoryStatus: '已盘' }, { quantity: 2, inventoryStatus: '未盘' }];
  const notExecution = [{ quantity: 7, inventoryStatus: '已盘' }];
  expect(calculateInventorySnapshotStats(execution, notExecution)).toEqual({ total: 12, execution: 5, notExecution: 7, counted: 3, uncounted: 2, lost: 0, rate: 60 });
  expect(calculateInventorySnapshotStats([execution[0]], [...notExecution, execution[1]])).toEqual({ total: 12, execution: 3, notExecution: 9, counted: 3, uncounted: 0, lost: 0, rate: 100 });
});

test('快照导出两类实际资产并保留是否执行标记', () => {
  const rows = [{ assetTag: 'A', category: '电脑', subCategory: '笔记本', executeInventory: true }, { assetTag: 'B', category: '家具', subCategory: '椅子', executeInventory: false }];
  const { csv, missingFields } = serializeInventorySnapshotExport(rows);
  const lines = csv.split('\r\n');
  expect(lines).toHaveLength(3);
  expect(lines[0]).toContain('"是否执行盘点"');
  expect(lines[1]).toContain('"电脑.笔记本"');
  expect(lines[1].endsWith('"是"')).toBe(true);
  expect(lines[2].endsWith('"否"')).toBe(true);
  expect(missingFields).not.toContain('是否执行盘点');
});
