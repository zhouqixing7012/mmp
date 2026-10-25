import { inventoryReportDetails } from './inventoryReportDetails';

// 仅保留2025年旧模板分类与用户授权演示；真实年度汇总改从inventoryReportActuals读取。
export const inventoryReportTemplate = {
  year: 2025,
  scope: '电脑（笔记本、主机、显示器）、办公设备、车辆、IP电话。（注：楼宇、装修、家具及软件不在盘点范围内）',
  period: '2024年7月—2025年7月',
  distribution: [
    { category: '笔记本及配件', quantity: 3169, original: 25670000 },
    { category: '办公设备', quantity: 3365, original: 17640000 },
    { category: '照摄像器材及配件', quantity: 670, original: 9670000 },
    { category: '台式机、显示器', quantity: 2632, original: 8550000 },
    { category: '车辆', quantity: 20, original: 8230000 },
    { category: '移动数码', quantity: 1216, original: 4900000 },
  ],
  // 用户授权的2026年资产类型分布演示；分项为Mock，合计与年度数量/原值一致。
  demoDistribution: [
    { category: '笔记本及配件', quantity: 3120, original: 27000000 },
    { category: '办公设备', quantity: 3258, original: 17000000 },
    { category: '照摄像器材及配件', quantity: 651, original: 9500000 },
    { category: '台式机、显示器', quantity: 2502, original: 8800000 },
    { category: '车辆', quantity: 15, original: 8000000 },
    { category: '移动数码', quantity: 1186, original: 5000000 },
    { category: '电话', quantity: 3724, original: 2767413 },
  ],
  details: inventoryReportDetails,
};
