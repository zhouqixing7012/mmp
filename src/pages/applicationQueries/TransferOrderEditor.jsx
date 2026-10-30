import React, { useEffect, useState } from 'react';
import { App, Button, Card, Input, Popconfirm, Space } from 'antd';
import Table from '../../components/tableAlignment/AlignedTable';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';
import { renderApplicationStatus } from './ApplicationStatus';
import SelectModal from '../../components/SelectModal';
import TransferLookup, { transferChoices } from './TransferLookup';
import TransferDetailDialog from './TransferDetailDialog';
import { applicationTransferService as service } from '../../services/applicationTransferService';

export default function TransferOrderEditor({ initial, readOnly, references, onBack, onChanged }) {
  const { message, modal } = App.useApp();
  const [order, setOrder] = useState(initial);
  const [selectAsset, setSelectAsset] = useState('');
  const [detail, setDetail] = useState(null);
  const person = id => { const row = references.people.find(item => item.id === id); return row ? row.id + '.' + row.name : id; };
  const guard = action => { try { return action(); } catch (error) { message.error(error.message); return null; } };
  const persist = () => guard(() => { const saved = service.save(order); setOrder(saved); onChanged(); message.success('保存成功'); return saved; });
  const execute = () => modal.confirm({ title: '确认执行转移？', content: '执行后更新资产的责任人、地点和财务信息。', okText: '确定', cancelText: '取消', onOk: () => { const saved = persist(); if (saved) guard(() => { setOrder(service.execute(saved.id)); onChanged(); message.success('转移完成'); }); } });
  const edit = !readOnly && order.status === '草稿';
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: [
      { label: '首页' }, { label: '申请' }, { label: '转移单', onClick: onBack },
      { label: edit ? (order.id ? '编辑转移单' : '创建转移单') : '转移单详情' },
    ] } }));
    return () => window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: null } }));
  }, [edit, order.id, onBack]);
  const removeDetail = row => guard(() => {
    if (order.id && service.get(order.id).details.some(item => item.id === row.id)) {
      const saved = service.removeDetail(order.id, row.id);
      setOrder({ ...order, revision: saved.revision, details: order.details.filter(item => item.id !== row.id) }); onChanged();
    } else setOrder({ ...order, details: order.details.filter(item => item.id !== row.id) });
  });
  const columns = [
    { title: '行号', width: 65, render: (_, row, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'tag', width: 155 },
    { title: '物资说明', width: 230, render: (_, row) => row.material.materialDescription },
    { title: '物资总类', width: 110, render: (_, row) => row.material.materialType },
    { title: edit ? '物资大类.小类' : '物资大类-小类', width: 250, render: (_, row) => [row.material.majorCategory, row.material.minorCategory].join(edit ? '.' : '-') },
    { title: '转移数量', dataIndex: 'quantity', width: 100, render: value => Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 }) },
    { title: '转出人', width: 160, render: (_, row) => person(row.original.owner) },
    { title: '转出成本中心', width: 220, render: (_, row) => row.original.costCenter },
    { title: '转入人', dataIndex: 'recipient', width: 160, render: person },
    ...[['costCenter', '转入成本中心', 220], ['city', '转入城市', 180], ['building', '转入建筑物', 220]].map(([dataIndex, title, width]) => ({ title, dataIndex, width })),
    { title: '操作', fixed: 'right', width: edit ? 135 : 85, render: (_, row) => <Space><Button type="link" onClick={() => setDetail(row)}>{edit ? '编辑' : '查看'}</Button>{edit && <Popconfirm title="删除本条明细并解除资产锁？" onConfirm={() => removeDetail(row)} okText="确定" cancelText="取消"><Button type="link" danger>删除</Button></Popconfirm>}</Space> },
  ];
  return <div className="space-y-4">
    <Card title={edit ? '转移单填写' : '转移单详情'} size="small" extra={order.number}>
      <DetailGrid>
        <DetailItem label="单据类型">转移单</DetailItem>
        <DetailItem label="单据状态">{renderApplicationStatus(order.status)}</DetailItem>
        <DetailItem label="*公司"><TransferLookup title="公司" options={transferChoices(references.warehouses.filter(row => row.status === '启用').map(row => row.company))} value={order.company} onChange={company => setOrder({ ...order, company })} disabled={!edit} /></DetailItem>
        <DetailItem label="制单人">{person(order.creator)}</DetailItem>
        <DetailItem label="制单时间">{order.createdAt.slice(0, 10)}</DetailItem>
        <DetailItem label="申请单号">{order.applicationNo}</DetailItem>
        <DetailItem label="备注" span={3}>{edit ? <Input.TextArea value={order.remarks} onChange={event => setOrder({ ...order, remarks: event.target.value })} /> : order.remarks}</DetailItem>
      </DetailGrid>
    </Card>
    <Card size="small" title="转移明细" extra={edit && <Space>{[['asset', '添加资产'], ['material', '添加物资']].map(([kind, label]) => <Button key={kind} onClick={() => { if (!order.company) { message.error('请先选择公司'); return; } setSelectAsset(kind); }}>{label}</Button>)}</Space>}>
      <Table size="small" bordered rowKey="id" columns={columns} dataSource={order.details} scroll={{ x: 'max-content' }} pagination={false} />
    </Card>
    <div className="flex justify-center gap-2"><Button onClick={onBack}>返回</Button>{edit && <><Button onClick={persist}>保存</Button><Button type="primary" onClick={execute}>执行转移</Button></>}</div>
    <SelectModal open={Boolean(selectAsset)} title="选择资产" onCancel={() => setSelectAsset('')} onSelect={row => {
      if (order.details.some(item => item.assetId === row.id)) { message.error('同一资产标签号不可重复'); return; }
      setDetail({ ...service.newDetail(row.id), kind: selectAsset });
    }} dataSource={service.assets(order.company, order.id)} columns={[
      { title: '资产标签号', dataIndex: 'tag', width: 150 }, { title: 'SN号', dataIndex: 'serial', width: 180 },
      { title: '物资说明', width: 240, render: (_, row) => row.material.materialDescription }, { title: '公司', dataIndex: 'company', width: 160 }, { title: '资产状态', dataIndex: 'status', width: 140 },
    ]} searchFields={[{ name: 'tag', label: '资产标签号', dataIndex: 'tag' }, { name: 'serial', label: 'SN号', dataIndex: 'serial' }]} width={960} />
    {detail && <TransferDetailDialog key={detail.id} value={detail} references={references} readOnly={!edit} onCancel={() => setDetail(null)} onSave={saved => { setOrder({ ...order, details: order.details.some(row => row.id === saved.id) ? order.details.map(row => row.id === saved.id ? saved : row) : [...order.details, saved] }); setDetail(null); }} />}
  </div>;
}
