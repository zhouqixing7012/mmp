import { AssetValueSelect, matchesQuerySelection } from '../../components/AssetQueryControls';
import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { BellRing, Download, PlayCircle, Plus, Trash2, Upload } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';
import SectionCardTitle from './SectionCardTitle';
import { inventoryDateBlockReason } from './inventoryDateRules';
import { planPersonnelBlockReason } from './inventoryPlanStartRules';
import InventoryLocationChangeFlow from './InventoryLocationChangeFlow';
import InventoryReplayReview from './InventoryReplayReview';
import { readDemoData, writeDemoData } from '../../services/demoStorage';
import { getInventoryLocationChangeRequests } from './inventoryLocationChangeStore';
import { downloadInventoryPlans } from './inventoryPlanExport';
import { buildReplayPreparationNotices } from './inventoryReplayPreparation';
import { schedulePreparationNotices } from './inventoryPreparationNoticeStore';

const EMPTY_PLAN_FILTERS = { planNo: '', planName: '', planStatus: '', organization: '', range: '' };
const RANGE_OPTIONS = ['员工', '库房', '公共', '机房'];
function includesText(value, query) { if (!query) return true; return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase()); }
function PageTitle({ children }) { return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>; }
function ProjectInfoCard({ project }) {
  return (
    <Card size="small" title={<SectionCardTitle>盘点项目信息</SectionCardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="项目编号">{project?.projectNo || '-'}</DetailItem>
        <DetailItem label="项目名称">{project?.projectName || '-'}</DetailItem>
        <DetailItem label="项目类型">{project?.projectType || '-'}</DetailItem>
        <DetailItem label="盘点开始时间">{project?.startDate || '-'}</DetailItem>
        <DetailItem label="盘点结束时间">{project?.endDate || '-'}</DetailItem>
        <DetailItem label="项目状态"><StatusTag value={project?.status || '生成盘点计划'} /></DetailItem>
      </DetailGrid>
    </Card>
  );
}

export default function AssetInventoryPlansV2Refined({ project, currentOperator, onBack, onOpenPlanAssets, rows, setRows, assetsForPlan, canManualCreate, onManualCreate, onPlansStarted, projectAssets = [] }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const rangeOptions = RANGE_OPTIONS.filter((range) => allowedRanges.includes(range));
  const projectClosed = project?.status === '盘点关闭';
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [batchDateOpen, setBatchDateOpen] = useState(false);
  const [batchDates, setBatchDates] = useState({ startDate: '', endDate: '' });
  const [locationChangeOpen, setLocationChangeOpen] = useState(false);
  const [locationRequestId, setLocationRequestId] = useState(null);
  const [locationRecordsOpen, setLocationRecordsOpen] = useState(false);
  const locationRequests = project?.projectType === '复盘' ? getInventoryLocationChangeRequests(project.projectNo) : [];
  const openLocationDraft = () => { setLocationRequestId(null); setLocationChangeOpen(true); };
  const [reviewOpen, setReviewOpen] = useState(false);
  const reviewStorageKey = `inventory-replay-review-${project?.projectNo || ''}`;
  const [submission, setSubmission] = useState(() => readDemoData(reviewStorageKey, null));
  const visibleRows = useMemo(() => rows.filter((row) => allowedRanges.includes(row.range)).map((row) => projectClosed ? { ...row, status: '关闭' } : submission?.plans?.some(plan => plan.planNo === row.planNo) ? { ...row, status: '审核中' } : row), [rows, allowedRanges, projectClosed, submission]);
  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const filteredRows = useMemo(() => visibleRows.filter((row) => includesText(row.planNo, appliedFilters.planNo) && includesText(row.planName, appliedFilters.planName) && includesText(row.status, appliedFilters.planStatus) && matchesQuerySelection(row.organization, appliedFilters.organization) && includesText(row.range, appliedFilters.range)), [visibleRows, appliedFilters]);
  const editable = (row) => !projectClosed && row.status === '草稿';
  const selectedRows = visibleRows.filter((row) => selectedKeys.includes(row.key));
  const allSelectedDraft = !projectClosed && selectedRows.length > 0 && selectedRows.every((row) => row.status === '草稿');
  const anyStarted = visibleRows.some((row) => row.status === '盘点中');
  const allStarted = visibleRows.length > 0 && visibleRows.every((row) => row.status === '盘点中' || row.status === '关闭');


  const handleStart = () => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    if (!selectedKeys.length) { messageApi.warning('请先选择需要启动的盘点计划'); return; }
    const invalid = selectedRows.map((row) => inventoryDateBlockReason(project?.projectType, row.startDate, row.endDate)).find(Boolean);
    if (invalid) { messageApi.warning(invalid); return; }
    const personnelBlock = selectedRows.map((row) => planPersonnelBlockReason(row, assetsForPlan(row), project)).find(Boolean);
    if (personnelBlock) { messageApi.warning(personnelBlock); return; }
    let notices;
    try {
      notices = buildReplayPreparationNotices(project, selectedRows, assetsForPlan, dayjs().format('YYYY-MM-DD'));
      schedulePreparationNotices(project.projectNo, notices);
    } catch (error) { messageApi.error(error.message); return; }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? { ...row, status: '盘点中', preparationNoticeDate: notices.find(notice => notice.planNo === row.planNo)?.scheduledDate || '' } : row));
    onPlansStarted?.({ ...project, status: '盘点中' });
    setSelectedKeys([]);
    messageApi.success(notices.length ? `盘点计划已启动，已安排 ${notices.length} 条资产准备通知` : '盘点计划已启动');
  };

  const exportPlans = () => {
    const exportRows = selectedKeys.length ? filteredRows.filter(row => selectedKeys.includes(row.key)) : filteredRows;
    if (!exportRows.length) { messageApi.warning('没有可导出的盘点计划'); return; }
    try { downloadInventoryPlans(exportRows, assetsForPlan, project.projectNo); }
    catch (error) { messageApi.error('盘点计划导出失败，请重试'); }
  };

  const handleDelete = () => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    if (!selectedKeys.length) { messageApi.warning('请先选择需要删除的盘点计划'); return; }
    const selected = new Set(selectedKeys);
    if (visibleRows.some((row) => selected.has(row.key) && row.status !== '草稿')) { messageApi.warning('仅草稿状态的盘点计划可删除'); return; }
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点计划');
  };

  const openBatchDate = () => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    const first = visibleRows[0];
    setBatchDates({ startDate: first?.startDate || '', endDate: first?.endDate || '' });
    setBatchDateOpen(true);
  };

  const saveBatchDates = () => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    const dateBlockReason = inventoryDateBlockReason(project?.projectType, batchDates.startDate, batchDates.endDate);
    if (dateBlockReason) { messageApi.warning(dateBlockReason); return; }
    setRows((current) => current.map((row) => allowedRanges.includes(row.range) ? { ...row, startDate: batchDates.startDate, endDate: batchDates.endDate } : row));
    setBatchDateOpen(false);
    messageApi.success(`已统一更新全部 ${visibleRows.length} 个盘点计划的盘点日期`);
  };

  const submitReview = () => {
    if (projectClosed || !visibleRows.length || visibleRows.some(row => row.status !== '盘点中')) { messageApi.warning('全部复盘计划启动后才能提交审批'); return; }
    const perform = () => {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const nextSubmission = {plans:visibleRows.map(row=>({...row,status:'审核中'})),assetsByPlan:Object.fromEntries(visibleRows.map(row=>[row.planNo,assetsForPlan(row)])),records:[{key:'start',node:'开始',person:currentOperator,status:'已提交',time:now}, {key:'review',node:visibleRows.every(row=>row.range==='机房') ? 'NO领导审批' : 'ES主管审批',person:'',status:'待审批'}, {key:'finance',node:'财务经理审批',person:'徐博',status:'待流转'}]};
      try { writeDemoData(reviewStorageKey,nextSubmission); } catch (error) { messageApi.error('审批记录保存失败，请重试'); return; }
      setSubmission(nextSubmission);
      setRows(current=>current.map(row=>allowedRanges.includes(row.range) ? {...row,status:'审核中',financialSupervisor:'徐博'} : row));
      setReviewOpen(true);
    };
    const assets = visibleRows.flatMap(assetsForPlan);
    const ratio = assets.length ? assets.filter(asset=>['已盘','代盘'].includes(asset.inventoryStatus)).length / assets.length * 100 : 0;
    if (ratio < Number(project.samplingRatio || 100)) Modal.confirm({title:'盘点比例未达到设定比例',content:'是否继续提交复盘结果审批？',okText:'继续提交',cancelText:'取消',onOk:perform});
    else perform();
  };

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 170, fixed: 'left' },
    { title: '计划名称', dataIndex: 'planName', width: 190 },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '子公司', dataIndex: 'organization', width: 140 },
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100, align: 'right' },
    { title: '盘点开始日期', dataIndex: 'startDate', width: 145, render: (value, row) => editable(row) ? <DatePicker value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, startDate: date ? date.format('YYYY-MM-DD') : '', endDate: project?.projectType === '复盘' ? (date ? date.format('YYYY-MM-DD') : '') : item.endDate } : item))} /> : value },
    { title: '盘点结束日期', dataIndex: 'endDate', width: 145, render: (value, row) => editable(row) ? <DatePicker value={value ? dayjs(value) : null} disabledDate={(date) => project?.projectType === '复盘' && row.startDate && !date.isSame(dayjs(row.startDate), 'day')} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, endDate: date ? date.format('YYYY-MM-DD') : '' } : item))} /> : value },
    ...(project?.projectType === '复盘' ? [{ title: '财务监督人', width: 130, render: () => <Typography.Text>徐博</Typography.Text> }] : []),
    { title: '资产清单', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenPlanAssets(row)}>查看</Button> },
  ];

  if (reviewOpen && submission) return <InventoryReplayReview project={project} plans={submission.plans || visibleRows} assetsForPlan={(row) => submission.assetsByPlan?.[row.planNo] || assetsForPlan(row)} submission={submission} onBack={() => setReviewOpen(false)} />;

  if (locationChangeOpen) return <InventoryLocationChangeFlow project={project} projectAssets={projectAssets} currentOperator={currentOperator} initialRequestId={locationRequestId} onBack={() => setLocationChangeOpen(false)} />;

  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}<PageTitle>盘点计划</PageTitle><ProjectInfoCard project={project} />
    <Card size="small" title={<SectionCardTitle>盘点计划明细</SectionCardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
      <QueryBar onQuery={() => { setAppliedFilters({ ...draftFilters }); setSelectedKeys([]); }} onReset={() => { setDraftFilters(EMPTY_PLAN_FILTERS); setAppliedFilters(EMPTY_PLAN_FILTERS); setSelectedKeys([]); }}>
        <QueryItem label="计划编码"><Input value={draftFilters.planNo} allowClear placeholder="请输入计划编码" onChange={(event) => updateFilter('planNo', event.target.value)} /></QueryItem>
        <QueryItem label="计划名称"><Input value={draftFilters.planName} allowClear placeholder="请输入计划名称" onChange={(event) => updateFilter('planName', event.target.value)} /></QueryItem>
        <QueryItem label="计划状态"><Select value={draftFilters.planStatus || undefined} allowClear placeholder="请选择" options={['草稿', '盘点中', '审核中', '已审核', '关闭'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('planStatus', value)} /></QueryItem>
        <QueryItem label="子公司"><AssetValueSelect rows={visibleRows} field="organization" value={draftFilters.organization} onChange={(value) => updateFilter('organization', value)} /></QueryItem>
        <QueryItem label="盘点范围"><Select value={draftFilters.range || undefined} allowClear placeholder="请选择" options={rangeOptions.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('range', value)} /></QueryItem>
      </QueryBar>
      <div className="mb-3 flex justify-end"><Space wrap>{!projectClosed && canManualCreate && <Button icon={<Plus size={14} />} onClick={onManualCreate}>手工创建计划</Button>}{!projectClosed && <Button onClick={openBatchDate}>批量编辑盘点日期</Button>}<Button type="primary" icon={<PlayCircle size={14} />} disabled={projectClosed || allStarted || !allSelectedDraft} onClick={handleStart}>启动盘点计划</Button><Button danger icon={<Trash2 size={14} />} disabled={!allSelectedDraft} onClick={handleDelete}>删除盘点计划</Button>{!projectClosed && <Button icon={<Upload size={14} />}>{anyStarted ? '导入盘点结果' : '导入'}</Button>}<Button icon={<Download size={14} />} onClick={exportPlans}>导出</Button>{project?.projectType === '复盘' && <Button disabled={projectClosed} onClick={openLocationDraft}>发起位置变更</Button>}{Boolean(locationRequests.length) && <Button onClick={() => setLocationRecordsOpen(true)}>位置变更记录</Button>}{!projectClosed && project?.projectType === '复盘' && anyStarted && !submission && <Button type="primary" onClick={submitReview}>提交审批</Button>}{submission && <Button onClick={() => setReviewOpen(true)}>查看审批</Button>}{!projectClosed && anyStarted && <Button icon={<BellRing size={14} />} onClick={() => messageApi.success('已发送盘点通知和待办')}>发送盘点通知</Button>}</Space></div>
      <Table rowKey="key" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true, getCheckboxProps: () => ({ disabled: projectClosed }) }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </Card>
    <div className="flex justify-center pb-2"><Button onClick={onBack}>返回</Button></div>
    <Modal open={locationRecordsOpen} title="位置变更记录" width={960} footer={null} onCancel={() => setLocationRecordsOpen(false)}>
      <Table rowKey="id" size="small" pagination={false} dataSource={locationRequests} columns={[
        {title:'申请单号',dataIndex:'id'}, {title:'申请人',dataIndex:'applicant'}, {title:'申请时间',dataIndex:'appliedAt'}, {title:'审批状态',dataIndex:'status'},
        {title:'操作',render:(_,row)=><Button type="link" onClick={() => {setLocationRequestId(row.id);setLocationRecordsOpen(false);setLocationChangeOpen(true);}}>查看</Button>},
      ]}/>
    </Modal>
    <Modal open={batchDateOpen} title="批量编辑盘点日期" width={560} okText="确定" cancelText="取消" onCancel={() => setBatchDateOpen(false)} onOk={saveBatchDates}>
      <Alert type="info" showIcon className="mb-4" message="保存后将统一修改当前全部盘点计划的盘点开始日期和盘点结束日期。" />
      <div className="grid grid-cols-2 gap-4 py-2"><div><Typography.Text type="secondary">盘点开始日期</Typography.Text><DatePicker className="w-full" value={batchDates.startDate ? dayjs(batchDates.startDate) : null} onChange={(date) => setBatchDates((current) => ({ ...current, startDate: date ? date.format('YYYY-MM-DD') : '', endDate: project?.projectType === '复盘' ? (date ? date.format('YYYY-MM-DD') : '') : current.endDate }))} /></div><div><Typography.Text type="secondary">盘点结束日期</Typography.Text><DatePicker className="w-full" value={batchDates.endDate ? dayjs(batchDates.endDate) : null} disabledDate={(date) => batchDates.startDate && (project?.projectType === '复盘' ? !date.isSame(dayjs(batchDates.startDate), 'day') : date.isBefore(dayjs(batchDates.startDate), 'day'))} onChange={(date) => setBatchDates((current) => ({ ...current, endDate: date ? date.format('YYYY-MM-DD') : '' }))} /></div></div>
    </Modal>

  </Space>;
}
