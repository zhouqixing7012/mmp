import { replayCloseBlockReason } from './inventoryCloseRules';

test('复盘关闭逐条核验计划，缺明细时不能按项目级状态放行', () => {
  expect(replayCloseBlockReason({ projectType: '复盘', approvalStatus: '已审核' })).toMatch(/缺少复盘计划/);
  expect(replayCloseBlockReason({ projectType: '复盘', replayPlans: [{ approvalStatus: '已审核' }, { approvalStatus: '待审核' }] })).toMatch(/所有复盘计划/);
  expect(replayCloseBlockReason({ projectType: '复盘', replayPlans: [{ approvalStatus: '已审核' }, { approvalStatus: '已审核' }] })).toBe('');
});
