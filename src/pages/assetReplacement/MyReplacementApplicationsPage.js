import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Card, DatePicker, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { getAssetReplacementApplications } from '../../services/assetReplacementService';
import ReplacementDetailModal from './ReplacementDetailModal';

const { RangePicker } = DatePicker;
const EMPTY_QUERY = { applicationId: '', oldAssetTag: '', status: '', currentNode: '', applyRange: null };
const STATUS_COLOR = { 处理中: 'processing', 已完成: 'success', 已驳回: 'error' };

export default function MyReplacementApplicationsPage() {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [detailApplication, setDetailApplication] = useState(null);
  const [applications, setApplications] = useState(() => getAssetReplacementApplications());

  const filteredApplications = useMemo(() => applications.filter((application) => {
    const inRange = !appliedQuery.applyRange || (
      dayjs(application.applyDate).isAfter(appliedQuery.applyRange[0].subtract(1, 'day'))
      && dayjs(application.applyDate).isBefore(appliedQuery.applyRange[1].add(1, 'day'))
    );
    return (!appliedQuery.applicationId || application.id.toLowerCase().includes(appliedQuery.applicationId.toLowerCase()))
      && (!appliedQuery.oldAssetTag || application.oldAsset.assetTag.toLowerCase().includes(appliedQuery.oldAssetTag.toLowerCase()))
      && (!appliedQuery.status || application.status === appliedQuery.status)
      && (!appliedQuery.currentNode || application.currentNode === appliedQuery.currentNode)
      && inRange;
  }), [applications, appliedQuery]);

  const columns = [
    { title: '申请单号', dataIndex: 'id', width: 170 },
    { title: '旧资产标签号', width: 150, render: (_, record) => record.oldAsset.assetTag },
    { title: '旧资产说明', width: 230, render: (_, record) => record.oldAsset.assetDesc },
    { title: 'MIS鉴定结果', width: 120, render: (_, record) => record.mis.result || '-' },
    { title: '入库单号', width: 170, render: (_, record) => record.returnProcess.inboundOrderNo || '-' },
    { title: '待发放新资产标签号', width: 180, render: (_, record) => record.newAsset?.assetTag || '-' },
    { title: '出库单号', width: 170, render: (_, record) => record.issueProcess.outboundOrderNo || '-' },
    { title: '单据状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> },
    { title: '当前节点', dataIndex: 'currentNode', width: 120 },
    { title: '操作', width: 80, fixed: 'right', render: (_, record) => <Button type="link" className="px-0" onClick={() => setDetailApplication(record)}>查看</Button> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">我的资产更换申请</Typography.Title>
          <Button onClick={() => setApplications(getAssetReplacementApplications())}>刷新</Button>
        </div>

        <Card size="small">
          <QueryBar
            onQuery={() => setAppliedQuery(query)}
            onReset={() => {
              setQuery(EMPTY_QUERY);
              setAppliedQuery(EMPTY_QUERY);
            }}
          >
            <QueryItem label="申请单号">
              <Input allowClear value={query.applicationId} onChange={(event) => setQuery({ ...query, applicationId: event.target.value })} />
            </QueryItem>
            <QueryItem label="旧资产标签号">
              <Input allowClear value={query.oldAssetTag} onChange={(event) => setQuery({ ...query, oldAssetTag: event.target.value })} />
            </QueryItem>
            <QueryItem label="单据状态">
              <Select allowClear value={query.status || undefined} placeholder="全部" options={['处理中', '已驳回', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, status: value || '' })} />
            </QueryItem>
            <QueryItem label="当前节点">
              <Select allowClear value={query.currentNode || undefined} placeholder="全部" options={[...new Set(applications.map((item) => item.currentNode))].map((value) => ({ label: value, value }))} onChange={(value) => setQuery({ ...query, currentNode: value || '' })} />
            </QueryItem>
            <QueryItem label="申请日期">
              <RangePicker className="w-full" value={query.applyRange} onChange={(value) => setQuery({ ...query, applyRange: value })} />
            </QueryItem>
          </QueryBar>
        </Card>

        <Card size="small" title="申请记录">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredApplications}
            pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ x: 1550 }}
            locale={{ emptyText: <Empty description="暂无资产更换申请" /> }}
          />
        </Card>
      </Space>

      <ReplacementDetailModal
        open={Boolean(detailApplication)}
        application={detailApplication}
        onCancel={() => setDetailApplication(null)}
      />
    </div>
  );
}
