export function isSnapshotExecutionAsset(asset, project) {
  return project.snapshotAssetKeys ? project.snapshotAssetKeys.includes(asset.key) : Boolean(asset.executeInventory);
}
export function isSnapshotNonExecutionAsset(asset, project) {
  return project.snapshotAssetKeys
    ? (project.scopeSnapshotAssetKeys || []).includes(asset.key) && !project.snapshotAssetKeys.includes(asset.key)
    : !asset.executeInventory;
}
