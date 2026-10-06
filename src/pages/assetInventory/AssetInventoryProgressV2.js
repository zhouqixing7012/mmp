import React, { useEffect, useState } from 'react';
import { Button, Card, Progress, Space, Table, Typography } from 'antd';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import StatusTag from '../../components/StatusTag';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { EMPLOYEE_ROWS } from './mockData';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';
import SectionCardTitle from './SectionCardTitle';
import { buildInventoryProgress, createProgressWorkbook, filterProgressRows, isUncountedProgressAsset } from './inventoryProgressModel';
import InventoryProgressAssetsModal from './InventoryProgressAssetsModal';

function formatCount(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function ProjectInfoCard({ project }) {
  return (
    <Card size="small" title={<SectionCardTitle>盘点项目信息</SectionCardTitle>}>
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

export default function AssetInventoryProgressV2({ project, plans, assetsForPlan, onBack }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [detailRange, setDetailRange] = useState('');
  const [detailFilters, setDetailFilters] = useState({});
  const [detailPage, setDetailPage] = useState(1);
  const [assetView, setAssetView] = useState(null);
  const scopeRanges = project?.scopeRanges?.length ? allowedRanges.filter((range) => project.scopeRanges.includes(range)) : allowedRanges;
  const progress = buildInventoryProgress(project, scopeRanges, plans, assetsForPlan, EMPLOYEE_ROWS);
  const progressRows = progress.summary;
  const detailRows = progress.details.filter((row) => row.range === detailRange);
  const filteredDetailRows = filterProgressRows(detailRows, detailFilters);
  const downloadProgress = (rows, columns, name) => XLSX.writeFile(
    createProgressWorkbook(rows, columns.filter((column) => column.dataIndex).map((column) => [column.title, column.dataIndex]), name),
    (project?.projectNo || '盘点项目') + '-' + name + '.xlsx');
  const openAssetView = (uncounted) => {
    const scoped = detailRange ? filteredDetailRows.flatMap((row) => row.assets) : progress.assets;
    setAssetView({ title: uncounted ? '未盘资产' : '盘点全量资产', assets: uncounted ? scoped.filter(isUncountedProgressAsset) : scoped });
  };
  const assetTools = <Space>
    <Button onClick={() => openAssetView(false)}>查看盘点全量资产</Button>
    <Button onClick={() => openAssetView(true)}>查看未盘资产</Button>
  </Space>;
  const assetModal = assetView && <InventoryProgressAssetsModal title={assetView.title} assets={assetView.assets} projectNo={project.projectNo} onClose={() => setAssetView(null)} />;

  useEffect(() => {
    const items = detailRange
      ? [
        { label: '首页' },
        { label: '资产盘点' },
        { label: '盘点项目', onClick: onBack },
        { label: '盘点进度', onClick: () => setDetailRange('') },
        { label: '进度详情' },
      ]
      : [
        { label: '首页' },
        { label: '资产盘点' },
        { label: '盘点项目', onClick: onBack },
        { label: '盘点进度' },
      ];
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items } }));
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
    {
      title: '进度详情',
      width: 100,
      fixed: 'right',
      render: (_, row) => ['员工', '库房', '公共'].includes(row.range)
        ? <Button type="link" className="px-0" onClick={() => { setDetailRange(row.range); setDetailFilters({}); setDetailPage(1); }}>查看详情</Button>
        : '-',
    },
  ];

  const roleColumns = project?.projectType === '复盘'
    ? [{ title: '财务监督人', dataIndex: 'financialSupervisor', width: 130 }, { title: '内审监督人', dataIndex: 'auditSupervisor', width: 130 }]
    : [{ title: '计划监督人', dataIndex: 'supervisor', width: 130 }];
  const detailColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '子公司', dataIndex: 'organization', width: 140, fixed: 'left' },
    { title: '一级部门', dataIndex: 'department', width: 220 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: '应盘数量', dataIndex: 'expected', width: 110, align: 'right', render: formatCount },
    { title: '已盘数量', dataIndex: 'counted', width: 110, align: 'right', render: formatCount },
    { title: '报失数量', dataIndex: 'lost', width: 110, align: 'right', render: formatCount },
    { title: '未盘数量', dataIndex: 'uncounted', width: 110, align: 'right', render: formatCount },
    { title: '数量进度', dataIndex: 'progress', width: 180, render: (value) => <Progress percent={value} size="small" /> },
    { title: '剩余天数', dataIndex: 'remainingDays', width: 100 },
    ...roleColumns,
  ].map((column) => ({ ...column,
    filters: [...new Set(detailRows.map((row) => row[column.dataIndex] ?? '-'))].map((value) => ({ text: String(value), value })),
    filteredValue: detailFilters[column.dataIndex] || null, filterSearch: true,
    onFilter: (value, row) => String(row[column.dataIndex] ?? '-') === String(value),
  }));

  if (detailRange) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {assetModal}
        <Typography.Title level={4} style={{ margin: 0 }}>进度详情</Typography.Title>
        <ProjectInfoCard project={project} />
        <Space>{assetTools}<Button onClick={() => { setDetailFilters({}); setDetailPage(1); }}>重置筛选</Button></Space>
        <Card size="small" title={<SectionCardTitle>进度详情</SectionCardTitle>} extra={<Button icon={<Download size={14} />} onClick={() => downloadProgress(filteredDetailRows, detailColumns, `${detailRange}进度详情`)}>导出</Button>}>
          <Table rowKey="key" size="small" bordered columns={detailColumns} dataSource={filteredDetailRows} pagination={{ current: detailPage, defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => '共 ' + total + ' 条' }} onChange={(pagination, filters, sorter, extra) => { setDetailFilters(filters); setDetailPage(extra.action === 'filter' ? 1 : pagination.current); }} scroll={{ x: 1350 }} locale={{ emptyText: '暂无该盘点范围的进度详情数据' }} />
        </Card>
        <div className="flex justify-center pb-2">
          <Button onClick={() => setDetailRange('')}>返回</Button>
        </div>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {assetModal}
      <Typography.Title level={4} style={{ margin: 0 }}>盘点进度</Typography.Title>
      <ProjectInfoCard project={project} />
      {assetTools}
      <Card
        size="small"
        title={<SectionCardTitle>项目进度</SectionCardTitle>}
        extra={<Button icon={<Download size={14} />} onClick={() => downloadProgress(progressRows, progressColumns, '项目进度')}>导出</Button>}
      >
        <Table rowKey="key" size="small" bordered columns={progressColumns} dataSource={progressRows} pagination={false} scroll={{ x: 1250 }} />
      </Card>
      <div className="flex justify-center pb-2">
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
