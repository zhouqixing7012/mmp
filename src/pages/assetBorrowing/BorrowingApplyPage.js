import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
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
import BorrowMaterialModal from './BorrowMaterialModal';
import {
  addDate,
  buildBorrowingId,
  isBorrowPeriodValid,
  nowText,
  todayText,
} from './utils';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
  const totalQuantity = useMemo(
    () => details.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [details]
  );

  const updateDetail = (rowKey, field, value) => {
    setDetails((current) => current.map((item) => (
      item.rowKey === rowKey ? { ...item, [field]: value } : item
    )));
  };

  const updatePeriod = (rowKey, dates) => {
    const startDate = dates?.[0]?.format('YYYY-MM-DD') || '';
    const endDate = dates?.[1]?.format('YYYY-MM-DD') || '';
    setDetails((current) => current.map((item) => (
      item.rowKey === rowKey ? { ...item, startDate, endDate } : item
    )));
  };

  const applyPeriodShortcut = (record, shortcut) => {
    const start = dayjs(record.startDate || todayText());
    const end = shortcut.months
      ? start.add(shortcut.months, 'month')
      : start.add(shortcut.days, 'day');
    updatePeriod(record.rowKey, [start, end]);
  };

  const addMaterials = (materials) => {
    setDetails((current) => {
      const existingIds = new Set(current.map((item) => item.materialId));
      const additions = materials
        .filter((item) => !existingIds.has(item.id))
        .map(createDetail);
      if (additions.length === 0) {
        messageApi.info('所选资产已在借用明细中');
        return current;
      }
      messageApi.success(`已添加 ${additions.length} 项借用资产`);
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
      messageApi.warning('请至少添加一项借用资产');
      return false;
    }
    if (details.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      messageApi.warning('借用数量必须为正整数');
      return false;
    }

    const today = dayjs().startOf('day');
    const maxStartDate = today.add(30, 'day');
    if (details.some((item) => {
      const start = dayjs(item.startDate);
      return !start.isValid() || start.isBefore(today, 'day') || start.isAfter(maxStartDate, 'day');
    })) {
      messageApi.warning('借用开始日期仅可选择当前日期至未来 30 天');
      return false;
    }
    if (details.some((item) => !isBorrowPeriodValid(item.startDate, item.endDate))) {
      messageApi.warning('借用期限最长为 3 个月，请重新选择借用日期。');
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
      messageApi.warning('请阅读并确认资产保管职责。');
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
        purpose: '',
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
      width: 240,
      render: (_, record) => `${record.category || '-'}\.${record.subCategory || '-'}`,
    },
    {
      title: '借用数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => (
        <InputNumber
          min={1}
          precision={0}
          value={value}
          onChange={(next) => updateDetail(record.rowKey, 'quantity', next || 1)}
        />
      ),
    },
    {
      title: '借用日期',
      width: 360,
      render: (_, record) => (
        <RangePicker
          className="w-full"
          allowClear={false}
          format="YYYY-MM-DD"
          value={record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : null}
          onChange={(dates) => updatePeriod(record.rowKey, dates)}
          disabledDate={(current, info) => {
            if (!current) return false;
            const today = dayjs().startOf('day');
            if (!info?.from) {
              return current.isBefore(today, 'day') || current.isAfter(today.add(30, 'day'), 'day');
            }
            const start = info.from.startOf('day');
            return current.isBefore(start, 'day') || current.isAfter(start.add(3, 'month'), 'day');
          }}
          renderExtraFooter={() => (
            <Space wrap size={[4, 4]}>
              {BORROW_PERIOD_SHORTCUTS.map((shortcut) => (
                <Button
                  key={shortcut.label}
                  type="link"
                  size="small"
                  onClick={() => applyPeriodShortcut(record, shortcut)}
                >
                  {shortcut.label}
                </Button>
              ))}
            </Space>
          )}
        />
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
      width: 300,
      render: (value, record) => (
        <TextArea
          value={value}
          rows={2}
          maxLength={150}
          showCount
          placeholder="请填写需要借用资产的配置需求"
          onChange={(event) => updateDetail(record.rowKey, 'detail', event.target.value)}
        />
      ),
    },
    {
      title: '操作',
      width: 70,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 size={14} />}
          onClick={() => setDetails((current) => current.filter((item) => item.rowKey !== record.rowKey))}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Title level={4} className="mb-0">资产借用</Typography.Title>

        {!canApply && <Alert type="error" showIcon message="当前员工类型暂不支持资产借用。" />}

        <Card
          title={(
            <Space>
              <span>借用资产明细</span>
              <Typography.Text type="secondary">共 {totalQuantity} 件</Typography.Text>
            </Space>
          )}
          size="small"
          extra={(
            <Button type="primary" icon={<Plus size={14} />} disabled={!canApply} onClick={() => setMaterialModalOpen(true)}>
              添加资产
            </Button>
          )}
        >
          <Table
            rowKey="rowKey"
            columns={columns}
            dataSource={details}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1200 }}
            locale={{ emptyText: <Empty description="请点击右上角“添加资产”选择借用资产" /> }}
          />
        </Card>

        <Card title="资产保管职责" size="small">
          <Typography.Paragraph type="danger" className="mb-3">{BORROW_CUSTODY_TEXT}</Typography.Paragraph>
          <div className="flex justify-center">
            <Checkbox checked={custodyAccepted} onChange={(event) => setCustodyAccepted(event.target.checked)}>
              我已阅读并确认资产保管职责
            </Checkbox>
          </div>
        </Card>

        <div className="flex justify-center gap-3 py-2">
          <Button type="primary" loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={cancel}>取消</Button>
        </div>
      </Space>

      <Modal title="申请须知" open={noticeOpen} closable={false} maskClosable={false} keyboard={false} footer={null}>
        {BORROW_NOTICE.map((item, index) => <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>)}
        <div className="flex justify-center pt-2"><Button type="primary" onClick={() => setNoticeOpen(false)}>已阅读</Button></div>
      </Modal>

      <BorrowMaterialModal open={materialModalOpen} onCancel={() => setMaterialModalOpen(false)} onConfirm={addMaterials} />
    </>
  );
}
