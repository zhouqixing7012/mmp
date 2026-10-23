// 资产盘点结果统一读取盘点备注，兼容旧演示结果字段；不合并项目说明或未盘说明。
export function inventoryRemark(asset) {
  return asset?.inventoryRemark ?? asset?.lossReason ?? asset?.inventoryNote ?? '';
}
