// 来源：用户2026-10-19提供的真实四年对比及2025—2026增量表，金额基准单位为元。
// 原表中的盘亏净值“-”且占比0%，记录为0；增量“-”按原表小计、合计对应为0。
export const inventoryReportActuals = {
  year: 2026,
  history: [
    { year: 2023, quantity: 13317, original: 85199218, net: 10052457, lossQuantity: 1, lossRate: 0.00008, lossOriginal: 6538, lossOriginalRate: 0.00008, lossNet: 0, lossNetRate: 0 },
    { year: 2024, quantity: 12134, original: 80401393, net: 8100123, lossQuantity: 3, lossRate: 0.00025, lossOriginal: 9292, lossOriginalRate: 0.00012, lossNet: 2274, lossNetRate: 0.00028 },
    { year: 2025, quantity: 11072, original: 74656619, net: 6559666, lossQuantity: 40, lossRate: 0.00361, lossOriginal: 813957, lossOriginalRate: 0.01090, lossNet: 0, lossNetRate: 0 },
    { year: 2026, quantity: 14456, original: 78067413, net: 4604109, lossQuantity: 2, lossRate: 0.00014, lossOriginal: 2813, lossOriginalRate: 0.00004, lossNet: 217, lossNetRate: 0.00005 },
  ],
  increments: [
    ['台式机', 'PC-主机', -85], ['台式机', 'PC-显示器', -45], ['台式机', 'PC-配件', 0], ['台式机', '小计', -130],
    ['笔记本', '笔记本', -49], ['笔记本', '笔记本-配件', 0], ['笔记本', '小计', -49],
    ['办公设备', '办公设备', -58], ['办公设备', '移动数码', -30], ['办公设备', '照摄像器材', -19], ['办公设备', '小计', -107],
    ['车辆', '车辆', -5], ['电话', '电话', 3675], ['合计', '合计', 3384],
  ].map(([category, name, value], key) => ({ key, category, name, value })),
};
