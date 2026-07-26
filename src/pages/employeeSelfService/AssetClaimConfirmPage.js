import React, { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw } from 'lucide-react';
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
  Typography,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { ASSET_CUSTODY_NOTICE, CURRENT_EMPLOYEE } from '../../mock/employeeSelfServiceClaimMock';
import {
  employeeConfirmClaim,
  ensureStockClaimOrders,
  getClaimOrders,
} from '../../services/employeeSelfServiceClaimService';
import SignaturePad from './SignaturePad';

export default function EmployeeAssetClaimConfirmPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [orders, setOrders] = useState(() => ensureStockClaimOrders());
  const [selectedId, setSelectedId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [readNotice, setReadNotice] = useState(false);
  const [signature, setSignature] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const selectedOrder = orders.find((item) => item.id === selectedId);

  const filteredOrders = useMemo(() => orders.filter((item) => {
    const text = queryKeyword.trim().toLowerCase();
    if (!text) return true;
    return item.id.toLowerCase().includes(text)
      || item.sourceApplicationId.toLowerCase().includes(text)
      || item.assetDesc.toLowerCase().includes(text);
  }), [orders, queryKeyword]);

  const refresh = () => setOrders(getClaimOrders());

  const openOrder = (record) => {
    setSelectedId(record.id);
    setReadNotice(false);
    setSignature(record.employeeSignature || '');
    setEmployeeNumber(record.employeeNumber || '');
  };

  const submitConfirm = () => {
    if (!selectedOrder) return;
    if (!readNotice) {
      messageApi.warning('请先阅读并确认保管职责');
      return;
    }
    if (selectedOrder.confirmMode === '狐小e电子签' && !signature) {
      messageApi.warning('请完成电子签名');
      return;
    }
    if (selectedOrder.confirmMode === '刷卡/工号确认' && employeeNumber.trim() !== selectedOrder.applicant.id) {
      messageApi.error('员工工号不匹配');
      return;
    }

    Modal.confirm({
      title: '确认领用资产？',
      content: '提交后将等待库管员复核签字并执行出库。',
      okText: '领用确认',
      cancelText: '取消',
      onOk: () => {
        setSubmitting(true);
        try {
          employeeConfirmClaim(selectedOrder.id, {
            employeeSignature: selectedOrder.confirmMode === '狐小e电子签' ? signature : '',
            employeeNumber: selectedOrder.confirmMode === '刷卡/工号确认' ? employeeNumber.trim() : selectedOrder.applicant.id,
          });
          refresh();
          setSelectedId('');
          messageApi.success('领用确认已提交，等待库管员复核');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const columns = [
    { title: '领用单号', dataIndex: 'id', width: 220 },
    { title: '申请单号', dataIndex: 'sourceApplicationId', width: 190 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '资产标签号', dataIndex: ['asset', 'assetTag'], width: 180 },
    { title: '确认方式', dataIndex: 'confirmMode', width: 150 },
    { title: '状态', dataIndex: 'status', width: 120, render: (value) => <Tag color={value === '已完成' ? 'success' : value === '待库管复核' ? 'processing' : 'warning'}>{value}</Tag> },
    { title: '操作', width: 90, render: (_, record) => <Button type="link" onClick={() => openOrder(record)}>{record.status === '待员工确认' ? '确认' : '查看'}</Button> },
  ];

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar onQuery={() => setQueryKeyword(keyword)} onReset={() => { setKeyword(''); setQueryKeyword(''); }}>
          <QueryItem label="单号/资产"><Input value={keyword} placeholder="请输入关键字" onChange={(event) => setKeyword(event.target.value)} /></QueryItem>
        </QueryBar>
        <Card title="员工自助新版-领用确认" extra={<Button icon={<RefreshCcw size={14} />} onClick={refresh}>刷新待办</Button>}>
          <Table rowKey="id" columns={columns} dataSource={filteredOrders.filter((item) => item.status !== '待通知')} pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} />
        </Card>
      </div>
    );
  }

  const readonly = selectedOrder.status !== '待员工确认';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Button onClick={() => setSelectedId('')}>返回列表</Button>
        <Alert showIcon type={readonly ? 'info' : 'warning'} message={`领用单号：${selectedOrder.id}；状态：${selectedOrder.status}`} description={`申请人：${selectedOrder.applicant.id}-${selectedOrder.applicant.name}`} />
        <Card title="领用资产信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请单号">{selectedOrder.sourceApplicationId}</Descriptions.Item>
            <Descriptions.Item label="资产标签号">{selectedOrder.asset?.assetTag}</Descriptions.Item>
            <Descriptions.Item label="来源">{selectedOrder.sourceType}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{selectedOrder.assetDesc}</Descriptions.Item>
            <Descriptions.Item label="配置">{selectedOrder.config}</Descriptions.Item>
            <Descriptions.Item label="用途">{selectedOrder.purpose}</Descriptions.Item>
            <Descriptions.Item label="领取地点" span={3}>{selectedOrder.currentWarehouse}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="保管职责" size="small">
          {!readNotice && !readonly ? (
            <>
              <Typography.Paragraph>{ASSET_CUSTODY_NOTICE}</Typography.Paragraph>
              <div className="flex justify-center"><Button type="primary" onClick={() => setReadNotice(true)}>已阅读</Button></div>
            </>
          ) : (
            <Alert showIcon type="success" message="已阅读并同意资产保管职责" />
          )}
        </Card>
        <Card title="领用确认" size="small">
          <Radio.Group disabled value={selectedOrder.confirmMode} options={['狐小e电子签', '刷卡/工号确认'].map((item) => ({ label: item, value: item }))} />
          {selectedOrder.confirmMode === '狐小e电子签' ? (
            <div className="mt-4"><SignaturePad value={signature} onChange={setSignature} disabled={readonly} /></div>
          ) : (
            <div className="mt-4 max-w-md"><div className="mb-1 text-sm">刷卡领用/员工工号</div><Input disabled={readonly} value={employeeNumber} placeholder="刷卡或输入员工工号后回车" onChange={(event) => setEmployeeNumber(event.target.value)} onPressEnter={() => { if (employeeNumber.trim() !== selectedOrder.applicant.id) messageApi.error('员工工号不匹配'); }} /></div>
          )}
          {!readonly && <div className="mt-4 flex justify-center"><Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={submitConfirm}>领用确认</Button></div>}
        </Card>
      </Space>
    </div>
  );
}
