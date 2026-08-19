import { ClipboardList, Layers, Monitor } from 'lucide-react';

export const ASSET_MANAGEMENT_MENU_ITEMS = [
  '资产维护', '耗材维护', '合约号码维护', '标签打印', '跨公司转移', '资产报废', '账面报废', '资产处置', '员工资产信息查询',
];

export const INVENTORY_MANAGEMENT_MENU_ITEMS = [
  '资产接收', '耗材接收', '入库', '出库', '移库', '转移', '库管员工作台',
];

export const ASSET_INVENTORY_MENU_ITEMS = [
  '公司-账套对应关系',
  '盘点规则',
  '盘点项目',
  '盘点项目（方案二）',
  '盘点差异报表',
];

export const MAIN_MENU_ITEMS = [
  { key: '资产管理', label: '资产管理', icon: Monitor, children: ASSET_MANAGEMENT_MENU_ITEMS },
  { key: '无形资产', label: '无形资产', icon: Layers },
  { key: '库存管理', label: '库存管理', icon: Layers, children: INVENTORY_MANAGEMENT_MENU_ITEMS },
  { key: '资产盘点', label: '资产盘点', icon: ClipboardList, children: ASSET_INVENTORY_MENU_ITEMS },
];

export const BACKEND_CONFIG_MENU_ITEMS = [
  '物料数据维护', '业务映射规则', '仓库数据维护', '地点数据维护', '会计映射规则', '物资申请超标配置', '费用账户规则', '账套内容维护', '组织管理', '用户管理', '角色管理', '字典管理',
];
