import React from 'react';
import AssetReportPage from './AssetReportPage';
import FinancialNewAssetReportPage from './FinancialNewAssetReportPage';
import { reportDefinitions } from '../../services/assetReportsService';

export default function AssetReportsContent({ activeSubMenu, activeTab, access }) {
  if (activeSubMenu === '固定资产新增报表') return <FinancialNewAssetReportPage />;
  const definition = reportDefinitions.find(item => item.menu === activeSubMenu && (!activeTab || item.title === activeTab));
  if (!definition) throw new Error(`未知资产报表入口：${activeSubMenu}/${activeTab}`);
  return <AssetReportPage key={definition.id} reportId={definition.id} access={access} />;
}
