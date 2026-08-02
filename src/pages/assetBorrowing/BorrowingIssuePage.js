import React, { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw, Search, Send, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getBorrowingIssueApplication,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import AssetMatchModal from './AssetMatchModal';
import BorrowingApplicantCard from './BorrowingApplicantCard';
import BorrowingApprovalHistory from './BorrowingApprovalHistory';
import EmployeeAssetsModal from './EmployeeAssetsModal';
import { nowText } from './utils';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];
const LOCATION_OPTIONS = {
  北京市: {
    搜狐媒体大厦: ['5层', '8层', '12层'],
    中关村园区: ['2层', '3层'],
  },
  上海市: {
    上海分公司办公区: ['10层', '11层'],
  },
};

function createOutOrderNo() {
  return `CK-JY-${String(Date.now()).slice(-10)}`;
}

export default function BorrowingIssuePage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingIssueApplication());
  const [details, setDetails] = useState(() => application?.details || []);
  const [warehouse, setWarehouse] = useState(() => application?.warehouse || '北京总部仓');
  const [city, setCity] = useState(() => application?.city || '北京市');
  const [building, setBuilding] = useState(() => application?.building || '搜狐媒体大厦');
  const [floor, setFloor] = useState(() => application?.floor || '8层');
  const [purpose, setPurpose] = useState(() => application?.purpose || '借用');
  const [usageNote, setUsageNote] = useState(() => application?.usageNote || '');
  const [confirmMethod, setConfirmMethod] = useState(() => application?.confirmMethod || '狐小e扫码确认');
  const [matchDetailId, setMatchDetailId] = useState(null);
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentDetail = useMemo(() => details.find((item) => item.id === matchDetailId) || null, [details, matchDetailId]);
  const confirmationStatus = application?.confirmation?.status || '未发起';

  const refresh = () => {
    const next = getBorrowingIssueApplication();
    setApplication(next);
    setDetails(next?.details || []);
    setWarehouse(next?.warehouse || '北京总部仓');
    setCity(next?.city || '北京市');
    setBuilding(next?.building || '搜狐媒体大厦');
    setFloor(next?.floor || '8层');
    setPurpose(next?.purpose || '借用');
    setUsageNote(next?.usageNote || '');
    setConfirmMethod(next?.confirmMethod || '狐小e扫码确认');
  };

  const validateIssueData = () => {
    if (!warehouse || !city || !building || !floor) {
      messageApi.warning('仓库和地点信息必须完整');
      return false;
    }
    const missingAsset = details.find((item) => !item.matchedAsset);
    if (missingAsset) {
      messageApi.warning(`请为“${missingAsset.assetDesc}”匹配实物资产`);
      return false;
    }
    const invalidAsset = details.find((item) => (
      item.matchedAsset.warehouse !== warehouse
      || item.matchedAsset.materialId !== item.materialId
      || !['在库-新增', '在库-待处理', '在库-再利用'].includes(item.matchedAsset.status)
      || item.matchedAsset.locked
    ));
    if (invalidAsset) {
      messageApi.error(`资产（资产标签号：${invalidAsset.matchedAsset.assetTag}）不满足出库条件，请重新选择。`);
      return false;
    }
    return true;
  };

  const requestConfirmation = () => {
    if (!application || !validateIssueData()) return;
    setSubmitting(true);
    try {
      updateAssetBorrowingApplication(application.id, (record) => ({
        ...record,
        warehouse,
        city,
        building,
        floor,
        purpose,
        usageNote,
        confirmMethod,
        details,
        currentNode: '员工确认',
        confirmation: {
          status: '待确认',
          method: confirmMethod,
          confirmedBy: '',
          confirmedAt: '',
        },
        approvalHistory: [
          ...record.approvalHistory,
          { node: '库管员发放', person: 'SOHU01-库房管理员', status: '等待员工确认', time: nowText(), comment: `确认方式：${confirmMethod}` },
        ],
      }));
      messageApi.success('已发起员工借用确认，请等待申请人操作。');
      setApplication(null);
    } finally {
      setSubmitting(false);
    }
  };

  const executeOut = () => {
    if (!application || confirmationStatus !== '已确认' || !validateIssueData()) return;
    Modal.confirm({
      title: '确认执行出库？',
      content: '出库后将生成借用出库单，并更新资产台账状态为“在用-借用中”。',
      okText: '执行出库',
      cancelText: '取消',
      onOk: () => {
        const outOrderNo = createOutOrderNo();
        updateAssetBorrowingApplication(application.id, (record) => ({
          ...record,
          status: '已处理',
          result: '正常出库',
          currentNode: '已完成',
          outOrderNo,
          completedAt: nowText(),
          approvalHistory: [
            ...record.approvalHistory,
            { node: '执行出库', person: 'SOHU01-库房管理员', status: '已出库', time: nowText(), comment: `出库单号：${outOrderNo}` },
          ],
        }));
        messageApi.success(`出库成功，出库单号：${outOrderNo}`);
        refresh();
      },
    });
  };

  const abandon = () => {
    if (!application) return;
    Modal.confirm({
      title: '放弃领用确认',
      content: '放弃领用后本次借用流程将结束，已匹配资产将解除锁定，是否继续？',
      okText: '确认放弃',
      cancelText: '取消',
      onOk: () => {
        updateAssetBorrowingApplication(application.id, (record) => ({
          ...record,
          status: '已处理',
          result: '放弃领用',
          currentNode: '已完成',
          completedAt: nowText(),
          details: record.details.map((item) => ({ ...item, matchedAsset: null })),
          approvalHistory: [
            ...record.approvalHistory,
            { node: '库管员发放', person: 'SOHU01-库房管理员', status: '已结束', time: nowText(), comment: '放弃领用' },
          ],
        }));
        messageApi.success('借用流程已结束，处理结果为“放弃领用”。');
        refresh();
      },
    });
  };

  const columns = [
    { title: '申请资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '借用开始日期', dataIndex: 'startDate', width: 130 },
    { title: '借用结束日期', dataIndex: 'endDate', width: 130 },
    { title: '借用原因', dataIndex: 'reason', width: 100 },
    { title: '需求说明', dataIndex: 'detail', width: 220 },
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
    { title: '公司/板块', width: 250, render: (_, record) => record.matchedAsset ? `${record.matchedAsset.company} / ${record.matchedAsset.block}` : '-' },
    { title: '资产说明/配置', width: 300, render: (_, record) => record.matchedAsset ? `${record.matchedAsset.assetDesc} / ${record.matchedAsset.config}` : '-' },
    { title: '资产状态', width: 120, render: (_, record) => record.matchedAsset ? <Tag color="success">{record.matchedAsset.status}</Tag> : '-' },
    { title: '盘点状态', width: 100, render: (_, record) => record.matchedAsset?.inventoryStatus ? <Tag color="error">{record.matchedAsset.inventoryStatus}</Tag> : '-' },
    { title: '升级耗材信息', width: 210, render: (_, record) => record.matchedAsset?.upgradeConsumables?.join('；') || '-' },
  ];

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待发放的资产借用单，员工确认后可点击刷新状态" />
          <div className="mt-4 flex justify-center gap-3">
            <Button icon={<RefreshCcw size={14} />} onClick={refresh}>刷新状态</Button>
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
          <Typography.Title level={4} className="mb-0">借用发放</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        {confirmationStatus === '已确认' && <Alert type="success" showIcon message={`员工已于 ${application.confirmation.confirmedAt} 完成确认，可执行出库。`} />}
        {confirmationStatus === '待确认' && <Alert type="warning" showIcon message="已发起员工确认，当前等待申请人操作。" />}

        <BorrowingApplicantCard applicant={application.applicant} applyDate={application.applyDate} warehouse={warehouse} onViewAssets={() => setEmployeeAssetsOpen(true)} />

        <Card title="发放及实物资产信息" size="small">
          <Space wrap size={16} className="mb-4">
            <div><Typography.Text strong><span className="text-red-500">*</span> 当前仓库：</Typography.Text><Select className="ml-2" style={{ width: 220 }} value={warehouse} options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => {
              setWarehouse(value);
              setDetails((current) => current.map((item) => ({ ...item, matchedAsset: item.matchedAsset?.warehouse === value ? item.matchedAsset : null })));
            }} /></div>
            <div><Typography.Text strong><span className="text-red-500">*</span> City：</Typography.Text><Select className="ml-2" style={{ width: 150 }} value={city} options={Object.keys(LOCATION_OPTIONS).map((value) => ({ label: value, value }))} onChange={(value) => {
              setCity(value);
              setBuilding('');
              setFloor('');
            }} /></div>
            <div><Typography.Text strong><span className="text-red-500">*</span> Building：</Typography.Text><Select className="ml-2" style={{ width: 190 }} value={building || undefined} options={Object.keys(LOCATION_OPTIONS[city] || {}).map((value) => ({ label: value, value }))} onChange={(value) => {
              setBuilding(value);
              setFloor('');
            }} /></div>
            <div><Typography.Text strong><span className="text-red-500">*</span> Floor：</Typography.Text><Select className="ml-2" style={{ width: 120 }} value={floor || undefined} options={(LOCATION_OPTIONS[city]?.[building] || []).map((value) => ({ label: value, value }))} onChange={setFloor} /></div>
          </Space>

          <Table rowKey="id" columns={columns} dataSource={details} pagination={false} scroll={{ x: 2300 }} />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <Typography.Text strong><span className="text-red-500">*</span> 资产用途：</Typography.Text>
              <Select className="mt-2 w-full" value={purpose} options={[{ label: '借用', value: '借用' }]} onChange={setPurpose} />
            </div>
            <div>
              <Typography.Text strong><span className="text-red-500">*</span> 确认方式：</Typography.Text>
              <Radio.Group className="mt-2 block" value={confirmMethod} onChange={(event) => setConfirmMethod(event.target.value)} options={[
                { label: '狐小e扫码确认', value: '狐小e扫码确认' },
                { label: '刷卡确认', value: '刷卡确认' },
                { label: '输入工号确认', value: '输入工号确认' },
              ]} />
            </div>
            <div className="lg:col-span-2">
              <Typography.Text strong>使用说明：</Typography.Text>
              <TextArea className="mt-2" rows={3} maxLength={400} showCount value={usageNote} placeholder="非必填，出库后写入资产卡片" onChange={(event) => setUsageNote(event.target.value)} />
            </div>
          </div>
        </Card>

        <BorrowingApprovalHistory records={application.approvalHistory} />

        <Card title="发放操作" size="small">
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="primary" icon={<Send size={14} />} loading={submitting} disabled={confirmationStatus === '已确认'} onClick={requestConfirmation}>申请人借用确认</Button>
            <Button type="primary" icon={<CheckCircle2 size={14} />} disabled={confirmationStatus !== '已确认'} onClick={executeOut}>执行出库</Button>
            <Button danger icon={<XCircle size={14} />} onClick={abandon}>放弃领用</Button>
            <Button icon={<RefreshCcw size={14} />} onClick={refresh}>刷新状态</Button>
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
