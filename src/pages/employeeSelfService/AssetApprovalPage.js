import React, { useMemo, useState } from 'react';
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
import StatusTag from '../../components/StatusTag';
import { CURRENT_EMPLOYEE } from '../../mock/employeeSelfServiceMock';
import {
  getEmployeeSelfServiceApplications,
  updateEmployeeSelfServiceApplication,
} from '../../services/employeeSelfServiceService';
import ApplicantInfoCard from './ApplicantInfoCard';
import ApprovalHistoryCard from './ApprovalHistoryCard';

const { TextArea } = Input;

const NODE_PERSON = {
  直属领导: CURRENT_EMPLOYEE.directLeader,
  '5级及以上领导': CURRENT_EMPLOYEE.level5Leader,
  '7级及以上领导': CURRENT_EMPLOYEE.level7Leader,
  '逐级审批至VP/CFO': '110001-逐级审批人',
};

function nowText() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

export default function EmployeeAssetApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getEmployeeSelfServiceApplications());
  const [comment, setComment] = useState('同意');
  const [loading, setLoading] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');

  const selectedApplication = useMemo(() => (
    applications.find((item) => item.status === '处理中' && item.currentNode !== '资产配给')
      || applications[0]
  ), [applications]);

  const refresh = () => setApplications(getEmployeeSelfServiceApplications());

  const handleDecision = (decision) => {
    if (!selectedApplication) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }

    setLoading(true);
    try {
      updateEmployeeSelfServiceApplication(selectedApplication.id, (application) => {
        const history = application.approvalHistory.map((record) => (
          record.status === '待审批'
            ? { ...record, status: decision === '同意' ? '已同意' : '已驳回', time: nowText(), comment: comment || '同意' }
            : record
        ));

        if (decision === '驳回') {
          return {
            ...application,
            status: '已驳回',
            taskStatus: '已驳回',
            currentNode: '申请人',
            approvalHistory: history,
          };
        }

        const currentIndex = application.approvalRoute.indexOf(application.currentNode);
        const nextNode = application.approvalRoute[currentIndex + 1];
        if (!nextNode) {
          return {
            ...application,
            status: '处理中',
            taskStatus: '待配给',
            currentNode: '资产配给',
            approvalHistory: history,
          };
        }

        return {
          ...application,
          currentNode: nextNode,
          approvalHistory: [
            ...history,
            {
              node: nextNode,
              person: NODE_PERSON[nextNode] || '待匹配审批人',
              status: '待审批',
              time: '-',
              comment: '-',
            },
          ],
        };
      });
      refresh();
      setComment('同意');
      messageApi.success(decision === '同意' ? '审批已通过并进入下一节点' : '申请已驳回');
    } finally {
      setLoading(false);
    }
  };

  const handleCountersign = () => {
    if (!countersignPerson.trim()) {
      messageApi.warning('请输入加签人员');
      return;
    }
    messageApi.success(`已加签：${countersignPerson.trim()}`);
    setCountersignPerson('');
    setCountersignOpen(false);
  };

  const materialColumns = [
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '申请用途', dataIndex: 'purpose', width: 140 },
    { title: '详细说明', dataIndex: 'detail' },
    {
      title: '是否超标',
      dataIndex: 'overStandard',
      width: 100,
      align: 'center',
      render: (value) => <StatusTag value={value ? '已超标' : '未超标'} type="business" />,
    },
  ];

  if (!selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待审批申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const canApprove = selectedApplication.status === '处理中' && selectedApplication.currentNode !== '资产配给';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产申请审批</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selectedApplication.id}</Typography.Text>
        </div>

        <ApplicantInfoCard applicant={selectedApplication.applicant} applyDate={selectedApplication.applyDate} />

        <Card title="申请资产信息" size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={materialColumns}
            dataSource={selectedApplication.materials}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>

        <ApprovalHistoryCard records={selectedApplication.approvalHistory} />

        {canApprove && (
          <Card title="当前审批操作" size="small">
            <TextArea rows={3} value={comment} placeholder="驳回时必填" onChange={(event) => setComment(event.target.value)} />
            <div className="mt-4 flex justify-center gap-3">
              <Button type="primary" loading={loading} onClick={() => handleDecision('同意')}>同意</Button>
              <Button danger loading={loading} onClick={() => handleDecision('驳回')}>驳回</Button>
              <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
              <Button onClick={() => setCountersignOpen(true)}>加签</Button>
            </div>
          </Card>
        )}
      </Space>

      <Modal
        title="加签"
        open={countersignOpen}
        onOk={handleCountersign}
        onCancel={() => {
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
        okText="确认加签"
        cancelText="取消"
      >
        <Input
          value={countersignPerson}
          placeholder="请输入加签人员姓名或工号"
          onChange={(event) => setCountersignPerson(event.target.value)}
        />
      </Modal>
    </div>
  );
}
