import { parseSnapshotTransferRows } from './inventorySnapshotTransfer';
const rows = [{ key: 'a', assetTag: 'A' }, { key: 'b', assetTag: 'B' }];
test('模板按标签匹配当前清单，保留当前快照信息', () => {
  expect(parseSnapshotTransferRows([['资产标签号'], ['B'], ['A']], rows)).toEqual([rows[1], rows[0]]);
});
test('错误标签、重复、空文件或额外列阻止整批转移', () => {
  expect(() => parseSnapshotTransferRows([['资产标签号'], ['A'], ['OUT']], rows)).toThrow(/OUT.*不在当前/);
  expect(() => parseSnapshotTransferRows([['资产标签号'], ['A'], ['A']], rows)).toThrow(/重复/);
  expect(() => parseSnapshotTransferRows([['资产标签号']], rows)).toThrow(/没有资产/);
  expect(() => parseSnapshotTransferRows([['资产标签号'], ['A', '其他']], rows)).toThrow(/未定义/);
});
