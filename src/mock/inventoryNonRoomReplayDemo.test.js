import { PROJECT_ROWS, ASSET_ROWS } from '../pages/assetInventory/mockData';
import { PROJECT_LIST_ROWS } from '../pages/assetInventory/projectListMockData';
import { PROJECT_PLAN_ASSETS, PROJECT_PLAN_ROWS, PROJECT_PLAN_SNAPSHOTS } from './inventoryProjectPlanMock';
import { NON_ROOM_REPLAY_DEMO_PROJECT as project } from './inventoryNonRoomReplayDemo';
import { inventoryProjectScopeSource, inheritInitialInventoryPeriod } from '../pages/assetInventory/inventoryProjectScope';
import { selectScopeAssets } from '../pages/assetInventory/inventoryScopeQuery';
import { selectReplaySnapshotAssets } from '../pages/assetInventory/inventoryReplaySampling';
import { selectInventoryPhotoAssets } from '../pages/assetInventory/inventoryPhotoRules';

test('正常候选及项目列表均含未被复盘占用的已关闭非机房演示初盘，不更改旧关联', () => {
  expect(PROJECT_ROWS.find(row => row.projectNo === project.projectNo)).toMatchObject({ status: '盘点关闭', projectType: '初盘', isDemo: true });
  expect(PROJECT_LIST_ROWS.find(row => row.projectNo === project.projectNo)).toMatchObject({ status: '盘点关闭', projectName: expect.stringContaining('演示') });
  const linked = PROJECT_ROWS.filter(row => row.projectType === '复盘').map(row => row.initialProjectNo && row.initialProjectNo !== '-' ? row.initialProjectNo : PROJECT_ROWS.find(initial => initial.projectType === '初盘' && initial.relationGroup === row.relationGroup)?.projectNo);
  expect(linked).not.toContain(project.projectNo);
  expect(linked).toContain('CP-202608180001');
});

test('非机房执行快照不是空壳，计划及数量同源，未执行资产不进入复盘母集', () => {
  const snapshot = PROJECT_PLAN_SNAPSHOTS[project.projectNo];
  const source = inventoryProjectScopeSource({ projectType: '复盘', initialProjectNo: project.projectNo }, { allAssets: ASSET_ROWS, initialSnapshot: snapshot, initialAssets: PROJECT_PLAN_ASSETS[project.projectNo] });
  expect(snapshot.assets).toHaveLength(5);
  expect(source).toHaveLength(4);
  expect(new Set(source.map(asset => asset.inventoryRange))).toEqual(new Set(['员工', '公共']));
  expect(source.every(asset => asset.isDemo && asset.assetTag.startsWith('DEMO-NR-') && !ASSET_ROWS.some(old => old.key === asset.key))).toBe(true);
  expect(PROJECT_PLAN_ROWS[project.projectNo].flatMap(plan => plan.assetKeys).sort()).toEqual(source.map(asset => asset.key).sort());
  expect(PROJECT_PLAN_ASSETS['CP-202608180001'].some(asset => asset.isDemo)).toBe(false);
});

test('关联后继承期间，真实资产可按责任人筛选、复盘抽样及按显式照片配置抽取', () => {
  const snapshot = PROJECT_PLAN_SNAPSHOTS[project.projectNo];
  const replay = inheritInitialInventoryPeriod({ projectType: '复盘', samplingMode: '百分比', samplingRatio: 50 }, project);
  expect(replay).toMatchObject({ initialProjectNo: project.projectNo, inventoryType: '月度', period: '2026年6月' });
  const source = inventoryProjectScopeSource(replay, { initialSnapshot: snapshot });
  const owner = source.find(asset => asset.inventoryRange === '员工').owner;
  const filtered = selectScopeAssets(source, { owner: [owner] }, '初盘');
  expect(filtered).toHaveLength(2);
  expect(filtered.every(asset => asset.owner === owner)).toBe(true);
  const sampled = selectReplaySnapshotAssets(source, replay, () => 0);
  expect(sampled.assets).toHaveLength(2);
  expect(sampled.assets.every(asset => source.some(original => original.key === asset.key))).toBe(true);
  const mandatorySample = selectReplaySnapshotAssets(source, { ...replay, mandatoryNetValueAbove: 50 }, () => 0);
  expect(mandatorySample.mandatoryAssetKeys).toHaveLength(2);
  expect(mandatorySample.assets).toHaveLength(3);
  // 显式选择相同照片条件以验证资产可匹配，不表示新复盘默认复制初盘图片配置。
  const photoAssets = selectInventoryPhotoAssets(source, snapshot.config.rules, true, () => 0);
  expect(photoAssets.filter(asset => asset.inventoryRange === '员工' && asset.needPhoto)).toHaveLength(2);
  expect(photoAssets.filter(asset => asset.inventoryRange === '公共' && asset.needPhoto)).toHaveLength(1);
  expect(project.executionCount).toBe(source.length);
});
