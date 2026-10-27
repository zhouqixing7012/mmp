import { ClipboardList, Layers, Monitor } from 'lucide-react';

export const ASSET_MANAGEMENT_MENU_ITEMS = [
  '资产维护', '耗材维护', '合约号码维护', '标签打印', '跨公司转移', '资产报废', '账面报废', '资产处置', '员工资产信息查询',
];

export const INVENTORY_MANAGEMENT_MENU_ITEMS = [
  '资产接收', '耗材接收', '入库', '出库', '移库', '转移', '库管员工作台',
];

export const ASSET_INVENTORY_MENU_ITEMS = [
  '盘点项目',
  '盘点报表',
];

export const ASSET_REPORT_MENU_ITEMS = [
  '资产明细报表', '耗材明细报表', '资产事务报表', '新员工领用报表',
  '资产新增报表', '固定资产新增报表', '资产统一申领报表', '耗材统一申领报表', '资产报废报表',
];

export const APPLICATION_MENU_ITEMS = [
  '移库单', '退库单', '转移单', '借用单', '更换单', '未完成单据', '资产申请单', '耗材申请单', '新员工领用单',
];

export const MAIN_MENU_ITEMS = [
  { key: '资产管理', label: '资产管理', icon: Monitor, children: ASSET_MANAGEMENT_MENU_ITEMS },
  { key: '无形资产', label: '无形资产', icon: Layers, children: ['IP'] },
  { key: '库存管理', label: '库存管理', icon: Layers, children: INVENTORY_MANAGEMENT_MENU_ITEMS },
  { key: '资产盘点', label: '资产盘点', icon: ClipboardList, children: ASSET_INVENTORY_MENU_ITEMS },
  { key: '资产报表', label: '资产报表', icon: ClipboardList, children: ASSET_REPORT_MENU_ITEMS },
  { key: '申请', label: '申请', icon: ClipboardList, children: APPLICATION_MENU_ITEMS },
];

export const BACKEND_CONFIG_MENU_ITEMS = [
  '物料数据维护', '业务映射规则', '仓库数据维护', '地点数据维护', '会计映射规则', '物资申请超标配置', '费用账户规则', '账套内容维护', '组织管理', '用户管理', '角色管理', '字典管理',
];
