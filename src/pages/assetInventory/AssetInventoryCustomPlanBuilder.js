import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Download, Eye, Search, Trash2 } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import { ASSET_ROWS, EMPLOYEE_ROWS } from './mockData';

const RANGE_OPTIONS = ['机房', '公共', '员工', '库房'];
const PLAN_RANGE_OPTIONS = ['员工', '库房', '公共', '机房'];
const EMPTY_ASSET_FILTERS = { assetTag: '', owner: '', ownerLevel: '' };

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

const INITIAL_SCOPE_ROWS = [
  {
    key: 'custom-scope-1', company: '集团', department: '内容合作部.商业客户部.商业运营', plate: '新媒体', assetTag: '-', category: 'NOTEBOOK、MONITOR', serialNo: '-', printNo: '-', description: '-', status: '在用、在库', owner: '-', ownerLevel: '全部', costCenter: '-', enableFrom: '2020-01-01', enableTo: '2026-06-30', warehouse: '-', city: '北京市', building: '搜狐媒体大厦', floor: '全部', methods: ['员工'], ratio: 100,
  },
  {
    key: 'custom-scope-2', company: '集团', department: '设计组.移动设计组.创新&运营', plate: '新媒体', assetTag: '-', category: 'NOTEBOOK、MONITOR', serialNo: '-', printNo: '-', description: '-', status: '在用、在库', owner: '-', ownerLevel: '全部', costCenter: '-', enableFrom: '2020-01-01', enableTo: '2026-06-30', warehouse: '-', city: '北京市', building: '搜狐媒体大厦', floor: '全部', methods: ['员工'], ratio: 100,
  },
];

function PlanInfoModal({ open, onCancel, onConfirm }) {
  const [planName, setPlanName] = useState('自定义盘点计划');
  const [rows, setRows] = useState(() => PLAN_RANGE_OPTIONS.map((range) => ({ key: range, range, supervisor: '', executor: '' })));
  const [personTarget, setPersonTarget] = useState(null);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const updatePerson = (record) => {
    if (!personTarget) return;
    setRows((current) => current.map((row) => row.key === personTarget.rowKey ? { ...row, [personTarget.field]: record.employeeName } : row));
    setPersonTarget(null);
  };
  const confirm = () => {
    if (!planName.trim()) { messageApi.warning('请填写计划名称'); return; }
    onConfirm({ planName, rows });
  };
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 110, fixed: 'left' },
    { title: '盘点监督人', dataIndex: 'supervisor', width: 240, render: (value, row) => <Input readOnly value={value} placeholder="选填" suffix={<Search size={14} className="text-[#1677ff]" />} onClick={() => setPersonTarget({ rowKey: row.key, field: 'supervisor' })} /> },
    { title: '盘点执行人', dataIndex: 'executor', width: 240, render: (value, row) => <Input readOnly value={value} placeholder="选填" suffix={<Search size={14} className="text-[#1677ff]" />} onClick={() => setPersonTarget({ rowKey: row.key, field: 'executor' })} /> },
  ];
  return <>
    {contextHolder}
    <Modal open={open} title="设置计划信息" width={720} okText="确定" cancelText="取消" onCancel={onCancel} onOk={confirm}>
      <Space direction="vertical" size={16} className="w-full">
        <div><Typography.Text type="secondary"><span className="text-red-500 mr-1">*</span>计划名称</Typography.Text><Input value={planName} maxLength={100} onChange={(event) => setPlanName(event.target.value)} /></div>
        <Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} pagination={false} scroll={{ x: 590 }} />
      </Space>
    </Modal>
    <SelectModal open={Boolean(personTarget)} title="用户列表" rowKey="id" dataSource={EMPLOYEE_ROWS} searchFields={[{ label: '员工编号', name: 'employeeNo', dataIndex: 'employeeNo' }, { label: '员工姓名', name: 'employeeName', dataIndex: 'employeeName' }, { label: '部门名称', name: 'department', dataIndex: 'department' }]} columns={[{ title: '员工编号', dataIndex: 'employeeNo' }, { title: '员工姓名', dataIndex: 'employeeName' }, { title: '部门名称', dataIndex: 'department' }]} onCancel={() => setPersonTarget(null)} onConfirm={updatePerson} />
  </>;
}

export default function AssetInventoryCustomPlanBuilder({ onBack, onConfirmPlan, initialAssets = ASSET_ROWS }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [filters, setFilters] = useState({ company: '', department: '', plate: '', assetTag: '', category: '', serialNo: '', description: '', status: '', owner: '', ownerLevel: '', costCenter: '', enableFrom: '', enableTo: '', warehouse: '', city: '', building: '', floor: '', ratio: 100, methods: [] });
  const [scopeRows, setScopeRows] = useState(INITIAL_SCOPE_ROWS);
  const [assetRows, setAssetRows] = useState(() => initialAssets.map((row) => ({ ...row })));
  const [selectedAssetKeys, setSelectedAssetKeys] = useState([]);
  const [assetDraftFilters, setAssetDraftFilters] = useState(EMPTY_ASSET_FILTERS);
  const [assetFilters, setAssetFilters] = useState(EMPTY_ASSET_FILTERS);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const setFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const generateScope = () => {
    const row = {
      key: `custom-scope-${Date.now()}`, company: filters.company || '集团', department: filters.department || '-', plate: filters.plate || '-', assetTag: filters.assetTag || '-', category: filters.category || '全部', serialNo: filters.serialNo || '-', printNo: '-', description: filters.description || '-', status: filters.status || '全部', owner: filters.owner || '-', ownerLevel: filters.ownerLevel || '全部', costCenter: filters.costCenter || '-', enableFrom: filters.enableFrom || '-', enableTo: filters.enableTo || '-', warehouse: filters.warehouse || '-', city: filters.city || '-', building: filters.building || '-', floor: filters.floor || '-', methods: filters.methods.length ? filters.methods : ['员工'], ratio: filters.ratio || 100,
    };
    setScopeRows((current) => [...current, row]);
    messageApi.success('已根据当前条件生成盘点范围明细');
  };
  const filteredAssets = useMemo(() => assetRows.filter((row) => (!assetFilters.assetTag || String(row.assetTag || '').includes(assetFilters.assetTag)) && (!assetFilters.owner || String(row.owner || '').includes(assetFilters.owner)) && (!assetFilters.ownerLevel || String(row.ownerLevel || '').includes(assetFilters.ownerLevel))), [assetRows, assetFilters]);
  const scopeColumns = [
    { title: '公司', dataIndex: 'company', width: 100, fixed: 'left' }, { title: '部门', dataIndex: 'department', width: 190 }, { title: '板块', dataIndex: 'plate', width: 100 }, { title: '资产标签号', dataIndex: 'assetTag', width: 140 }, { title: '资产类别', dataIndex: 'category', width: 150 }, { title: '资产序列号', dataIndex: 'serialNo', width: 140 }, { title: '印刷号', dataIndex: 'printNo', width: 110 }, { title: '说明', dataIndex: 'description', width: 150 }, { title: '资产状态', dataIndex: 'status', width: 120 }, { title: '资产责任人', dataIndex: 'owner', width: 130 }, { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 }, { title: '成本中心', dataIndex: 'costCenter', width: 150 }, { title: '启用日期起', dataIndex: 'enableFrom', width: 120 }, { title: '启用日期止', dataIndex: 'enableTo', width: 120 }, { title: '仓库', dataIndex: 'warehouse', width: 110 }, { title: '城市', dataIndex: 'city', width: 110 }, { title: '地点', dataIndex: 'building', width: 160 }, { title: 'Floor', dataIndex: 'floor', width: 90 }, { title: '盘点范围', dataIndex: 'methods', width: 150, render: (value) => (value || []).join('、') || '-' }, { title: '比例', dataIndex: 'ratio', width: 80, render: (value) => `${value}%` },
    { title: '清单', width: 80, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('已展示该范围资产清单')}>查看</Button> },
    { title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" danger className="px-0" onClick={() => setScopeRows((current) => current.filter((item) => item.key !== row.key))}>删除</Button> },
  ];
  const assetColumns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 140, fixed: 'left' }, { title: '序列号', dataIndex: 'serialNo', width: 130 }, { title: '资产大类', dataIndex: 'category', width: 110 }, { title: '资产小类', dataIndex: 'subCategory', width: 170 }, { title: '资产说明', dataIndex: 'description', width: 180 }, { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' }, { title: '原值', dataIndex: 'originalValue', width: 100, align: 'right' }, { title: '使用状态', dataIndex: 'useStatus', width: 130, render: (value) => <StatusTag value={value} /> }, { title: 'NO位置', dataIndex: 'noLocation', width: 120 }, { title: 'NO状态', width: 100, render: () => '-' }, { title: '备注', dataIndex: 'remark', width: 130 }, { title: '资产责任人', dataIndex: 'owner', width: 140 }, { title: '责任人部门', dataIndex: 'ownerDept', width: 200 }, { title: '责任人级别', dataIndex: 'ownerLevel', width: 110 }, { title: 'City', dataIndex: 'city', width: 110 }, { title: 'Building', dataIndex: 'building', width: 160 }, { title: 'Floor', dataIndex: 'floor', width: 90 }, { title: '账套', dataIndex: 'organization', width: 120 }, { title: '成本中心', dataIndex: 'costCenter', width: 160 }, { title: '启用日期', dataIndex: 'enableDate', width: 120 },
  ];
  const queryFields = [['公司', 'company'], ['部门', 'department'], ['板块', 'plate'], ['标签号', 'assetTag'], ['资产类别', 'category'], ['资产序列号', 'serialNo'], ['资产说明', 'description'], ['资产状态', 'status'], ['资产责任人', 'owner'], ['资产责任人职级', 'ownerLevel'], ['成本中心', 'costCenter'], ['仓库', 'warehouse'], ['City', 'city'], ['Building', 'building'], ['Floor', 'floor']];
  const handleDeleteAssets = () => {
    if (!selectedAssetKeys.length) { messageApi.warning('请先选择需要删除的资产'); return; }
    const selected = new Set(selectedAssetKeys);
    setAssetRows((current) => current.filter((row) => !selected.has(row.key)));
    setSelectedAssetKeys([]);
  };
  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}<PageTitle>创建盘点计划</PageTitle>
    <Card size="small" title={<CardTitle>盘点范围筛选</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {queryFields.map(([label, field]) => <div key={field} className="flex items-center gap-2 min-w-0"><span className="w-24 shrink-0 text-right text-sm text-gray-600">{label}:</span><Input value={filters[field]} placeholder={`请输入${label}`} onChange={(event) => setFilter(field, event.target.value)} /></div>)}
        <div className="flex items-center gap-2 min-w-0"><span className="w-24 shrink-0 text-right text-sm text-gray-600">启用日期从:</span><DatePicker className="flex-1" value={filters.enableFrom ? dayjs(filters.enableFrom) : null} onChange={(date) => setFilter('enableFrom', date ? date.format('YYYY-MM-DD') : '')} /></div>
        <div className="flex items-center gap-2 min-w-0"><span className="w-24 shrink-0 text-right text-sm text-gray-600">启用日期至:</span><DatePicker className="flex-1" value={filters.enableTo ? dayjs(filters.enableTo) : null} onChange={(date) => setFilter('enableTo', date ? date.format('YYYY-MM-DD') : '')} /></div>
        <div className="flex items-center gap-2 min-w-0"><span className="w-24 shrink-0 text-right text-sm text-gray-600">比例:</span><InputNumber min={1} max={100} value={filters.ratio} addonAfter="%" className="flex-1" onChange={(value) => setFilter('ratio', value || 100)} /></div>
        <div className="col-span-3 flex items-center gap-2"><span className="w-24 shrink-0 text-right text-sm text-gray-600">盘点范围:</span><Checkbox.Group options={RANGE_OPTIONS} value={filters.methods} onChange={(value) => setFilter('methods', value)} /></div>
      </div>
      <div className="mt-4 flex justify-center"><Button type="primary" onClick={generateScope}>生成查询</Button></div>
    </Card>
    <Card size="small" title={<CardTitle>盘点范围明细</CardTitle>} extra={<Typography.Text type="secondary">共 {scopeRows.length} 条</Typography.Text>}>
      <div className="mb-3 flex justify-end"><Space><Button icon={<Eye size={14} />} onClick={() => messageApi.info('已展示全部盘点范围资产')}>查看全部</Button><Button danger onClick={() => setScopeRows([])}>删除全部</Button></Space></div>
      <Table rowKey="key" size="small" bordered columns={scopeColumns} dataSource={scopeRows} scroll={{ x: 2700 }} pagination={false} />
    </Card>
    <Card size="small" title={<CardTitle>资产明细</CardTitle>} extra={<Typography.Text type="secondary">共 {filteredAssets.length} 条</Typography.Text>}>
      <QueryBar onQuery={() => setAssetFilters({ ...assetDraftFilters })} onReset={() => { setAssetDraftFilters(EMPTY_ASSET_FILTERS); setAssetFilters(EMPTY_ASSET_FILTERS); }}>
        <QueryItem label="资产标签号"><Input value={assetDraftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => setAssetDraftFilters((current) => ({ ...current, assetTag: event.target.value }))} /></QueryItem>
        <QueryItem label="资产责任人"><Input value={assetDraftFilters.owner} allowClear placeholder="请输入资产责任人" onChange={(event) => setAssetDraftFilters((current) => ({ ...current, owner: event.target.value }))} /></QueryItem>
        <QueryItem label="责任人职级"><Input value={assetDraftFilters.ownerLevel} allowClear placeholder="请输入责任人职级" onChange={(event) => setAssetDraftFilters((current) => ({ ...current, ownerLevel: event.target.value }))} /></QueryItem>
      </QueryBar>
      <div className="mb-3 flex justify-end pr-[2px]"><Space><Button icon={<Download size={14} />} onClick={() => messageApi.success('已导出当前资产清册')}>导出清册</Button><Button danger icon={<Trash2 size={14} />} onClick={handleDeleteAssets}>删除</Button></Space></div>
      <Table rowKey="key" size="small" bordered columns={assetColumns} dataSource={filteredAssets} rowSelection={{ selectedRowKeys: selectedAssetKeys, onChange: setSelectedAssetKeys }} scroll={{ x: 2450 }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </Card>
    <div className="flex justify-center pb-2"><Space><Button type="primary" onClick={() => setPlanModalOpen(true)}>生成计划</Button><Button onClick={onBack}>返回</Button></Space></div>
    <PlanInfoModal open={planModalOpen} onCancel={() => setPlanModalOpen(false)} onConfirm={(draft) => { setPlanModalOpen(false); onConfirmPlan({ ...draft, assets: assetRows }); }} />
  </Space>;
}
