import { buildDefaultInventoryPlans, nextInventoryPlanNumber } from './inventoryDefaultPlans';
const project = { projectNo: 'P', projectType: '初盘', startDate: '2026-10-10', endDate: '2026-10-15' };
const asset = { organization: 'A', ownerDept: 'D.末级', city: '北京', building: '楼A', floor: '1F', inventoryRange: '员工', quantity: 2 };
test('按子公司和范围分组，跨部门跨城市合并且数量按卡片数量汇总', () => {
  const assets = [asset, { ...asset, quantity: 3 }, { ...asset, organization: 'B' }, { ...asset, ownerDept: 'E.末级' }, { ...asset, city: '上海' }, { ...asset, inventoryRange: '公共' }];
  const plans = buildDefaultInventoryPlans(project, assets, [], '20261006');
  expect(plans).toHaveLength(3);
  expect(plans[0]).toMatchObject({ assetCount: 9, uncountedCount: 9, department: 'D、E', city: '北京、上海', planNo: 'PLAN-20261006-0001' });
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
  expect(plans[0]).toMatchObject({ organization: 'A', range: '机房', assetCount: 4, city: '北京、上海', department: 'D、E' });
  expect(plans[0].assets).toEqual(assets.slice(0, 2).map(item => ({ ...item, supervisor: '-', executor: '-' })));
  expect(plans.slice(1).map(plan => [plan.organization, plan.range])).toEqual([['B', '机房'], ['A', '员工']]);
});
test('三种计划编号使用创建日和流水号，删除中间计划后不重复编号', () => {
  const existing = [{ planNo: 'RCT-20261006-0003' }, { planNo: 'RCT-20261005-0009' }];
  expect(nextInventoryPlanNumber('复盘', existing, 0, '20261006')).toBe('RCT-20261006-0004');
  expect(nextInventoryPlanNumber('抽盘', [], 0, '20261006')).toBe('DCT-20261006-0001');
  const [plan] = buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [asset], existing, '20261006');
  expect(plan.endDate).toBe(project.endDate);
  expect(plan.financialSupervisor).toBe('徐博');
});


test('非机房复盘同一楼层跨子公司及范围汇总，日期覆盖项目期间', () => {
  const assets = [
    { ...asset, key: 'a' },
    { ...asset, key: 'b', organization: 'B', inventoryRange: '公共' },
    { ...asset, key: 'c', floor: '2F' },
  ];
  const plans = buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, assets, [], '20261023');
  expect(plans).toHaveLength(2);
  expect(plans[0]).toMatchObject({ organization: 'A、B', range: '员工、公共', ranges: ['员工', '公共'], building: '楼A', floor: '1F', assetCount: 4, startDate: project.startDate, endDate: project.endDate, financialSupervisor: '徐博' });
  expect(plans[0].assets.map(row => row.key)).toEqual(['a', 'b']);
  expect(plans[1].floor).toBe('2F');
});

test('相同楼层名跨城市或建筑物不合并', () => {
  const plans = buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [asset, { ...asset, building: '楼B' }, { ...asset, city: '上海' }], [], '20261023');
  expect(plans).toHaveLength(3);
  expect(new Set(plans.map(row => row.planName)).size).toBe(3);
});

test('复盘缺少楼层身份时阻止生成，不把未知地点合并', () => {
  expect(() => buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [{ ...asset, assetTag: 'A1', floor: '' }])).toThrow(/A1.*缺少完整/);
  expect(() => buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [{ ...asset, city: '-' }])).toThrow(/不能按楼层/);
});

test('机房复盘等待机房资料，不把Floor或NO位置冒充机房', () => {
  expect(() => buildDefaultInventoryPlans({ ...project, projectType: '复盘' }, [{ ...asset, inventoryRange: '机房', floor: 'B2', noLocation: '某机房' }])).toThrow(/机房标识及资产与机房的关联信息/);
});
