// 明确标识的交易演示：复用已有资产的物料、组织和人员资料，不冒充正式盘点结果。
export const NON_ROOM_REPLAY_DEMO_PROJECT = {
  key: 'CP-202606250901', projectNo: 'CP-202606250901',
  relationGroup: '演示-非机房复盘创建链路', projectType: '初盘',
  projectName: '演示-非机房已关闭初盘（可创建复盘）',
  description: '演示数据：用于从正常关联入口创建非机房复盘，包含员工及公共执行快照。',
  status: '盘点关闭', creator: '213852-孙志强', owner: '213852-孙志强',
  startDate: '2026-06-22', endDate: '2026-06-25', createdAt: '2026-06-20',
  snapshotTime: '2026-06-22 09:00:00', inventoryType: '月度', period: '2026年6月',
  scopeRanges: ['员工', '公共'], executionCount: 4, assetCount: 5,
  generationSource: '人工创建', planStatus: '进入计划', imageApproval: false,
  isDemo: true, demoScenario: 'non-room-replay-create',
};

export const NON_ROOM_REPLAY_DEMO_PHOTO_CONFIG = {
  rules: [
    { key: 'demo-photo-employee', range: '员工', uploadEnabled: true, percent: 100 },
    { key: 'demo-photo-public', range: '公共', uploadEnabled: true, percent: 50 },
  ],
};

export function createNonRoomReplayDemoAssets(sourceAssets) {
  const employee = sourceAssets.find(asset => asset.inventoryRange === '员工');
  const publicAsset = sourceAssets.find(asset => asset.inventoryRange === '公共');
  if (!employee || !publicAsset) throw new Error('非机房复盘演示缺少已有员工或公共资产资料');
  return [employee, employee, publicAsset, publicAsset, employee].map((source, index) => {
    const execution = index < 4;
    return { ...source,
      key: `demo-nonroom-closed-asset-${index + 1}`, assetTag: `DEMO-NR-${String(index + 1).padStart(4, '0')}`,
      serialNo: `DEMO-NR-SN-${String(index + 1).padStart(4, '0')}`,
      inventoryStatus: execution ? '已盘' : '未执行盘点',
      executeInventory: execution, counter: execution ? source.owner : '-',
      inventoryDate: execution ? '2026-06-24 10:00:00' : '-',
      inventoryNote: execution ? '演示：初盘现场核对完成' : '',
      inventoryRemark: execution ? '演示：初盘现场核对完成' : '',
      lossReason: '', lossReported: false, photos: {},
      needPhoto: index < 2 || index === 2,
      executor: source.owner, supervisor: '-',
      planNo: execution ? `PLAN-20260622-${index < 2 ? '0901' : '0902'}` : '-',
      planName: execution ? `演示-${source.inventoryRange}初盘计划` : '-',
      resultSource: execution ? '狐小e' : '',
      isDemo: true, demoScenario: NON_ROOM_REPLAY_DEMO_PROJECT.demoScenario,
    };
  });
}

export function createNonRoomReplayDemoPlans(assets) {
  return ['员工', '公共'].map((range, index) => {
    const included = assets.filter(asset => asset.executeInventory && asset.inventoryRange === range);
    return { key: `demo-nonroom-plan-${index + 1}`, planNo: `PLAN-20260622-${index ? '0902' : '0901'}`,
      planName: `演示-${range}初盘计划`, status: '关闭', range,
      organization: [...new Set(included.map(asset => asset.organization))].join('、'),
      city: [...new Set(included.map(asset => asset.city))].join('、'),
      startDate: NON_ROOM_REPLAY_DEMO_PROJECT.startDate, endDate: NON_ROOM_REPLAY_DEMO_PROJECT.endDate,
      assetCount: included.length, countedCount: included.length, uncountedCount: 0,
      assetKeys: included.map(asset => asset.key), isDemo: true,
    };
  });
}
