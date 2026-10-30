import React, { useState } from 'react';
import { renderApplicationStatus } from './ApplicationStatus';
import { Button, Modal, Space } from 'antd';
import Table, { BusinessCard as Card } from '../../components/businessQuery/BusinessTable';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';
import ClaimSummaryDetail from './ClaimSummaryDetail';
import { displayApplicationValue } from './LegacyStorageDetail';

const newEmployeeColumns = [['资产标签号', 'tag'], ['序列号', 'serialNo'], ['大类', 'majorCategory'], ['资产说明', 'materialDescription'], ['申请数量', 'requestedQuantity'], ['领用数量', 'receivedQuantity'], ['资产状态', 'assetStatus'], ['PR单号', 'prNo']];
const headOrder = ['申请人', '联系电话', '邮箱', '公司', '办公区', '申请日期', '成本中心', '部门', '匹配状态', '当前仓库', '出库单号', '是否弃领'];
const shortLineFields = [['公司', 'company'], ['板块', 'plate'], ['启用日期', 'enabledAt'], ['城市', 'city'], ['建筑', 'building'], ['楼层', 'floor']];
const longLineFields = [['实际物资说明', 'actualDescription'], ['配置', 'configuration'], ['备注', 'remark'], ['申请物资说明', 'requestedDescription'], ['申请原因', 'reason'], ['详细说明', 'detailDescription'], ['使用说明', 'usage']];
function ClaimLine({ line, onComponents, consumable }) {
  return <Card title="申请明细">
    <DetailGrid labelWidth={112}>
      <DetailItem label={line.materialClass === '3' ? '物料编码' : '资产标签号'}>{displayApplicationValue(line.materialClass === '3' ? line.materialCode : line.tag)}</DetailItem>
      <DetailItem label={line.materialClass === '3' ? '数量' : '部件数量'}>{line.materialClass === '3' ? displayApplicationValue(line.quantity) : line.componentQuantity > 0 ? <Button type="link" aria-label={`查看${line.tag}的配件（${line.componentQuantity}件）`} onClick={() => onComponents(line)}>{line.componentQuantity}</Button> : displayApplicationValue(line.componentQuantity)}</DetailItem>
      <DetailItem label="序列号">{displayApplicationValue(line.serialNo)}</DetailItem>
      {shortLineFields.map(([label, key]) => <DetailItem key={key} label={label}><span aria-label={label} className="mmp-query-readonly">{displayApplicationValue(line[key])}</span></DetailItem>)}
      {!consumable && <DetailItem label="资产用途" span={3}>{displayApplicationValue(line.assetPurpose)}</DetailItem>}
      {longLineFields.map(([label, key]) => <DetailItem key={key} label={label} span={3}><span aria-label={label} className="mmp-query-readonly">{displayApplicationValue(line[key])}</span></DetailItem>)}
    </DetailGrid>
  </Card>;
}
export default function ClaimApplicationDetail({ definition, record, onBack, view = 'detail' }) {
  const [componentLine, setComponentLine] = useState(null);
  if (view === 'summary') return <ClaimSummaryDetail key={record.id} definition={definition} record={record} onBack={onBack} />;
  const isNewEmployee = definition.id === 'newEmployee';
  const headEntries = Object.entries(record.head);
  const orderedHead = isNewEmployee ? headEntries : [...headOrder.filter(label => label in record.head).map(label => [label, record.head[label]]), ...headEntries.filter(([label]) => !headOrder.includes(label))];
  return <Space orientation="vertical" size={16} style={{ width: '100%' }} data-mmp-page-title={(isNewEmployee ? '新员工领用详情' : definition.id === 'asset' ? '申请资产详情' : '申请耗材详情')}>
    {null}
    <Card title="申请信息" extra={isNewEmployee ? undefined : record.values.applicationNo}><DetailGrid labelWidth={isNewEmployee ? 96 : 112}>{orderedHead.map(([label, value]) => <DetailItem key={label} label={label} span={label === '备注' ? 3 : 1}><span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{['单据状态', '匹配状态'].includes(label) ? renderApplicationStatus(value) : displayApplicationValue(value)}</span></DetailItem>)}{!isNewEmployee && <DetailItem label="单据备注" span={3}><span aria-label="单据备注" className="mmp-query-readonly">{displayApplicationValue(record.remark)}</span></DetailItem>}</DetailGrid></Card>
    {isNewEmployee ? <Card title="资产明细"><Table rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} columns={newEmployeeColumns.map(([title, dataIndex]) => ({ title, dataIndex, key: dataIndex, width: title === '物资名称' ? 250 : 160, render: dataIndex === 'assetStatus' ? renderApplicationStatus : displayApplicationValue }))} dataSource={record.lines} /></Card> : record.lines.map(line => <ClaimLine key={line.id} line={line} onComponents={setComponentLine} consumable={definition.id === 'consumable'} />)}
    <div style={{ textAlign: 'center' }}><Button onClick={onBack}>返回</Button></div>
    <Modal className="mmp-application-modal" title="配件明细" open={Boolean(componentLine)} footer={null} width={800} onCancel={() => setComponentLine(null)}><Table rowKey="id" size="small" pagination={false} dataSource={componentLine?.components || []} columns={[{ title: '物料编码', dataIndex: 'materialCode' }, { title: '物资说明', dataIndex: 'materialDescription' }, { title: '数量', dataIndex: 'quantity' }].map(column => ({ ...column, render: displayApplicationValue }))} /></Modal>
  </Space>;
}
