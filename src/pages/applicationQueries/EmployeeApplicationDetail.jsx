import React, { useState } from 'react';
import { Button, Modal, Space } from 'antd';
import Table, { BusinessCard as Card } from '../../components/businessQuery/BusinessTable';
import { displayApplicationValue, LegacyFields } from './LegacyStorageDetail';

const historyColumns = [
  { title: '审批环节', dataIndex: 'node', width: 170 }, { title: '审批人', dataIndex: 'approver', width: 170 },
  { title: '代理人', dataIndex: 'agent', width: 130 }, { title: '审批状态', dataIndex: 'status', width: 100 },
  { title: '审批时间', dataIndex: 'time', width: 180 }, { title: '审批意见', dataIndex: 'opinion', width: 220 },
].map(column => ({ render: displayApplicationValue, ...column }));
export default function EmployeeApplicationDetail({ definition, record, onBack, onProgress }) {
  const [accessoryLine, setAccessoryLine] = useState(null);
  const transfer = record.kind === 'transfer';
  const number = value => displayApplicationValue(value) === '-' ? '-' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const column = (title, dataIndex, extra = {}) => ({ title, dataIndex, width: 170, render: displayApplicationValue, ...extra });
  const description = column('资产说明', 'description', { width: 280, render: (_, line) => displayApplicationValue(line.material.materialDescription) });
  const accessories = column('部件数量', 'accessories', { width: 100, render: (items, line) => <Button type="link" aria-label={`查看${line.tag}的配件（${number(items.reduce((sum, item) => sum + item.quantity, 0))}件）`} onClick={() => setAccessoryLine(line)}>{number(items.reduce((sum, item) => sum + item.quantity, 0))}</Button> });
  const baseColumns = [column('资产标签号', 'tag'), description];
  const transferColumns = [...baseColumns, column('City', 'city'), column('Building', 'building'), column('Floor', 'floor'), accessories, column('转移备注说明', 'note'), column('资产状态', 'status'), column('数量', 'quantity', { render: number })];
  const returnColumns = [...baseColumns, column('配置', 'config', { width: 250, render: (_, line) => displayApplicationValue(line.material.config) }), column('数量', 'quantity', { render: number }), column('资产状态', 'status'), column('资产用途', 'purpose'), accessories, column('耗材信息', 'consumableInfo'), column('物资说明', 'materialNote')];
  const pendingColumns = [column('仓库', 'warehouse', { width: 240 }), column('资产标签号', 'tag'), column('SN号', 'sn'), column('公司', 'company'), column('模块', 'module'), column('启用日期', 'enabledDate'), description, column('配置', 'config', { width: 250, render: (_, line) => displayApplicationValue(line.material.config) }), column('备注', 'note'), column('耗材信息', 'consumableInfo')];
  const source = record.sourcePerson, target = record.targetPerson;
  return <Space orientation="vertical" size={16} style={{ width: '100%' }} data-mmp-page-title={(definition.title) + ("详情")}>
    {null}
    {transfer ? <>
      <Card size="small" title="转出人信息" extra={record.values.applicationNo}><LegacyFields fields={[
        ['转出人', source.name], ['转出公司', source.company], ['转出部门', source.department], ['联系电话', source.phone], ['邮箱', source.email],
        ['申请时间', record.values.createdAt], ['转移类型', record.values.transferType], ['转出原因', record.values.reason], ['转移单号', record.values.transferNo],
      ]} fullWidthLabels={['转出原因']} /></Card>
      <Card size="small" title="接收人信息"><LegacyFields fields={[
        ['接收人', target.name], ['接收公司', target.company], ['接收部门', target.department], ['联系电话', target.phone], ['邮箱', target.email], ['使用用途', record.values.usage],
      ]} fullWidthLabels={['使用用途']} /></Card>
      <Card size="small" title="转移资产信息"><Table rowKey="id" size="small" bordered columns={transferColumns} dataSource={record.lines} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    </> : <>
      <Card size="small" title="更换信息说明" extra={record.values.applicationNo}><LegacyFields fields={record.head} fullWidthLabels={['更换原因']} /></Card>
      <Card size="small" title="退回物资信息"><Table rowKey="id" size="small" bordered columns={returnColumns} dataSource={record.lines} pagination={false} scroll={{ x: 'max-content' }} /></Card>
      <Card size="small" title="待发放物资信息"><Table rowKey="id" size="small" bordered columns={pendingColumns} dataSource={record.pendingLines} pagination={false} scroll={{ x: 'max-content' }} locale={{ emptyText: '暂无待发放物资记录' }} /></Card>
      <Card size="small" title="鉴定结果"><LegacyFields fields={[
        ['鉴定结果', record.identification.result], ['鉴定说明', record.identification.explanation],
      ]} fullWidthLabels={['鉴定说明']} /></Card>
    </>}
    <Card size="small" title="审批记录"><Table rowKey="id" size="small" bordered columns={historyColumns} dataSource={record.history} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    <Space style={{ display: 'flex', justifyContent: 'center' }}><Button onClick={onBack}>返回</Button><Button onClick={() => onProgress(record)}>查看进度</Button></Space>
    <Modal className="mmp-application-modal" title="部件明细" open={Boolean(accessoryLine)} onCancel={() => setAccessoryLine(null)} footer={null} width={900} destroyOnHidden>
      <Table rowKey="id" size="small" bordered pagination={false} dataSource={accessoryLine?.accessories || []} columns={[
        column('资产标签号', 'tag'), column('物料说明', 'description', { width: 260, render: (_, item) => displayApplicationValue(item.material.materialDescription) }),
        column('配置', 'config', { render: (_, item) => displayApplicationValue(item.material.config) }), column('数量', 'quantity', { render: number }),
      ]} scroll={{ x: 'max-content' }} />
    </Modal>
  </Space>;
}
