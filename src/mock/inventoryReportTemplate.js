import { inventoryReportDetails } from './inventoryReportDetails';

// 用户提供PPT中的示例数据，非在线项目盘点结果；未提供的值保持null。
export const inventoryReportTemplate = {
  year: 2025,
  scope: '电脑（笔记本、主机、显示器）、办公设备、车辆、电话；楼宇、装修、家具及软件不在范围内',
  period: '2024年7月—2025年7月',
  history: [
    { year: 2022, quantity: 14033, original: null, net: null, lossQuantity: null, lossRate: 0.00007 },
    { year: 2023, quantity: 13317, original: null, net: null, lossQuantity: null, lossRate: 0.00008 },
    { year: 2024, quantity: 12134, original: null, net: null, lossQuantity: 3, lossRate: 0.00025 },
    { year: 2025, quantity: 11072, original: 74660000, net: 6560000, lossQuantity: 40, lossRate: 0.00361 },
  ],
  indicators: [
    { name: '资产数量（件）', total: 11072, change: -1062, rate: -0.0875, rateChange: 0.13 },
    { name: '资产原值（万元）', total: 7466, change: -574, rate: -0.0715, rateChange: -1.51 },
    { name: '资产净值（万元）', total: 656, change: -154, rate: -0.1902, rateChange: 0.40 },
  ],
  distribution: [
    { category: '笔记本及配件', quantity: 3169, original: 25670000 },
    { category: '办公设备', quantity: 3365, original: 17640000 },
    { category: '照摄像器材及配件', quantity: 670, original: 9670000 },
    { category: '台式机、显示器', quantity: 2632, original: 8550000 },
    { category: '车辆', quantity: 20, original: 8230000 },
    { category: '移动数码', quantity: 1216, original: 4900000 },
  ],
  // 原PPT数量保留；2025年净值按本次演示明细合计。
  companyLoss: [
    { company: '集团总部', year: 2024 },
    { company: '集团总部', year: 2025, office: 33, mobile: 1, vehicle: 5, quantity: 39, net: 90200 },
    { company: '搜狐媒体（含焦点）', year: 2024, office: 2, quantity: 2, net: 2274 },
    { company: '搜狐媒体（含焦点）', year: 2025, office: 1, quantity: 1, net: 200 },
    { company: '视频', year: 2024, mobile: 1, quantity: 1 },
    { company: '视频', year: 2025 },
    { company: '合计', year: 2024, office: 2, mobile: 1, quantity: 3, net: 2274 },
    { company: '合计', year: 2025, office: 34, mobile: 1, vehicle: 5, quantity: 40, net: 90400 },
  ],
  details: inventoryReportDetails,
};
