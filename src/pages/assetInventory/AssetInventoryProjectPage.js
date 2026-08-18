import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import {
  Download,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  PlayCircle,
  Plus,
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
  INITIAL_PLAN_ROWS,
  PROJECT_INFO,
  PROJECT_ROWS,
  SCOPE_ROWS,
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
  status: '',
  city: '',
  company: '',
  mode: '',
};

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
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded bg-[#1677ff]" />
      <span>{children}</span>
    </div>
  );
}

function PageTitle({ children }) {
  return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>;
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

function ProjectInfoCard({ title = '项目信息', includeExtended = false }) {
  return (
    <Card size="small" title={<CardTitle>{title}</CardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="项目编号">{PROJECT_INFO.projectNo}</DetailItem>
        <DetailItem label="项目名称">{PROJECT_INFO.projectName}</DetailItem>
        <DetailItem label="项目类型">{PROJECT_INFO.projectType}</DetailItem>
        {includeExtended && <DetailItem label="盘点规则">{PROJECT_INFO.ruleName}</DetailItem>}
        <DetailItem label="盘点开始日期">{PROJECT_INFO.startDate}</DetailItem>
        <DetailItem label="盘点结束日期">{PROJECT_INFO.endDate}</DetailItem>
        {includeExtended && <DetailItem label="盘点类型">{PROJECT_INFO.inventoryType}</DetailItem>}
        <DetailItem label="期间">{PROJECT_INFO.period}</DetailItem>
        {includeExtended && <DetailItem label="快照生成时间">{PROJECT_INFO.snapshotTime}</DetailItem>}
        {includeExtended && <DetailItem label="盘点说明" span={3}>{PROJECT_INFO.description}</DetailItem>}
      </DetailGrid>
    </Card>
  );
}

const ASSET_COLUMNS = [
  { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left' },
  { title: '印刷号', dataIndex: 'printNo', width: 110 },
  { title: '序列号', dataIndex: 'serialNo', width: 140 },
  { title: '资产大类', dataIndex: 'category', width: 120 },
  { title: '资产小类', dataIndex: 'subCategory', width: 180 },
  { title: '资产说明', dataIndex: 'description', width: 180 },
  { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
  { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right' },
  { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
  { title: 'NO位置', dataIndex: 'noLocation', width: 110 },
  { title: 'NO状态', dataIndex: 'noStatus', width: 110 },
  { title: '备注', dataIndex: 'remark', width: 140 },
  { title: '资产责任人', dataIndex: 'owner', width: 160 },
  { title: '责任人部门', dataIndex: 'ownerDept', width: 150 },
  { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 },
  { title: 'City', dataIndex: 'city', width: 110 },
  { title: 'Building', dataIndex: 'building', width: 160 },
  { title: 'Floor', dataIndex: 'floor', width: 90 },
  { title: '板块', dataIndex: 'plate', width: 110 },
];

function AssetTable({ rows = ASSET_ROWS, rowSelection }) {
  return (
    <Table
      rowKey="key"
      size="small"
      bordered
      columns={ASSET_COLUMNS}
      dataSource={rows}
      rowSelection={rowSelection}
      scroll={{ x: 2450 }}
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
    />
  );
}

function ProjectListView({ onCreate, onOpenSnapshot, onOpenPlans }) {
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
    && inDateRange(row.createdAt, appliedFilters.createdFrom, appliedFilters.createdTo)
  )), [rows, appliedFilters]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handleDelete = () => {
    if (selectedKeys.length === 0) {
      messageApi.warning('请先选择需要删除的盘点项目');
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
    if (selectedKeys.length === 0) {
      messageApi.warning('请先选择需要关闭的盘点项目');
      return;
    }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => (
      selected.has(row.key) ? { ...row, status: '已结束' } : row
    )));
    setSelectedKeys([]);
    messageApi.success('已关闭所选盘点项目');
  };

  const columns = [
    { title: '项目编号', dataIndex: 'projectNo', width: 170, fixed: 'left' },
    { title: '项目类型', dataIndex: 'projectType', width: 100 },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 160,
      render: (value, row) => <Button type="link" className="px-0" onClick={() => onOpenSnapshot(row)}>{value}</Button>,
    },
    { title: '项目状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '盘点开始时间', dataIndex: 'startDate', width: 130 },
    { title: '盘点结束时间', dataIndex: 'endDate', width: 130 },
    { title: '需盘总量', dataIndex: 'needCount', width: 110, align: 'right' },
    { title: '资产总量', dataIndex: 'assetCount', width: 110, align: 'right' },
    { title: '项目责任人', dataIndex: 'owner', width: 130 },
    { title: '项目创建时间', dataIndex: 'createdAt', width: 130 },
    {
      title: '进入计划',
      dataIndex: 'planStatus',
      width: 110,
      render: (value, row) => value === '进入计划'
        ? <Button type="link" className="px-0" onClick={() => onOpenPlans(row)}>进入计划</Button>
        : <Typography.Text type="secondary">尚无计划</Typography.Text>,
    },
    {
      title: '查看进度',
      key: 'progress',
      width: 100,
      render: (_, row) => <Button type="link" className="px-0" onClick={() => onOpenSnapshot(row)}>查看进度</Button>,
    },
    {
      title: '操作',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (_, row) => row.imageApproval
        ? <Button type="link" icon={<ImageIcon size={14} />} className="px-0" onClick={() => messageApi.info('图片审批入口已保留')}>图片审批</Button>
        : '-',
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
          <Select
            value={draftFilters.status || undefined}
            allowClear
            placeholder="请选择"
            options={['草稿', '快照生成', '生成盘点计划', '盘点中', '已结束'].map((value) => ({ label: value, value }))}
            onChange={(value) => updateFilter('status', value)}
          />
        </QueryItem>
        <QueryItem label="项目责任人">
          <Input value={draftFilters.owner} allowClear placeholder="请输入项目责任人" onChange={(event) => updateFilter('owner', event.target.value)} />
        </QueryItem>
        <QueryItem label="盘点开始时间从">
          <DateFilter value={draftFilters.startFrom} placeholder="开始日期" onChange={(value) => updateFilter('startFrom', value)} />
        </QueryItem>
        <QueryItem label="盘点开始时间至">
          <DateFilter value={draftFilters.startTo} placeholder="结束日期" onChange={(value) => updateFilter('startTo', value)} />
        </QueryItem>
        <QueryItem label="项目类型">
          <Select
            value={draftFilters.type || undefined}
            allowClear
            placeholder="请选择"
            options={[{ label: '初盘', value: '初盘' }]}
            onChange={(value) => updateFilter('type', value)}
          />
        </QueryItem>
        <QueryItem label="创建时间从">
          <DateFilter value={draftFilters.createdFrom} placeholder="开始日期" onChange={(value) => updateFilter('createdFrom', value)} />
        </QueryItem>
        <QueryItem label="创建时间至">
          <DateFilter value={draftFilters.createdTo} placeholder="结束日期" onChange={(value) => updateFilter('createdTo', value)} />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title={<CardTitle>盘点项目列表</CardTitle>}
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button type="primary" icon={<Plus size={14} />} onClick={onCreate}>创建项目</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除</Button>
            <Button icon={<XCircle size={14} />} onClick={handleClose}>关闭盘点</Button>
            <Button icon={<Settings size={14} />} onClick={() => messageApi.info('轨迹包未采集配置弹窗字段，未补造配置项')}>配置</Button>
          </Space>
        </div>
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
          scroll={{ x: 1660 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>
    </Space>
  );
}

function ScopeSelector({ generated, onGenerate, onRemoveScope, onClearScopes, messageApi }) {
  const [scopeFilters, setScopeFilters] = useState({});
  const fields = ['公司', '部门', '资产类别', '资产状态', '仓库', '板块', '地点', 'Floor', '责任人职级'];
  const scopeColumns = [
    { title: '公司', dataIndex: 'company', width: 180 },
    { title: '部门', dataIndex: 'department', width: 140 },
    { title: '资产类别', dataIndex: 'assetCategory', width: 180 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 140 },
    { title: '仓库', dataIndex: 'warehouse', width: 120 },
    { title: '板块', dataIndex: 'plate', width: 120 },
    { title: '地点', dataIndex: 'location', width: 120 },
    { title: '楼层', dataIndex: 'floor', width: 100 },
    { title: '责任人职级', dataIndex: 'ownerLevel', width: 120 },
    {
      title: '清单',
      key: 'list',
      width: 90,
      render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('盘点范围清单入口已保留')}>查看</Button>,
    },
    {
      title: '操作',
      key: 'operation',
      width: 90,
      render: (_, row) => <Button type="link" danger className="px-0" onClick={() => onRemoveScope(row.key)}>删除</Button>,
    },
  ];

  return (
    <Card size="small" title={<CardTitle>筛选规则</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {fields.map((label) => (
          <div key={label} className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            <Input
              value={scopeFilters[label] || ''}
              readOnly
              placeholder={`请选择${label}`}
              suffix={<Search size={14} className="text-[#bfbfbf]" />}
              onClick={() => messageApi.info(`${label}选择弹窗未在本次轨迹包中采集，未补造字段`)}
              onChange={() => {}}
            />
          </div>
        ))}
      </div>
      <div className="my-4 flex justify-center">
        <Button type="primary" icon={<Search size={14} />} onClick={() => {
          setScopeFilters({});
          onGenerate();
        }}>生成查询</Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Typography.Text strong>盘点范围明细</Typography.Text>
        <Space>
          <Button icon={<Eye size={14} />} onClick={() => messageApi.info('查看全部盘点范围')}>查看全部</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={onClearScopes}>删除全部</Button>
        </Space>
      </div>
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={scopeColumns}
        dataSource={generated ? SCOPE_ROWS : []}
        scroll={{ x: 1450 }}
        pagination={false}
      />
    </Card>
  );
}

function CreateSnapshotView({ onBack, onGenerated }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [generated, setGenerated] = useState(false);
  const [scopeVisible, setScopeVisible] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetFilters, setAssetFilters] = useState({ assetTag: '', owner: '', ownerLevel: '' });

  const filteredAssets = useMemo(() => ASSET_ROWS.filter((row) => (
    includesText(row.assetTag, assetFilters.assetTag)
    && includesText(row.owner, assetFilters.owner)
    && includesText(row.ownerLevel, assetFilters.ownerLevel)
  )), [assetFilters]);

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>创建盘点项目</PageTitle>
      <ProjectInfoCard includeExtended />

      <ScopeSelector
        generated={generated && scopeVisible}
        onGenerate={() => {
          setGenerated(true);
          setScopeVisible(true);
          messageApi.success('已按当前筛选规则生成盘点范围');
        }}
        onRemoveScope={() => setScopeVisible(false)}
        onClearScopes={() => setScopeVisible(false)}
        messageApi={messageApi}
      />

      <Card size="small" title={<CardTitle>资产明细</CardTitle>}>
        <QueryBar
          onQuery={() => setAssetFilters((current) => ({ ...current }))}
          onReset={() => setAssetFilters({ assetTag: '', owner: '', ownerLevel: '' })}
        >
          <QueryItem label="资产标签号">
            <Input value={assetFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => setAssetFilters((current) => ({ ...current, assetTag: event.target.value }))} />
          </QueryItem>
          <QueryItem label="资产责任人">
            <Input value={assetFilters.owner} allowClear placeholder="请输入资产责任人" onChange={(event) => setAssetFilters((current) => ({ ...current, owner: event.target.value }))} />
          </QueryItem>
          <QueryItem label="责任人职级">
            <Input value={assetFilters.ownerLevel} allowClear placeholder="请输入责任人职级" onChange={(event) => setAssetFilters((current) => ({ ...current, ownerLevel: event.target.value }))} />
          </QueryItem>
        </QueryBar>

        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button icon={<Download size={14} />} onClick={() => messageApi.success('清册导出已触发')}>导出清册</Button>
            <Button icon={<Upload size={14} />} onClick={() => messageApi.info('清册导入入口已保留')}>导入清册</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={() => {
              if (!selectedAssets.length) {
                messageApi.warning('请先选择资产');
                return;
              }
              messageApi.info('原型中仅演示删除交互，不修改来源样例数据');
            }}>删除</Button>
            <Button icon={<Settings size={14} />} onClick={() => messageApi.info('轨迹包未采集资产明细配置弹窗字段')}>配置</Button>
          </Space>
        </div>
        <AssetTable
          rows={generated ? filteredAssets : ASSET_ROWS}
          rowSelection={{ selectedRowKeys: selectedAssets, onChange: setSelectedAssets, fixed: true }}
        />
      </Card>

      <div className="flex justify-center gap-3 pb-2">
        <Button type="primary" onClick={() => {
          if (!generated) {
            messageApi.warning('请先生成盘点范围');
            return;
          }
          onGenerated();
        }}>生成快照</Button>
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}

function SnapshotAssetList({ title }) {
  const [filters, setFilters] = useState({ assetTag: '', owner: '', status: '' });
  const filteredRows = useMemo(() => ASSET_ROWS.filter((row) => (
    includesText(row.assetTag, filters.assetTag)
    && includesText(row.owner, filters.owner)
    && includesText(row.useStatus, filters.status)
  )), [filters]);

  return (
    <Card size="small" title={<CardTitle>{title}</CardTitle>}>
      <QueryBar
        onQuery={() => setFilters((current) => ({ ...current }))}
        onReset={() => setFilters({ assetTag: '', owner: '', status: '' })}
      >
        <QueryItem label="资产标签号">
          <Input value={filters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => setFilters((current) => ({ ...current, assetTag: event.target.value }))} />
        </QueryItem>
        <QueryItem label="资产责任人">
          <Input value={filters.owner} allowClear placeholder="请输入资产责任人" onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))} />
        </QueryItem>
        <QueryItem label="使用状态">
          <Select
            value={filters.status || undefined}
            allowClear
            placeholder="请选择"
            options={[{ label: '已报废-已处置', value: '已报废-已处置' }]}
            onChange={(value) => setFilters((current) => ({ ...current, status: value || '' }))}
          />
        </QueryItem>
      </QueryBar>
      <div className="mb-3 flex justify-end">
        <Space>
          <Button icon={<FileSpreadsheet size={14} />}>批量转移</Button>
          <Button icon={<Download size={14} />}>导出查询结果</Button>
          <Button icon={<Settings size={14} />}>配置</Button>
        </Space>
      </div>
      <AssetTable rows={filteredRows} />
    </Card>
  );
}

function SnapshotView({ onBack, onOpenPlans }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const tabItems = [
    {
      key: 'summary',
      label: '快照清单统计',
      children: (
        <Card size="small" title={<CardTitle>快照清单统计</CardTitle>}>
          <Row gutter={16}>
            <Col span={8}><Statistic title="需盘点资产" value={5412} /></Col>
            <Col span={8}><Statistic title="已盘数量" value={0} /></Col>
            <Col span={8}><Statistic title="未盘数量" value={5412} /></Col>
          </Row>
        </Card>
      ),
    },
    { key: 'required', label: '需盘点资产清单', children: <SnapshotAssetList title="需盘点资产清单" /> },
    { key: 'notRequired', label: '无需盘点资产清单', children: <SnapshotAssetList title="无需盘点资产清单" /> },
    { key: 'excluded', label: '未包含资产清单', children: <SnapshotAssetList title="未包含资产清单" /> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目详情</PageTitle>
      <ProjectInfoCard />
      <div className="flex justify-center">
        <Space wrap>
          <Button type="primary" icon={<PlayCircle size={14} />} onClick={onOpenPlans}>生成盘点计划</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={() => messageApi.info('删除快照入口已保留')}>删除快照</Button>
          <Button icon={<Download size={14} />} onClick={() => messageApi.success('快照导出已触发')}>快照导出</Button>
          <Button onClick={onBack}>返回</Button>
        </Space>
      </div>
      <Tabs items={tabItems} defaultActiveKey="summary" />
    </Space>
  );
}

function PersonnelInput({ value, onClick }) {
  return (
    <Input
      value={value || ''}
      readOnly
      placeholder="请选择"
      suffix={<Search size={14} className="text-[#1677ff]" />}
      onClick={onClick}
      onChange={() => {}}
      style={{ minWidth: 130 }}
    />
  );
}

function PlansView({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_PLAN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_PLAN_FILTERS);
  const [rows, setRows] = useState(INITIAL_PLAN_ROWS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [personTarget, setPersonTarget] = useState(null);
  const [assetListOpen, setAssetListOpen] = useState(false);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.planNo, appliedFilters.planNo)
    && includesText(row.planName, appliedFilters.planName)
    && includesText(row.status, appliedFilters.status)
    && includesText(row.city, appliedFilters.city)
    && includesText(row.company, appliedFilters.company)
    && includesText(row.mode, appliedFilters.mode)
  )), [rows, appliedFilters]);

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
    if (selectedKeys.length === 0) {
      messageApi.warning('请先选择需要启动的盘点计划');
      return;
    }
    const selected = new Set(selectedKeys);
    const missingManager = rows.some((row) => selected.has(row.key) && !row.manager);
    if (missingManager) {
      Modal.warning({
        title: '人员配置不完整',
        content: '所选盘点计划未指定计划负责人，请先完成配置。',
        okText: '确认',
      });
      return;
    }
    setRows((current) => current.map((row) => (
      selected.has(row.key) ? { ...row, status: '启动' } : row
    )));
    setSelectedKeys([]);
    messageApi.success('所选盘点计划已启动');
  };

  const handleDelete = () => {
    if (selectedKeys.length === 0) {
      messageApi.warning('请先选择需要删除的盘点计划');
      return;
    }
    const selected = new Set(selectedKeys);
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    setSelectedKeys([]);
    messageApi.success('已删除所选盘点计划');
  };

  const columns = [
    { title: '计划编号', dataIndex: 'planNo', width: 180, fixed: 'left' },
    { title: '计划名称', dataIndex: 'planName', width: 190 },
    { title: '状态', dataIndex: 'status', width: 90, render: (value) => <StatusTag value={value} /> },
    { title: '公司', dataIndex: 'company', width: 90 },
    { title: '城市', dataIndex: 'city', width: 130 },
    { title: '盘点方式', dataIndex: 'mode', width: 100 },
    { title: '资产总量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '未盘数量', dataIndex: 'uncountedCount', width: 100, align: 'right' },
    { title: '已盘数量', dataIndex: 'countedCount', width: 100, align: 'right' },
    { title: '盘点开始日期', dataIndex: 'startDate', width: 130 },
    { title: '盘点结束日期', dataIndex: 'endDate', width: 130 },
    {
      title: '计划负责人',
      dataIndex: 'manager',
      width: 160,
      render: (value, row) => <PersonnelInput value={value} onClick={() => openPersonnel(row.key, 'manager')} />,
    },
    {
      title: '盘点监督人',
      dataIndex: 'supervisor',
      width: 160,
      render: (value, row) => <PersonnelInput value={value} onClick={() => openPersonnel(row.key, 'supervisor')} />,
    },
    {
      title: '盘点执行人',
      dataIndex: 'executor',
      width: 160,
      render: (value, row) => <PersonnelInput value={value} onClick={() => openPersonnel(row.key, 'executor')} />,
    },
    {
      title: '资产清单',
      key: 'assets',
      width: 100,
      fixed: 'right',
      render: () => <Button type="link" className="px-0" onClick={() => setAssetListOpen(true)}>查看</Button>,
    },
  ];

  const totalAssets = rows.reduce((sum, row) => sum + Number(row.assetCount || 0), 0);
  const totalUncounted = rows.reduce((sum, row) => sum + Number(row.uncountedCount || 0), 0);
  const totalCounted = rows.reduce((sum, row) => sum + Number(row.countedCount || 0), 0);

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点计划</PageTitle>
      <ProjectInfoCard title="盘点项目信息" />

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
        <QueryItem label="计划编号">
          <Input value={draftFilters.planNo} allowClear placeholder="请输入计划编号" onChange={(event) => updateFilter('planNo', event.target.value)} />
        </QueryItem>
        <QueryItem label="计划名称">
          <Input value={draftFilters.planName} allowClear placeholder="请输入计划名称" onChange={(event) => updateFilter('planName', event.target.value)} />
        </QueryItem>
        <QueryItem label="计划状态">
          <Select
            value={draftFilters.status || undefined}
            allowClear
            placeholder="请选择"
            options={['草稿', '启动'].map((value) => ({ label: value, value }))}
            onChange={(value) => updateFilter('status', value)}
          />
        </QueryItem>
        <QueryItem label="城市">
          <Input value={draftFilters.city} allowClear placeholder="请输入城市" onChange={(event) => updateFilter('city', event.target.value)} />
        </QueryItem>
        <QueryItem label="公司">
          <Select
            value={draftFilters.company || undefined}
            allowClear
            placeholder="请选择"
            options={[{ label: '集团', value: '集团' }]}
            onChange={(value) => updateFilter('company', value)}
          />
        </QueryItem>
        <QueryItem label="盘点方式">
          <Select
            value={draftFilters.mode || undefined}
            allowClear
            placeholder="请选择"
            options={['库房', '员工', '公共'].map((value) => ({ label: value, value }))}
            onChange={(value) => updateFilter('mode', value)}
          />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title={<CardTitle>盘点计划明细</CardTitle>}
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-between gap-3">
          <Alert
            type="info"
            showIcon
            message={`总计 ${totalAssets} 项资产，未盘 ${totalUncounted}，已盘 ${totalCounted}`}
            className="flex-1"
          />
          <Space wrap>
            <Button disabled icon={<Plus size={14} />}>手动创建</Button>
            <Button type="primary" icon={<PlayCircle size={14} />} onClick={handleStart}>启动盘点计划</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除盘点计划</Button>
            <Button icon={<Upload size={14} />} onClick={() => messageApi.info('导入入口已保留')}>导入</Button>
            <Button icon={<Download size={14} />} onClick={() => messageApi.success('导出已触发')}>导出</Button>
            <Button icon={<Settings size={14} />} onClick={() => messageApi.info('轨迹包未采集计划配置弹窗字段')}>配置</Button>
          </Space>
        </div>

        <Table
          rowKey="key"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
          scroll={{ x: 2080 }}
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

      <Modal
        open={assetListOpen}
        title="资产清单"
        width={1100}
        footer={<Button type="primary" onClick={() => setAssetListOpen(false)}>返回</Button>}
        onCancel={() => setAssetListOpen(false)}
      >
        <AssetTable rows={ASSET_ROWS} />
      </Modal>
    </Space>
  );
}

export default function AssetInventoryProjectPage() {
  const [view, setView] = useState('list');

  if (view === 'create') {
    return <CreateSnapshotView onBack={() => setView('list')} onGenerated={() => setView('snapshot')} />;
  }

  if (view === 'snapshot') {
    return <SnapshotView onBack={() => setView('list')} onOpenPlans={() => setView('plans')} />;
  }

  if (view === 'plans') {
    return <PlansView onBack={() => setView('snapshot')} />;
  }

  return (
    <ProjectListView
      onCreate={() => setView('create')}
      onOpenSnapshot={() => setView('snapshot')}
      onOpenPlans={() => setView('plans')}
    />
  );
}
