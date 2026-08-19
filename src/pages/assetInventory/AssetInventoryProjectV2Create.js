import React, { useState } from 'react';
import { Button, Card, DatePicker, Input, InputNumber, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { ASSET_ROWS, PROJECT_INFO, PROJECT_ROWS, SCOPE_ROWS } from './mockData';
import { CardTitle, PageTitle, PROJECT_TYPES, assetColumns } from './AssetInventoryProjectV2Common';

function BasicInfoEditor({ project, setProject }) {
  const setField = (field, value) => setProject((current) => ({ ...current, [field]: value }));
  const changeProjectType = (value) => {
    const prefix = value === '初盘' ? 'CP' : value === '抽盘' ? 'DCP' : 'RCP';
    setProject((current) => ({
      ...current,
      projectType: value,
      projectNo: `${prefix}-20260819-0001`,
      initialProjectNo: value === '初盘' ? '-' : 'CP-202608180001',
      samplingMode: value === '初盘' ? '-' : '全盘',
      samplingRatio: value === '初盘' ? '-' : 100,
    }));
  };

  return (
    <Card size="small" title={<CardTitle>基本信息</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <div><Typography.Text type="secondary">项目编号</Typography.Text><Input value={project.projectNo} readOnly /></div>
        <div><Typography.Text type="secondary">项目名称</Typography.Text><Input value={project.projectName} onChange={(event) => setField('projectName', event.target.value)} /></div>
        <div><Typography.Text type="secondary">项目类型</Typography.Text><Select className="w-full" value={project.projectType} options={PROJECT_TYPES.map((value) => ({ label: value, value }))} onChange={changeProjectType} /></div>
        <div><Typography.Text type="secondary">盘点开始时间</Typography.Text><DatePicker className="w-full" value={dayjs(project.startDate)} onChange={(date) => setField('startDate', date ? date.format('YYYY-MM-DD') : '')} /></div>
        <div><Typography.Text type="secondary">盘点结束时间</Typography.Text><DatePicker className="w-full" value={dayjs(project.endDate)} disabledDate={(date) => project.startDate && date.isBefore(dayjs(project.startDate), 'day')} onChange={(date) => setField('endDate', date ? date.format('YYYY-MM-DD') : '')} /></div>
        <div><Typography.Text type="secondary">盘点类型</Typography.Text><Select className="w-full" value={project.inventoryType} options={['年度', '季度', '月度'].map((value) => ({ label: value, value }))} onChange={(value) => setField('inventoryType', value)} /></div>
        <div><Typography.Text type="secondary">盘点期间</Typography.Text><Input value={project.period} onChange={(event) => setField('period', event.target.value)} /></div>
        {project.projectType !== '初盘' && <div><Typography.Text type="secondary">初盘项目</Typography.Text><Select className="w-full" value={project.initialProjectNo === '-' ? undefined : project.initialProjectNo} options={PROJECT_ROWS.filter((row) => row.projectType === '初盘' && row.status !== '盘点关闭').map((row) => ({ label: `${row.projectNo} ${row.projectName}`, value: row.projectNo }))} onChange={(value) => setField('initialProjectNo', value)} /></div>}
        {project.projectType !== '初盘' && <div><Typography.Text type="secondary">抽样方式</Typography.Text><Select className="w-full" value={project.samplingMode === '-' ? '全盘' : project.samplingMode} options={['全盘', '百分比'].map((value) => ({ label: value, value }))} onChange={(value) => setField('samplingMode', value)} /></div>}
        {project.projectType !== '初盘' && project.samplingMode === '百分比' && <div><Typography.Text type="secondary">比例（%）</Typography.Text><InputNumber className="w-full" min={1} max={100} value={Number(project.samplingRatio || 100)} onChange={(value) => setField('samplingRatio', value || 100)} /></div>}
        <div><Typography.Text type="secondary">快照生成日期</Typography.Text><Input value={project.snapshotTime === '-' ? '' : project.snapshotTime} readOnly placeholder="生成快照后自动反写" /></div>
        <div className="col-span-3"><Typography.Text type="secondary">盘点说明</Typography.Text><Input.TextArea value={project.description} maxLength={150} showCount rows={2} onChange={(event) => setField('description', event.target.value)} /></div>
      </div>
    </Card>
  );
}
function ScopeCard({ rows, setRows, messageApi }) {
  const [filters, setFilters] = useState({ organization: '', department: '', assetCategory: '', assetStatus: '', warehouse: '', city: '', building: '', floor: '', owner: '', ownerLevel: '' });
  const fields = [
    ['盘点组织', 'organization'], ['部门', 'department'], ['资产类别', 'assetCategory'], ['资产状态', 'assetStatus'], ['仓库', 'warehouse'],
    ['City', 'city'], ['Building', 'building'], ['Floor', 'floor'], ['资产责任人', 'owner'], ['资产责任人职级', 'ownerLevel'],
  ];
  const columns = [
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
  ];

  const generate = () => {
    setRows((current) => [...current, {
      key: `scope-v2-${Date.now()}`,
      organization: filters.organization || '集团',
      department: filters.department || '-',
      assetCategory: filters.assetCategory || 'SERVER、NOTEBOOK',
      assetStatus: filters.assetStatus || '在用、在库',
      warehouse: filters.warehouse || '-',
      city: filters.city || '北京市',
      building: filters.building || '全部',
      floor: filters.floor || '全部',
      ownerLevel: filters.ownerLevel || '全部',
      enableFrom: '2020-01-01',
      enableTo: '2026-06-30',
    }]);
    messageApi.success('已根据筛选条件生成盘点范围');
  };

  return (
    <Card size="small" title={<CardTitle>盘点范围筛选</CardTitle>}>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-3">
        {fields.map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            <Input value={filters[field]} placeholder={`请输入${label}`} onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))} />
          </div>
        ))}
      </div>
      <div className="mb-3 flex justify-end"><Button type="primary" onClick={generate}>生成查询</Button></div>
      <Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1450 }} pagination={false} />
    </Card>
  );
}
export default function CreateProjectView({ initialProject, onBack, onGenerated }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [project, setProject] = useState(() => ({
    ...PROJECT_INFO,
    ...initialProject,
    projectNo: initialProject?.projectNo || 'CP-20260819-0001',
    projectName: initialProject?.projectName || '2026年-年度盘点',
    status: '暂存',
    snapshotTime: '-',
  }));
  const [scopeRows, setScopeRows] = useState(SCOPE_ROWS);

  const generateSnapshot = () => {
    const next = {
      ...project,
      status: '快照生成',
      snapshotTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    messageApi.success('快照已生成');
    onGenerated(next);
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>{initialProject ? '编辑盘点项目（方案二）' : '创建盘点项目（方案二）'}</PageTitle>
      <BasicInfoEditor project={project} setProject={setProject} />
      <ScopeCard rows={scopeRows} setRows={setScopeRows} messageApi={messageApi} />
      <Card size="small" title={<CardTitle>盘点资产范围明细</CardTitle>} extra={<Typography.Text type="secondary">共 {ASSET_ROWS.length} 条</Typography.Text>}>
        <Table rowKey="key" size="small" bordered columns={assetColumns} dataSource={ASSET_ROWS} scroll={{ x: 1900 }} pagination={{ pageSize: 10 }} />
      </Card>
      <div className="flex justify-center"><Space><Button onClick={onBack}>返回</Button><Button onClick={() => messageApi.success('盘点项目已暂存')}>保存</Button><Button type="primary" onClick={generateSnapshot}>生成快照</Button></Space></div>
    </Space>
  );
}
