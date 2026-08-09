import React from 'react';
import { Card, Empty } from 'antd';
import AssetReceiptPage from './AssetReceiptPage';

export const INVENTORY_MANAGEMENT_SUB_MENUS = [
  '资产接收',
  '耗材接收',
  '入库',
  '出库',
  '移库',
  '转移',
  '库管员工作台',
];

function PendingInventoryPage({ title }) {
  return (
    <Card size="small" title={title}>
      <Empty description={`${title}页面字段待确认`} />
    </Card>
  );
}

export function InventoryManagementContent({ activeSubMenu }) {
  if (activeSubMenu === '资产接收') {
    return <AssetReceiptPage />;
  }

  if (INVENTORY_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)) {
    return <PendingInventoryPage title={activeSubMenu} />;
  }

  return <AssetReceiptPage />;
}

export { default as AssetReceiptPage } from './AssetReceiptPage';
