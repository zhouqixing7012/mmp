import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, InputNumber, Modal, Select, Space, Switch, Table, Typography } from 'antd';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import AssetInventoryProjectPage from './AssetInventoryProjectPage';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import AssetInventoryProjectListV2 from './AssetInventoryProjectListV2';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
import AssetInventoryImageReviewV2 from './AssetInventoryImageReviewV2';
import { AssetInventoryPlanAssetListV2 } from './AssetInventoryPlanViewsV2';
import { IMAGE_RULE_ROWS, PROJECT_INFO, PROJECT_ROWS } from './mockData';

const RANGE_OPTIONS = ['库房', '公共', '机房', '员工'];
function CardTitle({ children }) { return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>; }
function ImageUploadRuleEditorV2() {
  const [enabled, setEnabled] = useState(true);
  const [rows, setRows] = useState(IMAGE_RULE_ROWS);
  const multiOptions = (values) => values.map((value) => ({ label: value, value }));
  const changeRow = (key, field, value) => setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row));
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100, fixed: 'left', render: (value, row) => <Select value={value} className="w-full" options={RANGE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(next) => changeRow(row.key, 'range', next)} /> },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 170, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '1', '5', '实习生', '公共'])} onChange={(next) => changeRow(row.key, 'ownerLevel', next)} /> },
    { title: '部门', dataIndex: 'department', width: 170, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '集团总部.MIS部', '搜狐媒体.智能平台'])} onChange={(next) => changeRow(row.key, 'department', next)} /> },
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'])} onChange={(next) => changeRow(row.key, 'category', next)} /> },
    { title: '资产状态', dataIndex: 'assetStatus', width: 160, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '在用', '在库'])} onChange={(next) => changeRow(row.key, 'assetStatus', next)} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['集团'])} onChange={(next) => changeRow(row.key, 'organization', next)} /> },
    { title: 'City', dataIndex: 'city', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['北京市'])} onChange={(next) => changeRow(row.key, 'city', next)} /> },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '融科资讯中心D座', '搜狐媒体大厦'])} onChange={(next) => changeRow(row.key, 'building', next)} /> },
    { title: 'Floor', dataIndex: 'floor', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'B2', '6F', '8F'])} onChange={(next) => changeRow(row.key, 'floor', next)} /> },
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, row) => <InputNumber min={0} max={100} value={value} className="w-full" onChange={(next) => changeRow(row.key, 'percent', next ?? 100)} /> },
    { title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" danger onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}>删除</Button> },
  ];
  return <Card size="small" title={<CardTitle>图片上传规则配置</CardTitle>} extra={<Space><Typography.Text>是否上传图片</Typography.Text><Switch checked={enabled} onChange={setEnabled} /></Space>}>
    {enabled && <><div className="mb-3 flex justify-end"><Button icon={<Plus size={14} />} onClick={() => setRows((current) => [...current, { key: `image-${Date.now()}`, range: '员工', ownerLevel: ['全部'], department: ['全部'], category: ['全部'], assetStatus: ['全部'], organization: ['集团'], city: ['北京市'], building: ['全部'], floor: ['全部'], percent: 100 }])}>增行</Button></div><Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1800 }} pagination={false} /></>}
  </Card>;
}
function getCardTitle(card) { return card.querySelector('.ant-card-head-title')?.textContent?.trim() || ''; }
function resolveProjectFromRow(row) { return row ? { ...PROJECT_INFO, ...row } : PROJECT_INFO; }
function resolveProject(root, sourceElement) {
  const sourceText = sourceElement?.closest?.('tr')?.textContent || '';
  const sourceProject = PROJECT_ROWS.find((row) => sourceText.includes(row.projectNo));
  if (sourceProject) return resolveProjectFromRow(sourceProject);
  const rootText = root?.textContent || '';
  const current = PROJECT_ROWS.find((row) => rootText.includes(row.projectNo));
  return resolveProjectFromRow(current);
}

export default function AssetInventoryProjectPageV2() {
  const rootRef = useRef(null); const baseContainerRef = useRef(null);
  const [basePageTitle, setBasePageTitle] = useState('盘点项目'); const [imageRuleSlot, setImageRuleSlot] = useState(null); const [customBuilderOpen, setCustomBuilderOpen] = useState(false); const [planViewOpen, setPlanViewOpen] = useState(false); const [activePlan, setActivePlan] = useState(null); const [imageReviewOpen, setImageReviewOpen] = useState(false); const [planProject, setPlanProject] = useState(PROJECT_INFO);
  const openPlanViewByProject = (project, forceGeneratedStatus = false) => { const nextProject = resolveProjectFromRow(project); setPlanProject(forceGeneratedStatus ? { ...nextProject, status: '生成盘点计划' } : nextProject); setCustomBuilderOpen(false); setImageReviewOpen(false); setActivePlan(null); setPlanViewOpen(true); };
  const openPlanView = (sourceElement, forceGeneratedStatus = false) => { const nextProject = resolveProject(baseContainerRef.current, sourceElement); openPlanViewByProject(nextProject, forceGeneratedStatus); };
  const triggerBaseAction = (row, action) => {
    const base = baseContainerRef.current; if (!base) return;
    if (action === 'create') { Array.from(base.querySelectorAll('button')).find((button) => button.textContent?.trim() === '创建项目')?.click(); return; }
    const targetRow = Array.from(base.querySelectorAll('tr')).find((item) => item.textContent?.includes(row.projectNo)); if (!targetRow) return;
    if (action === 'project') { Array.from(targetRow.querySelectorAll('button')).find((button) => button.textContent?.trim() === row.projectName)?.click(); return; }
    if (action === 'progress') Array.from(targetRow.querySelectorAll('button')).find((button) => button.textContent?.trim() === '查看进度')?.click();
  };
  const interceptNavigation = (event) => {
    if (customBuilderOpen || planViewOpen || activePlan || imageReviewOpen) return;
    const button = event.target.closest?.('button'); if (!button) return;
    const text = button.textContent?.trim() || ''; const pageTitle = baseContainerRef.current?.querySelector('h4.ant-typography')?.textContent?.trim() || '';
    if (text === '生成盘点计划' && pageTitle === '盘点项目详情') { event.preventDefault(); event.stopPropagation(); setPlanProject({ ...resolveProject(baseContainerRef.current, button), status: '生成盘点计划' }); Modal.confirm({ title: '提示', content: '是否按照默认方式生成盘点计划？', okText: '是', cancelText: '否', onOk: () => openPlanView(button, true), onCancel: () => setCustomBuilderOpen(true) }); return; }
    if (text === '进入计划' || text === '查看计划清单') { event.preventDefault(); event.stopPropagation(); openPlanView(button); return; }
    if (text === '图片审核') { event.preventDefault(); event.stopPropagation(); setPlanProject(resolveProject(baseContainerRef.current, button)); setImageReviewOpen(true); }
  };
  useEffect(() => {
    const base = baseContainerRef.current; if (!base) return undefined; let frameId = 0;
    const restoreVariantChanges = () => { base.querySelectorAll('[data-asset-inventory-v2-hidden="true"]').forEach((element) => { element.style.display = ''; delete element.dataset.assetInventoryV2Hidden; }); };
    const removeImageRuleSlot = () => { const existing = base.querySelector('[data-asset-inventory-v2-image-slot="true"]'); if (existing) existing.remove(); setImageRuleSlot(null); };
    const applyVariant = () => {
      restoreVariantChanges(); const pageTitle = base.querySelector('h4.ant-typography')?.textContent?.trim() || '盘点项目'; setBasePageTitle((current) => current === pageTitle ? current : pageTitle);
      const cards = Array.from(base.querySelectorAll('.ant-card')); const baseCards = cards.filter((card) => !card.closest('[data-asset-inventory-v2-image-slot="true"]')); const isCreateView = pageTitle === '创建盘点项目' || pageTitle === '编辑盘点项目'; const isSnapshotView = pageTitle === '盘点项目详情';
      if (isCreateView) {
        baseCards.forEach((card) => { const title = getCardTitle(card); if (title !== '盘点规则' && title !== '图片上传规则配置') return; const item = card.closest('.ant-space-item') || card; item.dataset.assetInventoryV2Hidden = 'true'; item.style.display = 'none'; });
        const rangeCard = baseCards.find((card) => getCardTitle(card) === '盘点范围筛选'); if (rangeCard) { const rangeItem = rangeCard.closest('.ant-space-item') || rangeCard; let slot = base.querySelector('[data-asset-inventory-v2-image-slot="true"]'); if (!slot) { slot = document.createElement('div'); slot.className = rangeItem.className || 'ant-space-item'; slot.dataset.assetInventoryV2ImageSlot = 'true'; rangeItem.parentNode?.insertBefore(slot, rangeItem.nextSibling); } setImageRuleSlot((current) => current === slot ? current : slot); }
        const assetRangeCard = baseCards.find((card) => getCardTitle(card) === '盘点资产范围明细'); if (assetRangeCard) { const configButton = Array.from(assetRangeCard.querySelectorAll('button')).find((button) => button.textContent?.trim() === '配置'); if (configButton) { configButton.dataset.assetInventoryV2Hidden = 'true'; configButton.style.display = 'none'; } }
        return;
      }
      removeImageRuleSlot(); if (isSnapshotView) baseCards.forEach((card) => { if (getCardTitle(card) !== '图片上传规则配置') return; const item = card.closest('.ant-space-item') || card; item.dataset.assetInventoryV2Hidden = 'true'; item.style.display = 'none'; });
    };
    const scheduleApply = () => { if (frameId) cancelAnimationFrame(frameId); frameId = requestAnimationFrame(() => { frameId = 0; applyVariant(); }); };
    applyVariant(); const observer = new MutationObserver(scheduleApply); observer.observe(base, { childList: true, subtree: true });
    return () => { observer.disconnect(); if (frameId) cancelAnimationFrame(frameId); restoreVariantChanges(); const existing = base.querySelector('[data-asset-inventory-v2-image-slot="true"]'); if (existing) existing.remove(); };
  }, []);
  const overlayOpen = customBuilderOpen || planViewOpen || Boolean(activePlan) || imageReviewOpen; const showProjectListV2 = !overlayOpen && basePageTitle === '盘点项目';
  return <div ref={rootRef} className="w-full" onClickCapture={interceptNavigation}>
    {showProjectListV2 && <AssetInventoryProjectListV2 onCreate={() => triggerBaseAction(null, 'create')} onOpenProject={(row) => triggerBaseAction(row, 'project')} onOpenPlans={(row) => openPlanViewByProject(row)} onOpenProgress={(row) => triggerBaseAction(row, 'progress')} onOpenImageReview={(row) => { setPlanProject(resolveProjectFromRow(row)); setImageReviewOpen(true); }} />}
    {customBuilderOpen && <AssetInventoryCustomPlanBuilder onBack={() => setCustomBuilderOpen(false)} onConfirmPlan={() => openPlanView(null, true)} />}
    {planViewOpen && !activePlan && <AssetInventoryPlansV2Refined project={planProject} onBack={() => setPlanViewOpen(false)} onOpenPlanAssets={(plan) => setActivePlan(plan)} />}
    {activePlan && <AssetInventoryPlanAssetListV2 plan={activePlan} onBack={() => setActivePlan(null)} />}
    {imageReviewOpen && <AssetInventoryImageReviewV2 project={planProject} onBack={() => setImageReviewOpen(false)} />}
    <div ref={baseContainerRef} style={{ display: overlayOpen || showProjectListV2 ? 'none' : 'block' }}><AssetInventoryProjectPage /></div>
    {!overlayOpen && imageRuleSlot ? createPortal(<ImageUploadRuleEditorV2 />, imageRuleSlot) : null}
  </div>;
}
