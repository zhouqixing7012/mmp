import { selectInventoryExportRows } from './inventoryPlanExport';
import React, { useState } from 'react';
import { Button, Input, Modal, Space, Table } from 'antd';
import * as XLSX from 'xlsx';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, OwnerLevelSelect } from '../../components/AssetQueryControls';
import { makeAssetColumns } from './inventoryAssetColumns';
import { createProgressAssetWorkbook, progressAssetDepartment, filterProgressAssets } from './inventoryProgressModel';

// 进度下钻使用汇总所统计的同一批资产，联系方式只展示资产记录已有值。
export default function InventoryProgressAssetsModal({ title, assets, exportAssets = assets, projectNo, onClose, includeNo = true }) {
  const [query, setQuery] = useState({});
  const [applied, setApplied] = useState({});
  const [page, setPage] = useState(1);
  const change = (field, value) => setQuery((current) => ({ ...current, [field]: value }));
  const queryAssets = assets.map(asset => ({ ...asset, firstLevelDepartment: progressAssetDepartment(asset) }));
  const rows = filterProgressAssets(assets, applied);
  const columns = makeAssetColumns({ includeNo });
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
        <QueryItem label="执行人"><AssetPersonSelect rows={assets} field="executor" title="选择执行人" value={query.executor} onChange={(value) => change('executor', value)} /></QueryItem>
        <QueryItem label="盘点范围"><AssetValueSelect multiple rows={assets} field="inventoryRange" value={query.inventoryRange} onChange={(value) => change('inventoryRange', value)} /></QueryItem>
        <QueryItem label="子公司"><AssetValueSelect multiple rows={assets} field="organization" value={query.organization} onChange={(value) => change('organization', value)} /></QueryItem>
        <QueryItem label="一级部门"><AssetValueSelect multiple rows={queryAssets} field="firstLevelDepartment" value={query.firstLevelDepartment} onChange={(value) => change('firstLevelDepartment', value)} /></QueryItem>
      </QueryBar>
      <div><Button onClick={() => XLSX.writeFile(createProgressAssetWorkbook(selectInventoryExportRows(rows, exportAssets), includeNo), projectNo + '-' + title + '.xlsx')}>导出</Button></div>
      <Table rowKey="assetTag" bordered size="small" columns={columns} dataSource={rows} scroll={{ x: columns.reduce((sum, column) => sum + column.width, 0), y: 420 }}
        pagination={{ current: page, defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => '共 ' + total + ' 条', onChange: setPage }} />
    </Space>
  </Modal>;
}
