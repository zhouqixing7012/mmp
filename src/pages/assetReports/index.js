import React, { useCallback, useRef } from 'react';
import AssetReportPage from './AssetReportPage';
import FinancialNewAssetReportPage from './FinancialNewAssetReportPage';
import { reportDefinitions } from '../../services/assetReportsService';

export default function AssetReportsContent({ activeSubMenu, activeTab, access }) {
  const pageStates = useRef({});
  const savePageState = useCallback((id, state) => { pageStates.current[id] = state; }, []);
  if (activeSubMenu === '固定资产新增报表') return <FinancialNewAssetReportPage access={access} />;
  const definition = reportDefinitions.find(item => item.menu === activeSubMenu && (!activeTab || item.title === activeTab));
  if (!definition) throw new Error(`未知资产报表入口：${activeSubMenu}/${activeTab}`);
  return <AssetReportPage key={definition.id} reportId={definition.id} access={access} initialState={pageStates.current[definition.id]} onStateChange={savePageState} />;
}
