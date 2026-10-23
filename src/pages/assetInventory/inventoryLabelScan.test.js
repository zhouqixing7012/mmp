import { uploadInventoryScannedTags, inventoryScannerBlockReason } from './inventoryLabelScan';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';
const project = { projectNo: 'SCAN-P', status: '盘点中' };
const plan = { planNo: 'PLAN-1', status: '盘点中' };
const assets = [{ assetTag: 'A', ownerNo: '213852', owner: '孙志强' }, { assetTag: 'B', owner: '其他人' }];
beforeEach(() => localStorage.clear());
test('授权ES在当前计划扫码成功，实际盘点人和渠道跨页保存，保留报失原因', () => {
  saveMobileInventoryResult(project.projectNo, 'A', { lossReason: '曾报失', inventoryRemark: '曾报失' });
  const result = uploadInventoryScannedTags({ project, plan, operator: '213852-孙志强', assets, tags: ['A', 'B', 'outside'] });
  expect(result.map(item => item.success)).toEqual([true, true, false]);
  expect(getMobileInventoryResults(project.projectNo).A).toMatchObject({ status: '已盘', resultSource: '扫码枪', inventoryBy: '孙志强', lossReason: '曾报失' });
  expect(getMobileInventoryResults(project.projectNo).B.status).toBe('代盘');
  expect(getMobileInventoryResults(project.projectNo).outside).toBeUndefined();
});
test('拒绝非ES、非盘点中及已关闭，不能绕页面直接上传', () => {
  for (const props of [{ operator: '冯丽婷' }, { plan: { ...plan, status: '草稿' } }, { project: { ...project, status: '盘点关闭' } }]) {
    const input = { project, plan, operator: '213852-孙志强', assets, tags: ['A'], ...props };
    expect(inventoryScannerBlockReason(input.project, input.plan, input.operator)).toBeTruthy();
    expect(() => uploadInventoryScannedTags(input)).toThrow();
  }
  expect(getMobileInventoryResults(project.projectNo)).toEqual({});
});
test('重复标签不重复保存，失败单独反馈', () => {
  const result = uploadInventoryScannedTags({ project, plan, operator: '213852-孙志强', assets, tags: ['A', 'A'] });
  expect(result[1]).toMatchObject({ success: false, reason: '本次已扫描该标签' });
});
