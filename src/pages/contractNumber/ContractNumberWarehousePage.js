import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { Search } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import {
  getWarehouseContractNumberAllocation,
  updateContractNumberAllocation,
} from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;

const CITY_OPTIONS = [
  { key: '35.北京市', code: '35', name: '北京市' },
  { key: '36.上海市', code: '36', name: '上海市' },
  { key: '37.广州市', code: '37', name: '广州市' },
  { key: '38.深圳市', code: '38', name: '深圳市' },
  { key: '39.杭州市', code: '39', name: '杭州市' },
];

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

function CitySelectModal({ open, value, onCancel, onConfirm }) {
  const [selectedKey, setSelectedKey] = useState(value || '');

  useEffect(() => {
    if (open) setSelectedKey(value || '');
  }, [open, value]);

  const columns = useMemo(() => [
    { title: '城市编码', dataIndex: 'code', width: 140 },
    { title: '城市', dataIndex: 'name' },
  ], []);

  return (
    <Modal
      title="选择城市"
      open={open}
      width={560}
      onCancel={onCancel}
      footer={(
        <div className="flex justify-center gap-3">
          <Button type="primary" disabled={!selectedKey} onClick={() => onConfirm(selectedKey)}>确定</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      )}
      destroyOnHidden
    >
      <Table
        rowKey="key"
        size="small"
        bordered
        pagination={false}
        columns={columns}
        dataSource={CITY_OPTIONS}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedKey ? [selectedKey] : [],
          onChange: (keys) => setSelectedKey(keys[0] || ''),
        }}
        onRow={(record) => ({ onClick: () => setSelectedKey(record.key) })}
      />
    </Modal>
  );
}

export default function ContractNumberWarehousePage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getWarehouseContractNumberAllocation());
  const [warehouse, setWarehouse] = useState('');
  const [city, setCity] = useState('');
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  useEffect(() => {
    if (!application) return;
    setWarehouse(application.warehouseHandling?.warehouse || '');
    setCity(application.warehouseHandling?.city || '');
    setNote(application.warehouseHandling?.note || '');
  }, [application?.id]);

  const refresh = () => setApplication(getWarehouseContractNumberAllocation());

  const saveHandlingFields = (record) => ({
    ...record,
    warehouseHandling: {
      ...record.warehouseHandling,
      warehouse,
      city,
      note,
    },
  });

  const submit = (action) => {
    if (!application) return;
    if (!warehouse) {
      messageApi.warning('仓库为空，请检查单据数据');
      return;
    }

    setLoadingAction(action);
    try {
      updateContractNumberAllocation(application.id, (record) => {
        const savedRecord = saveHandlingFields(record);
        const startConfirmation = action === '领用确认';
        const handledAt = nowText();
        const actionComment = opinion.trim() || (startConfirmation ? '已发起员工领取确认' : '员工弃领');

        return {
          ...savedRecord,
          status: startConfirmation ? '处理中' : '已弃领',
          currentNode: startConfirmation ? '员工领取确认' : '结束',
          assignedNumber: savedRecord.assignedNumber
            ? {
              ...savedRecord.assignedNumber,
              status: startConfirmation ? '待员工确认' : '在库',
            }
            : null,
          warehouseHandling: {
            ...savedRecord.warehouseHandling,
            status: startConfirmation ? '待员工确认' : '已弃领',
            confirmationStatus: startConfirmation ? '待确认' : savedRecord.warehouseHandling?.confirmationStatus,
            opinion: actionComment,
            handledAt,
          },
          history: (savedRecord.history || []).map((item) => (
            item.node === '库管员领用' && item.status === '待处理'
              ? {
                ...item,
                status: startConfirmation ? '已处理' : '已弃领',
                time: handledAt,
                comment: actionComment,
              }
              : item
          )).concat(startConfirmation ? [{
            id: `employee-confirm-${Date.now()}`,
            person: `${savedRecord.applicant.name}(${savedRecord.applicant.id})`,
            node: '员工领取确认',
            time: '',
            status: '待确认',
            comment: '',
          }] : []),
        };
      });
      messageApi.success(action === '领用确认' ? '已发起员工合约号码领取确认' : '已完成弃领处理');
      setOpinion('');
      refresh();
    } finally {
      setLoadingAction('');
    }
  };

  if (!application) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无合约号码库管员待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const applicant = application.applicant;
  const number = application.assignedNumber;
  const handling = application.warehouseHandling || {};

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">合约号码领用办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="仓库" span={3}>{warehouse || '-'}</DetailItem>
            <DetailItem label="使用人">{applicant.id}-{applicant.name}</DetailItem>
            <DetailItem label="联系电话">{applicant.phone || '-'}</DetailItem>
            <DetailItem label="申请日期">{application.applyDate || '-'}</DetailItem>
            <DetailItem label="公司">{applicant.company || '-'}</DetailItem>
            <DetailItem label="板块">{applicant.block || '-'}</DetailItem>
            <DetailItem label="办公区">{applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="成本中心">{applicant.costCenter || '-'}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>申请合约号码信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="标签号">{number?.assetTag || '-'}</DetailItem>
            <DetailItem label="合约号码">{number?.phoneNumber || number?.imei || '-'}</DetailItem>
            <DetailItem label="合约号码说明">{number?.packageName || '-'}</DetailItem>
            <DetailItem label="金额">{handling.tariffStandard ?? '-'}</DetailItem>
            <DetailItem label="城市">
              <Input
                readOnly
                value={city}
                placeholder="请选择城市"
                suffix={<Search size={14} className="text-slate-400" />}
                onClick={() => setCityModalOpen(true)}
              />
            </DetailItem>
            <DetailItem label="申请原因">{application.applyReason || '-'}</DetailItem>
            <DetailItem label="备注" span={3}>
              <TextArea
                rows={2}
                maxLength={400}
                value={note}
                placeholder="请输入备注"
                onChange={(event) => setNote(event.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>审批操作</SectionTitle>}>
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="可填写处理意见"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loadingAction === '领用确认'} onClick={() => submit('领用确认')}>领用确认</Button>
            <Button danger loading={loadingAction === '弃领'} onClick={() => submit('弃领')}>弃领</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <CitySelectModal
        open={cityModalOpen}
        value={city}
        onCancel={() => setCityModalOpen(false)}
        onConfirm={(value) => {
          setCity(value);
          setCityModalOpen(false);
        }}
      />
    </>
  );
}