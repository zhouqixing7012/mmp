import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Plus, RotateCcw, ShoppingCart, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
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
import { MY_EXISTING_ASSETS } from '../../mock/assetApplicationMock';
import {
  APPLICATION_NOTICE,
  APPLICATION_PURPOSE_OPTIONS,
  CURRENT_EMPLOYEE,
} from '../../mock/employeeSelfServiceMock';
import { addEmployeeSelfServiceApplication } from '../../services/employeeSelfServiceService';
import AssetStoreModal from './AssetStoreModal';

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
    materials: materials.map((item) => ({ ...item, reason: item.purpose })),
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
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [storeOpen, setStoreOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [materials, setMaterials] = useState([]);

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
    let addedCount = 0;
    setMaterials((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      const additions = records
        .filter((record) => !existingIds.has(record.id))
        .map((record) => ({
          ...record,
          quantity: 1,
          purpose: '',
          detail: '',
          relatedAsset: '',
        }));
      addedCount = additions.length;
      return [...current, ...additions];
    });
    setStoreOpen(false);
    if (addedCount > 0) {
      messageApi.success(`已添加 ${addedCount} 项物资`);
    } else {
      messageApi.info('所选物资已在申请明细中');
    }
  };

  const updateMaterial = (id, field, value) => {
    setMaterials((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const validate = () => {
    if (!canApply) {
      messageApi.error('当前员工身份暂不支持发起资产申请');
      return false;
    }
    if (materials.length === 0) {
      messageApi.warning('申请明细不能为空');
      return false;
    }
    if (materials.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      messageApi.warning('申请数量必须为大于等于1的整数');
      return false;
    }
    if (materials.some((item) => !item.purpose)) {
      messageApi.warning('请确保所有物资都已填写申请用途');
      return false;
    }
    if (materials.some((item) => !item.detail.trim())) {
      messageApi.warning('请确保所有物资都已填写详细说明');
      return false;
    }
    if (materials.some((item) => item.type === 'consumable' && !item.relatedAsset)) {
      messageApi.warning('耗材必须关联主资产');
      return false;
    }
    return true;
  };

  const submitApplication = () => {
    setSubmitLoading(true);
    try {
      const application = buildApplication(materials);
      addEmployeeSelfServiceApplication(application);
      setMaterials([]);
      setIsPreview(false);
      messageApi.success(`申请提交成功，申请单号：${application.id}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const returnToWorkspace = () => {
    navigate('/yewurules', { state: { workspace: '工作台首页' } });
  };

  const relatedAssetOptions = useMemo(() => {
    const existingOptions = MY_EXISTING_ASSETS.map((asset) => ({ label: asset.name, value: asset.id }));
    const newOptions = materials
      .filter((item) => item.type === 'main')
      .map((item) => ({ label: `[本次申请] ${item.assetDesc}`, value: `new-${item.id}` }));
    return [...existingOptions, ...newOptions];
  }, [materials]);

  const columns = [
    {
      title: '物资说明',
      dataIndex: 'assetDesc',
      width: 220,
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
      width: 90,
      render: (value, record) => isPreview
        ? value
        : <InputNumber min={1} precision={0} value={value} onChange={(next) => updateMaterial(record.id, 'quantity', next || 1)} />,
    },
    {
      title: '申请用途',
      dataIndex: 'purpose',
      width: 150,
      render: (value, record) => isPreview
        ? value
        : (
          <Select
            style={{ width: '100%' }}
            value={value || undefined}
            placeholder="请选择"
            options={APPLICATION_PURPOSE_OPTIONS.map((item) => ({ label: item, value: item }))}
            onChange={(next) => updateMaterial(record.id, 'purpose', next)}
          />
        ),
    },
    {
      title: '关联主资产',
      dataIndex: 'relatedAsset',
      width: 220,
      render: (value, record) => {
        if (record.type !== 'consumable') return <Typography.Text type="secondary">无需关联</Typography.Text>;
        if (isPreview) return relatedAssetOptions.find((item) => item.value === value)?.label || '-';
        return (
          <Select
            style={{ width: '100%' }}
            value={value || undefined}
            placeholder="请选择主资产"
            options={relatedAssetOptions}
            onChange={(next) => updateMaterial(record.id, 'relatedAsset', next)}
          />
        );
      },
    },
    {
      title: '详细说明',
      dataIndex: 'detail',
      width: 280,
      render: (value, record) => isPreview
        ? <Typography.Paragraph className="mb-0 whitespace-pre-wrap">{value}</Typography.Paragraph>
        : (
          <TextArea
            value={value}
            rows={2}
            maxLength={400}
            showCount
            placeholder="必填，最多400字符"
            onChange={(event) => updateMaterial(record.id, 'detail', event.target.value)}
          />
        ),
    },
    {
      title: '是否超标',
      dataIndex: 'overStandard',
      width: 100,
      align: 'center',
      render: (value) => value ? <Tag color="error">已超标</Tag> : <Tag>未超标</Tag>,
    },
    ...(!isPreview ? [{
      title: '操作',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => setMaterials((current) => current.filter((item) => item.id !== record.id))} />
      ),
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      {!canApply && <Alert className="mb-4" type="error" showIcon message="当前员工身份暂不支持发起资产申请" />}
      {isPreview && overStandardCount > 0 && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={`当前有 ${overStandardCount} 条申请物资超标`}
          description="超标资产申请将自动提交至部门 7 级及以上领导审批，请确认申请内容无误后再提交。"
        />
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Space>
            <ShoppingCart size={18} className="text-blue-600" />
            <span className="font-medium text-slate-800">{isPreview ? '资产申请预览' : '本次申请明细'}</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{selectedCount} 件</span>
          </Space>
          {!isPreview && (
            <Button type="primary" icon={<Plus size={14} />} disabled={!canApply} onClick={() => setStoreOpen(true)}>
              添加物资
            </Button>
          )}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={materials}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{ emptyText: <Empty description="请点击右上角“添加物资”选择申请物资" /> }}
        />

        <div className="flex justify-center gap-3 border-t border-slate-100 bg-white px-5 py-4">
          {isPreview ? (
            <>
              <Button icon={<ArrowLeft size={14} />} onClick={() => setIsPreview(false)}>上一步</Button>
              <Button type="primary" loading={submitLoading} onClick={submitApplication}>提交</Button>
            </>
          ) : (
            <>
              <Button type="primary" icon={<Eye size={14} />} disabled={!canApply} onClick={() => validate() && setIsPreview(true)}>预览</Button>
              <Button icon={<RotateCcw size={14} />} onClick={returnToWorkspace}>返回</Button>
            </>
          )}
        </div>
      </section>

      <Modal title="申请须知" open={noticeOpen} closable={false} maskClosable={false} keyboard={false} footer={null}>
        <Typography.Title level={5}>【申请原则】</Typography.Title>
        {APPLICATION_NOTICE.map((item, index) => (
          <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>
        ))}
        <div className="flex justify-center pt-2">
          <Button type="primary" onClick={() => setNoticeOpen(false)}>已阅读</Button>
        </div>
      </Modal>

      <AssetStoreModal open={storeOpen} onCancel={() => setStoreOpen(false)} onAdd={addMaterials} />
    </div>
  );
}
