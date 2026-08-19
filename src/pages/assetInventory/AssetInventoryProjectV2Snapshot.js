import React, { useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, InputNumber, Select, Space, Statistic, Switch, Table, Tabs, Typography, message as antdMessage } from 'antd';
import { ASSET_ROWS, IMAGE_RULE_ROWS, INVENTORY_RANGE_METHOD_ROWS, UNINCLUDED_ASSET_ROWS } from './mockData';
import { CardTitle, PageTitle, ProjectInfoCard, RANGE_OPTIONS, SCAN_METHOD_OPTIONS, assetColumns } from './AssetInventoryProjectV2Common';

function InventoryMethodSettingsCard() {
  const [rows, setRows] = useState(INVENTORY_RANGE_METHOD_ROWS);
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    { title: '盘点方式', dataIndex: 'methods', width: 520, render: (value, row) => <Checkbox.Group options={SCAN_METHOD_OPTIONS} value={value} onChange={(methods) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, methods } : item))} /> },
    { title: '备注', dataIndex: 'remark', width: 260, render: (value, row) => <Input value={value} placeholder="选填" onChange={(event) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, remark: event.target.value } : item))} /> },
  ];
  return <Card size="small" title={<CardTitle>盘点方式设置</CardTitle>}><Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} pagination={false} /></Card>;
}
function ImageUploadRulesCard() {
  const [enabled, setEnabled] = useState(true);
  const [rows, setRows] = useState(IMAGE_RULE_ROWS);
  const multiOptions = (values) => values.map((value) => ({ label: value, value }));
  const change = (key, field, value) => setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row));
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100, render: (value, row) => <Select className="w-full" value={value} options={RANGE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(next) => change(row.key, 'range', next)} /> },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 170, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', '1', '5', '实习生', '公共'])} onChange={(next) => change(row.key, 'ownerLevel', next)} /> },
    { title: '部门', dataIndex: 'department', width: 170, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', '集团总部.MIS部', '搜狐媒体.智能平台'])} onChange={(next) => change(row.key, 'department', next)} /> },
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'])} onChange={(next) => change(row.key, 'category', next)} /> },
    { title: '资产状态', dataIndex: 'assetStatus', width: 150, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', '在用', '在库'])} onChange={(next) => change(row.key, 'assetStatus', next)} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 150, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['集团'])} onChange={(next) => change(row.key, 'organization', next)} /> },
    { title: 'City', dataIndex: 'city', width: 140, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['北京市', '上海市'])} onChange={(next) => change(row.key, 'city', next)} /> },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', '融科资讯中心D座', '搜狐媒体大厦'])} onChange={(next) => change(row.key, 'building', next)} /> },
    { title: 'Floor', dataIndex: 'floor', width: 130, render: (value, row) => <Select mode="multiple" className="w-full" value={value} options={multiOptions(['全部', 'B2', '6F', '8F'])} onChange={(next) => change(row.key, 'floor', next)} /> },
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, row) => <InputNumber className="w-full" min={0} max={100} value={value} onChange={(next) => change(row.key, 'percent', next ?? 100)} /> },
  ];
  return (
    <Card size="small" title={<CardTitle>图片上传规则配置</CardTitle>} extra={<Space><Typography.Text>是否上传图片</Typography.Text><Switch checked={enabled} onChange={setEnabled} /></Space>}>
      {!enabled ? <Alert type="info" showIcon message="未开启图片上传，本项目盘点资产不要求上传盘点照片。" /> : <Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1750 }} pagination={false} />}
    </Card>
  );
}
export default function SnapshotView({ project, onBack, onDeleteSnapshot, onGeneratePlans }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const executeRows = ASSET_ROWS.filter((row) => row.executeInventory);
  const notExecuteRows = ASSET_ROWS.filter((row) => !row.executeInventory);
  const total = ASSET_ROWS.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const executeCount = executeRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const counted = executeRows.filter((row) => ['已盘', '代盘'].includes(row.inventoryStatus)).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const lost = executeRows.filter((row) => row.inventoryStatus === '报失').reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const rate = executeCount ? Math.round((counted / executeCount) * 1000) / 10 : 0;

  const tabs = [
    { key: 'summary', label: '快照清单统计', children: <div className="grid grid-cols-4 gap-4"><Card size="small"><Statistic title="盘点资产总量" value={total} /></Card><Card size="small"><Statistic title="执行盘点数量" value={executeCount} /></Card><Card size="small"><Statistic title="未执行盘点数量" value={total - executeCount} /></Card><Card size="small"><Statistic title="盘到率" value={rate} suffix="%" /></Card><Card size="small"><Statistic title="已盘数量" value={counted} /></Card><Card size="small"><Statistic title="未盘数量" value={Math.max(executeCount - counted - lost, 0)} /></Card><Card size="small"><Statistic title="盘亏/报失数量" value={lost} /></Card></div> },
    { key: 'execute', label: `执行盘点资产清单（${executeRows.length}）`, children: <Table rowKey="key" size="small" bordered columns={assetColumns} dataSource={executeRows} scroll={{ x: 1900 }} pagination={{ pageSize: 10 }} /> },
    { key: 'not-execute', label: `未执行盘点资产清单（${notExecuteRows.length}）`, children: <Table rowKey="key" size="small" bordered columns={assetColumns} dataSource={notExecuteRows} scroll={{ x: 1900 }} pagination={{ pageSize: 10 }} /> },
    { key: 'unincluded', label: `未包含资产清单（${UNINCLUDED_ASSET_ROWS.length}）`, children: <Table rowKey="key" size="small" bordered columns={assetColumns} dataSource={UNINCLUDED_ASSET_ROWS} scroll={{ x: 1900 }} pagination={{ pageSize: 10 }} /> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目快照（方案二）</PageTitle>
      <ProjectInfoCard project={{ ...project, status: '快照生成' }} />
      <Alert type="success" showIcon message="快照已生成。方案二从此节点开始维护盘点方式及图片上传规则。" />
      <InventoryMethodSettingsCard />
      <ImageUploadRulesCard />
      <Card size="small" title={<CardTitle>快照清单</CardTitle>}><Tabs items={tabs} /></Card>
      <div className="flex justify-center"><Space><Button onClick={onBack}>返回</Button><Button onClick={() => messageApi.success('快照导出任务已创建')}>快照导出</Button><Button danger onClick={onDeleteSnapshot}>删除快照</Button><Button type="primary" onClick={onGeneratePlans}>生成盘点计划</Button></Space></div>
    </Space>
  );
}
