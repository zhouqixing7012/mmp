import React from 'react';
import InventoryDistribution3D from './InventoryDistribution3D';
import { Card, Empty, Space, Typography, theme } from 'antd';
import { CartesianGrid, ComposedChart, LabelList, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { percent, integer, quantity, historyPercent, getInventoryHistoryChartRows } from '../../services/inventoryReportService';
import { distributionAmount, distributionPercent } from '../../services/inventoryReportFormats';
import { fixedStepAxis } from '../../services/inventoryReportChartLayout';
import { CompanyLossTable, IncrementTable, ReportTable } from './InventoryReportTables';

function AxisUnits({ left, right }) {
  return <div className="flex justify-between mb-2"><Typography.Text type="secondary">{left}</Typography.Text><Typography.Text type="secondary">{right}</Typography.Text></div>;
}
function DistributionLabel({ cx, cy, midAngle, outerRadius, name, value, payload }) {
  const angle = -midAngle * Math.PI / 180;
  const x = cx + (outerRadius + 18) * Math.cos(angle);
  const y = cy + (outerRadius + 18) * Math.sin(angle);
  return <text x={x} y={y} textAnchor={x >= cx ? 'start' : 'end'} fill="currentColor" fontSize={12}>
    <tspan x={x} dy="-0.3em">{name}</tspan>
    <tspan x={x} dy="1.3em">{`${Math.round(value / 10000)}万元(${Math.round(payload.quantity)}${payload.quantityUnit || ''})`}</tspan>
  </text>;
}

function DistributionTable({ rows, total }) {
  const pie = rows;
  const originalTotal = total;
  return (<ReportTable compact rowKey="category" rows={pie} columns={[
            { title: '资产类别', dataIndex: 'category', sizing: { type: 'label', text: row => `${row.category}　` }, ellipsis: true, render: (value, row) => <Space><span aria-hidden="true" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: row.fill }} />{value}</Space> },
            { title: '数量', dataIndex: 'quantity', sizing: { type: 'number', format: quantity }, align: 'right', render: quantity },
            { title: '原值（万元）', dataIndex: 'original', sizing: { type: 'money', format: distributionAmount }, align: 'right', render: distributionAmount },
            { title: '原值占比', key: 'ratio', sizing: { type: 'percent', text: row => originalTotal === 0 ? '' : distributionPercent(row.original / originalTotal) }, align: 'right', render: (_, row) => originalTotal === 0 ? '' : distributionPercent(row.original / originalTotal) },
          ]} />);
}

export default function InventoryReportCharts({ report }) {
  const { token } = theme.useToken();
  const colors = [token.colorPrimary, token.colorSuccess, token.colorWarning, token.purple, token.cyan, token.colorTextSecondary, token.colorError];
  const history = getInventoryHistoryChartRows(report);
  const pie = report.distribution.map((row, i) => ({ ...row, fill: colors[i] }));
  const amountAxis = fixedStepAxis(history.flatMap(row => [row.originalMillion, row.netMillion]), 20);
  const quantityAxis = fixedStepAxis(history.map(row => row.quantity), 500, false);
  const lossRateAxis = fixedStepAxis(history.map(row => row.lossPercent), 0.05);
  const lossQuantityAxis = fixedStepAxis(history.map(row => row.lossQuantity), 5);
  // 数量标签放在点的侧方，底部低值不会压到年份；最后一列向左留在绘图区。
  const quantityLabel = ({ x, y, value, index }) => value == null ? null : <text x={x + (index === history.length - 1 ? -12 : 12)} y={y + 4} textAnchor={index === history.length - 1 ? 'end' : 'start'} fill={token.colorText} fontSize={12} stroke={token.colorBgContainer} strokeWidth={3} paintOrder="stroke">{quantity(value)}</text>;
  const originalTotal = pie.reduce((sum, row) => sum + row.original, 0);
  const axis = { axisLine: false, tickLine: false, tick: { fill: token.colorTextSecondary, fontSize: 12 }, tickMargin: 12 };
  const line = { type: 'linear', strokeWidth: 2.5, connectNulls: false, dot: { r: 4, strokeWidth: 2, fill: token.colorBgContainer }, activeDot: { r: 6 } };
  const tooltip = { contentStyle: { borderRadius: token.borderRadiusLG, borderColor: token.colorBorderSecondary, boxShadow: token.boxShadowSecondary }, labelStyle: { color: token.colorText, marginBottom: 8 } };
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title="四年资产变化">
      <AxisUnits left="金额（百万元）" right="数量（件）" />
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={history} margin={{ top: 32, right: 24, left: 16, bottom: 24 }}>
          <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="3 6" />
          <XAxis {...axis} dataKey="year" padding={{ left: 16, right: 16 }} />
          <YAxis {...axis} yAxisId="value" width={76} {...amountAxis} tickFormatter={integer} />
          <YAxis {...axis} yAxisId="quantity" orientation="right" width={68} {...quantityAxis} allowDecimals={false} tickFormatter={quantity} />
          <Tooltip {...tooltip} formatter={(v, name) => name.includes('数量') ? `${integer(v)} 件` : `${quantity(v)} 百万元`} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
          <Line {...line} yAxisId="value" dataKey="originalMillion" name="盘点总原值" stroke={token.colorPrimary}><LabelList dataKey="originalMillion" position="top" offset={12} formatter={quantity} /></Line>
          <Line {...line} yAxisId="value" dataKey="netMillion" name="盘点总净值" stroke={token.colorSuccess}><LabelList dataKey="netMillion" position="top" offset={12} formatter={quantity} /></Line>
          <Line {...line} yAxisId="quantity" dataKey="quantity" name="盘点总数量" stroke={token.colorWarning}><LabelList dataKey="quantity" content={quantityLabel} /></Line>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center' }}><ReportTable compact rowKey="name" rows={report.indicators} columns={[
        { title: '指标', dataIndex: 'name', sizing: { type: 'label' }, ellipsis: true },
        { title: '当前总数', dataIndex: 'total', sizing: { type: 'number', format: quantity }, align: 'right', render: (v, row) => quantity(v) },
        { title: '年度增长量', dataIndex: 'change', sizing: { type: 'number', format: quantity }, align: 'right', render: (v, row) => quantity(v) },
        { title: '年度增长率', dataIndex: 'rate', sizing: { type: 'percent', format: percent }, align: 'right', render: percent },
        { title: '增长率变化', dataIndex: 'rateChange', sizing: { type: 'percent', format: value => percent(value == null ? null : value / 100) }, align: 'right', render: v => percent(v == null ? null : v / 100) },
      ]} /></div>
    </Card>
    <Card size="small" title="资产类型分布（按原值）"><section aria-label="资产类型分布原图">
      {!pie.length ? <Empty description="暂无资产类型分布数据" /> :       <div className="flex flex-wrap items-center gap-6">
        <div className="relative" style={{ flex: '1 1 480px', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart margin={{ top: 32, right: 80, bottom: 32, left: 80 }}><Pie data={pie.filter(row => row.original > 0)} dataKey="original" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} cornerRadius={4} stroke="none"
                label={DistributionLabel}>
                <LabelList dataKey="original" position="inside" fill="#fff" formatter={value => originalTotal === 0 ? '' : distributionPercent(value / originalTotal)} />
              </Pie>
              <Tooltip {...tooltip} formatter={v => [`${distributionAmount(v)} 万元`, '原值']} /></PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Typography.Text type="secondary">原值（万元）</Typography.Text>
            <Typography.Title level={4} className="!mb-0 !mt-1">{distributionAmount(originalTotal)}</Typography.Title>
          </div>
        </div>
        <div style={{ flex: '0 1 520px', minWidth: 0, marginLeft: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
          <DistributionTable rows={pie} total={originalTotal} />
        </div>
      </div>}

    </section></Card>
    <Card size="small" title="资产类型分布（按原值）—立体对比版">
      <InventoryDistribution3D rows={pie} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><DistributionTable rows={pie} total={originalTotal} /></div>
    </Card>
    <Card size="small" title="资产增量情况" style={{ width: '100%' }}><IncrementTable year={report.year} /></Card>
    <Card size="small" title="资产盘亏趋势">
      <AxisUnits left="盘亏占比（%）" right="盘亏数量（件）" />
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={history} margin={{ top: 32, right: 24, left: 16, bottom: 24 }}>
          <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="3 6" />
          <XAxis {...axis} dataKey="year" padding={{ left: 16, right: 16 }} />
          <YAxis {...axis} yAxisId="rate" width={76} {...lossRateAxis} tickFormatter={v => `${v.toFixed(3)}%`} />
          <YAxis {...axis} yAxisId="loss" orientation="right" width={68} {...lossQuantityAxis} allowDecimals={false} tickFormatter={quantity} />
          <Tooltip {...tooltip} formatter={(v, name) => name.includes('占比') ? historyPercent(v / 100) : `${integer(v)} 件`} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
          <Line {...line} yAxisId="rate" dataKey="lossPercent" name="盘亏数量占比" stroke={token.colorPrimary}><LabelList dataKey="lossPercent" position="top" offset={12} formatter={value => value == null ? '' : `${value.toFixed(3)}%`} /></Line>
          <Line {...line} yAxisId="loss" dataKey="lossQuantity" name="盘亏数量" stroke={token.colorWarning}><LabelList dataKey="lossQuantity" content={quantityLabel} /></Line>
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
    <Card size="small" title="盘亏分布（按子公司汇总）"><CompanyLossTable report={report} /></Card>
  </Space>;
}
