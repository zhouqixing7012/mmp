import React, { useMemo, useState } from 'react';
import { Check, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Empty,
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
    materials: materials.map((item) => ({
      ...item,
      reason: item.purpose,
    })),
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
  const [batchPurpose, setBatchPurpose] = useState('');
  const applyDate = formatDate(new Date());
  const canApply = CURRENT_EMPLOYEE.employeeStatus === '正式员工';

  const selectedCount = useMemo(
    () => materials.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [materials]
  );
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

  const applyBatchPurpose = () => {
    if (!batchPurpose) return;
    setMaterials((current) => current.map((item) => ({ ...item, purpose: batchPurpose })));
    messageApi.success('已批量应用申请用途');
  };

  const submitApplication = () => {
    if (!canApply) {
      messageApi.error('当前员工身份暂不支持发起资产申请');
      return;
    }
    if (materials.length === 0) {
      messageApi.warning('申请明细不能为空');
      return;
    }
    if (materials.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      messageApi.warning('申请数量必须为大于等于1的整数');
      return;
    }
    if (materials.some((item) => !item.purpose)) {
      messageApi.warning('请确保所有资产都已填写申请用途');
      return;
    }
    if (materials.some((item) => !item.detail.trim())) {
      messageApi.warning('请确保所有资产都已填写详细说明');
      return;
    }

    const save = () => {
      setSubmitLoading(true);
      try {
        const application = buildApplication(materials);
        addEmployeeSelfServiceApplication(application);
        setMaterials([]);
        setBatchPurpose('');
        messageApi.success(`申请提交成功，申请单号：${application.id}`);
      } finally {
        setSubmitLoading(false);
      }
    };

    if (overStandardCount > 0) {
      Modal.confirm({
        title: '确认提交超标申请',
        content: `当前有 ${overStandardCount} 条申请资产已超标，申请将依次经过直属领导、5级及以上领导、7级及以上领导审批。是否继续？`,
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
      width: 230,
      render: (value, record) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          <Typography.Text type="secondary">{record.config}</Typography.Text>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (value, record) => (
        <InputNumber
          min={1}
          precision={0}
          value={value}
          onChange={(next) => updateMaterial(record.id, 'quantity', next || 1)}
        />
      ),
    },
    {
      title: '申请用途',
      dataIndex: 'purpose',
      width: 170,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          value={value || undefined}
          placeholder="请选择申请用途"
          options={APPLICATION_PURPOSE_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(next) => updateMaterial(record.id, 'purpose', next)}
        />
      ),
    },
    {
      title: '详细说明',
      dataIndex: 'detail',
      width: 300,
      render: (value, record) => (
        <TextArea
          value={value}
          rows={2}
          maxLength={400}
          showCount
          placeholder="请输入详细说明，最多400字符"
          onChange={(event) => updateMaterial(record.id, 'detail', event.target.value)}
        />
      ),
    },
    {
      title: '是否超标',
      dataIndex: 'overStandard',
      width: 110,
      align: 'center',
      render: (value) => value
        ? <Tag color="error">已超标</Tag>
        : <Tag>未超标</Tag>,
    },
    {
      title: '操作',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 size={14} />}
          onClick={() => setMaterials((current) => current.filter((item) => item.id !== record.id))}
        />
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
          bodyStyle={{ padding: 0 }}
          title={(
            <Space>
              <ShoppingCart size={18} className="text-blue-600" />
              <span>本次申请明细</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {selectedCount} 件
              </span>
            </Space>
          )}
          extra={(
            <Space>
              {materials.length > 1 && (
                <>
                  <Select
                    style={{ width: 180 }}
                    value={batchPurpose || undefined}
                    placeholder="批量设置申请用途"
                    options={APPLICATION_PURPOSE_OPTIONS.map((item) => ({ label: item, value: item }))}
                    onChange={setBatchPurpose}
                  />
                  <Button disabled={!batchPurpose} onClick={applyBatchPurpose}>应用</Button>
                </>
              )}
              <Button type="primary" icon={<Plus size={14} />} disabled={!canApply} onClick={() => setSelectOpen(true)}>
                添加资产
              </Button>
            </Space>
          )}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={materials}
            pagination={false}
            scroll={{ x: 1050 }}
            locale={{ emptyText: <Empty description="请点击右上角“添加资产”选择申请资产" /> }}
          />
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4">
            <span className="text-sm text-slate-600">已选 <b className="text-blue-600">{selectedCount}</b> 件资产</span>
            <Button type="primary" icon={<Check size={14} />} loading={submitLoading} disabled={!canApply} onClick={submitApplication}>
              提交审批
            </Button>
          </div>
        </Card>
      </Space>

      <Modal
        title="申请须知"
        open={noticeOpen}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
      >
        <Typography.Title level={5}>【申请原则】</Typography.Title>
        {APPLICATION_NOTICE.map((item, index) => (
          <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>
        ))}
        <div className="flex justify-center pt-2">
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
