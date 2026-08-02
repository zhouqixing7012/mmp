import React, { useEffect, useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Tag } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { getAvailableReplacementAssets } from '../../services/assetReplacementService';

const EMPTY_QUERY = { assetTag: '', sn: '', assetDesc: '', block: '' };

export default function ReplacementAssetSelectModal({ open, oldAsset, warehouse, currentAsset, onCancel, onConfirm }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedKey, setSelectedKey] = useState(null);
  const assets = useMemo(() => {
    const available = getAvailableReplacementAssets(oldAsset, warehouse);
    if (currentAsset && !available.some((asset) => asset.id === currentAsset.id)) {
      return [currentAsset, ...available];
    }
    return available;
  }, [oldAsset, warehouse, currentAsset, open]);

  useEffect(() => {
    if (!open) return;
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
    setSelectedKey(currentAsset?.id || null);
  }, [open, currentAsset]);

  const filteredAssets = useMemo(() => assets.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.sn || asset.sn.toLowerCase().includes(appliedQuery.sn.toLowerCase()))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.block || asset.block === appliedQuery.block)
  )), [assets, appliedQuery]);

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'sn', width: 140 },
    { title: '公司', dataIndex: 'company', width: 220 },
    { title: '板块', dataIndex: 'block', width: 90 },
    { title: '资产大类', dataIndex: 'category', width: 110 },
    { title: '资产小类', dataIndex: 'subCategory', width: 120 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '品牌', dataIndex: 'brand', width: 90 },
    { title: '配置', dataIndex: 'config', width: 260 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '原值', dataIndex: 'originalValue', width: 100, render: (value) => `¥${Number(value).toLocaleString()}` },
    { title: '资产状态', dataIndex: 'status', width: 120, render: (value) => <Tag color="success">{value}</Tag> },
    { title: '成本中心', dataIndex: 'costCenter', width: 170 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120 },
  ];

  return (
    <Modal
      title="待发放资产选择"
      open={open}
      width={1280}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedKey }}
      onCancel={onCancel}
      onOk={() => {
        const selected = assets.find((asset) => asset.id === selectedKey);
        if (selected) onConfirm(selected);
      }}
      destroyOnHidden
    >
      <QueryBar
        onQuery={() => setAppliedQuery(query)}
        onReset={() => {
          setQuery(EMPTY_QUERY);
          setAppliedQuery(EMPTY_QUERY);
        }}
      >
        <QueryItem label="资产标签号"><Input allowClear value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
        <QueryItem label="SN号"><Input allowClear value={query.sn} onChange={(event) => setQuery({ ...query, sn: event.target.value })} /></QueryItem>
        <QueryItem label="资产说明"><Input allowClear value={query.assetDesc} onChange={(event) => setQuery({ ...query, assetDesc: event.target.value })} /></QueryItem>
        <QueryItem label="板块"><Select allowClear value={query.block || undefined} placeholder="全部" options={[...new Set(assets.map((item) => item.block))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, block: value || '' })} /></QueryItem>
      </QueryBar>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredAssets}
        rowSelection={{ type: 'radio', selectedRowKeys: selectedKey ? [selectedKey] : [], onChange: (keys) => setSelectedKey(keys[0]) }}
        onRow={(record) => ({ onClick: () => setSelectedKey(record.id) })}
        pagination={{ pageSize: 6, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1900, y: 380 }}
        size="small"
      />
    </Modal>
  );
}
