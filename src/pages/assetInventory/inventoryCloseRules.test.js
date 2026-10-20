import { replayCloseBlockReason } from './inventoryCloseRules';

test('复盘关闭逐条核验计划，缺明细时不能按项目级状态放行', () => {
  expect(replayCloseBlockReason({ projectType: '复盘', approvalStatus: '已审核' })).toMatch(/缺少复盘计划/);
  expect(replayCloseBlockReason({ projectType: '复盘', replayPlans: [{ approvalStatus: '已审核' }, { approvalStatus: '待审核' }] })).toMatch(/所有复盘计划/);
  expect(replayCloseBlockReason({ projectType: '复盘', replayPlans: [{ approvalStatus: '已审核' }, { approvalStatus: '已审核' }] })).toBe('');
});

const { inventoryProjectCloseBlockReason } = require('./inventoryCloseRules');
const context = { plans: [{ planNo: 'P1', status: '盘点中' }], photoRows: [], locationRequests: [] };
test('关闭按实际计划及照片记录校验，不采信预存数量', () => {
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘', unstartedPlanCount: 0 }, { ...context, plans: [{ planNo: 'P2', status: '草稿' }] })).toMatch(/P2.*未启动/);
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘' }, { ...context, photoRows: [{ asset: { assetTag: 'A' }, reviewStatus: '待审核' }] })).toMatch(/A.*待审核/);
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘' }, { ...context, photoRows: [{ asset: { assetTag: 'B' }, reviewStatus: '审核不通过' }] })).toMatch(/B.*不通过/);
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘' }, context)).toBe('');
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘' }, {})).toMatch(/缺少.*计划/);
  expect(inventoryProjectCloseBlockReason({ projectType: '初盘' }, { ...context, plans: [{}] })).toMatch(/状态不完整/);
});
test('复盘全部审核通过仍须等位置变更审批完成，未盘数量不构成拦截', () => {
  const project = { projectType: '复盘', unscannedCount: 5, replayPlans: [{ approvalStatus: '已审核' }] };
  expect(inventoryProjectCloseBlockReason(project, { ...context, locationRequests: [{ requestNo: 'LC1', status: '待审批' }] })).toMatch(/LC1.*审批中/);
  expect(inventoryProjectCloseBlockReason(project, context)).toBe('');
});
