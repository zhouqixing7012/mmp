import React from 'react';
import { Card, Empty } from 'antd';
import AssetReceiptPage from './AssetReceiptPage';
import ConsumableReceiptPage from './ConsumableReceiptPage';
import InboundPage from './InboundPage';
import OutboundPage from './OutboundPage';
import MovePage from './MovePage';
import TransferPage from './TransferPage';
import WarehouseWorkbenchPage from './WarehouseWorkbenchPage';
import InventoryPrintPrototypeBoundary from './InventoryPrintPreview';

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
  let page = null;

  if (activeSubMenu === '资产接收') {
    page = <AssetReceiptPage />;
  } else if (activeSubMenu === '耗材接收') {
    page = <ConsumableReceiptPage />;
  } else if (activeSubMenu === '入库') {
    page = <InboundPage />;
  } else if (activeSubMenu === '出库') {
    page = <OutboundPage />;
  } else if (activeSubMenu === '移库') {
    page = <MovePage />;
  } else if (activeSubMenu === '转移') {
    page = <TransferPage />;
  } else if (activeSubMenu === '库管员工作台') {
    page = <WarehouseWorkbenchPage />;
  } else if (INVENTORY_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)) {
    page = <PendingInventoryPage title={activeSubMenu} />;
  } else {
    page = <AssetReceiptPage />;
  }

  return (
    <InventoryPrintPrototypeBoundary activeSubMenu={activeSubMenu || '资产接收'}>
      {page}
    </InventoryPrintPrototypeBoundary>
  );
}

export { default as AssetReceiptPage } from './AssetReceiptPage';
export { default as ConsumableReceiptPage } from './ConsumableReceiptPage';
export { default as InboundPage } from './InboundPage';
export { default as OutboundPage } from './OutboundPage';
export { default as MovePage } from './MovePage';
export { default as TransferPage } from './TransferPage';
export { default as WarehouseWorkbenchPage } from './WarehouseWorkbenchPage';
export { OutboundPage as LegacyOutboundPage, MovePage as LegacyMovePage, TransferPage as LegacyTransferPage } from './InventoryDocumentPages';