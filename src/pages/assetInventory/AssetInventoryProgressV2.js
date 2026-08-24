import React, { useEffect, useState } from 'react';
import { Button, Card, Progress, Space, Table, Typography, message as antdMessage } from 'antd';
import { Download } from 'lucide-react';
import StatusTag from '../../components/StatusTag';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { PROGRESS_DETAIL_ROWS, PROGRESS_ROWS } from './mockData';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}

function formatCount(value) {
  return Number(value || 0).toLocaleString('zh-CN');
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
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [detailRange, setDetailRange] = useState('');
  const progressRows = PROGRESS_ROWS.filter((row) => allowedRanges.includes(row.range));
  const detailRows = PROGRESS_DETAIL_ROWS.filter((row) => allowedRanges.includes(row.range) && row.range === detailRange);

  useEffect(() => {
    if (!detailRange) return;
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', {
      detail: {
        items: [
          { label: '首页' },
          { label: '资产盘点' },
          { label: '盘点项目', onClick: onBack },
          { label: '盘点进度', onClick: () => setDetailRange('') },
          { label: '进度详情' },
        ],
      },
    }));
  }, [detailRange, onBack]);

  const progressColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '启动时间', dataIndex: 'startDate', width: 120 },
    { title: '结束时间', dataIndex: 'endDate', width: 120 },
    { title: '应盘数量', dataIndex: 'expected', width: 110, align: 'right', render: formatCount },
    { title: '已盘数量', dataIndex: 'counted', width: 110, align: 'right', render: formatCount },
    { title: '报失数量', dataIndex: 'lost', width: 110, align: 'right', render: formatCount },
    { title: '未盘数量', dataIndex: 'uncounted', width: 110, align: 'right', render: formatCount },
    { title: '数量进度', dataIndex: 'progress', width: 180, render: (value) => <Progress percent={value} size="small" /> },
    { title: '备注', dataIndex: 'remark', width: 220 },
    {
      title: '进度详情',
      width: 100,
      fixed: 'right',
      render: (_, row) => row.range === '员工'
        ? <Button type="link" className="px-0" onClick={() => setDetailRange('员工')}>查看详情</Button>
        : '-',
    },
  ];

  const detailColumns = [
    { title: '子公司', dataIndex: 'organization', width: 140, fixed: 'left' },
    { title: '部门', dataIndex: 'department', width: 220 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: '应盘数量', dataIndex: 'expected', width: 110, align: 'right', render: formatCount },
    { title: '已盘数量', dataIndex: 'counted', width: 110, align: 'right', render: formatCount },
    { title: '报失数量', dataIndex: 'lost', width: 110, align: 'right', render: formatCount },
    { title: '未盘数量', dataIndex: 'uncounted', width: 110, align: 'right', render: formatCount },
    { title: '数量进度', dataIndex: 'progress', width: 180, render: (value) => <Progress percent={value} size="small" /> },
    { title: '剩余天数', dataIndex: 'remainingDays', width: 100 },
    { title: '计划监督人', dataIndex: 'supervisor', width: 130 },
    { title: '财务监督人', dataIndex: 'financialSupervisor', width: 130 },
  ];

  if (detailRange) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Typography.Title level={4} style={{ margin: 0 }}>进度详情</Typography.Title>
        <ProjectInfoCard project={project} />
        <Card size="small" title={<CardTitle>进度详情</CardTitle>} extra={<Typography.Text type="secondary">盘点范围：员工</Typography.Text>}>
          <Table rowKey="key" size="small" bordered columns={detailColumns} dataSource={detailRows} pagination={false} scroll={{ x: 1350 }} />
        </Card>
        <div className="flex justify-center pb-2">
          <Button onClick={() => setDetailRange('')}>返回</Button>
        </div>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Typography.Title level={4} style={{ margin: 0 }}>盘点进度</Typography.Title>
      <ProjectInfoCard project={project} />
      <Card
        size="small"
        title={<CardTitle>项目进度</CardTitle>}
        extra={<Button icon={<Download size={14} />} onClick={() => messageApi.success('项目进度导出已触发')}>导出</Button>}
      >
        <Table rowKey="key" size="small" bordered columns={progressColumns} dataSource={progressRows} pagination={false} scroll={{ x: 1250 }} />
      </Card>
      <div className="flex justify-center pb-2">
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
