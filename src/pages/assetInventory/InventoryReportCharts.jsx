import React from 'react';
import { Card, Empty, Space, Typography, theme } from 'antd';
import { CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { amount, percent, integer, quantity, historyPercent, getInventoryHistoryChartRows } from '../../services/inventoryReportService';
import { CompanyLossTable, IncrementTable, ReportTable } from './InventoryReportTables';

function AxisUnits({ left, right }) {
  return <div className="flex justify-between mb-2"><Typography.Text type="secondary">{left}</Typography.Text><Typography.Text type="secondary">{right}</Typography.Text></div>;
}
export default function InventoryReportCharts({ report }) {
  const { token } = theme.useToken();
  const colors = [token.colorPrimary, token.colorSuccess, token.colorWarning, token.purple, token.cyan, token.colorTextSecondary, token.colorError];
  const history = getInventoryHistoryChartRows(report);
  const pie = report.distribution.map((row, i) => ({ ...row, fill: colors[i] }));
  const originalTotal = pie.reduce((sum, row) => sum + row.original, 0);
  const axis = { axisLine: false, tickLine: false, tick: { fill: token.colorTextSecondary, fontSize: 12 }, tickMargin: 12 };
  const line = { type: 'linear', strokeWidth: 2.5, connectNulls: false, dot: { r: 4, strokeWidth: 2, fill: token.colorBgContainer }, activeDot: { r: 6 } };
  const tooltip = { contentStyle: { borderRadius: token.borderRadiusLG, borderColor: token.colorBorderSecondary, boxShadow: token.boxShadowSecondary }, labelStyle: { color: token.colorText, marginBottom: 8 } };
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title="四年资产变化">
      <AxisUnits left="金额（百万元）" right="数量（件）" />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={history} margin={{ top: 16, right: 12, left: 4, bottom: 12 }}>
          <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="3 6" />
          <XAxis {...axis} dataKey="year" padding={{ left: 16, right: 16 }} />
          <YAxis {...axis} yAxisId="value" width={76} tickCount={5} />
          <YAxis {...axis} yAxisId="quantity" orientation="right" width={68} tickCount={5} allowDecimals={false} tickFormatter={quantity} />
          <Tooltip {...tooltip} formatter={(v, name) => name.includes('数量') ? `${integer(v)} 件` : `${amount(v)} 百万元`} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
          <Line {...line} yAxisId="value" dataKey="originalMillion" name="盘点总原值" stroke={token.colorPrimary} />
          <Line {...line} yAxisId="value" dataKey="netMillion" name="盘点总净值" stroke={token.colorSuccess} />
          <Line {...line} yAxisId="quantity" dataKey="quantity" name="盘点总数量" stroke={token.colorWarning} />
        </ComposedChart>
      </ResponsiveContainer>
      <ReportTable rowKey="name" rows={report.indicators} columns={[
        { title: '指标', dataIndex: 'name', width: 200 },
        { title: '当前总数', dataIndex: 'total', width: 140, align: 'right', render: (v, row) => quantity(v) },
        { title: '年度增长量', dataIndex: 'change', width: 140, align: 'right', render: (v, row) => quantity(v) },
        { title: '年度增长率', dataIndex: 'rate', width: 140, align: 'right', render: percent },
        { title: '增长率变化', dataIndex: 'rateChange', width: 190, align: 'right', render: v => percent(v == null ? null : v / 100) },
      ]} />
    </Card>
    <Card size="small" title="资产类型分布（按原值）" extra={report.distributionIsDemo ? <Typography.Text type="secondary">演示数据</Typography.Text> : report.distributionIsTemplate ? <Typography.Text type="secondary">模板数据</Typography.Text> : null}>
      {!pie.length ? <Empty description="暂无资产类型分布数据" /> :       <div className="flex flex-wrap items-center gap-6">
        <div className="relative" style={{ flex: '1 1 300px', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={pie} dataKey="original" nameKey="category" cx="50%" cy="50%" innerRadius={82} outerRadius={112} paddingAngle={3} cornerRadius={4} stroke="none" />
              <Tooltip {...tooltip} formatter={v => [`${amount(v / 10000)} 万元`, '原值']} /></PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Typography.Text type="secondary">资产总原值（万元）</Typography.Text>
            <Typography.Title level={4} className="!mb-0 !mt-1">{amount(originalTotal / 10000)}</Typography.Title>
          </div>
        </div>
        <div style={{ flex: '2 1 480px', minWidth: 0 }}>
          <ReportTable rowKey="category" rows={pie} columns={[
            { title: '资产类别', dataIndex: 'category', width: 200, render: (value, row) => <Space><span aria-hidden="true" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: row.fill }} />{value}</Space> },
            { title: '数量（件）', dataIndex: 'quantity', width: 100, align: 'right', render: quantity },
            { title: '原值（万元）', dataIndex: 'original', width: 150, align: 'right', render: value => amount(value / 10000) },
            { title: '原值占比', key: 'ratio', width: 100, align: 'right', render: (_, row) => originalTotal === 0 ? '' : percent(row.original / originalTotal) },
          ]} />
        </div>
      </div>}

    </Card>
    <Card size="small" title="资产增量情况" style={{ width: '100%', maxWidth: 652 }}><IncrementTable year={report.year} /></Card>
    <Card size="small" title="资产盘亏趋势">
      <AxisUnits left="盘亏占比（%）" right="盘亏数量（件）" />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={history} margin={{ top: 16, right: 12, left: 4, bottom: 12 }}>
          <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="3 6" />
          <XAxis {...axis} dataKey="year" padding={{ left: 16, right: 16 }} />
          <YAxis {...axis} yAxisId="rate" width={76} tickCount={5} tickFormatter={v => `${v.toFixed(3)}%`} />
          <YAxis {...axis} yAxisId="loss" orientation="right" width={68} tickCount={5} allowDecimals={false} tickFormatter={quantity} />
          <Tooltip {...tooltip} formatter={(v, name) => name.includes('占比') ? historyPercent(v / 100) : `${integer(v)} 件`} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
          <Line {...line} yAxisId="rate" dataKey="lossPercent" name="盘亏数量占比" stroke={token.colorPrimary} />
          <Line {...line} yAxisId="loss" dataKey="lossQuantity" name="盘亏数量" stroke={token.colorWarning} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
    <Card size="small" title="盘亏分布（按子公司汇总）" extra={report.companyIsDemo ? <Typography.Text type="secondary">演示数据</Typography.Text> : null}><CompanyLossTable report={report} /></Card>
  </Space>;
}
