import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Card, Descriptions, Empty, Input, Radio, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import ApplicantInfoCard from '../employeeSelfService/ApplicantInfoCard';
import { getPendingMisApplications, submitMisDecision } from '../../services/assetReplacementService';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;
const EMPTY_QUERY = { applicationId: '', assetTag: '', applicant: '' };

export default function ReplacementMisPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [result, setResult] = useState('资产更换');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('同意');
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState(() => getPendingMisApplications());

  const filteredApplications = useMemo(() => applications.filter((application) => (
    (!appliedQuery.applicationId || application.id.toLowerCase().includes(appliedQuery.applicationId.toLowerCase()))
    && (!appliedQuery.assetTag || application.oldAsset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.applicant || `${application.applicant.id}${application.applicant.name}`.toLowerCase().includes(appliedQuery.applicant.toLowerCase()))
  )), [applications, appliedQuery]);

  const openApplication = (application) => {
    setSelectedApplication(application);
    setResult('资产更换');
    setDescription('');
    setComment('同意');
  };

  const submitDecision = (decision) => {
    if (!selectedApplication) return;
    if (!description.trim()) {
      messageApi.warning('请填写鉴定说明');
      return;
    }
    if (decision === '同意' && result !== '资产更换') {
      messageApi.warning('鉴定结果为资产更换时方可同意');
      return;
    }
    if (decision === '驳回' && result === '资产更换') {
      messageApi.warning('资产更换需选择同意');
      return;
    }
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }

    setSubmitting(true);
    try {
      submitMisDecision(selectedApplication.id, {
        result,
        description: description.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(decision === '同意' ? 'MIS鉴定已通过，单据进入资产更换办理' : '申请已驳回并结束流程');
      setSelectedApplication(null);
      setApplications(getPendingMisApplications());
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '申请单号', dataIndex: 'id', width: 180 },
    { title: '申请人', width: 160, render: (_, record) => `${record.applicant.id}-${record.applicant.name}` },
    { title: '办公区', width: 180, render: (_, record) => record.applicant.officeArea },
    { title: '旧资产标签号', width: 150, render: (_, record) => record.oldAsset.assetTag },
    { title: '资产说明', width: 260, render: (_, record) => record.oldAsset.assetDesc },
    { title: '申请时间', dataIndex: 'applyTime', width: 180 },
    { title: '当前节点', dataIndex: 'currentNode', width: 110, render: (value) => <Tag color="processing">{value}</Tag> },
    { title: '操作', width: 90, render: (_, record) => <Button type="link" className="px-0" onClick={() => openApplication(record)}>鉴定</Button> },
  ];

  if (selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Space direction="vertical" size={16} className="w-full">
          <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
            <Space>
              <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => setSelectedApplication(null)}>返回待办</Button>
              <Typography.Title level={4} className="mb-0">MIS鉴定</Typography.Title>
            </Space>
            <Typography.Text type="secondary">申请单号：{selectedApplication.id}</Typography.Text>
          </div>

          <ApplicantInfoCard applicant={selectedApplication.applicant} applyDate={selectedApplication.applyDate} />

          <Card title="更换原因" size="small">
            <Typography.Paragraph className="mb-0">{selectedApplication.reason}</Typography.Paragraph>
          </Card>

          <Card title="更换物资信息" size="small">
            <Descriptions bordered size="small" column={4}>
              <Descriptions.Item label="资产标签号">{selectedApplication.oldAsset.assetTag}</Descriptions.Item>
              <Descriptions.Item label="资产说明">{selectedApplication.oldAsset.assetDesc}</Descriptions.Item>
              <Descriptions.Item label="配置">{selectedApplication.oldAsset.config}</Descriptions.Item>
              <Descriptions.Item label="耗材信息">{selectedApplication.oldAsset.consumables}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="MIS鉴定处理" size="small">
            <Space direction="vertical" size={16} className="w-full">
              <div>
                <Typography.Text strong><span className="text-red-500">*</span> 鉴定结果：</Typography.Text>
                <Radio.Group
                  className="ml-3"
                  value={result}
                  options={['资产维修', '资产更换', '员工取消'].map((value) => ({ label: value, value }))}
                  onChange={(event) => {
                    setResult(event.target.value);
                    setComment(event.target.value === '资产更换' ? '同意' : '');
                  }}
                />
              </div>
              <div>
                <Typography.Text strong><span className="text-red-500">*</span> 鉴定说明：</Typography.Text>
                <TextArea className="mt-2" rows={3} maxLength={60} showCount value={description} placeholder="请填写鉴定说明（60字以内）" onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div>
                <Typography.Text strong>审批意见：</Typography.Text>
                <TextArea className="mt-2" rows={3} maxLength={400} showCount value={comment} placeholder="同意时默认同意，驳回时必填" onChange={(event) => setComment(event.target.value)} />
              </div>
              <div className="flex justify-center gap-3">
                <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={() => submitDecision('同意')}>同意</Button>
                <Button danger icon={<XCircle size={14} />} loading={submitting} onClick={() => submitDecision('驳回')}>驳回</Button>
                <Button onClick={() => setSelectedApplication(null)}>返回</Button>
              </div>
            </Space>
          </Card>

          <ReplacementHistoryCard records={selectedApplication.history} />
        </Space>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">MIS鉴定待办</Typography.Title>
          <Typography.Text type="secondary">按申请人办公区匹配，暂无本地 MIS 时流转北京 MIS</Typography.Text>
        </div>
        <Card size="small">
          <QueryBar
            onQuery={() => setAppliedQuery(query)}
            onReset={() => {
              setQuery(EMPTY_QUERY);
              setAppliedQuery(EMPTY_QUERY);
            }}
          >
            <QueryItem label="申请单号"><Input allowClear value={query.applicationId} onChange={(event) => setQuery({ ...query, applicationId: event.target.value })} /></QueryItem>
            <QueryItem label="资产标签号"><Input allowClear value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
            <QueryItem label="申请人"><Input allowClear value={query.applicant} placeholder="姓名或工号" onChange={(event) => setQuery({ ...query, applicant: event.target.value })} /></QueryItem>
          </QueryBar>
        </Card>
        <Card title="待鉴定申请" size="small">
          <Table rowKey="id" columns={columns} dataSource={filteredApplications} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1300 }} locale={{ emptyText: <Empty description="暂无待鉴定申请" /> }} />
        </Card>
      </Space>
    </div>
  );
}
