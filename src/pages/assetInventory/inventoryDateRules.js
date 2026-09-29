export function inventoryDateBlockReason(projectType, startDate, endDate) {
  if (!startDate || !endDate) return '请完整填写盘点开始日期和盘点结束日期';
  if (endDate < startDate) return '盘点结束日期不能早于盘点开始日期';
  if (projectType === '复盘' && startDate !== endDate) return '复盘执行期间只能为同一天';
  return '';
}
