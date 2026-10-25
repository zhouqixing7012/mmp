import { useInventoryOperator } from './useInventoryOperator';
import { inventoryProjectCloseBlockReason } from './inventoryCloseRules';
import { applyInventoryPhotoSnapshot, saveInventoryPhotoSnapshot, getInventoryPhotoSnapshot } from './inventoryPhotoRules';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import AssetInventoryProjectPage from './AssetInventoryProjectPage';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import AssetInventoryProjectListV2 from './AssetInventoryProjectListV2';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
import AssetInventoryImageReviewV2, { buildReviewRows } from './AssetInventoryImageReviewV2';
import AssetInventoryProgressV2 from './AssetInventoryProgressV2';
import AssetInventorySnapshotDetailV2 from './AssetInventorySnapshotDetailV2';
import { AssetInventoryPlanAssetListV2 } from './AssetInventoryPlanViewsV2';
import { ASSET_ROWS, PROJECT_INFO, PROJECT_ROWS } from './mockData';
import { getMobileInventoryResults } from './inventoryMobileResultStore';
import { getPhotoReviewResults } from './inventoryPhotoReviewStore';
import { mergePlanInventoryResult } from './inventoryPlanExport';
import { isSnapshotExecutionAsset } from './inventorySnapshotAssets';
import { buildDefaultInventoryPlans, inventoryDefaultPlanBlockReason, nextInventoryPlanNumber } from './inventoryDefaultPlans';
import { PROJECT_PLAN_ROWS, PROJECT_PLAN_ASSETS } from '../../mock/inventoryProjectPlanMock';
import { getInventoryLocationChangeRequests, getInventoryLocationChanges, ensureInventoryLocationPoolCloseNotification } from './inventoryLocationChangeStore';
import { getImportedInventoryPhotos } from './inventoryPhotoImportStore';
import { readDemoData, writeDemoData } from '../../services/demoStorage';
import { initializeInventoryPlanPersonnel } from './inventoryPlanPersonnel';
import { applyReplayPlanStatuses, getReplaySubmission } from './inventoryReplayReviewStore';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';

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

export default function AssetInventoryProjectPageV2({ variantLabel = '方案二', menuLabel, scopeAssetKeys, onDraftProjectChange } = {}) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [planProject, setPlanProject] = useState(() => readDemoData(`inventory-plan-session:${PROJECT_INFO.projectNo}:${allowedRanges.join('|')}`, null)?.project || PROJECT_INFO);
  const allowedRangeKey = allowedRanges.join('|');
  const sessionKey = useCallback(projectNo => `inventory-plan-session:${projectNo}:${allowedRangeKey}`, [allowedRangeKey]);
  const initialSession = useRef(readDemoData(sessionKey(PROJECT_INFO.projectNo), null)).current;
  const initialPlanRows = (initialSession?.rows || PROJECT_PLAN_ROWS[PROJECT_INFO.projectNo] || []).filter(row => (row.ranges || [row.range]).some(range => allowedRanges.includes(range)));
  const variantMenuLabel = menuLabel || `盘点项目（${variantLabel}）`;
  const rootRef = useRef(null);
  const baseContainerRef = useRef(null);
  const [basePageTitle, setBasePageTitle] = useState('盘点项目');
  const [creator, setCreator] = useInventoryOperator();
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [snapshotEditRequest, setSnapshotEditRequest] = useState(null);
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);
  const [customBuilderSource, setCustomBuilderSource] = useState('snapshot');
  const [planViewOpen, setPlanViewOpen] = useState(false);
  const plansReturnToSnapshot = useRef(false);
  const [activePlan, setActivePlan] = useState(null);
  const [imageReviewOpen, setImageReviewOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [planRows, setPlanRows] = useState(() => initialPlanRows.map((row) => ({ ...row, status: row.status === '暂存' ? '草稿' : row.status })));
  const [projectStatusOverrides, setProjectStatusOverrides] = useState(() => {
    if (typeof window === 'undefined') return {};
    const closedProjectNos = JSON.parse(window.sessionStorage.getItem('assetInventoryClosedProjectNos') || '[]');
    return Object.fromEntries(closedProjectNos.map((projectNo) => [projectNo, '盘点关闭']));
  });
  const handleProjectClose = (project) => {

    if (typeof window !== 'undefined') {
      const closedProjectNos = JSON.parse(window.sessionStorage.getItem('assetInventoryClosedProjectNos') || '[]');
      if (!closedProjectNos.includes(project.projectNo)) closedProjectNos.push(project.projectNo);
      window.sessionStorage.setItem('assetInventoryClosedProjectNos', JSON.stringify(closedProjectNos));
    }
    setProjectStatusOverrides((current) => ({ ...current, [project.projectNo]: '盘点关闭' }));
    try { ensureInventoryLocationPoolCloseNotification({ ...project, status: '盘点关闭' }); }
    catch (error) { Modal.error({ title: '项目已关闭，位置变更通知记录未保存', content: error.message }); }
  };
  const [assetPlanMap, setAssetPlanMap] = useState(() => initialSession?.assetMap || Object.fromEntries(initialPlanRows.flatMap(plan => (plan.assetKeys || []).map(key => [key, plan.planNo]))));
  const [planAssets, setPlanAssets] = useState(() => (initialSession?.assets || PROJECT_PLAN_ASSETS[PROJECT_INFO.projectNo] || ASSET_ROWS).map(asset => ({ ...asset })));
  const availableAssets = planAssets.filter((asset) => isInventoryRangeAllowed(asset, allowedRanges)
    && isSnapshotExecutionAsset(asset, planProject));
  // 地点申请取项目范围母集，不能被执行抽样或计划分配缩小；旧快照只有执行清单时按其明确范围。
  const locationProjectAssetKeys = planProject.scopeSnapshotAssetKeys ?? planProject.snapshotAssetKeys;
  const locationProjectAssets = (getInventoryPhotoSnapshot(planProject.projectNo)?.assets || applyInventoryPhotoSnapshot(planProject.projectNo, ASSET_ROWS)).filter(asset => isInventoryRangeAllowed(asset, allowedRanges)
    && (!locationProjectAssetKeys || locationProjectAssetKeys.includes(asset.key)));
  const projectSessions = useRef(new Map());
  const switchProjectSession = (project) => {
    projectSessions.current.set(planProject.projectNo, { project: planProject, rows: planRows, assetMap: assetPlanMap, assets: planAssets });
    let session = projectSessions.current.get(project.projectNo) || readDemoData(sessionKey(project.projectNo), null);
    if (!session) {
      const rows = (PROJECT_PLAN_ROWS[project.projectNo] || []).filter(row => (row.ranges || [row.range]).some(range => allowedRanges.includes(range))).map(row => ({ ...row, status: row.status === '暂存' ? '草稿' : row.status }));
      const assets = (getInventoryPhotoSnapshot(project.projectNo)?.assets || PROJECT_PLAN_ASSETS[project.projectNo] || ASSET_ROWS).map(asset => ({ ...asset }));
      session = { project: resolveProjectFromRow(project), rows, assets,
        assetMap: Object.fromEntries(rows.flatMap(row => (row.assetKeys || []).map(key => [key, row.planNo]))) };
    }
    session.assets = applyInventoryPhotoSnapshot(project.projectNo, session.assets);
    session.rows = applyReplayPlanStatuses(session.rows, getReplaySubmission(project.projectNo));
    if (session.project.projectType === '初盘') session.assets = session.assets.map(asset => asset.inventoryRange === '机房' ? { ...asset, executor: asset.owner, supervisor: '-' } : asset);
    const nextProject = { ...session.project, status: projectStatusOverrides[project.projectNo] || session.project.status };
    setPlanRows(session.rows); setAssetPlanMap(session.assetMap); setPlanAssets(session.assets); setPlanProject(nextProject);
    return { ...session, project: nextProject };
  };
  useEffect(() => {
    writeDemoData(sessionKey(planProject.projectNo), { project: planProject, rows: planRows, assetMap: assetPlanMap, assets: planAssets });
  }, [planProject, planRows, assetPlanMap, planAssets, sessionKey]);
  const assetsForPlan = (plan) => {
    const results = getMobileInventoryResults(planProject.projectNo);
    const photoReviews = new Map(getPhotoReviewResults(planProject.projectNo).map((review) => [review.assetTag, review]));
    return planAssets.filter((asset) => assetPlanMap[asset.key] === plan.planNo && isSnapshotExecutionAsset(asset, planProject))
      .map(asset => mergePlanInventoryResult({ ...asset, planNo: plan.planNo, planName: plan.planName }, results[asset.assetTag], photoReviews.get(asset.assetTag)));
  };
  const changePlanAssets = (plan, updater) => setPlanAssets((current) => {
    const currentRows = current.filter((asset) => assetPlanMap[asset.key] === plan.planNo);
    const updated = typeof updater === 'function' ? updater(currentRows) : updater;
    const replacements = new Map(updated.map((asset) => [asset.key, asset]));
    return current.map((asset) => replacements.get(asset.key) || asset);
  });

  const closeBlockReasonForProject = (project) => {
    const active = project.projectNo === planProject.projectNo;
    const session = active ? { rows: planRows, assets: planAssets } : projectSessions.current.get(project.projectNo);
    const plans = applyReplayPlanStatuses(session?.rows ?? readDemoData(sessionKey(project.projectNo), null)?.rows ?? PROJECT_PLAN_ROWS[project.projectNo] ?? [], getReplaySubmission(project.projectNo));
    const snapshot = getInventoryPhotoSnapshot(project.projectNo);
    const scope = snapshot?.assets ?? session?.assets ?? PROJECT_PLAN_ASSETS[project.projectNo];
    const tags = new Set((scope || []).map(asset => asset.assetTag));
    const photoRows = scope ? buildReviewRows(project.projectNo, project.scopeRanges || allowedRanges).filter(row => tags.has(row.asset.assetTag))
      : getPhotoReviewResults(project.projectNo).map(entry => ({ asset: { assetTag: entry.assetTag }, reviewStatus: { 审核中: '待审核', 已盘: '审核通过', 未盘: '审核不通过' }[entry.status] }));
    return inventoryProjectCloseBlockReason({ ...project, replayPlans: plans }, { plans, photoRows, replaySubmission: getReplaySubmission(project.projectNo) });
  };

  const activePlanNos = new Set(planRows.filter((row) => (row.ranges || [row.range]).some(range => allowedRanges.includes(range))).map((row) => row.planNo));
  const unplannedSnapshotAssets = availableAssets.filter((asset) => !assetPlanMap[asset.key] || !activePlanNos.has(assetPlanMap[asset.key]));
  const canManualCreate = unplannedSnapshotAssets.length > 0;

  const resetOverlays = useCallback(() => {
    setSnapshotOpen(false);
    setCustomBuilderOpen(false);
    setPlanViewOpen(false);
    setActivePlan(null);
    setImageReviewOpen(false);
    setProgressOpen(false);
  }, []);

  const openSnapshotByProject = (project) => {
    resetOverlays();
    switchProjectSession(project);
    setSnapshotOpen(true);
  };

  const openPlanViewByProject = (project, forceGeneratedStatus = false, fromSnapshot = false) => {
    plansReturnToSnapshot.current = fromSnapshot;
    const session = switchProjectSession(project);
    const nextProject = session.project;
    if (forceGeneratedStatus && !session.rows.length) {
      const selectedAssets = session.assets.filter((asset) => (nextProject.snapshotAssetKeys ? nextProject.snapshotAssetKeys.includes(asset.key) : asset.executeInventory) && isInventoryRangeAllowed(asset, allowedRanges));
      const reason = inventoryDefaultPlanBlockReason(nextProject, selectedAssets);
      if (reason) { Modal.warning({ title: '无法生成默认计划', content: reason }); return false; }
      const generated = buildDefaultInventoryPlans(nextProject, selectedAssets);
      setPlanRows(generated);
      const generatedAssets = new Map(generated.flatMap(plan => plan.assets.map(asset => [asset.key, asset])));
      setPlanAssets(session.assets.map(asset => generatedAssets.get(asset.key) || asset));
      setAssetPlanMap(Object.fromEntries(generated.flatMap(plan => plan.assets.map(asset => [asset.key, plan.planNo]))));
      setProjectStatusOverrides(current => ({ ...current, [nextProject.projectNo]: '生成盘点计划' }));
    } else if (nextProject.projectType === '复盘') {
      setPlanRows((current) => current.map((row) => ({ ...row, financialSupervisor: '徐博' })));
    }
    resetOverlays();
    setPlanProject(nextProject.status === '盘点关闭' ? nextProject : forceGeneratedStatus ? { ...nextProject, status: '生成盘点计划' } : nextProject);
    setPlanViewOpen(true);
    return true;
  };

  const openPlanView = (sourceElement, forceGeneratedStatus = false) => {
    openPlanViewByProject(resolveProject(baseContainerRef.current, sourceElement), forceGeneratedStatus, baseContainerRef.current?.querySelector('h4.ant-typography')?.textContent?.trim() === '盘点项目详情');
  };

  const openProgressByProject = (project) => {
    resetOverlays();
    switchProjectSession(project);
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
    const project = { ...resolveProjectFromRow(row), status: projectStatusOverrides[row.projectNo] || row.status };
    if (project.status === '草稿') {
      triggerBaseAction(row, 'project');
      return;
    }
    openSnapshotByProject(project);
  };

  const returnToProjectList = useCallback(() => {
    resetOverlays();
    const base = baseContainerRef.current;
    const pageTitle = base?.querySelector('h4.ant-typography')?.textContent?.trim() || '';
    if (!base || pageTitle === '盘点项目') return;
    const returnButton = Array.from(base.querySelectorAll('button')).find((button) => button.textContent?.replace(/\s/g, '') === '返回');
    returnButton?.click();
  }, [resetOverlays]);

  const restoreSnapshotDraft = (project) => {
    // 只处理无后续计划/结果的快照，已有计划的撤销边界尚未确认。
    if (!['快照生成', '生成盘点计划'].includes(project.status) || planRows.some(row => row.status !== '草稿')
      || Object.keys(getMobileInventoryResults(project.projectNo)).length || getPhotoReviewResults(project.projectNo).length
      || getImportedInventoryPhotos(project.projectNo).length || getInventoryLocationChangeRequests(project.projectNo).length || getInventoryLocationChanges(project.projectNo).length
      || readDemoData(`inventory-replay-review-${project.projectNo}`, null)) return false;
    const draft = { ...project, status: '草稿', snapshotTime: '-' };
    setProjectStatusOverrides((current) => ({ ...current, [project.projectNo]: '草稿' }));
    setPlanProject(draft);
    setPlanRows([]); setAssetPlanMap({});
    projectSessions.current.set(project.projectNo, { project: draft, rows: [], assetMap: {}, assets: planAssets });
    setSnapshotEditRequest({ project: draft });
    resetOverlays();
    return true;
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
    if (planProject?.status === '盘点关闭') return;
    resetOverlays();
    setCustomBuilderSource('plans');
    setCustomBuilderOpen(true);
  };

  const openSnapshotPlanBuilder = (project) => {
    if (project?.status === '盘点关闭') return;
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
    if (planProject?.status === '盘点关闭') throw new Error('项目已关闭，不能生成计划');
    const eligible = new Set(unplannedSnapshotAssets.map(asset => asset.key));
    if ((draft.assets || []).some(asset => !eligible.has(asset.key))) throw new Error('资产范围或分配已变化，请重新选择未分配资产');
    if (!draft.planName?.trim()) throw new Error('请填写计划名称');
    const assets = (draft.assets || []).filter((asset) => isInventoryRangeAllowed(asset, allowedRanges));
    const groups = new Map();
    assets.forEach((asset) => {
      const range = asset.inventoryRange || '员工';
      const list = groups.get(range) || [];
      list.push(asset);
      groups.set(range, list);
    });
    const created = Array.from(groups.entries()).map(([range, sourceAssets], index) => {
      const personnel = draft.rows?.find((row) => row.range === range) || {};
      const rangeAssets = initializeInventoryPlanPersonnel(planProject, sourceAssets, personnel, 'custom');
      const planNo = nextInventoryPlanNumber(planProject.projectType, planRows, index);
      return {
        key: `manual-${Date.now()}-${index}`,
        planNo,
        planName: groups.size > 1 ? `${draft.planName}-${range}` : draft.planName,
        status: '草稿',
        organization: [...new Set(rangeAssets.map(asset => asset.organization).filter(Boolean))].join('、'),
        city: [...new Set(rangeAssets.map(asset => asset.city).filter(Boolean))].join('、'),
        department: [...new Set(rangeAssets.map(asset => ['库房', '公共'].includes(asset.inventoryRange) ? '虚拟组织' : String(asset.ownerDept || '').split('.')[0]).filter(Boolean))].join('、'),
        range,
        assetCount: rangeAssets.length,
        uncountedCount: rangeAssets.length,
        countedCount: 0,
        startDate: planProject.startDate || PROJECT_INFO.startDate,
        endDate: planProject.endDate || PROJECT_INFO.endDate,
        supervisor: personnel.supervisor || '-',
        executor: personnel.executor || '-',
        financialSupervisor: planProject.projectType === '复盘' ? '徐博' : '-',
        assets: rangeAssets,
      };
    });
    if (!created.length) throw new Error('没有可生成计划的资产');
    setPlanRows((current) => [...current, ...created]);
    const replacements = new Map(created.flatMap(plan => plan.assets.map(asset => [asset.key, asset])));
    setPlanAssets(current => current.map(asset => replacements.get(asset.key) || asset));
    setAssetPlanMap((current) => {
      const next = { ...current };
      created.forEach((plan) => plan.assets.forEach((asset) => { next[asset.key] = plan.planNo; }));
      return next;
    });
  };

  const generateRemainingDefaultPlans = () => {
    const reason = inventoryDefaultPlanBlockReason(planProject, unplannedSnapshotAssets);
    if (reason) { Modal.warning({ title: '无法生成默认计划', content: reason }); return false; }
    const generated = buildDefaultInventoryPlans(planProject, unplannedSnapshotAssets, planRows);
    setPlanRows(current => [...current, ...generated]);
    const replacements = new Map(generated.flatMap(plan => plan.assets.map(asset => [asset.key, asset])));
    setPlanAssets(current => current.map(asset => replacements.get(asset.key) || asset));
    setAssetPlanMap(current => ({ ...current, ...Object.fromEntries(generated.flatMap(plan => plan.assets.map(asset => [asset.key, plan.planNo]))) }));
  };

  const handleCustomPlanConfirm = (draft) => {
    try {
      createManualPlans(draft);
      if (customBuilderSource === 'snapshot') plansReturnToSnapshot.current = true;
      resetOverlays();
      if (!planRows.length) {
        setPlanProject(current => ({ ...current, status: '生成盘点计划' }));
        setProjectStatusOverrides(current => ({ ...current, [planProject.projectNo]: '生成盘点计划' }));
      }
      setPlanViewOpen(true);
    } catch (error) { Modal.error({ title: '无法生成盘点计划', content: error.message }); }
  };

  const interceptNavigation = (event) => {
    if (snapshotOpen || customBuilderOpen || planViewOpen || activePlan || imageReviewOpen || progressOpen) return;
    const button = event.target.closest?.('button');
    if (!button) return;
    if (!baseContainerRef.current?.contains(button)) return;
    const text = button.textContent?.trim() || '';
    const pageTitle = baseContainerRef.current?.querySelector('h4.ant-typography')?.textContent?.trim() || '';
    if (text === '生成盘点计划' && pageTitle === '盘点项目详情') {
      event.preventDefault();
      event.stopPropagation();
      const project = resolveProject(baseContainerRef.current, button);
      Modal.confirm({
        title: '提示', content: project.projectType === '复盘' ? (project.scopeRanges?.includes('机房') ? '是否按机房汇总生成复盘计划？' : '是否按楼层汇总生成复盘计划？') : '是否按子公司＋盘点范围生成盘点计划？', okText: '是', cancelText: '否',
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
      event.preventDefault(); event.stopPropagation(); resetOverlays(); switchProjectSession(resolveProject(baseContainerRef.current, button)); setImageReviewOpen(true);
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
          if (title !== '盘点规则') return;
          hideVariantElement(card.closest('.ant-space-item') || card);
        });
        const assetRangeCard = baseCards.find((card) => getCardTitle(card) === '盘点资产范围明细');
        if (assetRangeCard) {
          const configButton = Array.from(assetRangeCard.querySelectorAll('button')).find((button) => button.textContent?.trim() === '配置');
          hideVariantElement(configButton);
          const disallowedAssetTags = ASSET_ROWS.filter((asset) => !isInventoryRangeAllowed(asset, allowedRanges)).map((asset) => asset.assetTag).filter(Boolean);
          assetRangeCard.querySelectorAll('tbody tr').forEach((row) => {
            if (disallowedAssetTags.some((tag) => row.textContent?.includes(tag))) hideVariantElement(row);
          });

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
  }, [allowedRangeKey, allowedRanges]);

  useEffect(() => {
    const baseItems = [
      { label: '首页' },
      { label: '资产盘点' },
      { label: variantMenuLabel, onClick: returnToProjectList },
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
    const items = tail.length ? [...baseItems, ...tail] : [{ label: '首页' }, { label: '资产盘点' }, { label: variantMenuLabel }];
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items } }));
  }, [activePlan, basePageTitle, customBuilderOpen, customBuilderSource, imageReviewOpen, planViewOpen, progressOpen, returnToProjectList, snapshotOpen, variantMenuLabel]);

  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: null } }));
  }, []);

  const nonSnapshotOverlayOpen = customBuilderOpen || planViewOpen || Boolean(activePlan) || imageReviewOpen || progressOpen;
  const showBaseSnapshotV2 = !nonSnapshotOverlayOpen && !snapshotOpen && basePageTitle === '盘点项目详情';
  const overlayOpen = nonSnapshotOverlayOpen || snapshotOpen || showBaseSnapshotV2;
  const showProjectListV2 = !overlayOpen && basePageTitle === '盘点项目';
  const snapshotSource = (snapshotOpen || showBaseSnapshotV2) ? planProject : resolveProjectFromDetail(baseContainerRef.current);
  const snapshotProject = { ...snapshotSource, status: projectStatusOverrides[snapshotSource.projectNo] || snapshotSource.status };

  return <div ref={rootRef} className="w-full" onClickCapture={interceptNavigation}>
    {showProjectListV2 && <AssetInventoryProjectListV2
      creator={creator}
      onCreatorChange={setCreator}
      onCreate={() => triggerBaseAction(null, 'create')}
      onOpenProject={openProjectV2}
      getCloseBlockReason={closeBlockReasonForProject}
      onCloseProject={handleProjectClose}
      statusOverrides={projectStatusOverrides}
      onOpenPlans={(row) => openPlanViewByProject(row)}
      onOpenProgress={(row) => openProgressByProject(row)}
      onOpenImageReview={(row) => { resetOverlays(); switchProjectSession(row); setImageReviewOpen(true); }}
    />}

    {!customBuilderOpen && (snapshotOpen || showBaseSnapshotV2) && <AssetInventorySnapshotDetailV2
      key={snapshotProject.projectNo}
      project={snapshotProject}
      assets={planAssets.map(asset => mergePlanInventoryResult({ ...asset, planNo: assetPlanMap[asset.key] || '-' }, getMobileInventoryResults(snapshotProject.projectNo)[asset.assetTag], getPhotoReviewResults(snapshotProject.projectNo).find(review => review.assetTag === asset.assetTag)))}
      onSnapshotRowsChange={(execution, notExecution) => {
        saveInventoryPhotoSnapshot(snapshotProject, [...execution.map(asset => ({ ...asset, executeInventory: true })), ...notExecution.map(asset => ({ ...asset, executeInventory: false }))]);
        const inactiveKeys = new Set(notExecution.map(asset => asset.key));
        setAssetPlanMap(current => Object.fromEntries(Object.entries(current).filter(([key]) => !inactiveKeys.has(key))));
        const replacements = new Map([...execution, ...notExecution].map(asset => [asset.key, asset]));
        setPlanAssets(current => [...current.map(asset => replacements.get(asset.key) || asset), ...[...replacements.values()].filter(asset => !current.some(existing => existing.key === asset.key))]);
        setPlanProject(current => ({ ...current, snapshotAssetKeys: execution.map(asset => asset.key), scopeSnapshotAssetKeys: [...execution, ...notExecution].map(asset => asset.key) }));
      }}
      onCloseProject={handleProjectClose}
      getCloseBlockReason={closeBlockReasonForProject}
      onDeleteSnapshot={restoreSnapshotDraft}
      onBack={returnToProjectList}
      onOpenPlans={() => openPlanViewByProject(snapshotProject, false, true)}
      onGenerateDefault={() => openPlanViewByProject(snapshotProject, true, true)}
      onGenerateCustom={() => openSnapshotPlanBuilder(snapshotProject)}
    />}

    {customBuilderOpen && <AssetInventoryCustomPlanBuilder project={planProject} initialAssets={unplannedSnapshotAssets} onBack={closeCustomBuilder} onConfirmPlan={handleCustomPlanConfirm} />}
    {planViewOpen && !activePlan && <AssetInventoryPlansV2Refined project={planProject} projectAssets={locationProjectAssets} onPlansStarted={(project) => { setPlanProject(project); setProjectStatusOverrides((current) => ({ ...current, [project.projectNo]: '盘点中' })); }} currentOperator={creator} onChangePlanAssets={changePlanAssets} rows={planRows} setRows={setPlanRows} assetsForPlan={assetsForPlan} canManualCreate={canManualCreate && planProject?.status !== '盘点关闭'} onManualCreate={openManualPlanBuilder} onGenerateRemainingDefault={generateRemainingDefaultPlans} onBack={() => { setPlanViewOpen(false); if (plansReturnToSnapshot.current) setSnapshotOpen(true); }} onOpenPlanAssets={(plan) => setActivePlan(plan)} />}
    {activePlan && <AssetInventoryPlanAssetListV2 currentOperator={creator} plan={planRows.find(row => row.planNo === activePlan.planNo) || activePlan} project={planProject} assets={assetsForPlan(planRows.find(row => row.planNo === activePlan.planNo) || activePlan)} onAssetsChange={(updater) => changePlanAssets(activePlan, updater)} onBack={() => setActivePlan(null)} />}
    {imageReviewOpen && <AssetInventoryImageReviewV2 project={planProject} onBack={() => setImageReviewOpen(false)} />}
    {progressOpen && <AssetInventoryProgressV2 project={planProject} plans={planRows} assetsForPlan={assetsForPlan} onBack={() => setProgressOpen(false)} />}
    <div ref={baseContainerRef} style={{ display: overlayOpen || showProjectListV2 ? 'none' : 'block' }}><AssetInventoryProjectPage getCloseBlockReason={closeBlockReasonForProject} onCloseProject={handleProjectClose} onDraftProjectChange={onDraftProjectChange} creator={creator} scopeAssetKeys={scopeAssetKeys} snapshotEditRequest={snapshotEditRequest} onProjectGenerated={(project) => {
      setProjectStatusOverrides((current) => ({ ...current, [project.projectNo]: '快照生成' }));
      setPlanProject(project);
      setPlanRows([]);
      setAssetPlanMap({});
      setPlanAssets((getInventoryPhotoSnapshot(project.projectNo)?.assets || []).map((asset) => ({
        ...asset, inventoryStatus: '未盘', counter: '-', inventoryDate: '-',
        inventoryNote: '-', importMode: '-',
      })));
      setSnapshotOpen(true);
    }} /></div>
  </div>;
}
