import React, { useRef, useState } from 'react';
import { Button, Modal, Space } from 'antd';
import Table, { BusinessCard as Card } from '../../components/businessQuery/BusinessTable';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { renderApplicationStatus } from './ApplicationStatus';

// 仅处理普通展示空值，不替换真实数值0，也不吞掉加载错误。
export function displayApplicationValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? '-' : value;
}

function displayValue(label, value) {
  if (typeof value === 'number' && ['原值', '净值'].includes(label)) return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (/数量$/.test(label) && value != null && String(value).trim() !== '' && Number.isFinite(Number(value))) return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 6 });
  return displayApplicationValue(value);
}
export function LegacyFields({ fields, fullWidthLabels = [], spans = {}, labelWidth = 96, statusLabels = ['单据状态', '资产状态', '移库状态', '鉴定结果'] }) {
  return <DetailGrid labelWidth={labelWidth}>{fields.map(([label, value], index) => <DetailItem key={label + index} label={label} span={fullWidthLabels.includes(label) ? 3 : spans[label] || 1}><span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{statusLabels.includes(label) ? renderApplicationStatus(value) : displayValue(label, value)}</span></DetailItem>)}</DetailGrid>;
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
export default function LegacyStorageDetail({ record, onBack }) {
  const [selected, setSelected] = useState(null);
  const printable = useRef(null);
  const validationVisible = record.values.status === '出库待接收';
  const columns = [column('行号', 'lineNo', { width: 70 }), ...(validationVisible ? [column('资产验证', 'validation', { alignmentType: 'status', render: renderApplicationStatus })] : []), ...(record.lines.some(line => line.handlingStatus) ? [column('移库状态', 'handlingStatus', { render: renderApplicationStatus })] : []), column('资产标签号', 'tag'), column('资产说明', 'description', { width: 260 }), column('数量', 'quantity', { width: 90, render: value => displayValue('数量', value) }), column('公司', 'company'), column('板块', 'plate'), column('资产标记', 'mark'), column('启用日期', 'enabledDate'), column('资产状态', 'status', { render: renderApplicationStatus }), column('操作', 'operation', { width: 80, fixed: 'right', render: (_, line) => <Button type="link" onClick={() => setSelected(record.lines.find(item => item.id === line.id))}>查看</Button> })];
  const rows = record.lines.map(line => ({ ...line, description: line.material.materialDescription, materialType: line.material.materialType, company: line.warehouse.company, plate: line.plate || '', validation: line.verification || '' }));
  const modalHead = selected ? [
    ['移库单号', record.values.applicationNo], ['移库单行号', selected.lineNo], ['移库数量', selected.quantity],
    ['出库仓库', record.values.fromWarehouse], ['出库仓库管理员', record.values.exportApplicant],
    ['入库仓库', record.values.toWarehouse],
    ...(record.values.status !== '草稿' ? [['入库仓库管理员', selected.receiver]] : []),
    ['移库出库说明', selected.outboundNote],
    ...(record.values.status !== '草稿' ? [...(selected.material.materialType === '资产' ? [['资产标记', selected.mark]] : []), ['移库接收说明', selected.receivingNote]] : []),
  ] : [];
  const hiddenAssetFields = new Set(['物资总类', '库区', '货位', '印刷号', '品牌', '规格/型号', 'Room', 'room']);
  const assetFields = selected ? selected.info.filter(([label]) => !hiddenAssetFields.has(label))
    .map(([label, value]) => [label === '物资说明' ? '资产说明' : label, value]) : [];
  const assetOrder = ['资产标签号', 'SN号', '资产状态', '物资大类', '物资小类', '数量', '可用数量', '计量单位', '资产标记', '公司', '板块', '部门', '仓库', '责任人', '启用日期', '原值', '净值', '申请批次', 'City', 'Building', 'Floor', '成本中心', '业务线', '项目', '费用账户', '资产说明', '配置', '备注'];
  assetFields.sort((a, b) => assetOrder.indexOf(a[0]) - assetOrder.indexOf(b[0]));
  return <>
    <div ref={printable}>
      <Card title="移库单信息"><LegacyFields fields={record.head} fullWidthLabels={['备注']} /></Card>
      <Card title="移库明细" style={{ marginTop: 16 }}><Table rowKey="id" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 'max-content' }} /></Card>
    </div>
    <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}><Button onClick={onBack}>返回</Button>{record.values.status === '已完成' && <Button onClick={() => printDocument(printable.current, record.values.applicationNo)}>打印</Button>}</Space>
    <Modal className="mmp-application-modal" open={Boolean(selected)} title="移库资产明细" width={960} onCancel={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>关闭</Button>} destroyOnHidden>
      {selected && <><Card title="移库信息"><LegacyFields fields={modalHead} labelWidth={128} spans={{ '出库仓库': 2, '入库仓库': record.values.status === '草稿' ? 3 : 2 }} fullWidthLabels={['资产标记', '移库出库说明', '移库接收说明']} /></Card><Card title={selected.material.materialType === '资产' ? '资产信息' : '耗材信息'} size="small" style={{ marginTop: 16 }}><LegacyFields fields={assetFields} labelWidth={128} spans={{ '仓库': 2, '费用账户': 2 }} fullWidthLabels={['资产说明', '配置', '备注']} /></Card></>}
    </Modal>
  </>;
}
