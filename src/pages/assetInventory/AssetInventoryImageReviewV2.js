import React, { useMemo, useRef, useState } from 'react';
import { Button, Card, DatePicker, Input, Modal, Progress, Radio, Select, Space, Statistic, Table, Tooltip, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Download, Maximize2, MousePointer2, ZoomIn, ZoomOut } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { IMAGE_REVIEW_ROWS } from './mockData';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';
import overallPhoto from './images/inventory-review-overall.webp';
import partialPhoto from './images/inventory-review-partial.webp';

const EMPTY_FILTERS = {
  assetTag: '', description: '', reviewStatus: '', owner: '', company: '', department: '', category: '',
  startDate: '', endDate: '', inventoryStatus: '', city: '', building: '',
};

const REVIEW_PHOTOS = [
  { key: 'overall', label: '整体照片', src: overallPhoto },
  { key: 'partial', label: '部分照片', src: partialPhoto },
];

const MIN_SCALE = 0.25;
const MAX_SCALE = 8;

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!value || value === '-') return !from && !to;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function PageTitle({ children }) {
  return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>;
}

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}

function DateFilter({ value, onChange }) {
  return <DatePicker value={value ? dayjs(value) : null} format="YYYY-MM-DD" style={{ width: '100%' }} onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')} />;
}

function PhotoThumbnail({ photo, onOpen }) {
  return (
    <Button type="text" className="h-auto p-0" onClick={onOpen}>
      <div className="group relative h-32 w-36 overflow-hidden rounded-lg border border-[#d9d9d9] bg-[#f5f5f5] shadow-sm transition hover:border-[#1677ff] hover:shadow-md">
        <img src={photo.src} alt={photo.label} className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent pb-2 pt-6 text-xs text-white opacity-90">
          <Maximize2 size={13} />
          查看大图
        </div>
      </div>
    </Button>
  );
}

function ViewerToolButton({ title, icon, active = false, disabled = false, onClick }) {
  return (
    <Tooltip title={title}>
      <Button
        type="text"
        disabled={disabled}
        icon={icon}
        onClick={onClick}
        className={active ? 'bg-white/15 text-white' : 'text-white'}
        style={{ color: disabled ? 'rgba(255,255,255,.3)' : '#fff' }}
      >
        {title}
      </Button>
    </Tooltip>
  );
}

function PhotoPreviewModal({ open, index, onIndexChange, onClose }) {
  const viewportRef = useRef(null);
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const selectionStartRef = useRef(null);
  const panStartRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [selecting, setSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const photo = REVIEW_PHOTOS[index] || REVIEW_PHOTOS[0];

  const setViewerScale = (next) => {
    scaleRef.current = next;
    setScale(next);
  };

  const setViewerPosition = (next) => {
    positionRef.current = next;
    setPosition(next);
  };

  const resetTransform = () => {
    setViewerScale(1);
    setViewerPosition({ x: 0, y: 0 });
    setFlipX(1);
    setFlipY(1);
    setSelecting(false);
    setSelectionRect(null);
    setIsPanning(false);
    selectionStartRef.current = null;
    panStartRef.current = null;
  };

  const resetScale = () => {
    setViewerScale(1);
    setViewerPosition({ x: 0, y: 0 });
    setSelectionRect(null);
  };

  const switchPhoto = (nextIndex) => {
    const total = REVIEW_PHOTOS.length;
    onIndexChange((nextIndex + total) % total);
    resetTransform();
  };

  const zoomAtClientPoint = (targetScale, clientX, clientY) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const oldScale = scaleRef.current;
    const nextScale = clamp(targetScale, MIN_SCALE, MAX_SCALE);
    if (Math.abs(nextScale - oldScale) < 0.001) return;

    const pointX = clientX - rect.left - rect.width / 2;
    const pointY = clientY - rect.top - rect.height / 2;
    const currentPosition = positionRef.current;
    const contentX = (pointX - currentPosition.x) / oldScale;
    const contentY = (pointY - currentPosition.y) / oldScale;

    setViewerPosition({
      x: pointX - contentX * nextScale,
      y: pointY - contentY * nextScale,
    });
    setViewerScale(nextScale);
  };

  const zoomAtCenter = (factor) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtClientPoint(scaleRef.current * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
    zoomAtClientPoint(scaleRef.current * factor, event.clientX, event.clientY);
  };

  const localZoom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();

    if (!selectionRect || selectionRect.width < 8 || selectionRect.height < 8) {
      zoomAtCenter(1.4);
      return;
    }

    const oldScale = scaleRef.current;
    const currentPosition = positionRef.current;
    const selectionCenterX = selectionRect.x + selectionRect.width / 2 - rect.width / 2;
    const selectionCenterY = selectionRect.y + selectionRect.height / 2 - rect.height / 2;
    const contentX = (selectionCenterX - currentPosition.x) / oldScale;
    const contentY = (selectionCenterY - currentPosition.y) / oldScale;
    const fitFactor = Math.min(
      rect.width / Math.max(selectionRect.width, 24),
      rect.height / Math.max(selectionRect.height, 24),
    ) * 0.72;
    const nextScale = clamp(oldScale * fitFactor, oldScale * 1.15, MAX_SCALE);

    setViewerScale(nextScale);
    setViewerPosition({ x: -contentX * nextScale, y: -contentY * nextScale });
    setSelectionRect(null);
  };

  const getPointerPosition = (event) => {
    const viewport = viewportRef.current;
    if (!viewport) return { x: 0, y: 0 };
    const rect = viewport.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    };
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    if (selecting) {
      const point = getPointerPosition(event);
      selectionStartRef.current = point;
      setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
      return;
    }

    if (scaleRef.current <= 1) return;
    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      position: { ...positionRef.current },
    };
    setIsPanning(true);
  };

  const handleMouseMove = (event) => {
    if (selecting && selectionStartRef.current) {
      const current = getPointerPosition(event);
      const start = selectionStartRef.current;
      setSelectionRect({
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
      });
      return;
    }

    if (!panStartRef.current) return;
    const start = panStartRef.current;
    setViewerPosition({
      x: start.position.x + event.clientX - start.clientX,
      y: start.position.y + event.clientY - start.clientY,
    });
  };

  const handleMouseUp = () => {
    if (selectionStartRef.current) {
      selectionStartRef.current = null;
      setSelecting(false);
      setSelectionRect((current) => (
        current && current.width >= 8 && current.height >= 8 ? current : null
      ));
    }
    panStartRef.current = null;
    setIsPanning(false);
  };

  const toggleSelection = () => {
    setSelecting((current) => {
      const next = !current;
      if (next) setSelectionRect(null);
      return next;
    });
    panStartRef.current = null;
    setIsPanning(false);
  };

  return (
    <Modal
      open={open}
      width={1160}
      footer={null}
      title={(
        <div className="flex items-center gap-3">
          <span>图片预览</span>
          <span className="rounded-full bg-[#e6f4ff] px-2 py-0.5 text-xs font-normal text-[#1677ff]">{photo.label}</span>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{index + 1} / {REVIEW_PHOTOS.length}</Typography.Text>
        </div>
      )}
      onCancel={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div className="overflow-hidden rounded-b-xl bg-[#0b1220]">
        <div
          ref={viewportRef}
          className="relative flex h-[66vh] min-h-[500px] max-h-[720px] items-center justify-center overflow-hidden bg-[#0b1220]"
          style={{
            cursor: selecting ? 'crosshair' : (scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'),
            overscrollBehavior: 'contain',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            滚轮按鼠标位置缩放 · 放大后拖拽移动
          </div>
          <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            {Math.round(scale * 100)}%
          </div>

          <Button
            shape="circle"
            icon={<ChevronLeft size={20} />}
            className="absolute left-4 z-20"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => switchPhoto(index - 1)}
          />

          <img
            src={photo.src}
            alt={photo.label}
            draggable={false}
            className="max-h-[92%] max-w-[92%] select-none object-contain will-change-transform"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) scaleX(${flipX}) scaleY(${flipY})`,
              transformOrigin: 'center center',
            }}
            onDragStart={(event) => event.preventDefault()}
          />

          {selectionRect && (
            <div
              className="pointer-events-none absolute z-10 border-2 border-[#69b1ff] bg-[#1677ff]/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]"
              style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.width,
                height: selectionRect.height,
              }}
            >
              <span className="absolute -top-7 left-0 whitespace-nowrap rounded bg-[#1677ff] px-2 py-1 text-xs text-white">已选择局部区域</span>
            </div>
          )}

          {selecting && !selectionRect && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#1677ff] px-4 py-2 text-xs text-white shadow-lg">
              按住鼠标拖拽框选需要查看的区域
            </div>
          )}

          <Button
            shape="circle"
            icon={<ChevronRight size={20} />}
            className="absolute right-4 z-20"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => switchPhoto(index + 1)}
          />
        </div>

        <div className="border-t border-white/10 bg-[#111827] px-4 py-3">
          <div className="mb-3 flex items-center justify-center gap-3">
            {REVIEW_PHOTOS.map((item, photoIndex) => (
              <Button
                key={item.key}
                type="text"
                className="h-auto p-0"
                onClick={() => switchPhoto(photoIndex)}
              >
                <div className={`relative h-14 w-20 overflow-hidden rounded-md border-2 bg-white/5 ${photoIndex === index ? 'border-[#69b1ff]' : 'border-transparent opacity-65 hover:opacity-100'}`}>
                  <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-[10px] text-white">{item.label}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <ViewerToolButton title="选择" icon={<MousePointer2 size={15} />} active={selecting || Boolean(selectionRect)} onClick={toggleSelection} />
            <ViewerToolButton title="局部放大" icon={<ZoomIn size={15} />} onClick={localZoom} />
            <ViewerToolButton title="缩小" icon={<ZoomOut size={15} />} disabled={scale <= MIN_SCALE} onClick={() => zoomAtCenter(1 / 1.25)} />
            <ViewerToolButton title="1:1" icon={<Maximize2 size={15} />} onClick={resetScale} />
            <span className="mx-1 h-5 w-px bg-white/15" />
            <ViewerToolButton title="镜像" active={flipX === -1} onClick={() => setFlipX((value) => value * -1)} />
            <ViewerToolButton title="翻转" active={flipY === -1} onClick={() => setFlipY((value) => value * -1)} />
            <ViewerToolButton title="重置" onClick={resetTransform} />
            <span className="mx-1 h-5 w-px bg-white/15" />
            <ViewerToolButton title="上一张" icon={<ChevronLeft size={15} />} onClick={() => switchPhoto(index - 1)} />
            <ViewerToolButton title="下一张" icon={<ChevronRight size={15} />} onClick={() => switchPhoto(index + 1)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function AssetInventoryImageReviewV2({ onBack }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => IMAGE_REVIEW_ROWS.filter((row) => isInventoryRangeAllowed(row.asset, allowedRanges)));
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const pendingCount = rows.filter((row) => row.reviewStatus === '待审核').length;
  const reviewedCount = rows.length - pendingCount;
  const reviewedPercent = rows.length ? Math.round((reviewedCount / rows.length) * 100) : 0;
  const filteredRows = useMemo(() => rows.filter((row) => {
    const asset = row.asset;
    return includesText(asset.assetTag, filters.assetTag)
      && includesText(asset.description, filters.description)
      && includesText(row.reviewStatus, filters.reviewStatus)
      && includesText(asset.owner, filters.owner)
      && includesText(asset.organization, filters.company)
      && includesText(asset.ownerDept, filters.department)
      && includesText(`${asset.category} ${asset.subCategory}`, filters.category)
      && inDateRange(asset.inventoryDate, filters.startDate, filters.endDate)
      && includesText(asset.inventoryStatus, filters.inventoryStatus)
      && includesText(asset.city, filters.city)
      && includesText(asset.building, filters.building);
  }), [rows, filters]);

  const updateDraft = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const setDecision = (key, decision) => setRows((current) => current.map((row) => row.key === key && row.reviewStatus === '待审核' ? { ...row, decision } : row));

  const submitReview = () => {
    if (!selectedKeys.length) { messageApi.warning('请先选择需要提交审核的资产'); return; }
    const selected = new Set(selectedKeys);
    const pendingSelected = rows.filter((row) => selected.has(row.key) && row.reviewStatus === '待审核');
    if (pendingSelected.find((row) => !row.decision)) { messageApi.warning('所选待审核资产中存在未选择审核结果的分录'); return; }
    setRows((current) => current.map((row) => {
      if (!selected.has(row.key) || row.reviewStatus !== '待审核') return row;
      return { ...row, reviewStatus: row.decision === 'pass' ? '审核通过' : '审核不通过' };
    }));
    setSelectedKeys([]);
    messageApi.success('审核结果已提交');
  };

  const columns = [
    {
      title: '资产信息', width: 330,
      render: (_, row) => <div className="text-sm leading-6">
        <div><span className="text-gray-500">资产标签号：</span>{row.asset.assetTag}</div>
        <div><span className="text-gray-500">序列号：</span>{row.asset.serialNo}</div>
        <div><span className="text-gray-500">资产大类：</span>{row.asset.category}</div>
        <div><span className="text-gray-500">资产小类：</span>{row.asset.subCategory}</div>
        <div><span className="text-gray-500">资产说明：</span>{row.asset.description}</div>
        <div><span className="text-gray-500">使用说明：</span>{row.asset.useDescription}</div>
        <div><span className="text-gray-500">备注：</span>{row.asset.remark}</div>
        <div><span className="text-gray-500">配置：</span>-</div>
      </div>,
    },
    {
      title: '盘点信息', width: 330,
      render: (_, row) => <div className="text-sm leading-6">
        <div><span className="text-gray-500">资产责任人：</span>{row.asset.owner}</div>
        <div><span className="text-gray-500">资产数量：</span>{row.asset.quantity}</div>
        <div><span className="text-gray-500">实际盘点人：</span>{row.asset.counter}</div>
        <div><span className="text-gray-500">盘点日期：</span>{row.asset.inventoryDate}</div>
        <div><span className="text-gray-500">盘点状态：</span><StatusTag value={row.asset.inventoryStatus} /></div>
        <div><span className="text-gray-500">盘点备注：</span>{row.asset.inventoryNote}</div>
      </div>,
    },
    { title: '整体照片', width: 180, align: 'center', render: () => <PhotoThumbnail photo={REVIEW_PHOTOS[0]} onOpen={() => openPreview(0)} /> },
    { title: '部分照片', width: 180, align: 'center', render: () => <PhotoThumbnail photo={REVIEW_PHOTOS[1]} onOpen={() => openPreview(1)} /> },
    {
      title: '审核结果', width: 220, fixed: 'right',
      render: (_, row) => row.reviewStatus === '待审核'
        ? <Radio.Group value={row.decision} onChange={(event) => setDecision(row.key, event.target.value)} options={[{ label: '审核通过', value: 'pass' }, { label: '审核不通过', value: 'fail' }]} />
        : <StatusTag value={row.reviewStatus} />,
    },
  ];

  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}
    <PageTitle>图片审核</PageTitle>
    <Card size="small" title={<CardTitle>审核概览</CardTitle>}>
      <div className="grid grid-cols-3 gap-4">
        <Card size="small"><Statistic title="待审核" value={pendingCount} suffix="条" /></Card>
        <Card size="small"><Statistic title="已审核" value={reviewedCount} suffix="条" /></Card>
        <Card size="small"><Typography.Text type="secondary">已审核百分比</Typography.Text><Progress percent={reviewedPercent} className="mt-3" /></Card>
      </div>
    </Card>

    <QueryBar onQuery={() => setFilters({ ...draftFilters })} onReset={() => { setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedKeys([]); }}>
      <QueryItem label="资产标签号"><Input value={draftFilters.assetTag} allowClear onChange={(event) => updateDraft('assetTag', event.target.value)} /></QueryItem>
      <QueryItem label="资产说明"><Input value={draftFilters.description} allowClear onChange={(event) => updateDraft('description', event.target.value)} /></QueryItem>
      <QueryItem label="图片审核状态"><Select value={draftFilters.reviewStatus || undefined} allowClear options={['待审核', '审核不通过', '审核通过'].map((value) => ({ label: value, value }))} onChange={(value) => updateDraft('reviewStatus', value)} /></QueryItem>
      <QueryItem label="资产责任人"><Input value={draftFilters.owner} allowClear onChange={(event) => updateDraft('owner', event.target.value)} /></QueryItem>
      <QueryItem label="公司"><Input value={draftFilters.company} allowClear onChange={(event) => updateDraft('company', event.target.value)} /></QueryItem>
      <QueryItem label="部门"><Input value={draftFilters.department} allowClear onChange={(event) => updateDraft('department', event.target.value)} /></QueryItem>
      <QueryItem label="资产类别"><Input value={draftFilters.category} allowClear onChange={(event) => updateDraft('category', event.target.value)} /></QueryItem>
      <QueryItem label="盘点开始时间"><DateFilter value={draftFilters.startDate} onChange={(value) => updateDraft('startDate', value)} /></QueryItem>
      <QueryItem label="盘点结束时间"><DateFilter value={draftFilters.endDate} onChange={(value) => updateDraft('endDate', value)} /></QueryItem>
      <QueryItem label="盘点状态"><Select value={draftFilters.inventoryStatus || undefined} allowClear options={['未盘', '已盘', '代盘', '报失'].map((value) => ({ label: value, value }))} onChange={(value) => updateDraft('inventoryStatus', value)} /></QueryItem>
      <QueryItem label="City"><Input value={draftFilters.city} allowClear onChange={(event) => updateDraft('city', event.target.value)} /></QueryItem>
      <QueryItem label="Building"><Input value={draftFilters.building} allowClear onChange={(event) => updateDraft('building', event.target.value)} /></QueryItem>
    </QueryBar>

    <Card
      size="small"
      title={<CardTitle>图片审核信息</CardTitle>}
      extra={<Space><Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text><Button icon={<Download size={14} />} onClick={() => messageApi.success('图片审核导出已触发')}>导出</Button></Space>}
    >
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={columns}
        dataSource={filteredRows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, getCheckboxProps: (record) => ({ disabled: record.reviewStatus !== '待审核' }) }}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      />
    </Card>

    <div className="flex justify-center gap-3 pb-2">
      <Button type="primary" onClick={submitReview}>提交审核</Button>
      <Button onClick={onBack}>返回</Button>
    </div>

    <PhotoPreviewModal
      open={previewOpen}
      index={previewIndex}
      onIndexChange={setPreviewIndex}
      onClose={() => setPreviewOpen(false)}
    />
  </Space>;
}
