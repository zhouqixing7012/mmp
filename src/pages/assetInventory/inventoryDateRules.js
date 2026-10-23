export function inventoryDateBlockReason(projectType, startDate, endDate) {
  if (!startDate || !endDate) return '请完整填写盘点开始日期和盘点结束日期';
  if (endDate < startDate) return '盘点结束日期不能早于盘点开始日期';
  return '';
}

// 项目和计划均允许跨天，结束日期不得早于开始日期。
export function inventoryProjectDateBlockReason(startDate, endDate) {
  if (!startDate || !endDate) return '请完整填写盘点开始日期和盘点结束日期';
  if (endDate < startDate) return '盘点结束日期不能早于盘点开始日期';
  return '';
}
