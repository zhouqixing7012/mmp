import React from 'react';
import { Card, InputNumber, Select, Switch, Table, Typography } from 'antd';
import { OwnerLevelSelect } from '../../components/AssetQueryControls';
import { ASSET_ROWS } from './mockData';

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}

export default function InventoryPhotoRuleEditor({ config, onChange }) {
  const rows = config.rules;
  const multiOptions = (values) => values.map((value) => ({ label: value, value }));
  const changeRow = (key, field, value) => onChange({ ...config, rules: rows.map(row => row.key === key ? { ...row, [field]: value } : row) });
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 100, fixed: 'left', render: (value) => <Typography.Text>{value || '-'}</Typography.Text> },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 170, render: (value, row) => <OwnerLevelSelect rows={ASSET_ROWS} disabled={!row.uploadEnabled} value={value} onChange={(next) => changeRow(row.key, 'ownerLevel', next)} /> },
    { title: '部门', dataIndex: 'department', width: 170, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '集团总部.MIS部', '搜狐媒体.智能平台'])} onChange={(next) => changeRow(row.key, 'department', next)} /> },
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'])} onChange={(next) => changeRow(row.key, 'category', next)} /> },
    { title: '资产状态', dataIndex: 'assetStatus', width: 160, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '在用', '在库'])} onChange={(next) => changeRow(row.key, 'assetStatus', next)} /> },
    { title: '盘点组织', dataIndex: 'organization', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['集团'])} onChange={(next) => changeRow(row.key, 'organization', next)} /> },
    { title: 'City', dataIndex: 'city', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['北京市'])} onChange={(next) => changeRow(row.key, 'city', next)} /> },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', '融科资讯中心D座', '搜狐媒体大厦'])} onChange={(next) => changeRow(row.key, 'building', next)} /> },
    { title: 'Floor', dataIndex: 'floor', width: 150, render: (value, row) => <Select disabled={!row.uploadEnabled} mode="multiple" value={value} className="w-full" options={multiOptions(['全部', 'B2', '6F', '8F'])} onChange={(next) => changeRow(row.key, 'floor', next)} /> },
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, row) => <InputNumber disabled={!row.uploadEnabled} min={0} max={100} value={value} className="w-full" onChange={(next) => changeRow(row.key, 'percent', next ?? 100)} /> },
    { title: '是否上传图片', width: 120, fixed: 'right', align: 'center', render: (_, row) => <Switch aria-label={`${row.range}图片上传开关`} checked={Boolean(row.uploadEnabled)} onChange={(checked) => changeRow(row.key, 'uploadEnabled', checked)} /> },
  ];
  return <Card size="small" title={<CardTitle>图片上传规则配置</CardTitle>}><Table rowKey="key" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 1800 }} pagination={false} /></Card>;
}
