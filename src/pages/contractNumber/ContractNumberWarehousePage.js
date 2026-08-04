import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Select,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import {
  getWarehouseContractNumberAllocation,
  updateContractNumberAllocation,
} from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;

const WAREHOUSE_OPTIONS = [
  'I10086-集团合约机库（新媒体）',
  'I10087-集团合约机库（搜狐网）',
  'I10088-集团合约机库（总部）',
];

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

export default function ContractNumberWarehousePage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getWarehouseContractNumberAllocation());
  const [warehouse, setWarehouse] = useState('');
  const [documentRemark, setDocumentRemark] = useState('');
  const [city, setCity] = useState('');
  const [subsidiary, setSubsidiary] = useState('');
  const [note, setNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  useEffect(() => {
    if (!application) return;
    setWarehouse(application.warehouseHandling?.warehouse || '');
    setDocumentRemark(application.warehouseHandling?.documentRemark || '');
    setCity(application.warehouseHandling?.city || '');
    setSubsidiary(application.warehouseHandling?.subsidiary || '');
    setNote(application.warehouseHandling?.note || '');
  }, [application?.id]);

  const refresh = () => setApplication(getWarehouseContractNumberAllocation());

  const saveHandlingFields = (record) => ({
    ...record,
    warehouseHandling: {
      ...record.warehouseHandling,
      warehouse,
      documentRemark,
      city,
      subsidiary,
      note,
    },
  });

  const submit = (action) => {
    if (!application) return;
    if (!warehouse) {
      messageApi.warning('请选择当前仓库');
      return;
    }
    if (action === '驳回' && !opinion.trim()) {
      messageApi.warning('驳回时办理意见必填');
      return;
    }

    setLoadingAction(action);
    try {
      updateContractNumberAllocation(application.id, (record) => {
        const savedRecord = saveHandlingFields(record);
        const approved = action === '确认领用';
        return {
          ...savedRecord,
          status: approved ? '已完成' : '已驳回',
          currentNode: '结束',
          assignedNumber: savedRecord.assignedNumber
            ? { ...savedRecord.assignedNumber, status: approved ? '已领用' : savedRecord.assignedNumber.status }
            : null,
          warehouseHandling: {
            ...savedRecord.warehouseHandling,
            status: approved ? '已完成' : '已驳回',
            opinion: opinion.trim() || '确认领用',
            handledAt: nowText(),
          },
          history: (savedRecord.history || []).map((item) => (
            item.node === '库管员领用' && item.status === '待处理'
              ? {
                ...item,
                status: approved ? '已完成' : '已驳回',
                time: nowText(),
                comment: opinion.trim() || '确认领用',
              }
              : item
          )),
        };
      });
      messageApi.success(action === '确认领用' ? '合约号码领用办理已完成' : '合约号码领用申请已驳回');
      setOpinion('');
      refresh();
    } finally {
      setLoadingAction('');
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无合约号码库管员待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const applicant = application.applicant;
  const number = application.assignedNumber;
  const handling = application.warehouseHandling || {};

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">合约号码领用办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title="申请人信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label={<span><span className="text-red-500">*</span> 当前仓库</span>} span={3}>
              <Select
                value={warehouse || undefined}
                placeholder="请选择当前仓库"
                style={{ width: 420, maxWidth: '100%' }}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={setWarehouse}
              />
            </Descriptions.Item>
            <Descriptions.Item label="使用人">{applicant.id}-{applicant.name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{applicant.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{application.applyDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="公司">{applicant.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="板块">{applicant.block || '-'}</Descriptions.Item>
            <Descriptions.Item label="办公区">{applicant.officeArea || '-'}</Descriptions.Item>
            <Descriptions.Item label="成本中心">{applicant.costCenter || '-'}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{formatDepartment(applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="单据备注" span={3}>
              <TextArea
                rows={2}
                maxLength={400}
                showCount
                value={documentRemark}
                placeholder="请输入单据备注"
                onChange={(event) => setDocumentRemark(event.target.value)}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="申请合约号码信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="标签号">{number?.assetTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="序列号">{number?.imei || '-'}</Descriptions.Item>
            <Descriptions.Item label="说明">{number?.packageName || '-'}</Descriptions.Item>
            <Descriptions.Item label="城市">
              <Input value={city} placeholder="请输入城市" onChange={(event) => setCity(event.target.value)} />
            </Descriptions.Item>
            <Descriptions.Item label="领用原因">{handling.usageReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="数量">{handling.quantity || 1}</Descriptions.Item>
            <Descriptions.Item label="子公司">
              <Input value={subsidiary} maxLength={50} placeholder="请输入子公司" onChange={(event) => setSubsidiary(event.target.value)} />
            </Descriptions.Item>
            <Descriptions.Item label="资费标准">{handling.tariffStandard || '-'}</Descriptions.Item>
            <Descriptions.Item label="号码状态">
              <StatusTag value={number?.status || '-'} type="business" />
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>
              <TextArea
                rows={2}
                maxLength={400}
                showCount
                value={note}
                placeholder="请输入备注"
                onChange={(event) => setNote(event.target.value)}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="办理操作">
          <Typography.Text strong>办理意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="确认领用时可不填写，驳回时必填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loadingAction === '确认领用'} onClick={() => submit('确认领用')}>确认领用</Button>
            <Button danger loading={loadingAction === '驳回'} onClick={() => submit('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
}
