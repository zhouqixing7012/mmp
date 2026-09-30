import React, { useMemo, useState } from 'react';
import { Button, Input, Space, Table, Typography, message as antdMessage } from 'antd';
import { Search } from 'lucide-react';
import dayjs from 'dayjs';
import SelectModal from '../../components/SelectModal';
import SectionCardTitle from './SectionCardTitle';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { getInventoryLocationOptions } from './inventoryMobileLocationService';
import { approveInventoryLocationChangeRequest, getInventoryLocationApplicant, getInventoryLocationChangeRequest, getInventoryLocationChanges, submitInventoryLocationChangeRequest } from './inventoryLocationChangeStore';
import './inventoryLocationChange.css';

const FIELD_NAMES = { city: '城市', building: '建筑物', floor: '楼层/机房' };
const fields = Object.keys(FIELD_NAMES);
const APPROVER = '206984-何文';

function LocationDiff({ before, after }) {
  if (before === after) return <span>{after || '-'}</span>;
  return <div className="inventory-location-diff"><span className="inventory-location-old">{before || '-'}</span><span className="inventory-location-new">{after || '-'}</span></div>;
}

export default function InventoryLocationChangeFlow({ project, currentOperator, initialRequestId = null, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [changes, setChanges] = useState(() => getInventoryLocationChanges(project.projectNo));
  const [drafts, setDrafts] = useState(() => Object.fromEntries(getInventoryLocationChanges(project.projectNo).map(change => [change.id, {...change.after}])));
  const [remarks, setRemarks] = useState(() => Object.fromEntries(getInventoryLocationChanges(project.projectNo).map(change => [change.id, change.remark || ''])));
  const [reason, setReason] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(initialRequestId);
  const [opinion, setOpinion] = useState('');
  const [picker, setPicker] = useState(null);
  const [entryTime] = useState(() => dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const [applicant] = useState(() => getInventoryLocationApplicant(currentOperator));
  const ledger = useMemo(() => new Map(getAssetMaintenanceRows().map(row => [row.tag, row])), []);
  const pending = changes.filter(change => change.status === '待发起');
  const request = activeRequestId ? getInventoryLocationChangeRequest(activeRequestId) : null;
  const displayed = request ? changes.filter(change => request.changeIds.includes(change.id)) : pending;
  const rows = displayed.map(change => ({...change, quantity:change.quantity ?? ledger.get(change.assetTag)?.quantity, remark:change.remark ?? ledger.get(change.assetTag)?.remarks ?? ''}));
  const readOnly = Boolean(request);

  const setField = (id, field, value) => setDrafts(current => {
    const existing = current[id] || {};
    if (field === 'city') return {...current, [id]:{city:value, building:'', floor:''}};
    if (field === 'building') return {...current, [id]:{...existing, building:value, floor:''}};
    return {...current, [id]:{...existing, floor:value}};
  });
  const openPicker = (change, field) => {
    const target = drafts[change.id] || change.after;
    if (field !== 'city' && !target.city) { messageApi.warning('请先选择城市'); return; }
    if (field === 'floor' && !target.building) { messageApi.warning('请先选择建筑物'); return; }
    setPicker({id:change.id, field});
  };
  const pickerOptions = picker ? getInventoryLocationOptions(drafts[picker.id] || {})[picker.field] : [];

  const submit = () => {
    try {
      const next = submitInventoryLocationChangeRequest({projectNo:project.projectNo, projectType:project.projectType, reason, applicant:applicant.value, applicantDepartment:applicant.department, draftLocations:drafts, draftRemarks:remarks});
      setChanges(getInventoryLocationChanges(project.projectNo));
      setActiveRequestId(next.id);
      messageApi.success('已提交，等待ES主管何文审批');
    } catch (error) { messageApi.error(error.message); }
  };
  const decide = decision => {
    try {
      approveInventoryLocationChangeRequest(activeRequestId, {approver:currentOperator, decision, opinion});
      setChanges(getInventoryLocationChanges(project.projectNo));
      messageApi.success(decision === '同意' ? '审批已通过，资产台账和位置变更事务已更新' : '位置变更申请已驳回');
    } catch (error) { messageApi.error(error.message); }
  };
  const columns = [
    {title:'资产标签号', dataIndex:'assetTag', width:170},
    {title:'序列号', dataIndex:'serialNumber', width:155},
    {title:'资产说明', dataIndex:'assetDesc', width:215},
    {title:'数量', dataIndex:'quantity', width:65, align:'right', render:value => value ?? '-'},
    ...fields.map(field => ({title:<span>{!readOnly && <span className="inventory-location-required">*</span>}{FIELD_NAMES[field]}</span>, key:field, width:170, render:(_, change) => readOnly
      ? <LocationDiff before={change.before[field]} after={change.after[field]}/>
      : <Input readOnly aria-label={`${change.assetTag}-${FIELD_NAMES[field]}`} value={(drafts[change.id] || change.after)[field]} placeholder={`请选择${FIELD_NAMES[field]}`} suffix={<Search size={15}/>} onClick={() => openPicker(change, field)}/>})),
    {title:'备注', dataIndex:'remark', width:175, render:(value, change) => readOnly ? value || '-' : <Input aria-label={`${change.assetTag}-备注`} value={remarks[change.id] ?? value} maxLength={150} onChange={event => setRemarks(current => ({...current, [change.id]:event.target.value}))}/>},
  ];
  const approvalRecords = request ? [
    {key:'start', node:'提交申请', person:request.applicant, status:'已提交', time:request.appliedAt, opinion:request.reason},
    {key:'review', node:'ES主管审批', person:request.approver, status:request.status === '待审批' ? '待审批' : request.status === '已通过' ? '已通过' : '已驳回', time:request.approvedAt, opinion:request.opinion},
  ] : [];

  return <div className="inventory-location-flow">
    {contextHolder}
    <Typography.Title level={4} style={{margin:'0 0 24px'}}>位置变更{request ? '审批' : ''}</Typography.Title>
    <section className="inventory-location-section">
      <SectionCardTitle>申请信息</SectionCardTitle>
      <div className="inventory-location-info">
        <div><span>申请人：</span><strong>{request ? getInventoryLocationApplicant(request.applicant).displayName : applicant.displayName}</strong></div>
        <div><span>申请部门：</span><strong>{request ? request.applicantDepartment || '-' : applicant.department || '-'}</strong></div>
        <div><span>申请时间：</span><strong>{request?.appliedAt || entryTime}</strong></div>
        <div className="inventory-location-type"><span>变更类型：</span><strong>位置变更</strong></div>
        <div className="inventory-location-reason"><label htmlFor="inventory-location-reason"><span className="inventory-location-required">*</span>变更理由：</label>{request ? <span>{request.reason}</span> : <Input.TextArea id="inventory-location-reason" rows={3} maxLength={500} showCount value={reason} onChange={event => setReason(event.target.value)}/>}</div>
      </div>
    </section>
    <section className="inventory-location-section">
      <div className="inventory-location-section-heading"><SectionCardTitle>资产明细</SectionCardTitle><span>共计资产 <strong>{rows.length}</strong> 项，总计明细 <strong>{rows.length}</strong> 条</span></div>
      <Table className="inventory-location-assets" rowKey="id" size="middle" pagination={false} scroll={{x:1385}} columns={columns} dataSource={rows}/>
    </section>
    {request && <section className="inventory-location-section"><SectionCardTitle>审批信息</SectionCardTitle><Table rowKey="key" size="small" pagination={false} dataSource={approvalRecords} columns={[
      {title:'审批环节',dataIndex:'node'},{title:'审批人',dataIndex:'person'},{title:'审批状态',dataIndex:'status'},{title:'审批时间',dataIndex:'time',render:value=>value || '-'},{title:'审批意见',dataIndex:'opinion',render:value=>value || '-'},
    ]}/></section>}
    {request?.status === '待审批' && currentOperator === APPROVER && <section className="inventory-location-section"><SectionCardTitle>审批意见</SectionCardTitle><Input.TextArea aria-label="审批意见" rows={3} placeholder="请输入审批意见，驳回时必填" value={opinion} onChange={event => setOpinion(event.target.value)}/></section>}
    <div className="inventory-location-actions"><Space size={16}>
      {!request && <Button type="primary" disabled={!pending.length} onClick={submit}>提交</Button>}
      {request?.status === '待审批' && currentOperator === APPROVER && <><Button type="primary" onClick={()=>decide('同意')}>同意</Button><Button danger onClick={()=>decide('驳回')}>驳回</Button></>}
      <Button onClick={onBack}>返回</Button>
    </Space></div>
    <SelectModal open={Boolean(picker)} title={`选择${FIELD_NAMES[picker?.field] || '地点'}`} onCancel={()=>setPicker(null)} onSelect={row=>setField(picker.id,picker.field,row.name)} searchFields={[{name:'name',label:FIELD_NAMES[picker?.field] || '地点',dataIndex:'name'}]} columns={[{title:FIELD_NAMES[picker?.field] || '地点',dataIndex:'name'}]} dataSource={pickerOptions.map(value=>({id:value,name:value}))}/>
  </div>;
}
