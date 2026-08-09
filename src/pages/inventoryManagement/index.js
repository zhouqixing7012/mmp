import React from 'react';
import { Card, Empty } from 'antd';
import AssetReceiptPage from './AssetReceiptPage';
import WarehouseWorkbenchPage from './WarehouseWorkbenchPage';
import { InboundPage, OutboundPage, MovePage, TransferPage } from './InventoryDocumentPages';

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

  if (activeSubMenu === '入库') {
    return <InboundPage />;
  }

  if (activeSubMenu === '出库') {
    return <OutboundPage />;
  }

  if (activeSubMenu === '移库') {
    return <MovePage />;
  }

  if (activeSubMenu === '转移') {
    return <TransferPage />;
  }

  if (activeSubMenu === '库管员工作台') {
    return <WarehouseWorkbenchPage />;
  }

  if (INVENTORY_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)) {
    return <PendingInventoryPage title={activeSubMenu} />;
  }

  return <AssetReceiptPage />;
}

export { default as AssetReceiptPage } from './AssetReceiptPage';
export { default as WarehouseWorkbenchPage } from './WarehouseWorkbenchPage';
export { InboundPage, OutboundPage, MovePage, TransferPage } from './InventoryDocumentPages';
