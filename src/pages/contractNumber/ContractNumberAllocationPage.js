import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Table,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import { CONTRACT_NUMBER_CANDIDATES } from '../../mock/contractNumberAllocationMock';
import {
  getCurrentContractNumberAllocation,
  updateContractNumberAllocation,
} from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';
import ContractNumberSelectModal from './ContractNumberSelectModal';

const { TextArea } = Input;
const DESCRIPTION_LABEL_STYLE = { width: '10%', minWidth: 96, whiteSpace: 'nowrap' };
const DESCRIPTION_CONTENT_STYLE = { width: '23.3333%' };

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

function RequiredLabel({ children }) {
  return (
    <span>
      <span className="mr-1 text-red-500">*</span>
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

function DetailDescriptions({ children }) {
  return (
    <Descriptions
      bordered
      size="small"
      column={3}
      labelStyle={DESCRIPTION_LABEL_STYLE}
      contentStyle={DESCRIPTION_CONTENT_STYLE}
    >
      {children}
    </Descriptions>
  );
}

export default function ContractNumberAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getCurrentContractNumberAllocation());
  const [selectOpen, setSelectOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  const refresh = () => setApplication(getCurrentContractNumberAllocation());

  const historyRecords = useMemo(() => {
    if (!application) return [];
    return [...(application.history || []), ...(application.delayRecords || [])];
  }, [application]);

  const chooseNumber = (number) => {
    if (!application || !number) return;
    updateContractNumberAllocation(application.id, { assignedNumber: number });
    messageApi.success(`已选择合约号码 ${number.phoneNumber}`);
    setSelectOpen(false);
    refresh();
  };

  const uploadAllocationAttachment = (file) => {
    if (!application || !file) return Upload.LIST_IGNORE;
    updateContractNumberAllocation(application.id, {
      allocationAttachment: {
        id: `allocation-attachment-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
    messageApi.success('附件上传成功');
    refresh();
    return Upload.LIST_IGNORE;
  };

  const decide = (action) => {
    if (!application || application.status !== '待审批') return;
    if (action === '同意' && !application.assignedNumber) {
      messageApi.warning('请先选择电话号码');
      return;
    }
    if (action === '同意' && !application.allocationAttachment) {
      messageApi.warning('请先上传附件信息');
      return;
    }
    if (action !== '同意' && !comment.trim()) {
      messageApi.warning(`${action}时审批意见必填`);
      return;
    }

    setLoadingAction(action);
    try {
      updateContractNumberAllocation(application.id, (record) => {
        if (action === '延期') {
          return {
            ...record,
            delayRecords: [
              ...(record.delayRecords || []),
              {
                id: `delay-${Date.now()}`,
                person: '孙志强(213852)',
                node: 'ES审批延期',
                time: nowText(),
                status: '已延期',
                comment: comment.trim(),
              },
            ],
          };
        }

        const approved = action === '同意';
        return {
          ...record,
          status: approved ? '待审批' : '已驳回',
          currentNode: approved ? '合约号码配给主管审批' : '结束',
          history: record.history.map((item) => (
            item.node === 'ES审批' && item.status === '待审批'
              ? {
                ...item,
                status: approved ? '已同意' : '已驳回',
                time: nowText(),
                comment: comment.trim() || '同意',
              }
              : item
          )).concat(approved ? [{
            id: `supervisor-${Date.now()}`,
            person: '配给主管',
            node: '合约号码配给主管审批',
            time: '',
            status: '待审批',
            comment: '',
          }] : []),
        };
      });
      messageApi.success(action === '同意' ? '配给信息已提交主管审批' : action === '驳回' ? '申请已驳回' : '已记录延期处理');
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
          <Empty description="暂无合约号码 ES 配给待办" />
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
          <Typography.Title level={4} className="mb-0">合约号码 ES 配给</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailDescriptions>
            <Descriptions.Item label="申请人">{application.applicant.name}（{application.applicant.id}）</Descriptions.Item>
            <Descriptions.Item label="部门">{formatDepartment(application.applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="职级">{application.applicant.level || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{application.applicant.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="分机">{application.applicant.extension || '-'}</Descriptions.Item>
            <Descriptions.Item label="入职时间">{application.applicant.entryTime || '-'}</Descriptions.Item>
          </DetailDescriptions>
        </Card>

        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <DetailDescriptions>
            <Descriptions.Item label="申请原因" span={3}>{application.applyReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="身份证号码">{application.idCard || '-'}</Descriptions.Item>
            <Descriptions.Item label="附件">
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
          </DetailDescriptions>
        </Card>

        <Card size="small" title={<SectionTitle>号码配给</SectionTitle>}>
          <DetailDescriptions>
            <Descriptions.Item label={<RequiredLabel>电话号码</RequiredLabel>}>
              <Input.Search
                readOnly
                value={application.assignedNumber?.phoneNumber || ''}
                placeholder="请选择电话号码"
                enterButton="选择号码"
                disabled={application.status !== '待审批'}
                style={{ maxWidth: 320 }}
                onSearch={() => setSelectOpen(true)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="话费套餐">
              {application.assignedNumber?.packageName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<RequiredLabel>附件信息</RequiredLabel>} span={3}>
              <Space size={12} wrap>
                <Upload
                  maxCount={1}
                  showUploadList={false}
                  disabled={application.status !== '待审批'}
                  beforeUpload={uploadAllocationAttachment}
                >
                  <Button icon={<UploadCloud size={14} />} disabled={application.status !== '待审批'}>
                    {application.allocationAttachment ? '重新上传' : '上传附件'}
                  </Button>
                </Upload>
                <Typography.Text type={application.allocationAttachment ? undefined : 'secondary'}>
                  {application.allocationAttachment?.name || '未上传附件'}
                </Typography.Text>
              </Space>
            </Descriptions.Item>
          </DetailDescriptions>
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
              disabled={application.status !== '待审批'}
              placeholder="同意时可不填写，驳回或延期时必填"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <Button
              type="primary"
              loading={loadingAction === '同意'}
              disabled={application.status !== '待审批'}
              onClick={() => decide('同意')}
            >
              同意
            </Button>
            <Button
              danger
              loading={loadingAction === '驳回'}
              disabled={application.status !== '待审批'}
              onClick={() => decide('驳回')}
            >
              驳回
            </Button>
            <Button
              loading={loadingAction === '延期'}
              disabled={application.status !== '待审批'}
              onClick={() => decide('延期')}
            >
              延期
            </Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <ContractNumberSelectModal
        open={selectOpen}
        candidates={CONTRACT_NUMBER_CANDIDATES}
        value={application.assignedNumber}
        onCancel={() => setSelectOpen(false)}
        onConfirm={chooseNumber}
      />
    </>
  );
}
