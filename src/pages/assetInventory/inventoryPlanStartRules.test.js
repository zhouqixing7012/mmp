import { planPersonnelBlockReason } from './inventoryPlanStartRules';

test('非机房逐资产校验监督人与执行人，系统机房初盘仅免监督人', () => {
  const plan = { planNo: 'P1', range: '员工' };
  expect(planPersonnelBlockReason(plan, [{ assetTag: 'A1', supervisor: '-', executor: '员工' }], { projectType: '初盘' })).toContain('盘点监督人');
  expect(planPersonnelBlockReason(plan, [{ assetTag: 'A1', supervisor: '监督人', executor: '-' }], { projectType: '初盘' })).toContain('盘点执行人');
  const room = { planNo: 'P2', range: '机房' };
  const system = { projectType: '初盘', generationSource: '系统生成' };
  expect(planPersonnelBlockReason(room, [{ assetTag: 'M1', supervisor: '-', executor: '员工' }], system)).toBe('');
  expect(planPersonnelBlockReason(room, [{ assetTag: 'M1', supervisor: '-', executor: '-' }], system)).toContain('盘点执行人');
});
