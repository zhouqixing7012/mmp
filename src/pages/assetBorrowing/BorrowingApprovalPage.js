import React, { useState } from 'react';
import { CheckCircle2, UserPlus, XCircle } from 'lucide-react';
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
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import BorrowingApprovalHistory from './BorrowingApprovalHistory';
import { nowText } from './utils';

const { TextArea } = Input;

export default function BorrowingApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingApplicationByNode('直属领导审批'));
  const [comment, setComment] = useState('同意');
  const [loading, setLoading] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');

  const refresh = () => {
    setApplication(getBorrowingApplicationByNode('直属领导审批'));
    setComment('同意');
  };

  const decide = (decision) => {
    if (!application) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }
    setLoading(true);
    try {
      updateAssetBorrowingApplication(application.id, (record) => {
        if (decision === '驳回') {
          return {
            ...record,
            status: '已驳回',
            currentNode: '已结束',
            details: record.details.map((item) => ({ ...item, matchedAsset: null })),
            approvalHistory: record.approvalHistory.map((item) => (
              item.node === '直属领导审批' && item.status === '待审批'
                ? { ...item, status: '已驳回', time: nowText(), comment }
                : item
            )),
          };
        }
        return {
          ...record,
          currentNode: '库管员发放',
          approvalHistory: record.approvalHistory.map((item) => (
            item.node === '直属领导审批' && item.status === '待审批'
              ? { ...item, status: '已同意', time: nowText(), comment: comment || '同意' }
              : item
          )),
        };
      });
      messageApi.success(decision === '同意' ? '审批已通过，已生成库管员发放待办。' : '资产借用申请已驳回');
      refresh();
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '资产类别',
      width: 260,
      render: (_, record) => [record.category, record.subCategory].filter(Boolean).join('-') || record.assetDesc,
    },
    { title: '借用数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '借用原因', dataIndex: 'reason', width: 130 },
    { title: '需求说明', dataIndex: 'detail', width: 260, render: (value) => value || '-' },
    { title: '借用开始日期', dataIndex: 'startDate', width: 150 },
    { title: '借用归还日期', dataIndex: 'endDate', width: 150 },
  ];

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待审批的资产借用申请" />
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
          <Typography.Title level={4} className="mb-0">借用审批</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <Card title="借用单信息" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{application.applyDate}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{application.applicant.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{application.applicant.email}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{application.applicant.department}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="借用资产信息" size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={columns}
            dataSource={application.details}
            pagination={false}
            scroll={{ x: 1050 }}
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
            placeholder="同意时非必填，驳回时必填"
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-3 flex justify-center gap-3">
            <Button type="primary" icon={<CheckCircle2 size={14} />} loading={loading} onClick={() => decide('同意')}>同意</Button>
            <Button danger icon={<XCircle size={14} />} loading={loading} onClick={() => decide('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
            <Button icon={<UserPlus size={14} />} onClick={() => setCountersignOpen(true)}>加签</Button>
          </div>
        </BorrowingApprovalHistory>
      </Space>

      <Modal
        title="加签"
        open={countersignOpen}
        okText="确认加签"
        cancelText="取消"
        onCancel={() => {
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
        onOk={() => {
          if (!countersignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${countersignPerson.trim()}`);
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
      >
        <Input value={countersignPerson} placeholder="请输入姓名或工号" onChange={(event) => setCountersignPerson(event.target.value)} />
      </Modal>
    </div>
  );
}
