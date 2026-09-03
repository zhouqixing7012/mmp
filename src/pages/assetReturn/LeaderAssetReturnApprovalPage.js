import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

const RETURN_ORDER = {
  id: 'ERA-202607300022',
  applicant: {
    id: '152028',
    name: '马力',
    company: '114.新媒体',
    officeArea: '北京-搜狐媒体大厦',
    department: '搜狐媒体.网安中心.审核3-4组.3组',
    phone: '010-56601449',
    email: 'lima152028@sohu-inc.com',
  },
  applyDate: '2026-07-30',
  reason: '列总使用',
};

const ASSET_ROWS = [
  {
    id: '1',
    assetTag: '3159300003',
    assetDesc: 'OFFICE EQUIPMENT.摄影摄像-单反套机.佳能.EOS 5D Mark II套机',
    status: '在用-使用中',
    quantity: 1,
    config: '24-105L',
    componentCount: 0,
    purpose: '部门公用',
  },
];

const APPROVAL_ROWS = [
  {
    id: '1',
    node: '开始',
    person: '152028-马力',
    status: '已提交',
    time: '2026-07-30',
    comment: '-',
  },
  {
    id: '2',
    node: '资产退库-领导审批',
    person: '110127-国庆临',
    status: '待处理',
    time: '-',
    comment: '-',
  },
];

export default function LeaderAssetReturnApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [comment, setComment] = useState('');
  const [addSignOpen, setAddSignOpen] = useState(false);
  const [addSignPerson, setAddSignPerson] = useState('');

  const handleDecision = (decision) => {
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }
    messageApi.success(decision === '同意' ? '已同意退库申请' : '退库申请已驳回');
  };

  const assetColumns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '资产说明', dataIndex: 'assetDesc', minWidth: 360 },
    {
      title: '资产状态',
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center' },
    { title: '配置', dataIndex: 'config', width: 140 },
    { title: '部件数量', dataIndex: 'componentCount', width: 110, align: 'center' },
    { title: '资产用途', dataIndex: 'purpose', width: 120 },
  ];

  const approvalColumns = [
    { title: '审批环节', dataIndex: 'node', width: 200 },
    { title: '审批人', dataIndex: 'person', width: 180 },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '审批时间', dataIndex: 'time', width: 160 },
    { title: '审批意见', dataIndex: 'comment' },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">领导退库审批</Typography.Title>
          <Typography.Text type="secondary">退库单号：{RETURN_ORDER.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">{RETURN_ORDER.applicant.id}-{RETURN_ORDER.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{RETURN_ORDER.applyDate}</DetailItem>
            <DetailItem label="公司">{RETURN_ORDER.applicant.company}</DetailItem>
            <DetailItem label="办公区">{RETURN_ORDER.applicant.officeArea}</DetailItem>
            <DetailItem label="联系电话">{RETURN_ORDER.applicant.phone}</DetailItem>
            <DetailItem label="邮箱">{RETURN_ORDER.applicant.email}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(RETURN_ORDER.applicant.department)}</DetailItem>
            <DetailItem label="退库原因" span={3}>{RETURN_ORDER.reason}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>资产信息</SectionTitle>}>
          <Table
            rowKey="id"
            columns={assetColumns}
            dataSource={ASSET_ROWS}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1120 }}
          />
        </Card>

        <Card size="small" title={<SectionTitle>审批信息</SectionTitle>}>
          <Table
            rowKey="id"
            columns={approvalColumns}
            dataSource={APPROVAL_ROWS}
            pagination={false}
            size="small"
            bordered
          />
        </Card>

        <Card size="small" title={<SectionTitle>审批操作</SectionTitle>}>
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={comment}
            placeholder="驳回时必填"
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" onClick={() => handleDecision('同意')}>同意</Button>
            <Button danger onClick={() => handleDecision('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
            <Button onClick={() => setAddSignOpen(true)}>加签</Button>
          </div>
        </Card>
      </Space>

      <Modal
        title="加签"
        open={addSignOpen}
        okText="确认加签"
        cancelText="取消"
        onOk={() => {
          if (!addSignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${addSignPerson.trim()}`);
          setAddSignOpen(false);
          setAddSignPerson('');
        }}
        onCancel={() => {
          setAddSignOpen(false);
          setAddSignPerson('');
        }}
      >
        <Input
          value={addSignPerson}
          placeholder="请输入姓名或工号"
          onChange={(event) => setAddSignPerson(event.target.value)}
        />
      </Modal>
    </>
  );
}
