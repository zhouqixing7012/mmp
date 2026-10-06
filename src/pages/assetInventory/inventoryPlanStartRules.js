const assigned = (value) => Boolean(String(value || '').trim()) && value !== '-';

export function planPersonnelBlockReason(plan, assets) {
  if (!assets.length) return `盘点计划 ${plan.planNo} 没有分配资产，不能启动`;
  // 监督人是选填项；仅校验每项资产的执行人，不能因范围不同增加必填约束。
  const missing = assets.find((asset) => !assigned(asset.executor));
  if (!missing) return '';
  return `计划 ${plan.planNo} 的资产 ${missing.assetTag} 缺少盘点执行人，请在计划资产清单中配置后再启动`;
}
