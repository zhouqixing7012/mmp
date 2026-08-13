import React, { useState } from 'react';
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
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
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
      render: (_, record) => [record.category, record.subCategory].filter(Boolean).join('.') || record.assetDesc,
    },
    { title: '借用数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '借用原因', dataIndex: 'reason', width: 130 },
    { title: '需求说明', dataIndex: 'detail', width: 260, render: (value) => value || '-' },
    { title: '借用开始日期', dataIndex: 'startDate', width: 150 },
    { title: '借用归还日期', dataIndex: 'endDate', width: 150 },
  ];

  if (!application) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待审批的资产借用申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">借用审批</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <Card title="申请人信息" size="small">
          <DetailGrid>
            <DetailItem label="申请人">{application.applicant.id}-{application.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{formatDateText(application.applyDate)}</DetailItem>
            <DetailItem label="公司">{application.applicant.company || '-'}</DetailItem>
            <DetailItem label="办公区">{application.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{application.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{application.applicant.email || '-'}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(application.applicant.department)}</DetailItem>
          </DetailGrid>
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
            <Button type="primary" loading={loading} onClick={() => decide('同意')}>同意</Button>
            <Button danger loading={loading} onClick={() => decide('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
            <Button onClick={() => setCountersignOpen(true)}>加签</Button>
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
    </>
  );
}
