import { buildDefaultInventoryPlans, nextInventoryPlanNumber } from './inventoryDefaultPlans';
const project = { projectNo: 'P', projectType: '初盘', startDate: '2026-10-10', endDate: '2026-10-15' };
const asset = { organization: 'A', ownerDept: 'D.末级', city: '北京', inventoryRange: '员工', quantity: 2 };
test('按公司一级部门城市范围拆分，数量按资产数量汇总', () => {
  const assets = [asset, { ...asset, quantity: 3 }, { ...asset, organization: 'B' }, { ...asset, ownerDept: 'E.末级' }, { ...asset, city: '上海' }, { ...asset, inventoryRange: '公共' }];
  const plans = buildDefaultInventoryPlans(project, assets, [], '20261006');
  expect(plans).toHaveLength(5);
  expect(plans[0]).toMatchObject({ assetCount: 5, uncountedCount: 5, department: 'D', planNo: 'PLAN-20261006-0001' });
  expect(plans[4].department).toBe('虚拟组织');
  expect(plans.flatMap(plan => plan.assets)).toHaveLength(6);
});
test('三种计划编号使用创建日和流水号，删除中间计划后不重复编号', () => {
  const existing = [{ planNo: 'RCT-20261006-0003' }, { planNo: 'RCT-20261005-0009' }];
  expect(nextInventoryPlanNumber('复盘', existing, 0, '20261006')).toBe('RCT-20261006-0004');
  expect(nextInventoryPlanNumber('抽盘', [], 0, '20261006')).toBe('DCT-20261006-0001');
  const [plan] = buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [asset], existing, '20261006');
  expect(plan.endDate).toBe(plan.startDate);
  expect(plan.financialSupervisor).toBe('徐博');
});
