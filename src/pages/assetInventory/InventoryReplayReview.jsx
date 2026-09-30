import React, { useState } from 'react';
import { Button, Card, Input, Space, Table, Typography } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, formatAssetCategory, matchesAssetCategory, matchesQuerySelection } from '../../components/AssetQueryControls';
import SectionCardTitle from './SectionCardTitle';

const FIELDS = [['资产标签号','assetTag'],['资产类别','category'],['资产说明','description'],['使用状态','useStatus'],['资产责任人','owner'],['责任人部门','ownerDept'],['City','city'],['Building','building'],['盘点状态','inventoryStatus']];
const EMPTY = Object.fromEntries(FIELDS.map(([,key]) => [key, ['category', 'owner'].includes(key) ? [] : '']));
export default function InventoryReplayReview({ project, plans, assetsForPlan, submission, onBack }) {
  const [planNo, setPlanNo] = useState(plans[0]?.planNo);
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const plan = plans.find((row) => row.planNo === planNo) || plans[0];
  const assets = plan ? assetsForPlan(plan) : [];
  const matches = assets.filter((row) => FIELDS.every(([, key]) => {
    if (key === 'category') return matchesAssetCategory(row, filters.category);
    if (!['assetTag', 'description'].includes(key)) return matchesQuerySelection(row[key], filters[key]);
    return !filters[key] || String(row[key] || '').includes(filters[key]);
  }));
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const queryControl = (key) => {
    if (key === 'category') return <AssetCategorySelect rows={assets} value={draft.category} onChange={(value) => updateDraft(key, value)} />;
    if (key === 'owner') return <AssetPersonSelect rows={assets} value={draft.owner} onChange={(value) => updateDraft(key, value)} />;
    if (!['assetTag', 'description'].includes(key)) return <AssetValueSelect rows={assets} field={key} value={draft[key]} onChange={(value) => updateDraft(key, value || '')} />;
    return <Input allowClear value={draft[key]} onChange={(event) => updateDraft(key, event.target.value)} />;
  };
  const summary = plans.map((row) => {
    const list = assetsForPlan(row); const counted = list.filter((asset) => asset.inventoryStatus === '已盘' || asset.inventoryStatus === '代盘').length;
    return {...row, period: project.period, financialSupervisor:'徐博', assetCount:list.length, countedCount:counted, uncountedCount:list.length-counted, ratio:list.length ? `${(counted/list.length*100).toFixed(2)}%` : '0.00%'};
  });
  return <div data-inventory-review><Space direction="vertical" size={16} className="w-full">
    <Typography.Title level={4} style={{margin:0}}>复盘结果审核</Typography.Title>
    <Card size="small" title={<SectionCardTitle>复盘信息</SectionCardTitle>}><Table size="small" bordered pagination={false} rowKey="planNo" scroll={{x:'max-content'}} dataSource={summary} columns={[
      {title:'计划编号',dataIndex:'planNo',render:(value)=><Button type="link" onClick={()=>{setPlanNo(value);setDraft(EMPTY);setFilters(EMPTY);}}>{value}</Button>},
      ...[['计划名称','planName'],['期间','period'],['计划负责人','manager'],['盘点执行人','executor'],['财务监督人','financialSupervisor'],['内审监督人','auditSupervisor'],['资产总量','assetCount'],['已盘数量','countedCount'],['未盘数量','uncountedCount'],['盘点比例','ratio']].map(([title,dataIndex])=>({title,dataIndex,render:(value)=>value ?? '-'}))
    ]}/></Card>
    <Card size="small" title={<SectionCardTitle>查询</SectionCardTitle>}>
      <Typography.Text>当前计划：{plan?.planName || '-'}</Typography.Text>
      <QueryBar onQuery={()=>setFilters({...draft})} onReset={()=>{setDraft(EMPTY);setFilters(EMPTY);}}>{FIELDS.map(([label,key])=><QueryItem label={label} key={key}>{queryControl(key)}</QueryItem>)}</QueryBar>
      <Table size="small" bordered rowKey="key" scroll={{x:'max-content'}} dataSource={matches} columns={FIELDS.map(([title,dataIndex])=>({title,dataIndex,render:(value,row)=>dataIndex==='category' ? formatAssetCategory(row) || '-' : value || '-'}))} pagination={{pageSize:10,showTotal:total=>`共 ${total} 条`}}/>
    </Card>
    <Card size="small" title={<SectionCardTitle>审批信息</SectionCardTitle>}><Table size="small" bordered pagination={false} rowKey="key" dataSource={submission.records} columns={[['审批环节','node'],['审批人','person'],['代理人','proxy'],['审批状态','status'],['审批时间','time'],['审批意见','opinion']].map(([title,dataIndex])=>({title,dataIndex,render:value=>value || '-'}))}/></Card>
    <div className="flex justify-center"><Button onClick={onBack}>返回</Button></div>
  </Space></div>;
}
