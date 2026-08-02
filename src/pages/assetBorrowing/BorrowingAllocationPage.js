import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import AssetMatchModal from './AssetMatchModal';
import BorrowingApplicantCard from './BorrowingApplicantCard';
import BorrowingApprovalHistory from './BorrowingApprovalHistory';
import EmployeeAssetsModal from './EmployeeAssetsModal';
import { nowText } from './utils';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];

export default function BorrowingAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingApplicationByNode('ES配给'));
  const [details, setDetails] = useState(() => application?.details || []);
  const [warehouse, setWarehouse] = useState(() => application?.warehouse || '北京总部仓');
  const [comment, setComment] = useState('');
  const [matchDetailId, setMatchDetailId] = useState(null);
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentDetail = useMemo(() => details.find((item) => item.id === matchDetailId) || null, [details, matchDetailId]);

  const refresh = () => {
    const next = getBorrowingApplicationByNode('ES配给');
    setApplication(next);
    setDetails(next?.details || []);
    setWarehouse(next?.warehouse || '北京总部仓');
    setComment('');
  };

  const submit = () => {
    if (!application) return;
    const invalidMatch = details.find((item) => (
      item.matchedAsset && (
        item.matchedAsset.materialId !== item.materialId
        || item.matchedAsset.warehouse !== warehouse
        || !['在库-新增', '在库-待处理', '在库-再利用'].includes(item.matchedAsset.status)
        || item.matchedAsset.locked
      )
    ));
    if (invalidMatch) {
      messageApi.error(`资产（资产标签号：${invalidMatch.matchedAsset.assetTag}）不满足配给条件，请重新选择。`);
      return;
    }

    setSubmitting(true);
    try {
      updateAssetBorrowingApplication(application.id, (record) => ({
        ...record,
        warehouse,
        details,
        approvalComment: comment,
        currentNode: '直属领导审批',
        approvalHistory: [
          ...record.approvalHistory,
          { node: 'ES配给', person: '119039-刘建', status: '已同意', time: nowText(), comment: comment || '同意' },
          { node: '直属领导审批', person: record.applicant.leader, status: '待审批', time: '-', comment: '-' },
        ],
      }));
      messageApi.success('ES 配给已完成，单据进入直属领导审批。');
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const reject = () => {
    if (!application) return;
    if (!comment.trim()) {
      messageApi.warning('驳回原因必填');
      return;
    }
    Modal.confirm({
      title: '确认整单驳回？',
      content: '驳回后流程结束，已匹配资产将解除锁定。',
      okText: '确认驳回',
      cancelText: '取消',
      onOk: () => {
        updateAssetBorrowingApplication(application.id, (record) => ({
          ...record,
          status: '已驳回',
          currentNode: '已结束',
          details: record.details.map((item) => ({ ...item, matchedAsset: null })),
          approvalHistory: [
            ...record.approvalHistory,
            { node: 'ES配给', person: '119039-刘建', status: '已驳回', time: nowText(), comment },
          ],
        }));
        messageApi.success('资产借用申请已驳回');
        refresh();
      },
    });
  };

  const columns = [
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '借用开始日期', dataIndex: 'startDate', width: 130 },
    { title: '借用结束日期', dataIndex: 'endDate', width: 130 },
    { title: '借用原因', dataIndex: 'reason', width: 100 },
    { title: '需求说明', dataIndex: 'detail', width: 230 },
    {
      title: '资产标签号',
      width: 180,
      render: (_, record) => (
        <Button type="link" icon={<Search size={14} />} className="px-0" onClick={() => setMatchDetailId(record.id)}>
          {record.matchedAsset?.assetTag || '选择资产'}
        </Button>
      ),
    },
    { title: 'SN号', width: 140, render: (_, record) => record.matchedAsset?.sn || '-' },
    { title: '公司', width: 220, render: (_, record) => record.matchedAsset?.company || '-' },
    { title: '板块', width: 90, render: (_, record) => record.matchedAsset?.block || '-' },
    { title: '资产说明（实物）', width: 230, render: (_, record) => record.matchedAsset?.assetDesc || '-' },
    { title: '配置（实物）', width: 220, render: (_, record) => record.matchedAsset?.config || '-' },
    {
      title: '资产状态',
      width: 120,
      render: (_, record) => record.matchedAsset ? <Tag color="success">{record.matchedAsset.status}</Tag> : <Tag>待库管员配给</Tag>,
    },
    { title: '升级耗材信息', width: 210, render: (_, record) => record.matchedAsset?.upgradeConsumables?.join('；') || '-' },
  ];

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待配给的资产借用申请" />
          <div className="mt-4 flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">借用配给</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <BorrowingApplicantCard applicant={application.applicant} applyDate={application.applyDate} warehouse={warehouse} onViewAssets={() => setEmployeeAssetsOpen(true)} />

        <Card title="ES 配给信息" size="small">
          <div className="mb-4 flex items-center gap-3">
            <Typography.Text strong><span className="text-red-500">*</span> 办理仓库：</Typography.Text>
            <Select style={{ width: 260 }} value={warehouse} options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => {
              setWarehouse(value);
              setDetails((current) => current.map((item) => ({ ...item, matchedAsset: item.matchedAsset?.warehouse === value ? item.matchedAsset : null })));
            }} />
          </div>
          <Table rowKey="id" columns={columns} dataSource={details} pagination={false} scroll={{ x: 2300 }} />
          <div className="mt-4">
            <Typography.Text strong>ES 配给意见：</Typography.Text>
            <TextArea className="mt-2" rows={3} maxLength={400} showCount value={comment} placeholder="同意时非必填，驳回时必填" onChange={(event) => setComment(event.target.value)} />
          </div>
        </Card>

        <BorrowingApprovalHistory records={application.approvalHistory} />

        <Card title="审批操作" size="small">
          <div className="flex justify-center gap-3">
            <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={submit}>同意</Button>
            <Button danger icon={<XCircle size={14} />} onClick={reject}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <AssetMatchModal
        open={Boolean(currentDetail)}
        materialId={currentDetail?.materialId}
        warehouse={warehouse}
        currentAsset={currentDetail?.matchedAsset}
        onCancel={() => setMatchDetailId(null)}
        onConfirm={(asset) => {
          setDetails((current) => current.map((item) => item.id === matchDetailId ? { ...item, matchedAsset: asset } : item));
          setMatchDetailId(null);
          messageApi.success(`已匹配资产：${asset.assetTag}`);
        }}
      />
      <EmployeeAssetsModal open={employeeAssetsOpen} applicant={application.applicant} onCancel={() => setEmployeeAssetsOpen(false)} />
    </div>
  );
}
