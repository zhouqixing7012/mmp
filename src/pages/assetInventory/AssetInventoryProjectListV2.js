import React, { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Plus, Trash2, XCircle } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { PROJECT_LIST_ROWS } from './projectListMockData';

const EMPTY_FILTERS = {
  projectNo: '', projectName: '', status: '', owner: '', startFrom: '', startTo: '', type: '', createdFrom: '', createdTo: '',
};
const PROJECT_STATUS_OPTIONS = ['草稿', '快照生成', '生成盘点计划', '盘点中', '盘点关闭'];
const PROJECT_TYPE_OPTIONS = ['初盘', '抽盘', '复盘'];
const PLAN_AVAILABLE_STATUSES = ['生成盘点计划', '盘点中', '盘点关闭'];

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}
function inDateRange(value, from, to) {
  if (!value) return true;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}
function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}
function DateFilter({ value, onChange, placeholder }) {
  return <DatePicker value={value ? dayjs(value) : null} format="YYYY-MM-DD" placeholder={placeholder} style={{ width: '100%' }} onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')} />;
}
function normalizeStatus(status) {
  return status === '暂存' ? '草稿' : status;
}
function normalizeQuarterText(value) {
  return String(value || '')
    .split('第一季度').join('Q1')
    .split('第二季度').join('Q2')
    .split('第三季度').join('Q3')
    .split('第四季度').join('Q4');
}
function displayGroupName(name) {
  return normalizeQuarterText(String(name || '').split('链路').join(''));
}
function DisabledAction({ children }) {
  return <Typography.Text type="secondary">{children}</Typography.Text>;
}
function hasGeneratedPlan(row) {
  return PLAN_AVAILABLE_STATUSES.includes(normalizeStatus(row?.status));
}
function hasInventoryHistory(row) {
  return ['盘点中', '盘点关闭'].includes(normalizeStatus(row?.status));
}

export default function AssetInventoryProjectListV2({ onCreate, onOpenProject, onOpenPlans, onOpenProgress, onOpenImageReview }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => PROJECT_LIST_ROWS.map((row) => ({ ...row, status: normalizeStatus(row.status) })));
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.projectNo, appliedFilters.projectNo)
    && includesText(normalizeQuarterText(row.projectName), appliedFilters.projectName)
    && includesText(row.status, appliedFilters.status)
    && includesText(row.owner, appliedFilters.owner)
    && includesText(row.projectType, appliedFilters.type)
    && inDateRange(row.startDate, appliedFilters.startFrom, appliedFilters.startTo)
    && inDateRange(row.endDate, appliedFilters.startFrom, appliedFilters.startTo)
    && inDateRange(row.createdAt, appliedFilters.createdFrom, appliedFilters.createdTo)
  )), [rows, appliedFilters]);

  const treeRows = useMemo(() => {
    const groups = new Map();
    filteredRows.forEach((row) => {
      const group = groups.get(row.relationGroup) || [];
      group.push(row);
      groups.set(row.relationGroup, group);
    });
    return Array.from(groups.entries()).map(([relationGroup, groupRows]) => {
      const initial = groupRows.find((row) => row.projectType === '初盘') || groupRows[0];
      const children = groupRows.filter((row) => row.key !== initial.key).map((row) => ({ ...row, relationGroupLabel: '' }));
      return {
        ...initial,
        relationGroupLabel: displayGroupName(relationGroup),
        children: children.length ? children : undefined,
      };
    });
  }, [filteredRows]);

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const handleDelete = () => {
    if (!selectedKeys.length) { messageApi.warning('请先选择需要删除的盘点项目'); return; }
    const selected = rows.filter((row) => selectedKeys.includes(row.key));
    if (selected.some((row) => row.status !== '草稿')) { messageApi.warning('仅草稿状态的盘点项目可删除'); return; }
    Modal.confirm({
      title: '确认删除所选盘点项目？', content: `共选择 ${selectedKeys.length} 个盘点项目。`, okText: '删除', cancelText: '取消', okButtonProps: { danger: true },
      onOk: () => {
        const selectedSet = new Set(selectedKeys);
        setRows((current) => current.filter((row) => !selectedSet.has(row.key)));
        setSelectedKeys([]);
        messageApi.success('已删除所选盘点项目');
      },
    });
  };
  const handleClose = () => {
    if (selectedKeys.length !== 1) { messageApi.warning('请选择一个需要关闭的盘点项目'); return; }
    const row = rows.find((item) => item.key === selectedKeys[0]);
    if (!row) return;
    if (row.status === '草稿' || row.status === '快照生成') { messageApi.warning('当前项目尚未完成盘点计划启动，无法关闭'); return; }
    setRows((current) => current.map((item) => item.key === row.key ? { ...item, status: '盘点关闭' } : item));
    setSelectedKeys([]);
    messageApi.success('盘点项目已关闭');
  };

  const columns = [
    {
      title: '关联项目', dataIndex: 'relationGroupLabel', width: 180, fixed: 'left',
      render: (value) => value ? <Typography.Text strong>{value}</Typography.Text> : '-',
    },
    { title: '项目编号', dataIndex: 'projectNo', width: 170, fixed: 'left' },
    { title: '项目名称', dataIndex: 'projectName', width: 180, render: (value, row) => <Button type="link" className="px-0" onClick={() => onOpenProject(row)}>{normalizeQuarterText(value)}</Button> },
    { title: '项目类型', dataIndex: 'projectType', width: 90 },
    { title: '项目状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '盘点开始时间', dataIndex: 'startDate', width: 130 },
    { title: '盘点结束时间', dataIndex: 'endDate', width: 130 },
    { title: '执行盘点数量', dataIndex: 'executionCount', width: 120, align: 'right' },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '项目责任人', dataIndex: 'owner', width: 130 },
    { title: '项目创建时间', dataIndex: 'createdAt', width: 130 },
    {
      title: '进入计划', width: 100, fixed: 'right',
      render: (_, row) => hasGeneratedPlan(row)
        ? <Button type="link" className="px-0" onClick={() => onOpenPlans(row)}>进入计划</Button>
        : <DisabledAction>进入计划</DisabledAction>,
    },
    {
      title: '项目进度', width: 100, fixed: 'right',
      render: (_, row) => hasInventoryHistory(row)
        ? <Button type="link" className="px-0" onClick={() => onOpenProgress(row)}>查看进度</Button>
        : <DisabledAction>查看进度</DisabledAction>,
    },
    {
      title: '图片审核', width: 100, fixed: 'right',
      render: (_, row) => hasInventoryHistory(row)
        ? <Button type="link" className="px-0" onClick={() => onOpenImageReview(row)}>图片审核</Button>
        : <DisabledAction>图片审核</DisabledAction>,
    },
  ];

  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}
    <Typography.Title level={4} style={{ margin: 0 }}>盘点项目</Typography.Title>
    <QueryBar onQuery={() => { setAppliedFilters({ ...draftFilters }); setSelectedKeys([]); }} onReset={() => { setDraftFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setSelectedKeys([]); }}>
      <QueryItem label="项目编号"><Input value={draftFilters.projectNo} allowClear placeholder="请输入项目编号" onChange={(event) => updateFilter('projectNo', event.target.value)} /></QueryItem>
      <QueryItem label="项目名称"><Input value={draftFilters.projectName} allowClear placeholder="请输入项目名称" onChange={(event) => updateFilter('projectName', event.target.value)} /></QueryItem>
      <QueryItem label="项目状态"><Select value={draftFilters.status || undefined} allowClear placeholder="请选择" options={PROJECT_STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('status', value)} /></QueryItem>
      <QueryItem label="项目责任人"><Input value={draftFilters.owner} allowClear placeholder="请输入项目责任人" onChange={(event) => updateFilter('owner', event.target.value)} /></QueryItem>
      <QueryItem label="盘点开始时间"><DateFilter value={draftFilters.startFrom} placeholder="开始日期" onChange={(value) => updateFilter('startFrom', value)} /></QueryItem>
      <QueryItem label="盘点结束时间"><DateFilter value={draftFilters.startTo} placeholder="结束日期" onChange={(value) => updateFilter('startTo', value)} /></QueryItem>
      <QueryItem label="项目类型"><Select value={draftFilters.type || undefined} allowClear placeholder="请选择" options={PROJECT_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('type', value)} /></QueryItem>
      <QueryItem label="创建时间从"><DateFilter value={draftFilters.createdFrom} placeholder="开始日期" onChange={(value) => updateFilter('createdFrom', value)} /></QueryItem>
      <QueryItem label="创建时间至"><DateFilter value={draftFilters.createdTo} placeholder="结束日期" onChange={(value) => updateFilter('createdTo', value)} /></QueryItem>
    </QueryBar>
    <Card size="small" title={<CardTitle>盘点项目列表</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
      <div className="mb-3 flex justify-end"><Space wrap><Button type="primary" icon={<Plus size={14} />} onClick={onCreate}>创建项目</Button><Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除</Button><Button icon={<XCircle size={14} />} onClick={handleClose}>关闭项目</Button></Space></div>
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={columns}
        dataSource={treeRows}
        expandable={{ defaultExpandAllRows: true, rowExpandable: (record) => Boolean(record.children?.length), indentSize: 18 }}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
        scroll={{ x: 1810 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      />
    </Card>
  </Space>;
}
