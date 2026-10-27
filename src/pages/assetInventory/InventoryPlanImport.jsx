import React, { useState } from 'react';
import { Button, Dropdown } from 'antd';
import InventoryPersonnelImport from './InventoryPersonnelImport';
import InventoryScanResultImport from './InventoryScanResultImport';
import InventoryUncountedImport from './InventoryUncountedImport';
import { inventoryManagementBlockReason } from './inventoryManagementPermissions';
import { inventoryScanResultImportBlockReason, applyInventoryScanResults } from './inventoryScanResultImport';

export default function InventoryPlanImport({ project, plans, operator, assetsForPlan, onChangePlanAssets }) {
  const [requests, setRequests] = useState({ personnel: 0, results: 0, notes: 0 });
  const draftPlans = plans.filter(plan => ['草稿', '暂存'].includes(plan.status));
  const activePlans = plans.filter(plan => plan.status === '盘点中');
  const reviewedPlans = plans.filter(plan => ['审核中', '已审核'].includes(plan.status));
  const assets = targets => targets.flatMap(plan => assetsForPlan(plan).map(asset => ({ ...asset, planNo: plan.planNo })));
  const closed = ['关闭', '盘点关闭'].includes(project?.status);
  const managerBlock = inventoryManagementBlockReason(project, operator);
  const resultsBlocked = !activePlans.length || inventoryScanResultImportBlockReason({ project, plans: activePlans, operator, assets: assets(activePlans), entryType: 'execution' });
  const items = [
    { key: 'personnel', label: '导入人员信息', disabled: Boolean(closed || managerBlock || !draftPlans.length) },
    { key: 'results', label: '导入盘点结果', disabled: Boolean(closed || resultsBlocked) },
    { key: 'notes', label: '导入未盘说明', disabled: Boolean(closed || managerBlock || !reviewedPlans.length) },
  ];
  if (closed) return null;
  return <>
    <Dropdown trigger={['click']} menu={{ items, onClick: ({ key }) => {
      if (!items.find(item => item.key === key)?.disabled) setRequests(current => ({ ...current, [key]: current[key] + 1 }));
    } }}><Button disabled={items.every(item => item.disabled)}>导入</Button></Dropdown>
    <InventoryPersonnelImport hideTrigger openRequest={requests.personnel} project={project} plans={draftPlans} operator={operator} assetsForPlan={assetsForPlan} onChangePlanAssets={onChangePlanAssets}/>
    <InventoryScanResultImport hideTrigger openRequest={requests.results} project={project} plans={activePlans} operator={operator} assets={assets(activePlans)} entryType="execution" onImported={updates => activePlans.forEach(plan => onChangePlanAssets(plan, current => applyInventoryScanResults(current, updates)))}/>
    <InventoryUncountedImport hideTrigger openRequest={requests.notes} project={project} plans={reviewedPlans} operator={operator} assets={assets(reviewedPlans)} onAssetsChange={updater => reviewedPlans.forEach(plan => onChangePlanAssets(plan, updater))}/>
  </>;
}
