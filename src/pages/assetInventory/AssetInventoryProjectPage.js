import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import {
  BellRing,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  PlayCircle,
  Plus,
  Save,
  ScanLine,
  Search,
  Settings,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  ASSET_ROWS,
  EMPLOYEE_ROWS,
  IMAGE_REVIEW_ROWS,
  IMAGE_RULE_ROWS,
  INITIAL_PLAN_ROWS,
  INVENTORY_RANGE_METHOD_ROWS,
  PROGRESS_DETAIL_ROWS,
  PROGRESS_ROWS,
  PROJECT_INFO,
  PROJECT_ROWS,
  SCOPE_ROWS,
  UNINCLUDED_ASSET_ROWS,
} from './mockData';

const EMPTY_PROJECT_FILTERS = {
  projectNo: '',
  projectName: '',
  status: '',
  owner: '',
  startFrom: '',
  startTo: '',
  type: '',
  createdFrom: '',
  createdTo: '',
};

const EMPTY_PLAN_FILTERS = {
  planNo: '',
  planName: '',
  assetStatus: '',
  city: '',
  organization: '',
};

const RANGE_OPTIONS = ['库房', '公共', '机房', '员工'];
const SCAN_METHOD_OPTIONS = ['狐小e扫码', '狐小e快速扫描资产', '扫码枪', '人工上传盘点结果'];
const PROJECT_STATUS_OPTIONS = ['暂存', '快照生成', '生成盘点计划', '盘点中', '盘点关闭'];
const PROJECT_TYPE_OPTIONS = ['初盘', '抽盘', '复盘'];

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

function ProjectInfoCard({ project = PROJECT_INFO, extended = false }) {
  return (
    <Card size="small" title={<CardTitle>盘点项目信息</CardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="项目编号">{project.projectNo || '-'}</DetailItem>
        <DetailItem label="项目名称">{project.projectName || '-'}</DetailItem>
        <DetailItem label="项目类型">{project.projectType || '-'}</DetailItem>
        <DetailItem label="盘点开始时间">{project.startDate || '-'}</DetailItem>
        <DetailItem label="盘点结束时间">{project.endDate || '-'}</DetailItem>
        <DetailItem label="项目状态"><StatusTag value={project.status || '暂存'} /></DetailItem>
        {extended && <DetailItem label="盘点类型">{project.inventoryType || '-'}</DetailItem>}
        {extended && <DetailItem label="盘点期间">{project.period || '-'}</DetailItem>}
        {extended && <DetailItem label="快照生成日期">{project.snapshotTime || '-'}</DetailItem>}
        {extended && <DetailItem label="初盘项目">{project.initialProjectNo || '-'}</DetailItem>}
        {extended && <DetailItem label="抽样方式">{project.samplingMode || '-'}</DetailItem>}
        {extended && <DetailItem label="比例">{project.samplingRatio || '-'}</DetailItem>}
        {extended && <DetailItem label="盘点说明" span={3}>{project.description || '-'}</DetailItem>}
      </DetailGrid>
    </Card>
  );
}

function makeAssetColumns({ includeNo = true, includePlan = false, includeCurrentOwner = false, includeContact = false } = {}) {
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
  ];

  if (includeContact) {
    columns.push(
      { title: '责任人办公电话', dataIndex: 'officePhone', width: 140 },
      { title: '责任人邮箱', dataIndex: 'email', width: 180 },
    );
  }

  if (includeCurrentOwner) {
    columns.push(
      { title: '现资产责任人', dataIndex: 'currentOwner', width: 150 },
      { title: '现资产责任人部门', dataIndex: 'currentOwnerDept', width: 200 },
    );
  }

  if (includePlan) {
    columns.push(
      { title: '计划负责人', dataIndex: 'planManager', width: 130 },
      { title: '盘点监督人', dataIndex: 'supervisor', width: 130 },
      { title: '盘点执行人', dataIndex: 'executor', width: 150 },
    );
  }

  columns.push(
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: 'Building', dataIndex: 'building', width: 170 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: '成本中心', dataIndex: 'costCenter', width: 180 },
    { title: '启用日期', dataIndex: 'enableDate', width: 120 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 140 },
  );

  if (includeNo) {
    columns.push(
      { title: 'NO扫描资产标签号', dataIndex: 'noScanAssetTag', width: 160 },
      { title: 'NO扫描序列号', dataIndex: 'noScanSerialNo', width: 150 },
      { title: 'NO扫描品牌', dataIndex: 'noScanBrand', width: 120 },
      { title: 'NO扫描型号', dataIndex: 'noScanModel', width: 140 },
      { title: 'NO扫描位置', dataIndex: 'noScanLocation', width: 190 },
      { title: 'NO扫描数据差异', dataIndex: 'noScanDiff', width: 240 },
    );
  }

  return columns;
}

const SCOPE_ASSET_COLUMNS = [
  { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left' },
  { title: '序列号', dataIndex: 'serialNo', width: 140 },
  { title: '资产大类', dataIndex: 'category', width: 110 },
  { title: '资产小类', dataIndex: 'subCategory', width: 180 },
  { title: '资产说明', dataIndex: 'description', width: 180 },
  { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' },
  { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatMoney },
  { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
  { title: 'NO位置', dataIndex: 'noLocation', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 130 },
  { title: '资产责任人', dataIndex: 'owner', width: 150 },
  { title: '责任人部门', dataIndex: 'ownerDept', width: 200 },
  { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 },
  { title: 'City', dataIndex: 'city', width: 110 },
  { title: 'Building', dataIndex: 'building', width: 170 },
  { title: 'Floor', dataIndex: 'floor', width: 90 },
  { title: '盘点组织', dataIndex: 'organization', width: 120 },
  { title: '成本中心', dataIndex: 'costCenter', width: 180 },
  { title: '启用日期', dataIndex: 'enableDate', width: 120 },
];

function AssetTable({ rows, rowSelection, columns = SCOPE_ASSET_COLUMNS, pagination = true }) {
  return (
    <Table
      rowKey="key"
      size="small"
      bordered
      columns={columns}
      dataSource={rows}
      rowSelection={rowSelection}
      scroll={{ x: 'max-content' }}
      pagination={pagination ? { pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` } : false}
    />
  );
}

function ProjectListView({ onCreate, onOpenProject, onOpenPlans, onOpenProgress, onOpenImageReview }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(PROJECT_ROWS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_PROJECT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PROJECT_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.projectNo, appliedFilters.projectNo)
    && includesText(row.projectName, appliedFilters.projectName)
    && includesText(row.status, appliedFilters.status)
    && includesText(row.owner, appliedFilters.owner)
    && includesText(row.projectType, appliedFilters.type)
    && inDateRange(row.startDate, appliedFilters.startFrom, appliedFilters.startTo)
    && inDateRange(row.endDate, appliedFilters.startFrom, appliedFilters.startTo)
    && inDateRange(row.createdAt, appliedFilters.createdFrom, appliedFilters.createdTo)
  )), [rows, appliedFilters]);

  const groupedRows = useMemo(() => {
    const groups = [];
    filteredRows.forEach((row) => {
      const latest = groups[groups.length - 1];
      if (!latest || latest.group !== row.relationGroup) {
        groups.push({ group: row.relationGroup, rows: [row] });
      } else {
        latest.rows.push(row);
      }
    });
    return groups.flatMap((group) => [
      { key: `group-${group.group}`, isGroup: true, relationGroup: group.group, childCount: group.rows.length },
      ...group.rows,
    ]);
  }, [filteredRows]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handleDelete = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择需要删除的盘点项目');
      return;
    }
    const selectedRows = rows.filter((row) => selectedKeys.includes(row.key));
    if (selectedRows.some((row) => row.status !== '暂存')) {
      messageApi.warning('仅暂存状态的盘点项目可删除');
      return;
    }
    Modal.confirm({
      title: '确认删除所选盘点项目？',
      content: `共选择 ${selectedKeys.length} 个盘点项目。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedKeys);
        setRows((current) => current.filter((row) => !selected.has(row.key)));
        setSelectedKeys([]);
        messageApi.success('已删除所选盘点项目');
      },
    });
  };

  const handleClose = () => {
    if (selectedKeys.length !== 1) {
      messageApi.warning('请选择一个需要关闭的盘点项目');
      return;
    }
    const row = rows.find((item) => item.key === selectedKeys[0]);
    if (!row) return;
    if (row.status === '暂存' || row.status === '快照生成') {
      messageApi.warning('当前项目尚未完成盘点计划启动，无法关闭');
      return;
    }
    if (row.imageApproval) {
      Modal.confirm({
        title: '关闭盘点项目',
        content: '关闭前需确认盘点计划均已完成，且不存在未审核图片。确认继续关闭？',
        okText: '确认关闭',
        cancelText: '取消',
        onOk: () => {
          setRows((current) => current.map((item) => item.key === row.key ? { ...item, status: '盘点关闭' } : item));
          setSelectedKeys([]);
          messageApi.success('盘点项目已关闭，关联盘点任务不可继续执行');
        },
      });
      return;
    }
    setRows((current) => current.map((item) => item.key === row.key ? { ...item, status: '盘点关闭' } : item));
  };

  const columns = [
    {
      title: '项目编号',
      dataIndex: 'projectNo',
      width: 170,
      fixed: 'left',
      render: (value, row) => {
        if (row.isGroup) {
          return {
            children: (
              <Space>
                <Typography.Text strong>{row.relationGroup}</Typography.Text>
                <Tag>{row.childCount} 个关联项目</Tag>
              </Space>
            ),
            props: { colSpan: 13 },
          };
        }
        return value;
      },
    },
    { title: '项目名称', dataIndex: 'projectName', width: 180, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : <Button type="link" className="px-0" onClick={() => onOpenProject(row)}>{value}</Button> },
    { title: '项目类型', dataIndex: 'projectType', width: 90, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '项目状态', dataIndex: 'status', width: 120, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : <StatusTag value={value} /> },
    { title: '盘点开始时间', dataIndex: 'startDate', width: 130, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '盘点结束时间', dataIndex: 'endDate', width: 130, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '执行盘点数量', dataIndex: 'executionCount', width: 120, align: 'right', render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right', render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '项目责任人', dataIndex: 'owner', width: 130, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    { title: '项目创建时间', dataIndex: 'createdAt', width: 130, render: (value, row) => row.isGroup ? { props: { colSpan: 0 } } : value },
    {
      title: '进入计划',
      width: 100,
      render: (_, row) => row.isGroup
        ? { props: { colSpan: 0 } }
        : (row.planStatus
          ? <Button type="link" className="px-0" onClick={() => onOpenPlans(row)}>进入计划</Button>
          : null),
    },
    {
      title: '项目进度',
      width: 100,
      render: (_, row) => row.isGroup
        ? { props: { colSpan: 0 } }
        : <Button type="link" className="px-0" onClick={() => onOpenProgress(row)}>查看进度</Button>,
    },
    {
      title: '图片审核',
      width: 100,
      fixed: 'right',
      render: (_, row) => row.isGroup
        ? { props: { colSpan: 0 } }
        : (row.imageApproval
          ? <Button type="link" className="px-0" onClick={() => onOpenImageReview(row)}>图片审核</Button>
          : null),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目</PageTitle>

      <QueryBar
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setSelectedKeys([]);
        }}
        onReset={() => {
          setDraftFilters(EMPTY_PROJECT_FILTERS);
          setAppliedFilters(EMPTY_PROJECT_FILTERS);
          setSelectedKeys([]);
        }}
      >
        <QueryItem label="项目编号">
          <Input value={draftFilters.projectNo} allowClear placeholder="请输入项目编号" onChange={(event) => updateFilter('projectNo', event.target.value)} />
        </QueryItem>
        <QueryItem label="项目名称">
          <Input value={draftFilters.projectName} allowClear placeholder="请输入项目名称" onChange={(event) => updateFilter('projectName', event.target.value)} />
        </QueryItem>
        <QueryItem label="项目状态">
          <Select value={draftFilters.status || undefined} allowClear placeholder="请选择" options={PROJECT_STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('status', value)} />
        </QueryItem>
        <QueryItem label="项目责任人">
          <Input value={draftFilters.owner} allowClear placeholder="请输入项目责任人" onChange={(event) => updateFilter('owner', event.target.value)} />
        </QueryItem>
        <QueryItem label="盘点开始时间">
          <DateFilter value={draftFilters.startFrom} placeholder="开始日期" onChange={(value) => updateFilter('startFrom', value)} />
        </QueryItem>
        <QueryItem label="盘点结束时间">
          <DateFilter value={draftFilters.startTo} placeholder="结束日期" onChange={(value) => updateFilter('startTo', value)} />
        </QueryItem>
        <QueryItem label="项目类型">
          <Select value={draftFilters.type || undefined} allowClear placeholder="请选择" options={PROJECT_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('type', value)} />
        </QueryItem>
        <QueryItem label="创建时间从">
          <DateFilter value={draftFilters.createdFrom} placeholder="开始日期" onChange={(value) => updateFilter('createdFrom', value)} />
        </QueryItem>
        <QueryItem label="创建时间至">
          <DateFilter value={draftFilters.createdTo} placeholder="结束日期" onChange={(value) => updateFilter('createdTo', value)} />
        </QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>盘点项目列表</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button type="primary" icon={<Plus size={14} />} onClick={onCreate}>创建项目</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除</Button>
            <Button icon={<XCircle size={14} />} onClick={handleClose}>关闭项目</Button>
          </Space>
        </div>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={groupedRows}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
            getCheckboxProps: (record) => ({ disabled: record.isGroup }),
            fixed: true,
          }}
          scroll={{ x: 1550 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </Space>
  );
}

function ProjectBasicInfoEditor({ project, setProject }) {
  const setField = (field, value) => setProject((current) => ({ ...current, [field]: value }));

  const changeInventoryType = (value) => {
    const nextPeriod = value === '年度' ? '2026年' : value === '季度' ? '第三季度' : '8月';
    setProject((current) => ({
      ...current,
      inventoryType: value,
      period: nextPeriod,
      projectName: `${nextPeriod}-${value}盘点`,
    }));
  };

  const changeProjectType = (value) => {
    const prefix = value === '初盘' ? 'CP' : value === '抽盘' ? 'DCP' : 'RCP';
    setProject((current) => ({
      ...current,
      projectType: value,
      projectNo: `${prefix}-20260818-0003`,
      initialProjectNo: value === '初盘' ? '-' : 'CP-202608180001',
      samplingMode: value === '初盘' ? '-' : '全盘',
      samplingRatio: value === '初盘' ? '-' : 100,
    }));
  };

  return (
    <Card size="small" title={<CardTitle>基本信息</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <Typography.Text type="secondary">项目编号</Typography.Text>
          <Input value={project.projectNo} readOnly />
        </div>
        <div>
          <Typography.Text type="secondary">项目名称</Typography.Text>
          <Input value={project.projectName} maxLength={100} onChange={(event) => setField('projectName', event.target.value)} />
        </div>
        <div>
          <Typography.Text type="secondary">项目类型</Typography.Text>
          <Select value={project.projectType} className="w-full" options={PROJECT_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={changeProjectType} />
        </div>
        <div>
          <Typography.Text type="secondary">盘点开始时间</Typography.Text>
          <DatePicker value={dayjs(project.startDate)} className="w-full" onChange={(date) => setField('startDate', date ? date.format('YYYY-MM-DD') : '')} />
        </div>
        <div>
          <Typography.Text type="secondary">盘点结束时间</Typography.Text>
          <DatePicker
            value={dayjs(project.endDate)}
            className="w-full"
            disabledDate={(date) => project.startDate && date.isBefore(dayjs(project.startDate), 'day')}
            onChange={(date) => setField('endDate', date ? date.format('YYYY-MM-DD') : '')}
          />
        </div>
        <div>
          <Typography.Text type="secondary">盘点类型</Typography.Text>
          <Select value={project.inventoryType} className="w-full" options={['年度', '季度', '月度'].map((value) => ({ label: value, value }))} onChange={changeInventoryType} />
        </div>
        <div>
          <Typography.Text type="secondary">盘点期间</Typography.Text>
          <Select
            value={project.period}
            className="w-full"
            options={
              project.inventoryType === '年度'
                ? [{ label: '2026年', value: '2026年' }]
                : project.inventoryType === '季度'
                  ? ['第一季度', '第二季度', '第三季度', '第四季度'].map((value) => ({ label: value, value }))
                  : Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}月`, value: `${index + 1}月` }))
            }
            onChange={(value) => setProject((current) => ({ ...current, period: value, projectName: `${value}-${current.inventoryType}盘点` }))}
          />
        </div>
        {project.projectType !== '初盘' && (
          <>
            <div>
              <Typography.Text type="secondary">初盘项目</Typography.Text>
              <Select
                value={project.initialProjectNo === '-' ? undefined : project.initialProjectNo}
                className="w-full"
                placeholder="请选择未关闭且未被同类型关联的初盘项目"
                options={PROJECT_ROWS.filter((row) => row.projectType === '初盘' && row.status !== '盘点关闭').map((row) => ({ label: `${row.projectNo} ${row.projectName}`, value: row.projectNo }))}
                onChange={(value) => setField('initialProjectNo', value)}
              />
            </div>
            <div>
              <Typography.Text type="secondary">抽样方式</Typography.Text>
              <Select value={project.samplingMode === '-' ? '全盘' : project.samplingMode} className="w-full" options={['全盘', '百分比'].map((value) => ({ label: value, value }))} onChange={(value) => setField('samplingMode', value)} />
            </div>
            {project.samplingMode === '百分比' && (
              <div>
                <Typography.Text type="secondary">比例（%）</Typography.Text>
                <InputNumber min={1} max={100} value={Number(project.samplingRatio || 100)} className="w-full" onChange={(value) => setField('samplingRatio', value || 100)} />
              </div>
            )}
          </>
        )}
        <div>
          <Typography.Text type="secondary">快照生成日期</Typography.Text>
          <Input value={project.snapshotTime === '-' ? '' : project.snapshotTime} readOnly placeholder="生成快照后自动反写" />
        </div>
        <div className="col-span-3">
          <Typography.Text type="secondary">盘点说明</Typography.Text>
          <Input.TextArea value={project.description} maxLength={150} showCount rows={2} onChange={(event) => setField('description', event.target.value)} />
        </div>
      </div>
    </Card>
  );
}

function InventoryRuleEditor({ messageApi }) {
  const [rule, setRule] = useState({
    company: ['集团'],
    city: ['北京市'],
    building: ['融科资讯中心D座', '搜狐媒体大厦'],
    category: ['SERVER', 'NOTEBOOK'],
  });
  const [methodRows, setMethodRows] = useState(INVENTORY_RANGE_METHOD_ROWS);

  const methodColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    {
      title: '盘点方式',
      dataIndex: 'methods',
      width: 520,
      render: (value, row) => (
        <Checkbox.Group
          options={SCAN_METHOD_OPTIONS}
          value={value}
          onChange={(methods) => setMethodRows((current) => current.map((item) => item.key === row.key ? { ...item, methods } : item))}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 260,
      render: (value, row) => <Input value={value} placeholder="选填" onChange={(event) => setMethodRows((current) => current.map((item) => item.key === row.key ? { ...item, remark: event.target.value } : item))} />,
    },
  ];

  return (
    <Card size="small" title={<CardTitle>盘点规则</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
        <div>
          <Typography.Text type="secondary">盘点公司</Typography.Text>
          <Select mode="multiple" value={rule.company} className="w-full" options={['集团', '新动力', '新时代', '新媒体'].map((value) => ({ label: value, value }))} onChange={(value) => setRule((current) => ({ ...current, company: value }))} />
        </div>
        <div>
          <Typography.Text type="secondary">City</Typography.Text>
          <Select mode="multiple" value={rule.city} className="w-full" options={['北京市', '上海市', '广东省-广州市', '湖北省-武汉市'].map((value) => ({ label: value, value }))} onChange={(value) => setRule((current) => ({ ...current, city: value }))} />
        </div>
        <div>
          <Typography.Text type="secondary">Building</Typography.Text>
          <Select mode="multiple" value={rule.building} className="w-full" options={['融科资讯中心D座', '搜狐媒体大厦'].map((value) => ({ label: value, value }))} onChange={(value) => setRule((current) => ({ ...current, building: value }))} />
        </div>
        <div>
          <Typography.Text type="secondary">资产类别</Typography.Text>
          <Select mode="multiple" value={rule.category} className="w-full" options={['SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'].map((value) => ({ label: value, value }))} onChange={(value) => setRule((current) => ({ ...current, category: value }))} />
        </div>
      </div>

      <Typography.Text strong>盘点方式设置</Typography.Text>
      <Table rowKey="key" size="small" bordered className="mt-2" columns={methodColumns} dataSource={methodRows} pagination={false} />

      <div className="mt-3">
        <Alert
          type="info"
          showIcon
          message="盘点范围与盘点方式可自由组合。保存或生成快照时，如某行未选择任何盘点方式，系统会阻止操作并提示对应盘点范围。"
        />
      </div>
    </Card>
  );
}

function ImageUploadRuleEditor() {
  const [enabled, setEnabled] = useState(true);
  const [rows, setRows] = useState(IMAGE_RULE_ROWS);

  const multiOptions = (values) => values.map((value) => ({ label: value, value }));
  const changeRow = (key, field, value) => setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row));

  const columns = [
    {
      title: '盘点范围',
      dataIndex: 'range',
      width: 100,
      fixed: 'left',
      render: (value, row) => <Select value={value} className="w-full" options={RANGE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(next) => changeRow(row.key, 'range', next)} />,
    },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 170, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '1', '5', '实习生', '公共'])} onChange={(next) => changeRow(row.key, 'ownerLevel', next)} /> },
    { title: '部门', dataIndex: 'department', width: 170, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '集团总部.MIS部', '搜狐媒体.智能平台'])} onChange={(next) => changeRow(row.key, 'department', next)} /> },
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'])} onChange={(next) => changeRow(row.key, 'category', next)} /> },
    { title: '资产状态', dataIndex: 'assetStatus', width: 160, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '在用', '在库'])} onChange={(next) => changeRow(row.key, 'assetStatus', next)} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['集团'])} onChange={(next) => changeRow(row.key, 'organization', next)} /> },
    { title: 'City', dataIndex: 'city', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['北京市'])} onChange={(next) => changeRow(row.key, 'city', next)} /> },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '融科资讯中心D座', '搜狐媒体大厦'])} onChange={(next) => changeRow(row.key, 'building', next)} /> },
    { title: 'Floor', dataIndex: 'floor', width: 150, render: (value, row) => <Select mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'B2', '6F', '8F'])} onChange={(next) => changeRow(row.key, 'floor', next)} /> },
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, row) => <InputNumber min={0} max={100} value={value} className="w-full" onChange={(next) => changeRow(row.key, 'percent', next ?? 100)} /> },
    { title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" danger onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}>删除</Button> },
  ];

  return (
    <Card
      size="small"
      title={<CardTitle>图片上传规则配置</CardTitle>}
      extra={<Space><Typography.Text>是否上传图片</Typography.Text><Switch checked={enabled} onChange={setEnabled} /></Space>}
    >
      {!enabled ? (
        <Alert type="info" showIcon message="未开启图片上传，本项目盘点资产不要求上传盘点照片。" />
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <Button
              icon={<Plus size={14} />}
              onClick={() => setRows((current) => [...current, {
                key: `image-${Date.now()}`,
                range: '员工',
                ownerLevel: ['全部'],
                department: ['全部'],
                category: ['全部'],
                assetStatus: ['全部'],
                organization: ['集团'],
                city: ['北京市'],
                building: ['全部'],
                floor: ['全部'],
                percent: 100,
              }])}
            >
              增行
            </Button>
          </div>
          <Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1800 }} pagination={false} />
        </>
      )}
    </Card>
  );
}

function ScopeSelector({ projectType, scopeRows, setScopeRows, onPreviewAssets, messageApi }) {
  const [filters, setFilters] = useState({
    organization: '',
    department: '',
    assetCategory: '',
    assetStatus: '',
    warehouse: '',
    city: '',
    building: '',
    floor: '',
    owner: '',
    ownerLevel: '',
    ratio: 100,
  });
  const [selectedKeys, setSelectedKeys] = useState([]);

  const fields = [
    ['盘点组织', 'organization'],
    ['部门', 'department'],
    ['资产类别', 'assetCategory'],
    ['资产状态', 'assetStatus'],
    ['仓库', 'warehouse'],
    ['City', 'city'],
    ['Building', 'building'],
    ['Floor', 'floor'],
    ['资产责任人', 'owner'],
    ['资产责任人职级', 'ownerLevel'],
  ];

  const scopeColumns = [
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: '部门', dataIndex: 'department', width: 160 },
    { title: '资产类别', dataIndex: 'assetCategory', width: 170 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '仓库', dataIndex: 'warehouse', width: 120 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'Building', dataIndex: 'building', width: 180 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 130 },
    { title: '启用开始日期', dataIndex: 'enableFrom', width: 130 },
    { title: '启用结束日期', dataIndex: 'enableTo', width: 130 },
    { title: '清单', width: 80, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onPreviewAssets(row)}>查看</Button> },
  ];

  const handleGenerate = () => {
    const next = {
      key: `scope-${Date.now()}`,
      organization: filters.organization || '集团',
      department: filters.department || '-',
      assetCategory: filters.assetCategory || 'SERVER、NOTEBOOK',
      assetStatus: filters.assetStatus || '在用、在库',
      warehouse: filters.warehouse || '-',
      city: filters.city || '北京市',
      building: filters.building || '全部',
      floor: filters.floor || '全部',
      owner: filters.owner || '-',
      ownerLevel: filters.ownerLevel || '全部',
      enableFrom: '2020-01-01',
      enableTo: '2026-06-30',
    };
    setScopeRows((current) => [...current, next]);
    if (projectType === '复盘') {
      messageApi.success(`已生成复盘范围，本次复盘比例 ${filters.ratio}%`);
    } else {
      messageApi.success('已根据当前筛选规则生成盘点范围分录');
    }
  };

  return (
    <Card size="small" title={<CardTitle>盘点范围筛选</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {fields.map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            <Select
              showSearch
              allowClear
              value={filters[field] || undefined}
              placeholder={`请选择${label}`}
              className="flex-1"
              options={
                field === 'ownerLevel'
                  ? ['1', '5', '实习生', '公共'].map((value) => ({ label: value, value }))
                  : field === 'city'
                    ? ['北京市', '上海市', '广东省-广州市', '湖北省-武汉市'].map((value) => ({ label: value, value }))
                    : field === 'assetCategory'
                      ? ['SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'].map((value) => ({ label: value, value }))
                      : [{ label: '全部', value: '全部' }]
              }
              onChange={(value) => setFilters((current) => ({ ...current, [field]: value || '' }))}
            />
          </div>
        ))}
        {projectType === '复盘' && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">比例:</span>
            <InputNumber min={1} max={100} value={filters.ratio} className="flex-1" addonAfter="%" onChange={(value) => setFilters((current) => ({ ...current, ratio: value || 100 }))} />
          </div>
        )}
      </div>

      {projectType === '复盘' && (
        <div className="mt-4">
          <DetailGrid columns={3}>
            <DetailItem label="复盘数量">4,129</DetailItem>
            <DetailItem label="复盘比例">{filters.ratio}%</DetailItem>
            <DetailItem label="初盘执行盘点数量">51,611</DetailItem>
          </DetailGrid>
        </div>
      )}

      <div className="my-4 flex justify-center">
        <Button type="primary" icon={<Search size={14} />} onClick={handleGenerate}>生成查询</Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Typography.Text strong>盘点范围明细</Typography.Text>
        <Space>
          <Button icon={<Eye size={14} />} onClick={() => onPreviewAssets(null)}>查看全部</Button>
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => {
              if (!selectedKeys.length) {
                messageApi.warning('请先选择需要删除的盘点范围');
                return;
              }
              const selected = new Set(selectedKeys);
              setScopeRows((current) => current.filter((row) => !selected.has(row.key)));
              setSelectedKeys([]);
            }}
          >
            删除所选
          </Button>
          <Button danger onClick={() => setScopeRows([])}>删除全部</Button>
        </Space>
      </div>

      <Table
        rowKey="key"
        size="small"
        bordered
        columns={scopeColumns}
        dataSource={scopeRows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        scroll={{ x: 1500 }}
        pagination={false}
      />
    </Card>
  );
}

function CreateProjectView({ initialProject, onBack, onGenerated }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [project, setProject] = useState(() => ({
    ...PROJECT_INFO,
    ...initialProject,
    projectNo: initialProject?.projectNo || 'CP-20260818-0003',
    projectName: initialProject?.projectName || '2026年-年度盘点',
    status: '暂存',
    snapshotTime: initialProject?.snapshotTime || '-',
  }));
  const [scopeRows, setScopeRows] = useState(SCOPE_ROWS);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetPreviewOpen, setAssetPreviewOpen] = useState(false);

  const handleSave = () => {
    if (!project.projectName || !project.startDate || !project.endDate) {
      messageApi.warning('请完整填写项目信息');
      return;
    }
    messageApi.success('盘点项目已保存为暂存状态');
  };

  const handleSnapshot = () => {
    if (!scopeRows.length) {
      messageApi.warning('请先生成至少一条盘点范围明细');
      return;
    }
    const nextProject = {
      ...project,
      status: '快照生成',
      snapshotTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    setProject(nextProject);
    messageApi.success('盘点快照已生成');
    onGenerated(nextProject);
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>{initialProject ? '编辑盘点项目' : '创建盘点项目'}</PageTitle>

      <ProjectBasicInfoEditor project={project} setProject={setProject} />
      <InventoryRuleEditor messageApi={messageApi} />
      <ImageUploadRuleEditor />
      <ScopeSelector
        projectType={project.projectType}
        scopeRows={scopeRows}
        setScopeRows={setScopeRows}
        onPreviewAssets={() => setAssetPreviewOpen(true)}
        messageApi={messageApi}
      />

      <Card size="small" title={<CardTitle>盘点资产范围明细</CardTitle>} extra={<Typography.Text type="secondary">共 {ASSET_ROWS.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<Download size={14} />} onClick={() => messageApi.success('已导出当前盘点范围资产清单')}>导出清单</Button>
            <Button icon={<Upload size={14} />} onClick={() => messageApi.info('请按资产清单模板导入')}>导入清单</Button>
            <Button
              danger
              icon={<Trash2 size={14} />}
              onClick={() => {
                if (!selectedAssets.length) {
                  messageApi.warning('请先选择需要删除的资产');
                  return;
                }
                messageApi.success(`已从本次盘点范围移除 ${selectedAssets.length} 条资产`);
                setSelectedAssets([]);
              }}
            >
              删除
            </Button>
            <Button icon={<Settings size={14} />}>配置</Button>
          </Space>
        </div>
        <AssetTable rows={ASSET_ROWS} rowSelection={{ selectedRowKeys: selectedAssets, onChange: setSelectedAssets }} />
      </Card>

      <div className="flex justify-center gap-3 pb-2">
        <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>保存</Button>
        <Button type="primary" onClick={handleSnapshot}>生成快照</Button>
        <Button onClick={onBack}>返回</Button>
      </div>

      <Modal
        open={assetPreviewOpen}
        title="盘点范围资产清单"
        width={1200}
        footer={<Button type="primary" onClick={() => setAssetPreviewOpen(false)}>返回</Button>}
        onCancel={() => setAssetPreviewOpen(false)}
      >
        <AssetTable rows={ASSET_ROWS} pagination={false} />
      </Modal>
    </Space>
  );
}

function SnapshotQuery({ filters, setFilters }) {
  return (
    <QueryBar
      onQuery={() => setFilters((current) => ({ ...current }))}
      onReset={() => setFilters({ assetTag: '', category: '', status: '', owner: '', city: '', range: '' })}
    >
      <QueryItem label="资产标签号">
        <Input value={filters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => setFilters((current) => ({ ...current, assetTag: event.target.value }))} />
      </QueryItem>
      <QueryItem label="资产类别">
        <Select value={filters.category || undefined} allowClear placeholder="请选择" options={['SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'].map((value) => ({ label: value, value }))} onChange={(value) => setFilters((current) => ({ ...current, category: value || '' }))} />
      </QueryItem>
      <QueryItem label="盘点状态">
        <Select value={filters.status || undefined} allowClear placeholder="请选择" options={['未盘', '已盘', '代盘', '报失', '盘亏'].map((value) => ({ label: value, value }))} onChange={(value) => setFilters((current) => ({ ...current, status: value || '' }))} />
      </QueryItem>
      <QueryItem label="资产责任人">
        <Input value={filters.owner} allowClear placeholder="请输入资产责任人" onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))} />
      </QueryItem>
      <QueryItem label="City">
        <Input value={filters.city} allowClear placeholder="请输入City" onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))} />
      </QueryItem>
      <QueryItem label="盘点范围">
        <Select value={filters.range || undefined} allowClear placeholder="请选择" options={RANGE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => setFilters((current) => ({ ...current, range: value || '' }))} />
      </QueryItem>
    </QueryBar>
  );
}

function SnapshotAssetTab({ type, projectStatus, rows, setRows, otherRows, setOtherRows, messageApi }) {
  const [filters, setFilters] = useState({ assetTag: '', category: '', status: '', owner: '', city: '', range: '' });
  const [selectedKeys, setSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.assetTag, filters.assetTag)
    && includesText(row.category, filters.category)
    && includesText(row.inventoryStatus, filters.status)
    && includesText(row.owner, filters.owner)
    && includesText(row.city, filters.city)
    && includesText(row.inventoryRange, filters.range)
  )), [rows, filters]);

  const beforeStart = projectStatus === '快照生成';
  const during = projectStatus === '盘点中';

  const moveSelected = (targetExecute) => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择资产');
      return;
    }
    const selected = new Set(selectedKeys);
    const moved = rows.filter((row) => selected.has(row.key)).map((row) => ({ ...row, executeInventory: targetExecute }));
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    if (setOtherRows) setOtherRows((current) => [...current, ...moved]);
    setSelectedKeys([]);
    messageApi.success(`已转移 ${moved.length} 条资产`);
  };

  const confirmSelected = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择资产');
      return;
    }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? {
      ...row,
      inventoryStatus: '已盘',
      counter: '系统管理员',
      inventoryDate: dayjs().format('YYYY-MM-DD'),
    } : row));
    setSelectedKeys([]);
    messageApi.success('已批量确认盘点结果');
  };

  const operations = [];
  if (type === 'execution' && beforeStart) {
    operations.push(
      <Button key="move" onClick={() => moveSelected(false)}>批量转移至未执行盘点</Button>,
      <Button key="queryMove">按查询条件转移至未执行盘点</Button>,
      <Button key="importMove" icon={<Upload size={14} />}>模板转移至未执行盘点</Button>,
      <Button key="no" icon={<ScanLine size={14} />} onClick={() => messageApi.info('NO扫描数据同步逻辑待机房蓝图确认')}>同步NO扫描数据</Button>,
    );
  }
  if (type === 'execution' && during) {
    operations.push(
      <Button key="importResult" icon={<Upload size={14} />}>导入盘点结果</Button>,
      <Button key="exportResult" icon={<Download size={14} />}>导出盘点结果</Button>,
    );
  }
  if (type === 'notExecution' && beforeStart) {
    operations.push(
      <Button key="move" onClick={() => moveSelected(true)}>批量转移至执行盘点</Button>,
      <Button key="queryMove">按查询条件转移至执行盘点</Button>,
      <Button key="importMove" icon={<Upload size={14} />}>模板转移至执行盘点</Button>,
    );
  }
  if (type === 'notExecution' && during) {
    operations.push(
      <Button key="confirm" type="primary" icon={<CheckCircle2 size={14} />} onClick={confirmSelected}>批量确认</Button>,
      <Button key="importResult" icon={<Upload size={14} />}>导入盘点结果</Button>,
      <Button key="exportResult" icon={<Download size={14} />}>导出盘点结果</Button>,
    );
  }
  if (type === 'excluded') {
    operations.push(
      <Button key="toExecution">批量转移至执行盘点</Button>,
      <Button key="toNotExecution">批量转移至未执行盘点</Button>,
      <Button key="import" icon={<Upload size={14} />}>批量导入转移</Button>,
    );
  }
  operations.push(<Button key="export" icon={<Download size={14} />}>导出查询结果</Button>);

  return (
    <Card size="small">
      <Collapse
        ghost
        items={[
          {
            key: 'query',
            label: '设置查询条件',
            children: <SnapshotQuery filters={filters} setFilters={setFilters} />,
          },
        ]}
      />
      <div className="mb-3 flex justify-end">
        <Space wrap>{operations}</Space>
      </div>
      <AssetTable
        rows={filteredRows}
        columns={makeAssetColumns({ includeNo: ASSET_ROWS.some((row) => row.inventoryRange === '机房') })}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
      />
    </Card>
  );
}

function SnapshotStats({ projectStatus, onOpenPlans }) {
  const total = ASSET_ROWS.reduce((sum, row) => sum + row.quantity, 0);
  const execution = ASSET_ROWS.filter((row) => row.executeInventory).reduce((sum, row) => sum + row.quantity, 0);
  const notExecution = total - execution;
  const counted = ASSET_ROWS.filter((row) => ['已盘', '代盘'].includes(row.inventoryStatus)).reduce((sum, row) => sum + row.quantity, 0);
  const uncounted = ASSET_ROWS.filter((row) => row.executeInventory && ['未盘', '报失', '盘亏'].includes(row.inventoryStatus)).reduce((sum, row) => sum + row.quantity, 0);
  const lost = ASSET_ROWS.filter((row) => row.inventoryStatus === '盘亏').reduce((sum, row) => sum + row.quantity, 0);
  const rate = execution ? Number(((counted / execution) * 100).toFixed(1)) : 0;

  const generatedPlan = ['生成盘点计划', '盘点中', '盘点关闭'].includes(projectStatus);

  return (
    <Card size="small" title={<CardTitle>快照清单统计</CardTitle>}>
      <div className="grid grid-cols-4 gap-4">
        <Statistic title="盘点资产总量" value={total} />
        <Statistic title="执行盘点数量" value={execution} />
        <Statistic title="未执行盘点数量" value={notExecution} />
        {generatedPlan && <Statistic title="已盘数量" value={counted} />}
        {generatedPlan && <Statistic title="未盘数量" value={uncounted} />}
        {generatedPlan && <Statistic title="盘亏数量" value={lost} />}
        {generatedPlan && <Statistic title="盘到率（%）" value={rate} suffix="%" />}
      </div>
      {generatedPlan && (
        <div className="mt-4 flex justify-end">
          <Button type="link" onClick={onOpenPlans}>查看计划清单</Button>
        </div>
      )}
    </Card>
  );
}

function CustomPlanModal({ open, onCancel, onConfirm }) {
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
    setRows((current) => current.map((row) => row.key === personTarget.key ? { ...row, [personTarget.field]: record.employeeName } : row));
    setPersonTarget(null);
  };

  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '计划负责人', dataIndex: 'manager', width: 170, render: (value, row) => <Input readOnly value={value} placeholder="选填" suffix={<Search size={14} />} onClick={() => setPersonTarget({ key: row.key, field: 'manager' })} /> },
    { title: '盘点监督人', dataIndex: 'supervisor', width: 170, render: (value, row) => <Input readOnly value={value} placeholder="选填" suffix={<Search size={14} />} onClick={() => setPersonTarget({ key: row.key, field: 'supervisor' })} /> },
    { title: '盘点执行人', dataIndex: 'executor', width: 170, render: (value, row) => <Input readOnly value={value} placeholder="选填" suffix={<Search size={14} />} onClick={() => setPersonTarget({ key: row.key, field: 'executor' })} /> },
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

function SnapshotView({ project, projectStatus, setProjectStatus, onBack, onOpenPlans }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [executionRows, setExecutionRows] = useState(ASSET_ROWS.filter((row) => row.executeInventory));
  const [notExecutionRows, setNotExecutionRows] = useState(ASSET_ROWS.filter((row) => !row.executeInventory));
  const [excludedRows, setExcludedRows] = useState(UNINCLUDED_ASSET_ROWS);
  const [customPlanOpen, setCustomPlanOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCompany, setReportCompany] = useState('集团');
  const [reportPlates, setReportPlates] = useState(['新媒体']);

  const generatePlans = () => {
    Modal.confirm({
      title: '提示',
      content: '是否按照默认方式生成盘点计划？',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        setProjectStatus('生成盘点计划');
        messageApi.success('已按盘点组织、一级部门、City、盘点范围默认拆分生成盘点计划');
        onOpenPlans();
      },
      onCancel: () => setCustomPlanOpen(true),
    });
  };

  const handleDeleteSnapshot = () => {
    Modal.confirm({
      title: '删除快照',
      content: '删除快照后项目状态将恢复为暂存，并返回生成快照之前的状态。',
      okText: '删除快照',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setProjectStatus('暂存');
        messageApi.success('快照已删除，项目已恢复为暂存状态');
        onBack();
      },
    });
  };

  const tabItems = [
    {
      key: 'summary',
      label: '快照清单统计',
      children: <SnapshotStats projectStatus={projectStatus} onOpenPlans={onOpenPlans} />,
    },
    {
      key: 'execution',
      label: '执行盘点资产清单',
      children: (
        <SnapshotAssetTab
          type="execution"
          projectStatus={projectStatus}
          rows={executionRows}
          setRows={setExecutionRows}
          otherRows={notExecutionRows}
          setOtherRows={setNotExecutionRows}
          messageApi={messageApi}
        />
      ),
    },
    {
      key: 'notExecution',
      label: '未执行盘点资产清单',
      children: (
        <SnapshotAssetTab
          type="notExecution"
          projectStatus={projectStatus}
          rows={notExecutionRows}
          setRows={setNotExecutionRows}
          otherRows={executionRows}
          setOtherRows={setExecutionRows}
          messageApi={messageApi}
        />
      ),
    },
    {
      key: 'excluded',
      label: '未包含资产清单',
      children: (
        <SnapshotAssetTab
          type="excluded"
          projectStatus={projectStatus}
          rows={excludedRows}
          setRows={setExcludedRows}
          messageApi={messageApi}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目详情</PageTitle>
      <ProjectInfoCard project={{ ...project, status: projectStatus }} extended />
      <ImageUploadRuleEditor />

      <div className="flex justify-center">
        <Space wrap>
          {projectStatus === '快照生成' && <Button type="primary" icon={<PlayCircle size={14} />} onClick={generatePlans}>生成盘点计划</Button>}
          {['快照生成', '生成盘点计划'].includes(projectStatus) && <Button danger icon={<Trash2 size={14} />} onClick={handleDeleteSnapshot}>删除快照</Button>}
          <Button icon={<Download size={14} />} onClick={() => messageApi.success('快照导出已触发，导出模板包含“是否执行盘点”字段')}>快照导出</Button>
          {['盘点中', '盘点关闭'].includes(projectStatus) && <Button icon={<FileSpreadsheet size={14} />} onClick={() => setReportOpen(true)}>盘点报告下载</Button>}
          <Button onClick={onBack}>返回</Button>
        </Space>
      </div>

      <Tabs items={tabItems} defaultActiveKey="summary" />

      <CustomPlanModal
        open={customPlanOpen}
        onCancel={() => setCustomPlanOpen(false)}
        onConfirm={() => {
          setCustomPlanOpen(false);
          setProjectStatus('生成盘点计划');
          messageApi.success('自定义盘点计划已生成');
          onOpenPlans();
        }}
      />

      <Modal
        open={reportOpen}
        title="下载盘点报告"
        okText="确定并下载"
        cancelText="取消"
        onCancel={() => setReportOpen(false)}
        onOk={() => {
          setReportOpen(false);
          messageApi.success(`已生成 ${reportCompany} / ${reportPlates.join('、')} 盘点报告`);
        }}
      >
        <Space direction="vertical" size={16} className="w-full">
          <div>
            <Typography.Text type="secondary">公司（单选）</Typography.Text>
            <Select value={reportCompany} className="w-full" options={['集团', '新动力', '新时代', '新媒体'].map((value) => ({ label: value, value }))} onChange={setReportCompany} />
          </div>
          <div>
            <Typography.Text type="secondary">板块（多选）</Typography.Text>
            <Select mode="multiple" value={reportPlates} className="w-full" options={['新媒体', '新时代', '搜狐视频'].map((value) => ({ label: value, value }))} onChange={setReportPlates} />
          </div>
        </Space>
      </Modal>
    </Space>
  );
}

function PersonnelInput({ value, onClick, disabled }) {
  if (disabled) return <Typography.Text>{value || '-'}</Typography.Text>;
  return <Input value={value || ''} readOnly placeholder="请选择" suffix={<Search size={14} className="text-[#1677ff]" />} onClick={onClick} onChange={() => {}} />;
}

function PlanAssetListView({ project, plan, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => ASSET_ROWS.filter((asset) => asset.planNo === plan.planNo || asset.inventoryRange === plan.range));
  const [filters, setFilters] = useState({
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
  });
  const [scanOpen, setScanOpen] = useState(false);
  const [scanValue, setScanValue] = useState('');
  const [scannedTags, setScannedTags] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

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

  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value || '' }));

  const columns = makeAssetColumns({ includeNo: false, includePlan: true, includeCurrentOwner: true });
  columns.splice(21, 0,
    { title: '账套', dataIndex: 'organization', width: 120 },
    { title: '未盘说明', dataIndex: 'inventoryNote', width: 160 },
    { title: '是否上传图片', dataIndex: 'needPhoto', width: 120, render: (value) => <StatusTag value={value ? '是' : '否'} /> },
  );

  const isDraft = plan.status === '暂存';
  const isStarted = plan.status === '启动';

  const addScan = () => {
    const value = scanValue.trim();
    if (!value) return;
    setScannedTags((current) => current.includes(value) ? current : [...current, value]);
    setScanValue('');
  };

  const uploadScans = () => {
    if (!scannedTags.length) {
      messageApi.warning('请先扫描资产标签');
      return;
    }
    const valid = new Set(rows.map((row) => row.assetTag));
    const success = scannedTags.filter((tag) => valid.has(tag));
    const failed = scannedTags.filter((tag) => !valid.has(tag));
    const successSet = new Set(success);
    setRows((current) => current.map((row) => successSet.has(row.assetTag) ? {
      ...row,
      inventoryStatus: row.owner === '系统管理员' ? '已盘' : '代盘',
      counter: '系统管理员',
      inventoryDate: dayjs().format('YYYY-MM-DD'),
      importMode: '扫描枪导入',
    } : row));
    messageApi.success(`上传完成：成功 ${success.length}，失败 ${failed.length}`);
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点计划资产清单</PageTitle>
      <ProjectInfoCard project={project} />
      <Card size="small" title={<CardTitle>计划信息</CardTitle>}>
        <DetailGrid columns={3}>
          <DetailItem label="计划编号">{plan.planNo}</DetailItem>
          <DetailItem label="计划名称">{plan.planName}</DetailItem>
          <DetailItem label="计划状态"><StatusTag value={plan.status} /></DetailItem>
          <DetailItem label="盘点组织">{plan.organization}</DetailItem>
          <DetailItem label="City">{plan.city}</DetailItem>
          <DetailItem label="盘点范围">{plan.range}</DetailItem>
        </DetailGrid>
      </Card>

      <QueryBar
        onQuery={() => setFilters((current) => ({ ...current }))}
        onReset={() => setFilters({
          assetTag: '', category: '', serialNo: '', description: '', useStatus: '', owner: '', ownerDept: '', ownerLevel: '',
          supervisor: '', executor: '', city: '', building: '', enableFrom: '', enableTo: '', inventoryStatus: '', costCenter: '', noStatus: '',
        })}
      >
        <QueryItem label="资产标签号"><Input value={filters.assetTag} allowClear onChange={(event) => update('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="资产类别"><Input value={filters.category} allowClear onChange={(event) => update('category', event.target.value)} /></QueryItem>
        <QueryItem label="序列号"><Input value={filters.serialNo} allowClear onChange={(event) => update('serialNo', event.target.value)} /></QueryItem>
        <QueryItem label="资产说明"><Input value={filters.description} allowClear onChange={(event) => update('description', event.target.value)} /></QueryItem>
        <QueryItem label="使用状态"><Input value={filters.useStatus} allowClear onChange={(event) => update('useStatus', event.target.value)} /></QueryItem>
        <QueryItem label="资产责任人"><Input value={filters.owner} allowClear onChange={(event) => update('owner', event.target.value)} /></QueryItem>
        <QueryItem label="责任人部门"><Input value={filters.ownerDept} allowClear onChange={(event) => update('ownerDept', event.target.value)} /></QueryItem>
        <QueryItem label="责任人职级"><Input value={filters.ownerLevel} allowClear onChange={(event) => update('ownerLevel', event.target.value)} /></QueryItem>
        <QueryItem label="盘点监督人"><Input value={filters.supervisor} allowClear onChange={(event) => update('supervisor', event.target.value)} /></QueryItem>
        <QueryItem label="盘点执行人"><Input value={filters.executor} allowClear onChange={(event) => update('executor', event.target.value)} /></QueryItem>
        <QueryItem label="City"><Input value={filters.city} allowClear onChange={(event) => update('city', event.target.value)} /></QueryItem>
        <QueryItem label="Building"><Input value={filters.building} allowClear onChange={(event) => update('building', event.target.value)} /></QueryItem>
        <QueryItem label="启用日期从"><DateFilter value={filters.enableFrom} onChange={(value) => update('enableFrom', value)} /></QueryItem>
        <QueryItem label="启用日期至"><DateFilter value={filters.enableTo} onChange={(value) => update('enableTo', value)} /></QueryItem>
        <QueryItem label="盘点状态"><Select value={filters.inventoryStatus || undefined} allowClear options={['未盘', '已盘', '代盘', '报失'].map((value) => ({ label: value, value }))} onChange={(value) => update('inventoryStatus', value)} /></QueryItem>
        <QueryItem label="成本中心"><Input value={filters.costCenter} allowClear onChange={(event) => update('costCenter', event.target.value)} /></QueryItem>
        <QueryItem label="NO状态"><Input value={filters.noStatus} allowClear onChange={(event) => update('noStatus', event.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>资产清单</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            {(isDraft || isStarted) && <Button icon={<Upload size={14} />}>{isDraft ? '导入盘点人员' : '导入未盘说明'}</Button>}
            <Button icon={<Download size={14} />}>导出</Button>
            {isDraft && <Button icon={<Settings size={14} />}>批量填充</Button>}
            {isStarted && <Button type="primary" icon={<ScanLine size={14} />} onClick={() => setScanOpen(true)}>标签扫描</Button>}
            {!isDraft && !isStarted && plan.status !== '关闭' && <Button>批量编辑未盘说明</Button>}
            <Button onClick={onBack}>返回</Button>
          </Space>
        </div>
        <AssetTable
          rows={filteredRows}
          columns={columns}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        />
      </Card>

      <Modal
        open={scanOpen}
        title="标签扫描"
        width={720}
        footer={null}
        onCancel={() => setScanOpen(false)}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Alert type="info" showIcon message={`当前盘点范围：${plan.range}。扫描资产不在该盘点范围时将校验失败。`} />
          <div>
            <Typography.Text type="secondary">扫描资产标签</Typography.Text>
            <Input
              value={scanValue}
              placeholder="扫描后按回车"
              onChange={(event) => setScanValue(event.target.value)}
              onPressEnter={addScan}
            />
          </div>
          <div>
            <Typography.Text type="secondary">全部标签</Typography.Text>
            <Input.TextArea value={scannedTags.join('\n')} rows={6} readOnly />
          </div>
          <DetailGrid columns={3}>
            <DetailItem label="总标签数">{scannedTags.length}</DetailItem>
            <DetailItem label="成功数">{scannedTags.filter((tag) => rows.some((row) => row.assetTag === tag)).length}</DetailItem>
            <DetailItem label="失败数">{scannedTags.filter((tag) => !rows.some((row) => row.assetTag === tag)).length}</DetailItem>
          </DetailGrid>
          <div className="flex justify-center gap-3">
            <Button danger onClick={() => setScannedTags([])}>清空</Button>
            <Button type="primary" onClick={uploadScans}>上传</Button>
            <Button onClick={() => setScanOpen(false)}>返回</Button>
          </div>
        </Space>
      </Modal>
    </Space>
  );
}

function PlansView({ project, projectStatus, setProjectStatus, onBack, onOpenPlanAssets }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [rows, setRows] = useState(INITIAL_PLAN_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [personTarget, setPersonTarget] = useState(null);
  const [customPlanOpen, setCustomPlanOpen] = useState(false);

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.planNo, appliedFilters.planNo)
    && includesText(row.planName, appliedFilters.planName)
    && includesText(row.city, appliedFilters.city)
    && includesText(row.organization, appliedFilters.organization)
    && (!appliedFilters.assetStatus || (appliedFilters.assetStatus === '已盘' ? row.countedCount > 0 : row.uncountedCount > 0))
  )), [rows, appliedFilters]);

  const openPersonnel = (rowKey, field) => setPersonTarget({ rowKey, field });

  const applyPersonnel = (record) => {
    if (!personTarget) return;
    setRows((current) => current.map((row) => row.key === personTarget.rowKey ? { ...row, [personTarget.field]: record.employeeName } : row));
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
    setProjectStatus('盘点中');
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

  const editable = (row) => row.status === '暂存';

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 170, fixed: 'left' },
    { title: '计划名称', dataIndex: 'planName', width: 190 },
    { title: '计划状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: 'City', dataIndex: 'city', width: 120 },
    ...(project.projectType === '复盘'
      ? [
        { title: '财务监督人', dataIndex: 'financialSupervisor', width: 130, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value === '-' ? '' : value} onClick={() => openPersonnel(row.key, 'financialSupervisor')} /> },
        { title: '内审监督人', dataIndex: 'auditSupervisor', width: 130, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value === '-' ? '' : value} onClick={() => openPersonnel(row.key, 'auditSupervisor')} /> },
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
        ? <DatePicker value={dayjs(value)} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, startDate: date ? date.format('YYYY-MM-DD') : '' } : item))} />
        : value,
    },
    {
      title: '盘点结束日期',
      dataIndex: 'endDate',
      width: 145,
      render: (value, row) => editable(row)
        ? <DatePicker value={dayjs(value)} onChange={(date) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, endDate: date ? date.format('YYYY-MM-DD') : '' } : item))} />
        : value,
    },
    { title: '计划负责人', dataIndex: 'manager', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'manager')} /> },
    ...(project.projectType === '复盘' ? [] : [{ title: '计划监督人', dataIndex: 'supervisor', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'supervisor')} /> }]),
    { title: '盘点执行人', dataIndex: 'executor', width: 160, render: (value, row) => <PersonnelInput disabled={!editable(row)} value={value} onClick={() => openPersonnel(row.key, 'executor')} /> },
    { title: '资产清单', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenPlanAssets(row)}>查看</Button> },
  ];

  const selectedRows = rows.filter((row) => selectedKeys.includes(row.key));
  const allSelectedDraft = selectedRows.length > 0 && selectedRows.every((row) => row.status === '暂存');
  const anyStarted = rows.some((row) => row.status === '启动');

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点计划</PageTitle>
      <ProjectInfoCard project={{ ...project, status: projectStatus }} />

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
        <QueryItem label="资产状态"><Select value={draftFilters.assetStatus || undefined} allowClear options={['未盘', '已盘'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('assetStatus', value)} /></QueryItem>
        <QueryItem label="City"><Input value={draftFilters.city} allowClear placeholder="请输入City" onChange={(event) => updateFilter('city', event.target.value)} /></QueryItem>
        <QueryItem label="盘点组织"><Input value={draftFilters.organization} allowClear placeholder="请输入盘点组织" onChange={(event) => updateFilter('organization', event.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>盘点计划明细</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            {!anyStarted && <Button icon={<Plus size={14} />} onClick={() => setCustomPlanOpen(true)}>手工创建计划</Button>}
            {allSelectedDraft && <Button type="primary" icon={<PlayCircle size={14} />} onClick={handleStart}>启动盘点计划</Button>}
            {allSelectedDraft && <Button icon={<Settings size={14} />}>批量填充</Button>}
            {allSelectedDraft && <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除盘点计划</Button>}
            <Button icon={<Upload size={14} />}>{anyStarted ? '导入盘点结果' : '导入'}</Button>
            <Button icon={<Download size={14} />}>导出</Button>
            {project.projectType === '复盘' && anyStarted && <Button type="primary">提交审核</Button>}
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

      <CustomPlanModal
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

function PhotoPlaceholder({ label }) {
  return (
    <div className="w-24 h-20 border border-dashed border-[#d9d9d9] rounded flex flex-col items-center justify-center text-gray-500 hover:border-[#1677ff] hover:text-[#1677ff] cursor-pointer">
      <ImageIcon size={20} />
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
}

function ImageReviewView({ project, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(IMAGE_REVIEW_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [filters, setFilters] = useState({
    assetTag: '', description: '', reviewStatus: '', owner: '', company: '', department: '',
    category: '', startDate: '', endDate: '', inventoryStatus: '', city: '', building: '', planNo: '', planName: '',
  });

  const reviewed = rows.filter((row) => row.reviewStatus === '审核通过').length;
  const reviewedPercent = rows.length ? Math.round((reviewed / rows.length) * 100) : 0;
  const pending = rows.filter((row) => row.reviewStatus !== '审核通过').length;

  const filteredRows = useMemo(() => rows.filter((row) => {
    const asset = row.asset;
    return includesText(asset.assetTag, filters.assetTag)
      && includesText(asset.description, filters.description)
      && includesText(row.reviewStatus, filters.reviewStatus)
      && includesText(asset.owner, filters.owner)
      && includesText(asset.organization, filters.company)
      && includesText(asset.ownerDept, filters.department)
      && includesText(`${asset.category} ${asset.subCategory}`, filters.category)
      && includesText(asset.inventoryStatus, filters.inventoryStatus)
      && includesText(asset.city, filters.city)
      && includesText(asset.building, filters.building)
      && includesText(asset.planNo, filters.planNo)
      && includesText(asset.planName, filters.planName);
  }), [rows, filters]);

  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value || '' }));

  const setDecision = (key, decision) => {
    setRows((current) => current.map((row) => row.key === key && row.reviewStatus !== '审核通过' ? { ...row, decision } : row));
  };

  const submitReview = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择需要提交审核的资产');
      return;
    }
    const selected = new Set(selectedKeys);
    const missing = rows.find((row) => selected.has(row.key) && !row.decision);
    if (missing) {
      messageApi.warning('所选资产中存在未选择审核通过/审核不通过的分录');
      return;
    }
    setRows((current) => current.map((row) => {
      if (!selected.has(row.key)) return row;
      return { ...row, reviewStatus: row.decision === 'pass' ? '审核通过' : '审核不通过' };
    }));
    setSelectedKeys([]);
    messageApi.success('审核结果已提交；审核不通过资产将重新推送盘点待办');
  };

  const columns = [
    {
      title: '资产信息',
      width: 330,
      render: (_, row) => (
        <div className="text-sm leading-6">
          <div><span className="text-gray-500">资产标签号：</span>{row.asset.assetTag}</div>
          <div><span className="text-gray-500">序列号：</span>{row.asset.serialNo}</div>
          <div><span className="text-gray-500">资产大类：</span>{row.asset.category}</div>
          <div><span className="text-gray-500">资产小类：</span>{row.asset.subCategory}</div>
          <div><span className="text-gray-500">资产说明：</span>{row.asset.description}</div>
          <div><span className="text-gray-500">使用说明：</span>{row.asset.useDescription}</div>
          <div><span className="text-gray-500">备注：</span>{row.asset.remark}</div>
          <div><span className="text-gray-500">配置：</span>-</div>
        </div>
      ),
    },
    {
      title: '盘点信息',
      width: 330,
      render: (_, row) => (
        <div className="text-sm leading-6">
          <div><span className="text-gray-500">资产责任人：</span>{row.asset.owner}</div>
          <div><span className="text-gray-500">资产数量：</span>{row.asset.quantity}</div>
          <div><span className="text-gray-500">实际盘点人：</span>{row.asset.counter}</div>
          <div><span className="text-gray-500">盘点日期：</span>{row.asset.inventoryDate}</div>
          <div><span className="text-gray-500">盘点状态：</span><StatusTag value={row.asset.inventoryStatus} /></div>
          <div><span className="text-gray-500">盘点备注：</span>{row.asset.inventoryNote}</div>
          <div><span className="text-gray-500">计划编号：</span>{row.asset.planNo}</div>
          <div><span className="text-gray-500">计划名称：</span>{row.asset.planName}</div>
        </div>
      ),
    },
    {
      title: '盘点照片',
      width: 270,
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          <PhotoPlaceholder label="整体照片" />
          <PhotoPlaceholder label="局部照片" />
          {row.asset.inventoryRange === '机房' && <PhotoPlaceholder label="标签号照片" />}
          {row.asset.inventoryRange === '机房' && <PhotoPlaceholder label="序列号照片" />}
        </div>
      ),
    },
    {
      title: '审核',
      width: 220,
      render: (_, row) => (
        <Space direction="vertical">
          <Radio.Group
            value={row.decision}
            disabled={row.reviewStatus === '审核通过'}
            onChange={(event) => setDecision(row.key, event.target.value)}
            options={[
              { label: '审核通过', value: 'pass' },
              { label: '审核不通过', value: 'fail' },
            ]}
          />
          <StatusTag value={row.reviewStatus} />
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>图片审核</PageTitle>
      <ProjectInfoCard project={project} />

      <Card size="small" title={<CardTitle>审核概览</CardTitle>}>
        <div className="grid grid-cols-3 gap-6 items-center">
          <div>
            <Typography.Text type="secondary">已审核百分比</Typography.Text>
            <Progress percent={reviewedPercent} />
          </div>
          <Statistic title="当前待审核合计" value={pending} />
          <Statistic title="需上传照片资产数量" value={rows.length} />
        </div>
      </Card>

      <QueryBar
        onQuery={() => setFilters((current) => ({ ...current }))}
        onReset={() => setFilters({
          assetTag: '', description: '', reviewStatus: '', owner: '', company: '', department: '',
          category: '', startDate: '', endDate: '', inventoryStatus: '', city: '', building: '', planNo: '', planName: '',
        })}
      >
        <QueryItem label="资产标签号"><Input value={filters.assetTag} allowClear onChange={(event) => update('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="资产说明"><Input value={filters.description} allowClear onChange={(event) => update('description', event.target.value)} /></QueryItem>
        <QueryItem label="图片审核状态"><Select value={filters.reviewStatus || undefined} allowClear options={['待审核', '审核不通过', '审核通过'].map((value) => ({ label: value, value }))} onChange={(value) => update('reviewStatus', value)} /></QueryItem>
        <QueryItem label="资产责任人"><Input value={filters.owner} allowClear onChange={(event) => update('owner', event.target.value)} /></QueryItem>
        <QueryItem label="公司"><Input value={filters.company} allowClear onChange={(event) => update('company', event.target.value)} /></QueryItem>
        <QueryItem label="部门"><Input value={filters.department} allowClear onChange={(event) => update('department', event.target.value)} /></QueryItem>
        <QueryItem label="资产类别"><Input value={filters.category} allowClear onChange={(event) => update('category', event.target.value)} /></QueryItem>
        <QueryItem label="盘点开始时间"><DateFilter value={filters.startDate} onChange={(value) => update('startDate', value)} /></QueryItem>
        <QueryItem label="盘点结束时间"><DateFilter value={filters.endDate} onChange={(value) => update('endDate', value)} /></QueryItem>
        <QueryItem label="盘点状态"><Select value={filters.inventoryStatus || undefined} allowClear options={['未盘', '已盘', '代盘', '报失'].map((value) => ({ label: value, value }))} onChange={(value) => update('inventoryStatus', value)} /></QueryItem>
        <QueryItem label="City"><Input value={filters.city} allowClear onChange={(event) => update('city', event.target.value)} /></QueryItem>
        <QueryItem label="Building"><Input value={filters.building} allowClear onChange={(event) => update('building', event.target.value)} /></QueryItem>
        <QueryItem label="计划编号"><Input value={filters.planNo} allowClear onChange={(event) => update('planNo', event.target.value)} /></QueryItem>
        <QueryItem label="计划名称"><Input value={filters.planName} allowClear onChange={(event) => update('planName', event.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title={<CardTitle>图片审核信息</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" onClick={submitReview}>提交审核</Button>
            <Button icon={<Download size={14} />}>图片审核导出</Button>
            <Button onClick={onBack}>返回</Button>
          </Space>
        </div>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={[...filteredRows].sort((a, b) => {
            const order = { 待审核: 0, 审核不通过: 1, 审核通过: 2 };
            return order[a.reviewStatus] - order[b.reviewStatus];
          })}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 5, showSizeChanger: true }}
        />
      </Card>
    </Space>
  );
}

function ProgressView({ project, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [assetModal, setAssetModal] = useState(null);
  const [detailSelectedKeys, setDetailSelectedKeys] = useState([]);

  const progressColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '盘点方式', dataIndex: 'method', width: 180 },
    { title: '启动时间', dataIndex: 'startDate', width: 120 },
    { title: '结束时间', dataIndex: 'endDate', width: 120 },
    { title: '应盘数量（A）', dataIndex: 'expected', width: 110, align: 'right' },
    { title: '已盘数量（B）', dataIndex: 'counted', width: 110, align: 'right' },
    { title: '报失数量（C）', dataIndex: 'lost', width: 110, align: 'right' },
    { title: '未盘数量（D）', dataIndex: 'uncounted', width: 110, align: 'right' },
    { title: '数量进度（E）', dataIndex: 'progress', width: 150, render: (value) => <Progress percent={value} size="small" /> },
    { title: '备注', dataIndex: 'remark', width: 220 },
  ];

  const detailColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '盘点组织', dataIndex: 'organization', width: 120 },
    { title: '部门', dataIndex: 'department', width: 180 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: '应盘数量（A）', dataIndex: 'expected', width: 110, align: 'right' },
    { title: '已盘数量（B）', dataIndex: 'counted', width: 110, align: 'right' },
    { title: '报失数量（C）', dataIndex: 'lost', width: 110, align: 'right' },
    { title: '未盘数量（D）', dataIndex: 'uncounted', width: 110, align: 'right' },
    { title: '数量进度（E）', dataIndex: 'progress', width: 150, render: (value) => <Progress percent={value} size="small" /> },
    { title: '剩余天数（天）', dataIndex: 'remainingDays', width: 120, align: 'right' },
    ...(project.projectType === '复盘'
      ? [
        { title: '财务监督人', dataIndex: 'financialSupervisor', width: 130 },
        { title: '内审监督人', dataIndex: 'auditSupervisor', width: 130 },
      ]
      : [{ title: '计划监督人', dataIndex: 'supervisor', width: 130 }]),
  ];

  const tabItems = [
    {
      key: 'summary',
      label: '项目进度',
      children: (
        <Card size="small" title={<CardTitle>项目进度</CardTitle>}>
          <div className="mb-3 flex justify-end">
            <Space>
              <Button icon={<Eye size={14} />} onClick={() => setAssetModal('all')}>查看盘点全量资产</Button>
              <Button icon={<Eye size={14} />} onClick={() => setAssetModal('uncounted')}>查看未盘资产</Button>
              <Button icon={<Download size={14} />}>导出项目进度</Button>
            </Space>
          </div>
          <Table rowKey="key" size="small" bordered columns={progressColumns} dataSource={PROGRESS_ROWS} pagination={false} scroll={{ x: 1250 }} />
        </Card>
      ),
    },
    {
      key: 'detail',
      label: '进度详情',
      children: (
        <Card size="small" title={<CardTitle>进度详情</CardTitle>}>
          <div className="mb-3 flex justify-end">
            <Space>
              <Button
                type="primary"
                icon={<BellRing size={14} />}
                onClick={() => {
                  if (!detailSelectedKeys.length) {
                    messageApi.warning('请先选择需要催盘的进度分录');
                    return;
                  }
                  messageApi.success('已向所选分录未盘资产对应的盘点执行人和监督人发送催盘通知及邮件');
                }}
              >
                催盘通知
              </Button>
              <Button icon={<Download size={14} />}>导出进度详情</Button>
            </Space>
          </div>
          <Table
            rowKey="key"
            size="small"
            bordered
            columns={detailColumns}
            dataSource={PROGRESS_DETAIL_ROWS}
            rowSelection={{ selectedRowKeys: detailSelectedKeys, onChange: setDetailSelectedKeys }}
            scroll={{ x: 1450 }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>
      ),
    },
  ];

  const modalRows = assetModal === 'uncounted'
    ? ASSET_ROWS.filter((row) => ['未盘', '报失', '盘亏'].includes(row.inventoryStatus))
    : ASSET_ROWS;

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点进度查看</PageTitle>
      <ProjectInfoCard project={project} />
      <Tabs items={tabItems} defaultActiveKey="summary" />
      <div className="flex justify-center">
        <Button onClick={onBack}>返回</Button>
      </div>

      <Modal
        open={Boolean(assetModal)}
        title={assetModal === 'uncounted' ? '未盘资产' : '盘点全量资产'}
        width={1280}
        footer={<Space><Button icon={<Download size={14} />}>导出</Button><Button type="primary" onClick={() => setAssetModal(null)}>返回</Button></Space>}
        onCancel={() => setAssetModal(null)}
      >
        <AssetTable rows={modalRows} columns={makeAssetColumns({ includeNo: true, includePlan: true, includeCurrentOwner: true, includeContact: true })} />
      </Modal>
    </Space>
  );
}

export default function AssetInventoryProjectPage() {
  const [view, setView] = useState('list');
  const [activeProject, setActiveProject] = useState(PROJECT_INFO);
  const [activePlan, setActivePlan] = useState(INITIAL_PLAN_ROWS[0]);
  const [projectStatus, setProjectStatus] = useState(PROJECT_INFO.status);

  const openProject = (row) => {
    const next = {
      ...PROJECT_INFO,
      ...row,
      status: row.status,
      projectNo: row.projectNo,
      projectName: row.projectName,
      projectType: row.projectType,
      startDate: row.startDate,
      endDate: row.endDate,
    };
    setActiveProject(next);
    setProjectStatus(row.status);
    setView(row.status === '暂存' ? 'create' : 'snapshot');
  };

  if (view === 'create') {
    return (
      <CreateProjectView
        initialProject={activeProject?.status === '暂存' ? activeProject : null}
        onBack={() => setView('list')}
        onGenerated={(project) => {
          setActiveProject(project);
          setProjectStatus('快照生成');
          setView('snapshot');
        }}
      />
    );
  }

  if (view === 'snapshot') {
    return (
      <SnapshotView
        project={activeProject}
        projectStatus={projectStatus}
        setProjectStatus={setProjectStatus}
        onBack={() => setView('list')}
        onOpenPlans={() => setView('plans')}
      />
    );
  }

  if (view === 'plans') {
    return (
      <PlansView
        project={activeProject}
        projectStatus={projectStatus}
        setProjectStatus={setProjectStatus}
        onBack={() => setView('snapshot')}
        onOpenPlanAssets={(plan) => {
          setActivePlan(plan);
          setView('planAssets');
        }}
      />
    );
  }

  if (view === 'planAssets') {
    return <PlanAssetListView project={{ ...activeProject, status: projectStatus }} plan={activePlan} onBack={() => setView('plans')} />;
  }

  if (view === 'progress') {
    return <ProgressView project={{ ...activeProject, status: projectStatus }} onBack={() => setView('list')} />;
  }

  if (view === 'imageReview') {
    return <ImageReviewView project={{ ...activeProject, status: projectStatus }} onBack={() => setView('list')} />;
  }

  return (
    <ProjectListView
      onCreate={() => {
        setActiveProject(null);
        setProjectStatus('暂存');
        setView('create');
      }}
      onOpenProject={openProject}
      onOpenPlans={(row) => {
        openProject(row);
        setView('plans');
      }}
      onOpenProgress={(row) => {
        openProject(row);
        setView('progress');
      }}
      onOpenImageReview={(row) => {
        openProject(row);
        setView('imageReview');
      }}
    />
  );
}
