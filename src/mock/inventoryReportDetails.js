import { getMaterialByCode } from './reference/materialCatalog';

// 用户授权的交易演示明细；物料复用目录，日期为资产卡片启用日期的演示值。
const rows = [
  ['盘亏', '113014107010000', 33, 66000, 6600, 'ES-DEMO-001', '2023-03-15', '张曙光', '111547', '集团总部', 'MIS部', '办公设备'],
  ['盘亏', '113014107010000', 1, 2000, 200, 'ES-DEMO-002', '2023-05-20', '李磊', 'CW002506', '搜狐媒体（含焦点）', '智能媒体研发中心', '办公设备'],
  ['盘亏', '113020011242010', 1, 4800, 3600, 'ES-DEMO-003', '2025-04-08', '王鹏', '111558', '集团总部', '内部审计部', '移动数码'],
  ['盘亏', '118002014436000', 5, 250000, 80000, 'ES-DEMO-004', '2022-06-10', '张曙光', '111547', '集团总部', 'MIS部', '车辆'],
  ['待查', '112001055268001', 1, 6000, null, 'ES-DEMO-005', '2024-01-12', '苏伟', '111494', '搜狐媒体（含焦点）', '智能平台', '笔记本（NB）'],
  ['待查', '112003011031000', 2, 600, null, 'ES-DEMO-006', '2021-09-03', '邓昭明', '111488', '视频', 'OTT业务部', '笔记本（NB）'],
  ['待查', '113020011242010', 1, 4800, null, 'ES-DEMO-007', '2025-05-16', '韩晓晗', 'CW002507', '搜狐媒体（含焦点）', '内容获取中心', '移动数码'],
];
export const inventoryReportDetails = rows.map((row, index) => {
  const [status, code, count, original, net, tag, enabledDate, name, employeeNo, company, department, reportCategory] = row;
  const material = getMaterialByCode(code);
  if (!material) throw new Error(`盘点演示物料不存在：${code}`);
  return { 序号: index + 1, 盘点状态: status, 资产大类: material.majorCategory, 资产小类: material.minorCategory, 资产说明: material.materialDescription,
    数量: count, 原值: original, 报失当月资产净值: net, 是否已赔偿: null, 赔偿金额: null, 损失: null,
    标签号: tag, 购买日期: enabledDate, 责任人姓名: name, 责任人编号: employeeNo, 子公司: company, 一级部门: department, 说明: null, reportCategory };
});
