import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Tag } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { BORROW_ALLOCATABLE_ASSETS } from '../../mock/assetBorrowingMock';

function buildDefaultQuery(warehouse) {
  return {
    assetTag: '',
    sn: '',
    assetDesc: '',
    company: '',
    block: '',
    warehouse: warehouse || '',
    status: [],
  };
}

export default function AssetMatchModal({ open, materialId, warehouse, currentAsset, onCancel, onConfirm }) {
  const [query, setQuery] = useState(() => buildDefaultQuery(warehouse));
  const [appliedQuery, setAppliedQuery] = useState(() => buildDefaultQuery(warehouse));
  const [selectedKey, setSelectedKey] = useState(currentAsset?.id || null);

  React.useEffect(() => {
    if (!open) return;
    const nextQuery = buildDefaultQuery(warehouse);
    setQuery(nextQuery);
    setAppliedQuery(nextQuery);
    setSelectedKey(currentAsset?.id || null);
  }, [open, warehouse, currentAsset]);

  const baseAssets = useMemo(() => BORROW_ALLOCATABLE_ASSETS.filter((asset) => (
    asset.materialId === materialId
    && ['在库-新增', '在库-待处理', '在库-再利用'].includes(asset.status)
    && !asset.locked
  )), [materialId]);

  const filteredAssets = useMemo(() => baseAssets.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.sn || asset.sn.toLowerCase().includes(appliedQuery.sn.toLowerCase()))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.company || asset.company === appliedQuery.company)
    && (!appliedQuery.block || asset.block === appliedQuery.block)
    && (!appliedQuery.warehouse || asset.warehouse === appliedQuery.warehouse)
    && (appliedQuery.status.length === 0 || appliedQuery.status.includes(asset.status))
  )), [baseAssets, appliedQuery]);

  const options = (values) => [...new Set(values)].map((value) => ({ label: value, value }));
  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: 'SN号', dataIndex: 'sn', width: 140 },
    { title: '公司', dataIndex: 'company', width: 220 },
    { title: '板块', dataIndex: 'block', width: 90 },
    { title: '仓库', dataIndex: 'warehouse', width: 140 },
    { title: '资产大类', dataIndex: 'category', width: 110 },
    { title: '资产小类', dataIndex: 'subCategory', width: 130 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 230 },
    { title: '配置', dataIndex: 'config', width: 240 },
    { title: '资产状态', dataIndex: 'status', width: 120, render: (value) => <Tag color="success">{value}</Tag> },
    { title: '盘点状态', dataIndex: 'inventoryStatus', width: 100, render: (value) => value ? <Tag color={value === '已盘' ? 'success' : 'error'}>{value}</Tag> : '-' },
  ];

  const reset = () => {
    const nextQuery = buildDefaultQuery(warehouse);
    setQuery(nextQuery);
    setAppliedQuery(nextQuery);
  };

  return (
    <Modal
      title="配给资产选择"
      open={open}
      width={1180}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedKey }}
      onCancel={onCancel}
      onOk={() => onConfirm(baseAssets.find((asset) => asset.id === selectedKey))}
    >
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="资产标签号"><Input value={query.assetTag} onChange={(event) => setQuery((current) => ({ ...current, assetTag: event.target.value }))} /></QueryItem>
        <QueryItem label="SN号"><Input value={query.sn} onChange={(event) => setQuery((current) => ({ ...current, sn: event.target.value }))} /></QueryItem>
        <QueryItem label="资产说明"><Input value={query.assetDesc} onChange={(event) => setQuery((current) => ({ ...current, assetDesc: event.target.value }))} /></QueryItem>
        <QueryItem label="公司"><Select allowClear value={query.company || undefined} placeholder="全部" options={options(baseAssets.map((asset) => asset.company))} onChange={(value) => setQuery((current) => ({ ...current, company: value || '' }))} /></QueryItem>
        <QueryItem label="板块"><Select allowClear value={query.block || undefined} placeholder="全部" options={options(baseAssets.map((asset) => asset.block))} onChange={(value) => setQuery((current) => ({ ...current, block: value || '' }))} /></QueryItem>
        <QueryItem label="仓库"><Select allowClear value={query.warehouse || undefined} placeholder="全部" options={options(baseAssets.map((asset) => asset.warehouse))} onChange={(value) => setQuery((current) => ({ ...current, warehouse: value || '' }))} /></QueryItem>
        <QueryItem label="资产状态"><Select mode="multiple" allowClear value={query.status} placeholder="全部" options={options(baseAssets.map((asset) => asset.status))} onChange={(value) => setQuery((current) => ({ ...current, status: value }))} /></QueryItem>
      </QueryBar>

      <Table
        rowKey="id"
        rowSelection={{ type: 'radio', selectedRowKeys: selectedKey ? [selectedKey] : [], onChange: (keys) => setSelectedKey(keys[0]) }}
        columns={columns}
        dataSource={filteredAssets}
        pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1500 }}
        size="small"
        onRow={(record) => ({ onClick: () => setSelectedKey(record.id) })}
      />
    </Modal>
  );
}
