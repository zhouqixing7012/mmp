import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { BellRing, Download, PlayCircle, Plus, Search, Trash2, Upload } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import { EMPLOYEE_ROWS } from './mockData';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';

const EMPTY_PLAN_FILTERS = { planNo: '', planName: '', planStatus: '', organization: '', range: '' };
const RANGE_OPTIONS = ['员工', '库房', '公共', '机房'];
function includesText(value, query) { if (!query) return true; return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase()); }
function PageTitle({ children }) { return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>; }
function CardTitle({ children }) { return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>; }
function PersonnelInput({ value, onClick, disabled = false }) {
  if (disabled) return <Typography.Text>{value || '-'}</Typography.Text>;
  return <Input value={value === '-' ? '' : (value || '')} readOnly placeholder="请选择" suffix={<Search size={14} className="text-[#1677ff]" />} onClick={onClick} onChange={() => {}} />;
}
function ProjectInfoCard({ project }) {
  return <Card size="small" title={<CardTitle>盘点项目信息</CardTitle>}><div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
    <div><span className="text-gray-500">项目编号：</span>{project?.projectNo || '-'}</div><div><span className="text-gray-500">项目名称：</span>{project?.projectName || '-'}</div><div><span className="text-gray-500">项目类型：</span>{project?.projectType || '-'}</div>
    <div><span className="text-gray-500">盘点开始时间：</span>{project?.startDate || '-'}</div><div><span className="text-gray-500">盘点结束时间：</span>{project?.endDate || '-'}</div><div><span className="text-gray-500">项目状态：</span><StatusTag value={project?.status || '生成盘点计划'} /></div>
  </div></Card>;
}

export default function AssetInventoryPlansV2Refined({ project, onBack, onOpenPlanAssets, rows, setRows, canManualCreate, onManualCreate }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const rangeOptions = RANGE_OPTIONS.filter((range) => allowedRanges.includes(range));
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [personTarget, setPersonTarget] = useState(null);
  const [batchDateOpen, setBatchDateOpen] = useState(false);
  const [batchDates, setBatchDates] = useState({ startDate: '', endDate: '' });
  const visibleRows = useMemo(() => rows.filter((row) => allowedRanges.includes(row.range)), [rows, allowedRanges]);
  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const filteredRows = useMemo(() => visibleRows.filter((row) => includesText(row.planNo, appliedFilters.planNo) && includesText(row.planName, appliedFilters.planName) && includesText(row.status, appliedFilters.planStatus) && includesText(row.organization, appliedFilters.organization) && includesText(row.range, appliedFilters.range)), [visibleRows, appliedFilters]);
  const editable = (row) => row.status === '草稿';
  const selectedRows = visibleRows.filter((row) => selectedKeys.includes(row.key));
  const allSelectedDraft = selectedRows.length > 0 && selectedRows.every((row) => row.status === '草稿');
  const anyStarted = visibleRows.some((row) => row.status === '启动');
  const applyPersonnel = (record) => { if (!personTarget) return; setRows((current) => current.map((row) => row.key === personTarget.rowKey ? { ...row, [personTarget.field]: record.employeeName } : row)); setPersonTarget(null); };

  const handleStart = () => {
    if (!selectedKeys.length) { messageApi.warning('请先选择需要启动的盘点计划'); return; }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? { ...row, status: '启动' } : row));
    setSelectedKeys([]);
    messageApi.success('盘点计划已启动，并发送盘点待办及通知');
  };

  const handleDelete = () => {
    if (!selectedKeys.length) { messageApi.warning('请先选择需要删除的盘点计划'); return; }
    const selected = new Set(selectedKeys);
    if (visibleRows.some((row) => selected.has(row.key) && row.status !== '草稿')) { messageApi.warning('仅草稿状态的盘点计划可删除'); return; }
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点计划');
  };

  const openBatchDate = () => {
    const first = visibleRows[0];
    setBatchDates({ startDate: first?.startDate || '', endDate: first?.endDate || '' });
    setBatchDateOpen(true);
  };

  const saveBatchDates = () => {
    if (!batchDates.startDate || !batchDates.endDate) { messageApi.warning('请完整填写盘点开始日期和盘点结束日期'); return; }
    if (batchDates.endDate < batchDates.startDate) { messageApi.warning('盘点结束日期不能早于盘点开始日期'); return; }
    setRows((current) => current.map((row) => allowedRanges.includes(row.range) ? { ...row, startDate: batchDates.startDate, endDate: batchDates.endDate } : row));
    setBatchDateOpen(false);
    messageApi.success(`已统一更新全部 ${visibleRows.length} 个盘点计划的盘点日期`);
  };

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 170, fixed: 'left' },
    { title: '计划名称', dataIndex: 'planName', width: 190 },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '子公司', dataIndex: 'organization', width: 140 },
    ...(project?.projectType === '复盘' ? [{ title: '财务监督人', dataIndex: 'financialSupervisor', width: 130, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => setPersonTarget({ rowKey: row.key, field: 'financialSupervisor' })} /> }] : []),
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100, align: 'right' },
    { title: '盘点开始日期', dataIndex: 'startDate', width: 145, render: (value, row) => editable(row) ? <DatePicker value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, startDate: date ? date.format('YYYY-MM-DD') : '' } : item))} /> : value },
    { title: '盘点结束日期', dataIndex: 'endDate', width: 145, render: (value, row) => editable(row) ? <DatePicker value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, endDate: date ? date.format('YYYY-MM-DD') : '' } : item))} /> : value },
    { title: '资产清单', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenPlanAssets(row)}>查看</Button> },
  ];

  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}<PageTitle>盘点计划</PageTitle><ProjectInfoCard project={project} />
    <Card size="small" title={<CardTitle>盘点计划明细</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
      <QueryBar onQuery={() => { setAppliedFilters({ ...draftFilters }); setSelectedKeys([]); }} onReset={() => { setDraftFilters(EMPTY_PLAN_FILTERS); setAppliedFilters(EMPTY_PLAN_FILTERS); setSelectedKeys([]); }}>
        <QueryItem label="计划编码"><Input value={draftFilters.planNo} allowClear placeholder="请输入计划编码" onChange={(event) => updateFilter('planNo', event.target.value)} /></QueryItem>
        <QueryItem label="计划名称"><Input value={draftFilters.planName} allowClear placeholder="请输入计划名称" onChange={(event) => updateFilter('planName', event.target.value)} /></QueryItem>
        <QueryItem label="计划状态"><Select value={draftFilters.planStatus || undefined} allowClear placeholder="请选择" options={['草稿', '启动', '关闭'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('planStatus', value)} /></QueryItem>
        <QueryItem label="子公司"><Input value={draftFilters.organization} allowClear placeholder="请输入子公司" onChange={(event) => updateFilter('organization', event.target.value)} /></QueryItem>
        <QueryItem label="盘点范围"><Select value={draftFilters.range || undefined} allowClear placeholder="请选择" options={rangeOptions.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('range', value)} /></QueryItem>
      </QueryBar>
      <div className="mb-3 flex justify-end"><Space wrap>{canManualCreate && <Button icon={<Plus size={14} />} onClick={onManualCreate}>手工创建计划</Button>}<Button onClick={openBatchDate}>批量编辑盘点日期</Button>{allSelectedDraft && <Button type="primary" icon={<PlayCircle size={14} />} onClick={handleStart}>启动盘点计划</Button>}{allSelectedDraft && <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除盘点计划</Button>}<Button icon={<Upload size={14} />}>{anyStarted ? '导入盘点结果' : '导入'}</Button><Button icon={<Download size={14} />}>导出</Button>{project?.projectType === '复盘' && anyStarted && <Button type="primary">提交审核</Button>}{anyStarted && <Button icon={<BellRing size={14} />} onClick={() => messageApi.success('已发送盘点通知和待办')}>发送盘点通知</Button>}</Space></div>
      <Table rowKey="key" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </Card>
    <div className="flex justify-center pb-2"><Button onClick={onBack}>返回</Button></div>
    <Modal open={batchDateOpen} title="批量编辑盘点日期" width={560} okText="确定" cancelText="取消" onCancel={() => setBatchDateOpen(false)} onOk={saveBatchDates}>
      <Alert type="info" showIcon className="mb-4" message="保存后将统一修改当前全部盘点计划的盘点开始日期和盘点结束日期。" />
      <div className="grid grid-cols-2 gap-4 py-2"><div><Typography.Text type="secondary">盘点开始日期</Typography.Text><DatePicker className="w-full" value={batchDates.startDate ? dayjs(batchDates.startDate) : null} onChange={(date) => setBatchDates((current) => ({ ...current, startDate: date ? date.format('YYYY-MM-DD') : '' }))} /></div><div><Typography.Text type="secondary">盘点结束日期</Typography.Text><DatePicker className="w-full" value={batchDates.endDate ? dayjs(batchDates.endDate) : null} disabledDate={(date) => batchDates.startDate && date.isBefore(dayjs(batchDates.startDate), 'day')} onChange={(date) => setBatchDates((current) => ({ ...current, endDate: date ? date.format('YYYY-MM-DD') : '' }))} /></div></div>
    </Modal>
    <SelectModal open={Boolean(personTarget)} title="用户列表" rowKey="id" dataSource={EMPLOYEE_ROWS} searchFields={[{ label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' }, { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' }, { label: '部门名称', name: 'department', dataIndex: 'department' }]} columns={[{ title: '员工编号', dataIndex: 'employeeNo' }, { title: '员工姓名', dataIndex: 'employeeName' }, { title: '部门名称', dataIndex: 'department' }]} onCancel={() => setPersonTarget(null)} onConfirm={applyPersonnel} />
  </Space>;
}
