import React, { useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import {
  getAssetReplacementApplications,
  getPendingHandlingApplications,
} from '../../services/assetReplacementService';
import ReplacementHandlingDetail from './ReplacementHandlingDetail';

const EMPTY_QUERY = { applicationId: '', assetTag: '', applicant: '', currentNode: '' };

export default function ReplacementHandlingPage() {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const pendingApplications = useMemo(() => getPendingHandlingApplications(), [refreshKey]);
  const allApplications = useMemo(() => getAssetReplacementApplications(), [refreshKey]);
  const selectedApplication = selectedId ? allApplications.find((item) => item.id === selectedId) : null;

  const filteredApplications = useMemo(() => pendingApplications.filter((application) => (
    (!appliedQuery.applicationId || application.id.toLowerCase().includes(appliedQuery.applicationId.toLowerCase()))
    && (!appliedQuery.assetTag || application.oldAsset.assetTag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.applicant || `${application.applicant.id}${application.applicant.name}`.toLowerCase().includes(appliedQuery.applicant.toLowerCase()))
    && (!appliedQuery.currentNode || application.currentNode === appliedQuery.currentNode)
  )), [pendingApplications, appliedQuery]);

  const columns = [
    { title: '申请单号', dataIndex: 'id', width: 180 },
    { title: '申请人', width: 170, render: (_, record) => `${record.applicant.id}-${record.applicant.name}` },
    { title: '旧资产标签号', width: 150, render: (_, record) => record.oldAsset.assetTag },
    { title: '旧资产说明', width: 260, render: (_, record) => record.oldAsset.assetDesc },
    { title: 'MIS鉴定结果', width: 120, render: (_, record) => <Tag color="success">{record.mis.result}</Tag> },
    { title: '旧资产入库状态', width: 130, render: (_, record) => record.returnProcess.inboundStatus },
    { title: '待发放新资产', width: 160, render: (_, record) => record.newAsset?.assetTag || '-' },
    { title: '当前节点', dataIndex: 'currentNode', width: 120, render: (value) => <Tag color="processing">{value}</Tag> },
    { title: '操作', width: 90, render: (_, record) => <Button type="link" className="px-0" onClick={() => setSelectedId(record.id)}>办理</Button> },
  ];

  if (selectedApplication) {
    return (
      <ReplacementHandlingDetail
        application={selectedApplication}
        onBack={() => setSelectedId(null)}
        onUpdated={(applicationId, closeAfter) => {
          setRefreshKey((value) => value + 1);
          if (closeAfter) setSelectedId(null);
          else setSelectedId(applicationId);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产更换库管员待办</Typography.Title>
          <Typography.Text type="secondary">同一页面分阶段办理旧资产退回和新资产发放</Typography.Text>
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
            <QueryItem label="旧资产标签号"><Input allowClear value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
            <QueryItem label="申请人"><Input allowClear value={query.applicant} placeholder="姓名或工号" onChange={(event) => setQuery({ ...query, applicant: event.target.value })} /></QueryItem>
            <QueryItem label="当前节点"><Select allowClear value={query.currentNode || undefined} options={[...new Set(pendingApplications.map((item) => item.currentNode))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, currentNode: value || '' })} /></QueryItem>
          </QueryBar>
        </Card>
        <Card title="待办理申请" size="small">
          <Table rowKey="id" columns={columns} dataSource={filteredApplications} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1400 }} locale={{ emptyText: <Empty description="暂无资产更换待办" /> }} />
        </Card>
      </Space>
    </div>
  );
}
