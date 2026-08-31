import React, { useMemo, useState } from 'react';
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
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';
import {
  getConsumableWorkflowState,
  submitLeaderDecision,
} from '../../services/consumableWorkflowService';

const { TextArea } = Input;

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PageHeader({ number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">耗材申请审批</Typography.Title>
      <Typography.Text type="secondary">申请单号：{number}</Typography.Text>
    </div>
  );
}

function ApplicantCard({ applicant, applyDate }) {
  return (
    <Card size="small" title="申请人信息">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">{applicant.id}-{applicant.name}</Descriptions.Item>
        <Descriptions.Item label="申请日期">{applyDate || '-'}</Descriptions.Item>
        <Descriptions.Item label="公司">{applicant.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="办公区">{applicant.officeArea || '-'}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{applicant.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{applicant.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="部门" span={3}>{formatDepartment(applicant.department)}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

const approvalColumns = [
  { title: '审批环节', dataIndex: 'node', width: 150 },
  { title: '申请人/审批人', dataIndex: 'person', width: 190 },
  {
    title: '审批状态',
    dataIndex: 'status',
    width: 120,
    align: 'center',
    render: (value) => <StatusTag value={value} type="business" />,
  },
  { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
  { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
];

export default function ConsumableLeaderApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');
  const application = useMemo(() => (
    getConsumableWorkflowState().applications
      .find((item) => item.status === '处理中' && item.currentNode === '5级审批') || null
  ), [version]);

  const decide = (decision) => {
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }
    submitLeaderDecision(application.id, decision, comment.trim());
    setComment('');
    setVersion((current) => current + 1);
    messageApi.success(decision === '同意' ? '审批已通过，已按申请行生成耗材配给单' : '耗材申请已驳回');
  };

  if (!application) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待审批的耗材申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  const columns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 230 },
    { title: '配置', dataIndex: 'config', width: 200, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center' },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      width: 130,
      align: 'right',
      render: money,
    },
    { title: '申请用途', dataIndex: 'reason', width: 180 },
    { title: '申请原因', dataIndex: 'detail', width: 260, render: (value) => value || '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader number={application.id} />
      <ApplicantCard applicant={application.applicant} applyDate={application.applyDate} />
      <Card size="small" title="申请耗材信息">
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={application.items}
          pagination={false}
          scroll={{ x: 1090 }}
        />
      </Card>
      <Card size="small" title="审批信息">
        <Table
          rowKey={(record, index) => `${record.node}-${index}`}
          size="small"
          bordered
          columns={approvalColumns}
          dataSource={application.history}
          pagination={false}
        />
      </Card>
      <Card size="small" title="审批操作">
        <TextArea
          rows={3}
          maxLength={400}
          showCount
          value={comment}
          placeholder="同意时可不填写，驳回时必填"
          onChange={(event) => setComment(event.target.value)}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" onClick={() => decide('同意')}>同意</Button>
          <Button danger onClick={() => decide('驳回')}>驳回</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          <Button onClick={() => setCountersignOpen(true)}>加签</Button>
        </div>
      </Card>
      <Modal
        title="加签"
        open={countersignOpen}
        onCancel={() => setCountersignOpen(false)}
        onOk={() => {
          if (!countersignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${countersignPerson.trim()}`);
          setCountersignPerson('');
          setCountersignOpen(false);
        }}
        okText="确认加签"
        cancelText="取消"
      >
        <Input
          value={countersignPerson}
          placeholder="请输入姓名或工号"
          onChange={(event) => setCountersignPerson(event.target.value)}
        />
      </Modal>
    </Space>
  );
}
