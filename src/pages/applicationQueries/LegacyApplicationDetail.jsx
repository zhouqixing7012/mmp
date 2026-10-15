import React, { useState } from 'react';
import { Button, Card, Modal, Space, Table, Typography } from 'antd';
import StatusTag from '../../components/StatusTag';
import LegacyStorageDetail, { LegacyFields } from './LegacyStorageDetail';

const dateText = value => value ? String(value).slice(0, 10) : '';
const historyColumns = [{ title: '审批环节', dataIndex: 'node', width: 170 }, { title: '审批人', dataIndex: 'approver', width: 170 }, { title: '审批状态', dataIndex: 'status', width: 110, render: value => <StatusTag value={value} /> }, { title: '审批时间', dataIndex: 'time', width: 130, render: dateText }, { title: '审批意见', dataIndex: 'opinion' }];
const accessoryColumns = [{ title: '标签号', dataIndex: 'tag', width: 160 }, { title: '小类', key: 'minor', width: 180, render: (_, row) => row.material.minorCategory }, { title: '资产说明', key: 'description', width: 260, render: (_, row) => row.material.materialDescription }, { title: '品牌', key: 'brand', width: 130, render: (_, row) => row.material.brand }, { title: '数量', dataIndex: 'quantity', width: 90, render: value => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }, { title: '启用时间', dataIndex: 'enabledDate', width: 120, render: dateText }];
export default function LegacyApplicationDetail({ definition, record, onBack, onProgress }) {
  const [dialog, setDialog] = useState(null);
  const line = record.lines[0];
  const columns = record.kind === 'borrow' ? [...historyColumns.slice(0, 2), { title: '代理人', key: 'agent', width: 120, render: () => '' }, ...historyColumns.slice(2)] : historyColumns;
  return <Space orientation="vertical" size={16} style={{ width: '100%' }}>
    <Typography.Title level={4} style={{ margin: 0 }}>{record.extension ? '续借申请详情' : definition.title + '详情'}</Typography.Title>
    {record.kind === 'storage' ? <LegacyStorageDetail record={record} /> : <>
      <Card title="申请人信息" extra={record.values.applicationNo}><LegacyFields fields={record.head} /></Card>
      <Card title={record.extension ? '续借信息' : '资产信息'}>
        <LegacyFields fields={record.detail.map(([label, value]) => [label, record.kind === 'return' && label === '资产标签号' ? <Button key="asset-tag" type="link" onClick={() => setDialog('asset')}>{value}</Button> : value])} />
        {!record.extension && <div style={{ marginTop: 12 }}><span>部件数量：</span><Button type="link" onClick={() => setDialog('accessories')}>{line.accessories.reduce((sum, item) => sum + item.quantity, 0)}</Button></div>}
      </Card>
      {record.kind === 'return' && <>
        <Card title="附属耗材"><Table rowKey="id" columns={accessoryColumns} dataSource={line.accessories} pagination={false} scroll={{ x: 'max-content' }} /></Card>
        <Card title="相关信息"><Space><Button type="link" onClick={() => setDialog('attachments')}>附件信息</Button><Button type="link" onClick={() => setDialog('repairs')}>维修记录</Button></Space></Card>
      </>}
      <Card title="审批记录"><Table rowKey="id" columns={columns} dataSource={record.history} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    </>}
    <Space style={{ display: 'flex', justifyContent: 'center' }}><Button onClick={onBack}>返回</Button>{record.kind !== 'storage' && <Button onClick={() => onProgress(record)}>查看进度</Button>}</Space>
    <Modal open={Boolean(dialog)} title={dialog === 'accessories' ? '配件明细' : dialog === 'attachments' ? '附件信息' : dialog === 'asset' ? '资产明细' : '维修记录'} width={1000} footer={null} onCancel={() => setDialog(null)} destroyOnHidden>
      {dialog === 'asset' && <LegacyFields fields={line.info} />}
      {dialog === 'accessories' && <Table rowKey="id" columns={accessoryColumns} dataSource={line.accessories} pagination={false} scroll={{ x: 'max-content' }} />}
      {dialog === 'attachments' && <Table rowKey="id" columns={[{ title: '文件名称', dataIndex: 'name' }]} dataSource={line.attachments} pagination={false} locale={{ emptyText: '暂无附件' }} />}
      {dialog === 'repairs' && <Table rowKey="id" columns={[{ title: '维修单号', dataIndex: 'applicationNo' }, { title: '资产标签号', dataIndex: 'tag' }, { title: '维修说明', dataIndex: 'description' }, { title: '维修日期', dataIndex: 'date' }]} dataSource={line.repairs} pagination={false} locale={{ emptyText: '暂无维修记录' }} />}
    </Modal>
  </Space>;
}
