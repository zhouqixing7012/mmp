import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getAssetReturnApplications,
  submitAssetReturnMisDecision,
} from '../../services/assetReturnService';

const { TextArea } = Input;

function formatDepartment(value) {
  return value ? String(value).replace(/\s*\/\s*/g, '.') : '-';
}

function DetailCard({ application, onViewRepairs }) {
  const asset = application.asset;
  const componentCount = asset.component && asset.component !== '-' ? 1 : 0;

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card size="small" title="申请人信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="申请时间">{application.applyTime}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{application.applicant.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{application.applicant.email}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{formatDepartment(application.applicant.department)}</Descriptions.Item>
          <Descriptions.Item label="退库类型">{application.returnType}</Descriptions.Item>
          <Descriptions.Item label="退库原因" span={2}>{application.reason || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        size="small"
        title="资产信息"
        extra={(
          <Button type="link" icon={<Eye size={14} />} onClick={onViewRepairs}>
            查看
          </Button>
        )}
      >
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="资产说明" span={3}>{asset.assetDesc || '-'}</Descriptions.Item>
          <Descriptions.Item label="SN号">{asset.sn || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产标签号">{asset.assetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="数量">{asset.quantity || 1}</Descriptions.Item>
          <Descriptions.Item label="资产状态">{asset.status || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产大类">{asset.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产小类">{asset.subCategory || '-'}</Descriptions.Item>
          <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
          <Descriptions.Item label="配置" span={2}>{asset.config || '-'}</Descriptions.Item>
          <Descriptions.Item label="启用日期">{asset.enabledDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{asset.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="建筑">{asset.building || '-'}</Descriptions.Item>
          <Descriptions.Item label="楼层">{asset.floor || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{asset.note || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

export default function AssetReturnApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [repairOpen, setRepairOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const selected = applications.find((item) => item.status === '处理中' && item.currentNode === 'MIS鉴定') || null;

  const submit = (decision) => {
    if (!selected) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('鉴定不通过时审批意见必填');
      return;
    }

    const approved = decision === '同意';
    setLoading(true);
    try {
      submitAssetReturnMisDecision(selected.id, {
        result: approved ? '鉴定通过' : '鉴定不通过',
        description: approved ? '鉴定通过' : comment.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(approved ? '鉴定已通过' : '退库申请已驳回');
      setComment('');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无MIS鉴定待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const historyColumns = [
    { title: '审批环节', dataIndex: 'node', width: 160 },
    { title: '申请人/审批人', dataIndex: 'person', width: 220 },
    { title: '代理人', width: 120, render: () => '-' },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => {
        const color = value === '已驳回' ? 'error' : value === '待审批' ? 'warning' : value === '已同意' || value === '已提交' ? 'success' : 'default';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    { title: '审批时间', dataIndex: 'time', width: 180 },
    { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  const repairColumns = [
    { title: '维修单号', dataIndex: 'orderNo', width: 170 },
    { title: '维修时间', dataIndex: 'repairTime', width: 170 },
    { title: '故障描述', dataIndex: 'faultDescription', width: 240 },
    { title: '维修结果', dataIndex: 'repairResult', width: 240 },
    { title: '维修状态', dataIndex: 'status', width: 100, render: (value) => <Tag color="success">{value}</Tag> },
  ];

  const repairRecords = [
    {
      id: 'repair-1',
      orderNo: 'WX-202607180021',
      repairTime: '2026-07-18 10:30:00',
      faultDescription: '设备间歇性蓝屏、无法稳定启动。',
      repairResult: '更换硬盘并完成系统检测。',
      status: '已完成',
    },
    {
      id: 'repair-2',
      orderNo: 'WX-202601120008',
      repairTime: '2026-01-12 15:20:00',
      faultDescription: '设备运行卡顿，启动时间较长。',
      repairResult: '完成系统清理及硬件检测。',
      status: '已完成',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">MIS 鉴定</Typography.Title>
          <Typography.Text type="secondary">退库单号：{selected.id}</Typography.Text>
        </div>

        <DetailCard application={selected} onViewRepairs={() => setRepairOpen(true)} />

        <Card size="small" title="审批信息">
          <Table
            rowKey={(record, index) => `${record.node}-${record.time}-${index}`}
            columns={historyColumns}
            dataSource={selected.history || []}
            pagination={false}
            size="small"
            bordered
          />
          <div className="mt-4">
            <Typography.Text strong>审批意见</Typography.Text>
            <TextArea
              className="mt-2"
              rows={3}
              maxLength={400}
              showCount
              value={comment}
              placeholder="鉴定不通过时必填"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" icon={<CheckCircle2 size={14} />} loading={loading} onClick={() => submit('同意')}>鉴定通过</Button>
            <Button danger icon={<XCircle size={14} />} loading={loading} onClick={() => submit('驳回')}>鉴定不通过</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <Modal
        title={`维修记录（资产标签号：${selected.asset.assetTag}）`}
        open={repairOpen}
        width={980}
        footer={<Button onClick={() => setRepairOpen(false)}>关闭</Button>}
        onCancel={() => setRepairOpen(false)}
      >
        <Table
          rowKey="id"
          columns={repairColumns}
          dataSource={repairRecords}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 920 }}
        />
      </Modal>
    </div>
  );
}
