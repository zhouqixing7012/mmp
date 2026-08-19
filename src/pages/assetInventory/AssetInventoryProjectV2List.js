import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Input, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { PROJECT_ROWS } from './mockData';
import { CardTitle, EMPTY_FILTERS, PageTitle, PROJECT_STATUSES, PROJECT_TYPES, includesText } from './AssetInventoryProjectV2Common';

export default function ProjectListView({ onCreate, onOpenProject, onOpenPlans, onOpenProgress, onOpenImageReview }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [projectRows, setProjectRows] = useState(PROJECT_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const rows = useMemo(() => projectRows.filter((row) => (
    includesText(row.projectNo, applied.projectNo)
    && includesText(row.projectName, applied.projectName)
    && includesText(row.status, applied.status)
    && includesText(row.owner, applied.owner)
    && includesText(row.startDate, applied.startDate)
    && includesText(row.endDate, applied.endDate)
    && includesText(row.projectType, applied.projectType)
    && includesText(row.createdAt, applied.createdAt)
  )), [projectRows, applied]);

  const groupedRows = useMemo(() => {
    const groups = [];
    rows.forEach((row) => {
      const latest = groups[groups.length - 1];
      if (!latest || latest.group !== row.relationGroup) groups.push({ group: row.relationGroup, rows: [row] });
      else latest.rows.push(row);
    });
    return groups.flatMap((group) => [
      { key: `group-${group.group}`, isGroup: true, relationGroup: group.group, childCount: group.rows.length },
      ...group.rows,
    ]);
  }, [rows]);

  const groupCell = (row, children) => row.isGroup
    ? { children: <Space><Typography.Text strong>{row.relationGroup}</Typography.Text><Typography.Text type="secondary">{row.childCount} 个关联项目</Typography.Text></Space>, props: { colSpan: 13 } }
    : children;
  const hiddenGroupCell = (row, children) => row.isGroup ? { props: { colSpan: 0 } } : children;

  const columns = [
    { title: '项目编号', dataIndex: 'projectNo', width: 170, fixed: 'left', render: (value, row) => groupCell(row, value) },
    { title: '项目名称', dataIndex: 'projectName', width: 190, render: (value, row) => hiddenGroupCell(row, <Button type="link" className="px-0" onClick={() => onOpenProject(row)}>{value}</Button>) },
    { title: '项目类型', dataIndex: 'projectType', width: 90, render: (value, row) => hiddenGroupCell(row, value) },
    { title: '项目状态', dataIndex: 'status', width: 120, render: (value, row) => hiddenGroupCell(row, <StatusTag value={value} />) },
    { title: '盘点开始时间', dataIndex: 'startDate', width: 130, render: (value, row) => hiddenGroupCell(row, value) },
    { title: '盘点结束时间', dataIndex: 'endDate', width: 130, render: (value, row) => hiddenGroupCell(row, value) },
    { title: '执行盘点数量', dataIndex: 'executionCount', width: 120, align: 'right', render: (value, row) => hiddenGroupCell(row, value) },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right', render: (value, row) => hiddenGroupCell(row, value) },
    { title: '项目责任人', dataIndex: 'owner', width: 130, render: (value, row) => hiddenGroupCell(row, value) },
    { title: '项目创建时间', dataIndex: 'createdAt', width: 130, render: (value, row) => hiddenGroupCell(row, value) },
    { title: '进入计划', width: 100, render: (_, row) => hiddenGroupCell(row, row.planStatus ? <Button type="link" className="px-0" onClick={() => onOpenPlans(row)}>进入计划</Button> : null) },
    { title: '项目进度', width: 100, render: (_, row) => hiddenGroupCell(row, <Button type="link" className="px-0" onClick={() => onOpenProgress(row)}>查看进度</Button>) },
    { title: '图片审核', width: 100, fixed: 'right', render: (_, row) => hiddenGroupCell(row, row.imageApproval ? <Button type="link" className="px-0" onClick={() => onOpenImageReview(row)}>图片审核</Button> : null) },
  ];

  const setField = (field, value) => setFilters((current) => ({ ...current, [field]: value || '' }));
  const deleteSelected = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的盘点项目');
    const selectedRows = projectRows.filter((row) => selectedKeys.includes(row.key));
    if (selectedRows.some((row) => row.status !== '暂存')) return messageApi.warning('仅暂存状态的盘点项目可删除');
    setProjectRows((current) => current.filter((row) => !selectedKeys.includes(row.key)));
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点项目');
  };
  const closeSelected = () => {
    if (selectedKeys.length !== 1) return messageApi.warning('请选择一个需要关闭的盘点项目');
    setProjectRows((current) => current.map((row) => row.key === selectedKeys[0] ? { ...row, status: '盘点关闭' } : row));
    setSelectedKeys([]);
    messageApi.success('盘点项目已关闭');
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目（方案二）</PageTitle>
      <Alert type="info" showIcon message="方案二仅调整盘点规则配置时点：创建项目阶段不配置盘点规则；生成快照后再配置盘点方式及图片上传规则。" />
      <QueryBar onQuery={() => setApplied({ ...filters })} onReset={() => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); }}>
        <QueryItem label="项目编号"><Input value={filters.projectNo} allowClear onChange={(event) => setField('projectNo', event.target.value)} /></QueryItem>
        <QueryItem label="项目名称"><Input value={filters.projectName} allowClear onChange={(event) => setField('projectName', event.target.value)} /></QueryItem>
        <QueryItem label="项目状态"><Select value={filters.status || undefined} allowClear options={PROJECT_STATUSES.map((value) => ({ label: value, value }))} onChange={(value) => setField('status', value)} /></QueryItem>
        <QueryItem label="项目责任人"><Input value={filters.owner} allowClear onChange={(event) => setField('owner', event.target.value)} /></QueryItem>
        <QueryItem label="盘点开始时间"><DatePicker className="w-full" value={filters.startDate ? dayjs(filters.startDate) : null} onChange={(date) => setField('startDate', date ? date.format('YYYY-MM-DD') : '')} /></QueryItem>
        <QueryItem label="盘点结束时间"><DatePicker className="w-full" value={filters.endDate ? dayjs(filters.endDate) : null} onChange={(date) => setField('endDate', date ? date.format('YYYY-MM-DD') : '')} /></QueryItem>
        <QueryItem label="项目类型"><Select value={filters.projectType || undefined} allowClear options={PROJECT_TYPES.map((value) => ({ label: value, value }))} onChange={(value) => setField('projectType', value)} /></QueryItem>
        <QueryItem label="创建时间"><DatePicker className="w-full" value={filters.createdAt ? dayjs(filters.createdAt) : null} onChange={(date) => setField('createdAt', date ? date.format('YYYY-MM-DD') : '')} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>盘点项目列表</CardTitle>} extra={<Typography.Text type="secondary">共 {rows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end"><Space><Button type="primary" onClick={onCreate}>创建项目</Button><Button danger onClick={deleteSelected}>删除</Button><Button onClick={closeSelected}>关闭项目</Button></Space></div>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={groupedRows}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, getCheckboxProps: (record) => ({ disabled: record.isGroup }), fixed: true }}
          scroll={{ x: 1550 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </Space>
  );
}
