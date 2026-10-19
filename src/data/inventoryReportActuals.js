// 来源：用户2026-10-19提供的真实四年对比、分类盘亏、2026明细及2025—2026增量表，金额基准单位为元。
// 原表中的盘亏净值“-”且占比0%，记录为0；增量“-”按原表小计、合计对应为0。
export const inventoryReportActuals = {
  year: 2026,
  history: [
    { year: 2023, quantity: 13317, original: 85199218, net: 10052457, lossQuantity: 1, lossRate: 0.00008, lossOriginal: 6538, lossOriginalRate: 0.00008, lossNet: 0, lossNetRate: 0 },
    { year: 2024, quantity: 12134, original: 80401393, net: 8100123, lossQuantity: 3, lossRate: 0.00025, lossOriginal: 9292, lossOriginalRate: 0.00012, lossNet: 2274, lossNetRate: 0.00028 },
    { year: 2025, quantity: 11072, original: 74656619, net: 6559666, lossQuantity: 40, lossRate: 0.00361, lossOriginal: 813957, lossOriginalRate: 0.01090, lossNet: 0, lossNetRate: 0 },
    { year: 2026, quantity: 14456, original: 78067413, net: 4604109, lossQuantity: 2, lossRate: 0.00014, lossOriginal: 2813, lossOriginalRate: 0.00004, lossNet: 217, lossNetRate: 0.00005 },
  ],
  // 来源：用户补充的2024—2025年公司盘亏分布截图；空白数量及净值为0。
  companyLoss: [
    { company: '集团总部', year: 2024, quantity: 0, net: 0 },
    { company: '集团总部', year: 2025, office: 33, mobile: 1, vehicle: 5, quantity: 39, net: 0 },
    { company: '搜狐媒体（含焦点）', year: 2024, office: 2, quantity: 2, net: 2274 },
    { company: '搜狐媒体（含焦点）', year: 2025, office: 1, quantity: 1, net: 0 },
    { company: '视频', year: 2024, mobile: 1, quantity: 1, net: 0 },
    { company: '视频', year: 2025, quantity: 0, net: 0 },
    { company: '合计', year: 2024, office: 2, mobile: 1, quantity: 3, net: 2274 },
    { company: '合计', year: 2025, office: 34, mobile: 1, vehicle: 5, quantity: 40, net: 0 },
  ].map(row => ({ notebook: 0, desktop: 0, display: 0, office: 0, mobile: 0, camera: 0, vehicle: 0, ...row })),
  categoryLoss: [
    ['台式机、显示器', 2025, 0, 0, 0], ['台式机、显示器', 2026, 0, 0, 0],
    ['笔记本', 2025, 0, 0, 0], ['笔记本', 2026, 0, 0, 0],
    ['照摄像器材', 2025, 0, 0, 0], ['照摄像器材', 2026, 0, 0, 0],
    ['移动数码', 2025, 1, 4829, 0], ['移动数码', 2026, 2, 2813, 217],
    ['办公设备', 2025, 34, 643392, 0], ['办公设备', 2026, 0, 0, 0],
    ['车辆', 2025, 5, 165736, 0], ['车辆', 2026, 0, 0, 0],
    ['电话', 2025, 0, 0, 0], ['电话', 2026, 0, 0, 0],
  ].map(([category, year, quantity, original, net]) => ({ category, year, quantity, original, net })),
  // 用户补充的2026年完整盘亏/待查清单，购买日期仍对应资产卡片启用日期。
  detailsByYear: {
    2026: [
      { 序号: 1, 盘点状态: '盘亏', 资产大类: 'OFFICE EQUIPMENT', 资产小类: '移动数码-平板电脑', 资产说明: '华为.MatePad', 数量: 1, 原值: 1946, 报失当月资产净值: 130,
        是否已赔偿: null, 赔偿金额: null, 损失: null, 标签号: '201132100282', 购买日期: '2021-10-14', 责任人姓名: '刘霞', 责任人编号: '150193', 子公司: '搜狐媒体', 一级部门: '智能平台', 说明: null, reportCategory: '移动数码' },
      { 序号: 2, 盘点状态: '盘亏', 资产大类: 'OFFICE EQUIPMENT', 资产小类: '移动数码-手机', 资产说明: '小米.红米Note9', 数量: 1, 原值: 867, 报失当月资产净值: 87,
        是否已赔偿: null, 赔偿金额: null, 损失: null, 标签号: 'NE3737', 购买日期: '2021-12-03', 责任人姓名: '王紫荆', 责任人编号: '220965', 子公司: '集团总部', 一级部门: '市场部', 说明: null, reportCategory: '移动数码' },
    ],
  },
  increments: [
    ['台式机', 'PC-主机', -85], ['台式机', 'PC-显示器', -45], ['台式机', 'PC-配件', 0], ['台式机', '小计', -130],
    ['笔记本', '笔记本', -49], ['笔记本', '笔记本-配件', 0], ['笔记本', '小计', -49],
    ['办公设备', '办公设备', -58], ['办公设备', '移动数码', -30], ['办公设备', '照摄像器材', -19], ['办公设备', '小计', -107],
    ['车辆', '车辆', -5], ['电话', '电话', 3675], ['合计', '合计', 3384],
  ].map(([category, name, value], key) => ({ key, category, name, value })),
};
