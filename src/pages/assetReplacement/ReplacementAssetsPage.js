import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Empty, Input, Select, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import {
  getEmployeeReplacementAssets,
  getReplacementEligibility,
  setReplacementDraftAssetIds,
} from '../../services/assetReplacementService';
import {
  getAssetReturnEligibility,
  setAssetReturnDraftIds,
} from '../../services/assetReturnService';

const EMPTY_QUERY = { assetTag: '', assetDesc: '', status: '', materialType: '' };

export default function ReplacementAssetsPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const assets = useMemo(() => getEmployeeReplacementAssets(), []);

  const filteredAssets = useMemo(() => assets.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.status || asset.status === appliedQuery.status)
    && (!appliedQuery.materialType || asset.materialType === appliedQuery.materialType)
  )), [assets, appliedQuery]);

  const startReplacement = (assetIds) => {
    if (assetIds.length === 0) {
      messageApi.warning('请至少选择一条可更换资产');
      return;
    }
    const invalid = assetIds.map((id) => assets.find((asset) => asset.id === id)).find((asset) => asset && !getReplacementEligibility(asset).allowed);
    if (invalid) {
      messageApi.warning(`资产（${invalid.assetTag}）${getReplacementEligibility(invalid).reason}`);
      return;
    }
    setReplacementDraftAssetIds(assetIds);
    navigate('/yewurules', { state: { workspace: '资产更换申请' } });
  };

  const startReturn = (assetIds) => {
    if (assetIds.length === 0) {
      messageApi.warning('请至少选择一条可退库资产');
      return;
    }
    const invalid = assetIds.map((id) => assets.find((asset) => asset.id === id)).find((asset) => asset && !getAssetReturnEligibility(asset).allowed);
    if (invalid) {
      messageApi.warning(`资产（${invalid.assetTag}）${getAssetReturnEligibility(invalid).reason}`);
      return;
    }
    setAssetReturnDraftIds(assetIds);
    navigate('/yewurules', { state: { workspace: '资产退库' } });
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    {
      title: '资产说明',
      dataIndex: 'assetDesc',
      width: 240,
      render: (value, record) => (
        <div>
          <div>{value}</div>
          <Typography.Text type="secondary">{record.category} / {record.subCategory}</Typography.Text>
        </div>
      ),
    },
    { title: '配置', dataIndex: 'config', width: 260 },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <Tag color={value === '在用-使用中' ? 'success' : 'default'}>{value}</Tag> },
    { title: '资产用途', dataIndex: 'purpose', width: 110 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120 },
    {
      title: '是否允许更换',
      width: 170,
      render: (_, record) => {
        const eligibility = getReplacementEligibility(record);
        return <div><StatusTag value={eligibility.allowed ? '是' : '否'} />{!eligibility.allowed && <div className="mt-1 text-xs text-slate-500">{eligibility.reason}</div>}</div>;
      },
    },
    {
      title: '是否允许退库',
      width: 170,
      render: (_, record) => {
        const eligibility = getAssetReturnEligibility(record);
        return <div><StatusTag value={eligibility.allowed ? '是' : '否'} />{!eligibility.allowed && <div className="mt-1 text-xs text-slate-500">{eligibility.reason}</div>}</div>;
      },
    },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" className="px-0" disabled={!getReplacementEligibility(record).allowed} onClick={() => startReplacement([record.id])}>更换</Button>
          <Button type="link" className="px-0" disabled={!getAssetReturnEligibility(record).allowed} onClick={() => startReturn([record.id])}>退库</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">我的资产</Typography.Title>
          <Typography.Text type="secondary">资产更换 / 资产退库入口</Typography.Text>
        </div>

        <Card size="small">
          <QueryBar onQuery={() => setAppliedQuery(query)} onReset={() => { setQuery(EMPTY_QUERY); setAppliedQuery(EMPTY_QUERY); }}>
            <QueryItem label="资产标签号"><Input allowClear value={query.assetTag} placeholder="请输入资产标签号" onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
            <QueryItem label="资产说明"><Input allowClear value={query.assetDesc} placeholder="请输入资产说明或配置" onChange={(event) => setQuery({ ...query, assetDesc: event.target.value })} /></QueryItem>
            <QueryItem label="资产状态"><Select allowClear value={query.status || undefined} placeholder="全部" options={[...new Set(assets.map((item) => item.status))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, status: value || '' })} /></QueryItem>
            <QueryItem label="物资总类"><Select allowClear value={query.materialType || undefined} placeholder="全部" options={[...new Set(assets.map((item) => item.materialType))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, materialType: value || '' })} /></QueryItem>
          </QueryBar>
        </Card>

        <Card
          size="small"
          title="本人名下资产"
          extra={<Space><Button type="primary" icon={<ArrowRightLeft size={14} />} onClick={() => startReplacement(selectedRowKeys)}>批量更换</Button><Button icon={<ArrowDownToLine size={14} />} onClick={() => startReturn(selectedRowKeys)}>批量退库</Button></Space>}
        >
          <div className="mb-3 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">勾选资产后可按业务条件批量更换或退库；提交时系统会再次校验资产状态及锁定情况。</div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredAssets}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({ disabled: !getReplacementEligibility(record).allowed && !getAssetReturnEligibility(record).allowed }),
            }}
            pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ x: 1650 }}
            locale={{ emptyText: <Empty description="暂无符合条件的资产" /> }}
          />
        </Card>
      </Space>
    </div>
  );
}
