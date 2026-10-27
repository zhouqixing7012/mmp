import { inventoryProjectCloseBlockReason, replayCloseBlockReason } from './inventoryCloseRules';
const project = { projectNo: 'P', projectType: '复盘', status: '盘点中' };
const reviewOnly = (project, { plans, replaySubmission }) => replayCloseBlockReason({ ...project, replayPlans: plans }, replaySubmission);
const assets = [{ key: 'a', assetTag: 'A', executeInventory: true }];
const approved = { planNo: 'P1', assetKeys: ['a'], status: '已审核', approvalStatus: '已审核' };
test.each(['草稿', '快照生成', '生成盘点计划', '已审核'])('初盘及复盘%s不能关闭', status => {
  for (const projectType of ['初盘', '复盘']) expect(inventoryProjectCloseBlockReason({ ...project, status, projectType }, { plans: [], assets: [] })).toBe('还未开启盘点或已关闭');
});
test('已关闭、未结束数量和照片审核先拦截', () => {
 expect(inventoryProjectCloseBlockReason({ ...project, status: '盘点关闭' })).toMatch(/已关闭/);
 expect(inventoryProjectCloseBlockReason({ ...project, unfinishedReviewCount: 1 })).toMatch(/审核未结束数量/);
 expect(inventoryProjectCloseBlockReason(project, { photoRows: [{ reviewStatus: '待审核' }] })).toMatch(/待审核/);
});
test('复盘未分配资产、零计划及未通过计划阻止关闭', () => {
 expect(inventoryProjectCloseBlockReason(project, { plans: [], assets })).toMatch(/未创建计划/);
 expect(inventoryProjectCloseBlockReason(project, { plans: [{ ...approved, approvalStatus: '已驳回' }], assets })).toMatch(/未通过审批/);
 expect(inventoryProjectCloseBlockReason(project, { plans: [{ ...approved, status: '草稿', approvalStatus: undefined }], assets })).toMatch(/未通过审批/);
 expect(inventoryProjectCloseBlockReason(project, { plans: [] })).toMatch(/缺少/);
});
test('复盘全部资产已分配、计划均通过时允许关闭，未盘和待提交不单独阻止', () => {
 expect(inventoryProjectCloseBlockReason({ ...project, unscannedCount: 3, pendingSubmissionCount: 1 }, { plans: [approved], assets })).toBe('');
});
test('初盘启动后可关闭，不套用复盘计划审批条件；抽盘不新增类型条件', () => {
 expect(inventoryProjectCloseBlockReason({ ...project, projectType: '初盘' }, { plans: [] })).toBe('');
 expect(inventoryProjectCloseBlockReason({ ...project, projectType: '抽盘', status: '草稿' })).toBe('');
});

const planInstance = {planNo:'P1',key:'same-key',reviewInstanceKey:'old',status:'盘点中'};
const planReview = {scope:'plan',projectNo:'P',status:'审核中',plans:[planInstance],records:[{node:'提交计划审批',status:'已提交'}]};
const projectReview = {scope:'project',projectNo:'P',status:'审核中',plans:[planInstance],records:[{node:'提交项目审批',status:'已提交'}]};
const currentState = {version:2,projectNo:'P',status:'审核中',plans:[{...planInstance,status:'审核中'}],planReviews:{P1:planReview},projectReview};

test('schema2只匹配实际当前实例，新草稿/重建计划不被旧审核及聚合状态阻断',()=>{
 expect(reviewOnly(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:currentState})).toBe('');
 expect(reviewOnly(project,{plans:[{...planInstance,reviewInstanceKey:'new'}],replaySubmission:currentState})).toBe('');
 expect(reviewOnly(project,{plans:[{...planInstance,key:'new-key',approvalStatus:'审核中'}],replaySubmission:currentState})).toBe('');
 expect(reviewOnly(project,{plans:[],replaySubmission:currentState})).toBe('');
 expect(currentState.planReviews.P1.status).toBe('审核中');
});

test('当前实例计划审核中仍阻断关闭，另一项目同编号状态不干扰',()=>{
 expect(reviewOnly(project,{plans:[planInstance],replaySubmission:currentState})).toMatch(/未结束/);
 expect(reviewOnly({...project,projectNo:'OTHER'},{plans:[planInstance],replaySubmission:currentState})).toBe('');
});

test('项目审批仅绑定当时完整计划实例集合，增加/替换计划不继承项目审核阻断',()=>{
 const state={...currentState,planReviews:{},projectReview};
 expect(reviewOnly(project,{plans:[planInstance],replaySubmission:state})).toMatch(/未结束/);
 expect(reviewOnly(project,{plans:[{...planInstance,reviewInstanceKey:'new'}],replaySubmission:state})).toBe('');
 expect(reviewOnly(project,{plans:[planInstance,{...planInstance,planNo:'P2',key:'P2'}],replaySubmission:state})).toBe('');
 expect(reviewOnly(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:state})).toBe('');
});

test('无法明确迁移的legacy审核仍按原约束阻断，新实例不会删除历史',()=>{
 const state={...currentState,legacySubmission:{status:'审核中',records:[{status:'待审批'}]}};
 expect(reviewOnly(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:state})).toMatch(/历史.*未结束/);
 expect(state.legacySubmission.status).toBe('审核中');
});
