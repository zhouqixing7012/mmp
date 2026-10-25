import { ASSET_ROWS, INITIAL_PLAN_ROWS } from '../pages/assetInventory/mockData';
import { INVENTORY_MOBILE_ASSETS } from './inventoryMobileMock';
import { buildDefaultInventoryPlans } from '../pages/assetInventory/inventoryDefaultPlans';
import { PROJECT_LIST_ROWS } from '../pages/assetInventory/projectListMockData';
import { createNonRoomReplayDemoAssets, createNonRoomReplayDemoPlans, NON_ROOM_REPLAY_DEMO_PROJECT, NON_ROOM_REPLAY_DEMO_PHOTO_CONFIG } from './inventoryNonRoomReplayDemo';

const nonRoomReplayDemoAssets = createNonRoomReplayDemoAssets(ASSET_ROWS);
// 与计划数据使用同一资产集合，供初盘关联时取得执行范围及图片规则。
export const PROJECT_PLAN_SNAPSHOTS = {
  [NON_ROOM_REPLAY_DEMO_PROJECT.projectNo]: { assets: nonRoomReplayDemoAssets, config: NON_ROOM_REPLAY_DEMO_PHOTO_CONFIG },
};

// 仅为已有演示项目建立明确计划归属，不把未分配或其他项目资产补进进度。
const warehouseSource = INVENTORY_MOBILE_ASSETS.find(asset => asset.tagNo === '1141300083-P');
const [city, building, floor] = warehouseSource.address.split('-');
const warehouseAsset = {
  key: warehouseSource.id, assetTag: warehouseSource.tagNo, serialNo: warehouseSource.serialNo,
  description: warehouseSource.assetDesc, quantity: warehouseSource.quantity,
  inventoryRange: warehouseSource.area, inventoryStatus: warehouseSource.status,
  counter: warehouseSource.inventoryBy, inventoryDate: warehouseSource.inventoryDate,
  owner: warehouseSource.owner, ownerDept: '虚拟组织', currentOwner: warehouseSource.owner,
  currentOwnerDept: '虚拟组织', useStatus: warehouseSource.usageStatus,
  subCategory: warehouseSource.category, organization: warehouseSource.company,
  city, building, floor, needPhoto: warehouseSource.photoRequired, executeInventory: true,
  supervisor: '孙志强', executor: warehouseSource.owner, inventoryNote: warehouseSource.inventoryNote,
  useDescription: warehouseSource.usageNote, remark: warehouseSource.remark,
};
const employeeAsset = ASSET_ROWS.find(asset => asset.key === 'asset-3');
const publicAsset = ASSET_ROWS.find(asset => asset.key === 'asset-4');
const employeePlan = INITIAL_PLAN_ROWS.find(plan => plan.range === '员工');
const publicPlan = INITIAL_PLAN_ROWS.find(plan => plan.range === '公共');
const machinePlan = INITIAL_PLAN_ROWS.find(plan => plan.range === '机房');

const nonRoomPlans = (status) => [
  { ...employeePlan, status, assetKeys: [employeeAsset.key] },
  { ...publicPlan, status, assetKeys: [publicAsset.key] },
  {
    key: 'plan-warehouse', planNo: 'PLAN-20260818-0004', planName: '北京市库房盘点计划',
    status, organization: warehouseSource.company, city, range: '库房',
    startDate: '2026-08-18', endDate: '2026-08-31',
    supervisor: '孙志强', executor: warehouseSource.owner, assetKeys: [warehouseAsset.key],
  },
];
const nonRoomAssets = [
  { ...employeeAsset },
  { ...publicAsset, executeInventory: true, supervisor: publicPlan.supervisor, executor: publicPlan.executor },
  warehouseAsset,
];

// 复盘沿用已有移动演示计划的四条员工资产，明确关联财务执行计划。
const replayEmployeeAssets = INVENTORY_MOBILE_ASSETS.filter(asset => ['asset-001', 'asset-002', 'asset-003', 'asset-004'].includes(asset.id)).map(asset => {
  const [assetCity, assetBuilding, assetFloor] = asset.address.split('-');
  return {
    key: asset.id, assetTag: asset.tagNo, serialNo: asset.serialNo, description: asset.assetDesc,
    quantity: asset.quantity, inventoryRange: asset.area, inventoryStatus: asset.status,
    counter: asset.inventoryBy, inventoryDate: asset.inventoryDate, inventoryNote: asset.inventoryNote,
    inventoryRemark: asset.inventoryRemark, lossReason: asset.lossReason,
    owner: asset.owner, currentOwner: asset.owner, useStatus: asset.usageStatus,
    subCategory: asset.category, organization: asset.company,
    city: assetCity, building: assetBuilding, floor: assetFloor,
    needPhoto: asset.photoRequired, executeInventory: true, executor: '冯丽婷',
    useDescription: asset.usageNote, remark: asset.remark,
  };
});

// 静态复盘样例与真实默认生成共用楼层分组，仅影响没有已保存会话的演示初值。
const replayProject = PROJECT_LIST_ROWS.find(project => project.projectNo === 'RCP-202608180001');
const replayAssets = [...ASSET_ROWS.filter(asset => ['asset-3', 'asset-4'].includes(asset.key)), ...replayEmployeeAssets]
  .map(asset => asset.executeInventory ? { ...asset, supervisor: '冯丽婷', executor: '冯丽婷' } : { ...asset });
const replayPlans = buildDefaultInventoryPlans(replayProject, replayAssets.filter(asset => asset.executeInventory), [], '20260818')
  .map(plan => ({ ...plan, supervisor: '冯丽婷', executor: '冯丽婷', assetKeys: plan.assets.map(asset => asset.key) }));
const linkedReplayAssets = replayAssets.map(asset => {
  const plan = replayPlans.find(row => row.assetKeys.includes(asset.key));
  return { ...asset, planNo: plan?.planNo || '-', planName: plan?.planName || '-' };
});
const linkedReplayPlans = replayPlans.map(plan => ({ ...plan, assets: linkedReplayAssets.filter(asset => plan.assetKeys.includes(asset.key)) }));

export const PROJECT_PLAN_ROWS = {
  [NON_ROOM_REPLAY_DEMO_PROJECT.projectNo]: createNonRoomReplayDemoPlans(nonRoomReplayDemoAssets),
  'CP-202607010001': [{ ...machinePlan, status: '关闭', assetKeys: ['asset-1', 'asset-2'] }],
  'CP-202608180001': nonRoomPlans('关闭'),
  'DCP-202608180001': nonRoomPlans('盘点中'),
  'RCP-202608180001': linkedReplayPlans,
};

export const PROJECT_PLAN_ASSETS = {
  [NON_ROOM_REPLAY_DEMO_PROJECT.projectNo]: nonRoomReplayDemoAssets,
  'CP-202607010001': ASSET_ROWS.filter(asset => ['asset-1', 'asset-2'].includes(asset.key)),
  'CP-202608180001': nonRoomAssets,
  'DCP-202608180001': nonRoomAssets.map(asset => ({ ...asset })),
  'RCP-202608180001': linkedReplayAssets,
};
