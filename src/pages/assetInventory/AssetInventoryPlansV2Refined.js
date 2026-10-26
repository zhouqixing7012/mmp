import { inventoryManagementBlockReason } from './inventoryManagementPermissions';
import InventoryScanResultImport from './InventoryScanResultImport';
import { applyInventoryScanResults } from './inventoryScanResultImport';
import { AssetValueSelect, matchesQuerySelection } from '../../components/AssetQueryControls';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { BellRing, Download, PlayCircle, Plus, Search, Trash2, Upload } from 'lucide-react';
import SelectModal from '../../components/SelectModal';
import { applyInventoryPersonnelChange, canEditInventoryPersonnel, inventoryPersonnelCandidates, inventoryPlanFinanceBlockReason } from './inventoryPlanPersonnel';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { useAssetInventoryVariant } from './AssetInventoryVariantContext';
import SectionCardTitle from './SectionCardTitle';
import { inventoryProjectDateBlockReason } from './inventoryDateRules';
import { planPersonnelBlockReason } from './inventoryPlanStartRules';
import { calculateInventorySnapshotStats } from './inventorySnapshotStats';
import InventoryReplayReview from './InventoryReplayReview';
import InventoryLocationChangeFlow from './InventoryLocationChangeFlow';
import { buildReviewRows } from './AssetInventoryImageReviewV2';
import { applyReplayPlanStatuses, decideReplayReview, getReplaySubmission, getReplayReviewForPlan, getReplayProjectReview, replayProjectSubmissionBlockReason, submitReplayProjectReview, submitReplayReview } from './inventoryReplayReviewStore';
import { downloadInventoryPlans, selectInventoryExportRows } from './inventoryPlanExport';
import { buildReplayPreparationNotices } from './inventoryReplayPreparation';
import { schedulePreparationNotices } from './inventoryPreparationNoticeStore';

const EMPTY_PLAN_FILTERS = { planNo: '', planName: '', planStatus: '', organization: '', range: '' };
const planRanges = row => row.ranges || [row.range];
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

export default function AssetInventoryPlansV2Refined({ project, currentOperator, onBack, onOpenPlanAssets, rows, setRows, assetsForPlan, canManualCreate, onManualCreate, onGenerateRemainingDefault, onPlansStarted, onChangePlanAssets, onReviewChanged, onPlansDeleted }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const rangeOptions = RANGE_OPTIONS.filter((range) => allowedRanges.includes(range));
  const projectClosed = project?.status === '盘点关闭';
  const managementBlock = inventoryManagementBlockReason(project, currentOperator);
  const ensureManager = () => { if (managementBlock) { messageApi.warning(managementBlock); return false; } return true; };
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [batchDateOpen, setBatchDateOpen] = useState(false);
  const [batchDates, setBatchDates] = useState({ startDate: '', endDate: '' });
  const [personTarget, setPersonTarget] = useState(null);
  const [locationPoolOpen, setLocationPoolOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [editPlanKey, setEditPlanKey] = useState(null);
  const [submissionState, setSubmissionState] = useState(() => ({ projectNo: project?.projectNo, value: getReplaySubmission(project?.projectNo) }));
  const submission = submissionState.projectNo === project?.projectNo ? submissionState.value : getReplaySubmission(project?.projectNo);
  useEffect(() => {
    setSubmissionState({ projectNo: project?.projectNo, value: getReplaySubmission(project?.projectNo) });
    setReviewTarget(null); setEditPlanKey(null); setSelectedKeys([]);
  }, [project?.projectNo]);
  const visibleRows = applyReplayPlanStatuses(rows, submission, project?.projectNo).filter(row => planRanges(row).some(range => allowedRanges.includes(range))).map(row => {
    const stats = calculateInventorySnapshotStats(assetsForPlan(row), []);
    const personnel = field => [...new Set(assetsForPlan(row).map(asset => asset[field]).filter(value => value && value !== '-'))].join('、') || '-';
    return { ...row, supervisor: personnel('supervisor'), executor: personnel('executor'), assetCount: stats.execution, countedCount: stats.counted, uncountedCount: stats.uncounted,
      status: projectClosed ? '关闭' : row.status };
  });
  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const filteredRows = useMemo(() => visibleRows.filter((row) => includesText(row.planNo, appliedFilters.planNo) && includesText(row.planName, appliedFilters.planName) && includesText(row.status, appliedFilters.planStatus) && matchesQuerySelection(row.organization, appliedFilters.organization) && (!appliedFilters.range || planRanges(row).includes(appliedFilters.range))), [visibleRows, appliedFilters]);
  const editable = (row) => !managementBlock && !projectClosed && row.status === '草稿';
  const selectedRows = visibleRows.filter((row) => selectedKeys.includes(row.key));
  const allSelectedDraft = !managementBlock && !projectClosed && selectedRows.length > 0 && selectedRows.every((row) => row.status === '草稿');
  const anyStarted = visibleRows.some((row) => row.status === '盘点中');
  const allStarted = visibleRows.length > 0 && visibleRows.every((row) => row.status === '盘点中' || row.status === '关闭');


  const handleStart = () => {
    if (!ensureManager()) return;
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    if (!selectedKeys.length) { messageApi.warning('请先选择需要启动的盘点计划'); return; }
    if (canManualCreate) {
      Modal.confirm({ title: '有资产未生成盘点计划，是否按默认方式生成？', okText: '默认生成', cancelText: '手工创建',
        onOk: onGenerateRemainingDefault, onCancel: onManualCreate });
      return;
    }
    const invalid = selectedRows.map((row) => inventoryProjectDateBlockReason(row.startDate, row.endDate)).find(Boolean);
    if (invalid) { messageApi.warning(invalid); return; }
    const personnelBlock = selectedRows.map((row) => planPersonnelBlockReason(row, assetsForPlan(row), project)).find(Boolean);
    if (personnelBlock) { messageApi.warning(personnelBlock); return; }
    const financeBlock = selectedRows.map(row => inventoryPlanFinanceBlockReason(project, assetsForPlan(row))).find(Boolean);
    if (financeBlock) { messageApi.warning(financeBlock); return; }
    const unnamed = selectedRows.find(row => String(row.key).startsWith('manual-') && !String(row.planName || '').trim());
    if (unnamed) { messageApi.warning('自定义计划名称必填'); return; }
    let notices;
    try {
      notices = buildReplayPreparationNotices(project, selectedRows, assetsForPlan, dayjs().format('YYYY-MM-DD'));
      schedulePreparationNotices(project.projectNo, notices);
    } catch (error) { messageApi.error(error.message); return; }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? { ...row, status: '盘点中', reviewInstanceKey: row.reviewInstanceKey || `${project.projectNo}:${row.key}:${Date.now()}:${Math.random().toString(36).slice(2)}`, preparationNoticeDate: notices.find(notice => notice.planNo === row.planNo)?.scheduledDate || '' } : row));
    onPlansStarted?.({ ...project, status: '盘点中' });
    setSelectedKeys([]);
    messageApi.success(notices.length ? `盘点计划已启动，已安排 ${notices.length} 条资产准备通知` : '盘点计划已启动');
  };

  const exportPlans = () => {
    const exportRows = selectInventoryExportRows(filteredRows, visibleRows, selectedKeys);
    if (!exportRows.length) { messageApi.warning('没有可导出的盘点计划'); return; }
    try { downloadInventoryPlans(exportRows, assetsForPlan, project.projectNo, { project }); }
    catch (error) { messageApi.error('盘点计划导出失败，请重试'); }
  };

  const handleDelete = () => {
    if (!ensureManager()) return;
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    if (!selectedKeys.length) { messageApi.warning('请先选择需要删除的盘点计划'); return; }
    const selected = new Set(selectedKeys);
    if (visibleRows.some((row) => selected.has(row.key) && row.status !== '草稿')) { messageApi.warning('仅草稿状态的盘点计划可删除'); return; }
    const deleted = visibleRows.filter(row => selected.has(row.key));
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    onPlansDeleted?.(deleted);
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点计划');
  };

  const openBatchDate = () => {
    if (!ensureManager()) return;
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    const first = visibleRows[0];
    setBatchDates({ startDate: first?.startDate || '', endDate: first?.endDate || '' });
    setBatchDateOpen(true);
  };

  const saveBatchDates = () => {
    if (!ensureManager()) return;
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    const dateBlockReason = inventoryProjectDateBlockReason(batchDates.startDate, batchDates.endDate);
    if (dateBlockReason) { messageApi.warning(dateBlockReason); return; }
    setRows((current) => current.map((row) => planRanges(row).some(range => allowedRanges.includes(range)) && row.status === '草稿' ? { ...row, startDate: batchDates.startDate, endDate: batchDates.endDate } : row));
    setBatchDateOpen(false);
    messageApi.success(`已统一更新 ${visibleRows.filter(row => row.status === '草稿').length} 个草稿盘点计划的盘点日期`);
  };

  const syncSubmission = next => {
    setSubmissionState({ projectNo: project.projectNo, value: next });
    setRows(current => applyReplayPlanStatuses(current, next));
    onReviewChanged?.(next);
  };
  const submitReview = plan => {
    if (!ensureManager()) return;
    try {
      const next = submitReplayReview({ project, plans: [plan], assetsForPlan, photoRows: buildReviewRows(project.projectNo, allowedRanges), operator: currentOperator });
      syncSubmission(next);
      setEditPlanKey(null);
      setReviewTarget({ scope: 'plan', planNo: plan.planNo, key: plan.key });
    } catch (error) { messageApi.warning(error.message); }
  };
  const submitProjectReview = () => {
    if (!ensureManager()) return;
    try {
      const next = submitReplayProjectReview({ project, plans: rows, operator: currentOperator });
      syncSubmission(next);
      setReviewTarget({ scope: 'project' });
    } catch (error) { messageApi.error(error.message); }
  };
  const activePlan = rows.find(plan => plan.planNo === reviewTarget?.planNo && plan.key === reviewTarget?.key);
  const projectReview = getReplayProjectReview(submission, rows, project.projectNo);
  const activeReview = reviewTarget?.scope === 'project' ? projectReview : activePlan ? getReplayReviewForPlan(submission, activePlan, project.projectNo) : null;
  const editingPlan = visibleRows.find(plan => plan.key === editPlanKey);
  const selectedPlan = selectedRows.length === 1 ? selectedRows[0] : null;
  const decideReview = (decision, opinion) => {
    try {
      const next = decideReplayReview({ project, operator: currentOperator, decision, opinion, scope: reviewTarget.scope, planNo: reviewTarget.planNo, planKey: activeReview.plans[0]?.key, reviewInstanceKey: activeReview.plans[0]?.reviewInstanceKey, round: activeReview.round, plans: rows });
      syncSubmission(next);
      const review = reviewTarget.scope === 'project' ? next.projectReview : next.planReviews[reviewTarget.planNo];
      messageApi.success(decision === '驳回' ? '审批已驳回，可修改后重新提交' : review.status === '已审核' ? '审批已通过' : '已记录审批意见，等待其他计划监督人审核');
      return true;
    } catch (error) { messageApi.error(error.message); return false; }
  };

  const savePlanName = (row, event) => {
    const name = event.target.value.trim();
    if (!editable(row)) return;
    if (String(row.key).startsWith('manual-') && !name) { messageApi.warning('自定义计划名称必填'); event.target.value = row.planName || ''; return; }
    setRows(current => current.map(plan => plan.key === row.key ? { ...plan, planName: name } : plan));
  };
  const choosePerson = person => {
    if (!ensureManager()) return;
    if (!personTarget) return;
    const plan = visibleRows.find(row => row.key === personTarget.key);
    try {
      if (!onChangePlanAssets) throw new Error('计划资产人员保存入口尚未接入');
      const assets = applyInventoryPersonnelChange(project, plan, assetsForPlan(plan), personTarget.field, person);
      onChangePlanAssets(plan, () => assets);
      setRows(current => current.map(row => row.key === plan.key ? { ...row, [personTarget.field]: person.employeeName } : row));
      setPersonTarget(null);
    } catch (error) { messageApi.error(error.message); }
  };
  const personnelColumn = (title, field) => ({ title, dataIndex: field, width: 180, render: (value, row) => !managementBlock && canEditInventoryPersonnel(project, row, null, field)
    ? <Input readOnly aria-label={`${row.planNo}-${title}`} value={value === '-' ? '' : value} placeholder="请选择" suffix={<Search size={14}/>} onClick={() => setPersonTarget({ key: row.key, field })}/>
    : <Typography.Text>{value || '-'}</Typography.Text> });

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 170, fixed: 'left', render: (value, row) => getReplayReviewForPlan(submission, row, project.projectNo) ? <Button type="link" onClick={() => setReviewTarget({ scope: 'plan', planNo: row.planNo, key: row.key })}>{value}</Button> : value },
    { title: '计划名称', dataIndex: 'planName', width: 190, render: (value, row) => editable(row) ? <Input aria-label={`${row.planNo}-计划名称`} defaultValue={value} onBlur={event => savePlanName(row, event)} onPressEnter={event => event.target.blur()}/> : value },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '子公司', dataIndex: 'organization', width: 140 },
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100, align: 'right' },
    { title: '盘点开始日期', dataIndex: 'startDate', width: 145, render: (value, row) => editable(row) ? <DatePicker aria-label={`${row.planNo}-盘点开始日期`} value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, startDate: date ? date.format('YYYY-MM-DD') : '' } : item))} /> : value },
    { title: '盘点结束日期', dataIndex: 'endDate', width: 145, render: (value, row) => editable(row) ? <DatePicker aria-label={`${row.planNo}-盘点结束日期`} value={value ? dayjs(value) : null} disabledDate={(date) => row.startDate && date.isBefore(dayjs(row.startDate), 'day')} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, endDate: date ? date.format('YYYY-MM-DD') : '' } : item))} /> : value },
    personnelColumn('盘点监督人', 'supervisor'),
    personnelColumn('盘点执行人', 'executor'),
    ...(project?.projectType === '复盘' ? [{ title: '财务监督人', width: 130, render: () => <Typography.Text>徐博</Typography.Text> }] : []),
    { title: '资产清单', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenPlanAssets(row)}>查看</Button> },
  ];

  if (locationPoolOpen) return <InventoryLocationChangeFlow project={project} onBack={() => setLocationPoolOpen(false)} />;

  if (editingPlan) return <InventoryReplayReview project={project} plans={[editingPlan]} assetsForPlan={assetsForPlan} submission={getReplayReviewForPlan(submission, editingPlan, project.projectNo) || { records: [] }} mode="edit" onSubmit={() => submitReview(editingPlan)} onBack={() => setEditPlanKey(null)} />;

  if (activeReview) return <InventoryReplayReview key={`${activeReview.scope}:${activeReview.planNo || 'project'}:${activeReview.round}`} project={project} plans={activeReview.plans} assetsForPlan={row => activeReview.assetsByPlan[row.planNo] || []} submission={activeReview} currentOperator={currentOperator} onDecide={decideReview} onBack={() => setReviewTarget(null)} />;

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
      <div className="mb-3 flex justify-end"><Space wrap>{!managementBlock && !projectClosed && canManualCreate && <Button icon={<Plus size={14} />} onClick={onManualCreate}>手工创建计划</Button>}{!managementBlock && !projectClosed && <Button onClick={openBatchDate}>批量编辑盘点日期</Button>}<Button type="primary" icon={<PlayCircle size={14} />} disabled={Boolean(managementBlock) || projectClosed || allStarted || !allSelectedDraft} onClick={handleStart}>启动盘点计划</Button><Button danger icon={<Trash2 size={14} />} disabled={!allSelectedDraft} onClick={handleDelete}>删除盘点计划</Button>{!projectClosed && (anyStarted ? <InventoryScanResultImport project={project} plans={visibleRows} entryType="execution" operator={currentOperator} assets={visibleRows.flatMap(plan => assetsForPlan(plan))} onImported={updates => visibleRows.forEach(plan => onChangePlanAssets?.(plan, current => applyInventoryScanResults(current, updates)))} /> : <Button icon={<Upload size={14} />} onClick={() => messageApi.warning('人员导入模板字段尚未配置，暂不能导入')}>导入</Button>)}<Button icon={<Download size={14} />} onClick={exportPlans}>导出</Button>{project?.projectType === '复盘' && <><Button disabled={Boolean(managementBlock) || projectClosed || !selectedPlan || selectedPlan.status !== '盘点中'} onClick={() => setEditPlanKey(selectedPlan.key)}>提交计划审批</Button><Button onClick={() => setLocationPoolOpen(true)}>位置变更池</Button><Button type="primary" disabled={Boolean(managementBlock || replayProjectSubmissionBlockReason(project, rows, submission))} onClick={submitProjectReview}>提交项目审批</Button>{projectReview && <Button onClick={() => setReviewTarget({ scope: 'project' })}>查看项目审批</Button>}</>}{!projectClosed && anyStarted && <Button icon={<BellRing size={14} />} onClick={() => messageApi.info('盘点通知服务尚未接入，当前未发送通知或待办')}>发送盘点通知</Button>}</Space></div>
      <Table rowKey="key" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true, getCheckboxProps: () => ({ disabled: projectClosed }) }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </Card>
    <div className="flex justify-center pb-2"><Button onClick={onBack}>返回</Button></div>
    <SelectModal open={Boolean(personTarget)} title="用户列表" rowKey="id" dataSource={inventoryPersonnelCandidates(project, personTarget?.field)} onCancel={() => setPersonTarget(null)} onConfirm={choosePerson}
      searchFields={[{ label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' }, { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' }, { label: '部门名称', name: 'department', dataIndex: 'department' }]}
      columns={[{ title: '员工编号', dataIndex: 'employeeNo' }, { title: '员工姓名', dataIndex: 'employeeName' }, { title: '部门名称', dataIndex: 'department' }]}/>
    <Modal open={batchDateOpen} title="批量编辑盘点日期" width={560} okText="确定" cancelText="取消" onCancel={() => setBatchDateOpen(false)} onOk={saveBatchDates}>
      <Alert type="info" showIcon className="mb-4" message="保存后将统一修改当前全部盘点计划的盘点开始日期和盘点结束日期。" />
      <div className="grid grid-cols-2 gap-4 py-2"><div><Typography.Text type="secondary">盘点开始日期</Typography.Text><DatePicker className="w-full" value={batchDates.startDate ? dayjs(batchDates.startDate) : null} onChange={(date) => setBatchDates((current) => ({ ...current, startDate: date ? date.format('YYYY-MM-DD') : '' }))} /></div><div><Typography.Text type="secondary">盘点结束日期</Typography.Text><DatePicker className="w-full" value={batchDates.endDate ? dayjs(batchDates.endDate) : null} disabledDate={(date) => batchDates.startDate && date.isBefore(dayjs(batchDates.startDate), 'day')} onChange={(date) => setBatchDates((current) => ({ ...current, endDate: date ? date.format('YYYY-MM-DD') : '' }))} /></div></div>
    </Modal>

  </Space>;
}
