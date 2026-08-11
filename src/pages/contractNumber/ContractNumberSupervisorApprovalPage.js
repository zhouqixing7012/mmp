import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import {
  getContractNumberSupervisorApproval,
  updateContractNumberAllocation,
} from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function downloadAttachment(attachment) {
  if (!attachment) return;
  const blob = new Blob([attachment.content || '合约号码申请附件（演示文件）'], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function ContractNumberSupervisorApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getContractNumberSupervisorApproval());
  const [comment, setComment] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  const refresh = () => setApplication(getContractNumberSupervisorApproval());

  const historyRecords = useMemo(() => {
    if (!application) return [];
    return [...(application.history || []), ...(application.delayRecords || [])];
  }, [application]);

  const decide = (action) => {
    if (!application || application.status !== '待审批') return;
    if (action === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }

    setLoadingAction(action);
    try {
      updateContractNumberAllocation(application.id, (record) => {
        const approved = action === '同意';
        return {
          ...record,
          status: approved ? '处理中' : '已驳回',
          currentNode: approved ? '库管员领用' : '结束',
          history: (record.history || []).map((item) => (
            item.node === '合约号码配给主管审批' && item.status === '待审批'
              ? {
                ...item,
                status: approved ? '已同意' : '已驳回',
                time: nowText(),
                comment: comment.trim() || '同意',
              }
              : item
          )).concat(approved ? [{
            id: `warehouse-${Date.now()}`,
            person: '库管员',
            node: '库管员领用',
            time: '',
            status: '待处理',
            comment: '',
          }] : []),
        };
      });
      messageApi.success(action === '同意' ? '主管审批已通过，已生成库管员领用待办' : '申请已驳回');
      setComment('');
      refresh();
    } finally {
      setLoadingAction('');
    }
  };

  if (!application) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无合约号码配给主管审批待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const historyColumns = [
    { title: '申请人/审批人', dataIndex: 'person', width: 190 },
    { title: '审批环节', dataIndex: 'node', width: 180 },
    { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">合约号码配给主管审批</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">{application.applicant.name}（{application.applicant.id}）</Descriptions.Item>
            <Descriptions.Item label="部门">{formatDepartment(application.applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="职级">{application.applicant.level || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{application.applicant.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="分机">{application.applicant.extension || '-'}</Descriptions.Item>
            <Descriptions.Item label="入职时间">{application.applicant.entryTime || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请原因" span={3}>{application.applyReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="身份证号码">{application.idCard || '-'}</Descriptions.Item>
            <Descriptions.Item label="附件" span={2}>
              {application.attachment ? (
                <Button
                  type="link"
                  size="small"
                  className="px-0"
                  onClick={() => downloadAttachment(application.attachment)}
                >
                  {application.attachment.name}
                </Button>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title={<SectionTitle>号码配给</SectionTitle>}>
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="电话号码">
              {application.assignedNumber?.phoneNumber || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="话费套餐">
              {application.assignedNumber?.packageName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="附件信息" span={3}>
              {application.allocationAttachment?.name || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title={<SectionTitle>审批信息</SectionTitle>}>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={historyColumns}
            dataSource={historyRecords}
            pagination={false}
          />

          <div className="mt-4">
            <Typography.Text strong>审批意见</Typography.Text>
            <TextArea
              className="mt-2"
              rows={3}
              maxLength={1000}
              showCount
              value={comment}
              placeholder="同意时可不填写，驳回时必填"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <Button
              type="primary"
              loading={loadingAction === '同意'}
              onClick={() => decide('同意')}
            >
              同意
            </Button>
            <Button
              danger
              loading={loadingAction === '驳回'}
              onClick={() => decide('驳回')}
            >
              驳回
            </Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </>
  );
}
