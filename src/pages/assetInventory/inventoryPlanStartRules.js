const assigned = (value) => Boolean(String(value || '').trim()) && value !== '-';

export function planPersonnelBlockReason(plan, assets, project) {
  if (!assets.length) return `盘点计划 ${plan.planNo} 没有分配资产，不能启动`;
  const machineRoomInitial = project?.projectType === '初盘'
    && project?.generationSource === '系统生成'
    && plan.range === '机房';
  const missing = assets.find((asset) => !assigned(asset.executor) || (!machineRoomInitial && !assigned(asset.supervisor)));
  if (!missing) return '';
  const field = !assigned(missing.executor) ? '盘点执行人' : '盘点监督人';
  return `计划 ${plan.planNo} 的资产 ${missing.assetTag} 缺少${field}，请在计划资产清单中配置后再启动`;
}
