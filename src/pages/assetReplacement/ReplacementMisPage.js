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
import { getPendingMisApplications, submitMisDecision } from '../../services/assetReplacementService';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;

function formatDepartment(value) {
  return value ? String(value).replace(/\s*\/\s*/g, '.') : '-';
}

export default function ReplacementMisPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [repairOpen, setRepairOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedApplication = useMemo(() => getPendingMisApplications()[0] || null, [version]);

  const submitDecision = (decision) => {
    if (!selectedApplication) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('鉴定不通过时审批意见必填');
      return;
    }

    setSubmitting(true);
    try {
      const approved = decision === '同意';
      submitMisDecision(selectedApplication.id, {
        result: approved ? '资产更换' : '鉴定不通过',
        description: approved ? '鉴定通过' : comment.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(approved ? 'MIS鉴定已通过，单据进入资产更换办理' : 'MIS鉴定不通过，流程已结束');
      setComment('');
      setVersion((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待鉴定申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const asset = selectedApplication.oldAsset;
  const componentCount = asset.component && asset.component !== '-' ? 1 : 0;
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
  const repairColumns = [
    { title: '维修单号', dataIndex: 'orderNo', width: 170 },
    { title: '维修时间', dataIndex: 'repairTime', width: 170 },
    { title: '故障描述', dataIndex: 'faultDescription', width: 240 },
    { title: '维修结果', dataIndex: 'repairResult', width: 240 },
    { title: '维修状态', dataIndex: 'status', width: 100, render: (value) => <Tag color="success">{value}</Tag> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">MIS鉴定</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selectedApplication.id}</Typography.Text>
        </div>

        <Card title="申请人信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">
              {selectedApplication.applicant.id}-{selectedApplication.applicant.name}
            </Descriptions.Item>
            <Descriptions.Item label="申请日期">{selectedApplication.applyDate}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedApplication.applicant.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedApplication.applicant.email}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{formatDepartment(selectedApplication.applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="更换原因" span={3}>{selectedApplication.reason || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="资产信息"
          size="small"
          extra={(
            <Button type="link" icon={<Eye size={14} />} onClick={() => setRepairOpen(true)}>
              查看
            </Button>
          )}
        >
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="资产说明" span={3}>{asset.assetDesc || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产标签号">{asset.assetTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="SN号">{asset.sn || '-'}</Descriptions.Item>
            <Descriptions.Item label="配置">{asset.config || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产状态">{asset.status || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产大类">{asset.category || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产小类">{asset.subCategory || '-'}</Descriptions.Item>
            <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
            <Descriptions.Item label="启用日期">{asset.enabledDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="城市">{asset.city || '-'}</Descriptions.Item>
            <Descriptions.Item label="建筑">{asset.building || '-'}</Descriptions.Item>
            <Descriptions.Item label="楼层">{asset.floor || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{asset.note || '-'}</Descriptions.Item>
            <Descriptions.Item label="耗材信息" span={3}>{asset.consumables || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <ReplacementHistoryCard
          title="审批流程"
          records={selectedApplication.history}
          showAgent={false}
        >
          <Typography.Text strong>审批意见：</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={comment}
            placeholder="鉴定不通过时必填"
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={() => submitDecision('同意')}>鉴定通过</Button>
            <Button danger icon={<XCircle size={14} />} loading={submitting} onClick={() => submitDecision('驳回')}>鉴定不通过</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </ReplacementHistoryCard>
      </Space>

      <Modal
        title={`维修记录（资产标签号：${asset.assetTag}）`}
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
