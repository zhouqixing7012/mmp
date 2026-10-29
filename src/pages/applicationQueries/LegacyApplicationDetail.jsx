import React, { useState } from 'react';
import { Button, Modal, Space } from 'antd';
import Table, { BusinessCard as Card } from '../../components/businessQuery/BusinessTable';
import StatusTag from '../../components/StatusTag';
import LegacyStorageDetail, { displayApplicationValue, LegacyFields } from './LegacyStorageDetail';

const dateText = value => displayApplicationValue(value) === '-' ? '-' : String(value).slice(0, 10);
const historyColumns = [{ title: '审批环节', dataIndex: 'node', width: 170 }, { title: '审批人', dataIndex: 'approver', width: 170 }, { title: '审批状态', dataIndex: 'status', width: 110, render: value => displayApplicationValue(value) === '-' ? '-' : <StatusTag value={value} /> }, { title: '审批时间', dataIndex: 'time', width: 130, render: dateText }, { title: '审批意见', dataIndex: 'opinion' }];
const accessoryColumns = [{ title: '标签号', dataIndex: 'tag', width: 160 }, { title: '小类', key: 'minor', width: 180, render: (_, row) => displayApplicationValue(row.material.minorCategory) }, { title: '资产说明', key: 'description', width: 260, render: (_, row) => displayApplicationValue(row.material.materialDescription) }, { title: '品牌', key: 'brand', width: 130, render: (_, row) => displayApplicationValue(row.material.brand) }, { title: '数量', dataIndex: 'quantity', width: 90, render: value => displayApplicationValue(value) === '-' ? '-' : Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }, { title: '启用时间', dataIndex: 'enabledDate', width: 120, render: dateText }].map(column => ({ render: displayApplicationValue, ...column }));
export default function LegacyApplicationDetail({ definition, record, onBack, onProgress }) {
  const [dialog, setDialog] = useState(null);
  const lines = record.kind === 'borrow' ? record.lines : [record.lines[0]];
  const activeLine = dialog?.line;
  const columns = (record.kind === 'borrow' ? [...historyColumns.slice(0, 2), { title: '代理人', key: 'agent', width: 120, render: () => '-' }, ...historyColumns.slice(2)] : historyColumns).map(column => ({ render: displayApplicationValue, ...column }));
  return <Space orientation="vertical" size={16} style={{ width: '100%' }} data-mmp-page-title={(record.extension ? '续借申请详情' : definition.title + '详情')}>
    {null}
    {record.kind === 'storage' ? <LegacyStorageDetail record={record} /> : <>
      <Card title="申请人信息" extra={record.values.applicationNo}><LegacyFields fields={record.head} fullWidthLabels={['退库原因']} /></Card>
      {lines.map((line, index) => <React.Fragment key={line.id}>
        <Card title={(record.extension ? '续借信息' : '资产信息') + (lines.length > 1 ? '（' + (index + 1) + '）' : '')}>
          <LegacyFields fields={[
            ...line.detail.map(([label, value]) => [label, record.kind === 'return' && label === '资产标签号' ? <Button key="asset-tag" type="link" onClick={() => setDialog({ type: 'asset', line })}>{displayApplicationValue(value)}</Button> : value]),
            ...(record.kind === 'return' ? [['部件数量', <Button key="parts" type="link" aria-label={`查看${line.tag}的配件（${line.accessories.reduce((sum, item) => sum + item.quantity, 0)}件）`} onClick={() => setDialog({ type: 'accessories', line })}>{line.accessories.reduce((sum, item) => sum + item.quantity, 0)}</Button>]] : []),
          ]} fullWidthLabels={record.kind === 'return' ? [] : ['资产说明', '配置', '备注', '使用说明', '鉴定说明', '续借原因', '借用原因', '需求说明']} />
          {!record.extension && record.kind !== 'return' && <div style={{ marginTop: 12 }}><span>部件数量：</span><Button type="link" aria-label={`查看${line.tag}的配件（${line.accessories.reduce((sum, item) => sum + item.quantity, 0)}件）`} onClick={() => setDialog({ type: 'accessories', line })}>{line.accessories.reduce((sum, item) => sum + item.quantity, 0)}</Button></div>}
        </Card>
        {record.kind === 'return' && <>
          <Card title="附属耗材"><Table rowKey="id" columns={accessoryColumns} dataSource={line.accessories} pagination={false} scroll={{ x: 'max-content' }} /></Card>
        </>}
      </React.Fragment>)}
      <Card title="审批记录"><Table rowKey="id" columns={columns} dataSource={record.history} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    </>}
    <Space style={{ display: 'flex', justifyContent: 'center' }}><Button onClick={onBack}>返回</Button>{record.kind !== 'storage' && <Button onClick={() => onProgress(record)}>查看进度</Button>}</Space>
    <Modal className="mmp-application-modal" open={Boolean(dialog)} title={dialog?.type === 'accessories' ? '配件明细' : '资产明细'} width={960} footer={null} onCancel={() => setDialog(null)} destroyOnHidden>
      {dialog?.type === 'asset' && <LegacyFields fields={activeLine.info} fullWidthLabels={['物资说明', '配置', '备注']} />}
      {dialog?.type === 'accessories' && <Table rowKey="id" columns={accessoryColumns} dataSource={activeLine.accessories} pagination={false} scroll={{ x: 'max-content' }} />}
    </Modal>
  </Space>;
}
