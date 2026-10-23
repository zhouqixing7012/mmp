import { applyReplayPlanStatuses, decideReplayReview, getReplaySubmission, replayDecisionBlockReason, submitReplayReview, validateReplaySubmission } from './inventoryReplayReviewStore';
const project = { projectNo: 'R-test', projectType: '复盘', samplingMode: '百分比', samplingRatio: 50 };
const plans = [{ planNo: 'P1', range: '员工', status: '盘点中' }, { planNo: 'P2', range: '公共', status: '盘点中' }];
const assetsForPlan = plan => plan.planNo === 'P1' ? [{ assetTag: 'A', inventoryStatus: '已盘' }] : [{ assetTag: 'B', inventoryStatus: '未盘' }];
const submit = overrides => submitReplayReview({ project, plans, assetsForPlan, operator: '冯丽婷', allowBelowRatio: true, ...overrides });
const decide = (operator, decision = '同意', overrides = {}) => decideReplayReview({ project, operator, decision, round: getReplaySubmission(project.projectNo).round, ...overrides });
beforeEach(() => window.localStorage.clear());
test('逐计划检查状态，不能以其他计划已启动代替', () => {
  expect(() => submit({ plans: [plans[0], { ...plans[1], status: '草稿' }] })).toThrow('P2');
  expect(getReplaySubmission(project.projectNo)).toBeNull();
});
test('逐计划完成比例弱提示，不被其他计划完成率抵消', () => {
  expect(validateReplaySubmission(project, plans, assetsForPlan)).toEqual([expect.stringContaining('P2')]);
  expect(() => submit({ allowBelowRatio: false })).toThrow('P2');
  expect(submit().status).toBe('审核中');
});
test('仅百分比抽样检查比例，0比例不被错误替换为100', () => {
  expect(validateReplaySubmission({ ...project, samplingMode: '全量' }, plans, assetsForPlan)).toEqual([]);
  expect(validateReplaySubmission({ ...project, samplingRatio: 0 }, plans, assetsForPlan)).toEqual([]);
  expect(() => validateReplaySubmission(project, plans, () => [])).toThrow('零资产');
});
test.each(['待审核', '审核不通过'])('已提交照片%s阻止所属计划整批提交，未提交照片不阻止', reviewStatus => {
  const photoRows = [{ asset: { assetTag: 'B' }, photos: { overall: { id: 'photo' } }, reviewStatus }];
  expect(() => submit({ photoRows })).toThrow('P2 资产 B');
  expect(() => submit({ photoRows: [{ ...photoRows[0], photos: {} }] })).not.toThrow();
});
test.each(['扫码枪', '人工导入'])('%s无需人工照片审核', resultSource => {
  const photoRows = [{ asset: { assetTag: 'B' }, photos: { overall: {} }, reviewStatus: '待审核' }];
  expect(() => submit({ assetsForPlan: plan => assetsForPlan(plan).map(asset => ({ ...asset, resultSource })), photoRows })).not.toThrow();
});
test('机房不因照片阻止提交，未配置NO审批人明确阻断且不能跳到财务', () => {
  const saved = submit({ plans: plans.map(plan => ({ ...plan, range: '机房' })), photoRows: [{ asset: { assetTag: 'B' }, photos: { overall: {} }, reviewStatus: '待审核' }] });
  expect(replayDecisionBlockReason(project, saved, '徐博')).toMatch(/NO领导审批人未配置/);
  expect(() => decide('徐博')).toThrow('NO领导审批人未配置');
  expect(getReplaySubmission(project.projectNo).records[2].status).toBe('待流转');
});
test('非机房何文通过后才轮到徐博，全部通过逐计划已审核，刷新结果保留', () => {
  submit();
  expect(() => decide('徐博')).toThrow('仅当前节点');
  const first = decide('206984-何文', '同意', { opinion: '核实完成' });
  expect(first.status).toBe('审核中');
  expect(first.records[1].opinion).toBe('核实完成');
  expect(first.records[2].status).toBe('待审批');
  expect(() => decide('206984-何文')).toThrow('仅当前节点');
  decide('徐博');
  const reloaded = getReplaySubmission(project.projectNo);
  expect(reloaded.status).toBe('已审核');
  expect(applyReplayPlanStatuses(plans, reloaded).every(plan => plan.status === '已审核' && plan.approvalStatus === '已审核')).toBe(true);
  expect(() => decide('徐博')).toThrow('不在审批中');
});
test.each(['206984-何文', '徐博'])('%s驳回回盘点中，可重新提交并保留历史，重新从何文开始', operator => {
  submit();
  if (operator === '徐博') decide('206984-何文');
  const rejected = decide(operator, '驳回', { opinion: '请补核' });
  expect(rejected.plans.every(plan => plan.status === '盘点中' && plan.approvalStatus === '已驳回')).toBe(true);
  const resubmitted = submit({ plans: applyReplayPlanStatuses(plans, rejected) });
  expect(resubmitted.round).toBe(2);
  expect(resubmitted.records.some(record => record.opinion === '请补核')).toBe(true);
  expect(resubmitted.records.filter(record => record.status === '待审批')).toEqual([expect.objectContaining({ person: '206984-何文' })]);
});
test('二次提交、关闭审批、旧版本审批均不能改变已有结果', () => {
  submit();
  expect(() => submit()).toThrow('不能重复提交');
  expect(() => decide('206984-何文', '同意', { round: 0 })).toThrow('记录已变化');
  expect(() => decide('206984-何文', '同意', { project: { ...project, status: '盘点关闭' } })).toThrow('已关闭');
  expect(getReplaySubmission(project.projectNo).records[1].status).toBe('待审批');
});
