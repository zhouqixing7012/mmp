import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flashlight,
  ImagePlus,
  ListChecks,
  ScanLine,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button, Input, Modal, Tag, message as antdMessage } from 'antd';
import './assetInventoryMobile.css';
import { getPhotoReviewResults, savePhotoReviewResult } from './inventoryPhotoReviewStore';
import mobileScanReference from './images/mobile-scan-reference.png';
import { INVENTORY_MOBILE_ASSETS as DEMO_ASSETS } from '../../mock/inventoryMobileMock';
import { getAssetMaintenanceRows, updateAssetMaintenanceRow } from '../../services/assetManagementService';
import { recordInventoryLocationChange } from './inventoryLocationChangeStore';
import { getInventoryLocationOptions } from './inventoryMobileLocationService';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';

const CURRENT_USER = {
  name: '孙志强',
  employeeNo: '201132000160',
  isESAssetGroup: true,
};

const DEMO_CONTEXTS = [
  { id: 'initial', label: '初盘演示', projectNo: '', projectType: '初盘', scopeRanges: ['员工', '库房', '机房'] },
  { id: 'public', label: '公共地点演示', projectNo: 'CP-202608180002', projectType: '初盘', scopeRanges: ['公共'] },
  { id: 'review', label: '复盘地点演示', projectNo: 'RCP-202608180001', projectType: '复盘', scopeRanges: ['员工', '公共', '库房'] },
];

// 原型演示计划与资产关联，仅用于展示当前用户作为监督人的计划入口。
const DEMO_SUPERVISED_PLANS = [
  { id: 'employee-plan', name: '北京市盘点计划-员工盘点', projectType: '初盘', supervisor: CURRENT_USER.name, assetIds: ['asset-001', 'asset-002', 'asset-003', 'asset-004'] },
  { id: 'warehouse-plan', name: '北京市盘点计划-库房盘点', projectType: '初盘', supervisor: CURRENT_USER.name, assetIds: ['asset-005'] },
  { id: 'machine-plan', name: '北京市盘点计划-机房盘点', projectType: '初盘', supervisor: null, assetIds: ['asset-006', 'asset-007'] },
  { id: 'public-plan-demo', name: '北京市盘点计划-公共盘点', contextId: 'public', projectType: '初盘', supervisor: CURRENT_USER.name, assetIds: ['asset-public-demo'] },
  { id: 'review-plan-demo', name: '北京市复盘计划', contextId: 'review', projectType: '复盘', supervisor: CURRENT_USER.name, assetIds: ['asset-001', 'asset-002', 'asset-003', 'asset-004', 'asset-public-demo'] },
];

const TAB_GROUPS = {
  unscanned: [
    { key: '未盘', label: '未盘' },
    { key: '报失', label: '报失' },
  ],
  scanned: [
    { key: '审核中', label: '审核中' },
    { key: '已盘', label: '已盘' },
    { key: '代盘', label: '代盘' },
    { key: '未执行盘点', label: '未执行' },
  ],
};

const STATUS_COLORS = {
  未盘: 'blue',
  报失: 'red',
  已盘: 'green',
  审核中: 'gold',
  代盘: 'orange',
  未执行盘点: 'default',
};

const SCAN_COPY = {
  mine: {
    title: '找到自己的资产',
    message: '您已成功找到这枚资产，确认提交本次盘点吗？',
    confirm: '提交',
  },
  proxy: {
    title: '发现他人资产',
    message: '您找到的是库房管理员-SOHU的资产，帮忙提交一下吧~',
    confirm: '提交',
    reject: '拒绝',
  },
  scanned: {
    title: '资产已完成盘点',
    message: '该资产已被扫过了，您还有未盘到的资产哦，不要气馁，继续吧~',
  },
  outOfScope: {
    title: '资产不在盘点范围',
    message: '这枚设备不在盘点范围中，此般热情让人感动。您还有未盘到的资产哦，继续吧~',
  },
  network: {
    title: '提交失败',
    message: '未能连接网络，请检查网络信号后再次提交~',
    confirm: '好的',
  },
};

function includesQuery(asset, query) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return [asset.assetDesc, asset.tagNo, asset.serialNo]
    .some((value) => String(value || '').toLowerCase().includes(normalized));
}

function formatStatusCount(assets, status) {
  return assets.filter((asset) => asset.status === status).length;
}

function canInventory(asset) {
  return ['未盘', '报失'].includes(asset?.status);
}

function assetLocation(asset) {
  const [city = '', building = '', floor = ''] = String(asset?.address || '').split('-');
  return { city, building, floor };
}

function loadProjectAssets(projectNo) {
  const ledger = new Map(getAssetMaintenanceRows().map((asset) => [asset.tag, asset]));
  const results = getMobileInventoryResults(projectNo);
  return DEMO_ASSETS.map((asset) => {
    const row = ledger.get(asset.tagNo);
    return { ...asset, lossReported: asset.status === '报失', ...results[asset.tagNo], address: row ? [row.city, row.building, row.floor].join('-') : asset.address };
  });
}

function MobileHeader({ title, onBack, onExit, right }) {
  return (
    <div className="inventory-mobile-header">
      <Button
        type="text"
        shape="circle"
        aria-label="返回"
        icon={<ArrowLeft size={20} />}
        onClick={onBack}
      />
      <span className="inventory-mobile-title">{title}</span>
      <div className="inventory-mobile-header-right">
        {right}
        <Button
          type="text"
          shape="circle"
          aria-label="退出"
          icon={<X size={20} />}
          onClick={onExit}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>;
}

function AssetCard({ asset, onClick }) {
  const showDate = ['审核中', '已盘', '代盘'].includes(asset.status)
    ? asset.inventoryDate
    : asset.dueDate;
  return (
    <button type="button" className="inventory-asset-card" onClick={onClick}>
      <div className="inventory-asset-thumb" data-photo-kind={asset.lastPhoto || 'empty'}>
        {asset.lastPhoto ? <Camera size={18} /> : <ImagePlus size={18} />}
      </div>
      <div className="inventory-asset-card-body">
        <div className="inventory-asset-card-title">
          <span>{asset.assetDesc}</span>
          <ChevronRight size={17} />
        </div>
        <div className="inventory-asset-card-meta">
          <StatusBadge status={asset.status} />
          <span>{asset.tagNo}</span>
        </div>
        <div className="inventory-asset-card-line">序列号：{asset.serialNo}</div>
        <div className="inventory-asset-card-line">
          {asset.status === '已盘' || asset.status === '代盘' ? '盘点日期' : '盘点截止日期'}：{showDate || '-'}
        </div>
      </div>
    </button>
  );
}

function AssetGroupHeading({ label, count, collapsed, onToggle }) {
  return <button type="button" className="inventory-asset-group-heading" aria-label={`${label}—共${count}条`} aria-expanded={!collapsed} onClick={onToggle}>
    <span>{label}</span>
    <span className="inventory-asset-group-meta"><span className="inventory-asset-group-count">{count} 条</span>{collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}</span>
  </button>;
}

function DetailRow({ label, value }) {
  return (
    <div className="inventory-detail-row">
      <span className="inventory-detail-label">{label}</span>
      <span className="inventory-detail-value">{value || '-'}</span>
    </div>
  );
}

function PhotoSlot({ label, added, onAdd, onRemove }) {
  return (
    <div className="inventory-photo-slot">
      <div className={`inventory-photo-preview ${added ? 'is-added' : ''}`}>
        {added ? <CheckCircle2 size={20} /> : <ImagePlus size={22} />}
      </div>
      <div className="inventory-photo-label">{label}</div>
      {added ? (
        <Button type="text" danger size="small" icon={<Trash2 size={14} />} onClick={onRemove}>删除</Button>
      ) : (
        <Button type="text" size="small" icon={<Camera size={14} />} onClick={onAdd}>拍照</Button>
      )}
    </div>
  );
}

function ScanPicker({ onSelect }) {
  return (
    <div className="inventory-scan-picker">
      <div className="inventory-section-title">模拟扫码结果</div>
      <div className="inventory-scan-picker-grid">
        <Button onClick={() => onSelect('mine')}>扫描本人资产</Button>
        <Button onClick={() => onSelect('proxy')}>扫描他人资产</Button>
        <Button onClick={() => onSelect('scanned')}>扫描已盘资产</Button>
        <Button onClick={() => onSelect('outOfScope')}>扫描范围外资产</Button>
        <Button onClick={() => onSelect('network')}>模拟网络失败</Button>
      </div>
    </div>
  );
}

function ScanResultModal({ scanModal, onClose }) {
  if (!scanModal) return null;
  const copy = SCAN_COPY[scanModal.kind];
  return (
    <Modal
      open
      wrapClassName="inventory-mobile-modal"
      title={copy.title}
      footer={null}
      centered
      onCancel={onClose}
      destroyOnClose
    >
      <p className="inventory-modal-message">{copy.message}</p>
      <div className="inventory-modal-actions">
        <Button type="primary" onClick={onClose}>{copy.confirm || '再接再厉'}</Button>
        {['scanned', 'outOfScope'].includes(scanModal.kind) && <Button onClick={onClose}>休息一下</Button>}
      </div>
    </Modal>
  );
}

export default function AssetInventoryMobilePrototype() {
  const navigate = useNavigate();
  const location = useLocation();
  const [demoContextId, setDemoContextId] = useState('initial');
  const demoContext = DEMO_CONTEXTS.find((context) => context.id === demoContextId) || DEMO_CONTEXTS[0];
  const hasRouteProject = Boolean(location.state?.projectNo);
  const previewProjectNo = hasRouteProject ? location.state.projectNo : demoContext.projectNo;
  const projectType = hasRouteProject ? (location.state.projectType || '初盘') : demoContext.projectType;
  const currentUser = location.state?.mobileUser || CURRENT_USER;
  const projectRanges = location.state?.scopeRanges || (hasRouteProject ? ['员工', '公共', '库房', '机房'] : demoContext.scopeRanges);
  const [projectClosed, setProjectClosed] = useState(() => {
    if (typeof window === 'undefined' || !previewProjectNo) return false;
    return JSON.parse(window.sessionStorage.getItem('assetInventoryClosedProjectNos') || '[]').includes(previewProjectNo);
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !previewProjectNo) { setProjectClosed(false); return; }
    setProjectClosed(JSON.parse(window.sessionStorage.getItem('assetInventoryClosedProjectNos') || '[]').includes(previewProjectNo));
  }, [previewProjectNo, location.key]);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [view, setView] = useState('workbench');
  const [scanReturnView, setScanReturnView] = useState('workbench');
  const [activeTab, setActiveTab] = useState('unscanned');
  const [collapsedGroups, setCollapsedGroups] = useState([]);
  const [scanTargetId, setScanTargetId] = useState(null);
  const [scanPlanId, setScanPlanId] = useState(null);
  const [scannedDetail, setScannedDetail] = useState(false);
  const [quickPhotoMode, setQuickPhotoMode] = useState(false);
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const [collapsedPlanSections, setCollapsedPlanSections] = useState([]);
  const [detailReturnView, setDetailReturnView] = useState('workbench');
  const [quickPlanId, setQuickPlanId] = useState(null);
  const [assets, setAssets] = useState(() => loadProjectAssets(previewProjectNo));
  useEffect(() => {
    const results = new Map(getPhotoReviewResults(previewProjectNo).map((entry) => [entry.assetTag, entry]));
    setAssets((current) => current.map((asset) => results.has(asset.tagNo)
      ? { ...asset, status: results.get(asset.tagNo).status }
      : asset));
  }, [previewProjectNo, location.key]);
  const [query, setQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [locationDraft, setLocationDraft] = useState({ city: '', building: '', floor: '' });
  const [scanPickerOpen, setScanPickerOpen] = useState(false);
  const [scanModal, setScanModal] = useState(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [photoState, setPhotoState] = useState({});
  const [reportLossOpen, setReportLossOpen] = useState(false);
  const [confirmLossOpen, setConfirmLossOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [quickBatches, setQuickBatches] = useState({});
  const [quickResult, setQuickResult] = useState(null);
  const [quickScanIndex, setQuickScanIndex] = useState(0);
  const [quickLocations, setQuickLocations] = useState({});

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) || null;
  const projectAssets = assets.filter((asset) => projectRanges.includes(asset.area));
  const filteredAssets = projectAssets.filter((asset) => asset.ownerNo === currentUser.employeeNo && includesQuery(asset, query));
  const supervisedPlans = DEMO_SUPERVISED_PLANS.filter((plan) => plan.supervisor === currentUser.name && (!hasRouteProject || (plan.projectType === projectType && projectAssets.some((asset) => plan.assetIds.includes(asset.id)))));
  const activePlan = supervisedPlans.find((plan) => plan.id === activePlanId);
  const activePlanAssets = projectAssets.filter((asset) => activePlan?.assetIds.includes(asset.id));
  const quickBatchKey = quickPlanId || 'personal';
  const quickScanned = quickBatches[quickBatchKey] || [];
  const batchLocations = quickLocations[quickBatchKey] || {};
  const setQuickScanned = (update) => setQuickBatches((current) => {
    const previous = current[quickBatchKey] || [];
    return { ...current, [quickBatchKey]: typeof update === 'function' ? update(previous) : update };
  });
  const isQuickAuthorized = (planId) => {
    const scope = planId ? projectAssets.filter((asset) => DEMO_SUPERVISED_PLANS.find((plan) => plan.id === planId)?.assetIds.includes(asset.id)) : projectAssets;
    const machineContext = planId ? scope.length > 0 && scope.every((asset) => asset.area === '机房') : projectRanges.length === 1 && projectRanges[0] === '机房';
    return currentUser.isESAssetGroup === true || (machineContext && scope.some((asset) => asset.ownerNo === currentUser.employeeNo));
  };
  const canQuickScan = isQuickAuthorized(view === 'planDetail' ? activePlanId : null);
  const quickScope = projectAssets.filter((asset) => (currentUser.isESAssetGroup === true || (asset.area === '机房' && asset.ownerNo === currentUser.employeeNo)) && (!quickPlanId || activePlan?.assetIds.includes(asset.id))).map((asset) => asset.id);

  const switchDemoContext = (context) => {
    if (context.id === demoContextId) return;
    setDemoContextId(context.id);
    setAssets(loadProjectAssets(context.projectNo));
    setView('workbench');
    setActiveTab('unscanned');
    setCollapsedGroups([]);
    setCollapsedPlanSections([]);
    setQuery('');
    setPlanMenuOpen(false);
    setActivePlanId(null);
    setSelectedAssetId(null);
    setScanPlanId(null);
    setScanTargetId(null);
    setScannedDetail(false);
    setPhotoState({});
    setQuickBatches({});
    setQuickLocations({});
  };

  const openDetail = (asset) => {
    setQuickPhotoMode(false);
    setScannedDetail(false);
    setDetailReturnView(view === 'planDetail' ? 'planDetail' : 'workbench');
    setSelectedAssetId(asset.id);
    setLocationDraft(assetLocation(asset));
    setView('detail');
  };

  const returnToProjectList = () => {
    navigate('/yewurules', { state: { returnTo: 'asset-inventory-projects' } });
  };

  const exitToAssetManagement = () => {
    navigate('/yewurules', { state: { returnTo: 'asset-management-home' } });
  };

  const goBack = () => {
    if (view === 'workbench') {
      returnToProjectList();
      return;
    }
    setView(view === 'detail' ? (quickPhotoMode ? 'quickList' : scannedDetail ? 'scan' : detailReturnView) : view === 'planDetail' ? 'workbench' : view === 'quickList' ? 'quickScan' : scanReturnView);
    setScanPickerOpen(false);
    setScanModal(null);
  };

  const exitPrototype = exitToAssetManagement;

  const openScan = (assetId = null, planId = null) => {
    if (projectClosed) { messageApi.info('项目已关闭，盘点待办已结束'); return; }
    setQuickPhotoMode(false);
    setScanTargetId(assetId);
    setScanPlanId(planId);
    setScanReturnView(view === 'detail' ? 'detail' : planId ? 'planDetail' : 'workbench');
    if (view !== 'detail') setDetailReturnView(planId ? 'planDetail' : 'workbench');
    setScanPickerOpen(false);
    setScanModal(null);
    setView('scan');
  };

  const handleScanPick = (kind) => {
    if (projectClosed) { messageApi.info('项目已关闭，不能继续盘点'); return; }
    setScanPickerOpen(false);
    if (!['mine', 'proxy'].includes(kind)) { setScanModal({ kind }); return; }
    const scope = projectAssets.filter((asset) => !scanPlanId || activePlan?.assetIds.includes(asset.id));
    const asset = scanTargetId ? scope.find((item) => item.id === scanTargetId)
      : scope.find((item) => canInventory(item) && (kind === 'mine' ? item.ownerNo === currentUser.employeeNo : item.ownerNo !== currentUser.employeeNo));
    if (!asset) { setScanModal({ kind: 'outOfScope' }); return; }
    if ((kind === 'mine') !== (asset.ownerNo === currentUser.employeeNo)) { setScanModal({ kind: 'outOfScope' }); return; }
    if (!canInventory(asset)) { setScanModal({ kind: 'scanned' }); return; }
    setSelectedAssetId(asset.id);
    setScannedDetail(true);
    setLocationDraft(assetLocation(asset));
    setView('detail');
  };

  const handleSubmitScan = (kind) => {
    if (projectClosed) { messageApi.info('项目已关闭，不能提交盘点结果'); return; }
    const scanAsset = selectedAsset;
    if (!scannedDetail || !projectAssets.some((asset) => asset.id === scanAsset?.id) || (scanPlanId && !activePlan?.assetIds.includes(scanAsset?.id))) { messageApi.warning('请先扫描当前项目内的资产'); return; }
    if (!canInventory(scanAsset)) {
      setScanModal(null);
      messageApi.warning('该资产已盘点或不在执行范围内');
      return;
    }
    const beforeLocation = assetLocation(scanAsset);
    const canEditLocation = projectType === '复盘' || scanAsset.area === '公共';
    const locationChanged = canEditLocation && ['city', 'building', 'floor'].some((field) => locationDraft[field] !== beforeLocation[field]);
    if (locationChanged && Object.values(locationDraft).some((value) => !value.trim())) {
      messageApi.warning('请选择完整的城市、建筑物和楼层');
      return;
    }
    const requiredSlots = scanAsset.area === '机房' ? ['二维码标签照片', '序列号照片'] : ['资产整体照片', '二维码标签照片'];
    if (scanAsset.photoRequired && requiredSlots.some((slot) => !photoState[`${scanAsset.id}::${slot}`])) {
      setScanModal(null);
      setSelectedAssetId(scanAsset.id);
      setView('detail');
      messageApi.warning('请先拍摄并上传必需的照片，再提交盘点');
      return;
    }
    const reviewPending = scanAsset.area === '员工' && scanAsset.photoRequired;
    try {
      if (locationChanged && projectType === '复盘') {
        recordInventoryLocationChange({ projectNo: previewProjectNo, projectType, assetTag: scanAsset.tagNo, before: beforeLocation, after: locationDraft, operator: currentUser.name });
      } else if (locationChanged) {
        const ledgerAsset = getAssetMaintenanceRows().find((asset) => asset.tag === scanAsset.tagNo);
        if (!ledgerAsset) throw new Error('未找到资产台账，请重新进入后再提交');
        updateAssetMaintenanceRow(ledgerAsset.id, locationDraft);
      }
    } catch (error) {
      messageApi.warning(error.message);
      return;
    }
    if (reviewPending) savePhotoReviewResult(previewProjectNo, {
      assetTag: scanAsset.tagNo, status: '审核中', owner: scanAsset.owner,
      description: scanAsset.assetDesc, inventoryDate: new Date().toISOString(),
    });
    saveMobileInventoryResult(previewProjectNo, scanAsset.tagNo, {
      status: reviewPending ? '审核中' : kind === 'proxy' ? '代盘' : '已盘',
      inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }),
      inventoryBy: currentUser.name,
      lossReported: scanAsset.lossReported,
    });
    if (scanAsset && ['mine', 'proxy'].includes(kind)) {
      setSelectedAssetId(scanAsset.id);
      setAssets((current) => current.map((asset) => (
        asset.id === scanAsset.id
          ? {
            ...asset,
            status: reviewPending ? '审核中' : kind === 'proxy' ? '代盘' : '已盘',
            inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }),
            inventoryBy: currentUser.name,
            proxyFor: kind === 'proxy' ? scanAsset.owner : '',
            ...(locationChanged && projectType !== '复盘' ? { address: Object.values(locationDraft).join('-') } : {}),
          }
          : asset
      )));
    }
    setScanModal(null);
    setScannedDetail(false);
    setView('scan');
    messageApi.success(reviewPending ? '照片已提交，等待审核' : '盘点提交成功');
  };

  const togglePhoto = (slot) => {
    if (!selectedAsset) return;
    const key = `${selectedAsset.id}::${slot}`;
    setPhotoState((current) => ({ ...current, [key]: !current[key] }));
  };

  const submitReportLoss = () => {
    if (projectClosed) { messageApi.info('项目已关闭，不能提交报失'); return; }
    if (!reportReason.trim()) {
      messageApi.warning('请填写报失原因');
      return;
    }
    setReportLossOpen(false);
    setConfirmLossOpen(true);
  };

  const confirmReportLoss = () => {
    if (projectClosed) { messageApi.info('项目已关闭，不能提交报失'); return; }
    if (!selectedAsset || selectedAsset.status !== '未盘' || selectedAsset.lossReported) { messageApi.warning('该资产不能重复报失'); return; }
    saveMobileInventoryResult(previewProjectNo, selectedAsset.tagNo, { status: '报失', lossReported: true, inventoryNote: reportReason.trim(), inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name });
    setAssets((current) => current.map((asset) => (
      asset.id === selectedAsset.id
        ? { ...asset, status: '报失', lossReported: true, inventoryNote: reportReason.trim(), inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name }
        : asset
    )));
    setConfirmLossOpen(false);
    setReportReason('');
    messageApi.success('已提交报失，盘点说明已保存');
    if (scannedDetail) { setScannedDetail(false); setView('scan'); }
  };

  const addQuickScan = (outsideProject = false) => {
    if (projectClosed || !isQuickAuthorized(quickPlanId)) { messageApi.warning('当前身份或盘点范围不可快速扫描'); return; }
    const candidates = projectAssets.filter((asset) => quickScope.includes(asset.id)).map((asset) => asset.tagNo);
    if (!candidates.length) { messageApi.warning('当前盘点范围没有可扫描资产'); return; }
    const tagNo = outsideProject ? '114140000999' : candidates[quickScanIndex % candidates.length];
    setQuickScanIndex((index) => index + 1);
    if (!projectAssets.some((asset) => asset.tagNo === tagNo)) {
      messageApi.warning('不在当前盘点项目内');
      return;
    }
    if (!quickScope.some((id) => assets.find((asset) => asset.id === id)?.tagNo === tagNo)) { messageApi.warning('资产不在当前盘点任务范围'); return; }
    setQuickScanned((current) => [...current, tagNo]);
  };

  const openQuickScan = (planId = null) => {
    if (projectClosed || !isQuickAuthorized(planId)) { messageApi.warning('当前身份或盘点范围不可快速扫描'); return; }
    setQuickPlanId(planId);
    setScanReturnView(planId ? 'planDetail' : 'workbench');
    setQuickScanIndex(0);
    setView('quickScan');
  };

  const submitQuickScan = () => {
    if (projectClosed || !isQuickAuthorized(quickPlanId)) { messageApi.warning('当前身份或盘点范围不可快速扫描'); return; }
    if (quickScanned.some((tagNo) => { const asset = assets.find((item) => item.tagNo === tagNo); return asset && quickScope.includes(asset.id) && canInventory(asset) && !photosReady(asset); })) { messageApi.warning('请先补拍必需照片，再批量提交'); return; }
    const success = [];
    const failed = [];
    quickScanned.forEach((tagNo) => {
      const asset = assets.find((item) => item.tagNo === tagNo);
      const requiredSlots = asset?.area === '机房' ? ['二维码标签照片', '序列号照片'] : ['资产整体照片', '二维码标签照片'];
      const missingPhoto = asset?.photoRequired && requiredSlots.some((slot) => !photoState[`${asset.id}::${slot}`]);
      if (asset && quickScope.includes(asset.id) && canInventory(asset) && !success.includes(tagNo) && !missingPhoto) {
        const target = batchLocations[tagNo];
        if (target && ['city', 'building', 'floor'].some((field) => target[field] !== assetLocation(asset)[field])) {
          try {
            if (projectType === '复盘') recordInventoryLocationChange({ projectNo: previewProjectNo, projectType, assetTag: tagNo, before: assetLocation(asset), after: target, operator: currentUser.name });
            else if (asset.area === '公共') {
              const row = getAssetMaintenanceRows().find((item) => item.tag === tagNo);
              if (!row) throw new Error('未找到资产台账');
              updateAssetMaintenanceRow(row.id, target);
            }
          } catch (error) { failed.push({ tagNo, reason: error.message }); return; }
        }
        success.push(tagNo);
      } else {
        failed.push({ tagNo, reason: !asset || !quickScope.includes(asset.id) ? '不在当前任务范围' : !canInventory(asset) ? '资产已盘点或不可盘点' : success.includes(tagNo) ? '重复扫描' : '需先在资产详情拍摄必需照片' });
      }
    });
    if (success.length) {
      success.forEach((tagNo) => {
        const asset = assets.find((item) => item.tagNo === tagNo);
        if (asset?.area === '员工' && asset.photoRequired) savePhotoReviewResult(previewProjectNo, { assetTag: tagNo, status: '审核中', owner: asset.owner, description: asset.assetDesc, inventoryDate: new Date().toISOString() });
        saveMobileInventoryResult(previewProjectNo, tagNo, { status: asset.area === '员工' && asset.photoRequired ? '审核中' : asset.ownerNo === currentUser.employeeNo ? '已盘' : '代盘', inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name, lossReported: asset.lossReported });
      });
      setAssets((current) => current.map((asset) => (
        success.includes(asset.tagNo)
          ? { ...asset, status: asset.area === '员工' && asset.photoRequired ? '审核中' : asset.ownerNo === currentUser.employeeNo ? '已盘' : '代盘', inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name, ...(asset.area === '公共' && projectType !== '复盘' && batchLocations[asset.tagNo] ? { address: Object.values(batchLocations[asset.tagNo]).join('-') } : {}) }
          : asset
      )));
    }
    setQuickResult({ total: quickScanned.length, success: success.length, failed });
    setQuickScanned([]);
    setQuickLocations((current) => ({ ...current, [quickBatchKey]: {} }));
  };

  const requiredPhotos = (asset) => asset.area === '机房' ? ['二维码标签照片', '序列号照片'] : ['资产整体照片', '二维码标签照片'];
  const photosReady = (asset) => !asset.photoRequired || requiredPhotos(asset).every((slot) => photoState[`${asset.id}::${slot}`]);
  const openQuickPhotos = (asset) => {
    if (!asset || !quickScope.includes(asset.id) || !canInventory(asset) || projectClosed) { messageApi.warning('该资产不可补拍'); return; }
    setSelectedAssetId(asset.id);
    setLocationDraft(batchLocations[asset.tagNo] || assetLocation(asset));
    setScannedDetail(true);
    setQuickPhotoMode(true);
    setView('detail');
  };
  const saveQuickPhotos = () => {
    if (!photosReady(selectedAsset)) { messageApi.warning('请拍摄全部必需照片'); return; }
    if ((projectType === '复盘' || selectedAsset.area === '公共') && Object.values(locationDraft).some((value) => !value.trim())) { messageApi.warning('请选择完整的城市、建筑物和楼层'); return; }
    setQuickLocations((current) => ({ ...current, [quickBatchKey]: { ...current[quickBatchKey], [selectedAsset.tagNo]: locationDraft } }));
    setQuickPhotoMode(false);
    setScannedDetail(false);
    setView('quickList');
  };

  const renderWorkBench = () => {
    const groups = TAB_GROUPS[activeTab];
    return (
      <>
        <div className="inventory-search-wrap">
          <Search size={17} />
          <Input
            bordered={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="可输入资产说明、资产标签号、序列号"
            aria-label="搜索资产"
          />
          {query && <Button type="text" shape="circle" size="small" icon={<X size={15} />} onClick={() => setQuery('')} />}
        </div>
        <div className="inventory-mobile-tabs">
          <button type="button" className={activeTab === 'unscanned' ? 'is-active' : ''} onClick={() => setActiveTab('unscanned')}>
            未盘 <span>{formatStatusCount(filteredAssets, '未盘')}</span>
          </button>
          <button type="button" className={activeTab === 'scanned' ? 'is-active' : ''} onClick={() => setActiveTab('scanned')}>
            已盘 <span>{formatStatusCount(filteredAssets, '已盘') + formatStatusCount(filteredAssets, '代盘')}</span>
          </button>
        </div>
        <div className="inventory-mobile-content-list">
          {groups.map((group) => {
            const groupAssets = filteredAssets.filter((asset) => asset.status === group.key);
            return (
              <section key={group.key} className="inventory-status-section">
                <AssetGroupHeading label={group.label} count={groupAssets.length} collapsed={collapsedGroups.includes(group.key)} onToggle={() => setCollapsedGroups((current) => current.includes(group.key) ? current.filter((key) => key !== group.key) : [...current, group.key])} />
                {!collapsedGroups.includes(group.key) && (groupAssets.length ? groupAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onClick={() => openDetail(asset)} />
                )) : (
                  <div className="inventory-empty">当前分类暂无资产</div>
                ))}
              </section>
            );
          })}
        </div>
      </>
    );
  };

  const renderPlanDetail = () => <>
    <MobileHeader title={activePlan?.name || '盘点计划'} onBack={goBack} onExit={exitPrototype} right={canQuickScan && <Button type="text" aria-label="快速扫描" icon={<ScanLine size={18} />} onClick={() => openQuickScan(activePlanId)}>快扫</Button>} />
    <div className="inventory-mobile-content inventory-plan-detail">
      {[
        { key: '未盘', rows: activePlanAssets.filter((asset) => asset.status === '未盘') },
        { key: '报失', rows: activePlanAssets.filter((asset) => asset.status === '报失') },
        { key: '已盘', rows: activePlanAssets.filter((asset) => ['已盘', '代盘'].includes(asset.status)) },
      ].map((group) => <section className="inventory-plan-section" key={group.key}>
        <AssetGroupHeading label={group.key} count={group.rows.length} collapsed={collapsedPlanSections.includes(group.key)} onToggle={() => setCollapsedPlanSections((current) => current.includes(group.key) ? current.filter((item) => item !== group.key) : [...current, group.key])} />
        {!collapsedPlanSections.includes(group.key) && <div className="inventory-plan-assets">
          {group.rows.length ? group.rows.map((asset) => <AssetCard key={asset.id} asset={asset} onClick={() => openDetail(asset)} />) : <div className="inventory-empty">暂无{group.key}资产</div>}
        </div>}
      </section>)}
    </div>
    <div className="inventory-mobile-footer">
      <Button className="inventory-mobile-scan-action" icon={<ScanLine size={18} />} disabled={projectClosed} onClick={() => openScan(null, activePlanId)}>盘点</Button>
    </div>
  </>;

  const renderDetail = () => {
    if (!selectedAsset) return null;
    const slots = requiredPhotos(selectedAsset);
    const canSubmit = canInventory(selectedAsset);
    const editLocation = scannedDetail && !projectClosed && canSubmit && (projectType === '复盘' || selectedAsset.area === '公共');
    const locationOptions = editLocation ? getInventoryLocationOptions(locationDraft) : {};
    return <>
      <MobileHeader title={selectedAsset.assetDesc} onBack={goBack} onExit={exitPrototype} />
      <div className="inventory-mobile-content inventory-detail-content">
        <div className="inventory-detail-header"><span className="inventory-detail-category">{selectedAsset.category}</span><StatusBadge status={selectedAsset.status} /></div>
        <div className="inventory-detail-card">
          <DetailRow label="资产标签号" value={selectedAsset.tagNo} />
          <DetailRow label="序列号" value={selectedAsset.serialNo} />
          <DetailRow label="数量" value={String(selectedAsset.quantity)} />
          <DetailRow label="使用状态" value={selectedAsset.usageStatus} />
          <DetailRow label="资产说明" value={selectedAsset.assetDesc} />
          <DetailRow label="责任人" value={`${selectedAsset.owner}（${selectedAsset.ownerNo}）`} />
          <DetailRow label="资产地址" value={selectedAsset.address} />
          {selectedAsset.area !== '员工' && <DetailRow label="盘点范围" value={selectedAsset.area} />}
          <DetailRow label="盘点人" value={selectedAsset.inventoryBy} />
          <DetailRow label="盘点日期" value={selectedAsset.inventoryDate} />
          <DetailRow label="盘点说明" value={selectedAsset.inventoryNote} />
          {selectedAsset.area !== '员工' && <>
            <DetailRow label="用途" value={selectedAsset.purpose} /><DetailRow label="公司" value={selectedAsset.company} />
            <DetailRow label="使用说明" value={selectedAsset.usageNote} /><DetailRow label="备注" value={selectedAsset.remark} />
          </>}
        </div>
        {editLocation && <div className="inventory-location-card">
            <div className="inventory-section-title">本次地点<span className="inventory-location-optional">可修改</span></div>
            {['city', 'building', 'floor'].map((field) => <label className="inventory-location-field" key={field}>
              <span>{field === 'city' ? '城市' : field === 'building' ? '建筑物' : '楼层 / 机房'}</span>
              <div className="inventory-location-select"><select aria-label={field === 'city' ? '城市' : field === 'building' ? '建筑物' : '楼层 / 机房'} value={locationDraft[field]} onChange={(event) => {
                const value = event.target.value;
                setLocationDraft((current) => ({ ...current, [field]: value, ...(field === 'city' ? { building: '', floor: '' } : field === 'building' ? { floor: '' } : {}) }));
              }}><option value="">请选择</option>{locationOptions[field].map((value) => <option key={value} value={value}>{value}</option>)}</select><ChevronDown size={16} /></div>
            </label>)}
          </div>}
        {scannedDetail && canSubmit && selectedAsset.photoRequired && <div className="inventory-photo-card">
          <div className="inventory-section-title">上传图片</div>
          <div className="inventory-photo-tip">请拍摄清晰的资产照片和标签</div>
          <div className="inventory-photo-grid">{slots.map((slot) => <PhotoSlot key={slot} label={slot} added={Boolean(photoState[selectedAsset.id + '::' + slot])} onAdd={() => togglePhoto(slot)} onRemove={() => togglePhoto(slot)} />)}</div>
        </div>}
      </div>
      {(quickPhotoMode || canSubmit) && <div className="inventory-mobile-footer inventory-detail-actions">
        {quickPhotoMode ? <>
          <Button onClick={() => { setQuickPhotoMode(false); setScannedDetail(false); setView('quickList'); }}>返回</Button>
          <Button type="primary" className="inventory-mobile-scan-action" onClick={saveQuickPhotos}>{selectedAsset.photoRequired && !editLocation ? '保存图片' : '保存'}</Button>
        </> : <>
          {selectedAsset.status === '未盘' && !selectedAsset.lossReported && <Button danger className="inventory-mobile-detail-action" disabled={projectClosed} onClick={() => setReportLossOpen(true)}>报失</Button>}
          {canSubmit && <Button type="primary" className="inventory-mobile-scan-action inventory-mobile-detail-action" disabled={projectClosed} onClick={() => scannedDetail ? handleSubmitScan(selectedAsset.ownerNo === currentUser.employeeNo ? 'mine' : 'proxy') : openScan(selectedAsset.id, detailReturnView === 'planDetail' ? activePlanId : null)}>{scannedDetail ? '提交' : '盘点'}</Button>}
        </>}
      </div>}
    </>;
  };

  const renderScan = () => (
    <>
      <MobileHeader title="扫码盘点" onBack={goBack} onExit={exitPrototype} />
      <div className="inventory-mobile-content inventory-scan-page">
        <div className={`inventory-scan-stage ${flashlightOn ? 'is-lit' : ''}`}>
          <div className="inventory-scan-corners">
            <span /><span /><span /><span />
          </div>
          <ScanLine size={42} />
          <div className="inventory-scan-stage-label">将扫描区域对准资产标签号二维码</div>
        </div>
        <div className="inventory-scan-example">
          <span>参考如下样例，找到标签扫描</span>
          <div className="inventory-scan-example-label" role="img" aria-label="资产标签二维码样例" style={{ backgroundImage: `url(${mobileScanReference})` }} />
        </div>
        <div className="inventory-scan-controls">
          <Button disabled={projectClosed} icon={<Flashlight size={17} />} onClick={() => setFlashlightOn((current) => !current)}>
            {flashlightOn ? '已开启手电筒' : '手电筒'}
          </Button>
          <Button type="primary" disabled={projectClosed} icon={<ScanLine size={17} />} onClick={() => setScanPickerOpen((current) => !current)}>
            模拟扫码
          </Button>
        </div>
        {scanPickerOpen && <ScanPicker onSelect={handleScanPick} />}
      </div>
      <ScanResultModal
        scanModal={scanModal}
        onClose={() => setScanModal(null)}
      />
    </>
  );

  const renderQuickScan = () => (
    <>
      <MobileHeader title="快速扫描" onBack={goBack} onExit={exitPrototype} />
      <div className={`inventory-mobile-content inventory-quick-scan-page ${flashlightOn ? 'is-lit' : ''}`}>
        <div className={`inventory-scan-stage ${flashlightOn ? 'is-lit' : ''}`}>
          <div className="inventory-scan-corners"><span /><span /><span /><span /></div>
          <ScanLine size={42} />
        </div>
        <div className="inventory-scan-example">
          <span>参考如下样例，找到标签扫描</span>
          <div className="inventory-scan-example-label" role="img" aria-label="资产标签二维码样例" style={{ backgroundImage: `url(${mobileScanReference})` }} />
        </div>
        <div className="inventory-quick-recent">本次共扫描到资产 {quickScanned.length} 个，最近5个标签号：
          <div>{quickScanned.slice(-5).reverse().join('、') || '暂无'}</div>
        </div>
        <Button type="primary" disabled={projectClosed} onClick={() => addQuickScan()}>模拟扫描标签</Button>
        <Button onClick={() => addQuickScan(true)}>模拟扫描项目外资产</Button>
        <Button disabled={!quickScanned.length} onClick={() => setView('quickList')}>结束扫描</Button>
        <Button icon={<Flashlight size={17} />} onClick={() => setFlashlightOn((current) => !current)}>{flashlightOn ? '已开启手电筒' : '开灯'}</Button>
      </div>
    </>
  );

  const renderQuickList = () => (
    <>
      <MobileHeader title="待提交标签" onBack={goBack} onExit={exitPrototype} />
      <div className="inventory-mobile-content inventory-quick-scan-page">
        <div className="inventory-section-title">本次扫描标签号—共{quickScanned.length}条</div>
        <div className="inventory-quick-list">{quickScanned.map((tagNo, index) => {
          const asset = assets.find((item) => item.tagNo === tagNo);
          return <div className="inventory-quick-row" key={`${tagNo}-${index}`}><span>{index + 1}</span><span>{tagNo}</span>
            {asset && canInventory(asset) && <Button size="small" onClick={() => openQuickPhotos(asset)} aria-label={`${projectType === '复盘' || asset.area === '公共' || !asset.photoRequired ? '查看资产' : '补拍照片'}${tagNo}`}>{projectType === '复盘' || asset.area === '公共' || !asset.photoRequired ? '查看' : photosReady(asset) ? '照片已齐' : '补拍照片'}</Button>}
          </div>;
        })}</div>
      </div>
      <div className="inventory-mobile-footer inventory-plan-footer">
        <Button className="inventory-mobile-scan-action" icon={<ScanLine size={18} />} onClick={() => setView('quickScan')}>盘点</Button>
        <Button type="primary" disabled={projectClosed || !quickScanned.length} onClick={submitQuickScan}>提交</Button>
      </div>
      <Modal open={Boolean(quickResult)} title="快速扫描结果" wrapClassName="inventory-mobile-modal" footer={null} centered onCancel={() => { setQuickResult(null); setView(scanReturnView); }}>
        {quickResult && (
          <>
            <div className="inventory-quick-result">
              <div><strong>{quickResult.total}</strong><span>扫描总数</span></div>
              <div><strong className="is-success">{quickResult.success}</strong><span>成功上传</span></div>
              <div><strong className="is-error">{quickResult.failed.length}</strong><span>信息错误</span></div>
            </div>
            <p className="inventory-modal-message">
              您本次共提交{quickResult.total}条资产，其中{quickResult.failed.length}条资产信息错误。
            </p>
            {quickResult.failed.map((item, index) => <div className="inventory-quick-error" key={`${item.tagNo}-${index}`}>{item.tagNo}：{item.reason}</div>)}
            <Button type="primary" block onClick={() => { setQuickResult(null); setView(scanReturnView); }}>确定</Button>
          </>
        )}
      </Modal>
    </>
  );

  return (
    <div className="inventory-mobile-page">
      {contextHolder}
      <div className="inventory-mobile-shell">
        {view === 'workbench' && (
          <>
            <MobileHeader
              title="资产盘点"
              onBack={goBack}
              onExit={exitPrototype}
              right={<>{canQuickScan && <Button type="text" aria-label="快速扫描" icon={<ScanLine size={18} />} onClick={() => openQuickScan()}>快扫</Button>}<Button type="text" shape="circle" aria-label="监督计划" icon={<ListChecks size={19} />} onClick={() => setPlanMenuOpen((current) => !current)} /></>}
            />
            {planMenuOpen && <div className="inventory-supervised-plans" role="menu" aria-label="我监督的盘点计划">
              {supervisedPlans.map((plan) => <button type="button" role="menuitem" key={plan.id} onClick={() => { if (!hasRouteProject) switchDemoContext(DEMO_CONTEXTS.find(context => context.id === (plan.contextId || 'initial'))); setActivePlanId(plan.id); setCollapsedPlanSections([]); setPlanMenuOpen(false); setView('planDetail'); }}>
                {plan.name}<span className="inventory-plan-dot" />
              </button>)}
            </div>}
            <div className="inventory-mobile-content">
              {renderWorkBench()}
            </div>
            {activeTab === 'unscanned' && <div className="inventory-mobile-footer">
              <Button type="primary" block className="inventory-mobile-scan-action" icon={<ScanLine size={18} />} disabled={projectClosed} onClick={() => openScan()}>开始盘点</Button>
            </div>}
          </>
        )}
        {view === 'planDetail' && renderPlanDetail()}
        {view === 'detail' && renderDetail()}
        {view === 'scan' && renderScan()}
        {view === 'quickScan' && renderQuickScan()}
        {view === 'quickList' && renderQuickList()}
      </div>
      <Modal open={reportLossOpen} title="填写报失原因" wrapClassName="inventory-mobile-modal" centered footer={null} onCancel={() => setReportLossOpen(false)} destroyOnClose>
        <Input.TextArea
          value={reportReason}
          onChange={(event) => setReportReason(event.target.value)}
          maxLength={150}
          showCount
          rows={4}
          placeholder="请输入未找到资产的原因"
          aria-label="报失原因"
        />
        <div className="inventory-modal-actions">
          <Button onClick={() => setReportLossOpen(false)}>取消</Button>
          <Button type="primary" onClick={submitReportLoss}>提交</Button>
        </div>
      </Modal>
      <Modal open={confirmLossOpen} title="确认提交报失" wrapClassName="inventory-mobile-modal" centered footer={null} onCancel={() => setConfirmLossOpen(false)} destroyOnClose>
        <p className="inventory-modal-message">资产丢失需履行赔偿责任哟！确定不再继续寻找了吗？</p>
        <div className="inventory-modal-actions">
          <Button onClick={() => setConfirmLossOpen(false)}>继续寻找</Button>
          <Button danger type="primary" disabled={projectClosed} onClick={confirmReportLoss}>确定报失</Button>
        </div>
      </Modal>
    </div>
  );
}

export { DEMO_ASSETS };
