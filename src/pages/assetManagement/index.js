import React, { useEffect, useState } from 'react';
import { Card, Empty } from 'antd';
import AssetMaintenancePage from './AssetMaintenancePage';
import ConsumableMaintenancePage from './ConsumableMaintenancePage';
import ContractNumberMaintenancePage from './ContractNumberMaintenancePage';
import TagPrintingPage from './TagPrintingPage';
import EmployeeAssetInfoQueryPage from './EmployeeAssetInfoQueryPage';
import DocumentListPage from './DocumentListPage';
import AssetDisposalEditPage from './AssetDisposalEditPage';
import CrossCompanyTransferEditPage from './CrossCompanyTransferEditPage';
import ScrapApplicationEdit from '../ScrapApplicationEdit';
import AccountingScrapEdit from '../AccountingScrapEdit';
import './embeddedPages.css';

export const ASSET_MANAGEMENT_SUB_MENUS = [
  '资产维护',
  '耗材维护',
  '合约号码维护',
  '标签打印',
  '跨公司转移',
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

function EmbeddedPage({ children }) {
  return <div className="assetManagement-embeddedPage">{children}</div>;
}

export function AssetManagementContent({ activeSubMenu }) {
  const [embeddedPage, setEmbeddedPage] = useState(null);

  useEffect(() => {
    setEmbeddedPage(null);
  }, [activeSubMenu]);

  if (activeSubMenu === '资产维护') {
    return <AssetMaintenancePage />;
  }

  if (activeSubMenu === '耗材维护') {
    return <ConsumableMaintenancePage />;
  }

  if (activeSubMenu === '合约号码维护') {
    return <ContractNumberMaintenancePage />;
  }

  if (activeSubMenu === '标签打印') {
    return <TagPrintingPage />;
  }

  if (activeSubMenu === '跨公司转移') {
    if (embeddedPage === 'crossCompanyTransfer') {
      return (
        <EmbeddedPage>
          <CrossCompanyTransferEditPage onBack={() => setEmbeddedPage(null)} />
        </EmbeddedPage>
      );
    }

    return (
      <DocumentListPage
        title="跨公司转移"
        createLabel="创建跨公司转移申请单"
        onCreate={() => setEmbeddedPage('crossCompanyTransfer')}
      />
    );
  }

  if (activeSubMenu === '资产报废') {
    if (embeddedPage === 'assetScrap') {
      return (
        <EmbeddedPage>
          <ScrapApplicationEdit embedded onBack={() => setEmbeddedPage(null)} />
        </EmbeddedPage>
      );
    }

    if (embeddedPage === 'scrapCrossCompanyTransfer') {
      return (
        <EmbeddedPage>
          <CrossCompanyTransferEditPage
            variant="scrap"
            onBack={() => setEmbeddedPage(null)}
          />
        </EmbeddedPage>
      );
    }

    return (
      <DocumentListPage
        title="资产报废"
        createLabel="创建资产报废申请单"
        onCreate={() => setEmbeddedPage('assetScrap')}
        secondaryCreateLabel="创建跨公司转移申请单"
        onSecondaryCreate={() => setEmbeddedPage('scrapCrossCompanyTransfer')}
      />
    );
  }

  if (activeSubMenu === '账面报废') {
    if (embeddedPage === 'accountingScrap') {
      return (
        <EmbeddedPage>
          <AccountingScrapEdit embedded onBack={() => setEmbeddedPage(null)} />
        </EmbeddedPage>
      );
    }

    return (
      <DocumentListPage
        title="账面报废"
        createLabel="创建账面报废申请单"
        onCreate={() => setEmbeddedPage('accountingScrap')}
      />
    );
  }

  if (activeSubMenu === '资产处置') {
    if (embeddedPage === 'assetDisposal') {
      return (
        <EmbeddedPage>
          <AssetDisposalEditPage onBack={() => setEmbeddedPage(null)} />
        </EmbeddedPage>
      );
    }

    return (
      <DocumentListPage
        title="资产处置"
        createLabel="创建资产处置申请单"
        onCreate={() => setEmbeddedPage('assetDisposal')}
      />
    );
  }

  if (activeSubMenu === '员工资产信息查询') {
    return <EmployeeAssetInfoQueryPage />;
  }

  if (ASSET_MANAGEMENT_SUB_MENUS.includes(activeSubMenu)) {
    return <PendingAssetManagementPage title={activeSubMenu} />;
  }

  return <AssetMaintenancePage />;
}

export { default as AssetMaintenancePage } from './AssetMaintenancePage';
export { default as ConsumableMaintenancePage } from './ConsumableMaintenancePage';
export { default as ContractNumberMaintenancePage } from './ContractNumberMaintenancePage';
export { default as TagPrintingPage } from './TagPrintingPage';
export { default as EmployeeAssetInfoQueryPage } from './EmployeeAssetInfoQueryPage';
export { default as DocumentListPage } from './DocumentListPage';
export { default as AssetDisposalEditPage } from './AssetDisposalEditPage';
export { default as CrossCompanyTransferEditPage } from './CrossCompanyTransferEditPage';
