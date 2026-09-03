import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { getAssetReturnAssets } from '../../services/assetReturnService';

const EMPTY_QUERY = {
  assetTag: '',
  status: [],
  assetDesc: '',
  locked: '',
};

export default function AssetReturnEmployeeAssetsModal({ open, applicant, onCancel }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const assets = useMemo(() => (open ? getAssetReturnAssets() : []), [open]);

  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const locked = Boolean(asset.locked || asset.returnBusinessLocked);
    return (
      (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
      && (appliedQuery.status.length === 0 || appliedQuery.status.includes(asset.status))
      && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
      && (!appliedQuery.locked || (appliedQuery.locked === '是') === locked)
    );
  }), [assets, appliedQuery]);

  const options = (values) => [...new Set(values)].map((value) => ({ label: value, value }));
  const borrowedCount = assets.filter((asset) => asset.status === '在用-借用中').length;
  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产大类', dataIndex: 'category', width: 120 },
    { title: '资产小类', dataIndex: 'subCategory', width: 130 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 230 },
    { title: '配置', dataIndex: 'config', width: 210 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    {
      title: '部件数量',
      width: 90,
      align: 'center',
      render: (_, record) => (record.component && record.component !== '-' ? 1 : 0),
    },
  ];

  const reset = () => {
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
  };

  return (
    <Modal title="员工名下资产明细" open={open} width={1120} footer={null} onCancel={onCancel} destroyOnHidden>
      <Typography.Paragraph strong>
        {applicant?.name || '申请人'} 同学，名下共有资产 {assets.length} 条，其中借用资产 {borrowedCount} 条。
      </Typography.Paragraph>
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="资产标签号">
          <Input
            allowClear
            value={query.assetTag}
            onChange={(event) => setQuery((current) => ({ ...current, assetTag: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="资产状态">
          <Select
            mode="multiple"
            allowClear
            value={query.status}
            placeholder="全部"
            options={options(assets.map((asset) => asset.status))}
            onChange={(value) => setQuery((current) => ({ ...current, status: value }))}
          />
        </QueryItem>
        <QueryItem label="资产说明">
          <Input
            allowClear
            value={query.assetDesc}
            onChange={(event) => setQuery((current) => ({ ...current, assetDesc: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="是否锁定">
          <Select
            allowClear
            value={query.locked || undefined}
            placeholder="全部"
            options={['是', '否'].map((value) => ({ label: value, value }))}
            onChange={(value) => setQuery((current) => ({ ...current, locked: value || '' }))}
          />
        </QueryItem>
      </QueryBar>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredAssets}
        pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1300, y: 380 }}
        size="small"
        bordered
      />
    </Modal>
  );
}
