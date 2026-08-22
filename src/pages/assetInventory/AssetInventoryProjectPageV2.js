import React, { useEffect, useRef, useState } from 'react';
import { Card, InputNumber, Modal, Select, Switch, Table, Typography } from 'antd';
import { createPortal } from 'react-dom';
import AssetInventoryProjectPage from './AssetInventoryProjectPage';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import AssetInventoryProjectListV2 from './AssetInventoryProjectListV2';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
import AssetInventoryImageReviewV2 from './AssetInventoryImageReviewV2';
import AssetInventoryProgressV2 from './AssetInventoryProgressV2';
import AssetInventorySnapshotDetailV2 from './AssetInventorySnapshotDetailV2';
import { AssetInventoryPlanAssetListV2 } from './AssetInventoryPlanViewsV2';
import { ASSET_ROWS, IMAGE_RULE_ROWS, INITIAL_PLAN_ROWS, PROJECT_INFO, PROJECT_ROWS } from './mockData';

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}

function ImageUploadRuleEditorV2() {
  const [rows, setRows] = useState(() => IMAGE_RULE_ROWS.map((row) => ({ ...row, uploadEnabled: false })));
  const multiOptions = (values) => values.map((value) => ({ label: value, value }));
  const changeRow = (key, field, value) => setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row));
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100, fixed: 'left', render: (value) => <Typography.Text>{value || '-'}</Typography.Text> },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 170, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '1', '5', '实习生', '公共'])} onChange={(next) => changeRow(row.key, 'ownerLevel', next)} /> },
    { title: '部门', dataIndex: 'department', width: 170, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '集团总部.MIS部', '搜狐媒体.智能平台'])} onChange={(next) => changeRow(row.key, 'department', next)} /> },
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'])} onChange={(next) => changeRow(row.key, 'category', next)} /> },
    { title: '资产状态', dataIndex: 'assetStatus', width: 160, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '在用', '在库'])} onChange={(next) => changeRow(row.key, 'assetStatus', next)} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['集团'])} onChange={(next) => changeRow(row.key, 'organization', next)} /> },
    { title: 'City', dataIndex: 'city', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['北京市'])} onChange={(next) => changeRow(row.key, 'city', next)} /> },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '融科资讯中心D座', '搜狐媒体大厦'])} onChange={(next) => changeRow(row.key, 'building', next)} /> },
    { title: 'Floor', dataIndex: 'floor', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'B2', '6F', '8F'])} onChange={(next) => changeRow(row.key, 'floor', next)} /> },
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, row) => <InputNumber disabled={!row.uploadEnabled} min={0} max={100} value={value} className="w-full" onChange={(next) => changeRow(row.key, 'percent', next ?? 100)} /> },
    { title: '是否上传图片', width: 120, fixed: 'right', align: 'center', render: (_, row) => <Switch checked={Boolean(row.uploadEnabled)} onChange={(checked) => changeRow(row.key, 'uploadEnabled', checked)} /> },
  ];
  return <Card size="small" title={<CardTitle>图片上传规则配置</CardTitle>}><Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1800 }} pagination={false} /></Card>;
}

function getCardTitle(card) {
  return card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
}

function resolveProjectFromRow(row) {
  if (!row) return PROJECT_INFO;
  return { ...PROJECT_INFO, ...row, status: row.status === '暂存' ? '草稿' : row.status };
}

function getDetailValue(root, label) {
  const labelCell = root?.querySelector?.(`dt[data-prototype-label="${label}"]`);
  return labelCell?.nextElementSibling?.textContent?.trim() || '';
}

function resolveProjectFromDetail(root) {
  if (!root) return PROJECT_INFO;
  return {
    ...PROJECT_INFO,
    projectNo: getDetailValue(root, '项目编号') || PROJECT_INFO.projectNo,
    projectName: getDetailValue(root, '项目名称') || PROJECT_INFO.projectName,
    projectType: getDetailValue(root, '项目类型') || PROJECT_INFO.projectType,
    startDate: getDetailValue(root, '盘点开始时间') || PROJECT_INFO.startDate,
    endDate: getDetailValue(root, '盘点结束时间') || PROJECT_INFO.endDate,
    status: getDetailValue(root, '项目状态') || '快照生成',
    inventoryType: getDetailValue(root, '盘点类型') || PROJECT_INFO.inventoryType,
    period: getDetailValue(root, '盘点期间') || PROJECT_INFO.period,
    snapshotTime: getDetailValue(root, '快照生成日期') || PROJECT_INFO.snapshotTime,
    initialProjectNo: getDetailValue(root, '初盘项目') || PROJECT_INFO.initialProjectNo,
    samplingMode: getDetailValue(root, '抽样方式') || PROJECT_INFO.samplingMode,
    samplingRatio: getDetailValue(root, '比例') || PROJECT_INFO.samplingRatio,
    description: getDetailValue(root, '盘点说明') || PROJECT_INFO.description,
  };
}

function resolveProject(root, sourceElement) {
  const sourceText = sourceElement?.closest?.('tr')?.textContent || '';
  const sourceProject = PROJECT_ROWS.find((row) => sourceText.includes(row.projectNo));
  if (sourceProject) return resolveProjectFromRow(sourceProject);
  const rootText = root?.textContent || '';
  const current = PROJECT_ROWS.find((row) => rootText.includes(row.projectNo));
  return current ? resolveProjectFromRow(current) : resolveProjectFromDetail(root);
}

export default function AssetInventoryProjectPageV2() {
  const rootRef = useRef(null);
  const baseContainerRef = useRef(null);
  const [basePageTitle, setBasePageTitle] = useState('盘点项目');
  const [imageRuleSlot, setImageRuleSlot] = useState(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);
  const [customBuilderSource, setCustomBuilderSource] = useState('snapshot');
  const [planViewOpen, setPlanViewOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [imageReviewOpen, setImageReviewOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [planProject, setPlanProject] = useState(PROJECT_INFO);
  const [planRows, setPlanRows] = useState(() => INITIAL_PLAN_ROWS.map((row) => ({ ...row, status: row.status === '暂存' ? '草稿' : row.status })));
  const [assetPlanMap, setAssetPlanMap] = useState(() => Object.fromEntries(ASSET_ROWS.map((asset) => [asset.key, INITIAL_PLAN_ROWS.some((plan) => plan.planNo === asset.planNo) ? asset.planNo : ''])));

  const activePlanNos = new Set(planRows.map((row) => row.planNo));
  const unplannedSnapshotAssets = ASSET_ROWS.filter((asset) => !assetPlanMap[asset.key] || !activePlanNos.has(assetPlanMap[asset.key]));
  const canManualCreate = unplannedSnapshotAssets.length > 0;

  const resetOverlays = () => {
    setSnapshotOpen(false);
    setCustomBuilderOpen(false);
    setPlanViewOpen(false);
    setActivePlan(null);
    setImageReviewOpen(false);
    setProgressOpen(false);
  };

  const openSnapshotByProject = (project) => {
    resetOverlays();
    setPlanProject(resolveProjectFromRow(project));
    setSnapshotOpen(true);
  };

  const openPlanViewByProject = (project, forceGeneratedStatus = false) => {
    const nextProject = resolveProjectFromRow(project);
    resetOverlays();
    setPlanProject(forceGeneratedStatus ? { ...nextProject, status: '生成盘点计划' } : nextProject);
    setPlanViewOpen(true);
  };

  const openPlanView = (sourceElement, forceGeneratedStatus = false) => {
    openPlanViewByProject(resolveProject(baseContainerRef.current, sourceElement), forceGeneratedStatus);
  };

  const openProgressByProject = (project) => {
    resetOverlays();
    setPlanProject(resolveProjectFromRow(project));
    setProgressOpen(true);
  };

  const triggerBaseAction = (row, action) => {
    const base = baseContainerRef.current;
    if (!base) return;
    if (action === 'create') {
      Array.from(base.querySelectorAll('button')).find((button) => button.textContent?.trim() === '创建项目')?.click();
      return;
    }
    const targetRow = Array.from(base.querySelectorAll('tr')).find((item) => item.textContent?.includes(row.projectNo));
    if (!targetRow) return;
    if (action === 'project') Array.from(targetRow.querySelectorAll('button')).find((button) => button.textContent?.trim() === row.projectName)?.click();
  };

  const openProjectV2 = (row) => {
    const project = resolveProjectFromRow(row);
    if (project.status === '草稿') {
      triggerBaseAction(row, 'project');
      return;
    }
    openSnapshotByProject(project);
  };

  const returnToProjectList = () => {
    resetOverlays();
    const base = baseContainerRef.current;
    const pageTitle = base?.querySelector('h4.ant-typography')?.textContent?.trim() || '';
    if (!base || pageTitle === '盘点项目') return;
    const returnButton = Array.from(base.querySelectorAll('button')).find((button) => button.textContent?.trim() === '返回');
    returnButton?.click();
  };

  const returnToPlans = () => {
    setSnapshotOpen(false);
    setCustomBuilderOpen(false);
    setActivePlan(null);
    setImageReviewOpen(false);
    setProgressOpen(false);
    setPlanViewOpen(true);
  };

  const openManualPlanBuilder = () => {
    resetOverlays();
    setCustomBuilderSource('plans');
    setCustomBuilderOpen(true);
  };

  const openSnapshotPlanBuilder = (project) => {
    setPlanProject(resolveProjectFromRow(project));
    setPlanViewOpen(false);
    setActivePlan(null);
    setImageReviewOpen(false);
    setProgressOpen(false);
    setCustomBuilderSource('snapshot');
    setCustomBuilderOpen(true);
  };

  const closeCustomBuilder = () => {
    setCustomBuilderOpen(false);
    if (customBuilderSource === 'plans') setPlanViewOpen(true);
  };

  const createManualPlans = (draft) => {
    const assets = draft.assets || [];
    const groups = new Map();
    assets.forEach((asset) => {
      const range = asset.inventoryRange || '员工';
      const list = groups.get(range) || [];
      list.push(asset);
      groups.set(range, list);
    });
    const created = Array.from(groups.entries()).map(([range, rangeAssets], index) => {
      const personnel = draft.rows?.find((row) => row.range === range) || {};
      const planNo = `PLAN-20260818-${String(planRows.length + index + 1).padStart(4, '0')}`;
      return {
        key: `manual-${Date.now()}-${index}`,
        planNo,
        planName: groups.size > 1 ? `${draft.planName}-${range}` : draft.planName,
        status: '草稿',
        organization: rangeAssets[0]?.organization || '集团',
        city: rangeAssets[0]?.city || '-',
        range,
        assetCount: rangeAssets.length,
        uncountedCount: rangeAssets.length,
        countedCount: 0,
        startDate: planProject.startDate || PROJECT_INFO.startDate,
        endDate: planProject.endDate || PROJECT_INFO.endDate,
        manager: '-',
        supervisor: personnel.supervisor || '-',
        executor: personnel.executor || '-',
        financialSupervisor: '-',
        assets: rangeAssets,
      };
    });
    if (!created.length) return;
    setPlanRows((current) => [...current, ...created]);
    setAssetPlanMap((current) => {
      const next = { ...current };
      created.forEach((plan) => plan.assets.forEach((asset) => { next[asset.key] = plan.planNo; }));
      return next;
    });
  };

  const handleCustomPlanConfirm = (draft) => {
    if (customBuilderSource === 'plans') {
      createManualPlans(draft);
      setCustomBuilderOpen(false);
      setPlanViewOpen(true);
      return;
    }
    setAssetPlanMap((current) => {
      const next = { ...current };
      (draft.assets || []).forEach((asset) => {
        const targetPlan = planRows.find((plan) => plan.range === asset.inventoryRange);
        if (targetPlan) next[asset.key] = targetPlan.planNo;
      });
      return next;
    });
    setCustomBuilderOpen(false);
    openPlanViewByProject(planProject, true);
  };

  const interceptNavigation = (event) => {
    if (snapshotOpen || customBuilderOpen || planViewOpen || activePlan || imageReviewOpen || progressOpen) return;
    const button = event.target.closest?.('button');
    if (!button) return;
    const text = button.textContent?.trim() || '';
    const pageTitle = baseContainerRef.current?.querySelector('h4.ant-typography')?.textContent?.trim() || '';
    if (text === '生成盘点计划' && pageTitle === '盘点项目详情') {
      event.preventDefault();
      event.stopPropagation();
      const project = resolveProject(baseContainerRef.current, button);
      setPlanProject({ ...project, status: '生成盘点计划' });
      Modal.confirm({
        title: '提示', content: '是否按照默认方式生成盘点计划？', okText: '是', cancelText: '否',
        onOk: () => openPlanViewByProject(project, true),
        onCancel: () => openSnapshotPlanBuilder(project),
      });
      return;
    }
    if (text === '进入计划' || text === '查看计划清单') {
      event.preventDefault(); event.stopPropagation(); openPlanView(button); return;
    }
    if (text === '查看进度') {
      event.preventDefault(); event.stopPropagation(); openProgressByProject(resolveProject(baseContainerRef.current, button)); return;
    }
    if (text === '图片审核') {
      event.preventDefault(); event.stopPropagation(); resetOverlays(); setPlanProject(resolveProject(baseContainerRef.current, button)); setImageReviewOpen(true);
    }
  };

  useEffect(() => {
    const base = baseContainerRef.current;
    if (!base) return undefined;
    let frameId = 0;
    const restoreVariantChanges = () => {
      base.querySelectorAll('[data-asset-inventory-v2-hidden="true"]').forEach((element) => {
        element.style.display = '';
        delete element.dataset.assetInventoryV2Hidden;
      });
    };
    const hideVariantElement = (element) => {
      if (!element) return;
      element.dataset.assetInventoryV2Hidden = 'true';
      element.style.display = 'none';
    };
    const removeImageRuleSlot = () => {
      const existing = base.querySelector('[data-asset-inventory-v2-image-slot="true"]');
      if (existing) existing.remove();
      setImageRuleSlot(null);
    };
    const normalizeDraftLabels = () => {
      base.querySelectorAll('.ant-tag, .ant-select-selection-item').forEach((element) => {
        if (element.textContent?.trim() === '暂存') element.textContent = '草稿';
      });
    };
    const hideInitialOnlyFields = (project, baseCards) => {
      if (project.projectType !== '初盘') return;
      const projectInfoCard = baseCards.find((card) => getCardTitle(card) === '盘点项目信息');
      if (!projectInfoCard) return;
      ['初盘项目', '抽样方式', '比例'].forEach((label) => {
        const labelCell = projectInfoCard.querySelector(`dt[data-prototype-label="${label}"]`);
        hideVariantElement(labelCell);
        if (labelCell?.nextElementSibling?.tagName === 'DD') hideVariantElement(labelCell.nextElementSibling);
      });
    };
    const applyVariant = () => {
      restoreVariantChanges();
      normalizeDraftLabels();
      const pageTitle = base.querySelector('h4.ant-typography')?.textContent?.trim() || '盘点项目';
      setBasePageTitle((current) => current === pageTitle ? current : pageTitle);
      const cards = Array.from(base.querySelectorAll('.ant-card'));
      const baseCards = cards.filter((card) => !card.closest('[data-asset-inventory-v2-image-slot="true"]'));
      const isCreateView = pageTitle === '创建盘点项目' || pageTitle === '编辑盘点项目';
      const isProjectDetail = pageTitle === '盘点项目详情';
      if (isCreateView) {
        baseCards.forEach((card) => {
          const title = getCardTitle(card);
          if (title !== '盘点规则' && title !== '图片上传规则配置') return;
          hideVariantElement(card.closest('.ant-space-item') || card);
        });
        const assetRangeCard = baseCards.find((card) => getCardTitle(card) === '盘点资产范围明细');
        if (assetRangeCard) {
          const configButton = Array.from(assetRangeCard.querySelectorAll('button')).find((button) => button.textContent?.trim() === '配置');
          hideVariantElement(configButton);
          const rangeItem = assetRangeCard.closest('.ant-space-item') || assetRangeCard;
          let slot = base.querySelector('[data-asset-inventory-v2-image-slot="true"]');
          if (!slot) {
            slot = document.createElement('div');
            slot.className = rangeItem.className || 'ant-space-item';
            slot.dataset.assetInventoryV2ImageSlot = 'true';
            rangeItem.parentNode?.insertBefore(slot, rangeItem.nextSibling);
          }
          setImageRuleSlot((current) => current === slot ? current : slot);
        }
        return;
      }
      removeImageRuleSlot();
      if (isProjectDetail) {
        baseCards.forEach((card) => {
          if (getCardTitle(card) !== '图片上传规则配置') return;
          hideVariantElement(card.closest('.ant-space-item') || card);
        });
        hideInitialOnlyFields(resolveProject(base, null), baseCards);
      }
    };
    const scheduleApply = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => { frameId = 0; applyVariant(); });
    };
    applyVariant();
    const observer = new MutationObserver(scheduleApply);
    observer.observe(base, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      restoreVariantChanges();
      const imageSlot = base.querySelector('[data-asset-inventory-v2-image-slot="true"]');
      if (imageSlot) imageSlot.remove();
    };
  }, []);

  useEffect(() => {
    const baseItems = [
      { label: '首页' },
      { label: '资产盘点' },
      { label: '盘点项目（方案二）', onClick: returnToProjectList },
    ];
    let tail = [];
    if (customBuilderOpen) {
      tail = customBuilderSource === 'plans'
        ? [{ label: '盘点计划', onClick: returnToPlans }, { label: '创建盘点计划' }]
        : [{ label: '盘点项目详情', onClick: () => setCustomBuilderOpen(false) }, { label: '创建盘点计划' }];
    } else if (activePlan) {
      tail = [{ label: '盘点计划', onClick: returnToPlans }, { label: '盘点计划资产清单' }];
    } else if (planViewOpen) {
      tail = [{ label: '盘点计划' }];
    } else if (progressOpen) {
      tail = [{ label: '盘点进度' }];
    } else if (imageReviewOpen) {
      tail = [{ label: '图片审核' }];
    } else if (snapshotOpen || basePageTitle === '盘点项目详情') {
      tail = [{ label: '盘点项目详情' }];
    } else if (basePageTitle && basePageTitle !== '盘点项目') {
      tail = [{ label: basePageTitle }];
    }
    const items = tail.length ? [...baseItems, ...tail] : [{ label: '首页' }, { label: '资产盘点' }, { label: '盘点项目（方案二）' }];
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items } }));
  }, [activePlan, basePageTitle, customBuilderOpen, customBuilderSource, imageReviewOpen, planViewOpen, progressOpen, snapshotOpen]);

  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: null } }));
  }, []);

  const nonSnapshotOverlayOpen = customBuilderOpen || planViewOpen || Boolean(activePlan) || imageReviewOpen || progressOpen;
  const showBaseSnapshotV2 = !nonSnapshotOverlayOpen && !snapshotOpen && basePageTitle === '盘点项目详情';
  const overlayOpen = nonSnapshotOverlayOpen || snapshotOpen || showBaseSnapshotV2;
  const showProjectListV2 = !overlayOpen && basePageTitle === '盘点项目';
  const snapshotProject = snapshotOpen ? planProject : resolveProjectFromDetail(baseContainerRef.current);

  return <div ref={rootRef} className="w-full" onClickCapture={interceptNavigation}>
    {showProjectListV2 && <AssetInventoryProjectListV2
      onCreate={() => triggerBaseAction(null, 'create')}
      onOpenProject={openProjectV2}
      onOpenPlans={(row) => openPlanViewByProject(row)}
      onOpenProgress={(row) => openProgressByProject(row)}
      onOpenImageReview={(row) => { resetOverlays(); setPlanProject(resolveProjectFromRow(row)); setImageReviewOpen(true); }}
    />}

    {!customBuilderOpen && (snapshotOpen || showBaseSnapshotV2) && <AssetInventorySnapshotDetailV2
      project={snapshotProject}
      onBack={() => { if (snapshotOpen) setSnapshotOpen(false); else returnToProjectList(); }}
      onOpenPlans={() => openPlanViewByProject(snapshotProject)}
      onGenerateDefault={() => openPlanViewByProject(snapshotProject, true)}
      onGenerateCustom={() => openSnapshotPlanBuilder(snapshotProject)}
    />}

    {customBuilderOpen && <AssetInventoryCustomPlanBuilder initialAssets={customBuilderSource === 'plans' ? unplannedSnapshotAssets : ASSET_ROWS} onBack={closeCustomBuilder} onConfirmPlan={handleCustomPlanConfirm} />}
    {planViewOpen && !activePlan && <AssetInventoryPlansV2Refined project={planProject} rows={planRows} setRows={setPlanRows} canManualCreate={canManualCreate} onManualCreate={openManualPlanBuilder} onBack={() => setPlanViewOpen(false)} onOpenPlanAssets={(plan) => setActivePlan(plan)} />}
    {activePlan && <AssetInventoryPlanAssetListV2 plan={activePlan} onBack={() => setActivePlan(null)} />}
    {imageReviewOpen && <AssetInventoryImageReviewV2 project={planProject} onBack={() => setImageReviewOpen(false)} />}
    {progressOpen && <AssetInventoryProgressV2 project={planProject} onBack={() => setProgressOpen(false)} />}
    <div ref={baseContainerRef} style={{ display: overlayOpen || showProjectListV2 ? 'none' : 'block' }}><AssetInventoryProjectPage /></div>
    {!overlayOpen && imageRuleSlot ? createPortal(<ImageUploadRuleEditorV2 />, imageRuleSlot) : null}
  </div>;
}
