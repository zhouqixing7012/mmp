import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Flashlight,
  ImagePlus,
  ListChecks,
  LogOut,
  ScanLine,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button, Input, Modal, Tag, message as antdMessage } from 'antd';
import './assetInventoryMobile.css';

const CURRENT_USER = {
  name: '孙志强',
  employeeNo: '201132000160',
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
    status: '未执行盘点',
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

const TAB_GROUPS = {
  unscanned: [
    { key: '未盘', label: '未盘' },
    { key: '报失', label: '报失' },
  ],
  scanned: [
    { key: '已盘', label: '已盘' },
    { key: '代盘', label: '代盘' },
    { key: '未执行盘点', label: '未执行' },
  ],
};

const STATUS_COLORS = {
  未盘: 'blue',
  报失: 'red',
  已盘: 'green',
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

const QUICK_SCAN_TAGS = [
  '114121801802',
  '1141300083-P',
  '114140000999',
  '1141300083-P',
];

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
  const showDate = asset.status === '已盘' || asset.status === '代盘'
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

function ScanResultModal({ scanModal, onClose, onSubmit, onReject }) {
  if (!scanModal) return null;
  const copy = SCAN_COPY[scanModal.kind];
  const isSubmit = ['mine', 'proxy'].includes(scanModal.kind);
  return (
    <Modal
      open
      title={copy.title}
      footer={null}
      centered
      onCancel={onClose}
      destroyOnClose
    >
      <p className="inventory-modal-message">{copy.message}</p>
      <div className="inventory-modal-actions">
        {isSubmit && <Button type="primary" onClick={() => onSubmit(scanModal.kind)}>{copy.confirm}</Button>}
        {scanModal.kind === 'proxy' && <Button onClick={onReject}>{copy.reject}</Button>}
        {!isSubmit && <Button type="primary" onClick={onClose}>{copy.confirm || '再接再厉'}</Button>}
        {['scanned', 'outOfScope'].includes(scanModal.kind) && <Button onClick={onClose}>休息一下</Button>}
      </div>
    </Modal>
  );
}

function ResultNotice({ notice, onContinue, onClose }) {
  if (!notice) return null;
  const isNetwork = notice.kind === 'network';
  return (
    <Modal open title={notice.title} footer={null} centered onCancel={onClose} destroyOnClose>
      <p className="inventory-modal-message">{notice.message}</p>
      <div className="inventory-modal-actions">
        <Button type="primary" onClick={onContinue}>{isNetwork ? '好的' : '再接再厉'}</Button>
        {!isNetwork && <Button onClick={onClose}>休息一下</Button>}
      </div>
    </Modal>
  );
}

export default function AssetInventoryMobilePrototype() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [view, setView] = useState('workbench');
  const [activeTab, setActiveTab] = useState('unscanned');
  const [assets, setAssets] = useState(() => DEMO_ASSETS.map((asset) => ({ ...asset })));
  const [query, setQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [scanPickerOpen, setScanPickerOpen] = useState(false);
  const [scanModal, setScanModal] = useState(null);
  const [resultNotice, setResultNotice] = useState(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [photoState, setPhotoState] = useState({});
  const [reportLossOpen, setReportLossOpen] = useState(false);
  const [confirmLossOpen, setConfirmLossOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [quickScanned, setQuickScanned] = useState([]);
  const [quickResult, setQuickResult] = useState(null);

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) || null;
  const filteredAssets = useMemo(() => assets.filter((asset) => includesQuery(asset, query)), [assets, query]);

  const openDetail = (asset) => {
    setSelectedAssetId(asset.id);
    setView('detail');
  };

  const returnToProjectList = () => {
    navigate('/yewurules', { state: { returnTo: 'asset-inventory-projects' } });
  };

  const goBack = () => {
    if (view === 'workbench') {
      returnToProjectList();
      return;
    }
    setView(view === 'detail' ? 'workbench' : 'detail');
    setScanPickerOpen(false);
    setScanModal(null);
    setResultNotice(null);
  };

  const exitPrototype = returnToProjectList;

  const openScan = (assetId = null) => {
    setSelectedAssetId(assetId);
    setScanPickerOpen(false);
    setScanModal(null);
    setView('scan');
  };

  const handleScanPick = (kind) => {
    setScanPickerOpen(false);
    if (kind === 'mine') {
      const asset = assets.find((item) => item.status === '未盘' && item.owner === CURRENT_USER.name);
      setScanModal({ kind, assetId: asset?.id || null });
      return;
    }
    if (kind === 'proxy') {
      const asset = assets.find((item) => item.status === '代盘');
      setScanModal({ kind, assetId: asset?.id || null });
      return;
    }
    setScanModal({ kind, assetId: selectedAssetId });
  };

  const handleSubmitScan = (kind) => {
    const scanAsset = assets.find((asset) => asset.id === scanModal?.assetId);
    if (scanAsset && ['mine', 'proxy'].includes(kind)) {
      setSelectedAssetId(scanAsset.id);
      setAssets((current) => current.map((asset) => (
        asset.id === scanAsset.id
          ? {
            ...asset,
            status: kind === 'proxy' ? '代盘' : '已盘',
            inventoryDate: '2025-12-15 10:13',
            inventoryBy: CURRENT_USER.name,
            proxyFor: kind === 'proxy' ? scanAsset.owner : '',
          }
          : asset
      )));
    }
    setScanModal(null);
    setResultNotice({
      kind,
      title: kind === 'proxy' ? '代盘提交成功' : '盘点提交成功',
      message: kind === 'proxy'
        ? `${scanAsset?.owner || '资产责任人'}已收到您的代盘信息啦。感谢您的热情帮助！`
        : `您已成功盘到${scanAsset?.assetDesc || '这枚资产'}一枚，您还有未盘到的资产哦，继续吧~`,
    });
  };

  const handleRejectProxy = () => {
    setScanModal(null);
    setResultNotice({
      kind: 'rejected',
      title: '继续盘点',
      message: '您已残忍拒绝，请扫描您的资产吧~',
    });
  };

  const handleResultContinue = () => {
    setResultNotice(null);
    if (resultNotice?.kind === 'network') {
      setView('detail');
      return;
    }
    setView('scan');
  };

  const togglePhoto = (slot) => {
    if (!selectedAsset) return;
    const key = `${selectedAsset.id}::${slot}`;
    setPhotoState((current) => ({ ...current, [key]: !current[key] }));
  };

  const submitReportLoss = () => {
    if (!reportReason.trim()) {
      messageApi.warning('请填写报失原因');
      return;
    }
    setReportLossOpen(false);
    setConfirmLossOpen(true);
  };

  const confirmReportLoss = () => {
    if (!selectedAsset) return;
    setAssets((current) => current.map((asset) => (
      asset.id === selectedAsset.id
        ? { ...asset, status: '报失', inventoryNote: reportReason.trim(), inventoryDate: '2025-12-15 10:13', inventoryBy: CURRENT_USER.name }
        : asset
    )));
    setConfirmLossOpen(false);
    setReportReason('');
    messageApi.success('已提交报失，盘点说明已保存');
  };

  const addQuickScan = () => {
    const next = QUICK_SCAN_TAGS[quickScanned.length % QUICK_SCAN_TAGS.length];
    setQuickScanned((current) => [...current, next]);
  };

  const submitQuickScan = () => {
    const success = [];
    const failed = [];
    quickScanned.forEach((tagNo) => {
      const asset = assets.find((item) => item.tagNo === tagNo);
      if (asset && !['已盘', '代盘'].includes(asset.status) && !success.includes(tagNo)) {
        success.push(tagNo);
      } else {
        failed.push(tagNo);
      }
    });
    if (success.length) {
      setAssets((current) => current.map((asset) => (
        success.includes(asset.tagNo)
          ? { ...asset, status: '已盘', inventoryDate: '2025-12-15 10:13', inventoryBy: CURRENT_USER.name }
          : asset
      )));
    }
    setQuickResult({ total: quickScanned.length, success: success.length, failed: failed.length });
    setQuickScanned([]);
  };

  const renderWorkBench = () => {
    const groups = TAB_GROUPS[activeTab];
    return (
      <>
        <div className="inventory-mobile-hero">
          <div>
            <div className="inventory-eyebrow">2025 年度资产盘点</div>
            <div className="inventory-hero-title">我的盘点任务</div>
          </div>
          <div className="inventory-hero-stat">
            <span>{formatStatusCount(filteredAssets, '未盘')}</span>
            <small>待盘</small>
          </div>
        </div>
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
            未盘 <span>{formatStatusCount(filteredAssets, '未盘') + formatStatusCount(filteredAssets, '报失')}</span>
          </button>
          <button type="button" className={activeTab === 'scanned' ? 'is-active' : ''} onClick={() => setActiveTab('scanned')}>
            已盘 <span>{formatStatusCount(filteredAssets, '已盘') + formatStatusCount(filteredAssets, '代盘') + formatStatusCount(filteredAssets, '未执行盘点')}</span>
          </button>
        </div>
        <div className="inventory-mobile-content-list">
          {groups.map((group) => {
            const groupAssets = filteredAssets.filter((asset) => asset.status === group.key);
            return (
              <section key={group.key} className="inventory-status-section">
                <div className="inventory-section-title">
                  <span>{group.label}</span>
                  <span className="inventory-section-count">{groupAssets.length} 条</span>
                </div>
                {groupAssets.length ? groupAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onClick={() => openDetail(asset)} />
                )) : (
                  <div className="inventory-empty">当前分类暂无资产</div>
                )}
              </section>
            );
          })}
        </div>
      </>
    );
  };

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
            <DetailRow label="资产地址" value={selectedAsset.address} />
            {selectedAsset.area !== '员工' && <DetailRow label="盘点范围" value={selectedAsset.area} />}
            <DetailRow label="盘点人" value={selectedAsset.inventoryBy} />
            <DetailRow label="盘点日期" value={selectedAsset.inventoryDate} />
            <DetailRow label="盘点说明" value={selectedAsset.inventoryNote} />
            {selectedAsset.area !== '员工' && (
              <>
                <DetailRow label="用途" value={selectedAsset.purpose} />
                <DetailRow label="公司" value={selectedAsset.company} />
                <DetailRow label="使用说明" value={selectedAsset.usageNote} />
                <DetailRow label="备注" value={selectedAsset.remark} />
              </>
            )}
          </div>
          {selectedAsset.photoRequired && (
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
            {!['已盘', '代盘'].includes(selectedAsset.status) && (
              <Button danger icon={<AlertTriangle size={16} />} onClick={() => setReportLossOpen(true)}>报失</Button>
            )}
            <Button type="primary" icon={<ScanLine size={16} />} onClick={() => openScan(selectedAsset.id)}>盘点</Button>
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
        <div className="inventory-scan-help">扫码后系统会根据盘点任务自动校验资产范围和盘点状态</div>
        <div className="inventory-scan-controls">
          <Button icon={<Flashlight size={17} />} onClick={() => setFlashlightOn((current) => !current)}>
            {flashlightOn ? '已开启手电筒' : '手电筒'}
          </Button>
          <Button type="primary" icon={<ScanLine size={17} />} onClick={() => setScanPickerOpen((current) => !current)}>
            模拟扫码
          </Button>
        </div>
        {scanPickerOpen && <ScanPicker onSelect={handleScanPick} />}
      </div>
      <ScanResultModal
        scanModal={scanModal}
        onClose={() => setScanModal(null)}
        onSubmit={handleSubmitScan}
        onReject={handleRejectProxy}
      />
      <ResultNotice
        notice={resultNotice}
        onContinue={handleResultContinue}
        onClose={() => setResultNotice(null)}
      />
    </>
  );

  const renderQuickScan = () => (
    <>
      <MobileHeader title="快速扫描" onBack={goBack} onExit={exitPrototype} />
      <div className="inventory-mobile-content inventory-quick-scan-page">
        <div className="inventory-quick-scan-banner">
          <ClipboardCheck size={24} />
          <div>
            <strong>快速盲扫</strong>
            <span>只记录资产标签号，提交时统一校验</span>
          </div>
        </div>
        <div className="inventory-quick-scan-actions">
          <Button type="primary" icon={<ScanLine size={17} />} onClick={addQuickScan}>模拟扫描标签</Button>
          <Button icon={<Trash2 size={16} />} onClick={() => setQuickScanned([])}>清空</Button>
        </div>
        <div className="inventory-section-title">
          <span>已扫描标签</span>
          <span className="inventory-section-count">{quickScanned.length} 条</span>
        </div>
        <div className="inventory-quick-list">
          {quickScanned.length ? quickScanned.map((tagNo, index) => (
            <div className="inventory-quick-row" key={`${tagNo}-${index}`}>
              <span>{index + 1}</span>
              <span>{tagNo}</span>
              <Tag color={assets.some((asset) => asset.tagNo === tagNo) ? 'blue' : 'red'}>
                {assets.some((asset) => asset.tagNo === tagNo) ? '待校验' : '范围外'}
              </Tag>
            </div>
          )) : <div className="inventory-empty">点击“模拟扫描标签”添加待提交资产</div>}
        </div>
        <Button
          type="primary"
          block
          disabled={!quickScanned.length}
          onClick={submitQuickScan}
        >
          提交盘点结果
        </Button>
      </div>
      <Modal open={Boolean(quickResult)} title="快速扫描结果" footer={null} centered onCancel={() => setQuickResult(null)}>
        {quickResult && (
          <>
            <div className="inventory-quick-result">
              <div><strong>{quickResult.total}</strong><span>扫描总数</span></div>
              <div><strong className="is-success">{quickResult.success}</strong><span>成功上传</span></div>
              <div><strong className="is-error">{quickResult.failed}</strong><span>信息错误</span></div>
            </div>
            <p className="inventory-modal-message">
              您本次共提交{quickResult.total}条资产，其中{quickResult.failed}条资产信息错误。
            </p>
            <Button type="primary" block onClick={() => setQuickResult(null)}>确定</Button>
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
              right={(
                <Button
                  type="text"
                  shape="circle"
                  aria-label="快速扫描"
                  icon={<ListChecks size={19} />}
                  onClick={() => setView('quickScan')}
                />
              )}
            />
            <div className="inventory-mobile-content">
              {renderWorkBench()}
            </div>
            <div className="inventory-mobile-footer">
              <Button type="primary" icon={<ScanLine size={17} />} onClick={() => openScan()}>开始盘点</Button>
              <span><LogOut size={14} /> 盘点计划：2025 年度员工盘点</span>
            </div>
          </>
        )}
        {view === 'detail' && renderDetail()}
        {view === 'scan' && renderScan()}
        {view === 'quickScan' && renderQuickScan()}
      </div>
      <Modal open={reportLossOpen} title="填写报失原因" centered footer={null} onCancel={() => setReportLossOpen(false)} destroyOnClose>
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
      <Modal open={confirmLossOpen} title="确认提交报失" centered footer={null} onCancel={() => setConfirmLossOpen(false)} destroyOnClose>
        <p className="inventory-modal-message">资产丢失需履行赔偿责任哟！确定不再继续寻找了吗？</p>
        <div className="inventory-modal-actions">
          <Button onClick={() => setConfirmLossOpen(false)}>继续寻找</Button>
          <Button danger type="primary" onClick={confirmReportLoss}>确定报失</Button>
        </div>
      </Modal>
    </div>
  );
}

export { DEMO_ASSETS };
