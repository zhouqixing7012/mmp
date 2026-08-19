import React, { useState } from 'react';
import { Button, Card, Progress, Space, Table, Tabs, Typography, message as antdMessage } from 'antd';
import StatusTag from '../../components/StatusTag';
import { IMAGE_REVIEW_ROWS, INITIAL_PLAN_ROWS, PROGRESS_DETAIL_ROWS, PROGRESS_ROWS } from './mockData';
import { CardTitle, PageTitle, ProjectInfoCard } from './AssetInventoryProjectV2Common';

export function PlansView({ project, onBack }) {
  const [rows, setRows] = useState(INITIAL_PLAN_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 180 },
    { title: '计划名称', dataIndex: 'planName', width: 200 },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100 },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100 },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100 },
    { title: '盘点开始日期', dataIndex: 'startDate', width: 130 },
    { title: '盘点结束日期', dataIndex: 'endDate', width: 130 },
    { title: '计划负责人', dataIndex: 'manager', width: 130 },
    { title: '盘点监督人', dataIndex: 'supervisor', width: 130 },
    { title: '盘点执行人', dataIndex: 'executor', width: 150 },
  ];
  const startPlans = () => {
    if (!selectedKeys.length) { messageApi.warning('请先选择盘点计划'); return; }
    setRows((current) => current.map((row) => selectedKeys.includes(row.key) ? { ...row, status: '启动' } : row));
    messageApi.success('所选盘点计划已启动');
  };
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点计划（方案二）</PageTitle>
      <ProjectInfoCard project={{ ...project, status: rows.some((row) => row.status === '启动') ? '盘点中' : '生成盘点计划' }} />
      <Card size="small" title={<CardTitle>盘点计划明细</CardTitle>} extra={<Typography.Text type="secondary">共 {rows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end"><Space><Button type="primary" onClick={startPlans}>启动盘点计划</Button><Button onClick={() => messageApi.success('导入入口已打开')}>导入</Button><Button onClick={() => messageApi.success('导出任务已创建')}>导出</Button></Space></div>
        <Table rowKey="key" size="small" bordered rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }} columns={columns} dataSource={rows} scroll={{ x: 1700 }} pagination={false} />
      </Card>
      <div className="flex justify-center"><Button onClick={onBack}>返回</Button></div>
    </Space>
  );
}
export function ProgressView({ project, onBack }) {
  const progressColumns = [
    { title: '盘点范围', dataIndex: 'range' }, { title: '盘点方式', dataIndex: 'method', width: 180 }, { title: '启动时间', dataIndex: 'startDate' }, { title: '结束时间', dataIndex: 'endDate' },
    { title: '应盘数量', dataIndex: 'expected' }, { title: '已盘数量', dataIndex: 'counted' }, { title: '报失数量', dataIndex: 'lost' }, { title: '未盘数量', dataIndex: 'uncounted' },
    { title: '数量进度', dataIndex: 'progress', width: 160, render: (value) => <Progress percent={value} size="small" /> }, { title: '备注', dataIndex: 'remark', width: 220 },
  ];
  const detailColumns = [
    { title: '盘点范围', dataIndex: 'range' }, { title: '盘点组织', dataIndex: 'organization' }, { title: '部门', dataIndex: 'department', width: 200 }, { title: 'City', dataIndex: 'city' },
    { title: '应盘数量', dataIndex: 'expected' }, { title: '已盘数量', dataIndex: 'counted' }, { title: '报失数量', dataIndex: 'lost' }, { title: '未盘数量', dataIndex: 'uncounted' },
    { title: '数量进度', dataIndex: 'progress', width: 160, render: (value) => <Progress percent={value} size="small" /> }, { title: '剩余天数', dataIndex: 'remainingDays' }, { title: '计划监督人', dataIndex: 'supervisor' },
  ];
  return <Space direction="vertical" size={16} className="w-full"><PageTitle>盘点进度（方案二）</PageTitle><ProjectInfoCard project={project} /><Card size="small"><Tabs items={[{ key: 'summary', label: '项目进度', children: <Table rowKey="key" size="small" bordered columns={progressColumns} dataSource={PROGRESS_ROWS} pagination={false} /> }, { key: 'detail', label: '进度详情', children: <Table rowKey="key" size="small" bordered columns={detailColumns} dataSource={PROGRESS_DETAIL_ROWS} pagination={false} /> }]} /></Card><div className="flex justify-center"><Button onClick={onBack}>返回</Button></div></Space>;
}
export function ImageReviewView({ project, onBack }) {
  const columns = [
    { title: '资产标签号', dataIndex: ['asset', 'assetTag'], width: 150 },
    { title: '资产说明', dataIndex: ['asset', 'description'], width: 180 },
    { title: '资产责任人', dataIndex: ['asset', 'owner'], width: 150 },
    { title: '实际盘点人', dataIndex: ['asset', 'counter'], width: 130 },
    { title: '盘点日期', dataIndex: ['asset', 'inventoryDate'], width: 120 },
    { title: '盘点状态', dataIndex: ['asset', 'inventoryStatus'], width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '图片审核状态', dataIndex: 'reviewStatus', width: 120, render: (value) => <StatusTag value={value} /> },
  ];
  return <Space direction="vertical" size={16} className="w-full"><PageTitle>图片审核（方案二）</PageTitle><ProjectInfoCard project={project} /><Card size="small" title={<CardTitle>图片审核信息</CardTitle>}><Table rowKey="key" size="small" bordered columns={columns} dataSource={IMAGE_REVIEW_ROWS} pagination={false} /></Card><div className="flex justify-center"><Button onClick={onBack}>返回</Button></div></Space>;
}
