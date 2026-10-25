import { inventoryProjectCloseBlockReason, replayCloseBlockReason } from './inventoryCloseRules';
const project = { projectNo: 'P', projectType: '复盘', status: '草稿' };
test('零计划、草稿和未启动计划在没有未结束审核时允许关闭', () => {
  expect(inventoryProjectCloseBlockReason(project, { plans: [], photoRows: [], locationRequests: [] })).toBe('');
  expect(inventoryProjectCloseBlockReason(project, { plans: [{ status: '草稿' }], photoRows: [] })).toBe('');
  expect(replayCloseBlockReason(project)).toBe('');
});
test('关闭不要求盘点完成或全部通过，审核驳回已经结束可关闭', () => {
  expect(inventoryProjectCloseBlockReason({ ...project, unscannedCount: 5, pendingSubmissionCount: 3 }, { plans: [{ status: '盘点中', approvalStatus: '已驳回' }], photoRows: [{ reviewStatus: '审核不通过' }], locationRequests: [{ status: '已驳回' }] })).toBe('');
});
test('照片或复盘有未结束审核时阻止关闭，旧位置审批不再阻断', () => {
  expect(inventoryProjectCloseBlockReason(project, { photoRows: [{ asset: { assetTag: 'A' }, reviewStatus: '待审核' }] })).toMatch(/A.*待审核/);
  expect(inventoryProjectCloseBlockReason(project, { plans: [{ status: '审核中' }] })).toMatch(/未结束/);
  expect(inventoryProjectCloseBlockReason(project, { replaySubmission: { status: '审核中', plans: [] } })).toMatch(/复盘.*审核中/);
  expect(inventoryProjectCloseBlockReason(project, { locationRequests: [{ requestNo: 'LC1', status: '待审批' }] })).toBe('');
});

test('两级复盘审核任一进行中阻止关闭，未提交或驳回不要求重新通过', () => {
  expect(inventoryProjectCloseBlockReason(project, { replaySubmission: { status: '未提交', planReviews: { P1: { status: '审核中' } } } })).toMatch(/未结束/);
  expect(inventoryProjectCloseBlockReason(project, { replaySubmission: { status: '未提交', projectReview: { status: '审核中' } } })).toMatch(/未结束/);
  expect(inventoryProjectCloseBlockReason(project, { replaySubmission: { status: '未提交', planReviews: { P1: { status: '已驳回' } }, projectReview: null } })).toBe('');
  expect(inventoryProjectCloseBlockReason(project, { replaySubmission: { status: '未提交', legacySubmission: { status: '审核中' } } })).toMatch(/未结束/);
});
test('已关闭项目拒绝重复关闭；系统机房初盘也按相同手动条件判断', () => {
  expect(inventoryProjectCloseBlockReason({ ...project, status: '盘点关闭' })).toMatch(/已关闭/);
  expect(inventoryProjectCloseBlockReason({ ...project, generationSource: '系统生成', projectType: '初盘', scopeRanges: ['机房'] }, { plans: [] })).toBe('');
});


const planInstance = {planNo:'P1',key:'same-key',reviewInstanceKey:'old',status:'盘点中'};
const planReview = {scope:'plan',projectNo:'P',status:'审核中',plans:[planInstance],records:[{node:'提交计划审批',status:'已提交'}]};
const projectReview = {scope:'project',projectNo:'P',status:'审核中',plans:[planInstance],records:[{node:'提交项目审批',status:'已提交'}]};
const currentState = {version:2,projectNo:'P',status:'审核中',plans:[{...planInstance,status:'审核中'}],planReviews:{P1:planReview},projectReview};

test('schema2只匹配实际当前实例，新草稿/重建计划不被旧审核及聚合状态阻断',()=>{
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:currentState})).toBe('');
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,reviewInstanceKey:'new'}],replaySubmission:currentState})).toBe('');
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,key:'new-key',approvalStatus:'审核中'}],replaySubmission:currentState})).toBe('');
 expect(inventoryProjectCloseBlockReason(project,{plans:[],replaySubmission:currentState})).toBe('');
 expect(currentState.planReviews.P1.status).toBe('审核中');
});

test('当前实例计划审核中仍阻断关闭，另一项目同编号状态不干扰',()=>{
 expect(inventoryProjectCloseBlockReason(project,{plans:[planInstance],replaySubmission:currentState})).toMatch(/未结束/);
 expect(inventoryProjectCloseBlockReason({...project,projectNo:'OTHER'},{plans:[planInstance],replaySubmission:currentState})).toBe('');
});

test('项目审批仅绑定当时完整计划实例集合，增加/替换计划不继承项目审核阻断',()=>{
 const state={...currentState,planReviews:{},projectReview};
 expect(inventoryProjectCloseBlockReason(project,{plans:[planInstance],replaySubmission:state})).toMatch(/未结束/);
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,reviewInstanceKey:'new'}],replaySubmission:state})).toBe('');
 expect(inventoryProjectCloseBlockReason(project,{plans:[planInstance,{...planInstance,planNo:'P2',key:'P2'}],replaySubmission:state})).toBe('');
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:state})).toBe('');
});

test('无法明确迁移的legacy审核仍按原约束阻断，新实例不会删除历史',()=>{
 const state={...currentState,legacySubmission:{status:'审核中',records:[{status:'待审批'}]}};
 expect(inventoryProjectCloseBlockReason(project,{plans:[{...planInstance,status:'草稿'}],replaySubmission:state})).toMatch(/历史.*未结束/);
 expect(state.legacySubmission.status).toBe('审核中');
});
