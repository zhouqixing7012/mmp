import React, { useState } from 'react';
import { Button, Input, Modal, Space, Table } from 'antd';
import * as XLSX from 'xlsx';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, OwnerLevelSelect, formatAssetCategory, matchesAssetCategory, matchesQuerySelection } from '../../components/AssetQueryControls';
import StatusTag from '../../components/StatusTag';
import { createProgressAssetWorkbook, PROGRESS_ASSET_FIELDS } from './inventoryProgressModel';

// 进度下钻使用汇总所统计的同一批资产，联系方式只展示资产记录已有值。
export default function InventoryProgressAssetsModal({ title, assets, projectNo, onClose }) {
  const [query, setQuery] = useState({});
  const [applied, setApplied] = useState({});
  const [page, setPage] = useState(1);
  const change = (field, value) => setQuery((current) => ({ ...current, [field]: value }));
  const rows = assets.filter((row) => ['assetTag', 'serialNo', 'description'].every((field) => !applied[field]
    || String(row[field] || '').toLowerCase().includes(applied[field].trim().toLowerCase()))
    && matchesAssetCategory(row, applied.category)
    && ['owner', 'ownerLevel', 'inventoryStatus', 'city'].every((field) => matchesQuerySelection(row[field], applied[field])));
  const columns = PROGRESS_ASSET_FIELDS.map(([label, field]) => ({
    title: label, dataIndex: field, width: ['description', 'ownerDept', 'currentOwnerDept', 'inventoryNote'].includes(field) ? 230 : 150,
    fixed: field === 'assetTag' ? 'left' : undefined,
    render: (value, row) => field === 'assetCategory' ? formatAssetCategory(row)
      : field === 'inventoryStatus' ? <StatusTag value={value} />
      : field === 'needPhoto' ? (value === undefined ? '-' : value ? '是' : '否') : value ?? '-',
  }));
  return <Modal open title={title} width="90vw" footer={<Button onClick={onClose}>关闭</Button>} onCancel={onClose}>
    <Space direction="vertical" size={12} className="w-full">
      <QueryBar onQuery={() => { setApplied(query); setPage(1); }} onReset={() => { setQuery({}); setApplied({}); setPage(1); }}>
        <QueryItem label="资产标签号"><Input allowClear value={query.assetTag} onChange={(event) => change('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="序列号"><Input allowClear value={query.serialNo} onChange={(event) => change('serialNo', event.target.value)} /></QueryItem>
        <QueryItem label="资产说明"><Input allowClear value={query.description} onChange={(event) => change('description', event.target.value)} /></QueryItem>
        <QueryItem label="资产类别"><AssetCategorySelect rows={assets} value={query.category} onChange={(value) => change('category', value)} /></QueryItem>
        <QueryItem label="资产责任人"><AssetPersonSelect rows={assets} value={query.owner} onChange={(value) => change('owner', value)} /></QueryItem>
        <QueryItem label="责任人职级"><OwnerLevelSelect rows={assets} value={query.ownerLevel} onChange={(value) => change('ownerLevel', value)} /></QueryItem>
        <QueryItem label="盘点状态"><AssetValueSelect multiple rows={assets} field="inventoryStatus" value={query.inventoryStatus} onChange={(value) => change('inventoryStatus', value)} /></QueryItem>
        <QueryItem label="City"><AssetValueSelect multiple rows={assets} field="city" value={query.city} onChange={(value) => change('city', value)} /></QueryItem>
      </QueryBar>
      <div><Button onClick={() => XLSX.writeFile(createProgressAssetWorkbook(rows), projectNo + '-' + title + '.xlsx')}>导出</Button></div>
      <Table rowKey="assetTag" bordered size="small" columns={columns} dataSource={rows} scroll={{ x: columns.reduce((sum, column) => sum + column.width, 0), y: 420 }}
        pagination={{ current: page, defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => '共 ' + total + ' 条', onChange: setPage }} />
    </Space>
  </Modal>;
}
