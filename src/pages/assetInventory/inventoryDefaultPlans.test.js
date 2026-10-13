import { buildDefaultInventoryPlans, nextInventoryPlanNumber } from './inventoryDefaultPlans';
const project = { projectNo: 'P', projectType: '初盘', startDate: '2026-10-10', endDate: '2026-10-15' };
const asset = { organization: 'A', ownerDept: 'D.末级', city: '北京', inventoryRange: '员工', quantity: 2 };
test('按子公司和范围分组，跨部门跨城市合并且数量按卡片条数汇总', () => {
  const assets = [asset, { ...asset, quantity: 3 }, { ...asset, organization: 'B' }, { ...asset, ownerDept: 'E.末级' }, { ...asset, city: '上海' }, { ...asset, inventoryRange: '公共' }];
  const plans = buildDefaultInventoryPlans(project, assets, [], '20261006');
  expect(plans).toHaveLength(3);
  expect(plans[0]).toMatchObject({ assetCount: 4, uncountedCount: 4, department: 'D、E', city: '北京、上海', planNo: 'PLAN-20261006-0001' });
  expect(plans[1].organization).toBe('B');
  expect(plans[2]).toMatchObject({ range: '公共', department: '虚拟组织' });
  expect(plans.flatMap(plan => plan.assets)).toHaveLength(6);
  expect(plans.every(plan => !Object.prototype.hasOwnProperty.call(plan, 'manager'))).toBe(true);
});

test('机房也跨部门城市合并，子公司或盘点范围不同仍分别生成', () => {
  const assets = [
    { ...asset, inventoryRange: '机房' },
    { ...asset, inventoryRange: '机房', ownerDept: 'E.末级', city: '上海' },
    { ...asset, inventoryRange: '机房', organization: 'B' },
    asset,
  ];
  const plans = buildDefaultInventoryPlans(project, assets, [], '20261006');
  expect(plans).toHaveLength(3);
  expect(plans[0]).toMatchObject({ organization: 'A', range: '机房', assetCount: 2, city: '北京、上海', department: 'D、E' });
  expect(plans[0].assets).toEqual(assets.slice(0, 2));
  expect(plans.slice(1).map(plan => [plan.organization, plan.range])).toEqual([['B', '机房'], ['A', '员工']]);
});
test('三种计划编号使用创建日和流水号，删除中间计划后不重复编号', () => {
  const existing = [{ planNo: 'RCT-20261006-0003' }, { planNo: 'RCT-20261005-0009' }];
  expect(nextInventoryPlanNumber('复盘', existing, 0, '20261006')).toBe('RCT-20261006-0004');
  expect(nextInventoryPlanNumber('抽盘', [], 0, '20261006')).toBe('DCT-20261006-0001');
  const [plan] = buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [asset], existing, '20261006');
  expect(plan.endDate).toBe(plan.startDate);
  expect(plan.financialSupervisor).toBe('徐博');
});
