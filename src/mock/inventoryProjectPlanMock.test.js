import { PROJECT_PLAN_ROWS, PROJECT_PLAN_ASSETS } from './inventoryProjectPlanMock';
import { PROJECT_LIST_ROWS } from '../pages/assetInventory/projectListMockData';

test('默认复盘演示按真实楼层生成三个计划，计划与资产归属一致', () => {
  const no = 'RCP-202608180001';
  const project = PROJECT_LIST_ROWS.find(row => row.projectNo === no);
  const plans = PROJECT_PLAN_ROWS[no];
  const assets = PROJECT_PLAN_ASSETS[no];
  expect(plans).toHaveLength(3);
  expect(plans.map(plan => plan.floor).sort()).toEqual(['8F', '8层', '9层'].sort());
  plans.forEach(plan => {
    const included = assets.filter(asset => plan.assetKeys.includes(asset.key));
    expect(new Set(included.map(asset => [asset.city, asset.building, asset.floor].join('|'))).size).toBe(1);
    expect(included.every(asset => asset.planNo === plan.planNo && asset.planName === plan.planName && asset.executeInventory)).toBe(true);
    expect(plan).toMatchObject({ startDate: project.startDate, endDate: project.endDate, executor: '冯丽婷', financialSupervisor: '徐博' });
  });
  expect(plans.flatMap(plan => plan.assetKeys).sort()).toEqual(assets.filter(asset => asset.executeInventory).map(asset => asset.key).sort());
  expect(assets.find(asset => asset.key === 'asset-4').planNo).toBe('-');
});

test('初盘演示每条计划仅一种子公司及范围，未按部门或City额外拆分', () => {
  const no = 'CP-202608180001';
  const plans = PROJECT_PLAN_ROWS[no];
  const assets = PROJECT_PLAN_ASSETS[no];
  const groups = new Set();
  plans.forEach(plan => {
    const included = assets.filter(asset => plan.assetKeys.includes(asset.key));
    const dimensions = new Set(included.map(asset => `${asset.organization}|${asset.inventoryRange}`));
    expect(dimensions.size).toBe(1);
    const dimension = [...dimensions][0];
    expect(groups.has(dimension)).toBe(false);
    groups.add(dimension);
  });
});
