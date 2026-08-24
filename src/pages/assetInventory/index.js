import React from 'react';
import { Alert, Card, Empty, Space, Typography } from 'antd';
import AssetInventoryProjectPageV3 from './AssetInventoryProjectPageV3';
import AssetInventoryFieldPolicy from './AssetInventoryFieldPolicy';
import './assetInventoryV2.css';

export const ASSET_INVENTORY_SUB_MENUS = [
  '公司-账套对应关系',
  '盘点项目',
];

function PendingAssetInventoryPage({ title }) {
  return (
    <Space direction="vertical" size={16} className="w-full">
      <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
      <Alert
        type="info"
        showIcon
        message="本次操作轨迹未采集该页面字段和交互，因此只保留菜单入口，不补造业务字段。"
      />
      <Card size="small">
        <Empty description="等待对应页面轨迹或字段确认" />
      </Card>
    </Space>
  );
}

function withFieldPolicy(content) {
  return <AssetInventoryFieldPolicy>{content}</AssetInventoryFieldPolicy>;
}

export function AssetInventoryContent({ activeSubMenu }) {
  if (['盘点项目', '盘点项目（方案二）', '盘点项目（方案三）'].includes(activeSubMenu)) {
    return withFieldPolicy(<AssetInventoryProjectPageV3 />);
  }
  if (ASSET_INVENTORY_SUB_MENUS.includes(activeSubMenu)) return withFieldPolicy(<PendingAssetInventoryPage title={activeSubMenu} />);
  return withFieldPolicy(<AssetInventoryProjectPageV3 />);
}

export { default as AssetInventoryProjectPage } from './AssetInventoryProjectPage';
export { default as AssetInventoryProjectPageV2 } from './AssetInventoryProjectPageV2';
export { default as AssetInventoryProjectPageV3 } from './AssetInventoryProjectPageV3';
