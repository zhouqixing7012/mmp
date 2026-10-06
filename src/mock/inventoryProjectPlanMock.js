import { ASSET_ROWS, INITIAL_PLAN_ROWS } from '../pages/assetInventory/mockData';
import { INVENTORY_MOBILE_ASSETS } from './inventoryMobileMock';

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
    startDate: '2026-08-18', endDate: '2026-08-31', manager: '杨芊',
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

export const PROJECT_PLAN_ROWS = {
  'CP-202607010001': [{ ...machinePlan, status: '关闭', assetKeys: ['asset-1', 'asset-2'] }],
  'CP-202608180001': nonRoomPlans('关闭'),
  'DCP-202608180001': nonRoomPlans('盘点中'),
  'RCP-202608180001': [{ ...employeePlan, status: '草稿', executor: '冯丽婷', financialSupervisor: '徐博', endDate: employeePlan.startDate, assetKeys: ['asset-3', ...replayEmployeeAssets.map(asset => asset.key)] }],
};

export const PROJECT_PLAN_ASSETS = {
  'CP-202607010001': ASSET_ROWS.filter(asset => ['asset-1', 'asset-2'].includes(asset.key)),
  'CP-202608180001': nonRoomAssets,
  'DCP-202608180001': nonRoomAssets.map(asset => ({ ...asset })),
  'RCP-202608180001': [...ASSET_ROWS.filter(asset => ['asset-3', 'asset-4'].includes(asset.key)), ...replayEmployeeAssets],
};
