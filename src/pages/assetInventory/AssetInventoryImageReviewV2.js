import React, { useMemo, useState } from 'react';
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
      <div className="relative h-32 w-36 overflow-hidden rounded border border-[#d9d9d9] bg-[#f5f5f5] hover:border-[#1677ff]">
        <img src={photo.src} alt={photo.label} className="h-full w-full object-contain" />
        <div className="absolute bottom-1 right-1 rounded bg-black/60 px-2 py-1 text-xs text-white">查看大图</div>
      </div>
    </Button>
  );
}

function PhotoPreviewModal({ open, index, onIndexChange, onClose }) {
  const [scale, setScale] = useState(1);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [selecting, setSelecting] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const photo = REVIEW_PHOTOS[index] || REVIEW_PHOTOS[0];

  const resetTransform = () => {
    setScale(1);
    setFlipX(1);
    setFlipY(1);
    setSelecting(false);
    setOrigin({ x: 50, y: 50 });
  };

  const switchPhoto = (nextIndex) => {
    const total = REVIEW_PHOTOS.length;
    onIndexChange((nextIndex + total) % total);
    resetTransform();
  };

  const selectLocalArea = (event) => {
    if (!selecting) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setSelecting(false);
  };

  return (
    <Modal
      open={open}
      width={1040}
      footer={null}
      title={`图片预览（${index + 1} / ${REVIEW_PHOTOS.length}）`}
      onCancel={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div className="overflow-hidden rounded-b bg-[#111827]">
        <div className="relative flex h-[62vh] min-h-[480px] items-center justify-center overflow-hidden bg-[#111827]">
          <Button
            shape="circle"
            icon={<ChevronLeft size={20} />}
            className="absolute left-4 z-10"
            onClick={() => switchPhoto(index - 1)}
          />
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={{ cursor: selecting ? 'crosshair' : 'default' }}
            onClick={selectLocalArea}
          >
            <img
              src={photo.src}
              alt={photo.label}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
              style={{
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transform: `scale(${scale}) scaleX(${flipX}) scaleY(${flipY})`,
              }}
            />
            {selecting && (
              <div className="pointer-events-none absolute inset-4 rounded border border-dashed border-white/50">
                <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-xs text-white">点击图片选择需要放大的局部区域</div>
              </div>
            )}
          </div>
          <Button
            shape="circle"
            icon={<ChevronRight size={20} />}
            className="absolute right-4 z-10"
            onClick={() => switchPhoto(index + 1)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-[#1f2937] px-4 py-3">
          <Tooltip title="先选择图片局部区域，再使用局部放大">
            <Button type={selecting ? 'primary' : 'default'} icon={<MousePointer2 size={15} />} onClick={() => setSelecting((value) => !value)}>选择</Button>
          </Tooltip>
          <Button icon={<ZoomIn size={15} />} onClick={() => setScale((value) => Math.min(4, Number((value + 0.25).toFixed(2))))}>局部放大</Button>
          <Button icon={<ZoomOut size={15} />} onClick={() => setScale((value) => Math.max(0.25, Number((value - 0.25).toFixed(2))))}>缩小</Button>
          <Button icon={<Maximize2 size={15} />} onClick={() => { setScale(1); setOrigin({ x: 50, y: 50 }); }}>1:1</Button>
          <Button onClick={() => setFlipX((value) => value * -1)}>镜像</Button>
          <Button onClick={() => setFlipY((value) => value * -1)}>翻转</Button>
          <Button icon={<ChevronLeft size={15} />} onClick={() => switchPhoto(index - 1)}>上一张</Button>
          <Button icon={<ChevronRight size={15} />} onClick={() => switchPhoto(index + 1)}>下一张</Button>
          <Typography.Text style={{ color: 'rgba(255,255,255,.72)', marginLeft: 8 }}>{Math.round(scale * 100)}%</Typography.Text>
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
