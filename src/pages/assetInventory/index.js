import InventoryFinanceReport from './InventoryFinanceReport';
import React from 'react';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import AssetInventoryProjectPageV3 from './AssetInventoryProjectPageV3';
import AssetInventoryFieldPolicy from './AssetInventoryFieldPolicy';
import './assetInventoryV2.css';

export const ASSET_INVENTORY_SUB_MENUS = [
  '盘点项目',
  '盘点报表',
  '财务盘点报告',
];

function withFieldPolicy(content) {
  return <AssetInventoryFieldPolicy>{content}</AssetInventoryFieldPolicy>;
}

export function AssetInventoryContent({ activeSubMenu }) {
  if (['盘点项目', '盘点项目（方案二）', '盘点项目（方案三）'].includes(activeSubMenu)) {
    return withFieldPolicy(<AssetInventoryProjectPageV3 />);
  }
  if (activeSubMenu === '财务盘点报告') return <InventoryFinanceReport />;
  if (activeSubMenu === '盘点报表') return <AssetInventoryReportPage />;
  return withFieldPolicy(<AssetInventoryProjectPageV3 />);
}

export { default as AssetInventoryProjectPage } from './AssetInventoryProjectPage';
export { default as AssetInventoryProjectPageV2 } from './AssetInventoryProjectPageV2';
export { default as AssetInventoryProjectPageV3 } from './AssetInventoryProjectPageV3';
