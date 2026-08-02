import React, { useMemo, useState } from 'react';
import { Plus, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  BORROW_CUSTODY_TEXT,
  BORROW_NOTICE,
  BORROW_PERIOD_SHORTCUTS,
  BORROW_REASON_OPTIONS,
  CURRENT_BORROWER,
} from '../../mock/assetBorrowingMock';
import { addAssetBorrowingApplication } from '../../services/assetBorrowingService';
import BorrowingApplicantCard from './BorrowingApplicantCard';
import BorrowMaterialModal from './BorrowMaterialModal';
import {
  addDate,
  buildBorrowingId,
  isBorrowPeriodValid,
  maxBorrowEndDate,
  nowText,
  todayText,
} from './utils';

const { TextArea } = Input;

function createDetail(material) {
  const startDate = todayText();
  return {
    ...material,
    rowKey: `${material.id}-${Date.now()}`,
    materialId: material.id,
    quantity: 1,
    startDate,
    endDate: addDate(startDate, { months: 1 }),
    reason: '',
    detail: '',
    matchedAsset: null,
  };
}

export default function BorrowingApplyPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [details, setDetails] = useState([]);
  const [custodyAccepted, setCustodyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canApply = CURRENT_BORROWER.employeeType === '正式员工';
  const totalQuantity = useMemo(() => details.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [details]);
  const maxStartDate = useMemo(() => addDate(todayText(), { days: 30 }), []);

  const updateDetail = (rowKey, field, value) => {
    setDetails((current) => current.map((item) => {
      if (item.rowKey !== rowKey) return item;
      if (field === 'startDate') {
        return {
          ...item,
          startDate: value,
          endDate: value ? addDate(value, { months: 1 }) : '',
        };
      }
      return { ...item, [field]: value };
    }));
  };

  const addMaterials = (materials) => {
    setDetails((current) => {
      const existingIds = new Set(current.map((item) => item.materialId));
      const additions = materials
        .filter((item) => !existingIds.has(item.id))
        .map(createDetail);
      if (additions.length === 0) {
        messageApi.info('所选物资已在借用明细中');
        return current;
      }
      messageApi.success(`已添加 ${additions.length} 项借用物资`);
      return [...current, ...additions];
    });
    setMaterialModalOpen(false);
  };

  const validate = () => {
    if (!canApply) {
      messageApi.error('当前员工类型暂不支持资产借用。');
      return false;
    }
    if (details.length === 0) {
      messageApi.warning('请至少添加一项借用物资');
      return false;
    }
    if (details.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      messageApi.warning('借用数量必须为正整数');
      return false;
    }
    if (details.some((item) => !isBorrowPeriodValid(item.startDate, item.endDate))) {
      messageApi.warning('借用期限最长为 3 个月，请重新选择借用结束日期。');
      return false;
    }
    if (details.some((item) => !item.reason)) {
      messageApi.warning('请填写全部借用原因');
      return false;
    }
    if (details.some((item) => !item.detail.trim())) {
      messageApi.warning('请填写全部需求说明');
      return false;
    }
    if (!custodyAccepted) {
      messageApi.warning('请阅读并同意资产保管职责。');
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const applicationId = buildBorrowingId();
      const expandedDetails = details.flatMap((item) => (
        Array.from({ length: item.quantity }, (_, index) => ({
          ...item,
          id: `${applicationId}-${item.materialId}-${index + 1}`,
          rowKey: undefined,
          quantity: 1,
        }))
      ));
      addAssetBorrowingApplication({
        id: applicationId,
        applyDate: todayText(),
        status: '处理中',
        result: '',
        currentNode: 'ES配给',
        applicant: CURRENT_BORROWER,
        warehouse: CURRENT_BORROWER.defaultWarehouse,
        city: '北京市',
        building: '搜狐媒体大厦',
        floor: '8层',
        purpose: '借用',
        usageNote: '',
        confirmMethod: '狐小e扫码确认',
        custodyAccepted: true,
        details: expandedDetails,
        approvalComment: '',
        confirmation: { status: '未发起', method: '', confirmedBy: '', confirmedAt: '' },
        approvalHistory: [
          { node: '员工提交', person: `${CURRENT_BORROWER.id}-${CURRENT_BORROWER.name}`, status: '已提交', time: nowText(), comment: '-' },
        ],
      });
      setDetails([]);
      setCustodyAccepted(false);
      messageApi.success('资产借用申请提交成功，请在审批通过后按通知前往指定地点办理。');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    if (details.length === 0) {
      navigate('/yewurules', { state: { workspace: '工作台首页' } });
      return;
    }
    Modal.confirm({
      title: '确认取消本次申请？',
      content: '当前未提交内容将不会保存。',
      okText: '确认取消',
      cancelText: '继续编辑',
      onOk: () => navigate('/yewurules', { state: { workspace: '工作台首页' } }),
    });
  };

  const columns = [
    {
      title: '资产说明',
      dataIndex: 'assetDesc',
      width: 220,
      render: (value, record) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          <Typography.Text type="secondary">{record.category} / {record.subCategory}</Typography.Text>
        </div>
      ),
    },
    { title: '配置', dataIndex: 'config', width: 230 },
    {
      title: '借用数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => (
        <InputNumber min={1} precision={0} value={value} onChange={(next) => updateDetail(record.rowKey, 'quantity', next || 1)} />
      ),
    },
    {
      title: '借用开始日期',
      dataIndex: 'startDate',
      width: 170,
      render: (value, record) => (
        <Input type="date" min={todayText()} max={maxStartDate} value={value} onChange={(event) => updateDetail(record.rowKey, 'startDate', event.target.value)} />
      ),
    },
    {
      title: '借用结束日期',
      dataIndex: 'endDate',
      width: 300,
      render: (value, record) => (
        <Space direction="vertical" size={6} className="w-full">
          <Input
            type="date"
            disabled={!record.startDate}
            min={record.startDate}
            max={record.startDate ? maxBorrowEndDate(record.startDate) : undefined}
            value={value}
            onChange={(event) => updateDetail(record.rowKey, 'endDate', event.target.value)}
          />
          <Space wrap size={[4, 4]}>
            {BORROW_PERIOD_SHORTCUTS.map((shortcut) => (
              <Button
                key={shortcut.label}
                type="link"
                size="small"
                className="h-auto px-0"
                onClick={() => updateDetail(record.rowKey, 'endDate', addDate(record.startDate, shortcut))}
              >
                {shortcut.label}
              </Button>
            ))}
          </Space>
        </Space>
      ),
    },
    {
      title: '借用原因',
      dataIndex: 'reason',
      width: 140,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          value={value || undefined}
          placeholder="请选择"
          options={BORROW_REASON_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(next) => updateDetail(record.rowKey, 'reason', next)}
        />
      ),
    },
    {
      title: '需求说明',
      dataIndex: 'detail',
      width: 280,
      render: (value, record) => (
        <TextArea
          value={value}
          rows={2}
          maxLength={400}
          showCount
          placeholder="说明临时办公需求和使用场景"
          onChange={(event) => updateDetail(record.rowKey, 'detail', event.target.value)}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 size={14} />}
          disabled={details.length === 1}
          onClick={() => setDetails((current) => current.filter((item) => item.rowKey !== record.rowKey))}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产借用申请</Typography.Title>
          <Typography.Text type="secondary">仅正式员工可发起</Typography.Text>
        </div>

        {!canApply && <Alert type="error" showIcon message="当前员工类型暂不支持资产借用。" />}
        <BorrowingApplicantCard applicant={CURRENT_BORROWER} applyDate={todayText()} warehouse={CURRENT_BORROWER.defaultWarehouse} />

        <Card
          title={<Space><span>借用资产信息</span><Typography.Text type="secondary">共 {totalQuantity} 件</Typography.Text></Space>}
          size="small"
          extra={<Button type="primary" icon={<Plus size={14} />} disabled={!canApply} onClick={() => setMaterialModalOpen(true)}>添加物资</Button>}
        >
          <Table
            rowKey="rowKey"
            columns={columns}
            dataSource={details}
            pagination={false}
            scroll={{ x: 1600 }}
            locale={{ emptyText: <Empty description="请点击“添加物资”选择允许借用的资产物料" /> }}
          />
        </Card>

        <Card title="资产保管职责" size="small">
          <Typography.Paragraph className="mb-3">{BORROW_CUSTODY_TEXT}</Typography.Paragraph>
          <Checkbox checked={custodyAccepted} onChange={(event) => setCustodyAccepted(event.target.checked)}>
            我已阅读并同意资产保管职责
          </Checkbox>
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" icon={<Send size={14} />} loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={cancel}>取消</Button>
        </div>
      </Space>

      <Modal title="申请须知" open={noticeOpen} closable={false} maskClosable={false} keyboard={false} footer={null}>
        {BORROW_NOTICE.map((item, index) => <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>)}
        <div className="flex justify-center pt-2"><Button type="primary" onClick={() => setNoticeOpen(false)}>已阅读</Button></div>
      </Modal>
      <BorrowMaterialModal open={materialModalOpen} onCancel={() => setMaterialModalOpen(false)} onConfirm={addMaterials} />
    </div>
  );
}
