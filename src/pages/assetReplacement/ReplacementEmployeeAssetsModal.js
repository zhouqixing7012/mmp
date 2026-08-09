import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Tag } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { getEmployeeReplacementAssets } from '../../services/assetReplacementService';

const EMPTY_QUERY = { assetTag: '', materialType: '', status: '', assetDesc: '', purpose: '', locked: '' };

export default function ReplacementEmployeeAssetsModal({ open, applicant, onCancel }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const assets = useMemo(() => (open ? getEmployeeReplacementAssets() : []), [open]);

  const filteredAssets = useMemo(() => assets.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.materialType || asset.materialType === appliedQuery.materialType)
    && (!appliedQuery.status || asset.status === appliedQuery.status)
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.purpose || asset.purpose === appliedQuery.purpose)
    && (!appliedQuery.locked || (appliedQuery.locked === '是') === Boolean(asset.locked || asset.businessLocked))
  )), [assets, appliedQuery]);

  const columns = [
    { title: '资产大类', dataIndex: 'category', width: 120 },
    { title: '资产小类', dataIndex: 'subCategory', width: 130 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120 },
    { title: '配置', dataIndex: 'config', width: 260 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <Tag color={value === '在用-使用中' ? 'success' : 'default'}>{value}</Tag> },
    { title: '部件数量', width: 90, align: 'center', render: (_, record) => record.component && record.component !== '-' ? 1 : 0 },
  ];

  return (
    <Modal title="员工名下资产明细" open={open} width={1200} footer={null} onCancel={onCancel} destroyOnHidden>
      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        {applicant?.name || '申请人'}同学，名下共有资产 <b>{assets.length}</b> 条，其中借用资产 <b>0</b> 条。
      </div>
      <QueryBar
        onQuery={() => setAppliedQuery(query)}
        onReset={() => {
          setQuery(EMPTY_QUERY);
          setAppliedQuery(EMPTY_QUERY);
        }}
      >
        <QueryItem label="资产标签号"><Input allowClear value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
        <QueryItem label="物资总类"><Select allowClear value={query.materialType || undefined} options={[...new Set(assets.map((item) => item.materialType))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, materialType: value || '' })} /></QueryItem>
        <QueryItem label="资产状态"><Select allowClear value={query.status || undefined} options={[...new Set(assets.map((item) => item.status))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, status: value || '' })} /></QueryItem>
        <QueryItem label="资产说明"><Input allowClear value={query.assetDesc} onChange={(event) => setQuery({ ...query, assetDesc: event.target.value })} /></QueryItem>
        <QueryItem label="资产用途"><Select allowClear value={query.purpose || undefined} options={[...new Set(assets.map((item) => item.purpose))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, purpose: value || '' })} /></QueryItem>
        <QueryItem label="是否锁定"><Select allowClear value={query.locked || undefined} options={['是', '否'].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, locked: value || '' })} /></QueryItem>
      </QueryBar>
      <Table rowKey="id" columns={columns} dataSource={filteredAssets} scroll={{ x: 1450, y: 380 }} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} />
    </Modal>
  );
}
