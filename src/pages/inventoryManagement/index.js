import React from 'react';
import { Card, Empty } from 'antd';
import AssetReceiptPage from './AssetReceiptPage';
import ConsumableReceiptPage from './ConsumableReceiptPage';
import InboundPage from './InboundPage';
import OutboundPage from './OutboundPage';
import MovePage from './MovePage';
import WarehouseWorkbenchPage from './WarehouseWorkbenchPage';
import { TransferPage } from './InventoryDocumentPages';

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

  if (activeSubMenu === '耗材接收') {
    return <ConsumableReceiptPage />;
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
export { default as ConsumableReceiptPage } from './ConsumableReceiptPage';
export { default as InboundPage } from './InboundPage';
export { default as OutboundPage } from './OutboundPage';
export { default as MovePage } from './MovePage';
export { default as WarehouseWorkbenchPage } from './WarehouseWorkbenchPage';
export { OutboundPage as LegacyOutboundPage, MovePage as LegacyMovePage, TransferPage } from './InventoryDocumentPages';
