import React, { useMemo, useState } from 'react';
import { Plus, Send, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import SelectModal from '../../components/SelectModal';
import {
  APPLICATION_NOTICE,
  APPLICATION_PURPOSE_OPTIONS,
  APPLICATION_REASON_OPTIONS,
  ASSET_MATERIAL_OPTIONS,
  CURRENT_EMPLOYEE,
} from '../../mock/employeeSelfServiceMock';
import { addEmployeeSelfServiceApplication } from '../../services/employeeSelfServiceService';
import ApplicantInfoCard from './ApplicantInfoCard';

const { TextArea } = Input;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildApplication(materials) {
  const now = new Date();
  const applyDate = formatDate(now);
  const overStandard = materials.some((item) => item.overStandard);
  const requiresVp = materials.some((item) => item.requiresVp);
  const id = `CA-${applyDate.replaceAll('-', '')}${String(now.getTime()).slice(-5)}`;

  return {
    id,
    applyDate,
    status: '处理中',
    taskStatus: '业务审批',
    currentNode: '直属领导',
    applicant: CURRENT_EMPLOYEE,
    materials,
    approvalRoute: overStandard
      ? ['直属领导', '5级及以上领导', '7级及以上领导', ...(requiresVp ? ['逐级审批至VP/CFO'] : [])]
      : ['直属领导', '5级及以上领导'],
    approvalHistory: [
      {
        node: '开始',
        person: `${CURRENT_EMPLOYEE.id}-${CURRENT_EMPLOYEE.name}`,
        status: '已提交',
        time: now.toLocaleString('zh-CN', { hour12: false }),
        comment: '-',
      },
      {
        node: '直属领导',
        person: CURRENT_EMPLOYEE.directLeader,
        status: '待审批',
        time: '-',
        comment: '-',
      },
    ],
  };
}

export default function EmployeeAssetApplyPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const applyDate = formatDate(new Date());
  const canApply = CURRENT_EMPLOYEE.employeeStatus === '正式员工';
  const overStandardCount = useMemo(
    () => materials.filter((item) => item.overStandard).length,
    [materials]
  );

  const addMaterials = (records) => {
    setMaterials((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      const additions = records
        .filter((record) => !existingIds.has(record.id))
        .map((record) => ({
          ...record,
          quantity: 1,
          reason: '',
          purpose: '',
          detail: '',
        }));
      return [...current, ...additions];
    });
  };

  const updateMaterial = (id, field, value) => {
    setMaterials((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const removeMaterial = (id) => {
    setMaterials((current) => current.filter((item) => item.id !== id));
  };

  const submitApplication = () => {
    if (!canApply) {
      messageApi.error('当前员工身份暂不支持发起资产申请');
      return;
    }
    if (materials.length === 0) {
      messageApi.warning('请至少添加一项申请资产');
      return;
    }
    if (materials.some((item) => !item.reason || !item.purpose || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      messageApi.warning('请完整填写数量、申请原因和申请用途');
      return;
    }

    const save = () => {
      setSubmitLoading(true);
      try {
        const application = buildApplication(materials);
        addEmployeeSelfServiceApplication(application);
        setMaterials([]);
        messageApi.success(`申请提交成功，申请单号：${application.id}`);
      } finally {
        setSubmitLoading(false);
      }
    };

    if (overStandardCount > 0) {
      Modal.confirm({
        title: '确认提交超标申请',
        content: `当前有 ${overStandardCount} 条申请资产超标，申请将依次经过直属领导、5级及以上领导、7级及以上领导审批。是否继续？`,
        okText: '确定提交',
        cancelText: '取消',
        onOk: save,
      });
      return;
    }
    save();
  };

  const columns = [
    {
      title: '资产说明',
      dataIndex: 'assetDesc',
      width: 220,
      render: (value, record) => (
        <div>
          <div>{value}</div>
          <Typography.Text type="secondary">{record.config}</Typography.Text>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (value, record) => (
        <InputNumber min={1} precision={0} value={value} onChange={(next) => updateMaterial(record.id, 'quantity', next)} />
      ),
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      width: 160,
      render: (value, record) => (
        <Select
          value={value || undefined}
          placeholder="请选择"
          options={APPLICATION_REASON_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(next) => updateMaterial(record.id, 'reason', next)}
        />
      ),
    },
    {
      title: '申请用途',
      dataIndex: 'purpose',
      width: 150,
      render: (value, record) => (
        <Select
          value={value || undefined}
          placeholder="请选择"
          options={APPLICATION_PURPOSE_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(next) => updateMaterial(record.id, 'purpose', next)}
        />
      ),
    },
    {
      title: '详细说明',
      dataIndex: 'detail',
      render: (value, record) => (
        <Input value={value} placeholder="选填" onChange={(event) => updateMaterial(record.id, 'detail', event.target.value)} />
      ),
    },
    {
      title: '是否个人超标',
      dataIndex: 'overStandard',
      width: 120,
      align: 'center',
      render: (value) => value ? <Tag color="error">已超标</Tag> : <Tag>未超标</Tag>,
    },
    {
      title: '操作',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => removeMaterial(record.id)} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        {!canApply && <Alert type="error" showIcon message="当前员工身份暂不支持发起资产申请" />}
        <ApplicantInfoCard applicant={CURRENT_EMPLOYEE} applyDate={applyDate} />
        <Card
          title="申请资产信息"
          size="small"
          extra={(
            <Button type="primary" icon={<Plus size={14} />} disabled={!canApply} onClick={() => setSelectOpen(true)}>
              添加资产
            </Button>
          )}
        >
          <Table rowKey="id" columns={columns} dataSource={materials} pagination={false} scroll={{ x: 1100 }} />
        </Card>
        <Card size="small">
          <div className="flex justify-center">
            <Button type="primary" icon={<Send size={14} />} loading={submitLoading} disabled={!canApply} onClick={submitApplication}>
              提交申请
            </Button>
          </div>
        </Card>
      </Space>

      <Modal title="申请须知" open={noticeOpen} footer={null} onCancel={() => setNoticeOpen(false)}>
        <Typography.Title level={5}>【申请原则】</Typography.Title>
        {APPLICATION_NOTICE.map((item, index) => <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>)}
        <div className="flex justify-center">
          <Button type="primary" onClick={() => setNoticeOpen(false)}>已阅读</Button>
        </div>
      </Modal>

      <SelectModal
        open={selectOpen}
        multiple
        title="选择申请资产"
        rowKey="id"
        dataSource={ASSET_MATERIAL_OPTIONS}
        searchFields={[
          { name: 'assetDesc', label: '资产说明', dataIndex: 'assetDesc' },
          { name: 'config', label: '配置', dataIndex: 'config' },
        ]}
        columns={[
          { title: '分类路径', dataIndex: 'category' },
          { title: '资产说明', dataIndex: 'assetDesc' },
          { title: '配置', dataIndex: 'config' },
        ]}
        onCancel={() => setSelectOpen(false)}
        onConfirm={addMaterials}
      />
    </div>
  );
}
