import React, { useState } from 'react';
import { Button, Card, Input, Modal, Space, Table, Typography } from 'antd';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';
import ClaimSummaryDetail from './ClaimSummaryDetail';
import { displayApplicationValue } from './LegacyStorageDetail';

const newEmployeeColumns = [['资产标签号', 'tag'], ['序列号', 'serialNo'], ['物资总类', 'materialType'], ['大类', 'majorCategory'], ['物资名称', 'materialDescription'], ['申请数量', 'requestedQuantity'], ['领用数量', 'receivedQuantity'], ['资产状态', 'assetStatus'], ['PR单号', 'prNo']];
// 长文本在本业务页面逐字段指定整行，公共详情网格不按字段名推断宽度。
const assetLineFields = [['序列号', 'serialNo'], ['公司', 'company'], ['板块', 'plate'], ['启用日期', 'enabledAt'], ['实际物资说明', 'actualDescription', 3], ['配置', 'configuration', 3], ['备注', 'remark', 3], ['城市', 'city'], ['楼层', 'floor'], ['资产用途', 'assetPurpose'], ['申请物资说明', 'requestedDescription', 3], ['申请原因', 'reason', 3], ['详细说明', 'detailDescription', 3]];
function ClaimLine({ line, onComponents }) {
  const [usage, setUsage] = useState(line.usage), [building, setBuilding] = useState(line.building);
  return <Card title="申请明细">
    <DetailGrid>
      <DetailItem label={line.materialClass === '3' ? '物料编码' : '资产标签号'}>{displayApplicationValue(line.materialClass === '3' ? line.materialCode : line.tag)}</DetailItem>
      <DetailItem label={line.materialClass === '3' ? '数量' : '部件数量'}>{line.materialClass === '3' ? displayApplicationValue(line.quantity) : line.componentQuantity > 0 ? <Button type="link" aria-label={`查看${line.tag}的配件（${line.componentQuantity}件）`} onClick={() => onComponents(line)}>{line.componentQuantity}</Button> : displayApplicationValue(line.componentQuantity)}</DetailItem>
      {assetLineFields.map(([label, key, span = 1]) => <DetailItem key={key} label={label} span={span}><span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{displayApplicationValue(line[key])}</span></DetailItem>)}
      <DetailItem label="建筑"><Input aria-label="建筑" value={building} onChange={event => setBuilding(event.target.value)} /></DetailItem>
      <DetailItem label="使用说明" span={3}>{line.materialClass === '3' ? displayApplicationValue(usage) : <Input.TextArea aria-label="使用说明" maxLength={150} value={usage} onChange={event => setUsage(event.target.value)} autoSize />}</DetailItem>
    </DetailGrid>
  </Card>;
}
export default function ClaimApplicationDetail({ definition, record, onBack, view = 'detail' }) {
  const [remark, setRemark] = useState(record.remark || '');
  const [componentLine, setComponentLine] = useState(null);
  if (view === 'summary') return <ClaimSummaryDetail key={record.id} definition={definition} record={record} onBack={onBack} />;
  const isNewEmployee = definition.id === 'newEmployee';
  return <Space orientation="vertical" size={16} style={{ width: '100%' }}>
    <Typography.Title level={4}>{isNewEmployee ? '新员工领用详情' : definition.id === 'asset' ? '申请资产详情' : '申请耗材详情'}</Typography.Title>
    <Card title="申请信息"><DetailGrid>{Object.entries(record.head).map(([label, value]) => <DetailItem key={label} label={label} span={label === '备注' ? 3 : 1}><span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{displayApplicationValue(value)}</span></DetailItem>)}{!isNewEmployee && <DetailItem label="单据备注" span={3}><Input.TextArea aria-label="单据备注" value={remark} onChange={event => setRemark(event.target.value)} maxLength={100} autoSize /></DetailItem>}</DetailGrid></Card>
    {isNewEmployee ? <Card title="资产明细"><Table rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} columns={newEmployeeColumns.map(([title, dataIndex]) => ({ title, dataIndex, key: dataIndex, width: title === '物资名称' ? 250 : 160, render: displayApplicationValue }))} dataSource={record.lines} /></Card> : record.lines.map(line => <ClaimLine key={line.id} line={line} onComponents={setComponentLine} />)}
    <div style={{ textAlign: 'center' }}><Button onClick={onBack}>返回</Button></div>
    <Modal className="mmp-application-modal" title="配件明细" open={Boolean(componentLine)} footer={null} width={800} onCancel={() => setComponentLine(null)}><Table rowKey="id" size="small" pagination={false} dataSource={componentLine?.components || []} columns={[{ title: '物料编码', dataIndex: 'materialCode' }, { title: '物资说明', dataIndex: 'materialDescription' }, { title: '数量', dataIndex: 'quantity' }].map(column => ({ ...column, render: displayApplicationValue }))} /></Modal>
  </Space>;
}
