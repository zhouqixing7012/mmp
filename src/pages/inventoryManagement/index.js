import React from 'react';
import { Card, Empty } from 'antd';

export const INVENTORY_MANAGEMENT_SUB_MENUS = [
  '资产接收',
  '耗材接收',
  '入库',
  '出库',
  '移库',
  '转移',
  '库管员工作台',
];

export function InventoryManagementContent({ activeSubMenu }) {
  const title = INVENTORY_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)
    ? activeSubMenu
    : INVENTORY_MANAGEMENT_SUB_MENUS[0];

  return (
    <Card size="small" title={title}>
      <Empty description={`${title}页面字段待确认`} />
    </Card>
  );
}
