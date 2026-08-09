import React from 'react';
import { Card, Empty } from 'antd';
import AssetMaintenancePage from './AssetMaintenancePage';
import ConsumableMaintenancePage from './ConsumableMaintenancePage';
import ContractNumberMaintenancePage from './ContractNumberMaintenancePage';

export const ASSET_MANAGEMENT_SUB_MENUS = [
  '资产维护',
  '耗材维护',
  '合约号码维护',
  '标签打印',
  '公司间转移',
  '资产报废',
  '账面报废',
  '资产处置',
  '员工资产信息查询',
];

function PendingAssetManagementPage({ title }) {
  return (
    <Card size="small" title={title}>
      <Empty description={`${title}页面内容将在对应字段确认后补充`} />
    </Card>
  );
}

export function AssetManagementContent({ activeSubMenu }) {
  if (activeSubMenu === '资产维护') {
    return <AssetMaintenancePage />;
  }

  if (activeSubMenu === '耗材维护') {
    return <ConsumableMaintenancePage />;
  }

  if (activeSubMenu === '合约号码维护') {
    return <ContractNumberMaintenancePage />;
  }

  if (ASSET_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)) {
    return <PendingAssetManagementPage title={activeSubMenu} />;
  }

  return <AssetMaintenancePage />;
}

export { default as AssetMaintenancePage } from './AssetMaintenancePage';
export { default as ConsumableMaintenancePage } from './ConsumableMaintenancePage';
export { default as ContractNumberMaintenancePage } from './ContractNumberMaintenancePage';
