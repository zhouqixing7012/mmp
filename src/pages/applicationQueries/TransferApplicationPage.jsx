import React, { useState } from 'react';
import ApplicationQueryPage from './ApplicationQueryPage';
import { App, Button, Card, DatePicker, Input, Popconfirm, Select, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import TransferLookup, { transferChoices } from './TransferLookup';
import TransferOrderEditor from './TransferOrderEditor';
import { applicationTransferService as service } from '../../services/applicationTransferService';

export function ExecutionTransferPage() {
  const { message } = App.useApp();
  const [references] = useState(() => service.references());
  const [draft, setDraft] = useState({});
  const [filters, setFilters] = useState({});
  const [revision, refresh] = useState(0);
  const [selected, setSelected] = useState([]);
  const [editor, setEditor] = useState(null);
  const [page, setPage] = useState({ current: 1, pageSize: 10 });
  const rows = service.list(filters);
  const patch = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const open = (row, readOnly) => setEditor({ order: service.get(row.id), readOnly });
  const lookup = (key, label, options) => <QueryItem key={key} label={label}><TransferLookup title={label} value={draft[key]} options={options} onChange={value => patch(key, value)} /></QueryItem>;
  if (editor) return <TransferOrderEditor key={editor.order.id || 'new'} initial={editor.order} readOnly={editor.readOnly} references={references} onChanged={() => refresh(revision + 1)} onBack={() => { setEditor(null); refresh(revision + 1); }} />;
  const columns = [
    { title: '行号', width: 65, render: (_, row, index) => (page.current - 1) * page.pageSize + index + 1 },
    { title: '转移单号', dataIndex: 'number', width: 200, render: (value, row) => <Button type="link" onClick={() => open(row, true)}>{value}</Button> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 200 },
    { title: '单据状态', dataIndex: 'status', width: 100, render: value => <StatusTag status={value} /> },
    { title: '公司', dataIndex: 'company', width: 180 },
    { title: '制单日期', dataIndex: 'createdAt', width: 120, render: value => value.slice(0, 10) },
    { title: '制单人', dataIndex: 'creator', width: 130, render: value => references.people.find(row => row.id === value)?.name || value },
    { title: '物资数量', dataIndex: 'totalQuantity', width: 110, render: value => value.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
    { title: '操作', fixed: 'right', width: 85, render: (_, row) => <Button type="link" onClick={() => open(row, row.status !== '草稿')}>{row.status === '草稿' ? '编辑' : '查看'}</Button> },
  ];
  return <div className="space-y-4">
    <Typography.Title level={4} className="!mb-0">转移单</Typography.Title>
    <QueryBar onQuery={() => { setFilters({ ...draft }); setPage({ ...page, current: 1 }); }} onReset={() => { setDraft({}); setFilters({}); setPage({ ...page, current: 1 }); }}>
      <QueryItem label="转移单号"><Input allowClear value={draft.number} onChange={event => patch('number', event.target.value)} /></QueryItem>
      <QueryItem label="转移原因"><Input allowClear value={draft.remarks} onChange={event => patch('remarks', event.target.value)} /></QueryItem>
      <QueryItem label="单据状态"><Select allowClear style={{ width: '100%' }} value={draft.status} onChange={value => patch('status', value)} options={['草稿', '已完成'].map(value => ({ label: value, value }))} /></QueryItem>
      {lookup('company', '公司', transferChoices(references.warehouses.filter(row => row.status === '启用').map(row => row.company)))}
      {lookup('sourceDepartment', '转出部门', transferChoices(references.people.map(row => row.department)))}
      {lookup('sourceBuilding', '转出地点', transferChoices(references.warehouses.filter(row => row.status === '启用').map(row => row.building)))}
      {lookup('plate', '板块', transferChoices(references.people.map(row => row.plate)))}
      {lookup('targetDepartment', '转入部门', transferChoices(references.people.map(row => row.department)))}
      {lookup('targetBuilding', '转入地点', transferChoices(references.warehouses.filter(row => row.status === '启用').map(row => row.building)))}
      {lookup('creator', '制单人', references.people.map(row => ({ id: row.id, label: row.id + '.' + row.name })))}
      <QueryItem label="制单日期"><DatePicker.RangePicker allowEmpty={[true, true]} value={draft.dateRange?.map(value => value ? dayjs(value) : null)} onChange={dates => patch('dateRange', dates?.map(value => value ? value.format('YYYY-MM-DD') : ''))} /></QueryItem>
    </QueryBar>
    <Card size="small" title="转移单" extra={<Space><Button type="primary" onClick={() => setEditor({ order: service.create(), readOnly: false })}>创建</Button><Popconfirm title="确认删除所选转移单？" onConfirm={() => { try { service.remove(selected); setSelected([]); refresh(revision + 1); message.success('删除成功'); } catch (error) { message.error(error.message); } }} okText="确定" cancelText="取消"><Button disabled={!selected.length} danger>批量删除</Button></Popconfirm></Space>}>
      <Table bordered size="small" rowKey="id" dataSource={rows} columns={columns} rowSelection={{ selectedRowKeys: selected, onChange: setSelected }} scroll={{ x: 'max-content' }} pagination={{ ...page, showSizeChanger: true, showTotal: total => '共 ' + total + ' 条' }} onChange={next => setPage({ current: next.current, pageSize: next.pageSize })} />
    </Card>
  </div>;
}

export default function TransferApplicationPage() { return <ApplicationQueryPage id="transfer" />; }
