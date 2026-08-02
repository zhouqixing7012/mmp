import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Tag, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { BORROWER_EXISTING_ASSETS, CURRENT_BORROWER } from '../../mock/assetBorrowingMock';

const EMPTY_QUERY = {
  assetTag: '',
  materialType: '',
  status: [],
  assetDesc: '',
  purpose: '',
  locked: '',
};

export default function EmployeeAssetsModal({ open, onCancel, applicant = CURRENT_BORROWER }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);

  const filteredAssets = useMemo(() => BORROWER_EXISTING_ASSETS.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.materialType || asset.materialType === appliedQuery.materialType)
    && (appliedQuery.status.length === 0 || appliedQuery.status.includes(asset.status))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.purpose || asset.purpose === appliedQuery.purpose)
    && (!appliedQuery.locked || asset.locked === appliedQuery.locked)
  )), [appliedQuery]);

  const options = (values) => [...new Set(values)].map((value) => ({ label: value, value }));
  const borrowedCount = BORROWER_EXISTING_ASSETS.filter((asset) => asset.status === '在用-借用中').length;
  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '物资总类', dataIndex: 'materialType', width: 100 },
    { title: '资产大类', dataIndex: 'category', width: 120 },
    { title: '资产小类', dataIndex: 'subCategory', width: 130 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 230 },
    { title: '配置', dataIndex: 'config', width: 210 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <Tag color={value === '在用-借用中' ? 'warning' : 'processing'}>{value}</Tag> },
    { title: '部件', dataIndex: 'component', width: 160 },
  ];

  const reset = () => {
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
  };

  return (
    <Modal title="员工名下资产明细" open={open} width={1120} footer={null} onCancel={onCancel}>
      <Typography.Paragraph strong>
        {applicant.name} 同学，名下共有资产 {BORROWER_EXISTING_ASSETS.length} 条，其中借用资产 {borrowedCount} 条。
      </Typography.Paragraph>
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="资产标签号"><Input value={query.assetTag} onChange={(event) => setQuery((current) => ({ ...current, assetTag: event.target.value }))} /></QueryItem>
        <QueryItem label="物资总类"><Select allowClear value={query.materialType || undefined} placeholder="全部" options={options(BORROWER_EXISTING_ASSETS.map((asset) => asset.materialType))} onChange={(value) => setQuery((current) => ({ ...current, materialType: value || '' }))} /></QueryItem>
        <QueryItem label="资产状态"><Select mode="multiple" allowClear value={query.status} placeholder="全部" options={options(BORROWER_EXISTING_ASSETS.map((asset) => asset.status))} onChange={(value) => setQuery((current) => ({ ...current, status: value }))} /></QueryItem>
        <QueryItem label="资产说明"><Input value={query.assetDesc} onChange={(event) => setQuery((current) => ({ ...current, assetDesc: event.target.value }))} /></QueryItem>
        <QueryItem label="资产用途"><Select allowClear value={query.purpose || undefined} placeholder="全部" options={options(BORROWER_EXISTING_ASSETS.map((asset) => asset.purpose))} onChange={(value) => setQuery((current) => ({ ...current, purpose: value || '' }))} /></QueryItem>
        <QueryItem label="是否锁定"><Select allowClear value={query.locked || undefined} placeholder="全部" options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} onChange={(value) => setQuery((current) => ({ ...current, locked: value || '' }))} /></QueryItem>
      </QueryBar>
      <Table rowKey="id" columns={columns} dataSource={filteredAssets} pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1400 }} size="small" />
    </Modal>
  );
}
