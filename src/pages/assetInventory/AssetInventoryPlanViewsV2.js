import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import {
  BellRing,
  Download,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import { ASSET_ROWS, EMPLOYEE_ROWS, INITIAL_PLAN_ROWS } from './mockData';

const EMPTY_PLAN_FILTERS = {
  planNo: '',
  planName: '',
  planStatus: '',
  city: '',
  organization: '',
  range: '',
};

const EMPTY_ASSET_FILTERS = {
  assetTag: '',
  category: '',
  serialNo: '',
  description: '',
  useStatus: '',
  owner: '',
  ownerDept: '',
  ownerLevel: '',
  supervisor: '',
  executor: '',
  city: '',
  building: '',
  enableFrom: '',
  enableTo: '',
  inventoryStatus: '',
  costCenter: '',
  noStatus: '',
};

const RANGE_OPTIONS = ['员工', '库房', '公共', '机房'];

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

function formatMoney(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PageTitle({ children }) {
  return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>;
}

function CardTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded bg-[#1677ff]" />
      <span>{children}</span>
    </div>
  );
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
        <DetailItem label="项目状态"><StatusTag value={project?.status || '生成盘点计划'} /></DetailItem>
      </DetailGrid>
    </Card>
  );
}

function DateFilter({ value, onChange, placeholder }) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      format="YYYY-MM-DD"
      placeholder={placeholder}
      style={{ width: '100%' }}
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
    />
  );
}

function PersonnelInput({ value, onClick, disabled = false }) {
  if (disabled) return <Typography.Text>{value || '-'}</Typography.Text>;
  return (
    <Input
      value={value === '-' ? '' : (value || '')}
      readOnly
      placeholder="请选择"
      suffix={<Search size={14} className="text-[#1677ff]" />}
      onClick={onClick}
      onChange={() => {}}
    />
  );
}

function ManualPlanModal({ open, onCancel, onConfirm }) {
  const [planName, setPlanName] = useState('自定义盘点计划');
  const [rows, setRows] = useState(() => RANGE_OPTIONS.map((range) => ({
    key: range,
    range,
    manager: '',
    supervisor: '',
    executor: '',
  })));
  const [personTarget, setPersonTarget] = useState(null);

  const updatePerson = (record) => {
    if (!personTarget) return;
    setRows((current) => current.map((row) => (
      row.key === personTarget.key
        ? { ...row, [personTarget.field]: record.employeeName }
        : row
    )));
    setPersonTarget(null);
  };

  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '计划负责人', dataIndex: 'manager', width: 170, render: (value, row) => <PersonnelInput value={value} onClick={() => setPersonTarget({ key: row.key, field: 'manager' })} /> },
    { title: '盘点监督人', dataIndex: 'supervisor', width: 170, render: (value, row) => <PersonnelInput value={value} onClick={() => setPersonTarget({ key: row.key, field: 'supervisor' })} /> },
    { title: '盘点执行人', dataIndex: 'executor', width: 170, render: (value, row) => <PersonnelInput value={value} onClick={() => setPersonTarget({ key: row.key, field: 'executor' })} /> },
  ];

  return (
    <>
      <Modal
        open={open}
        title="自定义创建盘点计划"
        width={820}
        okText="生成计划"
        cancelText="取消"
        onCancel={onCancel}
        onOk={() => onConfirm({ planName, rows })}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Alert type="info" showIcon message="自定义计划从执行盘点资产清单中筛选资产，可按盘点范围分别配置计划负责人、盘点监督人、盘点执行人；未填写时沿用自动生成规则。" />
          <div>
            <Typography.Text type="secondary">计划名称</Typography.Text>
            <Input value={planName} onChange={(event) => setPlanName(event.target.value)} />
          </div>
          <Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} pagination={false} />
        </Space>
      </Modal>
      <SelectModal
        open={Boolean(personTarget)}
        title="用户列表"
        rowKey="id"
        dataSource={EMPLOYEE_ROWS}
        searchFields={[
          { label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' },
          { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' },
          { label: '部门名称', name: 'department', dataIndex: 'department' },
        ]}
        columns={[
          { title: '员工编号', dataIndex: 'employeeNo' },
          { title: '员工姓名', dataIndex: 'employeeName' },
          { title: '部门名称', dataIndex: 'department' },
        ]}
        onCancel={() => setPersonTarget(null)}
        onConfirm={updatePerson}
      />
    </>
  );
}

export function AssetInventoryPlansV2({ project, onBack, onOpenPlanAssets }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [rows, setRows] = useState(INITIAL_PLAN_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [personTarget, setPersonTarget] = useState(null);
  const [customPlanOpen, setCustomPlanOpen] = useState(false);
  const [batchDateOpen, setBatchDateOpen] = useState(false);
  const [batchDates, setBatchDates] = useState({ startDate: '', endDate: '' });

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.planNo, appliedFilters.planNo)
    && includesText(row.planName, appliedFilters.planName)
    && includesText(row.status, appliedFilters.planStatus)
    && includesText(row.city, appliedFilters.city)
    && includesText(row.organization, appliedFilters.organization)
    && includesText(row.range, appliedFilters.range)
  )), [rows, appliedFilters]);

  const editable = (row) => row.status === '暂存';
  const selectedRows = rows.filter((row) => selectedKeys.includes(row.key));
  const allSelectedDraft = selectedRows.length > 0 && selectedRows.every((row) => row.status === '暂存');
  const anyStarted = rows.some((row) => row.status === '启动');

  const openPersonnel = (rowKey, field) => setPersonTarget({ rowKey, field });

  const applyPersonnel = (record) => {
    if (!personTarget) return;
    setRows((current) => current.map((row) => (
      row.key === personTarget.rowKey
        ? { ...row, [personTarget.field]: record.employeeName }
        : row
    )));
    setPersonTarget(null);
  };

  const handleStart = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择需要启动的盘点计划');
      return;
    }
    const selected = new Set(selectedKeys);
    const missing = rows.find((row) => selected.has(row.key) && (!row.manager || !row.executor));
    if (missing) {
      Modal.warning({
        title: '人员配置不完整',
        content: `盘点计划 ${missing.planNo} 未完整配置计划负责人/盘点执行人，请先完成配置。`,
      });
      return;
    }
    setRows((current) => current.map((row) => selected.has(row.key) ? { ...row, status: '启动' } : row));
    setSelectedKeys([]);
    messageApi.success('盘点计划已启动，盘点执行人狐小e盘点入口已开放，并发送待办及通知');
  };

  const handleDelete = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择需要删除的盘点计划');
      return;
    }
    const selected = new Set(selectedKeys);
    if (rows.some((row) => selected.has(row.key) && row.status !== '暂存')) {
      messageApi.warning('仅暂存状态的盘点计划可删除');
      return;
    }
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点计划');
  };

  const openBatchDate = () => {
    if (!allSelectedDraft) return;
    const first = selectedRows[0];
    setBatchDates({ startDate: first.startDate || '', endDate: first.endDate || '' });
    setBatchDateOpen(true);
  };

  const saveBatchDates = () => {
    if (!batchDates.startDate || !batchDates.endDate) {
      messageApi.warning('请完整填写盘点开始日期和盘点结束日期');
      return;
    }
    if (batchDates.endDate < batchDates.startDate) {
      messageApi.warning('盘点结束日期不能早于盘点开始日期');
      return;
    }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? {
      ...row,
      startDate: batchDates.startDate,
      endDate: batchDates.endDate,
    } : row));
    setBatchDateOpen(false);
    messageApi.success(`已批量更新 ${selectedKeys.length} 个盘点计划的盘点日期`);
  };

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 170, fixed: 'left' },
    { title: '计划名称', dataIndex: 'planName', width: 190 },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: 'City', dataIndex: 'city', width: 120 },
    ...(project?.projectType === '复盘'
      ? [
        { title: '财务监督人', dataIndex: 'financialSupervisor', width: 130, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'financialSupervisor')} /> },
        { title: '内审监督人', dataIndex: 'auditSupervisor', width: 130, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'auditSupervisor')} /> },
      ]
      : []),
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100, align: 'right' },
    {
      title: '盘点开始日期',
      dataIndex: 'startDate',
      width: 145,
      render: (value, row) => editable(row)
        ? <DatePicker value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, startDate: date ? date.format('YYYY-MM-DD') : '' } : item))} />
        : value,
    },
    {
      title: '盘点结束日期',
      dataIndex: 'endDate',
      width: 145,
      render: (value, row) => editable(row)
        ? <DatePicker value={value ? dayjs(value) : null} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, endDate: date ? date.format('YYYY-MM-DD') : '' } : item))} />
        : value,
    },
    { title: '计划负责人', dataIndex: 'manager', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'manager')} /> },
    ...(project?.projectType === '复盘' ? [] : [{ title: '计划监督人', dataIndex: 'supervisor', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'supervisor')} /> }]),
    { title: '盘点执行人', dataIndex: 'executor', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'executor')} /> },
    { title: '资产清单', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenPlanAssets(row)}>查看</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点计划</PageTitle>
      <ProjectInfoCard project={project} />

      <QueryBar
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setSelectedKeys([]);
        }}
        onReset={() => {
          setDraftFilters(EMPTY_PLAN_FILTERS);
          setAppliedFilters(EMPTY_PLAN_FILTERS);
          setSelectedKeys([]);
        }}
      >
        <QueryItem label="计划编码"><Input value={draftFilters.planNo} allowClear placeholder="请输入计划编码" onChange={(event) => updateFilter('planNo', event.target.value)} /></QueryItem>
        <QueryItem label="计划名称"><Input value={draftFilters.planName} allowClear placeholder="请输入计划名称" onChange={(event) => updateFilter('planName', event.target.value)} /></QueryItem>
        <QueryItem label="计划状态"><Select value={draftFilters.planStatus || undefined} allowClear placeholder="请选择" options={['暂存', '启动', '关闭'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('planStatus', value)} /></QueryItem>
        <QueryItem label="City"><Input value={draftFilters.city} allowClear placeholder="请输入City" onChange={(event) => updateFilter('city', event.target.value)} /></QueryItem>
        <QueryItem label="盘点组织"><Input value={draftFilters.organization} allowClear placeholder="请输入盘点组织" onChange={(event) => updateFilter('organization', event.target.value)} /></QueryItem>
        <QueryItem label="盘点范围"><Select value={draftFilters.range || undefined} allowClear placeholder="请选择" options={RANGE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('range', value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>盘点计划明细</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            {!anyStarted && <Button icon={<Plus size={14} />} onClick={() => setCustomPlanOpen(true)}>手工创建计划</Button>}
            {!anyStarted && <Button disabled={!allSelectedDraft} onClick={openBatchDate}>批量编辑盘点日期</Button>}
            {allSelectedDraft && <Button type="primary" icon={<PlayCircle size={14} />} onClick={handleStart}>启动盘点计划</Button>}
            {allSelectedDraft && <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除盘点计划</Button>}
            <Button icon={<Upload size={14} />}>{anyStarted ? '导入盘点结果' : '导入'}</Button>
            <Button icon={<Download size={14} />}>导出</Button>
            {project?.projectType === '复盘' && anyStarted && <Button type="primary">提交审核</Button>}
            {anyStarted && <Button icon={<BellRing size={14} />} onClick={() => messageApi.success('已向盘点监督人、盘点执行人发送盘点通知和待办')}>发送盘点通知</Button>}
          </Space>
        </div>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <div className="flex justify-center pb-2">
        <Button onClick={onBack}>返回</Button>
      </div>

      <Modal
        open={batchDateOpen}
        title="批量编辑盘点日期"
        width={560}
        okText="确定"
        cancelText="取消"
        onCancel={() => setBatchDateOpen(false)}
        onOk={saveBatchDates}
      >
        <div className="grid grid-cols-2 gap-4 py-2">
          <div>
            <Typography.Text type="secondary">盘点开始日期</Typography.Text>
            <DatePicker className="w-full" value={batchDates.startDate ? dayjs(batchDates.startDate) : null} onChange={(date) => setBatchDates((current) => ({ ...current, startDate: date ? date.format('YYYY-MM-DD') : '' }))} />
          </div>
          <div>
            <Typography.Text type="secondary">盘点结束日期</Typography.Text>
            <DatePicker className="w-full" value={batchDates.endDate ? dayjs(batchDates.endDate) : null} disabledDate={(date) => batchDates.startDate && date.isBefore(dayjs(batchDates.startDate), 'day')} onChange={(date) => setBatchDates((current) => ({ ...current, endDate: date ? date.format('YYYY-MM-DD') : '' }))} />
          </div>
        </div>
      </Modal>

      <SelectModal
        open={Boolean(personTarget)}
        title="用户列表"
        rowKey="id"
        dataSource={EMPLOYEE_ROWS}
        searchFields={[
          { label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' },
          { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' },
          { label: '部门名称', name: 'department', dataIndex: 'department' },
        ]}
        columns={[
          { title: '员工编号', dataIndex: 'employeeNo' },
          { title: '员工姓名', dataIndex: 'employeeName' },
          { title: '部门名称', dataIndex: 'department' },
        ]}
        onCancel={() => setPersonTarget(null)}
        onConfirm={applyPersonnel}
      />

      <ManualPlanModal
        open={customPlanOpen}
        onCancel={() => setCustomPlanOpen(false)}
        onConfirm={({ planName }) => {
          setRows((current) => [...current, {
            ...INITIAL_PLAN_ROWS[0],
            key: `manual-${Date.now()}`,
            planNo: `PLAN-20260818-${String(current.length + 1).padStart(4, '0')}`,
            planName,
          }]);
          setCustomPlanOpen(false);
          messageApi.success('手工盘点计划已生成');
        }}
      />
    </Space>
  );
}

export function AssetInventoryPlanAssetListV2({ plan, onBack }) {
  const [rows, setRows] = useState(() => ASSET_ROWS.filter((asset) => asset.planNo === plan.planNo || asset.inventoryRange === plan.range));
  const [draftFilters, setDraftFilters] = useState(EMPTY_ASSET_FILTERS);
  const [filters, setFilters] = useState(EMPTY_ASSET_FILTERS);
  const [personTarget, setPersonTarget] = useState(null);

  const updateDraft = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.assetTag, filters.assetTag)
    && includesText(`${row.category} ${row.subCategory}`, filters.category)
    && includesText(row.serialNo, filters.serialNo)
    && includesText(row.description, filters.description)
    && includesText(row.useStatus, filters.useStatus)
    && includesText(row.owner, filters.owner)
    && includesText(row.ownerDept, filters.ownerDept)
    && includesText(row.ownerLevel, filters.ownerLevel)
    && includesText(row.supervisor, filters.supervisor)
    && includesText(row.executor, filters.executor)
    && includesText(row.city, filters.city)
    && includesText(row.building, filters.building)
    && includesText(row.inventoryStatus, filters.inventoryStatus)
    && includesText(row.costCenter, filters.costCenter)
    && inDateRange(row.enableDate, filters.enableFrom, filters.enableTo)
  )), [rows, filters]);

  const applyPersonnel = (record) => {
    if (!personTarget) return;
    setRows((current) => current.map((row) => (
      row.key === personTarget.rowKey
        ? { ...row, [personTarget.field]: record.employeeName }
        : row
    )));
    setPersonTarget(null);
  };

  const columns = [
    { title: '盘点范围', dataIndex: 'inventoryRange', width: 100, fixed: 'left' },
    { title: '盘点状态', dataIndex: 'inventoryStatus', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '资产盘点人', dataIndex: 'counter', width: 130 },
    { title: '盘点日期', dataIndex: 'inventoryDate', width: 120 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'serialNo', width: 140 },
    { title: '资产大类', dataIndex: 'category', width: 110 },
    { title: '资产小类', dataIndex: 'subCategory', width: 180 },
    { title: '资产说明', dataIndex: 'description', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatMoney },
    { title: 'EBS原值', dataIndex: 'ebsOriginalValue', width: 110, align: 'right', render: formatMoney },
    { title: '净值', dataIndex: 'netValue', width: 100, align: 'right', render: formatMoney },
    { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'NO位置', dataIndex: 'noLocation', width: 120 },
    { title: '盘点说明', dataIndex: 'inventoryNote', width: 160 },
    { title: '使用说明', dataIndex: 'useDescription', width: 160 },
    { title: '备注', dataIndex: 'remark', width: 130 },
    { title: '资产责任人', dataIndex: 'owner', width: 150 },
    { title: '责任人部门', dataIndex: 'ownerDept', width: 200 },
    { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 },
    { title: '账套', dataIndex: 'organization', width: 120 },
    { title: '未盘说明', dataIndex: 'inventoryNote', width: 160 },
    { title: '是否上传图片', dataIndex: 'needPhoto', width: 120, render: (value) => <StatusTag value={value ? '是' : '否'} /> },
    { title: '现资产责任人', dataIndex: 'currentOwner', width: 150 },
    { title: '现资产责任人部门', dataIndex: 'currentOwnerDept', width: 200 },
    { title: '计划负责人', dataIndex: 'planManager', width: 140 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: 'Building', dataIndex: 'building', width: 170 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: '成本中心', dataIndex: 'costCenter', width: 180 },
    { title: '启用日期', dataIndex: 'enableDate', width: 120 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 140 },
    {
      title: '盘点监督人',
      dataIndex: 'supervisor',
      width: 170,
      fixed: 'right',
      render: (value, row) => <PersonnelInput value={value} onClick={() => setPersonTarget({ rowKey: row.key, field: 'supervisor' })} />,
    },
    {
      title: '盘点执行人',
      dataIndex: 'executor',
      width: 170,
      fixed: 'right',
      render: (value, row) => <PersonnelInput value={value} onClick={() => setPersonTarget({ rowKey: row.key, field: 'executor' })} />,
    },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <PageTitle>盘点计划资产清单</PageTitle>

      <QueryBar
        onQuery={() => setFilters({ ...draftFilters })}
        onReset={() => {
          setDraftFilters(EMPTY_ASSET_FILTERS);
          setFilters(EMPTY_ASSET_FILTERS);
        }}
      >
        <QueryItem label="资产标签号"><Input value={draftFilters.assetTag} allowClear onChange={(event) => updateDraft('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="资产类别"><Input value={draftFilters.category} allowClear onChange={(event) => updateDraft('category', event.target.value)} /></QueryItem>
        <QueryItem label="序列号"><Input value={draftFilters.serialNo} allowClear onChange={(event) => updateDraft('serialNo', event.target.value)} /></QueryItem>
        <QueryItem label="资产说明"><Input value={draftFilters.description} allowClear onChange={(event) => updateDraft('description', event.target.value)} /></QueryItem>
        <QueryItem label="使用状态"><Input value={draftFilters.useStatus} allowClear onChange={(event) => updateDraft('useStatus', event.target.value)} /></QueryItem>
        <QueryItem label="资产责任人"><Input value={draftFilters.owner} allowClear onChange={(event) => updateDraft('owner', event.target.value)} /></QueryItem>
        <QueryItem label="责任人部门"><Input value={draftFilters.ownerDept} allowClear onChange={(event) => updateDraft('ownerDept', event.target.value)} /></QueryItem>
        <QueryItem label="责任人职级"><Input value={draftFilters.ownerLevel} allowClear onChange={(event) => updateDraft('ownerLevel', event.target.value)} /></QueryItem>
        <QueryItem label="盘点监督人"><Input value={draftFilters.supervisor} allowClear onChange={(event) => updateDraft('supervisor', event.target.value)} /></QueryItem>
        <QueryItem label="盘点执行人"><Input value={draftFilters.executor} allowClear onChange={(event) => updateDraft('executor', event.target.value)} /></QueryItem>
        <QueryItem label="City"><Input value={draftFilters.city} allowClear onChange={(event) => updateDraft('city', event.target.value)} /></QueryItem>
        <QueryItem label="Building"><Input value={draftFilters.building} allowClear onChange={(event) => updateDraft('building', event.target.value)} /></QueryItem>
        <QueryItem label="启用日期从"><DateFilter value={draftFilters.enableFrom} onChange={(value) => updateDraft('enableFrom', value)} /></QueryItem>
        <QueryItem label="启用日期至"><DateFilter value={draftFilters.enableTo} onChange={(value) => updateDraft('enableTo', value)} /></QueryItem>
        <QueryItem label="盘点状态"><Select value={draftFilters.inventoryStatus || undefined} allowClear options={['未盘', '已盘', '代盘', '报失'].map((value) => ({ label: value, value }))} onChange={(value) => updateDraft('inventoryStatus', value)} /></QueryItem>
        <QueryItem label="成本中心"><Input value={draftFilters.costCenter} allowClear onChange={(event) => updateDraft('costCenter', event.target.value)} /></QueryItem>
        <QueryItem label="NO状态"><Input value={draftFilters.noStatus} allowClear onChange={(event) => updateDraft('noStatus', event.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>资产清单</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <div className="flex justify-center pb-2">
        <Button onClick={onBack}>返回</Button>
      </div>

      <SelectModal
        open={Boolean(personTarget)}
        title="用户列表"
        rowKey="id"
        dataSource={EMPLOYEE_ROWS}
        searchFields={[
          { label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' },
          { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' },
          { label: '部门名称', name: 'department', dataIndex: 'department' },
        ]}
        columns={[
          { title: '员工编号', dataIndex: 'employeeNo' },
          { title: '员工姓名', dataIndex: 'employeeName' },
          { title: '部门名称', dataIndex: 'department' },
        ]}
        onCancel={() => setPersonTarget(null)}
        onConfirm={applyPersonnel}
      />
    </Space>
  );
}
