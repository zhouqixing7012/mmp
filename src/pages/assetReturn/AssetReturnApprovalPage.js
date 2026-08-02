import React, { useMemo, useState } from 'react';
import { CheckCircle2, UserPlus, XCircle } from 'lucide-react';
import { Button, Card, Empty, Input, Radio, Space, Table, Tabs, Tag, Typography, message as antdMessage } from 'antd';
import {
  getAssetReturnApplications,
  submitAssetReturnLeaderDecision,
  submitAssetReturnMisDecision,
} from '../../services/assetReturnService';

const { TextArea } = Input;

function DetailCard({ application }) {
  if (!application) return null;
  const columns = [
    { title: '资产标签号', width: 150, render: () => application.asset.assetTag },
    { title: '资产说明', width: 240, render: () => application.asset.assetDesc },
    { title: '配置', width: 240, render: () => application.asset.config || '无' },
    { title: '数量', width: 70, align: 'center', render: () => application.asset.quantity },
    { title: '资产状态', width: 130, render: () => <Tag color="success">{application.asset.status}</Tag> },
    { title: '资产用途', width: 110, render: () => application.asset.purpose },
    { title: '部件数量', width: 90, align: 'center', render: () => (application.asset.component && application.asset.component !== '-' ? 1 : 0) },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card size="small" title="申请人信息">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
          <div><Typography.Text type="secondary">申请人：</Typography.Text>{application.applicant.name}-{application.applicant.id}</div>
          <div><Typography.Text type="secondary">公司：</Typography.Text>{application.applicant.company}</div>
          <div><Typography.Text type="secondary">部门：</Typography.Text>{application.applicant.department}</div>
          <div><Typography.Text type="secondary">办公区：</Typography.Text>{application.applicant.officeArea}</div>
          <div><Typography.Text type="secondary">联系电话：</Typography.Text>{application.applicant.phone}</div>
          <div><Typography.Text type="secondary">申请时间：</Typography.Text>{application.applyTime}</div>
        </div>
      </Card>
      <Card size="small" title="退库资产信息">
        <Table rowKey="id" columns={columns} dataSource={[application.asset]} pagination={false} scroll={{ x: 1100 }} />
        {application.relatedConsumables.length > 0 && (
          <div className="mt-3"><Typography.Text strong>关联升级耗材：</Typography.Text>{application.relatedConsumables.map((item) => <Tag key={item.assetTag} color="blue">{item.assetTag} {item.assetDesc}</Tag>)}</div>
        )}
      </Card>
      <Card size="small" title="退库原因"><Typography.Paragraph className="mb-0">{application.reason}</Typography.Paragraph></Card>
    </Space>
  );
}

export default function AssetReturnApprovalPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [activeTab, setActiveTab] = useState('leader');
  const [selectedId, setSelectedId] = useState('');
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [misResult, setMisResult] = useState('鉴定通过');
  const [misDescription, setMisDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const list = applications.filter((item) => item.status === '处理中' && item.currentNode === (activeTab === 'leader' ? '领导审批' : 'MIS鉴定'));
  const selected = applications.find((item) => item.id === selectedId) || null;

  const columns = [
    { title: '申请单号', dataIndex: 'id', width: 180 },
    { title: '申请人', width: 120, render: (_, record) => `${record.applicant.name}-${record.applicant.id}` },
    { title: '资产标签号', width: 150, render: (_, record) => record.asset.assetTag },
    { title: '资产说明', width: 250, render: (_, record) => record.asset.assetDesc },
    { title: '资产用途', width: 110, render: (_, record) => record.asset.purpose },
    { title: '申请时间', dataIndex: 'applyTime', width: 170 },
    { title: '操作', width: 90, render: (_, record) => <Button type="link" onClick={() => { setSelectedId(record.id); setComment(''); setMisDescription(''); setMisResult('鉴定通过'); }}>处理</Button> },
  ];

  const submit = async (decision) => {
    if (!selected) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时请填写审批意见');
      return;
    }
    if (activeTab === 'mis') {
      if (decision === '同意' && misResult !== '鉴定通过') {
        messageApi.warning('鉴定结果为鉴定通过时方可同意');
        return;
      }
      if (decision === '驳回' && misResult !== '鉴定不通过') {
        messageApi.warning('鉴定结果为鉴定不通过时方可驳回');
        return;
      }
      if (misResult === '鉴定不通过' && !misDescription.trim()) {
        messageApi.warning('鉴定不通过时请填写鉴定说明');
        return;
      }
    }
    setLoading(true);
    try {
      if (activeTab === 'leader') {
        submitAssetReturnLeaderDecision(selected.id, decision, comment.trim());
      } else {
        submitAssetReturnMisDecision(selected.id, { result: misResult, description: misDescription.trim(), decision, comment: comment.trim() });
      }
      messageApi.success(decision === '同意' ? '审批已同意' : '退库申请已驳回');
      setSelectedId('');
      setComment('');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Space direction="vertical" size={16} className="w-full">
          <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm"><Typography.Title level={4} className="mb-0">{activeTab === 'leader' ? '直属领导审批' : 'MIS 鉴定'}</Typography.Title><Typography.Text type="secondary">申请单号：{selected.id}</Typography.Text></div>
          <DetailCard application={selected} />
          {activeTab === 'mis' && (
            <Card size="small" title="MIS 鉴定处理">
              <div><Typography.Text strong><span className="text-red-500">*</span> 鉴定结果：</Typography.Text><Radio.Group className="ml-4" value={misResult} options={['鉴定通过', '鉴定不通过'].map((value) => ({ label: value, value }))} onChange={(event) => setMisResult(event.target.value)} /></div>
              <div className="mt-4"><Typography.Text strong>鉴定说明：</Typography.Text><TextArea className="mt-2" rows={3} maxLength={400} showCount value={misDescription} onChange={(event) => setMisDescription(event.target.value)} /></div>
            </Card>
          )}
          <Card size="small" title="审批操作">
            <TextArea rows={3} maxLength={400} showCount value={comment} placeholder="同意时非必填，驳回时必填" onChange={(event) => setComment(event.target.value)} />
            <div className="mt-4 flex justify-center gap-3">
              <Button type="primary" icon={<CheckCircle2 size={14} />} loading={loading} onClick={() => submit('同意')}>同意</Button>
              <Button danger icon={<XCircle size={14} />} loading={loading} onClick={() => submit('驳回')}>驳回</Button>
              <Button onClick={() => setSelectedId('')}>返回</Button>
              <Button icon={<UserPlus size={14} />} onClick={() => messageApi.success('已模拟发起加签')}>加签</Button>
            </div>
          </Card>
        </Space>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Card size="small" title="资产退库审批">
        <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setSelectedId(''); }} items={[
          { key: 'leader', label: '领导审批', children: <Table rowKey="id" columns={columns} dataSource={list} pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="暂无领导审批待办" /> }} scroll={{ x: 1100 }} /> },
          { key: 'mis', label: 'MIS鉴定', children: <Table rowKey="id" columns={columns} dataSource={list} pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="暂无MIS鉴定待办" /> }} scroll={{ x: 1100 }} /> },
        ]} />
      </Card>
    </div>
  );
}
