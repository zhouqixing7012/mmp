import React from 'react';
import { Card, Space, Table, Typography, theme } from 'antd';
import { companyQuantity, companyAmount, amount, accountingAmount, integer, summaryPercent, historyPercent, quantity, accounting, getGroupedRowSpans, getIncrementTitle, DETAIL_FIELDS, getIncrementRows, getInventoryReportSummary, getInventoryDetailRows, getInventoryLossCategoryRows } from '../../services/inventoryReportService';

export function ReportTable({ columns, rows, rowKey = 'key', ...props }) {
  return <Table size="small" bordered columns={columns} dataSource={rows} rowKey={rowKey} pagination={false} scroll={{ x: 'max-content' }} {...props} />;
}
const column = (title, dataIndex, render = quantity) => ({ title, dataIndex, key: dataIndex, render, align: 'right', width: render === amount || title.includes('（元）') ? 150 : title.includes('占') ? 120 : 100 });
const textColumn = (title, dataIndex, width = 150) => ({ title, dataIndex, key: dataIndex, width });
export function IncrementTable({ year }) {
  const { token } = theme.useToken();
  const rows = getIncrementRows(year);
  const isSummary = row => row.name === '小计' || row.name === '合计';
  const spans = getGroupedRowSpans(rows, 'category', row => !isSummary(row));
  return <div data-testid="inventory-increment-table" style={{ width: '100%', maxWidth: 620, minWidth: 0 }}><ReportTable rows={rows} columns={[
    { ...textColumn('资产大类', 'category'), onCell: (row, index) => isSummary(row) ? { colSpan: 2, style: { background: row.name === '合计' ? token.colorPrimaryBg : token.colorFillAlter, fontWeight: 600 } } : { rowSpan: spans[index] },
      render: (_, row) => isSummary(row) ? row.name === '合计' ? '合计' : `${row.category}小计` : row.category },
    { ...textColumn('资产细类', 'name'), onCell: row => isSummary(row) ? { colSpan: 0 } : {} },
    { ...column('汇总', 'value', integer), onCell: row => isSummary(row) ? { style: { background: row.name === '合计' ? token.colorPrimaryBg : token.colorFillAlter, fontWeight: 600 } } : {} },
  ]} /></div>;
}
export function CompanyLossTable({ report }) {
  const spans = getGroupedRowSpans(report.companyLoss, 'company');
  return <ReportTable rowKey={r => `${r.company}-${r.year}`} rows={report.companyLoss} columns={[
    { ...textColumn('子公司', 'company', 180), onCell: (_, index) => ({ rowSpan: spans[index] }) }, textColumn('年份', 'year', 90),
    ...[['笔记本', 'notebook'], ['主机', 'desktop'], ['显示器', 'display']].map(([name, key]) => column(name, key, companyQuantity)),
    column('办公设备', 'office', companyQuantity), column('移动数码', 'mobile', companyQuantity), { ...column('照摄像器材及配件', 'camera', companyQuantity), width: 170 }, column('车辆', 'vehicle', companyQuantity), column('数量合计（件）', 'quantity', companyQuantity), column('净值合计（元）', 'net', companyAmount),
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
        textColumn('年份', 'year', 90),
        { title: '全部盘点资产情况', children: [column('数量（件）', 'quantity', integer), column('原值（元）', 'original', integer), column('净值（元）', 'net', integer)] },
        { title: '盘亏数量情况', children: [column('数量（件）', 'lossQuantity', integer), column('占全部盘点资产', 'lossRate', historyPercent)] },
        { title: '盘亏原值情况', children: [column('金额（元）', 'lossOriginal', integer), column('占全部盘点资产', 'lossOriginalRate', historyPercent)] },
        { title: '盘亏净值情况', children: [column('金额（元）', 'lossNet', accounting), column('占全部盘点资产', 'lossNetRate', historyPercent)] },
      ]} />
    </Card>
    <Card size="small" title={`${report.year}年资产盘亏统计`}>
      <ReportTable rows={categories} columns={[{ ...textColumn('资产类别', 'category', 230), onCell: (_, index) => ({ rowSpan: spans[index] }) }, textColumn('盘点年份', 'year', 100), column('盘亏数量（件）', 'quantity', accounting), column('盘亏原值（元）', 'original', accounting), column('盘亏净值（元）', 'net', accounting), { ...textColumn('备注', 'remark'), render: () => '-' }]} />
    </Card>
    <Card size="small" title={<span style={{ whiteSpace: 'normal' }}>{getIncrementTitle(report.year)}</span>} style={{ width: '100%', maxWidth: 652 }}><IncrementTable year={report.year} /></Card>
  </Space>;
}
export function DetailTable({ report }) {
  const rows = getInventoryDetailRows(report);
  const widths = { 序号: 70, 盘点状态: 90, 资产大类: 130, 资产小类: 160, 资产说明: 240, 数量: 90, 原值: 150, 报失当月资产净值: 170, 是否已赔偿: 110, 赔偿金额: 150, 损失: 150, 标签号: 180, 购买日期: 120, 责任人姓名: 120, 责任人编号: 130, 子公司: 160, 一级部门: 160, 说明: 220 };
  return <Card size="small" title="盘亏及待查明细" extra={`${report.detailsAreDemo ? "演示数据 · " : ""}共 ${report.details.length} 条`}>
    <Table size="small" bordered rowKey="key" dataSource={rows} pagination={false} columns={DETAIL_FIELDS.map((name, i) => ({
      title: name, dataIndex: name, key: name, width: widths[name],
      align: ['数量', '原值', '报失当月资产净值', '赔偿金额', '损失'].includes(name) ? 'right' : 'left',
      onCell: row => row.summary && i < 5 ? { colSpan: i === 0 ? 5 : 0 } : {},
      render: (value, row) => row.summary && i === 0 ? <strong>{row.label}</strong> : value == null ? '' : row.summary && value === 0 ? '-'
        : ['原值', '报失当月资产净值'].includes(name) ? accountingAmount(value) : ['赔偿金额', '损失'].includes(name) ? amount(value) : name === '数量' ? quantity(value) : value,
    }))} scroll={{ x: 'max-content' }} />
  </Card>;
}
