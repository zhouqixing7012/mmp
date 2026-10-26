import { assertInventoryManagementPermission, inventoryManagementBlockReason } from './inventoryManagementPermissions';
import { submitReplayReview, submitReplayProjectReview, decideReplayReview, getReplaySubmission } from './inventoryReplayReviewStore';
const project = { projectNo: 'MANAGE-R', projectType: '复盘', status: '盘点中', creator: '213852-孙志强' };
const plan = { key: 'p', planNo: 'P1', status: '盘点中' };
const assetsForPlan = () => [{ assetTag: 'A', quantity: 10, supervisor: '徐博', executor: '冯丽婷', inventoryStatus: '未盘' }];
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
test('只认项目创建人，工号不同的同名人不能管理，owner不是创建人', () => {
  expect(inventoryManagementBlockReason(project, '孙志强')).toBe('');
  expect(inventoryManagementBlockReason(project, '213852-孙志强')).toBe('');
  expect(inventoryManagementBlockReason(project, '999999-孙志强')).toContain('仅项目创建人');
  expect(inventoryManagementBlockReason({ projectNo: 'X', owner: '孙志强' }, '孙志强')).toContain('缺少项目创建人');
  expect(() => assertInventoryManagementPermission(project, '徐博')).toThrow('仅项目创建人');
});
test('计划和项目提交在保存入口拒绝非创建人，审批人仍可按原会签角色处理', () => {
  expect(() => submitReplayReview({ project, plans: [plan], assetsForPlan, operator: '徐博' })).toThrow('仅项目创建人');
  expect(getReplaySubmission(project.projectNo)).toBeNull();
  submitReplayReview({ project, plans: [plan], assetsForPlan, operator: '孙志强' });
  const current = getReplaySubmission(project.projectNo).planReviews.P1;
  expect(() => decideReplayReview({ project, planNo: 'P1', planKey: 'p', operator: '徐博', decision: '驳回', opinion: '  ', round: current.round })).toThrow('驳回意见');
  expect(getReplaySubmission(project.projectNo).planReviews.P1.status).toBe('审核中');
  decideReplayReview({ project, planNo: 'P1', planKey: 'p', operator: '徐博', decision: '同意', round: current.round });
  expect(() => submitReplayProjectReview({ project, plans: [plan], operator: '徐博' })).toThrow('仅项目创建人');
  submitReplayProjectReview({ project, plans: [plan], operator: '孙志强' });
  expect(getReplaySubmission(project.projectNo).projectReview.status).toBe('审核中');
});
