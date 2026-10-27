import { inventoryProjectCloseBlockReason } from './inventoryCloseRules';
import { applyReplayPlanStatuses, decideReplayReview, getReplaySubmission, getReplayProjectReview, replayDecisionBlockReason, replayProjectSubmissionBlockReason, submitReplayProjectReview, submitReplayReview, validateReplaySubmission } from './inventoryReplayReviewStore';
import { writeDemoData } from '../../services/demoStorage';
const project = { creator: '冯丽婷', projectNo: 'R-test', projectType: '复盘', samplingMode: '百分比', samplingRatio: 50 };
const plans = [{ planNo: 'P1', range: '员工', status: '盘点中' }, { planNo: 'P2', range: '机房', status: '盘点中' }];
const assetsForPlan = plan => [{ quantity: 1, assetTag: plan.planNo === 'P1' ? 'A' : 'B', inventoryStatus: plan.planNo === 'P1' ? '已盘' : '未盘', supervisor: plan.planNo === 'P1' ? '冯丽婷' : '徐博', executor: '冯丽婷' }];
const submit = (planNo = 'P1', overrides = {}) => submitReplayReview({ project, plans: plans.filter(plan => plan.planNo === planNo), assetsForPlan, operator: '冯丽婷', ...overrides });
const decide = (planNo, operator, decision = '同意', overrides = {}) => decideReplayReview({ project, operator, decision, opinion: decision === '驳回' ? '请复核' : '', planNo, round: getReplaySubmission(project.projectNo).planReviews[planNo].round, planKey: getReplaySubmission(project.projectNo).planReviews[planNo].plans[0].key, reviewInstanceKey: getReplaySubmission(project.projectNo).planReviews[planNo].plans[0].reviewInstanceKey, ...overrides });
const submitProject = () => submitReplayProjectReview({ project, plans, operator: '冯丽婷' });
const approveAllPlans = () => { submit(); decide('P1', '冯丽婷'); submit('P2'); decide('P2', '徐博'); };
beforeEach(() => window.localStorage.clear());
test('每次仅提交一个盘点中计划，监督人从实际资产读取，机房也不生成ES或NO节点', () => {
  expect(() => submit('P1', { plans })).toThrow('每次只能提交一个');
  expect(() => submit('P1', { plans: [{ ...plans[0], status: '草稿' }] })).toThrow('不是盘点中');
  const state = submit('P2');
  expect(state.planReviews.P2.records).toEqual([expect.objectContaining({ node: '提交计划审批' }), expect.objectContaining({ node: '计划监督人审批', person: '徐博', status: '待审批' })]);
  expect(state.projectReview).toBeNull();
});
test('缺少资产监督人不能提交，不用配置汇总或固定何文替代', () => {
  expect(() => submit('P1', { assetsForPlan: () => [{ quantity: 1, assetTag: 'A', supervisor: '-' }] })).toThrow('未配置监督人');
  expect(() => submit('P1', { assetsForPlan: () => [] })).toThrow('没有资产');
});
test('完成比例及必盘未完成都不限制提交，也不要求低比例二次确认', () => {
  expect(validateReplaySubmission(project, [plans[1]], assetsForPlan)).toEqual([]);
  const uncounted = () => [{ quantity: 1, assetTag: 'B', inventoryStatus: '未盘', isMandatory: true, supervisor: '徐博' }];
  expect(validateReplaySubmission(project, [plans[1]], uncounted)).toEqual([]);
  expect(submit('P2', { assetsForPlan: uncounted }).planReviews.P2.status).toBe('审核中');
});
test.each(['待审核', '审核不通过'])('已提交照片%s阻止所属计划，未提交照片不阻止', reviewStatus => {
  const photoRows = [{ asset: { quantity: 1, assetTag: 'A' }, photos: { overall: { id: 'photo' } }, reviewStatus }];
  expect(() => submit('P1', { photoRows })).toThrow('P1 资产 A');
  expect(() => submit('P1', { photoRows: [{ ...photoRows[0], photos: {} }] })).not.toThrow();
});
test.each(['扫码枪', '人工导入'])('%s无需人工照片审核', resultSource => {
  expect(() => submit('P1', { assetsForPlan: plan => assetsForPlan(plan).map(asset => ({ ...asset, resultSource })), photoRows: [{ asset: { quantity: 1, assetTag: 'A' }, photos: { overall: {} }, reviewStatus: '待审核' }] })).not.toThrow();
});
test('各计划独立审核，通过只清本计划执行人的演示待办，刷新保留且禁止重复审批', () => {
  submit(); submit('P2');
  expect(() => decide('P1', '徐博')).toThrow('仅当前待审批人');
  decide('P1', '冯丽婷', '同意', { opinion: '计划核对完成' });
  const state = getReplaySubmission(project.projectNo);
  expect(state.planReviews.P1.status).toBe('已审核');
  expect(state.planReviews.P2.status).toBe('审核中');
  expect(state.todoLifecycle).toEqual([expect.objectContaining({ planNo: 'P1', person: '冯丽婷', status: '演示已清除', serviceStatus: '正式服务未接入' })]);
  expect(() => decide('P1', '冯丽婷')).toThrow('不在审批中');
  expect(getReplaySubmission(project.projectNo).todoLifecycle).toHaveLength(1);
  expect(applyReplayPlanStatuses(plans, state).map(plan => plan.status)).toEqual(['已审核', '审核中']);
});
test('计划驳回恢复盘点中，不清待办；重提保留意见并提高轮次', () => {
  submit();
  decide('P1', '冯丽婷', '驳回', { opinion: '重新核实' });
  const rejected = getReplaySubmission(project.projectNo);
  expect(rejected.planReviews.P1.plans[0].status).toBe('盘点中');
  expect(rejected.todoLifecycle).toEqual([]);
  submit();
  const state = getReplaySubmission(project.projectNo);
  expect(state.planReviews.P1.round).toBe(2);
  expect(state.planReviews.P1.records.some(record => record.opinion === '重新核实')).toBe(true);
  expect(() => decide('P1', '冯丽婷', '同意', { round: 1 })).toThrow('记录已变化');
});
test('全部计划通过后才可项目提交，项目审批仅徐博，保留各计划及清除记录', () => {
  submit();
  expect(() => submitProject()).toThrow('全部复盘计划');
  decide('P1', '冯丽婷');
  expect(replayProjectSubmissionBlockReason(project, plans, getReplaySubmission(project.projectNo))).toContain('全部复盘计划');
  submit('P2'); decide('P2', '徐博');
  const submitted = submitProject();
  expect(submitted.projectReview.records.filter(record => record.status === '待审批')).toEqual([expect.objectContaining({ person: '徐博', node: '财务经理审批' })]);
  expect(() => submitProject()).toThrow('不能重复提交');
  expect(replayDecisionBlockReason(project, submitted.projectReview, '冯丽婷')).toContain('仅当前待审批人');
  decideReplayReview({ project, operator: '徐博', scope: 'project', round: 1, decision: '同意' });
  const completed = getReplaySubmission(project.projectNo);
  expect(completed.projectReview.status).toBe('已审核');
  expect(completed.todoLifecycle).toHaveLength(2);
  expect(completed.plans.every(plan => plan.status === '已审核')).toBe(true);
});
test('项目驳回恢复计划修改，计划重新通过后重提项目并保留历史', () => {
  approveAllPlans(); submitProject();
  decideReplayReview({ project, operator: '徐博', scope: 'project', round: 1, decision: '驳回', opinion: '补充项目说明' });
  expect(getReplaySubmission(project.projectNo).plans.every(plan => plan.status === '盘点中')).toBe(true);
  expect(() => submitProject()).toThrow('全部复盘计划');
  approveAllPlans();
  const state = submitProject();
  expect(state.projectReview.round).toBe(2);
  expect(state.projectReview.records.some(record => record.opinion === '补充项目说明')).toBe(true);
  expect(state.todoLifecycle).toHaveLength(4);
});
test('重复提交、关闭后的提交审批都不能改变已有结果', () => {
  submit();
  expect(() => submit()).toThrow('不能重复提交');
  expect(() => decide('P1', '冯丽婷', '同意', { project: { ...project, status: '盘点关闭' } })).toThrow('已关闭');
  expect(() => submit('P2', { project: { ...project, status: '盘点关闭' } })).toThrow('已关闭');
  expect(getReplaySubmission(project.projectNo).planReviews.P1.status).toBe('审核中');
});
test('旧ES和NO链保留为历史，不冒充新两级审批通过', () => {
  const legacy = { status: '已审核', records: [{ node: 'ES主管审批', person: '何文', status: '已通过' }] };
  writeDemoData('inventory-replay-review-R-test', legacy);
  const state = getReplaySubmission(project.projectNo);
  expect(state.legacySubmission).toEqual(legacy);
  expect(state.planReviews).toEqual({});
  expect(() => submitProject()).toThrow('全部复盘计划');
});

test('同一计划各监督人会签，全部同意才通过并清除待办，部分通过不可提交项目',()=>{
 const multiple=plan=>[...assetsForPlan(plan),{quantity:1,assetTag:'C',inventoryStatus:'已盘',supervisor:'徐博',executor:'徐博'}];
 submit('P1',{assetsForPlan:multiple});
 decide('P1','冯丽婷');
 let state=getReplaySubmission(project.projectNo);
 expect(state.planReviews.P1.status).toBe('审核中');
 expect(state.todoLifecycle).toEqual([]);
 expect(()=>submitReplayProjectReview({project,plans:[plans[0]],operator:'冯丽婷'})).toThrow('全部复盘计划');
 expect(()=>decide('P1','冯丽婷')).toThrow('仅当前待审批人');
 decide('P1','徐博');
 state=getReplaySubmission(project.projectNo);
 expect(state.planReviews.P1.status).toBe('已审核');
 expect(state.todoLifecycle.map(event=>event.person)).toEqual(['冯丽婷','徐博']);
 expect(submitReplayProjectReview({project,plans:[plans[0]],operator:'冯丽婷'}).projectReview.status).toBe('审核中');
});

test('会签任一监督人驳回即计划驳回，重提后全体监督人重新审核',()=>{
 const multiple=plan=>[...assetsForPlan(plan),{quantity:1,assetTag:'C',inventoryStatus:'已盘',supervisor:'徐博',executor:'徐博'}];
 submit('P1',{assetsForPlan:multiple});
 decide('P1','冯丽婷');
 decide('P1','徐博','驳回');
 expect(getReplaySubmission(project.projectNo).todoLifecycle).toEqual([]);
 submit('P1',{assetsForPlan:multiple});
 expect(getReplaySubmission(project.projectNo).planReviews.P1.records.filter(record=>record.status==='待审批').map(record=>record.person)).toEqual(['冯丽婷','徐博']);
});

test('同编号不同实例和新草稿不继承历史审批，原历史保留',()=>{
 const original={...plans[0],key:'old-key'};
 submit('P1',{plans:[original]});
 const state=getReplaySubmission(project.projectNo);
 expect(applyReplayPlanStatuses([{...original,key:'new-key',status:'草稿'}],state)[0].status).toBe('草稿');
 expect(applyReplayPlanStatuses([{...original,status:'草稿'}],state)[0].status).toBe('草稿');
 expect(applyReplayPlanStatuses([{...original,key:'new-key'}],state)[0].status).toBe('盘点中');
 const next=submit('P1',{plans:[{...original,key:'new-key'}]});
 expect(next.planReviewHistory[0].plans[0].key).toBe('old-key');
 expect(next.planReviewHistory[0].status).toBe('审核中');
 expect(next.planReviews.P1.plans[0].key).toBe('new-key');
});

test('明确提交的同一实例刷新仍保留审核中；不同项目绑定绝不覆盖',()=>{
 const original={...plans[0],key:'same-key'};
 submit('P1',{plans:[original]});
 const state=getReplaySubmission(project.projectNo);
 expect(applyReplayPlanStatuses([original],state)[0].status).toBe('审核中');
 expect(applyReplayPlanStatuses([original],state,'OTHER')[0].status).toBe('盘点中');
 writeDemoData('inventory-replay-review-OTHER',state);
 const other=getReplaySubmission('OTHER');
 expect(other.planReviews).toEqual({});
 expect(other.legacySubmission.projectNo).toBe(project.projectNo);
});

test('默认计划重建复用编号和key时，以启动实例标记隔离审批，旧窗口不能批准新实例',()=>{
 const original={...plans[0],key:'generated-same',reviewInstanceKey:'instance-old'};
 submit('P1',{plans:[original]});
 const recreated={...original,status:'盘点中',reviewInstanceKey:'instance-new'};
 expect(applyReplayPlanStatuses([recreated],getReplaySubmission(project.projectNo))[0].status).toBe('盘点中');
 submit('P1',{plans:[recreated]});
 expect(()=>decideReplayReview({project,operator:'冯丽婷',decision:'同意',planNo:'P1',planKey:'generated-same',reviewInstanceKey:'instance-old',round:1})).toThrow('计划实例已变化');
 expect(getReplaySubmission(project.projectNo).planReviewHistory[0].plans[0].reviewInstanceKey).toBe('instance-old');
});

test('项目审批匹配当时同批实例；新批次通过计划后可明确提交新项目审批，旧记录归历史',()=>{
 approveAllPlans();
 const original=submitProject();
 expect(getReplayProjectReview(original,plans,project.projectNo)?.status).toBe('审核中');
 const replaced=plans.map(plan=>({...plan,key:'new-'+plan.planNo,reviewInstanceKey:'new-'+plan.planNo}));
 expect(getReplayProjectReview(original,replaced,project.projectNo)).toBeNull();
 expect(getReplayProjectReview(original,[...plans,{planNo:'P3',status:'盘点中'}],project.projectNo)).toBeNull();
 replaced.forEach(plan=>{
   submitReplayReview({project,plans:[plan],assetsForPlan,operator:'冯丽婷'});
   const review=getReplaySubmission(project.projectNo).planReviews[plan.planNo];
   decideReplayReview({project,planNo:plan.planNo,planKey:plan.key,reviewInstanceKey:plan.reviewInstanceKey,round:review.round,operator:assetsForPlan(plan)[0].supervisor,decision:'同意'});
 });
 const state=getReplaySubmission(project.projectNo);
 expect(replayProjectSubmissionBlockReason(project,replaced,{...state,projectReview:original.projectReview})).toBe('');
 const next=submitReplayProjectReview({project,plans:replaced,operator:'冯丽婷'});
 expect(next.projectReviewHistory[0]).toEqual(original.projectReview);
 expect(next.projectReview.plans[0].reviewInstanceKey).toBe('new-P1');
 expect(()=>decideReplayReview({project,scope:'project',plans,operator:'徐博',decision:'同意',round:next.projectReview.round})).toThrow('计划实例已变化');
});


test('审批同意意见可空，驳回意见必填，意见最多400字', () => {
  submit();
  expect(() => decide('P1', '冯丽婷', '驳回', { opinion: '   ' })).toThrow('请填写驳回意见');
  expect(() => decide('P1', '冯丽婷', '同意', { opinion: '字'.repeat(401) })).toThrow('审批意见不能超过400字');
  expect(() => decide('P1', '冯丽婷', '同意', { opinion: '' })).not.toThrow();
});


test('项目审批通过后项目保持盘点中，审批记录已审核且满足条件可关闭', () => {
  const started = { ...project, status: '盘点中' };
  approveAllPlans();
  submitReplayProjectReview({ project: started, plans, operator: '冯丽婷' });
  expect(started.status).toBe('盘点中');
  expect(inventoryProjectCloseBlockReason(started, { plans: applyReplayPlanStatuses(plans, getReplaySubmission(project.projectNo)), assets: plans.flatMap(plan => assetsForPlan(plan).map(asset => ({ ...asset, planNo: plan.planNo }))), replaySubmission: getReplaySubmission(project.projectNo) })).toMatch(/未结束/);
  const state = decideReplayReview({ project: started, operator: '徐博', scope: 'project', round: 1, decision: '同意' });
  expect(state.projectReview.status).toBe('已审核');
  expect(started.status).toBe('盘点中');
  expect(inventoryProjectCloseBlockReason(started, { plans: applyReplayPlanStatuses(plans, state), assets: plans.flatMap(plan => assetsForPlan(plan).map(asset => ({ ...asset, planNo: plan.planNo }))), replaySubmission: state })).toBe('');
});
