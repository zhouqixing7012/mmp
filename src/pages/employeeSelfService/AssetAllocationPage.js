import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
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

const EMPTY_MATCH_QUERY = { assetTag: '', serialNo: '', block: '', assetDesc: '' };
const EMPTY_APPLICANT_QUERY = {
  assetTag: '',
  assetStatus: '',
  assetDesc: '',
  assetPurpose: '',
  locked: '',
};

function enrichAsset(asset, index) {
  const parts = asset.assetDesc.split('.');
  return {
    ...asset,
    serialNo: `SN${String(index + 1).padStart(8, '0')}`,
    assetCategory: parts[0] || '电脑整机',
    assetSubCategory: parts[1] || '笔记本-技术笔记本',
    brand: parts[1] || '联想',
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
    assetCategory: parts[0] || '电脑整机',
    assetSubCategory: parts[1] || '笔记本-技术笔记本',
    quantity: 1,
    component: index % 2 === 0 ? '-' : '内存/硬盘',
    assetPurpose: index % 2 === 0 ? '员工用机' : '日常办公',
    locked: index % 2 === 0 ? '否' : '是',
  };
}

export default function EmployeeAssetAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [orders, setOrders] = useState(() => ensureAllocationOrders());
  const [matchingStatus, setMatchingStatus] = useState('');
  const [matchedAsset, setMatchedAsset] = useState(null);
  const [esComment, setEsComment] = useState('');
  const [approvalOpinion, setApprovalOpinion] = useState('');
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [assetListOpen, setAssetListOpen] = useState(false);
  const [applicantAssetsOpen, setApplicantAssetsOpen] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [matchQuery, setMatchQuery] = useState(EMPTY_MATCH_QUERY);
  const [appliedMatchQuery, setAppliedMatchQuery] = useState(EMPTY_MATCH_QUERY);
  const [applicantQuery, setApplicantQuery] = useState(EMPTY_APPLICANT_QUERY);
  const [appliedApplicantQuery, setAppliedApplicantQuery] = useState(EMPTY_APPLICANT_QUERY);

  const selectedOrder = useMemo(() => (
    orders.find((item) => item.status === '待配给') || orders[0]
  ), [orders]);

  const sourceApplication = useMemo(() => {
    if (!selectedOrder) return null;
    return getEmployeeSelfServiceApplications()
      .find((item) => item.id === selectedOrder.sourceApplicationId) || null;
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
  const borrowedAssetCount = useMemo(
    () => applicantAssetRows.filter((item) => item.borrowStatus && item.borrowStatus !== '非借用').length,
    [applicantAssetRows]
  );

  const filteredAssets = useMemo(() => assetRows.filter((asset) => (
    (!appliedMatchQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedMatchQuery.assetTag.toLowerCase()))
    && (!appliedMatchQuery.serialNo || asset.serialNo.toLowerCase().includes(appliedMatchQuery.serialNo.toLowerCase()))
    && (!appliedMatchQuery.block || asset.block.toLowerCase().includes(appliedMatchQuery.block.toLowerCase()))
    && (!appliedMatchQuery.assetDesc || asset.assetDesc.toLowerCase().includes(appliedMatchQuery.assetDesc.toLowerCase()))
  )), [assetRows, appliedMatchQuery]);

  const filteredApplicantAssets = useMemo(() => applicantAssetRows.filter((asset) => (
    (!appliedApplicantQuery.assetTag || asset.assetTag.toLowerCase().includes(appliedApplicantQuery.assetTag.toLowerCase()))
    && (!appliedApplicantQuery.assetStatus || asset.assetStatus === appliedApplicantQuery.assetStatus)
    && (!appliedApplicantQuery.assetDesc || asset.assetDesc.toLowerCase().includes(appliedApplicantQuery.assetDesc.toLowerCase()))
    && (!appliedApplicantQuery.assetPurpose || asset.assetPurpose === appliedApplicantQuery.assetPurpose)
    && (!appliedApplicantQuery.locked || asset.locked === appliedApplicantQuery.locked)
  )), [applicantAssetRows, appliedApplicantQuery]);

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
        approvalOpinion: approvalOpinion.trim(),
        status: '已配给',
      });
      refreshApplicationProgress(selectedOrder.sourceApplicationId);
      syncPurchaseSummaries();
      refresh();
      setApprovalOpinion('');
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
          approvalOpinion: approvalOpinion.trim(),
          status: '已取消',
        });
        refreshApplicationProgress(selectedOrder.sourceApplicationId);
        refresh();
        setApprovalOpinion('');
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
    { title: '是否超标', dataIndex: 'overStandard', width: 100, align: 'center', render: (value) => <StatusTag value={value ? '已超标' : '未超标'} type="business" /> },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '主资产说明（耗材独有）', dataIndex: 'relatedAsset', width: 220, render: (value, record) => record.type === 'consumable' ? (value || '-') : '-' },
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
    { title: '资产状态', dataIndex: 'assetStatus', width: 120, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '成本中心', dataIndex: 'costCenter', width: 160 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 110 },
  ];

  const applicantAssetColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, align: 'center' },
    { title: '资产大类', dataIndex: 'assetCategory', width: 130 },
    { title: '资产小类', dataIndex: 'assetSubCategory', width: 160 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '部件', dataIndex: 'component', width: 120 },
  ];

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待配给申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
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
          showEmployeeStatus={false}
        />

        <Card title="申请物资明细" size="small">
          <Table rowKey="id" size="small" bordered columns={materialColumns} dataSource={applicationMaterials} pagination={false} scroll={{ x: 1300 }} />
        </Card>

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
              {matchingStatus === '库存领用' && <Button className="ml-4" type="primary" ghost onClick={() => setMatchModalOpen(true)}>匹配资产</Button>}
            </div>

            {matchingStatus === '库存领用' && (
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                匹配资产：{matchedAsset ? `${matchedAsset.assetTag} / ${matchedAsset.assetDesc}` : '暂未匹配'}
              </div>
            )}

            <div>
              <Typography.Text strong>ES 建议：</Typography.Text>
              <TextArea className="mt-2" rows={4} maxLength={400} showCount value={esComment} placeholder="请输入 ES 建议，最多400字" onChange={(event) => setEsComment(event.target.value)} />
            </div>
          </Space>
        </Card>

        <ApprovalHistoryCard records={sourceApplication?.approvalHistory || []} />

        <Card title="审批操作" size="small">
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={approvalOpinion}
            placeholder="请输入审批意见"
            onChange={(event) => setApprovalOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={submitting} onClick={submitAllocation}>同意</Button>
            <Button danger onClick={rejectAllocation}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
            <Button onClick={() => setCountersignOpen(true)}>加签</Button>
          </div>
        </Card>
      </Space>

      <Modal title="员工名下资产明细" open={applicantAssetsOpen} width={1180} footer={null} onCancel={() => setApplicantAssetsOpen(false)}>
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {selectedOrder.applicant.name}同学，名下共有资产 <b>{applicantAssetRows.length}</b> 条，其中借用资产 <b>{borrowedAssetCount}</b> 条。
        </div>
        <QueryBar
          onQuery={() => setAppliedApplicantQuery(applicantQuery)}
          onReset={() => {
            setApplicantQuery(EMPTY_APPLICANT_QUERY);
            setAppliedApplicantQuery(EMPTY_APPLICANT_QUERY);
          }}
        >
          <QueryItem label="资产标签号"><Input allowClear value={applicantQuery.assetTag} onChange={(event) => setApplicantQuery({ ...applicantQuery, assetTag: event.target.value })} /></QueryItem>
          <QueryItem label="资产状态"><Select allowClear value={applicantQuery.assetStatus || undefined} options={[...new Set(applicantAssetRows.map((item) => item.assetStatus))].map((value) => ({ label: value, value }))} onChange={(value) => setApplicantQuery({ ...applicantQuery, assetStatus: value || '' })} /></QueryItem>
          <QueryItem label="资产说明"><Input allowClear value={applicantQuery.assetDesc} onChange={(event) => setApplicantQuery({ ...applicantQuery, assetDesc: event.target.value })} /></QueryItem>
          <QueryItem label="资产用途"><Select allowClear value={applicantQuery.assetPurpose || undefined} options={[{ label: '员工用机', value: '员工用机' }, { label: '日常办公', value: '日常办公' }]} onChange={(value) => setApplicantQuery({ ...applicantQuery, assetPurpose: value || '' })} /></QueryItem>
          <QueryItem label="是否锁定"><Select allowClear value={applicantQuery.locked || undefined} options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} onChange={(value) => setApplicantQuery({ ...applicantQuery, locked: value || '' })} /></QueryItem>
        </QueryBar>
        <Table rowKey="id" size="small" bordered columns={applicantAssetColumns} dataSource={filteredApplicantAssets} scroll={{ x: 1400, y: 400 }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </Modal>

      <Modal title="库存领用匹配资产" open={matchModalOpen} width={860} footer={null} onCancel={() => setMatchModalOpen(false)}>
        <Table
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          dataSource={applicationMaterials}
          columns={[
            { title: '申请物资说明', dataIndex: 'assetDesc', width: 320 },
            { title: '资产标签号', render: () => <Space><Input readOnly value={matchedAsset?.assetTag || ''} placeholder="请选择匹配资产" /><Button icon={<Search size={14} />} onClick={() => setAssetListOpen(true)} /></Space> },
            { title: '匹配资产描述', render: () => matchedAsset?.assetDesc || '-' },
          ]}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" disabled={!matchedAsset} onClick={() => setMatchModalOpen(false)}>确定</Button>
          <Button onClick={() => setMatchModalOpen(false)}>取消</Button>
        </div>
      </Modal>

      <Modal title="选择资产" open={assetListOpen} width={1280} footer={null} onCancel={() => setAssetListOpen(false)}>
        <QueryBar
          onQuery={() => setAppliedMatchQuery(matchQuery)}
          onReset={() => {
            setMatchQuery(EMPTY_MATCH_QUERY);
            setAppliedMatchQuery(EMPTY_MATCH_QUERY);
          }}
        >
          <QueryItem label="标签号"><Input allowClear value={matchQuery.assetTag} onChange={(event) => setMatchQuery({ ...matchQuery, assetTag: event.target.value })} /></QueryItem>
          <QueryItem label="序列号"><Input allowClear value={matchQuery.serialNo} onChange={(event) => setMatchQuery({ ...matchQuery, serialNo: event.target.value })} /></QueryItem>
          <QueryItem label="板块"><Input allowClear value={matchQuery.block} onChange={(event) => setMatchQuery({ ...matchQuery, block: event.target.value })} /></QueryItem>
          <QueryItem label="资产说明"><Input allowClear value={matchQuery.assetDesc} onChange={(event) => setMatchQuery({ ...matchQuery, assetDesc: event.target.value })} /></QueryItem>
        </QueryBar>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={assetColumns}
          dataSource={filteredAssets}
          scroll={{ x: 1850, y: 380 }}
          pagination={{ pageSize: 10, showTotal: (total) => `共${total}项` }}
          onRow={(record) => ({ onClick: () => setMatchedAsset(record), className: matchedAsset?.id === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer' })}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" disabled={!matchedAsset} onClick={() => setAssetListOpen(false)}>确定</Button>
          <Button onClick={() => setAssetListOpen(false)}>取消</Button>
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
