import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, UserPlus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  ALLOCATABLE_ASSETS,
  APPLICANT_CURRENT_ASSETS,
} from '../../mock/employeeSelfServiceWorkflowMock';
import { getEmployeeSelfServiceApplications } from '../../services/employeeSelfServiceService';
import {
  ensureAllocationOrders,
  refreshApplicationProgress,
  syncPurchaseSummaries,
  updateAllocationOrder,
} from '../../services/employeeSelfServiceWorkflowService';
import ApplicantInfoCard from './ApplicantInfoCard';
import ApprovalHistoryCard from './ApprovalHistoryCard';

const { TextArea } = Input;

function enrichAsset(asset, index) {
  const [assetCategory = '电脑整机', assetSubCategory = '笔记本-技术笔记本'] = asset.assetDesc.split('.');
  const brand = asset.assetDesc.split('.')[1] || '联想';
  return {
    ...asset,
    serialNo: `SN${String(index + 1).padStart(8, '0')}`,
    assetCategory,
    assetSubCategory,
    brand,
    quantity: 1,
    originalValue: [9667.47, 9310.79, 6538.46, 8102.56][index] || 5512.82,
    responsiblePerson: index % 2 === 0 ? 'SOHU01-库房管理员' : '213852-孙志强',
    costCenter: index % 2 === 0 ? 'CC1001-集团总部' : 'CC2001-员工服务中心',
  };
}

function enrichApplicantAsset(asset, index) {
  const parts = asset.assetDesc.split('.');
  return {
    ...asset,
    rowNo: index + 1,
    materialType: index % 2 === 0 ? '资产' : '低值耐用品',
    assetCategory: parts[0] || '电脑整机',
    assetSubCategory: parts[1] || '笔记本-技术笔记本',
    quantity: 1,
    component: index % 2 === 0 ? '-' : '内存/硬盘',
  };
}

export default function EmployeeAssetAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [orders, setOrders] = useState(() => ensureAllocationOrders());
  const [matchingStatus, setMatchingStatus] = useState('');
  const [matchedAsset, setMatchedAsset] = useState(null);
  const [esComment, setEsComment] = useState('');
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [assetListOpen, setAssetListOpen] = useState(false);
  const [applicantAssetsOpen, setApplicantAssetsOpen] = useState(false);
  const [applicantAssetKeyword, setApplicantAssetKeyword] = useState('');
  const [applicantAssetQuery, setApplicantAssetQuery] = useState('');
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState({ assetTag: '', serialNo: '', block: '', assetDesc: '' });
  const [appliedQuery, setAppliedQuery] = useState({ assetTag: '', serialNo: '', block: '', assetDesc: '' });

  const selectedOrder = useMemo(() => (
    orders.find((item) => item.status === '待配给') || orders[0]
  ), [orders]);

  const sourceApplication = useMemo(() => {
    if (!selectedOrder) return null;
    return getEmployeeSelfServiceApplications().find((item) => item.id === selectedOrder.sourceApplicationId) || null;
  }, [selectedOrder]);

  const applicationMaterials = sourceApplication?.materials || (selectedOrder ? [{
    id: selectedOrder.sourceMaterialId,
    assetDesc: selectedOrder.assetDesc,
    referencePrice: selectedOrder.referencePrice,
    config: selectedOrder.config,
    purpose: selectedOrder.purpose,
    detail: selectedOrder.detail,
    overStandard: selectedOrder.overStandard,
    quantity: 1,
    type: 'main',
    relatedAsset: '',
  }] : []);

  const assetRows = useMemo(() => ALLOCATABLE_ASSETS.map(enrichAsset), []);
  const applicantAssetRows = useMemo(() => APPLICANT_CURRENT_ASSETS.map(enrichApplicantAsset), []);
  const filteredApplicantAssets = useMemo(() => {
    const keyword = applicantAssetQuery.trim().toLowerCase();
    if (!keyword) return applicantAssetRows;
    return applicantAssetRows.filter((asset) => (
      `${asset.materialType} ${asset.assetCategory} ${asset.assetSubCategory} ${asset.assetTag} ${asset.assetDesc} ${asset.config} ${asset.assetStatus} ${asset.component}`
        .toLowerCase()
        .includes(keyword)
    ));
  }, [applicantAssetRows, applicantAssetQuery]);

  const filteredAssets = useMemo(() => assetRows.filter((asset) => (
    (!appliedQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.serialNo || asset.serialNo.toLowerCase().includes(appliedQuery.serialNo.toLowerCase()))
    && (!appliedQuery.block || asset.block.toLowerCase().includes(appliedQuery.block.toLowerCase()))
    && (!appliedQuery.assetDesc || asset.assetDesc.toLowerCase().includes(appliedQuery.assetDesc.toLowerCase()))
  )), [assetRows, appliedQuery]);

  const refresh = () => setOrders(ensureAllocationOrders());

  const submitAllocation = () => {
    if (!selectedOrder) return;
    if (!matchingStatus) {
      messageApi.warning('请选择匹配状态');
      return;
    }
    if (matchingStatus === '库存领用' && !matchedAsset) {
      messageApi.warning('库存领用必须匹配资产');
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
      messageApi.success(matchingStatus === '库存领用' ? '配给审批已同意' : '已转入统一采购');
    } finally {
      setSubmitting(false);
    }
  };

  const rejectAllocation = () => {
    if (!selectedOrder) return;
    if (!esComment.trim()) {
      messageApi.warning('驳回时 ES 建议必填');
      return;
    }
    Modal.confirm({
      title: '确认驳回本条申请？',
      content: '驳回后会回写原申请单对应分录状态。',
      okText: '确认驳回',
      cancelText: '取消',
      onOk: () => {
        updateAllocationOrder(selectedOrder.id, {
          matchingStatus: '',
          matchedAsset: null,
          esComment,
          status: '已取消',
        });
        refreshApplicationProgress(selectedOrder.sourceApplicationId);
        refresh();
        messageApi.success('申请已驳回');
      },
    });
  };

  const materialColumns = [
    { title: '物资说明', dataIndex: 'assetDesc', width: 210 },
    { title: '参考单价', dataIndex: 'referencePrice', width: 110, render: (value) => `¥${Number(value || 0).toFixed(2)}` },
    { title: '配置', dataIndex: 'config', width: 210 },
    { title: '申请用途', dataIndex: 'purpose', width: 130 },
    { title: '详细说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    {
      title: '是否超标',
      dataIndex: 'overStandard',
      width: 100,
      align: 'center',
      render: (value) => value ? <Tag color="error">已超标</Tag> : <Tag>未超标</Tag>,
    },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    {
      title: '主资产说明（耗材独有）',
      dataIndex: 'relatedAsset',
      width: 220,
      render: (value, record) => record.type === 'consumable' ? (value || '-') : '-',
    },
  ];

  const assetColumns = [
    { title: '选择', width: 60, fixed: 'left', render: (_, record) => <Radio checked={matchedAsset?.id === record.id} /> },
    { title: '标签号', dataIndex: 'assetTag', width: 150 },
    { title: '公司', dataIndex: 'company', width: 100 },
    { title: '板块', dataIndex: 'block', width: 110 },
    { title: '资产大类', dataIndex: 'assetCategory', width: 120 },
    { title: '资产小类', dataIndex: 'assetSubCategory', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '品牌', dataIndex: 'brand', width: 90 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '原值', dataIndex: 'originalValue', width: 100, render: (value) => Number(value).toFixed(2) },
    { title: '资产责任人', dataIndex: 'responsiblePerson', width: 170 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 120 },
    { title: '成本中心', dataIndex: 'costCenter', width: 160 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 110 },
  ];

  const applicantAssetColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, align: 'center' },
    { title: '物资总类', dataIndex: 'materialType', width: 110 },
    { title: '资产大类', dataIndex: 'assetCategory', width: 130 },
    { title: '资产小类', dataIndex: 'assetSubCategory', width: 160 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '部件', dataIndex: 'component', width: 120 },
  ];

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待配给申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产配给审批</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selectedOrder.sourceApplicationId}</Typography.Text>
        </div>

        <ApplicantInfoCard
          applicant={selectedOrder.applicant}
          applyDate={selectedOrder.applyDate}
          onViewAssets={() => setApplicantAssetsOpen(true)}
        />

        <Card title="申请物资明细" size="small">
          <Table rowKey="id" columns={materialColumns} dataSource={applicationMaterials} pagination={false} scroll={{ x: 1300 }} />
        </Card>

        <ApprovalHistoryCard records={sourceApplication?.approvalHistory || []} />

        <Card title="ES 配给处理" size="small">
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <Typography.Text strong><span className="text-red-500">*</span> 匹配状态：</Typography.Text>
              <Radio.Group
                className="ml-3"
                value={matchingStatus}
                onChange={(event) => {
                  setMatchingStatus(event.target.value);
                  setMatchedAsset(null);
                }}
                options={[
                  { label: '库存领用', value: '库存领用' },
                  { label: '统一采购', value: '统一采购' },
                ]}
              />
              {matchingStatus === '库存领用' && (
                <Button className="ml-4" type="primary" ghost onClick={() => setMatchModalOpen(true)}>匹配资产</Button>
              )}
            </div>

            {matchingStatus === '库存领用' && (
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                匹配资产：{matchedAsset ? `${matchedAsset.assetTag} / ${matchedAsset.assetDesc}` : '暂未匹配'}
              </div>
            )}

            <div>
              <Typography.Text strong>ES 建议：</Typography.Text>
              <TextArea
                className="mt-2"
                rows={4}
                maxLength={400}
                showCount
                value={esComment}
                placeholder="请输入 ES 建议，最多400字"
                onChange={(event) => setEsComment(event.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={submitAllocation}>同意</Button>
              <Button danger icon={<XCircle size={14} />} onClick={rejectAllocation}>驳回</Button>
              <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
              <Button icon={<UserPlus size={14} />} onClick={() => setCountersignOpen(true)}>加签</Button>
            </div>
          </Space>
        </Card>
      </Space>

      <Modal
        title="员工名下资产"
        open={applicantAssetsOpen}
        width={1180}
        footer={null}
        onCancel={() => setApplicantAssetsOpen(false)}
      >
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Typography.Text className="mb-2 block">关键字</Typography.Text>
              <Input
                allowClear
                value={applicantAssetKeyword}
                placeholder="请输入资产标签号、资产说明、配置或状态"
                onChange={(event) => setApplicantAssetKeyword(event.target.value)}
                onPressEnter={() => setApplicantAssetQuery(applicantAssetKeyword)}
              />
            </div>
            <Button type="primary" icon={<Search size={14} />} onClick={() => setApplicantAssetQuery(applicantAssetKeyword)}>查询</Button>
            <Button onClick={() => {
              setApplicantAssetKeyword('');
              setApplicantAssetQuery('');
            }}>重置</Button>
          </div>
        </div>
        <Table
          rowKey="id"
          columns={applicantAssetColumns}
          dataSource={filteredApplicantAssets}
          scroll={{ x: 1400, y: 400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Modal>

      <Modal
        title="库存领用匹配资产"
        open={matchModalOpen}
        width={860}
        footer={null}
        onCancel={() => setMatchModalOpen(false)}
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={applicationMaterials}
          columns={[
            { title: '申请物资说明', dataIndex: 'assetDesc', width: 320 },
            {
              title: '资产标签号',
              render: () => (
                <Space>
                  <Input readOnly value={matchedAsset?.assetTag || ''} placeholder="请选择匹配资产" />
                  <Button icon={<Search size={14} />} onClick={() => setAssetListOpen(true)} />
                </Space>
              ),
            },
            { title: '匹配资产描述', render: () => matchedAsset?.assetDesc || '-' },
          ]}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" disabled={!matchedAsset} onClick={() => setMatchModalOpen(false)}>确定</Button>
          <Button onClick={() => setMatchModalOpen(false)}>返回</Button>
        </div>
      </Modal>

      <Modal
        title="物资列表"
        open={assetListOpen}
        width={1280}
        footer={null}
        onCancel={() => setAssetListOpen(false)}
      >
        <Form layout="vertical">
          <div className="grid grid-cols-4 gap-x-4">
            <Form.Item label="标签号"><Input value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></Form.Item>
            <Form.Item label="序列号"><Input value={query.serialNo} onChange={(event) => setQuery({ ...query, serialNo: event.target.value })} /></Form.Item>
            <Form.Item label="板块"><Input value={query.block} onChange={(event) => setQuery({ ...query, block: event.target.value })} /></Form.Item>
            <Form.Item label="资产说明"><Input value={query.assetDesc} onChange={(event) => setQuery({ ...query, assetDesc: event.target.value })} /></Form.Item>
          </div>
          <div className="mb-4 flex justify-end gap-2">
            <Button type="primary" onClick={() => setAppliedQuery(query)}>查询</Button>
            <Button onClick={() => {
              const empty = { assetTag: '', serialNo: '', block: '', assetDesc: '' };
              setQuery(empty);
              setAppliedQuery(empty);
            }}>重置</Button>
          </div>
        </Form>

        <Table
          rowKey="id"
          columns={assetColumns}
          dataSource={filteredAssets}
          scroll={{ x: 1850, y: 380 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共${total}项` }}
          onRow={(record) => ({
            onClick: () => setMatchedAsset(record),
            className: matchedAsset?.id === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
          })}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" disabled={!matchedAsset} onClick={() => setAssetListOpen(false)}>确定</Button>
          <Button onClick={() => setAssetListOpen(false)}>返回</Button>
        </div>
      </Modal>

      <Modal
        title="加签"
        open={countersignOpen}
        okText="确认加签"
        cancelText="取消"
        onOk={() => {
          if (!countersignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${countersignPerson.trim()}`);
          setCountersignPerson('');
          setCountersignOpen(false);
        }}
        onCancel={() => {
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
      >
        <Input value={countersignPerson} placeholder="请输入加签人员姓名或工号" onChange={(event) => setCountersignPerson(event.target.value)} />
      </Modal>
    </div>
  );
}
