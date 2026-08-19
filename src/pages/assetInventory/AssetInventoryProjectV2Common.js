import React from 'react';
import { Card, Typography } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

export const PROJECT_TYPES = ['初盘', '抽盘', '复盘'];
export const PROJECT_STATUSES = ['暂存', '快照生成', '生成盘点计划', '盘点中', '盘点关闭'];
export const RANGE_OPTIONS = ['库房', '公共', '机房', '员工'];
export const SCAN_METHOD_OPTIONS = ['狐小e扫码', '狐小e快速扫描资产', '扫码枪', '人工上传盘点结果'];
export const EMPTY_FILTERS = { projectNo: '', projectName: '', status: '', owner: '', startDate: '', endDate: '', projectType: '', createdAt: '' };

export function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}
export function PageTitle({ children }) { return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>; }
export function includesText(value, query) { if (!query) return true; return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase()); }
export function ProjectInfoCard({ project }) {
  return <Card size="small" title={<CardTitle>盘点项目信息</CardTitle>}><DetailGrid columns={3}>
    <DetailItem label="项目编号">{project.projectNo || '-'}</DetailItem><DetailItem label="项目名称">{project.projectName || '-'}</DetailItem><DetailItem label="项目类型">{project.projectType || '-'}</DetailItem>
    <DetailItem label="盘点开始时间">{project.startDate || '-'}</DetailItem><DetailItem label="盘点结束时间">{project.endDate || '-'}</DetailItem><DetailItem label="项目状态"><StatusTag value={project.status || '暂存'} /></DetailItem>
    <DetailItem label="盘点类型">{project.inventoryType || '-'}</DetailItem><DetailItem label="盘点期间">{project.period || '-'}</DetailItem><DetailItem label="快照生成日期">{project.snapshotTime || '-'}</DetailItem>
    <DetailItem label="盘点说明" span={3}>{project.description || '-'}</DetailItem>
  </DetailGrid></Card>;
}
export const assetColumns = [
  { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left' }, { title: '序列号', dataIndex: 'serialNo', width: 140 }, { title: '资产大类', dataIndex: 'category', width: 110 },
  { title: '资产小类', dataIndex: 'subCategory', width: 180 }, { title: '资产说明', dataIndex: 'description', width: 180 }, { title: '数量', dataIndex: 'quantity', width: 70 }, { title: '原值', dataIndex: 'originalValue', width: 110 },
  { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> }, { title: '资产责任人', dataIndex: 'owner', width: 150 }, { title: '责任人部门', dataIndex: 'ownerDept', width: 200 },
  { title: 'City', dataIndex: 'city', width: 110 }, { title: 'Building', dataIndex: 'building', width: 170 }, { title: 'Floor', dataIndex: 'floor', width: 90 }, { title: '盘点组织', dataIndex: 'organization', width: 120 },
  { title: '成本中心', dataIndex: 'costCenter', width: 180 }, { title: '启用日期', dataIndex: 'enableDate', width: 120 },
];
