import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import AssetMatchModal from './AssetMatchModal';
import BorrowingApplicantCard from './BorrowingApplicantCard';
import BorrowingApprovalHistory from './BorrowingApprovalHistory';
import EmployeeAssetsModal from './EmployeeAssetsModal';
import WarehouseSelectModal, { getBorrowWarehouse } from './WarehouseSelectModal';
import { nowText } from './utils';

const { TextArea } = Input;

function isMatchedAssetValid(detail, warehouse) {
  if (!detail.matchedAsset) return true;
  const typeMatched = detail.category && detail.subCategory
    ? detail.matchedAsset.category === detail.category && detail.matchedAsset.subCategory === detail.subCategory
    : detail.matchedAsset.materialId === detail.materialId;
  return typeMatched
    && detail.matchedAsset.warehouse === warehouse
    && ['在库-新增', '在库-待处理', '在库-再利用'].includes(detail.matchedAsset.status)
    && !detail.matchedAsset.locked;
}

export default function BorrowingAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingApplicationByNode('ES配给'));
  const [details, setDetails] = useState(() => application?.details || []);
  const [warehouse, setWarehouse] = useState(() => application?.warehouse || '北京总部仓');
  const [comment, setComment] = useState('');
  const [matchDetailId, setMatchDetailId] = useState(null);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentDetail = useMemo(
    () => details.find((item) => item.id === matchDetailId) || null,
    [details, matchDetailId]
  );
  const warehouseRecord = getBorrowWarehouse(warehouse);
  const warehouseDisplay = warehouseRecord ? `${warehouseRecord.code}.${warehouseRecord.name}` : warehouse;

  const refresh = () => {
    const next = getBorrowingApplicationByNode('ES配给');
    setApplication(next);
    setDetails(next?.details || []);
    setWarehouse(next?.warehouse || '北京总部仓');
    setComment('');
  };

  const changeWarehouse = (nextWarehouse) => {
    setWarehouse(nextWarehouse.name);
    setDetails((current) => current.map((item) => ({
      ...item,
      matchedAsset: item.matchedAsset?.warehouse === nextWarehouse.name ? item.matchedAsset : null,
    })));
    setWarehouseOpen(false);
    messageApi.success(`已选择办理仓库：${nextWarehouse.name}`);
  };

  const submit = () => {
    if (!application) return;
    const invalidMatch = details.find((item) => !isMatchedAssetValid(item, warehouse));
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

  const borrowingColumns = [
    {
      title: '仓库',
      width: 260,
      render: () => (
        <Space.Compact className="w-full">
          <Input readOnly value={warehouseDisplay} placeholder="请选择办理仓库" />
          <Button icon={<Search size={14} />} onClick={() => setWarehouseOpen(true)} />
        </Space.Compact>
      ),
    },
    {
      title: '资产标签号',
      width: 230,
      render: (_, record) => (
        <Space.Compact className="w-full">
          <Input readOnly value={record.matchedAsset?.assetTag || ''} placeholder="请选择资产" />
          <Button icon={<Search size={14} />} onClick={() => setMatchDetailId(record.id)} />
        </Space.Compact>
      ),
    },
    { title: '资产说明', dataIndex: 'assetDesc', width: 230 },
    { title: '借用原因', dataIndex: 'reason', width: 110 },
    { title: '需求说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    { title: '借用开始日期', dataIndex: 'startDate', width: 130 },
    { title: '借用结束日期', dataIndex: 'endDate', width: 130 },
  ];

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待配给的资产借用申请" />
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
          <Typography.Title level={4} className="mb-0">借用配给</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <BorrowingApplicantCard
          applicant={application.applicant}
          applyDate={application.applyDate}
          onViewAssets={() => setEmployeeAssetsOpen(true)}
          compact
        />

        <Card title="借用资产信息" size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={borrowingColumns}
            dataSource={details}
            pagination={false}
            scroll={{ x: 1310 }}
          />
        </Card>

        <BorrowingApprovalHistory records={application.approvalHistory}>
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={comment}
            placeholder="请输入审批意见，驳回时必填"
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-3 flex justify-center gap-3">
            <Button type="primary" loading={submitting} onClick={submit}>同意</Button>
            <Button danger onClick={reject}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
            <Button onClick={() => messageApi.info('转签功能为原型演示')}>转签</Button>
          </div>
        </BorrowingApprovalHistory>
      </Space>

      <WarehouseSelectModal
        open={warehouseOpen}
        value={warehouse}
        onCancel={() => setWarehouseOpen(false)}
        onConfirm={changeWarehouse}
      />

      <AssetMatchModal
        open={Boolean(currentDetail)}
        materialId={currentDetail?.materialId}
        category={currentDetail?.category}
        subCategory={currentDetail?.subCategory}
        warehouse={warehouse}
        currentAsset={currentDetail?.matchedAsset}
        onCancel={() => setMatchDetailId(null)}
        onConfirm={(asset) => {
          setDetails((current) => current.map((item) => (
            item.id === matchDetailId ? { ...item, matchedAsset: asset } : item
          )));
          setMatchDetailId(null);
          messageApi.success(`已匹配资产：${asset.assetTag}`);
        }}
      />

      <EmployeeAssetsModal
        open={employeeAssetsOpen}
        applicant={application.applicant}
        onCancel={() => setEmployeeAssetsOpen(false)}
      />
    </div>
  );
}
