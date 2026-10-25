import React from 'react';
import AutoWidthTable from '../../components/tableSizing/AutoWidthTable';
import { Card, Space, Typography, theme } from 'antd';
import { companyQuantity, companyAmount, amount, accountingAmount, integer, summaryPercent, historyPercent, quantity, accounting, getGroupedRowSpans, getIncrementTitle, DETAIL_FIELDS, getIncrementRows, getInventoryReportSummary, getInventoryDetailRows, getInventoryLossCategoryRows } from '../../services/inventoryReportService';

export function ReportTable({ columns, rows, rowKey = 'key', ...props }) {
  return <AutoWidthTable columns={columns} dataSource={rows} rowKey={rowKey} {...props} />;
}
const column = (title, dataIndex, render = quantity, type = title.includes('占') ? 'percent' : title.includes('（元）') ? 'money' : 'number') => ({
  title, dataIndex, key: dataIndex, render, align: 'right', sizing: { type, format: render },
});
const textColumn = (title, dataIndex, type = 'text') => ({ title, dataIndex, key: dataIndex, ellipsis: true, sizing: { type } });
export function IncrementTable({ year }) {
  const { token } = theme.useToken();
  const rows = getIncrementRows(year);
  const isSummary = row => row.name === '小计' || row.name === '合计';
  const spans = getGroupedRowSpans(rows, 'category', row => !isSummary(row));
  return <div data-testid="inventory-increment-table" style={{ width: '100%', maxWidth: 620, minWidth: 0 }}><ReportTable compact rows={rows} columns={[
    { ...textColumn('资产大类', 'category'), sizing: { type: 'text', text: row => isSummary(row) ? null : row.category }, onCell: (row, index) => isSummary(row) ? { colSpan: 2, style: { background: row.name === '合计' ? token.colorPrimaryBg : token.colorFillAlter, fontWeight: 600 } } : { rowSpan: spans[index] },
      render: (_, row) => isSummary(row) ? row.name === '合计' ? '合计' : `${row.category}小计` : row.category },
    { ...textColumn('资产细类', 'name'), sizing: { type: 'text', text: row => isSummary(row) ? null : row.name }, onCell: row => isSummary(row) ? { colSpan: 0 } : {} },
    { ...column('汇总', 'value', integer), onCell: row => isSummary(row) ? { style: { background: row.name === '合计' ? token.colorPrimaryBg : token.colorFillAlter, fontWeight: 600 } } : {} },
  ]} /></div>;
}
export function CompanyLossTable({ report }) {
  const spans = getGroupedRowSpans(report.companyLoss, 'company');
  return <ReportTable rowKey={r => `${r.company}-${r.year}`} rows={report.companyLoss} columns={[
    { ...textColumn('子公司', 'company'), onCell: (_, index) => ({ rowSpan: spans[index] }) }, textColumn('年份', 'year', 'year'),
    ...[['笔记本', 'notebook'], ['主机', 'desktop'], ['显示器', 'display']].map(([name, key]) => column(name, key, companyQuantity)),
    column('办公设备', 'office', companyQuantity), column('移动数码', 'mobile', companyQuantity), column('照摄像器材及配件', 'camera', companyQuantity), column('车辆', 'vehicle', companyQuantity), column('数量合计（件）', 'quantity', companyQuantity), column('净值合计（元）', 'net', companyAmount),
  ]} />;
}
export function AnalysisTables({ report }) {
  const categories = getInventoryLossCategoryRows(report);
  const spans = getGroupedRowSpans(categories, 'category');
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title="资产变化范围"><Typography.Paragraph>资产变化周期：{report.period}</Typography.Paragraph><Typography.Paragraph className="!mb-0">资产盘点类别：{report.scope}</Typography.Paragraph></Card>
    <Card size="small" title={`${report.year}年资产盘点情况汇总`}>
      <ReportTable rowKey="name" rows={getInventoryReportSummary(report)} columns={[
        textColumn('资产情况', 'name'),
        { title: '数量', children: [column('数量（件）', 'quantity', (value, row) => row.name === '全部盘点资产' ? integer(value) : accounting(value)), column('占全部盘点资产', 'quantityRate', summaryPercent)] },
        { title: '原值', children: [column('金额（元）', 'original', accounting), column('占全部盘点资产', 'originalRate', summaryPercent)] },
        { title: `净值（截至${report.year}年6月30日）`, children: [column('金额（元）', 'net', accounting), column('占全部盘点资产', 'netRate', summaryPercent)] },
      ]} />
    </Card>
    <Card size="small" title="四年盘点数据对比">
      <ReportTable rowKey="year" rows={report.history} columns={[
        textColumn('年份', 'year', 'year'),
        { title: '全部盘点资产情况', children: [column('数量（件）', 'quantity', integer), column('原值（元）', 'original', integer), column('净值（元）', 'net', integer)] },
        { title: '盘亏数量情况', children: [column('数量（件）', 'lossQuantity', integer), column('占全部盘点资产', 'lossRate', historyPercent)] },
        { title: '盘亏原值情况', children: [column('金额（元）', 'lossOriginal', integer), column('占全部盘点资产', 'lossOriginalRate', historyPercent)] },
        { title: '盘亏净值情况', children: [column('金额（元）', 'lossNet', accounting), column('占全部盘点资产', 'lossNetRate', historyPercent)] },
      ]} />
    </Card>
    <Card size="small" title={`${report.year}年资产盘亏统计`}>
      <ReportTable rows={categories} columns={[{ ...textColumn('资产类别', 'category'), onCell: (_, index) => ({ rowSpan: spans[index] }) }, textColumn('盘点年份', 'year', 'year'), column('盘亏数量（件）', 'quantity', accounting), column('盘亏原值（元）', 'original', accounting), column('盘亏净值（元）', 'net', accounting), { ...textColumn('备注', 'remark', 'description'), render: () => '-', sizing: { type: 'description', text: () => '-' } }]} />
    </Card>
    <Card size="small" title={<span style={{ whiteSpace: 'normal' }}>{getIncrementTitle(report.year)}</span>} style={{ width: '100%', maxWidth: 652 }}><IncrementTable year={report.year} /></Card>
  </Space>;
}
export function DetailTable({ report }) {
  const rows = getInventoryDetailRows(report);
  const types = { 序号: 'index', 盘点状态: 'status', 资产说明: 'description', 数量: 'number', 原值: 'money', 报失当月资产净值: 'money', 是否已赔偿: 'status', 赔偿金额: 'money', 损失: 'money', 标签号: 'code', 购买日期: 'date', 责任人编号: 'code', 说明: 'description' };
  const format = (name, value, row) => row.summary && value === 0 ? '-'
    : value == null ? '' : ['原值', '报失当月资产净值'].includes(name) ? accountingAmount(value)
      : ['赔偿金额', '损失'].includes(name) ? amount(value) : name === '数量' ? quantity(value) : value;
  return <Card size="small" title="盘亏及待查明细" extra={`${report.detailsAreDemo ? "演示数据 · " : ""}共 ${report.details.length} 条`}>
    <AutoWidthTable rowKey="key" dataSource={rows} columns={DETAIL_FIELDS.map((name, i) => ({
      title: name, dataIndex: name, key: name, ellipsis: ['资产说明', '说明', '子公司', '一级部门'].includes(name),
      sizing: { type: types[name] || 'text', text: row => row.summary && i < 5 ? null : format(name, row[name], row) },
      align: ['数量', '原值', '报失当月资产净值', '赔偿金额', '损失'].includes(name) ? 'right' : 'left',
      onCell: row => row.summary && i < 5 ? { colSpan: i === 0 ? 5 : 0 } : {},
      render: (value, row) => row.summary && i === 0 ? <strong>{row.label}</strong> : format(name, value, row),
    }))} />
  </Card>;
}
