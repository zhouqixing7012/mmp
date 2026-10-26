import { inventoryExecutionBlockReason } from './inventoryExecutionRules';
import { decideReplayReview, getReplaySubmission, submitReplayProjectReview, submitReplayReview } from './inventoryReplayReviewStore';
import { importInventoryScanResults } from './inventoryScanResultImport';
import { uploadInventoryScannedTags } from './inventoryLabelScan';

const project = { projectNo: 'R-lock', projectType: '复盘', status: '盘点中', creator: '213852-孙志强' };
const plan = { key: 'p', planNo: 'P1', status: '盘点中', endDate: '2000-01-01' };
const assets = [{ key: 'a', quantity: 1, assetTag: 'A', planNo: 'P1', inventoryRange: '员工', supervisor: '徐博', executor: '孙志强', inventoryStatus: '未盘', isMandatory: true }];
const submit = () => submitReplayReview({ project, plans: [plan], assetsForPlan: () => assets, operator: '孙志强' });
const decide = decision => decideReplayReview({ project, operator: '徐博', decision, opinion: decision === '驳回' ? '请复核' : '', planNo: 'P1', planKey: 'p', round: getReplaySubmission(project.projectNo).planReviews.P1.round });
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

test('结束日期已过不影响执行，项目关闭阻止执行', () => {
  expect(inventoryExecutionBlockReason({ project, plan })).toBe('');
  expect(inventoryExecutionBlockReason({ project: { ...project, status: '盘点关闭' }, plan })).toContain('关闭');
});
test('计划审批中和通过锁定，驳回后恢复可执行；移动按资产标签也读取有效审批', () => {
  submit();
  expect(inventoryExecutionBlockReason({ project, plan })).toContain('计划审批');
  expect(inventoryExecutionBlockReason({ project, quantity: 1, assetTag: 'A' })).toContain('计划审批');
  decide('驳回');
  expect(inventoryExecutionBlockReason({ project, plan })).toBe('');
  submit(); decide('同意');
  expect(inventoryExecutionBlockReason({ project, plan })).toContain('计划审批');
});
test('文件已打开仍不能绕过新提交审批，扫码枪和文件均在保存前阻止', () => {
  submit();
  const result = importInventoryScanResults([{ quantity: 1, assetTag: 'A', remark: '改写', sheet: 'Sheet1', row: 2 }], { project, plan, operator: '213852-孙志强', assets });
  expect(result.success).toBe(false);
  expect(result.errors[0].reason).toContain('审批');
  expect(() => uploadInventoryScannedTags({ project, plan, operator: '213852-孙志强', assets, tags: ['A'] })).toThrow('审批');
});
test('项目审批中及通过锁定全部资产，项目驳回恢复计划执行并要求重新计划审批', () => {
  submit(); decide('同意');
  submitReplayProjectReview({ project, plans: [plan], operator: '孙志强' });
  expect(inventoryExecutionBlockReason({ project, quantity: 1, assetTag: 'A' })).toContain('项目审批');
  let state = getReplaySubmission(project.projectNo);
  decideReplayReview({ project, operator: '徐博', decision: '驳回', opinion: '请补充', scope: 'project', plans: [plan], round: state.projectReview.round });
  expect(inventoryExecutionBlockReason({ project, plan })).toBe('');
  state = getReplaySubmission(project.projectNo);
  expect(state.planReviews.P1.status).toBe('已驳回');
  expect(state.planReviews.P1.records.some(record => record.status === '已通过')).toBe(true);
  expect(() => submitReplayProjectReview({ project, plans: [plan], operator: '孙志强' })).toThrow('全部复盘计划');
});
test('零计划不可进入项目审批，零资产计划不可提交审批', () => {
  expect(() => submitReplayProjectReview({ project, plans: [], operator: '孙志强' })).toThrow('没有可提交');
  expect(() => submitReplayReview({ project, plans: [plan], assetsForPlan: () => [], operator: '孙志强' })).toThrow('没有资产');
});

test('存在资产行但数量合计为零，也不能提交计划审批', () => {
  expect(() => submitReplayReview({ project, plans: [plan], assetsForPlan: () => assets.map(asset => ({ ...asset, quantity: 0 })), operator: '孙志强' })).toThrow('资产数量为零');
});
