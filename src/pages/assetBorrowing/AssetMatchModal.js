import React, { useMemo, useState } from 'react';
import { Button, Input, Modal, Radio, Table, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { BORROW_ALLOCATABLE_ASSETS } from '../../mock/assetBorrowingMock';

const EMPTY_QUERY = {
  assetTag: '',
  serialNo: '',
  block: '',
  assetDesc: '',
};

function enrichAsset(asset) {
  const parts = asset.assetDesc.split('.');
  return {
    ...asset,
    serialNo: asset.sn,
    brand: asset.brand || parts[1] || '-',
    quantity: asset.quantity || 1,
    originalValue: asset.originalValue || '-',
    responsiblePerson: asset.responsiblePerson || 'SOHU01-库房管理员-SOHU',
    costCenter: asset.costCenter || 'CC1001-集团总部',
    enabledDate: asset.enabledDate || '-',
  };
}

export default function AssetMatchModal({
  open,
  materialId,
  category,
  subCategory,
  warehouse,
  currentAsset,
  onCancel,
  onConfirm,
}) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedKey, setSelectedKey] = useState(currentAsset?.id || null);

  React.useEffect(() => {
    if (!open) return;
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
    setSelectedKey(currentAsset?.id || null);
  }, [open, currentAsset]);

  const baseAssets = useMemo(() => BORROW_ALLOCATABLE_ASSETS
    .filter((asset) => (
      (category && subCategory
        ? asset.category === category && asset.subCategory === subCategory
        : asset.materialId === materialId)
      && asset.warehouse === warehouse
      && ['在库-新增', '在库-待处理', '在库-再利用'].includes(asset.status)
      && !asset.locked
    ))
    .map(enrichAsset), [materialId, category, subCategory, warehouse]);

  const filteredAssets = useMemo(() => baseAssets.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.serialNo || asset.serialNo.toLowerCase().includes(appliedQuery.serialNo.toLowerCase()))
    && (!appliedQuery.block || asset.block.toLowerCase().includes(appliedQuery.block.toLowerCase()))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
  )), [baseAssets, appliedQuery]);

  const selectedAsset = baseAssets.find((asset) => asset.id === selectedKey) || null;
  const columns = [
    {
      title: '选择',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (_, record) => <Radio checked={selectedKey === record.id} />,
    },
    { title: '标签号', dataIndex: 'assetTag', width: 150, fixed: 'left', render: (value) => <Typography.Link>{value}</Typography.Link> },
    { title: 'SN号', dataIndex: 'serialNo', width: 130 },
    { title: '公司', dataIndex: 'company', width: 210 },
    { title: '板块', dataIndex: 'block', width: 100 },
    { title: '资产大类', dataIndex: 'category', width: 120 },
    { title: '资产小类', dataIndex: 'subCategory', width: 140 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '品牌', dataIndex: 'brand', width: 90 },
    { title: '配置', dataIndex: 'config', width: 230 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '原值', dataIndex: 'originalValue', width: 100 },
    { title: '资产责任人', dataIndex: 'responsiblePerson', width: 180 },
    { title: '资产状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '成本中心', dataIndex: 'costCenter', width: 160 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 110 },
  ];

  const reset = () => {
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
  };

  return (
    <Modal
      title="选择资产"
      open={open}
      width="92vw"
      footer={null}
      onCancel={onCancel}
      destroyOnHidden
      styles={{ body: { paddingTop: 8 } }}
    >
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="标签号">
          <Input
            allowClear
            value={query.assetTag}
            placeholder="请输入资产标签号"
            onChange={(event) => setQuery((current) => ({ ...current, assetTag: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="SN号">
          <Input
            allowClear
            value={query.serialNo}
            placeholder="请输入SN号"
            onChange={(event) => setQuery((current) => ({ ...current, serialNo: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="板块">
          <Input
            allowClear
            value={query.block}
            placeholder="请输入板块"
            onChange={(event) => setQuery((current) => ({ ...current, block: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="资产说明">
          <Input
            allowClear
            value={query.assetDesc}
            placeholder="请输入资产说明或配置"
            onChange={(event) => setQuery((current) => ({ ...current, assetDesc: event.target.value }))}
          />
        </QueryItem>
      </QueryBar>

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={filteredAssets}
        scroll={{ x: 1900, y: 380 }}
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `共 ${total} 条` }}
        onRow={(record) => ({
          onClick: () => setSelectedKey(record.id),
          className: selectedKey === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
        })}
      />

      <div className="mt-4 flex justify-center gap-3">
        <Button type="primary" disabled={!selectedAsset} onClick={() => onConfirm(selectedAsset)}>确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </Modal>
  );
}
