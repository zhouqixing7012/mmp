import { isSnapshotExecutionAsset, isSnapshotNonExecutionAsset } from './inventorySnapshotAssets';
test('新抽样清单覆盖旧执行标记，母集剩余资产仅进入未执行清单',()=>{
 const project={snapshotAssetKeys:['a'],scopeSnapshotAssetKeys:['a','b']};
 expect(isSnapshotExecutionAsset({key:'a',executeInventory:false},project)).toBe(true);
 expect(isSnapshotNonExecutionAsset({key:'a'},project)).toBe(false);
 expect(isSnapshotExecutionAsset({key:'b',executeInventory:true},project)).toBe(false);
 expect(isSnapshotNonExecutionAsset({key:'b'},project)).toBe(true);
 expect(isSnapshotExecutionAsset({key:'outside',executeInventory:true},project)).toBe(false);
 expect(isSnapshotNonExecutionAsset({key:'outside'},project)).toBe(false);
});
test('零抽样不退回全量执行，历史快照仍沿用原标记',()=>{
 expect(isSnapshotExecutionAsset({key:'a',executeInventory:true},{snapshotAssetKeys:[],scopeSnapshotAssetKeys:['a']})).toBe(false);
 expect(isSnapshotNonExecutionAsset({key:'a'},{snapshotAssetKeys:[],scopeSnapshotAssetKeys:['a']})).toBe(true);
 expect(isSnapshotExecutionAsset({executeInventory:true},{})).toBe(true);
});
