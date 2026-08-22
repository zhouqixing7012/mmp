import React from 'react';
import { Button, Card, Progress, Space, Table, Tabs, Typography } from 'antd';
import StatusTag from '../../components/StatusTag';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { PROGRESS_DETAIL_ROWS, PROGRESS_ROWS } from './mockData';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}
function ProjectInfoCard({ project }) {
  return (
    <Card size="small" title={<CardTitle>盘点项目信息</CardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="项目编号">{project?.projectNo || '-'}</DetailItem>
        <DetailItem label="项目名称">{project?.projectName || '-'}</DetailItem>
        <DetailItem label="项目类型">{project?.projectType || '-'}</DetailItem>
        <DetailItem label="盘点开始时间">{project?.startDate || '-'}</DetailItem>
        <DetailItem label="盘点结束时间">{project?.endDate || '-'}</DetailItem>
        <DetailItem label="项目状态"><StatusTag value={project?.status || '-'} /></DetailItem>
      </DetailGrid>
    </Card>
  );
}

export default function AssetInventoryProgressV2({ project, onBack }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const progressRows = PROGRESS_ROWS.filter((row) => allowedRanges.includes(row.range));
  const detailRows = PROGRESS_DETAIL_ROWS.filter((row) => allowedRanges.includes(row.range));

  const progressColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '盘点方式', dataIndex: 'method', width: 180 },
    { title: '启动时间', dataIndex: 'startDate', width: 120 },
    { title: '结束时间', dataIndex: 'endDate', width: 120 },
    { title: '应盘数量', dataIndex: 'expected', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'counted', width: 100, align: 'right' },
    { title: '报失数量', dataIndex: 'lost', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncounted', width: 100, align: 'right' },
    { title: '数量进度', dataIndex: 'progress', width: 180, render: (value) => <Progress percent={value} size="small" /> },
    { title: '备注', dataIndex: 'remark', width: 220 },
  ];

  const detailColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100, fixed: 'left' },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: '部门', dataIndex: 'department', width: 220 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: '应盘数量', dataIndex: 'expected', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'counted', width: 100, align: 'right' },
    { title: '报失数量', dataIndex: 'lost', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncounted', width: 100, align: 'right' },
    { title: '数量进度', dataIndex: 'progress', width: 180, render: (value) => <Progress percent={value} size="small" /> },
    { title: '剩余天数', dataIndex: 'remainingDays', width: 100 },
    { title: '计划监督人', dataIndex: 'supervisor', width: 130 },
    { title: '财务监督人', dataIndex: 'financialSupervisor', width: 130 },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Typography.Title level={4} style={{ margin: 0 }}>盘点进度</Typography.Title>
      <ProjectInfoCard project={project} />
      <Card size="small">
        <Tabs
          items={[
            {
              key: 'summary',
              label: '项目进度',
              children: <Table rowKey="key" size="small" bordered columns={progressColumns} dataSource={progressRows} pagination={false} scroll={{ x: 1250 }} />,
            },
            {
              key: 'detail',
              label: '进度详情',
              children: <Table rowKey="key" size="small" bordered columns={detailColumns} dataSource={detailRows} pagination={false} scroll={{ x: 1500 }} />,
            },
          ]}
        />
      </Card>
      <div className="flex justify-center pb-2">
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
