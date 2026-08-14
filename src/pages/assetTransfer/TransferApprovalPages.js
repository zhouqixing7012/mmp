import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

const TRANSFER_ORDER = {
  id: 'ETA-202608140001',
  transferOutPerson: '110933-史小曼',
  applyDate: '2026-08-14',
  transferOutDepartment: '集团总部.人力资源中心.后台支持二部',
  transferType: '一般转移',
  transferOutPhone: '010-00000001',
  transferOutEmail: 'xiaomanshi@sohu-lab.com',
  transferReason: '测试',
  receiver: '114111-杨羊',
  receiverDepartment: '集团总部.员工服务中心.资产部',
  receiverPhone: '010-00000001',
  receiverEmail: 'qianyang@sohu-lab.com',
  purpose: '测试',
};

const ASSET_ROWS = [
  {
    id: '1',
    assetTag: '1141200545',
    assetDesc: '笔记本.技术笔记本.惠普.820 G1技术型.i5-4200U/4G/500G/12.5"/3芯电池/包/鼠标',
    quantity: 1,
    city: '北京市',
    building: '搜狐媒体大厦',
    floor: '17层',
    componentCount: 0,
    status: '在用-使用中',
  },
];

const APPROVAL_ROWS = [
  {
    id: 'start',
    node: '开始',
    person: '110933-史小曼',
    status: '已提交',
    time: '2026-08-14',
    comment: '-',
  },
  {
    id: 'receiver-confirm',
    node: '接收人-确认',
    person: '114111-杨羊',
    status: '已同意',
    time: '2026-08-14',
    comment: '同意',
  },
  {
    id: 'out-manager',
    node: '转出部门经理-审批',
    person: '110139-张雪梅',
    status: '已同意',
    time: '2026-08-14',
    comment: '同意',
  },
  {
    id: 'receiver-manager',
    node: '接收部门经理-审批',
    person: '206984-何文',
    status: '已同意',
    time: '2026-08-14',
    comment: '同意',
  },
];

const ASSET_COLUMNS = [
  { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
  { title: '资产说明', dataIndex: 'assetDesc', width: 430 },
  { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
  { title: '城市', dataIndex: 'city', width: 100 },
  { title: '建筑', dataIndex: 'building', width: 140 },
  { title: '楼层', dataIndex: 'floor', width: 80 },
  { title: '部件数量', dataIndex: 'componentCount', width: 100, align: 'center' },
  {
    title: '资产状态',
    dataIndex: 'status',
    width: 140,
    align: 'center',
    render: (value) => <StatusTag value={value} type="business" />,
  },
];

const APPROVAL_COLUMNS = [
  { title: '审批环节', dataIndex: 'node', width: 220 },
  { title: '申请人/审批人', dataIndex: 'person', width: 180 },
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

function TransferBaseInfo() {
  return (
    <>
      <Card size="small" title={<SectionTitle>转出人信息</SectionTitle>}>
        <DetailGrid>
          <DetailItem label="转出人">{TRANSFER_ORDER.transferOutPerson}</DetailItem>
          <DetailItem label="申请时间">{TRANSFER_ORDER.applyDate}</DetailItem>
          <DetailItem label="转移类型">{TRANSFER_ORDER.transferType}</DetailItem>
          <DetailItem label="转出部门">{TRANSFER_ORDER.transferOutDepartment}</DetailItem>
          <DetailItem label="电话">{TRANSFER_ORDER.transferOutPhone}</DetailItem>
          <DetailItem label="邮箱">{TRANSFER_ORDER.transferOutEmail}</DetailItem>
          <DetailItem label="转出原因" span={3}>{TRANSFER_ORDER.transferReason}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>接收人信息</SectionTitle>}>
        <DetailGrid>
          <DetailItem label="接收人">{TRANSFER_ORDER.receiver}</DetailItem>
          <DetailItem label="接收部门">{TRANSFER_ORDER.receiverDepartment}</DetailItem>
          <DetailItem label="电话">{TRANSFER_ORDER.receiverPhone}</DetailItem>
          <DetailItem label="邮箱">{TRANSFER_ORDER.receiverEmail}</DetailItem>
          <DetailItem label="使用用途" span={2}>{TRANSFER_ORDER.purpose}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>转移资产信息</SectionTitle>}>
        <Table
          rowKey="id"
          columns={ASSET_COLUMNS}
          dataSource={ASSET_ROWS}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 1220 }}
        />
      </Card>
    </>
  );
}

function ApprovalHistory({ rows }) {
  return (
    <Card size="small" title={<SectionTitle>审批信息</SectionTitle>}>
      <Table
        rowKey="id"
        columns={APPROVAL_COLUMNS}
        dataSource={rows}
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  );
}

function ApprovalActions({ stageName }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [comment, setComment] = useState('同意');

  const decide = (decision) => {
    if (decision === '驳回' && (!comment.trim() || comment.trim() === '同意')) {
      messageApi.warning('驳回时请填写驳回原因');
      return;
    }
    messageApi.success(`${stageName}${decision === '同意' ? '已同意' : '已驳回'}`);
  };

  return (
    <>
      {contextHolder}
      <Card size="small" title={<SectionTitle>审批操作</SectionTitle>}>
        <Typography.Text strong>审批意见</Typography.Text>
        <TextArea
          className="mt-2"
          rows={3}
          maxLength={400}
          showCount
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="驳回时必填"
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" onClick={() => decide('同意')}>同意</Button>
          <Button danger onClick={() => decide('驳回')}>驳回</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
        </div>
      </Card>
    </>
  );
}

function TransferPage({ title, approvalRows, approvalStage }) {
  return (
    <Space direction="vertical" size={16} className="w-full">
      <div className="flex items-center justify-between gap-4">
        <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
        <Typography.Text type="secondary">转移单号：{TRANSFER_ORDER.id}</Typography.Text>
      </div>

      <TransferBaseInfo />
      <ApprovalHistory rows={approvalRows} />
      <ApprovalActions stageName={approvalStage} />
    </Space>
  );
}

export function AssetTransferApprovalPage() {
  return (
    <TransferPage
      title="资产转移审批"
      approvalRows={APPROVAL_ROWS}
      approvalStage="资产转移审批"
    />
  );
}

export function TransferOutManagerApprovalPage() {
  return (
    <TransferPage
      title="转出部门经理审批"
      approvalRows={APPROVAL_ROWS.slice(0, 2)}
      approvalStage="转出部门经理审批"
    />
  );
}

export function ReceiverManagerApprovalPage() {
  return (
    <TransferPage
      title="接收部门经理审批"
      approvalRows={APPROVAL_ROWS.slice(0, 3)}
      approvalStage="接收部门经理审批"
    />
  );
}
