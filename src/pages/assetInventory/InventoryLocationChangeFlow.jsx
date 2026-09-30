import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import {
  approveInventoryLocationChangeRequest,
  getInventoryLocationChangeRequest,
  getInventoryLocationChangeRequests,
  getInventoryLocationChanges,
  submitInventoryLocationChangeRequest,
} from './inventoryLocationChangeStore';

const FIELD_NAMES = { city: '城市', building: '建筑物', floor: '楼层/机房' };
const fields = Object.keys(FIELD_NAMES);
const APPROVER = '206984-何文';
const DEMO_OPERATORS = [
  { label: 'ES-孙志强', value: '213852-孙志强' },
  { label: '财务-冯丽婷', value: '冯丽婷' },
  { label: 'ES主管-何文', value: APPROVER },
];
const distinctOptions = (values) => [...new Set(values.filter(Boolean))].map((value) => ({ label: value, value }));

export default function InventoryLocationChangeFlow({ project, currentOperator, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [changes, setChanges] = useState(() => getInventoryLocationChanges(project.projectNo));
  const [requests, setRequests] = useState(() => getInventoryLocationChangeRequests(project.projectNo));
  const [drafts, setDrafts] = useState(() => Object.fromEntries(getInventoryLocationChanges(project.projectNo).map((change) => [change.id, { ...change.after }])));
  const [reason, setReason] = useState('');
  const [demoOperator, setDemoOperator] = useState(currentOperator || '');
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [opinion, setOpinion] = useState('');
  const ledgerRows = useMemo(() => getAssetMaintenanceRows(), []);
  const pending = changes.filter((change) => change.status === '待发起');
  const request = activeRequestId ? getInventoryLocationChangeRequest(activeRequestId) : null;
  const requestChanges = changes.filter((change) => request?.changeIds.includes(change.id));

  const setField = (id, field, value) => setDrafts((current) => {
    const existing = current[id] || {};
    if (field === 'city') return { ...current, [id]: { city: value, building: '', floor: '' } };
    if (field === 'building') return { ...current, [id]: { ...existing, building: value, floor: '' } };
    return { ...current, [id]: { ...existing, floor: value } };
  });

  const optionsFor = (field, draft) => distinctOptions(ledgerRows
    .filter((row) => field === 'city' || row.city === draft.city)
    .filter((row) => field !== 'floor' || row.building === draft.building)
    .map((row) => row[field]));

  const refresh = () => {
    setChanges(getInventoryLocationChanges(project.projectNo));
    setRequests(getInventoryLocationChangeRequests(project.projectNo));
  };

  const submit = () => {
    try {
      if (!reason.trim()) throw new Error('请填写变更原因');
      const next = submitInventoryLocationChangeRequest({
        projectNo: project.projectNo,
        projectType: project.projectType,
        reason,
        applicant: demoOperator,
        draftLocations: drafts,
      });
      refresh();
      setActiveRequestId(next.id);
      messageApi.success('位置变更申请已发起，等待何文审批');
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const decide = (decision) => {
    try {
      if (demoOperator !== APPROVER) throw new Error('请将演示操作人切换为何文后审批');
      approveInventoryLocationChangeRequest(activeRequestId, { approver: demoOperator, decision, opinion });
      refresh();
      messageApi.success(decision === '同意' ? '审批已通过，资产台账和操作历史已更新' : '位置变更申请已驳回');
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 170 },
    { title: '序列号', dataIndex: 'serialNumber', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 210 },
    { title: '盘点人', dataIndex: 'operator', width: 150 },
    ...fields.map((field) => ({
      title: FIELD_NAMES[field],
      key: field,
      width: 170,
      render: (_, change) => {
        const target = drafts[change.id] || change.after;
        return activeRequestId || change.status !== '待发起'
          ? <div><Typography.Text delete type="secondary">{change.before[field]}</Typography.Text><br /><Typography.Text mark>{change.after[field]}</Typography.Text></div>
          : <div><Typography.Text type="secondary">原：{change.before[field]}</Typography.Text><Select className="w-full mt-1" value={target[field] || undefined} placeholder={`请选择${FIELD_NAMES[field]}`} options={optionsFor(field, target)} onChange={(value) => setField(change.id, field, value)} /></div>;
      },
    })),
    { title: '状态', dataIndex: 'status', width: 110 },
  ];

  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}
    <Typography.Title level={4} style={{ margin: 0 }}>位置变更</Typography.Title>
    <Card size="small" title="演示操作人">
      <Select className="w-full" value={demoOperator || undefined} placeholder="请选择演示操作人" options={DEMO_OPERATORS} onChange={setDemoOperator} />
    </Card>
    <Card size="small" title="申请信息">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>盘点项目：{project.projectNo}</div>
        <div>项目类型：{project.projectType}</div>
        <div>变更类型：位置变更</div>
        <div>申请时间：{request?.appliedAt || '-'}</div>
        <div>申请部门：-</div>
      </div>
      {request ? <><div>申请人：{request.applicant}</div><div className="mt-2">变更原因：{request.reason}</div><div className="mt-2">审批人：{request.approver}</div><div className="mt-2">审批状态：{request.status}</div><div className="mt-2">审批意见：{request.opinion || '-'}</div><div className="mt-2">审批时间：{request.approvedAt || '-'}</div></>
        : <><div>申请人：{demoOperator || '-'}</div><Typography.Text>变更原因 *</Typography.Text><Input.TextArea rows={3} maxLength={500} showCount value={reason} onChange={(event) => setReason(event.target.value)} /></>}
    </Card>
    <Card size="small" title="资产明细" extra={`共 ${request ? requestChanges.length : pending.length} 条`}>
      <Table rowKey="id" size="small" bordered pagination={false} scroll={{ x: 'max-content' }} columns={columns} dataSource={request ? requestChanges : pending} />
    </Card>
    {!request && Boolean(pending.length) && <Button type="primary" onClick={submit}>发起位置变更</Button>}
    {request?.status === '待审批' && demoOperator === APPROVER && <Card size="small" title="何文审批">
      <Input.TextArea rows={3} placeholder="请输入审批意见；驳回时必填" value={opinion} onChange={(event) => setOpinion(event.target.value)} />
      <Space className="mt-3"><Button type="primary" onClick={() => decide('同意')}>同意</Button><Button danger onClick={() => decide('驳回')}>驳回</Button></Space>
    </Card>}
    {!request && Boolean(requests.length) && <Card size="small" title="位置变更申请记录">
      <Table rowKey="id" size="small" pagination={false} dataSource={requests} columns={[
        { title: '申请单号', dataIndex: 'id' }, { title: '申请时间', dataIndex: 'appliedAt' }, { title: '状态', dataIndex: 'status' },
        { title: '操作', render: (_, row) => <Button type="link" onClick={() => setActiveRequestId(row.id)}>查看</Button> },
      ]} />
    </Card>}
    <Button onClick={() => activeRequestId ? setActiveRequestId(null) : onBack()}>{activeRequestId ? '返回申请列表' : '返回盘点计划'}</Button>
  </Space>;
}
