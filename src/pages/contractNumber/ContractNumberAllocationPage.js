import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Steps,
  Table,
  Typography,
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

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
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

  const decide = (action) => {
    if (!application || application.status !== '待审批') return;
    if (action === '同意' && !application.assignedNumber) {
      messageApi.warning('请先选择电话号码');
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
          status: approved ? '已完成' : '已驳回',
          currentNode: '结束',
          history: record.history.map((item) => (
            item.node === 'ES审批' && item.status === '待审批'
              ? {
                ...item,
                status: approved ? '已同意' : '已驳回',
                time: nowText(),
                comment: comment.trim() || '同意',
              }
              : item
          )),
        };
      });
      messageApi.success(action === '同意' ? '合约号码配给审批已通过' : action === '驳回' ? '申请已驳回' : '已记录延期处理');
      setComment('');
      refresh();
    } finally {
      setLoadingAction('');
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无合约号码 ES 配给待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const historyColumns = [
    { title: '申请人/审批人', dataIndex: 'person', width: 190 },
    { title: '审批环节', dataIndex: 'node', width: 160 },
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

  const finished = application.status === '已完成';
  const rejected = application.status === '已驳回';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">合约号码 ES 配给</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title="申请人信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">{application.applicant.name}（{application.applicant.id}）</Descriptions.Item>
            <Descriptions.Item label="部门">{formatDepartment(application.applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="职级">{application.applicant.level || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{application.applicant.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="分机">{application.applicant.extension || '-'}</Descriptions.Item>
            <Descriptions.Item label="入职时间">{application.applicant.entryTime || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="申请信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请原因" span={3}>{application.applyReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="身份证号码" span={3}>{application.idCard || '-'}</Descriptions.Item>
          </Descriptions>
          <Typography.Paragraph type="danger" strong className="mb-0 mt-3">
            {application.notice}
          </Typography.Paragraph>
        </Card>

        <Card size="small" title="号码配给">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="电话号码" span={2}>
              <Input.Search
                readOnly
                value={application.assignedNumber?.phoneNumber || ''}
                placeholder="请选择电话号码"
                enterButton="选择号码"
                disabled={application.status !== '待审批'}
                onSearch={() => setSelectOpen(true)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="话费套餐">
              {application.assignedNumber?.packageName || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="审批信息">
          <Steps
            className="mb-5"
            size="small"
            current={finished ? 3 : 2}
            status={rejected ? 'error' : finished ? 'finish' : 'process'}
            items={[
              { title: '开始', description: application.applicant.name },
              { title: '申请人确认', description: application.applicant.name },
              { title: 'ES审批', description: '孙志强' },
              { title: '结束' },
            ]}
          />

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
    </div>
  );
}
