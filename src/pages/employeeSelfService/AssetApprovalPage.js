import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
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
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getEmployeeSelfServiceApplications());
  const [selectedId, setSelectedId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [comment, setComment] = useState('同意');
  const [loading, setLoading] = useState(false);

  const selectedApplication = applications.find((item) => item.id === selectedId);
  const filteredApplications = useMemo(() => applications.filter((item) => {
    const text = queryKeyword.trim().toLowerCase();
    if (!text) return true;
    return item.id.toLowerCase().includes(text)
      || item.applicant.name.toLowerCase().includes(text)
      || item.currentNode.toLowerCase().includes(text);
  }), [applications, queryKeyword]);

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

  const listColumns = [
    { title: '申请单号', dataIndex: 'id', width: 200 },
    { title: '申请人', dataIndex: ['applicant', 'name'], width: 120 },
    { title: '申请日期', dataIndex: 'applyDate', width: 120 },
    {
      title: '申请数量',
      width: 100,
      align: 'center',
      render: (_, record) => record.materials.reduce((sum, item) => sum + item.quantity, 0),
    },
    {
      title: '当前节点',
      dataIndex: 'currentNode',
      width: 160,
      render: (value) => <Tag color={value === '资产配给' ? 'success' : 'processing'}>{value}</Tag>,
    },
    { title: '任务状态', dataIndex: 'taskStatus', width: 120 },
    {
      title: '操作',
      width: 100,
      align: 'center',
      render: (_, record) => <Button type="link" onClick={() => setSelectedId(record.id)}>处理</Button>,
    },
  ];

  const materialColumns = [
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '申请原因', dataIndex: 'reason', width: 130 },
    { title: '申请用途', dataIndex: 'purpose', width: 130 },
    { title: '详细说明', dataIndex: 'detail' },
    {
      title: '个人超标',
      dataIndex: 'overStandard',
      width: 100,
      align: 'center',
      render: (value) => value ? <Tag color="error">已超标</Tag> : <Tag>未超标</Tag>,
    },
  ];

  if (!selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar
          onQuery={() => setQueryKeyword(keyword)}
          onReset={() => { setKeyword(''); setQueryKeyword(''); }}
        >
          <QueryItem label="申请单号/人员">
            <Input value={keyword} placeholder="请输入关键字" onChange={(event) => setKeyword(event.target.value)} />
          </QueryItem>
        </QueryBar>
        <Card title="员工自助新版-资产申请审批">
          <Table rowKey="id" columns={listColumns} dataSource={filteredApplications} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    );
  }

  const canApprove = selectedApplication.status === '处理中' && selectedApplication.currentNode !== '资产配给';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div>
          <Button icon={<ArrowLeft size={14} />} onClick={() => setSelectedId('')}>返回列表</Button>
        </div>
        <Alert
          type={selectedApplication.materials.some((item) => item.overStandard) ? 'warning' : 'info'}
          showIcon
          message={`申请单号：${selectedApplication.id}；当前节点：${selectedApplication.currentNode}`}
          description={selectedApplication.materials.some((item) => item.overStandard)
            ? '该申请包含个人超标资产，必须经过直属领导、5级及以上领导和7级及以上领导审批。'
            : '该申请未发生个人超标。'}
        />
        <ApplicantInfoCard applicant={selectedApplication.applicant} applyDate={selectedApplication.applyDate} />
        <Card title="申请资产信息" size="small">
          <Table rowKey="id" columns={materialColumns} dataSource={selectedApplication.materials} pagination={false} scroll={{ x: 1000 }} />
        </Card>
        <ApprovalHistoryCard records={selectedApplication.approvalHistory} />
        {canApprove && (
          <Card title="当前审批操作" size="small">
            <TextArea rows={3} value={comment} placeholder="驳回时必填" onChange={(event) => setComment(event.target.value)} />
            <div className="mt-4 flex justify-center gap-3">
              <Button danger icon={<XCircle size={14} />} loading={loading} onClick={() => handleDecision('驳回')}>驳回</Button>
              <Button type="primary" icon={<CheckCircle2 size={14} />} loading={loading} onClick={() => handleDecision('同意')}>同意</Button>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
}
