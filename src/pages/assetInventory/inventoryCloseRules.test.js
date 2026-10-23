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
