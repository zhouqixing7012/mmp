import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Drawer, Empty, Input, Modal, message } from 'antd';
import { ArrowLeft, ArrowRight, Barcode, Check, ChevronRight, Clock3, Flashlight, FlashlightOff, PackagePlus, Plus, QrCode, Search, Smartphone, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEnabledWarehouses } from '../../mock/reference/warehouseCatalog';
import { INVENTORY_ASSET_POOL } from '../../mock/inventoryAssetPool';
import './moveMobilePrototype.css';

const USER = '114111-杨芊';
const TRANSIT_WAREHOUSE = 'V00001.集团在途总库';
// 移动端原型演示账号的仓库权限样例；不代表生产用户的权限配置。
const OUTBOUND_WAREHOUSE_CODES = new Set(['I0001', 'I0013', 'I0022']);
const INBOUND_WAREHOUSE_CODES = new Set(['I0001']);
const EMPTY_LINES = [];
const WAITING_STATUSES = new Set(['出库待接收', '待接收']);
const formatWarehouse = (row) => `${row.warehouseCode}.${row.warehouseDescription}`;
const eligibleAssets = (warehouse) => INVENTORY_ASSET_POOL.filter((asset) => (
  ['1.资产', '2.低值耐用品'].includes(asset.materialGroup)
  && asset.warehouse === warehouse
  && !asset.locked
  && Number(asset.availableQty || 0) > 0
));

const WAREHOUSES = getEnabledWarehouses().map((row) => ({ ...row, name: formatWarehouse(row) }));
const byCode = new Map(WAREHOUSES.map((row) => [row.warehouseCode, row]));
const warehouseName = (code) => byCode.has(code) ? byCode.get(code).name : '';

const seedAsset = INVENTORY_ASSET_POOL.find((asset) => asset.assetTag === 'AST-2409010091');
const INITIAL_DOCUMENTS = [
  {
    id: 'move-draft-1', documentNo: 'TS-202609230001', status: '草稿',
    fromWarehouse: warehouseName('I0001'), toWarehouse: warehouseName('I0013'),
    createdDate: '2026-09-23', creator: USER, remark: '前台库存调整',
    lines: [{ ...INVENTORY_ASSET_POOL[1], id: 'line-draft-1', moveStatus: '草稿', moveDesc: '' }],
  },
  {
    id: 'move-receive-1', documentNo: 'TS-202609230002', status: '出库待接收',
    fromWarehouse: warehouseName('I0013'), toWarehouse: warehouseName('I0001'),
    createdDate: '2026-09-23', creator: '206984-何文', remark: '前台设备移库',
    lines: [{ ...seedAsset, id: 'line-receive-1', warehouse: TRANSIT_WAREHOUSE, moveStatus: '待接收', verified: false, moveDesc: '', receiveDesc: '', verificationDesc: '' }],
  },
  {
    id: 'move-complete-1', documentNo: 'TS-202609220018', status: '已完成',
    fromWarehouse: warehouseName('I0013'), toWarehouse: warehouseName('I0001'),
    createdDate: '2026-09-22', creator: '206984-何文', remark: '前台设备移库',
    lines: [{ ...seedAsset, id: 'line-complete-1', warehouse: warehouseName('I0001'), moveStatus: '已接收', verified: true, verificationDesc: '扫码验证通过', receiver: USER, receiveTime: '2026-09-22 15:36:08', moveDesc: '' }],
  },
  {
    id: 'move-rejected-1', documentNo: 'TS-202609220012', status: '已驳回',
    fromWarehouse: warehouseName('I0013'), toWarehouse: warehouseName('I0001'),
    createdDate: '2026-09-22', creator: '206984-何文', remark: '前台设备移库',
    lines: [{ ...seedAsset, id: 'line-rejected-1', warehouse: TRANSIT_WAREHOUSE, moveStatus: '已驳回', verified: false, rejectReason: '物资标签与实物不一致', moveDesc: '' }],
  },
];

function statusTone(value) {
  if (value === '草稿') return 'draft';
  if (value === '出库待接收' || value === '待接收') return 'waiting';
  if (value === '已完成' || value === '已接收') return 'done';
  if (value === '已驳回') return 'rejected';
  return 'draft';
}

function makeDocumentNo() {
  const stamp = new Date();
  const date = [stamp.getFullYear(), String(stamp.getMonth() + 1).padStart(2, '0'), String(stamp.getDate()).padStart(2, '0')].join('');
  return `TS-${date}${String(stamp.getHours() * 60 + stamp.getMinutes()).padStart(4, '0')}`;
}

function deriveStatus(lines) {
  if (lines.some((line) => line.moveStatus === '待接收')) return '出库待接收';
  if (lines.length && lines.every((line) => line.moveStatus === '已驳回')) return '已驳回';
  return '已完成';
}

function MobileStatus({ value }) {
  return <span className={`move-mobile-status is-${statusTone(value)}`}>{value}</span>;
}

function QRScanner({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [manualValue, setManualValue] = useState('');
  onScanRef.current = onScan;

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    let timer;
    let detector;
    setError('');
    setTorchOn(false);
    setManualValue('');

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('当前浏览器无法访问摄像头，请检查浏览器权限。');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!('BarcodeDetector' in window)) {
          setError('此浏览器暂不支持自动识别二维码，可使用下方输入框录入标签号。');
          return;
        }
        detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const scanFrame = async () => {
          if (!active || !videoRef.current || videoRef.current.readyState < 2) {
            if (active) timer = window.setTimeout(scanFrame, 250);
            return;
          }
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes.find((code) => code.rawValue)?.rawValue;
            if (value) { onScanRef.current(value); return; }
          } catch (scanError) {
            setError('二维码识别暂不可用，请调整镜头或手动输入标签号。');
          }
          if (active) timer = window.setTimeout(scanFrame, 250);
        };
        scanFrame();
      } catch (cameraError) {
        setError('无法打开摄像头，请允许浏览器使用摄像头，或手动输入标签号。');
      }
    };
    startCamera();
    return () => {
      active = false;
      window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track?.applyConstraints) { setError('当前设备不支持闪光灯控制。'); return; }
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (torchError) {
      setError('当前设备或浏览器不支持开启手电筒。');
    }
  };

  if (!open) return null;
  return (
    <div className="move-mobile-scanner-backdrop" role="dialog" aria-modal="true" aria-label="扫描资产二维码">
      <div className="move-mobile-scanner">
        <div className="move-mobile-scanner-header"><strong>扫描资产二维码</strong><Button type="text" aria-label="关闭扫描" icon={<X size={19} />} onClick={onClose} /></div>
        <div className="move-mobile-camera-frame">
          <video ref={videoRef} muted playsInline />
          <span className="move-mobile-scan-guide" />
          {!error && <span className="move-mobile-camera-hint">将资产二维码放入框内</span>}
        </div>
        <Button className={`move-mobile-torch${torchOn ? ' is-on' : ''}`} icon={torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />} onClick={toggleTorch}>{torchOn ? '关闭手电筒' : '打开手电筒'}</Button>
        {error && <p className="move-mobile-scanner-error">{error}</p>}
        <div className="move-mobile-manual-scan"><Input value={manualValue} onChange={(event) => setManualValue(event.target.value)} placeholder="也可输入资产标签号" onPressEnter={() => manualValue.trim() && onScanRef.current(manualValue.trim())} /><Button type="primary" disabled={!manualValue.trim()} onClick={() => onScanRef.current(manualValue.trim())}>确认</Button></div>
      </div>
    </div>
  );
}

function FieldRow({ label, value, onClick, placeholder }) {
  return (
    <Button type="text" htmlType="button" block className={`move-mobile-field${onClick ? ' is-clickable' : ''}`} onClick={onClick}>
      <span>{label}</span>
      <strong className={!value ? 'is-placeholder' : ''}>{value || placeholder || '请选择'}</strong>
      {onClick && <ChevronRight size={17} />}
    </Button>
  );
}

function WarehousePicker({ open, title, options, onClose, onChoose }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => options.filter((item) => (
    `${item.warehouseCode} ${item.warehouseDescription} ${item.company}`.toLowerCase().includes(query.trim().toLowerCase())
  )), [options, query]);
  const groups = useMemo(() => results.reduce((map, item) => {
    map.set(item.company, [...(map.get(item.company) || []), item]);
    return map;
  }, new Map()), [results]);

  return (
    <Drawer
      open={open}
      title={title}
      placement="bottom"
      height="78vh"
      onClose={() => { setQuery(''); onClose(); }}
      className="move-mobile-drawer"
      rootClassName="move-mobile-drawer-root"
    >
      <Input allowClear prefix={<Search size={16} />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入仓库编码或名称" />
      <div className="move-mobile-option-list">
        {[...groups.entries()].map(([company, rows]) => (
          <section key={company}>
            <div className="move-mobile-company">{company}</div>
            {rows.map((row) => (
              <Button type="text" htmlType="button" block key={row.warehouseCode} className="move-mobile-option" onClick={() => { onChoose(row); setQuery(''); }}>
                <span className="move-mobile-option-code">{row.warehouseCode}</span>
                <span className="move-mobile-option-copy"><strong>{row.warehouseDescription}</strong><small>{row.city} · {row.building} · {row.floor}</small></span>
                <ChevronRight size={17} />
              </Button>
            ))}
          </section>
        ))}
        {!results.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有符合条件的仓库" />}
      </div>
    </Drawer>
  );
}

function AssetPicker({ open, assets, onClose, onChoose }) {
  const [query, setQuery] = useState('');
  const results = assets.filter((asset) => `${asset.assetTag} ${asset.sn} ${asset.materialDesc}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Drawer open={open} title="选择移库物资" placement="bottom" height="82vh" onClose={() => { setQuery(''); onClose(); }} className="move-mobile-drawer" rootClassName="move-mobile-drawer-root">
      <Input allowClear prefix={<Search size={16} />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标签号、SN或物资说明" />
      <div className="move-mobile-option-list">
        {results.map((asset) => (
          <Button type="text" htmlType="button" block key={asset.id} className="move-mobile-asset-option" onClick={() => { onChoose(asset); setQuery(''); }}>
            <span className="move-mobile-asset-icon"><Smartphone size={18} /></span>
            <span className="move-mobile-option-copy"><strong>{asset.materialDesc}</strong><small>{asset.assetTag} · {asset.sn}</small><small>{asset.materialGroup} · {asset.assetStatus}</small></span>
            <Plus size={18} />
          </Button>
        ))}
        {!results.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有可添加的移库物资" />}
      </div>
    </Drawer>
  );
}

export default function MoveMobilePrototype() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [page, setPage] = useState('home');
  const [tab, setTab] = useState('received');
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [selectedLineIds, setSelectedLineIds] = useState([]);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [warehousePicker, setWarehousePicker] = useState('');
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [remark, setRemark] = useState('');
  const [scanValue, setScanValue] = useState('');
  const [receiveScan, setReceiveScan] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [quickMatches, setQuickMatches] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState('receive');
  const [activeLineId, setActiveLineId] = useState(null);

  const activeDocument = documents.find((doc) => doc.id === activeDocumentId) || null;
  const activeLine = activeDocument?.lines.find((line) => line.id === activeLineId) || null;
  const outgoingWarehouses = WAREHOUSES.filter((row) => OUTBOUND_WAREHOUSE_CODES.has(row.warehouseCode));
  const incomingWarehouses = WAREHOUSES.filter((row) => row.company === byCode.get(fromWarehouse?.slice(0, 5))?.company && row.name !== fromWarehouse);
  const assetCandidates = eligibleAssets(fromWarehouse).filter((asset) => !documents.some((doc) => (
    doc.lines.some((line) => line.assetTag === asset.assetTag && ['草稿', '待接收'].includes(line.moveStatus))
    && doc.id !== activeDocumentId
  )));

  const filteredDocuments = useMemo(() => documents.filter((doc) => {
    const belongs = tab === 'initiated'
      ? Boolean(outgoingWarehouses.some((row) => row.name === doc.fromWarehouse))
      : INBOUND_WAREHOUSE_CODES.has(doc.toWarehouse?.slice(0, 5));
    const matches = !searchQuery || [doc.documentNo, doc.creator, doc.fromWarehouse, doc.toWarehouse, ...doc.lines.flatMap((line) => [line.assetTag, line.sn])].join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return belongs && matches && (tab !== 'received' || doc.status !== '草稿');
  }).sort((a, b) => Number(WAITING_STATUSES.has(b.status)) - Number(WAITING_STATUSES.has(a.status)) || b.createdDate.localeCompare(a.createdDate)), [documents, outgoingWarehouses, searchQuery, tab]);

  const openDocument = (doc) => {
    setActiveDocumentId(doc.id);
    setFromWarehouse(doc.fromWarehouse);
    setToWarehouse(doc.toWarehouse);
    setRemark(doc.remark || '');
    setSelectedLineIds([]);
    setActiveLineId(null);
    setPage(doc.status === '草稿' ? 'editor' : 'detail');
  };

  const openAssetDetail = (line) => {
    setActiveLineId(line.id);
    setPage('asset-detail');
  };

  const startCreate = () => {
    setActiveDocumentId(null);
    setFromWarehouse('');
    setToWarehouse('');
    setRemark('');
    setScanValue('');
    setPage('editor');
  };

  const updateDocument = (id, change) => setDocuments((current) => current.map((doc) => doc.id === id ? { ...doc, ...change } : doc));

  const addAsset = (asset) => {
    if (!fromWarehouse) return message.warning('请先选择移出仓库');
    if (!['1.资产', '2.低值耐用品'].includes(asset.materialGroup)) return message.warning('当前物资类型暂不支持移库');
    if (asset.warehouse !== fromWarehouse) return message.warning('物资不在移出仓库内');
    if (Number(asset.availableQty || 0) <= 0) return message.warning('物资不在库');
    if (asset.locked) return message.warning('当前物资已被其他业务锁定，无法移库');
    const lockedByAnotherMove = documents.some((doc) => (
      doc.id !== activeDocumentId
      && doc.lines.some((line) => line.assetTag === asset.assetTag && ['草稿', '待接收'].includes(line.moveStatus))
    ));
    if (lockedByAnotherMove) return message.warning('当前物资已被其他业务锁定，无法移库');
    const alreadyUsed = documents.some((doc) => doc.id === activeDocumentId && doc.lines.some((line) => line.assetTag === asset.assetTag));
    if (alreadyUsed) return message.warning('该物资已添加，请选择其他物资');
    const line = { ...asset, id: `line-${Date.now()}`, moveStatus: '草稿', moveDesc: '' };
    if (activeDocumentId) {
      const doc = documents.find((item) => item.id === activeDocumentId);
      updateDocument(activeDocumentId, { lines: [...doc.lines, line] });
    } else {
      const documentNo = makeDocumentNo();
      const id = `move-${Date.now()}`;
      const doc = { id, documentNo, status: '草稿', fromWarehouse, toWarehouse, createdDate: new Date().toISOString().slice(0, 10), creator: USER, remark, lines: [line] };
      setDocuments((current) => [doc, ...current]);
      setActiveDocumentId(id);
      message.success(`已实时保存为移库草稿：${documentNo}`);
    }
    setAssetPickerOpen(false);
    setScanValue('');
    return undefined;
  };

  const addScannedAsset = (rawValue) => {
    const value = rawValue.trim();
    if (!value) return;
    if (!fromWarehouse) { message.warning('请先选择移出仓库'); setScanValue(''); return; }
    const asset = INVENTORY_ASSET_POOL.find((item) => item.assetTag === value);
    if (!asset) { message.warning('物资不存在或不在移出仓库内！'); setScanValue(''); return; }
    addAsset(asset);
  };

  const saveDraftFields = (field, value) => {
    if (field === 'fromWarehouse') setFromWarehouse(value);
    if (field === 'toWarehouse') setToWarehouse(value);
    if (field === 'remark') setRemark(value);
    if (activeDocumentId) updateDocument(activeDocumentId, { [field]: value });
  };

  const submitMove = () => {
    const doc = documents.find((row) => row.id === activeDocumentId);
    if (!fromWarehouse) return message.warning('请选择移出仓库');
    if (!toWarehouse) return message.warning('请选择移入仓库');
    if (fromWarehouse === toWarehouse) return message.warning('移入仓库不能与移出仓库相同');
    if (!doc?.lines.length) return message.warning('请先添加移库物资');
    const fromRecord = byCode.get(fromWarehouse.slice(0, 5));
    const toRecord = byCode.get(toWarehouse.slice(0, 5));
    if (!fromRecord || fromRecord.status !== '启用' || !OUTBOUND_WAREHOUSE_CODES.has(fromRecord.warehouseCode)) return message.warning('当前用户没有该移出仓库的出库权限');
    if (!toRecord || toRecord.status !== '启用' || fromRecord.company !== toRecord.company) return message.warning('请选择同一财务公司的有效移入仓库');
    if (doc.lines.some((line) => line.warehouse !== fromWarehouse || line.locked || Number(line.availableQty || 0) <= 0)) return message.warning('移库物资已不在移出仓库或不可用，请重新核对');
    updateDocument(doc.id, { fromWarehouse, toWarehouse, remark, status: '出库待接收', lines: doc.lines.map((line) => ({ ...line, moveStatus: '待接收', verified: false, warehouse: TRANSIT_WAREHOUSE })) });
    message.success(`移库单 ${doc.documentNo} 已调出，等待移入仓库接收`);
    setPage('home');
    setTab('initiated');
  };

  const verifyAsset = (rawValue, method = '手工验证') => {
    const value = rawValue.trim();
    if (!value) return message.warning('请输入或扫描资产标签号/SN');
    if (!activeDocument) return;
    const line = activeDocument.lines.find((item) => (item.assetTag === value || item.sn === value) && item.moveStatus === '待接收');
    if (!line) return message.warning('当前单据没有匹配的待接收物资');
    updateDocument(activeDocument.id, { lines: activeDocument.lines.map((item) => item.id === line.id ? { ...item, verified: true, verificationDesc: `${method}通过` } : item) });
    setSelectedLineIds((current) => [...new Set([...current, line.id])]);
    setReceiveScan('');
    message.success('验证成功，已勾选该物资');
  };

  const receiveSelected = () => {
    if (!activeDocument || !selectedLineIds.length) return message.warning('请选择待接收物资');
    const selected = activeDocument.lines.filter((line) => selectedLineIds.includes(line.id));
    if (selected.some((line) => line.moveStatus !== '待接收' || !line.verified)) return message.warning('请选择已验证的待接收物资');
    const lines = activeDocument.lines.map((line) => selectedLineIds.includes(line.id) ? { ...line, moveStatus: '已接收', warehouse: activeDocument.toWarehouse, receiver: USER, receiveTime: new Date().toLocaleString('zh-CN', { hour12: false }) } : line);
    updateDocument(activeDocument.id, { lines, status: deriveStatus(lines) });
    setSelectedLineIds([]);
    message.success(`已接收 ${selected.length} 件物资`);
  };

  const rejectSelected = () => {
    if (!activeDocument || !selectedLineIds.length) return message.warning('请选择需要驳回的待接收物资');
    if (!rejectReason.trim()) return message.warning('请填写驳回原因');
    const selected = activeDocument.lines.filter((line) => selectedLineIds.includes(line.id) && line.moveStatus === '待接收');
    if (!selected.length) return message.warning('当前勾选中没有待接收物资');
    const reverseId = `move-reverse-${Date.now()}`;
    const reverseDocument = {
      id: reverseId, documentNo: `TS-R${Date.now()}`, status: '出库待接收',
      fromWarehouse: activeDocument.toWarehouse, toWarehouse: activeDocument.fromWarehouse,
      createdDate: new Date().toISOString().slice(0, 10), creator: '系统', remark: rejectReason.trim(),
      sourceDocumentNo: activeDocument.documentNo,
      lines: selected.map((line) => ({ ...line, id: `${line.id}-reverse`, moveStatus: '待接收', verified: false, rejectReason: rejectReason.trim(), warehouse: TRANSIT_WAREHOUSE })),
    };
    const lines = activeDocument.lines.map((line) => selectedLineIds.includes(line.id) ? { ...line, moveStatus: '已驳回', rejectReason: rejectReason.trim() } : line);
    updateDocument(activeDocument.id, { lines, status: deriveStatus(lines) });
    setDocuments((current) => [reverseDocument, ...current]);
    setSelectedLineIds([]);
    setRejectOpen(false);
    setRejectReason('');
    message.success(`已驳回并生成反向移库单 ${reverseDocument.documentNo}`);
  };

  const runQuickScan = (rawValue) => {
    const value = rawValue.trim();
    if (!value) return message.warning('请输入或扫描资产标签号/SN');
    const matches = documents.filter((doc) => INBOUND_WAREHOUSE_CODES.has(doc.toWarehouse?.slice(0, 5)) && doc.status === '出库待接收' && doc.lines.some((line) => line.moveStatus === '待接收' && (line.assetTag === value || line.sn === value)));
    if (!matches.length) return message.warning('未找到当前待接收移库单');
    if (matches.length === 1) {
      const doc = matches[0];
      const line = doc.lines.find((item) => item.moveStatus === '待接收' && (item.assetTag === value || item.sn === value));
      setActiveDocumentId(doc.id);
      setSelectedLineIds([line.id]);
      updateDocument(doc.id, { lines: doc.lines.map((item) => item.id === line.id ? { ...item, verified: true, verificationDesc: '扫码验证通过' } : item) });
      setReceiveScan('');
      setPage('detail');
      message.success('验证成功，已打开对应移库单');
      return;
    }
    setQuickMatches(matches);
  };

  const openScanner = (purpose) => {
    setScannerPurpose(purpose);
    setScannerOpen(true);
  };
  const handleScannedCode = (value) => {
    setScannerOpen(false);
    if (scannerPurpose === 'create') addScannedAsset(value);
    else if (scannerPurpose === 'verify') verifyAsset(value, '扫码验证');
    else { setScanValue(value); runQuickScan(value); }
  };

  const removeDraftLine = (lineId) => {
    Modal.confirm({ title: '删除这条移库物资？', content: '删除后会释放该物资的本流程锁。', okText: '删除', cancelText: '取消', okButtonProps: { danger: true }, onOk: () => {
      const doc = documents.find((row) => row.id === activeDocumentId);
      if (!doc) return;
      const lines = doc.lines.filter((line) => line.id !== lineId);
      updateDocument(doc.id, { lines, quantity: lines.length });
    } });
  };

  const back = () => {
    if (page === 'home') navigate(-1);
    else if (page === 'asset-detail') setPage('detail');
    else { setPage('home'); setSelectedLineIds([]); }
  };

  return (
    <main className="move-mobile-page">
      <div className="move-mobile-shell" data-page-view-key={page}>
        <header className="move-mobile-header">
          <Button type="text" aria-label="返回" icon={<ArrowLeft size={19} />} onClick={back} />
          <strong>{page === 'home' ? '移库' : page === 'editor' ? (activeDocument ? '编辑移库单' : '创建移库单') : page === 'asset-detail' ? '资产详情' : '移库接收'}</strong>
          <Button type="text" aria-label="关闭移动端预览" icon={<X size={18} />} onClick={() => navigate('/yewurules')} />
        </header>

        {page === 'home' && (
          <div className={`move-mobile-content${tab === 'received' ? ' is-received-home' : ''}`}>
            <div className="move-mobile-actions">
              <Button type="primary" icon={<PackagePlus size={17} />} onClick={startCreate}>创建移库</Button>
            </div>
            <div className="move-mobile-tabs" role="tablist">
              <Button type="text" htmlType="button" className={tab === 'received' ? 'is-active' : ''} onClick={() => { setTab('received'); setSearchDraft(''); setSearchQuery(''); }}>我接收的</Button>
              <Button type="text" htmlType="button" className={tab === 'initiated' ? 'is-active' : ''} onClick={() => { setTab('initiated'); setSearchDraft(''); setSearchQuery(''); }}>我发起的</Button>
            </div>
            <div className="move-mobile-search">
              <Input prefix={<Search size={15} />} allowClear value={searchDraft} placeholder="输入移库单号、标签号或SN" onChange={(event) => setSearchDraft(event.target.value)} onPressEnter={() => setSearchQuery(searchDraft.trim())} />
              <Button type="primary" onClick={() => setSearchQuery(searchDraft.trim())}>搜索</Button>
            </div>
            <div className="move-mobile-list-heading"><strong>{tab === 'initiated' ? '发起单据' : '接收单据'}</strong><span>共 {filteredDocuments.length} 条</span></div>
            <div className="move-mobile-document-list">
              {filteredDocuments.map((doc) => (
                <Button type="text" htmlType="button" block className="move-mobile-document-card" key={doc.id} onClick={() => openDocument(doc)}>
                  <span className="move-mobile-document-top"><strong>{doc.documentNo}</strong><MobileStatus value={doc.status} /></span>
                  <span className="move-mobile-route"><span>{doc.fromWarehouse}</span><ArrowRight size={15} /><span>{doc.toWarehouse || '待选择移入仓库'}</span></span>
                  <span className="move-mobile-document-bottom"><span><Clock3 size={13} />{doc.createdDate}</span><span>{doc.creator}</span><span>{doc.lines.length} 件</span></span>
                </Button>
              ))}
              {!filteredDocuments.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tab === 'initiated' ? '暂无发起单据' : '暂无接收单据'} />}
            </div>
            {tab === 'received' && <Button className="move-mobile-quick-scan" block icon={<QrCode size={18} />} onClick={() => openScanner('receive')}>快捷扫描资产</Button>}
          </div>
        )}

        {page === 'editor' && (
          <div className="move-mobile-content move-mobile-editor">
            <div className="move-mobile-summary-card">
              <div className="move-mobile-summary-title"><span>单据状态</span><MobileStatus value={activeDocument?.status || '草稿'} /></div>
              <div className="move-mobile-docno">{activeDocument?.documentNo || '添加物资后自动生成单号'}</div>
            </div>
            <section className="move-mobile-card">
              <div className="move-mobile-card-title">移库信息</div>
              <FieldRow label="移出仓库" value={fromWarehouse} placeholder="请选择移出仓库" onClick={() => setWarehousePicker('from')} />
              <FieldRow label="移入仓库" value={toWarehouse} placeholder="请选择移入仓库" onClick={() => fromWarehouse ? setWarehousePicker('to') : message.warning('请先选择移出仓库')} />
              <div className="move-mobile-textarea"><label htmlFor="move-mobile-remark">备注</label><Input.TextArea id="move-mobile-remark" maxLength={60} showCount value={remark} onChange={(event) => saveDraftFields('remark', event.target.value)} placeholder="请输入备注" autoSize={{ minRows: 2, maxRows: 3 }} /></div>
            </section>
            <section className="move-mobile-card">
              <div className="move-mobile-card-title move-mobile-card-title-row"><span>移库物资</span><span>{activeDocument?.lines.length || 0} 件</span></div>
              <div className="move-mobile-add-methods">
                <Button type="primary" icon={<QrCode size={16} />} onClick={() => fromWarehouse ? openScanner('create') : message.warning('请先选择移出仓库')}>扫描添加</Button>
                <Button className="move-mobile-add" icon={<Plus size={16} />} onClick={() => fromWarehouse ? setAssetPickerOpen(true) : message.warning('请先选择移出仓库')}>手动选择物资</Button>
              </div>
              {(activeDocument?.lines || EMPTY_LINES).map((line) => (
                <div className="move-mobile-asset-card" key={line.id}>
                  <div className="move-mobile-asset-card-top"><strong>{line.materialDesc}</strong><Button type="text" danger aria-label="删除移库物资" icon={<Trash2 size={15} />} onClick={() => removeDraftLine(line.id)} /></div>
                  <div className="move-mobile-asset-meta">标签号：{line.assetTag}</div>
                  <div className="move-mobile-asset-meta">SN：{line.sn || '-'}</div>
                  <div className="move-mobile-asset-meta">{line.materialGroup} · {line.assetStatus}</div>
                </div>
              ))}
              {!activeDocument?.lines.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有添加移库物资" />}
            </section>
            <div className="move-mobile-sticky-actions"><Button type="primary" block onClick={submitMove}>移库提交</Button><Button block onClick={() => setPage('home')}>返回</Button></div>
          </div>
        )}

        {page === 'detail' && activeDocument && (
          <div className="move-mobile-content move-mobile-editor">
            <div className="move-mobile-summary-card">
              <div className="move-mobile-summary-title"><strong>{activeDocument.documentNo}</strong><MobileStatus value={activeDocument.status} /></div>
              <div className="move-mobile-route"><span>{activeDocument.fromWarehouse}</span><ArrowRight size={15} /><span>{activeDocument.toWarehouse}</span></div>
              <div className="move-mobile-detail-meta">制单人 {activeDocument.creator} · {activeDocument.createdDate}</div>
              {activeDocument.sourceDocumentNo && <div className="move-mobile-detail-meta">来源移库单号 {activeDocument.sourceDocumentNo}</div>}
              {activeDocument.remark && <div className="move-mobile-detail-meta">备注 {activeDocument.remark}</div>}
            </div>
            {activeDocument.status === '出库待接收' && (
              <section className="move-mobile-card">
                <div className="move-mobile-card-title">验证移库物资</div>
                <Button type="primary" block className="move-mobile-scan-verify" icon={<QrCode size={16} />} onClick={() => openScanner('verify')}>扫描二维码验证</Button>
                <div className="move-mobile-scan-row"><Input prefix={<Barcode size={16} />} value={receiveScan} placeholder="手动输入资产标签号" onChange={(event) => setReceiveScan(event.target.value)} onPressEnter={(event) => verifyAsset(event.target.value)} /><Button onClick={() => verifyAsset(receiveScan)}>验证</Button></div>
                <Button block className="move-mobile-fox-button" icon={<Check size={15} />} onClick={() => verifyAsset(receiveScan, '狐小E识别')}>狐小E识别并验证</Button>
                <p className="move-mobile-hint">验证成功后会自动勾选；验证完成后不能取消。</p>
              </section>
            )}
            <section className="move-mobile-card">
              <div className="move-mobile-card-title move-mobile-card-title-row"><span>移库明细</span><span>{activeDocument.lines.length} 件</span></div>
              {activeDocument.lines.map((line) => {
                const selectable = activeDocument.status === '出库待接收' && line.moveStatus === '待接收';
                return (
                  <div className={`move-mobile-asset-card${selectedLineIds.includes(line.id) ? ' is-selected' : ''}`} key={line.id}>
                    <div className="move-mobile-asset-card-top">
                      {selectable && <Checkbox checked={selectedLineIds.includes(line.id)} onChange={(event) => setSelectedLineIds((current) => event.target.checked ? [...new Set([...current, line.id])] : current.filter((id) => id !== line.id))} />}
                      <strong>{line.materialDesc}</strong><MobileStatus value={line.moveStatus} />
                    </div>
                    <div className="move-mobile-asset-meta">标签号：{line.assetTag}</div>
                    <div className="move-mobile-asset-meta">SN：{line.sn || '-'}</div>
                    {activeDocument.status === '出库待接收' && <div className="move-mobile-asset-meta">验证状态：{line.verified ? '已验证' : '未验证'}{line.verificationDesc ? ` · ${line.verificationDesc}` : ''}</div>}
                    {line.receiveTime && <div className="move-mobile-asset-meta">接收人：{line.receiver} · {line.receiveTime}</div>}
                    {line.rejectReason && <div className="move-mobile-reject-note">驳回原因：{line.rejectReason}</div>}
                    {line.receiveDesc && <div className="move-mobile-asset-meta">接收说明：{line.receiveDesc}</div>}
                    <Button type="link" className="move-mobile-view-asset" onClick={() => openAssetDetail(line)}>查看资产详情<ChevronRight size={15} /></Button>
                  </div>
                );
              })}
            </section>
            {activeDocument.status === '出库待接收' && <div className="move-mobile-sticky-actions"><Button type="primary" block onClick={receiveSelected}>接收所选（{selectedLineIds.filter((id) => activeDocument.lines.some((line) => line.id === id && line.verified)).length}）</Button><Button danger block onClick={() => setRejectOpen(true)}>驳回所选</Button></div>}
            {activeDocument.status === '已完成' && <div className="move-mobile-sticky-actions"><Button type="primary" block onClick={() => message.success('移库单打印已生成')}>打印</Button><Button block onClick={() => setPage('home')}>返回列表</Button></div>}
            {activeDocument.status === '已驳回' && <div className="move-mobile-sticky-actions"><Button block onClick={() => setPage('home')}>返回列表</Button></div>}
          </div>
        )}

        {page === 'asset-detail' && activeDocument && activeLine && (
          <div className="move-mobile-content move-mobile-asset-detail">
            <section className="move-mobile-card move-mobile-detail-fields">
              {[
                ['资产说明', activeLine.materialDesc],
                ['资产大类', activeLine.assetClass || activeLine.materialGroup],
                ['资产小类', activeLine.assetSubClass || '-'],
                ['资产标签号', activeLine.assetTag],
                ['序列号', activeLine.sn || '-'],
                ['数量', activeLine.quantity ?? 1],
                ['板块', activeLine.plate || '-'],
                ['公司', activeLine.company || '-'],
                ['仓库', activeLine.warehouse || activeDocument.toWarehouse],
                ['使用状态', activeLine.assetStatus || '-'],
                ['责任人', activeLine.responsiblePerson || '-'],
                ['资产地点', [activeLine.city, activeLine.building, activeLine.floor, activeLine.room].filter(Boolean).join(' · ') || '-'],
              ].map(([label, value]) => (
                <div className="move-mobile-info-row" key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </section>
            <section className="move-mobile-card move-mobile-detail-fields">
              <div className="move-mobile-card-title">本次移库</div>
              <div className="move-mobile-info-row"><span>移库单号</span><strong>{activeDocument.documentNo}</strong></div>
              <div className="move-mobile-info-row"><span>移库状态</span><strong>{activeLine.moveStatus}</strong></div>
              {activeLine.verificationDesc && <div className="move-mobile-info-row"><span>验证说明</span><strong>{activeLine.verificationDesc}</strong></div>}
              {activeLine.receiveTime && <div className="move-mobile-info-row"><span>接收时间</span><strong>{activeLine.receiveTime}</strong></div>}
              {activeLine.receiver && <div className="move-mobile-info-row"><span>接收仓管员</span><strong>{activeLine.receiver}</strong></div>}
              {activeLine.rejectReason && <div className="move-mobile-info-row"><span>驳回原因</span><strong>{activeLine.rejectReason}</strong></div>}
            </section>
            <div className="move-mobile-sticky-actions"><Button block onClick={() => setPage('detail')}>返回移库单</Button></div>
          </div>
        )}

        <WarehousePicker
          open={Boolean(warehousePicker)}
          title={warehousePicker === 'from' ? '选择移出仓库' : '选择移入仓库'}
          options={warehousePicker === 'from' ? outgoingWarehouses : incomingWarehouses}
          onClose={() => setWarehousePicker('')}
          onChoose={(row) => {
            if (warehousePicker === 'from') {
              const applyWarehouse = () => {
                saveDraftFields('fromWarehouse', row.name);
                if (toWarehouse && byCode.get(toWarehouse.slice(0, 5))?.company !== row.company) saveDraftFields('toWarehouse', '');
                if (activeDocumentId) updateDocument(activeDocumentId, { lines: [] });
                setWarehousePicker('');
              };
              if (activeDocumentId && activeDocument?.lines.length) {
                Modal.confirm({ title: '修改移出仓库？', content: '修改后会清空当前移库明细并释放对应锁，是否继续？', okText: '继续', cancelText: '取消', onOk: applyWarehouse });
              } else applyWarehouse();
            } else saveDraftFields('toWarehouse', row.name);
            if (warehousePicker !== 'from') setWarehousePicker('');
          }}
        />
        <AssetPicker open={assetPickerOpen} assets={assetCandidates} onClose={() => setAssetPickerOpen(false)} onChoose={addAsset} />
        <QRScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScannedCode} />
        <Modal open={rejectOpen} title="驳回移库物资" okText="确认驳回" cancelText="取消" okButtonProps={{ danger: true }} onOk={rejectSelected} onCancel={() => setRejectOpen(false)}>
          <p>将驳回当前勾选的 {selectedLineIds.length} 件物资，并为本次勾选内容生成一张反向移库单。</p>
          <Input.TextArea maxLength={200} showCount value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="请填写驳回原因" autoSize={{ minRows: 3, maxRows: 5 }} />
        </Modal>
          <Modal open={quickMatches.length > 1} title="选择待接收移库单" footer={null} onCancel={() => setQuickMatches([])}>
          <div className="move-mobile-option-list">{quickMatches.map((doc) => <Button type="text" htmlType="button" block className="move-mobile-option" key={doc.id} onClick={() => {
            const line = doc.lines.find((item) => item.moveStatus === '待接收' && (item.assetTag === scanValue.trim() || item.sn === scanValue.trim()));
            if (line) {
              setActiveDocumentId(doc.id);
              setSelectedLineIds([line.id]);
              setFromWarehouse(doc.fromWarehouse);
              setToWarehouse(doc.toWarehouse);
              updateDocument(doc.id, { lines: doc.lines.map((item) => item.id === line.id ? { ...item, verified: true, verificationDesc: '扫码验证通过' } : item) });
              setPage('detail');
              message.success('验证成功，已打开对应移库单');
            }
            setQuickMatches([]);
          }}>{doc.documentNo}<ChevronRight size={17} /></Button>)}</div>
        </Modal>
      </div>
    </main>
  );
}
