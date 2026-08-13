import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Descriptions, Empty, Input, Modal, Select, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import {
  createAssetReturnApplications,
  getAssetReturnAssets,
  getAssetReturnDraftIds,
  getAssetReturnEligibility,
} from '../../services/assetReturnService';

const { TextArea } = Input;
const EMPTY_QUERY = { assetTag: '', assetDesc: '', status: '', purpose: '', locked: '否' };

export default function AssetReturnApplyPage() {
  const location = useLocation();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const assets = useMemo(() => getAssetReturnAssets(), [version]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const prefillAssetTags = location.state?.prefillAssetTags || [];
    if (prefillAssetTags.length) {
      const currentAssets = getAssetReturnAssets();
      return prefillAssetTags
        .map((assetTag) => currentAssets.find((asset) => asset.assetTag === assetTag)?.id)
        .filter(Boolean);
    }
    return getAssetReturnDraftIds();
  });
  const [returnType, setReturnType] = useState('资产退库');
  const [reason, setReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [modalSelected, setModalSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedAssets = selectedIds.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean);
  const selectedAssetTotal = selectedAssets.reduce((sum, item) => sum + item.quantity, 0);
  const selectedPurposes = [...new Set(selectedAssets.map((item) => item.purpose).filter(Boolean))];
  const purposeSummary = selectedPurposes.length ? selectedPurposes.join('、') : '-';

  const selectableAssets = useMemo(() => assets.filter((asset) => (
    !selectedIds.includes(asset.id)
    && (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.assetDesc || `${asset.assetDesc} ${asset.config}`.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
    && (!appliedQuery.status || asset.status === appliedQuery.status)
    && (!appliedQuery.purpose || asset.purpose === appliedQuery.purpose)
    && (appliedQuery.locked === '' || (appliedQuery.locked === '是' ? (asset.locked || asset.returnBusinessLocked) : !(asset.locked || asset.returnBusinessLocked)))
  )), [assets, selectedIds, appliedQuery]);

  const submit = async () => {
    if (!selectedIds.length) {
      messageApi.warning('请至少添加一项退库资产');
      return;
    }
    if (!reason.trim()) {
      messageApi.warning('请填写退库原因');
      return;
    }
    setSubmitting(true);
    try {
      const created = createAssetReturnApplications(selectedIds, { returnType, reason: reason.trim() });
      setSelectedIds([]);
      setReason('');
      setVersion((value) => value + 1);
      messageApi.success(`提交成功，已按一项主资产一张单据生成 ${created.length} 张退库单`);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const assetColumns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    {
      title: '资产说明', dataIndex: 'assetDesc', width: 240,
      render: (value, record) => <div><div>{value}</div><Typography.Text type="secondary">{record.category}.{record.subCategory}</Typography.Text></div>,
    },
    { title: '配置', dataIndex: 'config', width: 250, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '资产用途', dataIndex: 'purpose', width: 110, render: (value) => value || '-' },
    { title: '部件数量', width: 90, align: 'center', render: (_, record) => (record.component && record.component !== '-' ? 1 : 0) },
    {
      title: '关联升级耗材', width: 220,
      render: (_, record) => record.relatedConsumables.length
        ? record.relatedConsumables.map((item) => <Tag key={item.assetTag} color="blue">{item.assetTag} {item.assetDesc}</Tag>)
        : '-',
    },
    {
      title: '操作', width: 70, fixed: 'right', align: 'center',
      render: (_, record) => <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => setSelectedIds((ids) => ids.filter((id) => id !== record.id))} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产退库</Typography.Title>
        </div>

        <Card size="small" title="申请信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">213852-孙志强</Descriptions.Item>
            <Descriptions.Item label="退库类型">
              <Select className="w-full" value={returnType} options={['资产退库', '离职退还'].map((value) => ({ label: value, value }))} onChange={setReturnType} />
            </Descriptions.Item>
            <Descriptions.Item label="资产用途">{purposeSummary}</Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 退库原因</>} span={3}>
              <TextArea rows={3} maxLength={400} showCount value={reason} placeholder="请填写退库原因，最多400字" onChange={(event) => setReason(event.target.value)} />
            </Descriptions.Item>
          </Descriptions>
          <div className="mt-3 rounded border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-orange-700">资产用途为部门公用时，需直属5级及以上领导审批；主资产存在升级耗材时将随主资产一并退库。</div>
        </Card>

        <Card
          size="small"
          title="退库资产明细"
          extra={(
            <Space size={16}>
              <Typography.Text>退库资产总数：<strong>{selectedAssetTotal}</strong></Typography.Text>
              <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>添加资产</Button>
            </Space>
          )}
        >
          <Table rowKey="id" columns={assetColumns} dataSource={selectedAssets} pagination={false} size="small" bordered scroll={{ x: 1350 }} locale={{ emptyText: <Empty description="请添加需要退库的资产" /> }} />
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={() => { setSelectedIds([]); setReason(''); }}>返回</Button>
        </div>
      </Space>

      <Modal title="选择退库资产" open={modalOpen} width={1200} okText="确定" cancelText="取消" onCancel={() => setModalOpen(false)} onOk={() => {
        const invalid = modalSelected.map((id) => assets.find((item) => item.id === id)).find((item) => !getAssetReturnEligibility(item).allowed);
        if (invalid) { messageApi.error(`资产（资产标签号：${invalid.assetTag}）${getAssetReturnEligibility(invalid).reason}`); return; }
        setSelectedIds((ids) => [...new Set([...ids, ...modalSelected])]);
        setModalSelected([]);
        setModalOpen(false);
      }}>
        <QueryBar onQuery={() => setAppliedQuery(query)} onReset={() => { setQuery(EMPTY_QUERY); setAppliedQuery(EMPTY_QUERY); }}>
          <QueryItem label="资产标签号"><Input value={query.assetTag} allowClear onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
          <QueryItem label="资产说明"><Input value={query.assetDesc} allowClear onChange={(event) => setQuery({ ...query, assetDesc: event.target.value })} /></QueryItem>
          <QueryItem label="资产状态"><Select value={query.status || undefined} allowClear options={[...new Set(assets.map((item) => item.status))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, status: value || '' })} /></QueryItem>
          <QueryItem label="资产用途"><Select value={query.purpose || undefined} allowClear options={[...new Set(assets.map((item) => item.purpose))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, purpose: value || '' })} /></QueryItem>
          <QueryItem label="是否锁定"><Select value={query.locked || undefined} allowClear options={['是', '否'].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, locked: value || '' })} /></QueryItem>
        </QueryBar>
        <Table rowKey="id" columns={assetColumns.filter((column) => column.title !== '操作')} dataSource={selectableAssets} rowSelection={{ selectedRowKeys: modalSelected, onChange: setModalSelected, getCheckboxProps: (record) => ({ disabled: !getAssetReturnEligibility(record).allowed }) }} pagination={{ pageSize: 5 }} size="small" bordered scroll={{ x: 1200 }} />
      </Modal>
    </div>
  );
}
