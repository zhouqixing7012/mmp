import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
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
const DETAIL_LABEL_WIDTH = 96;
const DETAIL_BORDER_COLOR = '#f0f0f0';

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

function DetailTable({ children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: DETAIL_LABEL_WIDTH }} />
          <col />
          <col style={{ width: DETAIL_LABEL_WIDTH }} />
          <col />
          <col style={{ width: DETAIL_LABEL_WIDTH }} />
          <col />
        </colgroup>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function DetailLabel({ children }) {
  return (
    <th
      style={{
        padding: '8px 12px',
        border: `1px solid ${DETAIL_BORDER_COLOR}`,
        background: '#fafafa',
        fontWeight: 400,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </th>
  );
}

function DetailValue({ children, colSpan = 1 }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '8px 12px',
        border: `1px solid ${DETAIL_BORDER_COLOR}`,
        background: '#fff',
        verticalAlign: 'middle',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </td>
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
          <DetailTable>
            <tr>
              <DetailLabel>申请人</DetailLabel>
              <DetailValue>{application.applicant.name}（{application.applicant.id}）</DetailValue>
              <DetailLabel>部门</DetailLabel>
              <DetailValue>{formatDepartment(application.applicant.department)}</DetailValue>
              <DetailLabel>职级</DetailLabel>
              <DetailValue>{application.applicant.level || '-'}</DetailValue>
            </tr>
            <tr>
              <DetailLabel>手机</DetailLabel>
              <DetailValue>{application.applicant.phone || '-'}</DetailValue>
              <DetailLabel>分机</DetailLabel>
              <DetailValue>{application.applicant.extension || '-'}</DetailValue>
              <DetailLabel>入职时间</DetailLabel>
              <DetailValue>{application.applicant.entryTime || '-'}</DetailValue>
            </tr>
          </DetailTable>
        </Card>

        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <DetailTable>
            <tr>
              <DetailLabel>申请原因</DetailLabel>
              <DetailValue colSpan={5}>{application.applyReason || '-'}</DetailValue>
            </tr>
            <tr>
              <DetailLabel>身份证号码</DetailLabel>
              <DetailValue>{application.idCard || '-'}</DetailValue>
              <DetailLabel>附件</DetailLabel>
              <DetailValue colSpan={3}>
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
              </DetailValue>
            </tr>
          </DetailTable>
        </Card>

        <Card size="small" title={<SectionTitle>号码配给</SectionTitle>}>
          <DetailTable>
            <tr>
              <DetailLabel>电话号码</DetailLabel>
              <DetailValue>{application.assignedNumber?.phoneNumber || '-'}</DetailValue>
              <DetailLabel>话费套餐</DetailLabel>
              <DetailValue colSpan={3}>{application.assignedNumber?.packageName || '-'}</DetailValue>
            </tr>
            <tr>
              <DetailLabel>附件信息</DetailLabel>
              <DetailValue colSpan={5}>{application.allocationAttachment?.name || '-'}</DetailValue>
            </tr>
          </DetailTable>
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
