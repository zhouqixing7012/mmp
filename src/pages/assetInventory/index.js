import React from 'react';
import { Alert, Card, Empty, Space, Typography } from 'antd';
import AssetInventoryProjectPage from './AssetInventoryProjectPage';

export const ASSET_INVENTORY_SUB_MENUS = [
  '公司-账套对应关系',
  '盘点规则',
  '盘点项目',
  '盘点差异报表',
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

export function AssetInventoryContent({ activeSubMenu }) {
  if (activeSubMenu === '盘点项目') {
    return <AssetInventoryProjectPage />;
  }

  if (ASSET_INVENTORY_SUB_MENUS.includes(activeSubMenu)) {
    return <PendingAssetInventoryPage title={activeSubMenu} />;
  }

  return <AssetInventoryProjectPage />;
}

export { default as AssetInventoryProjectPage } from './AssetInventoryProjectPage';
