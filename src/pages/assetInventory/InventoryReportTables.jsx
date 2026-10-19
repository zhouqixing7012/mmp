import React from 'react';
import { Button, Card, Space, Table, Typography } from 'antd';
import { amount, percent, quantity, DETAIL_FIELDS, LOSS_CATEGORIES, getIncrementRows, getInventoryReportSummary } from '../../services/inventoryReportService';

export function ReportTable({ columns, rows, rowKey = 'key', ...props }) {
  return <Table size="small" bordered columns={columns} dataSource={rows} rowKey={rowKey} pagination={false} scroll={{ x: 'max-content' }} {...props} />;
}
const column = (title, dataIndex, render = quantity) => ({ title, dataIndex, key: dataIndex, render, align: 'right', width: 150 });
const textColumn = (title, dataIndex, width = 180) => ({ title, dataIndex, key: dataIndex, width });
export function IncrementTable() {
  return <ReportTable rows={getIncrementRows()} columns={[textColumn('资产大类', 'category'), textColumn('资产细类', 'name'), column('增量（件）', 'value')]} />;
}
export function CompanyLossTable({ report }) {
  return <ReportTable rowKey={r => `${r.company}-${r.year}`} rows={report.companyLoss} columns={[
    textColumn('子公司', 'company', 200), textColumn('年份', 'year', 90),
    ...['笔记本', '主机', '显示器'].map((name, i) => column(name, `missing${i}`)),
    column('办公设备', 'office'), column('移动数码', 'mobile'), column('照摄像器材及配件', 'camera'), column('车辆', 'vehicle'), column('数量合计（件）', 'quantity'), column('净值合计（元）', 'net', amount),
  ]} />;
}
export function AnalysisTables({ report, onDetails }) {
  const categories = LOSS_CATEGORIES.flatMap((category, i) => [report.year - 1, report.year].map(year => ({ key: `${i}-${year}`, category, year })));
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title={`${report.year}年资产盘点情况汇总`}>
      <ReportTable rowKey="name" rows={getInventoryReportSummary(report)} columns={[
        { ...textColumn('资产情况', 'name'), render: name => name === '全部盘点资产' ? name : <Button type="link" className="!p-0" onClick={() => onDetails(name === '盘亏资产' ? '盘亏' : '待查')}>{name}</Button> },
        { title: '资产管控方', key: 'manager', render: () => 'ES', width: 110 },
        { title: '数量', children: [column('数量（件）', 'quantity'), column('占全部盘点资产', 'quantityRate', percent)] },
        { title: '原值', children: [column('金额（元）', 'original', amount), column('占全部盘点资产', 'originalRate', percent)] },
        { title: `净值（截至${report.year}年6月30日）`, children: [column('金额（元）', 'net', amount), column('占全部盘点资产', 'netRate', percent)] },
      ]} />
      <Typography.Paragraph className="!mb-0 !mt-3" type="secondary">备注：-</Typography.Paragraph>
    </Card>
    <Card size="small" title="四年盘点数据对比">
      <ReportTable rowKey="year" rows={report.history} columns={[
        textColumn('年份', 'year', 90), { title: '资产管控方', key: 'manager', render: () => 'ES', width: 100 },
        { title: '全部盘点资产情况', children: [column('数量（件）', 'quantity'), column('原值（元）', 'original', amount), column('净值（元）', 'net', amount)] },
        { title: '盘亏数量情况', children: [column('数量（件）', 'lossQuantity'), column('占全部盘点资产', 'lossRate', v => v == null ? '-' : `${(v * 100).toFixed(3)}%`)] },
        { title: '盘亏原值情况', children: [column('金额（元）', 'lossOriginal', amount), column('占全部盘点资产', 'lossOriginalRate', percent)] },
        { title: '盘亏净值情况', children: [column('金额（元）', 'lossNet', amount), column('占全部盘点资产', 'lossNetRate', percent)] },
      ]} />
    </Card>
    <Card size="small" title={`${report.year}年资产盘亏统计`}>
      <ReportTable rows={categories} columns={[textColumn('资产类别', 'category', 230), { title: '资产管控方', key: 'manager', render: () => 'ES' }, textColumn('盘点年份', 'year', 100), column('盘亏数量（件）', 'quantity'), column('盘亏原值（元）', 'original', amount), column('盘亏净值（元）', 'net', amount), { ...textColumn('备注', 'remark'), render: () => '-' }]} />
    </Card>
    <Card size="small" title={`${report.year - 1}—${report.year}年各类资产增量`}><IncrementTable /></Card>
  </Space>;
}
export function DetailTable({ report, status }) {
  const rows = report.details.filter(row => status === '全部' || row['盘点状态'] === status);
  return <Card size="small" title="盘亏资产明细及原因" extra={`共 ${rows.length} 条`}>
    <Table size="small" bordered rowKey="标签号" dataSource={rows} columns={DETAIL_FIELDS.map((name, i) => ({
      title: name, dataIndex: name, key: name, width: i < 2 ? 90 : ['资产说明', '说明', '备注'].includes(name) ? 240 : 150,
      fixed: i < 2 ? 'left' : undefined,
      render: value => ['原值', '报失当月资产净值', '赔偿金额', '损失'].includes(name) ? amount(value) : value ?? '-',
    }))} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} locale={{ emptyText: '模板未提供实际盘亏及待查资产明细' }} />
    <ReportTable rows={(status === '全部' ? ['资产盘亏合计', '资产待查合计', '总计'] : [`资产${status}合计`]).map(name => ({ name }))} rowKey="name" columns={[textColumn('汇总', 'name'), column('数量（件）', 'quantity'), column('原值（元）', 'original', amount), column('报失当月净值（元）', 'net', amount)]} />
  </Card>;
}
