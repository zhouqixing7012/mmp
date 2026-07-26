import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, PackageCheck, XCircle } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Radio,
  Space,
  Table,
  Tag,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import {
  ALLOCATABLE_ASSETS,
  APPLICANT_CURRENT_ASSETS,
} from '../../mock/employeeSelfServiceWorkflowMock';
import {
  ensureAllocationOrders,
  refreshApplicationProgress,
  syncPurchaseSummaries,
  updateAllocationOrder,
} from '../../services/employeeSelfServiceWorkflowService';
import ApplicantInfoCard from './ApplicantInfoCard';

const { TextArea } = Input;

export default function EmployeeAssetAllocationPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [orders, setOrders] = useState(() => ensureAllocationOrders());
  const [selectedId, setSelectedId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [matchingStatus, setMatchingStatus] = useState('库存领用');
  const [matchedAsset, setMatchedAsset] = useState(null);
  const [esComment, setEsComment] = useState('');
  const [assetSelectOpen, setAssetSelectOpen] = useState(false);
  const [currentAssetsOpen, setCurrentAssetsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = orders.find((item) => item.id === selectedId);
  const filteredOrders = useMemo(() => orders.filter((item) => {
    const text = queryKeyword.trim().toLowerCase();
    if (!text) return true;
    return item.id.toLowerCase().includes(text)
      || item.sourceApplicationId.toLowerCase().includes(text)
      || item.applicant.name.toLowerCase().includes(text)
      || item.status.toLowerCase().includes(text);
  }), [orders, queryKeyword]);

  const availableAssets = useMemo(() => {
    if (!selectedOrder) return [];
    return ALLOCATABLE_ASSETS.filter((asset) => (
      asset.materialId === selectedOrder.sourceMaterialId
      && ['在库-待处理', '在库-新增', '在库-再利用'].includes(asset.assetStatus)
      && !asset.assetMark
      && !asset.locked
    ));
  }, [selectedOrder]);

  const refresh = () => setOrders(ensureAllocationOrders());

  const openOrder = (record) => {
    setSelectedId(record.id);
    setMatchingStatus(record.matchingStatus || '库存领用');
    setMatchedAsset(record.matchedAsset || null);
    setEsComment(record.esComment || '');
  };

  const submitAllocation = () => {
    if (!selectedOrder) return;
    if (matchingStatus === '库存领用' && !matchedAsset) {
      messageApi.warning('库存领用必须选择匹配资产');
      return;
    }
    if (!esComment.trim()) {
      messageApi.warning('请填写 ES 审核意见');
      return;
    }

    setSubmitting(true);
    try {
      updateAllocationOrder(selectedOrder.id, {
        matchingStatus,
        matchedAsset: matchingStatus === '库存领用' ? matchedAsset : null,
        esComment,
        status: '已配给',
      });
      refreshApplicationProgress(selectedOrder.sourceApplicationId);
      syncPurchaseSummaries();
      refresh();
      setSelectedId('');
      messageApi.success(matchingStatus === '库存领用'
        ? '配给完成，已进入资产领用流程'
        : '配给完成，已进入待汇总池');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAllocation = () => {
    if (!selectedOrder) return;
    if (!esComment.trim()) {
      messageApi.warning('取消申请时必须填写 ES 审核意见');
      return;
    }
    Modal.confirm({
      title: '确认取消本条申请？',
      content: '取消后会回写原申请单对应分录状态。',
      okText: '确认取消',
      cancelText: '返回',
      onOk: () => {
        updateAllocationOrder(selectedOrder.id, {
          matchingStatus: '取消申请',
          matchedAsset: null,
          esComment,
          status: '已取消',
        });
        refreshApplicationProgress(selectedOrder.sourceApplicationId);
        refresh();
        setSelectedId('');
        messageApi.success('本条申请已取消');
      },
    });
  };

  const listColumns = [
    { title: '配给单号', dataIndex: 'id', width: 230 },
    { title: '申请单号', dataIndex: 'sourceApplicationId', width: 190 },
    { title: '申请人', dataIndex: ['applicant', 'name'], width: 100 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '处理人', dataIndex: 'handler', width: 200 },
    {
      title: '匹配状态',
      dataIndex: 'matchingStatus',
      width: 120,
      render: (value) => value ? <Tag color={value === '库存领用' ? 'success' : value === '统一采购' ? 'processing' : 'default'}>{value}</Tag> : '-',
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => <Tag color={value === '待配给' ? 'warning' : value === '已配给' ? 'success' : 'default'}>{value}</Tag>,
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      render: (_, record) => <Button type="link" onClick={() => openOrder(record)}>{record.status === '待配给' ? '处理' : '查看'}</Button>,
    },
  ];

  const currentAssetColumns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 180 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config' },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '借用状态', dataIndex: 'borrowStatus', width: 100 },
  ];

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar
          onQuery={() => setQueryKeyword(keyword)}
          onReset={() => { setKeyword(''); setQueryKeyword(''); }}
        >
          <QueryItem label="单号/申请人">
            <Input value={keyword} placeholder="请输入关键字" onChange={(event) => setKeyword(event.target.value)} />
          </QueryItem>
        </QueryBar>
        <Card title="员工自助新版-资产配给" extra={<Button icon={<PackageCheck size={14} />} onClick={refresh}>刷新待办</Button>}>
          <Table rowKey="id" columns={listColumns} dataSource={filteredOrders} scroll={{ x: 1250 }} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    );
  }

  const readonly = selectedOrder.status !== '待配给';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Button icon={<ArrowLeft size={14} />} onClick={() => setSelectedId('')}>返回列表</Button>
        <Alert
          showIcon
          type={readonly ? 'info' : 'warning'}
          message={`配给单号：${selectedOrder.id}；任务状态：${selectedOrder.status}`}
          description={`申请人名下共有 ${APPLICANT_CURRENT_ASSETS.length} 条资产，其中借用资产 ${APPLICANT_CURRENT_ASSETS.filter((item) => item.borrowStatus === '未超期').length} 条。`}
          action={<Button size="small" icon={<Eye size={14} />} onClick={() => setCurrentAssetsOpen(true)}>查看名下资产</Button>}
        />
        <ApplicantInfoCard applicant={selectedOrder.applicant} applyDate={selectedOrder.applyDate} />
        <Card title="申请资产信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请单号">{selectedOrder.sourceApplicationId}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{selectedOrder.assetDesc}</Descriptions.Item>
            <Descriptions.Item label="配置">{selectedOrder.config}</Descriptions.Item>
            <Descriptions.Item label="申请用途">{selectedOrder.purpose}</Descriptions.Item>
            <Descriptions.Item label="申请原因">{selectedOrder.reason}</Descriptions.Item>
            <Descriptions.Item label="是否超标"><Tag color={selectedOrder.overStandard ? 'error' : 'default'}>{selectedOrder.overStandard ? '已超标' : '未超标'}</Tag></Descriptions.Item>
            <Descriptions.Item label="详细说明" span={3}>{selectedOrder.detail || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="ES 配给处理" size="small">
          <Space direction="vertical" size={16} className="w-full">
            <Radio.Group
              value={matchingStatus}
              disabled={readonly}
              onChange={(event) => { setMatchingStatus(event.target.value); setMatchedAsset(null); }}
              options={[
                { label: '库存领用', value: '库存领用' },
                { label: '统一采购', value: '统一采购' },
              ]}
            />
            {matchingStatus === '库存领用' && (
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="匹配资产" span={2}>
                  {matchedAsset ? `${matchedAsset.assetTag} / ${matchedAsset.assetDesc}` : '暂未选择'}
                </Descriptions.Item>
                <Descriptions.Item label="仓库">{matchedAsset?.warehouse || '-'}</Descriptions.Item>
                <Descriptions.Item label="资产状态">{matchedAsset?.assetStatus || '-'}</Descriptions.Item>
              </Descriptions>
            )}
            {!readonly && matchingStatus === '库存领用' && (
              <Button onClick={() => setAssetSelectOpen(true)}>选择匹配资产</Button>
            )}
            <TextArea rows={3} disabled={readonly} value={esComment} placeholder="请输入 ES 审核意见" onChange={(event) => setEsComment(event.target.value)} />
            {!readonly && (
              <div className="flex justify-center gap-3">
                <Button danger icon={<XCircle size={14} />} onClick={cancelAllocation}>取消申请</Button>
                <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={submitAllocation}>配给通过</Button>
              </div>
            )}
          </Space>
        </Card>
      </Space>

      <SelectModal
        open={assetSelectOpen}
        title="选择匹配资产"
        rowKey="id"
        dataSource={availableAssets}
        searchFields={[
          { name: 'assetTag', label: '资产标签号', dataIndex: 'assetTag' },
          { name: 'assetDesc', label: '资产说明', dataIndex: 'assetDesc' },
        ]}
        columns={[
          { title: '资产标签号', dataIndex: 'assetTag' },
          { title: '资产说明', dataIndex: 'assetDesc' },
          { title: '仓库', dataIndex: 'warehouse' },
          { title: '资产状态', dataIndex: 'assetStatus' },
        ]}
        onCancel={() => setAssetSelectOpen(false)}
        onConfirm={setMatchedAsset}
      />

      <Modal title="申请人名下资产" width={920} open={currentAssetsOpen} footer={null} onCancel={() => setCurrentAssetsOpen(false)}>
        <Table rowKey="id" columns={currentAssetColumns} dataSource={APPLICANT_CURRENT_ASSETS} pagination={false} scroll={{ x: 900 }} />
      </Modal>
    </div>
  );
}
