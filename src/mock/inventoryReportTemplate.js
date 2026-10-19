import { inventoryReportDetails } from './inventoryReportDetails';

// 仅保留2025年旧模板分类与用户授权演示；真实年度汇总改从inventoryReportActuals读取。
export const inventoryReportTemplate = {
  year: 2025,
  scope: '电脑（笔记本、主机、显示器）、办公设备、车辆、电话；楼宇、装修、家具及软件不在范围内',
  period: '2024年7月—2025年7月',
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
