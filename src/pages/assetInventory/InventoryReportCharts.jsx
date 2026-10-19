import React from 'react';
import { Alert, Card, Space, theme } from 'antd';
import { CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { amount, percent } from '../../services/inventoryReportService';
import { CompanyLossTable, IncrementTable, ReportTable } from './InventoryReportTables';

export default function InventoryReportCharts({ report }) {
  const { token } = theme.useToken();
  const colors = [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorError, token.colorInfo, token.colorTextSecondary];
  const history = report.history.map(row => ({ ...row, originalWan: row.original == null ? null : row.original / 10000, netWan: row.net == null ? null : row.net / 10000, lossPercent: row.lossRate == null ? null : row.lossRate * 100 }));
  const pie = report.distribution.map((row, i) => ({ ...row, fill: colors[i] }));
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title="ES管控资产变化情况概述 · 四年资产变化">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={history} margin={{ top: 16, right: 30, left: 24, bottom: 8 }}>
          <CartesianGrid stroke={token.colorBorderSecondary} strokeDasharray="3 3" />
          <XAxis dataKey="year" /><YAxis yAxisId="value" width={85} label={{ value: '金额（万元）', position: 'insideTopLeft', offset: -8 }} /><YAxis yAxisId="quantity" orientation="right" width={80} label={{ value: '数量（件）', position: 'insideTopRight', offset: -8 }} />
          <Tooltip formatter={(v, name) => name.includes('数量') ? v : amount(v)} /><Legend />
          <Line yAxisId="value" dataKey="originalWan" name="盘点总原值（万元）" stroke={token.colorError} connectNulls={false} />
          <Line yAxisId="value" dataKey="netWan" name="盘点总净值（万元）" stroke={token.colorSuccess} connectNulls={false} />
          <Line yAxisId="quantity" dataKey="quantity" name="盘点总数量（件）" stroke={token.colorPrimary} />
        </ComposedChart>
      </ResponsiveContainer>
      <ReportTable rowKey="name" rows={report.indicators} columns={[
        { title: '指标', dataIndex: 'name', width: 200 },
        { title: '当前总数', dataIndex: 'total', align: 'right', render: (v, row) => row.name.includes('数量') ? v : amount(v) },
        { title: '年度增长量', dataIndex: 'change', align: 'right', render: (v, row) => row.name.includes('数量') ? v : amount(v) },
        { title: '年度增长率', dataIndex: 'rate', align: 'right', render: percent },
        { title: '增长率变化（百分点）', dataIndex: 'rateChange', align: 'right', render: v => v.toFixed(2) },
      ]} />
    </Card>
    <Card size="small" title="资产类型分布概况（按原值统计）">
      <ResponsiveContainer width="100%" height={340}>
        <PieChart><Pie data={pie} dataKey="original" nameKey="category" cx="50%" cy="46%" outerRadius={110} label={({ percent: p }) => `${(p * 100).toFixed(1)}%`} />
          <Tooltip formatter={v => [`${amount(v)} 元`, '原值']} /><Legend /></PieChart>
      </ResponsiveContainer>
      <ReportTable rowKey="category" rows={report.distribution} columns={[{ title: '资产类别', dataIndex: 'category' }, { title: '数量（件）', dataIndex: 'quantity', align: 'right' }, { title: '原值（元）', dataIndex: 'original', align: 'right', render: amount }]} />
    </Card>
    <Card size="small" title="资产增量情况"><IncrementTable /></Card>
    <Card size="small" title="ES管控资产盘点结果分析 · 资产盘亏情况">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={history} margin={{ top: 16, right: 30, left: 24, bottom: 8 }}>
          <CartesianGrid stroke={token.colorBorderSecondary} strokeDasharray="3 3" /><XAxis dataKey="year" />
          <YAxis yAxisId="rate" width={85} tickFormatter={v => `${v.toFixed(3)}%`} /><YAxis yAxisId="loss" orientation="right" width={60} />
          <Tooltip formatter={(v, name) => name.includes('占比') ? `${v.toFixed(3)}%` : `${v} 件`} /><Legend />
          <Line yAxisId="rate" dataKey="lossPercent" name="盘亏数量占比" stroke={token.colorError} />
          <Line yAxisId="loss" dataKey="lossQuantity" name="盘亏数量（件）" stroke={token.colorPrimary} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
    <Card size="small" title="盘亏分布（按子公司汇总）"><CompanyLossTable report={report} /></Card>
    <Alert type="info" showIcon title="图表及表格数值来自所附PPT示例。未提供的数据以空值展示，折线不跨缺失年份连接。" />
  </Space>;
}
