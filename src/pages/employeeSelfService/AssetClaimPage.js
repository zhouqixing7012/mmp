import React, { useMemo, useState } from 'react';
import { ArrowLeft, BellRing, CheckCircle2, RotateCcw, Send, XCircle } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import {
  INVENTORY_STATUS_OPTIONS,
  WAREHOUSE_KEEPERS,
  WAREHOUSE_OPTIONS,
} from '../../mock/employeeSelfServiceClaimMock';
import {
  completeClaimOutbound,
  ensureStockClaimOrders,
  getClaimOrders,
  rejectEmployeeSignature,
  sendClaimNotification,
  updateClaimOrder,
} from '../../services/employeeSelfServiceClaimService';
import ApplicantInfoCard from './ApplicantInfoCard';
import SignaturePad from './SignaturePad';

const { TextArea } = Input;

export default function EmployeeAssetClaimPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [orders, setOrders] = useState(() => ensureStockClaimOrders());
  const [selectedId, setSelectedId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [reviewComment, setReviewComment] = useState('签名及领用信息核验无误');
  const selectedOrder = orders.find((item) => item.id === selectedId);

  const filteredOrders = useMemo(() => orders.filter((item) => {
    const text = queryKeyword.trim().toLowerCase();
    if (!text) return true;
    return item.id.toLowerCase().includes(text)
      || item.sourceApplicationId.toLowerCase().includes(text)
      || item.applicant.name.toLowerCase().includes(text)
      || item.status.toLowerCase().includes(text);
  }), [orders, queryKeyword]);

  const refresh = () => setOrders(ensureStockClaimOrders());

  const updateField = (field, value) => {
    if (!selectedOrder) return;
    updateClaimOrder(selectedOrder.id, { [field]: value });
    refresh();
  };

  const updateLocation = (field, value) => {
    if (!selectedOrder) return;
    updateClaimOrder(selectedOrder.id, (order) => ({
      ...order,
      location: { ...order.location, [field]: value },
    }));
    refresh();
  };

  const sendNotification = () => {
    sendClaimNotification(selectedOrder.id);
    refresh();
    messageApi.success('领用通知已通过狐小e、MyFamily和易点发送');
  };

  const rejectSignature = () => {
    if (!reviewComment.trim()) {
      messageApi.warning('驳回签名时复核意见必填');
      return;
    }
    rejectEmployeeSignature(selectedOrder.id, reviewComment);
    refresh();
    messageApi.success('已退回员工重新签名');
  };

  const completeOutbound = () => {
    if (!reviewComment.trim()) {
      messageApi.warning('请填写库管复核意见');
      return;
    }
    if (selectedOrder.asset?.warehouse !== selectedOrder.currentWarehouse) {
      messageApi.error('资产不在当前库，请先执行移库操作');
      return;
    }
    Modal.confirm({
      title: '确认执行资产出库？',
      content: '出库后将生成出库记录，并更新资产台账责任人、部门、成本中心、地点、用途及资产状态。',
      okText: '确认出库',
      cancelText: '取消',
      onOk: () => {
        completeClaimOutbound(selectedOrder.id, reviewComment);
        refresh();
        setSelectedId('');
        messageApi.success('资产出库完成，台账及原申请进度已更新');
      },
    });
  };

  const listColumns = [
    { title: '领用单号', dataIndex: 'id', width: 220 },
    { title: '申请单号', dataIndex: 'sourceApplicationId', width: 190 },
    { title: '来源', dataIndex: 'sourceType', width: 120 },
    { title: '申请人', dataIndex: ['applicant', 'name'], width: 100 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '资产标签号', dataIndex: ['asset', 'assetTag'], width: 170 },
    { title: '当前仓库', dataIndex: 'currentWarehouse', width: 220 },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <Tag color={value === '已完成' ? 'success' : value === '待库管复核' ? 'processing' : 'warning'}>{value}</Tag> },
    { title: '操作', width: 90, fixed: 'right', render: (_, record) => <Button type="link" onClick={() => setSelectedId(record.id)}>{record.status === '已完成' ? '查看' : '处理'}</Button> },
  ];

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar onQuery={() => setQueryKeyword(keyword)} onReset={() => { setKeyword(''); setQueryKeyword(''); }}>
          <QueryItem label="单号/申请人"><Input value={keyword} placeholder="请输入关键字" onChange={(event) => setKeyword(event.target.value)} /></QueryItem>
        </QueryBar>
        <Card title="员工自助新版-资产领用" extra={<Button icon={<RotateCcw size={14} />} onClick={refresh}>刷新领用单</Button>}>
          <Table rowKey="id" columns={listColumns} dataSource={filteredOrders} scroll={{ x: 1500 }} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    );
  }

  const readonly = selectedOrder.status === '已完成';
  const canReview = selectedOrder.status === '待库管复核';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Button icon={<ArrowLeft size={14} />} onClick={() => setSelectedId('')}>返回列表</Button>
        <Alert showIcon type={readonly ? 'success' : 'info'} message={`领用单号：${selectedOrder.id}；状态：${selectedOrder.status}`} description={`确认方式：${selectedOrder.confirmMode}；来源：${selectedOrder.sourceType}`} />
        <ApplicantInfoCard applicant={selectedOrder.applicant} applyDate={selectedOrder.createdAt?.slice(0, 10)} />
        <Card title="申请及领用资产信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请单号">{selectedOrder.sourceApplicationId}</Descriptions.Item>
            <Descriptions.Item label="配给/来源单号">{selectedOrder.sourceOrderId}</Descriptions.Item>
            <Descriptions.Item label="资产标签号">{selectedOrder.asset?.assetTag}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{selectedOrder.assetDesc}</Descriptions.Item>
            <Descriptions.Item label="配置">{selectedOrder.config}</Descriptions.Item>
            <Descriptions.Item label="ES建议">{selectedOrder.esComment || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="发放信息" size="small">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><div className="mb-1 text-sm">当前仓库</div><Select className="w-full" disabled={readonly || selectedOrder.sourceType === '采购入库领用'} value={selectedOrder.currentWarehouse} options={WAREHOUSE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => updateField('currentWarehouse', value)} /></div>
            <div><div className="mb-1 text-sm">库管员</div><Input readOnly value={(WAREHOUSE_KEEPERS[selectedOrder.currentWarehouse] || []).join(' / ')} /></div>
            <div><div className="mb-1 text-sm">确认方式</div><Radio.Group disabled={readonly || selectedOrder.status === '待库管复核'} value={selectedOrder.confirmMode} options={['狐小e电子签', '刷卡/工号确认'].map((item) => ({ label: item, value: item }))} onChange={(event) => updateField('confirmMode', event.target.value)} /></div>
            <div><div className="mb-1 text-sm">City</div><Input disabled={readonly} value={selectedOrder.location.city} onChange={(event) => updateLocation('city', event.target.value)} /></div>
            <div><div className="mb-1 text-sm">Building</div><Input disabled={readonly} value={selectedOrder.location.building} onChange={(event) => updateLocation('building', event.target.value)} /></div>
            <div><div className="mb-1 text-sm">Floor</div><Input disabled={readonly} value={selectedOrder.location.floor} onChange={(event) => updateLocation('floor', event.target.value)} /></div>
            <div><div className="mb-1 text-sm">资产用途</div><Select className="w-full" disabled={readonly} value={selectedOrder.purpose} options={['员工用机', '部门公用', '专业用途', '其他用途'].map((item) => ({ label: item, value: item }))} onChange={(value) => updateField('purpose', value)} /></div>
            <div><div className="mb-1 text-sm">盘点人</div><Input disabled={readonly} value={selectedOrder.inventoryPerson} onChange={(event) => updateField('inventoryPerson', event.target.value)} /></div>
            <div><div className="mb-1 text-sm">盘点状态</div><Select allowClear className="w-full" disabled={readonly} value={selectedOrder.inventoryStatus || undefined} options={INVENTORY_STATUS_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => updateField('inventoryStatus', value || '')} /></div>
          </div>
          <div className="mb-1 mt-4 text-sm">使用说明</div><TextArea disabled={readonly} rows={2} value={selectedOrder.usageDescription} onChange={(event) => updateField('usageDescription', event.target.value)} />
        </Card>
        {selectedOrder.employeeSignature && <Card title="员工签名" size="small"><SignaturePad value={selectedOrder.employeeSignature} disabled /></Card>}
        {!readonly && selectedOrder.status === '待通知' && <Card size="small"><div className="flex justify-center"><Button type="primary" icon={<BellRing size={14} />} onClick={sendNotification}>发送领用通知</Button></div></Card>}
        {canReview && <Card title="库管复核" size="small"><TextArea rows={3} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} /><div className="mt-4 flex justify-center gap-3"><Button danger icon={<XCircle size={14} />} onClick={rejectSignature}>签名不合规</Button><Button type="primary" icon={<CheckCircle2 size={14} />} onClick={completeOutbound}>确认并出库</Button></div></Card>}
        {!readonly && selectedOrder.status === '待员工确认' && <Alert showIcon message="已通知员工，请在“员工自助新版-领用确认”页面完成签字或工号确认。" action={<Send size={16} />} />}
      </Space>
    </div>
  );
}
