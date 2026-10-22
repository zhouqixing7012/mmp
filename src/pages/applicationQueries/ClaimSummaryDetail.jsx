import React, { useState } from 'react';
import { Alert, Button, Card, Input, Space, Table, Typography } from 'antd';
import * as XLSX from 'xlsx';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';

const isEmptyValue = value => value == null || (typeof value === 'string' && value.trim() === '');
const readOnlyValue = value => isEmptyValue(value) ? '-' : value;
export const claimMoney = value => isEmptyValue(value) ? '-' : Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const summaryAmount = line => Number(line.purchaseQuantity ?? 0) * Number(line.unitPrice ?? 0);
export function claimSummaryGroups(lines, consumable) {
  const groups = new Map();
  lines.forEach(line => {
    const name = consumable ? line.originalDepartment : line.materialCategory;
    const current = groups.get(name) || { id: name, name, quantity: 0, amount: 0 };
    current.quantity += Number(line.purchaseQuantity ?? 0);
    current.amount += summaryAmount(line);
    groups.set(name, current);
  });
  return [...groups.values()];
}
export function claimSummaryPOs(lines) {
  const seen = new Set();
  return lines.filter(line => { const key = JSON.stringify([line.poNo, line.poStatus]); if (seen.has(key)) return false; seen.add(key); return true; });
}
function downloadAttachment(file) {
  const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url);
}
const numericFields = new Set(['quantity', 'purchaseQuantity', 'inUseCount', 'currentQuantity', 'currentPerPerson', 'afterPerPerson', 'companyPerPerson', 'amount']);
const makeColumns = items => [{ title: '序号', key: 'index', width: 70, render: (_, row, index) => index + 1 }, ...items.map(([title, dataIndex, money]) => ({
  title, dataIndex, key: dataIndex,
  width: title.includes('说明') || title.includes('信息') ? 220 : 150,
  align: money || numericFields.has(dataIndex) ? 'right' : undefined,
  render: money ? claimMoney : readOnlyValue,
}))];
function summaryTotal(columns, rows, quantityKey, amountKey) {
  const quantityIndex = columns.findIndex(column => column.dataIndex === quantityKey);
  const amountIndex = columns.findIndex(column => column.dataIndex === amountKey);
  const trailingIndex = amountIndex + 1;
  return <Table.Summary.Row>
    <Table.Summary.Cell index={0} colSpan={quantityIndex}>合计</Table.Summary.Cell>
    <Table.Summary.Cell index={quantityIndex} align="right">{rows.reduce((sum, row) => sum + Number(row[quantityKey] ?? 0), 0)}</Table.Summary.Cell>
    <Table.Summary.Cell index={amountIndex} align="right">{claimMoney(rows.reduce((sum, row) => sum + Number(row[amountKey] ?? 0), 0))}</Table.Summary.Cell>
    {trailingIndex < columns.length && <Table.Summary.Cell index={trailingIndex} colSpan={columns.length - trailingIndex} />}
  </Table.Summary.Row>;
}
export function summaryExportRows(lines, consumable) {
  return lines.map(line => ({ ...(consumable ? { '部门': line.department, '申请单号': line.applicationNo } : {}), '申请人': line.applicant, '物资类别': line.materialCategory, '物料说明': line.materialDescription, ...(!consumable ? { '配置': line.configuration } : {}), '采购数量': line.purchaseQuantity, '预计费用（元）': summaryAmount(line), '申请原因': line.reason, ...(!consumable ? { '在用资产': line.inUseCount } : {}), 'ES建议': line.suggestion, '采购信息': (line.poNo || '') + '-' + (line.poStatus || '') }));
}
export default function ClaimSummaryDetail({ definition, record, onBack }) {
  const { summary } = record, consumable = definition.id === 'consumable';
  const [usage, setUsage] = useState(summary.projectUsage);
  const groups = claimSummaryGroups(summary.lines, consumable);
  const groupColumns = makeColumns([[consumable ? '部门' : '物资类别', 'name'], ['申请采购数量', 'quantity'], ['预计采购费用（元）', 'amount', true]]);
  const columns = makeColumns([...(consumable ? [['部门', 'department'], ['申请单号', 'applicationNo']] : []), ['申请人', 'applicant'], ['物资类别', 'materialCategory'], ['物料说明', 'materialDescription'], ...(!consumable ? [['配置', 'configuration']] : []), ['采购数量', 'purchaseQuantity'], ['预计费用（元）', 'amount', true], ['申请原因', 'reason'], ...(!consumable ? [['在用资产', 'inUseCount']] : []), ['ES建议', 'suggestion'], ['采购信息', 'purchaseInfo']]);
  const showLines = lines => lines.map(line => ({ ...line, amount: summaryAmount(line), purchaseInfo: (line.poNo || '') + '-' + (line.poStatus || '') }));
  const detailTable = (title, lines, emptyText) => { const rows = showLines(lines); return <Card key={title} title={title}><Table size="small" rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 'max-content' }} summary={() => summaryTotal(columns, rows, 'purchaseQuantity', 'amount')} locale={{ emptyText }} /></Card>; };
  const exportDetail = () => {
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryExportRows(summary.lines, consumable)), '申请明细');
    XLSX.writeFile(workbook, definition.title + '-申请明细.xlsx');
  };
  return <Space orientation="vertical" size={16} style={{ width: '100%' }}>
    <Typography.Title level={4}>统一申请汇总详情</Typography.Title>
    <Card title="汇总信息"><DetailGrid><DetailItem label="ES汇总说明" span={3}><Input.TextArea value={readOnlyValue(summary.esDescription)} readOnly autoSize /></DetailItem><DetailItem label="项目用途说明" span={3}><Input.TextArea aria-label="项目用途说明" value={usage} onChange={event => setUsage(event.target.value)} autoSize /><Typography.Text type="secondary">此信息会同步至PR系统</Typography.Text></DetailItem></DetailGrid></Card>
    <Card title="部门汇总信息"><Table rowKey="id" size="small" pagination={false} columns={groupColumns} dataSource={groups} summary={() => summaryTotal(groupColumns, groups, 'quantity', 'amount')} /></Card>
    <Alert type="info" title="此汇总申请中的价格仅供参考，最终采购价格以PR单为准。" />
    {consumable ? detailTable('申请明细', summary.lines, '本批暂无耗材申请明细') : [detailTable('超标申请', summary.lines.filter(line => line.overStandard), '本批暂无超标申请'), detailTable('非超标申请', summary.lines.filter(line => !line.overStandard), '本批暂无非超标申请')]}
    {!consumable && <Card title="部门现资产参考使用量"><Table rowKey="id" size="small" pagination={false} scroll={{ x: 'max-content' }} dataSource={summary.references.filter(row => row.category)} columns={makeColumns([['物资类别', 'category'], ['现使用量', 'currentQuantity'], ['现人均用量', 'currentPerPerson', true], ['申请采购量', 'purchaseQuantity'], ['采购后人均用量', 'afterPerPerson', true], ['公司人均用量', 'companyPerPerson', true]])} /></Card>}
    {summary.attachmentId && <Card title="附件"><Table rowKey="id" size="small" pagination={false} dataSource={summary.attachments} columns={[{ title: '附件名称', dataIndex: 'name', render: (name, file) => <Button type="link" onClick={() => downloadAttachment(file)}>{readOnlyValue(name)}</Button> }, { title: '附件描述', dataIndex: 'description', render: readOnlyValue }]} /></Card>}
    <Card title="PO单信息"><Table rowKey="id" size="small" pagination={false} dataSource={claimSummaryPOs(summary.lines)} columns={makeColumns([['PO单号', 'poNo'], ['PO单状态', 'poStatus']])} /></Card>
    <Space style={{ display: 'flex', justifyContent: 'center' }}><Button onClick={exportDetail}>导出申请明细</Button><Button onClick={onBack}>返回</Button></Space>
  </Space>;
}
