import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Input, Modal, Space, Table, Typography, Upload, message as antdMessage } from 'antd';
import * as XLSX from 'xlsx';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { buildLocationDraft, LOCATION_IMPORT_HEADERS, parseLocationImport, validateLocation } from './inventoryLocationEdit';
import { Search } from 'lucide-react';
import dayjs from 'dayjs';
import SelectModal from '../../components/SelectModal';
import SectionCardTitle from './SectionCardTitle';
import StatusTag from '../../components/StatusTag';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { getInventoryLocationOptions } from './inventoryMobileLocationService';
import { approveInventoryLocationChangeRequest, getInventoryLocationApplicant, getInventoryLocationChangeRequest, getInventoryLocationChanges, submitInventoryLocationChangeRequest } from './inventoryLocationChangeStore';
import './inventoryLocationChange.css';
import { inventoryLocationPhotoBlockReason } from './inventoryLocationPhotoRules';

const FIELD_NAMES = { city: '城市', building: '建筑物', floor: '楼层/机房' };
const fields = Object.keys(FIELD_NAMES);
const APPROVER = '206984-何文';

function LocationDiff({ before, after }) {
  if (before === after) return <span>{after || '-'}</span>;
  return <div className="inventory-location-diff"><span className="inventory-location-old">{before || '-'}</span><span className="inventory-location-new">{after || '-'}</span></div>;
}

export default function InventoryLocationChangeFlow({ project, currentOperator, initialRequestId = null, projectAssets = [], onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [changes, setChanges] = useState(() => getInventoryLocationChanges(project.projectNo));
  const [drafts, setDrafts] = useState(() => Object.fromEntries(getInventoryLocationChanges(project.projectNo).map(change => [change.id, {...change.after}])));
  const [remarks, setRemarks] = useState(() => Object.fromEntries(getInventoryLocationChanges(project.projectNo).map(change => [change.id, change.remark || ''])));
  const [reason, setReason] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(initialRequestId);
  const [opinion, setOpinion] = useState('');
  const [picker, setPicker] = useState(null);
  const [addedAssets, setAddedAssets] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchLocation, setBatchLocation] = useState({city:'',building:'',floor:''});
  const [entryTime] = useState(() => dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const [applicant] = useState(() => getInventoryLocationApplicant(currentOperator));
  const ledger = useMemo(() => new Map(getAssetMaintenanceRows().map(row => [row.tag, row])), []);
  const waiting = changes.filter(change => change.status === '待发起');
  const held = waiting.filter(change => inventoryLocationPhotoBlockReason(project.projectNo, change.assetTag, projectAssets));
  const pending = [...waiting.filter(change => !inventoryLocationPhotoBlockReason(project.projectNo, change.assetTag, projectAssets)), ...addedAssets];
  const permittedTags = [...new Set(projectAssets.map(asset => String(asset.assetTag || asset.tag || '')).filter(Boolean))];
  const availableAssets = [...ledger.values()].filter(asset => permittedTags.includes(asset.tag));
  const blockedTags = changes.filter(change => ['待发起','待审批'].includes(change.status)).map(change => change.assetTag).concat(addedAssets.map(change => change.assetTag));
  const request = activeRequestId ? getInventoryLocationChangeRequest(activeRequestId) : null;
  const displayed = request ? changes.filter(change => request.changeIds.includes(change.id)) : pending;
  const rows = displayed.map(change => ({...change, quantity:change.quantity ?? ledger.get(change.assetTag)?.quantity, remark:change.remark ?? ledger.get(change.assetTag)?.remarks ?? ''}));
  const projectClosed = project.status === '盘点关闭';
  const readOnly = Boolean(request) || projectClosed;

  const setField = (id, field, value) => setDrafts(current => {
    const existing = current[id] || {};
    if (field === 'city') return {...current, [id]:{city:value, building:'', floor:''}};
    if (field === 'building') return {...current, [id]:{...existing, building:value, floor:''}};
    return {...current, [id]:{...existing, floor:value}};
  });
  const openPicker = (change, field) => {
    const target = change.id === 'batch' ? batchLocation : drafts[change.id] || change.after;
    if (field !== 'city' && !target.city) { messageApi.warning('请先选择城市'); return; }
    if (field === 'floor' && !target.building) { messageApi.warning('请先选择建筑物'); return; }
    setPicker({id:change.id, field});
  };
  const pickerOptions = picker ? getInventoryLocationOptions(picker.id === 'batch' ? batchLocation : drafts[picker.id] || rows.find(row => row.id === picker.id)?.after || {})[picker.field] : [];
  const addAssets = assets => { setAddedAssets(current => [...current,...assets]); setDrafts(current => ({...current,...Object.fromEntries(assets.map(asset=>[asset.id,{...asset.after}]))})); setRemarks(current => ({...current,...Object.fromEntries(assets.map(asset=>[asset.id,asset.remark || '']))})); };
  const importFile = async file => {
    setImporting(true);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('单个附件不得超过20MB');
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请上传xlsx、xls或csv文件');
      const workbook = XLSX.read(await file.arrayBuffer(), {type:'array'});
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header:1,defval:'',raw:false});
      const imported = parseLocationImport(matrix, availableAssets, blockedTags, getInventoryLocationOptions);
      addAssets(imported); messageApi.success('已导入' + imported.length + '条资产');
    } catch(error) { messageApi.error(error.message); } finally { setImporting(false); }
    return false;
  };
  const applyBatch = () => { try { validateLocation(batchLocation,getInventoryLocationOptions); setDrafts(current=>({...current,...Object.fromEntries(selectedKeys.map(id=>[id,{...batchLocation}]))})); setBatchOpen(false); messageApi.success('已更新所选资产的位置'); } catch(error) {messageApi.error(error.message);} };
  const downloadTemplate = () => { const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([LOCATION_IMPORT_HEADERS]),'位置变更'); XLSX.writeFile(book,'位置变更导入模板.xlsx'); };

  const submit = () => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
    try {
      const next = submitInventoryLocationChangeRequest({projectNo:project.projectNo, projectType:project.projectType, reason, applicant:applicant.value, applicantDepartment:applicant.department, draftLocations:drafts, draftRemarks:remarks, addedAssets, permittedAssetTags:permittedTags, projectAssets});
      setChanges(getInventoryLocationChanges(project.projectNo));
      setAddedAssets([]); setSelectedKeys([]);
      setActiveRequestId(next.id);
      messageApi.success('已提交，等待ES主管何文审批');
    } catch (error) { messageApi.error(error.message); }
  };
  const decide = decision => {
    if (projectClosed) { messageApi.warning('项目已关闭，内容只读'); return; }
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
      ? request ? <LocationDiff before={change.before[field]} after={change.after[field]}/> : <span>{(drafts[change.id] || change.after)[field] || '-'}</span>
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
    <Card size="small" title={<SectionCardTitle>申请信息</SectionCardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="申请人">{request ? getInventoryLocationApplicant(request.applicant).displayName : applicant.displayName}</DetailItem>
        <DetailItem label="申请部门">{request ? request.applicantDepartment || '-' : applicant.department || '-'}</DetailItem>
        <DetailItem label="申请时间">{request?.appliedAt || entryTime}</DetailItem>
        <DetailItem label="变更类型" span={3}>位置变更</DetailItem>
        <DetailItem label={<label htmlFor="inventory-location-reason"><span className="inventory-location-required">*</span>变更理由</label>} span={3}>{readOnly ? request?.reason || '-' : <Input.TextArea id="inventory-location-reason" rows={3} maxLength={500} showCount value={reason} onChange={event => setReason(event.target.value)}/>}</DetailItem>
      </DetailGrid>
    </Card>
    <Card size="small" title={<SectionCardTitle>资产明细</SectionCardTitle>} extra={<Typography.Text type="secondary">共计资产 {rows.length} 项，总计明细 {rows.length} 条</Typography.Text>}>
      {!readOnly && held.length > 0 && <Alert className="mb-3" type="info" showIcon message={held.map(change => inventoryLocationPhotoBlockReason(project.projectNo, change.assetTag, projectAssets)).join("；")} />}
      {!readOnly && <Space className="mb-3" wrap>
        <Button disabled={importing || !availableAssets.some(asset => !blockedTags.includes(asset.tag))} onClick={()=>setAssetPickerOpen(true)}>添加资产</Button>
        <Upload accept=".xlsx,.xls,.csv" showUploadList={false} multiple={false} disabled={importing} beforeUpload={importFile}><Button loading={importing}>批量导入</Button></Upload>
        <Button onClick={downloadTemplate}>下载模板</Button>
        <Button disabled={importing || !selectedKeys.length} onClick={()=>{setBatchLocation({city:'',building:'',floor:''});setBatchOpen(true);}}>批量编辑位置信息</Button>
      </Space>}
      <Table rowKey="id" size="small" bordered pagination={false} scroll={{x:'max-content'}} columns={columns} dataSource={rows} rowSelection={readOnly ? undefined : {selectedRowKeys:selectedKeys,onChange:setSelectedKeys}}/>
    </Card>
    {request && <Card size="small" title={<SectionCardTitle>审批信息</SectionCardTitle>}><Table rowKey="key" size="small" bordered pagination={false} dataSource={approvalRecords} columns={[
      {title:'审批环节',dataIndex:'node'},{title:'审批人',dataIndex:'person'},{title:'审批状态',dataIndex:'status',render:value=><StatusTag value={value}/>} ,{title:'审批时间',dataIndex:'time',render:value=>value || '-'},{title:'审批意见',dataIndex:'opinion',render:value=>value || '-'},
    ]}/></Card>}
    {!projectClosed && request?.status === '待审批' && currentOperator === APPROVER && <Card size="small" title={<SectionCardTitle>审批意见</SectionCardTitle>}><Input.TextArea aria-label="审批意见" rows={3} placeholder="请输入审批意见，驳回时必填" value={opinion} onChange={event => setOpinion(event.target.value)}/></Card>}
    <div className="inventory-location-actions"><Space size={12}>
      {!readOnly && <Button type="primary" disabled={importing || !pending.length} onClick={submit}>提交</Button>}
      {!projectClosed && request?.status === '待审批' && currentOperator === APPROVER && <><Button type="primary" onClick={()=>decide('同意')}>同意</Button><Button danger onClick={()=>decide('驳回')}>驳回</Button></>}
      <Button onClick={onBack}>返回</Button>
    </Space></div>
    <SelectModal open={assetPickerOpen} title="选择资产" multiple rowKey="tag" onCancel={()=>setAssetPickerOpen(false)} onConfirm={selected=>addAssets(selected.map(buildLocationDraft))} dataSource={availableAssets.filter(asset=>!blockedTags.includes(asset.tag))} searchFields={[{name:'tag',label:'资产标签号',dataIndex:'tag'},{name:'assetDesc',label:'资产说明',dataIndex:'assetDesc'}]} columns={[{title:'资产标签号',dataIndex:'tag'},{title:'序列号',dataIndex:'serialNumber'},{title:'资产说明',dataIndex:'assetDesc'}]}/>
    <Modal open={batchOpen} title="批量编辑位置信息" onCancel={()=>setBatchOpen(false)} onOk={applyBatch} okText="确定" cancelText="取消" destroyOnHidden>
      <DetailGrid columns={3}>{fields.map(field=><DetailItem key={field} label={FIELD_NAMES[field]} span={3}><Input readOnly value={batchLocation[field]} placeholder={'请选择'+FIELD_NAMES[field]} suffix={<Search size={15}/>} onClick={()=>openPicker({id:'batch'},field)}/></DetailItem>)}</DetailGrid>
    </Modal>
    <SelectModal open={Boolean(picker)} title={`选择${FIELD_NAMES[picker?.field] || '地点'}`} onCancel={()=>setPicker(null)} onSelect={row=>{if(picker.id === 'batch')setBatchLocation(current=>picker.field === 'city' ? {city:row.name,building:'',floor:''} : picker.field === 'building' ? {...current,building:row.name,floor:''} : {...current,floor:row.name}); else setField(picker.id,picker.field,row.name);}} searchFields={[{name:'name',label:FIELD_NAMES[picker?.field] || '地点',dataIndex:'name'}]} columns={[{title:FIELD_NAMES[picker?.field] || '地点',dataIndex:'name'}]} dataSource={pickerOptions.map(value=>({id:value,name:value}))}/>
  </div>;
}
