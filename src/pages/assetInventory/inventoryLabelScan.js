import { INVENTORY_CREATORS } from './inventoryCreatorPermissions';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';

export function inventoryScannerOperator(operator) {
  const person = INVENTORY_CREATORS.find(item => item.value === operator && item.label.startsWith('ES-'));
  if (!person) return null;
  return { name: person.label.slice(3), employeeNo: person.value.match(/^(\d+)-/)?.[1] || '' };
}

export function inventoryScannerBlockReason(project, plan, operator) {
  if (project?.status === '盘点关闭') return '项目已关闭，不能上传盘点结果';
  if (plan?.status !== '盘点中') return '仅盘点中的计划可以使用标签扫描';
  if (!inventoryScannerOperator(operator)) return '标签扫描仅向ES资产组开放';
  return '';
}

export function checkInventoryScannedTag(tag, assets, accepted = []) {
  if (!String(tag || '').trim()) return '请扫描资产标签号';
  if (accepted.includes(tag)) return '本次已扫描该标签';
  if (!assets.some(asset => asset.assetTag === tag)) return '该标签不属于当前盘点计划';
  return '';
}

// 保存到移动端和PC共用的当前结果；未填写新备注时保留原盘点备注。
export function uploadInventoryScannedTags({ project, plan, operator, assets, tags, now = new Date() }) {
  const blocked = inventoryScannerBlockReason(project, plan, operator);
  if (blocked) throw new Error(blocked);
  const person = inventoryScannerOperator(operator);
  const previous = getMobileInventoryResults(project.projectNo);
  const accepted = new Set();
  return tags.map(tag => {
    const reason = checkInventoryScannedTag(tag, assets, [...accepted]);
    if (reason) return { assetTag: tag, success: false, reason };
    accepted.add(tag);
    const asset = assets.find(item => item.assetTag === tag);
    const sameOwner = asset.ownerNo && person.employeeNo ? String(asset.ownerNo) === person.employeeNo : asset.owner === person.name;
    const result = { ...previous[tag], status: sameOwner ? '已盘' : '代盘', inventoryBy: person.name,
      inventoryDate: now.toISOString(), resultSource: '扫码枪', planNo: plan.planNo };
    try {
      saveMobileInventoryResult(project.projectNo, tag, result);
      return { assetTag: tag, success: true, result };
    } catch (error) {
      return { assetTag: tag, success: false, reason: '盘点结果保存失败，请重试' };
    }
  });
}
