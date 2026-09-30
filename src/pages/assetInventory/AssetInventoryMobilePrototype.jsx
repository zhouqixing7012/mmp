import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
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

const CURRENT_USER = {
  name: '孙志强',
  employeeNo: '201132000160',
  isESAssetGroup: true,
};

const DEMO_ASSETS = [
  {
    id: 'asset-001',
    status: '未盘',
    assetDesc: '戴尔.Latitude E7280',
    tagNo: '114121801802',
    serialNo: '6GYV0N2',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '孙志强',
    ownerNo: '201132000160',
    address: '北京市-搜狐媒体大厦-9层',
    category: '笔记本电脑',
    dueDate: '2025-12-26',
    area: '员工',
    photoRequired: true,
    lastPhoto: 'laptop',
    purpose: '员工用机',
    company: '114.新媒体',
    usageNote: '日常办公使用',
    remark: '',
    inventoryNote: '',
  },
  {
    id: 'asset-002',
    status: '未盘',
    assetDesc: '苹果.iphone 17',
    tagNo: '114130000019',
    serialNo: 'F2LZP17ABC',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '孙志强',
    ownerNo: '201132000160',
    address: '北京市-搜狐媒体大厦-9层',
    category: '手机',
    dueDate: '2025-12-26',
    area: '员工',
    photoRequired: false,
    lastPhoto: null,
    purpose: '员工用机',
    company: '114.新媒体',
    usageNote: '移动办公使用',
    remark: '',
    inventoryNote: '',
  },
  {
    id: 'asset-003',
    status: '报失',
    assetDesc: '惠普.P221显示器',
    tagNo: '1141100548',
    serialNo: 'CNK12345',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '孙志强',
    ownerNo: '201132000160',
    address: '北京市-搜狐媒体大厦-9层',
    category: '显示器',
    dueDate: '2025-12-26',
    area: '员工',
    photoRequired: true,
    lastPhoto: 'monitor',
    purpose: '员工用机',
    company: '114.新媒体',
    usageNote: '',
    remark: '',
    inventoryNote: '未在工位找到，已联系部门确认',
  },
  {
    id: 'asset-004',
    status: '已盘',
    assetDesc: '联想.ThinkPad X230',
    tagNo: '114120800238',
    serialNo: 'PF1ABC230',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '李明',
    ownerNo: '201132000240',
    address: '北京市-搜狐媒体大厦-8层',
    category: '笔记本电脑',
    inventoryDate: '2025-12-15 10:13',
    inventoryBy: '李明',
    area: '员工',
    photoRequired: false,
    lastPhoto: 'laptop',
    purpose: '员工用机',
    company: '114.新媒体',
    usageNote: '',
    remark: '',
    inventoryNote: '',
  },
  {
    id: 'asset-005',
    status: '代盘',
    assetDesc: '东芝.东芝E-456明读卡器',
    tagNo: '1141300083-P',
    serialNo: 'SOHUXX156613',
    quantity: 1,
    usageStatus: '在库-待处理',
    owner: '库房管理员-SOHU',
    ownerNo: 'WAREHOUSE',
    address: '北京市-搜狐媒体大厦-B2',
    category: 'IC卡读卡器',
    inventoryDate: '2025-12-15 10:16',
    inventoryBy: CURRENT_USER.name,
    proxyFor: '库房管理员-SOHU',
    area: '库房',
    photoRequired: false,
    lastPhoto: null,
    purpose: '办公设备',
    company: '114.新媒体',
    usageNote: '',
    remark: '',
    inventoryNote: '',
  },
  {
    id: 'asset-006',
    status: '未盘',
    assetDesc: '戴尔.PowerEdge R740',
    tagNo: '114140000031',
    serialNo: 'SVR-R740-031',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '机房管理员',
    ownerNo: 'SERVER-ADMIN',
    address: '北京市-搜狐媒体大厦-机房',
    category: '服务器',
    inventoryDate: '',
    area: '机房',
    photoRequired: true,
    lastPhoto: 'server',
    purpose: '机房服务器',
    company: '114.新媒体',
    usageNote: '机房蓝图资产',
    remark: '需上传序列号照片',
    inventoryNote: '',
  },
  {
    id: 'asset-007',
    status: '未执行盘点',
    assetDesc: '华为.核心交换机',
    tagNo: '114150000018',
    serialNo: 'SW-CORE-018',
    quantity: 1,
    usageStatus: '在用-使用中',
    owner: '机房管理员',
    ownerNo: 'SERVER-ADMIN',
    address: '北京市-搜狐媒体大厦-机房',
    category: '网络设备',
    inventoryDate: '',
    area: '机房',
    photoRequired: true,
    lastPhoto: null,
    purpose: '机房网络设备',
    company: '114.新媒体',
    usageNote: '机房蓝图资产',
    remark: '',
    inventoryNote: '',
  },
];

// 原型演示计划与资产关联，仅用于展示当前用户作为监督人的计划入口。
const DEMO_SUPERVISED_PLANS = [
  { id: 'employee-plan', name: '北京市盘点计划-员工盘点', supervisor: CURRENT_USER.name, assetIds: ['asset-001', 'asset-002', 'asset-003', 'asset-004'] },
  { id: 'warehouse-plan', name: '北京市盘点计划-库房盘点', supervisor: CURRENT_USER.name, assetIds: ['asset-005'] },
  { id: 'machine-plan', name: '北京市盘点计划-机房盘点', supervisor: null, assetIds: ['asset-006', 'asset-007'] },
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
  const previewProjectNo = location.state?.projectNo || '';
  const currentUser = location.state?.mobileUser || CURRENT_USER;
  const projectRanges = location.state?.scopeRanges || ['员工', '公共', '库房', '机房'];
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
  const [assets, setAssets] = useState(() => DEMO_ASSETS.map((asset) => ({ ...asset })));
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

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) || null;
  const projectAssets = assets.filter((asset) => projectRanges.includes(asset.area));
  const filteredAssets = projectAssets.filter((asset) => asset.ownerNo === currentUser.employeeNo && includesQuery(asset, query));
  const supervisedPlans = DEMO_SUPERVISED_PLANS.filter((plan) => plan.supervisor === currentUser.name && projectAssets.some((asset) => plan.assetIds.includes(asset.id)));
  const activePlan = supervisedPlans.find((plan) => plan.id === activePlanId);
  const activePlanAssets = projectAssets.filter((asset) => activePlan?.assetIds.includes(asset.id));
  const quickBatchKey = quickPlanId || 'personal';
  const quickScanned = quickBatches[quickBatchKey] || [];
  const setQuickScanned = (update) => setQuickBatches((current) => {
    const previous = current[quickBatchKey] || [];
    return { ...current, [quickBatchKey]: typeof update === 'function' ? update(previous) : update };
  });
  const isQuickAuthorized = (planId) => {
    const scope = planId ? projectAssets.filter((asset) => DEMO_SUPERVISED_PLANS.find((plan) => plan.id === planId)?.assetIds.includes(asset.id)) : projectAssets;
    const machineContext = planId ? scope.length > 0 && scope.every((asset) => asset.area === '机房') : projectRanges.length === 1 && projectRanges[0] === '机房';
    return machineContext && (currentUser.isESAssetGroup === true || scope.some((asset) => asset.ownerNo === currentUser.employeeNo));
  };
  const canQuickScan = isQuickAuthorized(view === 'planDetail' ? activePlanId : null);
  const quickScope = projectAssets.filter((asset) => asset.area === '机房' && (currentUser.isESAssetGroup === true || asset.ownerNo === currentUser.employeeNo) && (!quickPlanId || activePlan?.assetIds.includes(asset.id))).map((asset) => asset.id);

  const openDetail = (asset) => {
    setQuickPhotoMode(false);
    setScannedDetail(false);
    setDetailReturnView(view === 'planDetail' ? 'planDetail' : 'workbench');
    setSelectedAssetId(asset.id);
    const [city = '', building = '', floor = ''] = asset.address.split('-');
    setLocationDraft({ city, building, floor });
    setView('detail');
  };

  const savePublicLocation = () => {
    if (!selectedAsset || selectedAsset.area !== '公共' || projectClosed) return;
    if (!locationDraft.city.trim() || !locationDraft.building.trim() || !locationDraft.floor.trim()) {
      messageApi.warning('请完整填写 City、Building、Floor');
      return;
    }
    setAssets((current) => current.map((asset) => asset.id === selectedAsset.id
      ? { ...asset, address: `${locationDraft.city.trim()}-${locationDraft.building.trim()}-${locationDraft.floor.trim()}` }
      : asset));
    messageApi.success('公共资产位置已更新');
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
      : scope.find((item) => item.status === '未盘' && (kind === 'mine' ? item.ownerNo === currentUser.employeeNo : item.ownerNo !== currentUser.employeeNo));
    if (!asset) { setScanModal({ kind: 'outOfScope' }); return; }
    if ((kind === 'mine') !== (asset.ownerNo === currentUser.employeeNo)) { setScanModal({ kind: 'outOfScope' }); return; }
    if (asset.status !== '未盘') { setScanModal({ kind: 'scanned' }); return; }
    setSelectedAssetId(asset.id);
    setScannedDetail(true);
    setDetailReturnView('scan');
    const [city = '', building = '', floor = ''] = asset.address.split('-');
    setLocationDraft({ city, building, floor });
    setView('detail');
  };

  const handleSubmitScan = (kind) => {
    if (projectClosed) { messageApi.info('项目已关闭，不能提交盘点结果'); return; }
    const scanAsset = selectedAsset;
    if (!scannedDetail || !projectAssets.some((asset) => asset.id === scanAsset?.id) || (scanPlanId && !activePlan?.assetIds.includes(scanAsset?.id))) { messageApi.warning('请先扫描当前项目内的资产'); return; }
    if (!scanAsset || scanAsset.status !== '未盘') {
      setScanModal(null);
      messageApi.warning('该资产已盘点或不在执行范围内');
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
    if (reviewPending) savePhotoReviewResult(previewProjectNo, {
      assetTag: scanAsset.tagNo, status: '审核中', owner: scanAsset.owner,
      description: scanAsset.assetDesc, inventoryDate: new Date().toISOString(),
    });
    if (scanAsset && ['mine', 'proxy'].includes(kind)) {
      setSelectedAssetId(scanAsset.id);
      setAssets((current) => current.map((asset) => (
        asset.id === scanAsset.id
          ? {
            ...asset,
            status: reviewPending ? '审核中' : kind === 'proxy' ? '代盘' : '已盘',
            inventoryDate: '2025-12-15 10:13',
            inventoryBy: currentUser.name,
            proxyFor: kind === 'proxy' ? scanAsset.owner : '',
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
    if (!selectedAsset || selectedAsset.status !== '未盘') { messageApi.warning('该资产不能重复报失'); return; }
    setAssets((current) => current.map((asset) => (
      asset.id === selectedAsset.id
        ? { ...asset, status: '报失', inventoryNote: reportReason.trim(), inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name }
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
    if (!candidates.length) { messageApi.warning('当前机房盘点范围没有可扫描资产'); return; }
    const tagNo = outsideProject ? '114140000999' : candidates[quickScanIndex % candidates.length];
    setQuickScanIndex((index) => index + 1);
    if (!projectAssets.some((asset) => asset.tagNo === tagNo)) {
      messageApi.warning('不在当前盘点项目内');
      return;
    }
    if (!quickScope.some((id) => assets.find((asset) => asset.id === id)?.tagNo === tagNo)) { messageApi.warning('资产不在当前机房盘点任务范围'); return; }
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
    if (quickScanned.some((tagNo) => { const asset = assets.find((item) => item.tagNo === tagNo); return asset && quickScope.includes(asset.id) && asset.status === '未盘' && !photosReady(asset); })) { messageApi.warning('请先补拍必需照片，再批量提交'); return; }
    const success = [];
    const failed = [];
    quickScanned.forEach((tagNo) => {
      const asset = assets.find((item) => item.tagNo === tagNo);
      const requiredSlots = asset?.area === '机房' ? ['二维码标签照片', '序列号照片'] : ['资产整体照片', '二维码标签照片'];
      const missingPhoto = asset?.photoRequired && requiredSlots.some((slot) => !photoState[`${asset.id}::${slot}`]);
      if (asset && quickScope.includes(asset.id) && asset.status === '未盘' && !success.includes(tagNo) && !missingPhoto) {
        success.push(tagNo);
      } else {
        failed.push({ tagNo, reason: !asset || !quickScope.includes(asset.id) ? '不在当前任务范围' : asset.status !== '未盘' ? '资产已盘点或不可盘点' : success.includes(tagNo) ? '重复扫描' : '需先在资产详情拍摄必需照片' });
      }
    });
    if (success.length) {
      success.forEach((tagNo) => {
        const asset = assets.find((item) => item.tagNo === tagNo);
        if (asset?.area === '员工' && asset.photoRequired) savePhotoReviewResult(previewProjectNo, { assetTag: tagNo, status: '审核中', owner: asset.owner, description: asset.assetDesc, inventoryDate: new Date().toISOString() });
      });
      setAssets((current) => current.map((asset) => (
        success.includes(asset.tagNo)
          ? { ...asset, status: asset.area === '员工' && asset.photoRequired ? '审核中' : asset.ownerNo === currentUser.employeeNo ? '已盘' : '代盘', inventoryDate: new Date().toLocaleString('zh-CN', { hour12: false }), inventoryBy: currentUser.name }
          : asset
      )));
    }
    setQuickResult({ total: quickScanned.length, success: success.length, failed });
    setQuickScanned([]);
  };

  const requiredPhotos = (asset) => asset.area === '机房' ? ['二维码标签照片', '序列号照片'] : ['资产整体照片', '二维码标签照片'];
  const photosReady = (asset) => !asset.photoRequired || requiredPhotos(asset).every((slot) => photoState[`${asset.id}::${slot}`]);
  const openQuickPhotos = (asset) => {
    if (!asset || !quickScope.includes(asset.id) || asset.status !== '未盘' || projectClosed) { messageApi.warning('该资产不可补拍'); return; }
    setSelectedAssetId(asset.id);
    setScannedDetail(true);
    setQuickPhotoMode(true);
    setView('detail');
  };
  const saveQuickPhotos = () => {
    if (!photosReady(selectedAsset)) { messageApi.warning('请拍摄全部必需照片'); return; }
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
                <button type="button" className="inventory-section-title inventory-group-toggle" aria-expanded={!collapsedGroups.includes(group.key)} onClick={() => setCollapsedGroups((current) => current.includes(group.key) ? current.filter((key) => key !== group.key) : [...current, group.key])}>
                  <span>{group.label}</span>
                  <span className="inventory-section-count">{groupAssets.length} 条 {collapsedGroups.includes(group.key) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</span>
                </button>
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
    <MobileHeader title={activePlan?.name || '盘点计划'} onBack={goBack} onExit={exitPrototype} right={canQuickScan && <Button type="text" aria-label="快速扫描" icon={<ScanLine size={19} />} onClick={() => openQuickScan(activePlanId)} />} />
    <div className="inventory-mobile-content inventory-plan-detail">
      {[
        { key: '未盘', rows: activePlanAssets.filter((asset) => asset.status === '未盘') },
        { key: '报失', rows: activePlanAssets.filter((asset) => asset.status === '报失') },
        { key: '已盘', rows: activePlanAssets.filter((asset) => ['已盘', '代盘'].includes(asset.status)) },
      ].map((group) => <section className="inventory-plan-section" key={group.key}>
        <button type="button" className="inventory-plan-section-heading" aria-expanded={!collapsedPlanSections.includes(group.key)} onClick={() => setCollapsedPlanSections((current) => current.includes(group.key) ? current.filter((item) => item !== group.key) : [...current, group.key])}>
          <span>{group.key}—共{group.rows.length}条</span>
          {collapsedPlanSections.includes(group.key) ? <ChevronRight size={17} /> : <ChevronDown size={17} />}
        </button>
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
    const slots = selectedAsset.area === '机房'
      ? ['二维码标签照片', '序列号照片']
      : ['资产整体照片', '二维码标签照片'];
    return (
      <>
        <MobileHeader title={selectedAsset.assetDesc} onBack={goBack} onExit={exitPrototype} />
        <div className="inventory-mobile-content">
          <div className="inventory-detail-header">
            <div className="inventory-detail-category">{selectedAsset.category}</div>
            <StatusBadge status={selectedAsset.status} />
          </div>
          <div className="inventory-detail-card">
            <DetailRow label="资产标签号" value={selectedAsset.tagNo} />
            <DetailRow label="序列号" value={selectedAsset.serialNo} />
            <DetailRow label="数量" value={String(selectedAsset.quantity)} />
            <DetailRow label="使用状态" value={selectedAsset.usageStatus} />
            <DetailRow label="资产说明" value={selectedAsset.assetDesc} />
            <DetailRow label="责任人" value={`${selectedAsset.owner}（${selectedAsset.ownerNo}）`} />
            {selectedAsset.area === '公共' && scannedDetail && !projectClosed ? (
              <div className="inventory-public-location">
                {['city', 'building', 'floor'].map((field) => <label key={field}>{field === 'city' ? 'City' : field === 'building' ? 'Building' : 'Floor'}
                  <Input value={locationDraft[field]} onChange={(event) => setLocationDraft((current) => ({ ...current, [field]: event.target.value }))} />
                </label>)}
                <Button onClick={savePublicLocation}>保存位置</Button>
              </div>
            ) : <DetailRow label="资产地址" value={selectedAsset.address} />}
            {selectedAsset.area !== '员工' && <DetailRow label="盘点范围" value={selectedAsset.area} />}
            {selectedAsset.inventoryBy && <DetailRow label="盘点人" value={selectedAsset.inventoryBy} />}
            {selectedAsset.inventoryDate && <DetailRow label="盘点日期" value={selectedAsset.inventoryDate} />}
            {selectedAsset.inventoryNote && <DetailRow label="盘点说明" value={selectedAsset.inventoryNote} />}
            {selectedAsset.area !== '员工' && (
              <>
                <DetailRow label="用途" value={selectedAsset.purpose} />
                <DetailRow label="公司" value={selectedAsset.company} />
                <DetailRow label="使用说明" value={selectedAsset.usageNote} />
                <DetailRow label="备注" value={selectedAsset.remark} />
              </>
            )}
          </div>
          {scannedDetail && selectedAsset.status === '未盘' && selectedAsset.photoRequired && (
            <div className="inventory-photo-card">
              <div className="inventory-section-title">上传图片</div>
              <div className="inventory-photo-tip">
                仅支持拍照上传，不支持从本地相册选择
              </div>
              <div className="inventory-photo-grid">
                {slots.map((slot) => {
                  const photoKey = `${selectedAsset.id}::${slot}`;
                  return (
                    <PhotoSlot
                      key={slot}
                      label={slot}
                      added={Boolean(photoState[photoKey])}
                      onAdd={() => togglePhoto(slot)}
                      onRemove={() => togglePhoto(slot)}
                    />
                  );
                })}
              </div>
            </div>
          )}
          <div className="inventory-detail-actions">
            {quickPhotoMode ? <>
              <Button onClick={() => { setQuickPhotoMode(false); setScannedDetail(false); setView('quickList'); }}>返回</Button>
              <Button type="primary" className="inventory-mobile-scan-action" onClick={saveQuickPhotos}>保存图片</Button>
            </> : <>
            {selectedAsset.status === '未盘' && (
              <Button danger className="inventory-mobile-detail-action" icon={<AlertTriangle size={18} />} disabled={projectClosed} onClick={() => setReportLossOpen(true)}>报失</Button>
            )}
            {selectedAsset.status === '未盘' && <Button type="primary" className="inventory-mobile-scan-action inventory-mobile-detail-action" icon={<ScanLine size={18} />} disabled={projectClosed} onClick={() => scannedDetail ? handleSubmitScan(selectedAsset.ownerNo === currentUser.employeeNo ? 'mine' : 'proxy') : openScan(selectedAsset.id, detailReturnView === 'planDetail' ? activePlanId : null)}>{scannedDetail ? '提交' : '盘点'}</Button>}
            </>}
          </div>
        </div>
      </>
    );
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
        <div className="inventory-scan-help">扫码后系统会根据盘点任务自动校验资产范围和盘点状态</div>
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
            {asset?.photoRequired && asset.status === '未盘' && <Button size="small" onClick={() => openQuickPhotos(asset)} aria-label={`补拍照片${tagNo}`}>{photosReady(asset) ? '照片已齐' : '补拍照片'}</Button>}
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
              right={<>{canQuickScan && <Button type="text" aria-label="快速扫描" icon={<ScanLine size={19} />} onClick={() => openQuickScan()} />}<Button type="text" shape="circle" aria-label="监督计划" icon={<ListChecks size={19} />} onClick={() => setPlanMenuOpen((current) => !current)} /></>}
            />
            {planMenuOpen && <div className="inventory-supervised-plans" role="menu" aria-label="我监督的盘点计划">
              {supervisedPlans.map((plan) => <button type="button" role="menuitem" key={plan.id} onClick={() => { setActivePlanId(plan.id); setCollapsedPlanSections([]); setPlanMenuOpen(false); setView('planDetail'); }}>
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
