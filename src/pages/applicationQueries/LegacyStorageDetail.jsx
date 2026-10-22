import React, { useRef, useState } from 'react';
import { Button, Card, Modal, Space, Table } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

// 仅处理普通展示空值，不替换真实数值0，也不吞掉加载错误。
export function displayApplicationValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? '-' : value;
}

function displayValue(label, value) {
  if (typeof value === 'number' && ['原值', '净值'].includes(label)) return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (typeof value === 'number' && ['可用数量', '资产数量', '在库数量'].includes(label)) return value.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return displayApplicationValue(value);
}
export function LegacyFields({ fields, fullWidthLabels = [] }) {
  return <DetailGrid>{fields.map(([label, value], index) => <DetailItem key={label + index} label={label} span={fullWidthLabels.includes(label) ? 3 : 1}><span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{displayValue(label, value)}</span></DetailItem>)}</DetailGrid>;
}
// 使用浏览器打印当前单据，避免将后台菜单及其他页面一同打印。
function printDocument(element, title) {
  const frame = document.createElement('iframe');
  frame.title = '打印' + title;
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  document.body.appendChild(frame);
  const target = frame.contentDocument;
  target.title = title;
  const style = target.createElement('style');
  style.textContent = 'body{font:12px sans-serif}table{width:100%;border-collapse:collapse}td,th{padding:6px;border:1px solid #bbb}button{display:none}dl{display:grid;grid-template-columns:100px 1fr 100px 1fr 100px 1fr}dt,dd{margin:0;padding:5px;border:1px solid #ddd}';
  target.head.appendChild(style);
  target.body.appendChild(element.cloneNode(true));
  frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
  frame.contentWindow.focus();
  frame.contentWindow.print();
}
const column = (label, key, extra = {}) => ({ title: label, dataIndex: key, width: 150, ellipsis: true, render: displayApplicationValue, ...extra });
export default function LegacyStorageDetail({ record }) {
  const [selected, setSelected] = useState(null);
  const printable = useRef(null);
  const validationVisible = record.statusCode === '1' || (record.statusCode === '2' && record.storageType === '计划');
  const columns = [column('行号', 'lineNo', { width: 70 }), ...(validationVisible ? [column('资产验证', 'validation')] : []), ...(record.lines.some(line => line.handlingStatus) ? [column('移库状态', 'handlingStatus')] : []), column('资产标签号', 'tag'), column('物资说明', 'description', { width: 260 }), column('物资总类', 'materialType'), column('数量', 'quantity', { width: 90 }), column('公司', 'company'), column('板块', 'plate'), column('资产标记', 'mark'), column('启用日期', 'enabledDate'), column('资产状态', 'status', { render: value => displayApplicationValue(value) === '-' ? '-' : <StatusTag value={value} /> }), column('操作', 'operation', { width: 80, fixed: 'right', render: (_, line) => <Button type="link" onClick={() => setSelected(record.lines.find(item => item.id === line.id))}>查看</Button> })];
  const rows = record.lines.map(line => ({ ...line, description: line.material.materialDescription, materialType: line.material.materialType, company: line.warehouse.company, plate: '', validation: (record.statusCode === '1' ? line.receivingAt : line.outgoingAt) ? '已验证' : '未验证' }));
  const modalHead = selected ? [
    ['移库单号', record.values.applicationNo], ['移库单行号', selected.lineNo], ['出库仓库', record.values.fromWarehouse], ['出库仓库管理员', record.values.exportApplicant], ['入库仓库', record.values.toWarehouse],
    ...(record.statusCode !== '2' ? [['入库仓库管理员', selected.receiver]] : []), ['移库数量', selected.quantity],
    ...(record.statusCode !== '2' && record.to.zoneEnabled === true ? [['入库库区', selected.inboundZone ?? '']] : []),
    ...(record.statusCode !== '2' && record.to.binEnabled === true ? [['入库货位', selected.inboundBin ?? '']] : []),
    ['移库出库说明', selected.outboundNote],
    ...(record.statusCode !== '2' ? [...(selected.material.materialType === '资产' ? [['资产标记', selected.mark]] : []), ['移库接收说明', selected.receivingNote]] : []),
  ] : [];
  return <>
    <div ref={printable}>
      <Card title="移库单信息"><LegacyFields fields={record.head} fullWidthLabels={['备注']} /></Card>
      <Card title="移库明细" style={{ marginTop: 16 }}><Table rowKey="id" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    </div>
    <Space style={{ marginTop: 16 }}><Button onClick={() => printDocument(printable.current, record.values.applicationNo)}>打印</Button></Space>
    <Modal className="mmp-application-modal" open={Boolean(selected)} title="移库物资明细" width={1100} onCancel={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>关闭</Button>} destroyOnHidden>
      {selected && <><LegacyFields fields={modalHead} fullWidthLabels={['移库出库说明', '移库接收说明']} /><Card title={selected.material.materialType === '资产' ? '资产信息' : '耗材信息'} size="small" style={{ marginTop: 16 }}><LegacyFields fields={selected.info} fullWidthLabels={['物资说明', '配置', '备注']} /></Card></>}
    </Modal>
  </>;
}
