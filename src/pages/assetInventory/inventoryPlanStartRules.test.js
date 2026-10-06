import { planPersonnelBlockReason } from './inventoryPlanStartRules';

test('各盘点范围监督人均非必填，逐资产校验执行人', () => {
  const plan = { planNo: 'P1', range: '员工' };
  expect(planPersonnelBlockReason(plan, [{ assetTag: 'A1', supervisor: '-', executor: '员工' }], { projectType: '初盘' })).toBe('');
  ['库房', '公共'].forEach((range) => {
    expect(planPersonnelBlockReason({ ...plan, range }, [{ assetTag: 'A1', executor: '员工' }])).toBe('');
  });
  expect(planPersonnelBlockReason(plan, [{ assetTag: 'A1', supervisor: '监督人', executor: '-' }], { projectType: '初盘' })).toContain('盘点执行人');
  const room = { planNo: 'P2', range: '机房' };
  const system = { projectType: '初盘', generationSource: '系统生成' };
  expect(planPersonnelBlockReason(room, [{ assetTag: 'M1', supervisor: '-', executor: '员工' }], system)).toBe('');
  expect(planPersonnelBlockReason(room, [{ assetTag: 'M1', supervisor: '-', executor: '-' }], system)).toContain('盘点执行人');
});

test('多项资产不会因首项执行人已配置而漏过其他资产缺失', () => {
  expect(planPersonnelBlockReason({ planNo: 'P1' }, [{ assetTag: 'A1', executor: '员工' }, { assetTag: 'A2', executor: '  ' }])).toContain('资产 A2');
  expect(planPersonnelBlockReason({ planNo: 'P1' }, [])).toContain('没有分配资产');
});
