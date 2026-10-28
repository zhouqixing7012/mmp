import React from 'react';
import { Card, Space, Typography, theme } from 'antd';
import { ReportTable } from './InventoryReportTables';
import { financeTemplateCellSpan, formatFinanceTemplateValue } from '../../services/inventoryFinanceReportService';

const amountColumns = new Set([2, 3, 6, 7, 10, 11, 14, 17]);
function column(sheet, index, title, summary) {
  const numeric = summary ? index >= 2 && ![16, 19].includes(index) : [5, 6, 9, 10].includes(index);
  const money = summary ? amountColumns.has(index) : [6, 9, 10].includes(index);
  const format = value => value === 'TOTAL' ? '合计' : formatFinanceTemplateValue(value, index, summary);
  return {
    title, key: `c${index}`, dataIndex: `c${index}`,
    sizing: { type: money ? 'money' : numeric ? 'number' : 'text', format },
    render: format,
    onCell: row => financeTemplateCellSpan(sheet, row.templateRow, index) || { rowSpan: 0, colSpan: 0 },
  };
}

function rows(sheet, first, last) {
  return sheet.rows.slice(first, last).map((values, index) => ({ key: index, templateRow: index + first,
    ...Object.fromEntries(values.map((value, column) => [`c${column}`, value])),
  }));
}

export function FinanceSummaryTable({ sheet }) {
  const { token } = theme.useToken();
  const leaf = (index, title) => column(sheet, index, title, true);
  const metric = (title, start) => ({ title, children: [
    { title: '价值（元）', children: [leaf(start, '按类小计'), leaf(start + 1, '合计')] },
    { title: '数量', children: [leaf(start + 2, '按类小计'), leaf(start + 3, '合计')] },
  ] });
  const columns = [
    { title: '资产类别', children: [leaf(0, '大类'), leaf(1, '小类')] },
    metric('台账统计（A）', 2), metric('盘点统计（B）', 6), metric('盘点差异统计（C=A-B）', 10),
    { title: '价值差异说明', children: [
      { title: '盘亏', children: [leaf(14, '价值合计（元）'), leaf(15, '数量合计'), leaf(16, '原因')] },
      { title: '待盘', children: [leaf(17, '价值合计（元）'), leaf(18, '数量合计'), leaf(19, '原因')] },
    ] },
  ];
  return <Space orientation="vertical" size={16} className="w-full">
    <Card size="small" title="盘点报告汇总">
      <ReportTable aria-label="盘点报告汇总" compact columns={columns} rows={rows(sheet, 5, 23)}
        onRow={row => row.c0 === 'TOTAL' ? { style: { background: token.colorFillAlter, fontWeight: 600 } } : {}} />
    </Card>
    <Card size="small" title="报告说明">
      <Typography.Paragraph>统计公司：—　统计截止日期：—　入库截止日期：—</Typography.Paragraph>
      <Typography.Paragraph>盘点差异统计：C = A − B。</Typography.Paragraph>
      <Typography.Paragraph className="!mb-0">报告时间：—　编制：—　复核：—　财务签字：—</Typography.Paragraph>
    </Card>
  </Space>;
}

export function FinanceDetailTable({ sheet }) {
  const columns = sheet.rows[1].map((title, index) => column(sheet, index, title, false));
  return <Card size="small" title={sheet.name}><ReportTable aria-label={sheet.name} compact columns={columns} rows={rows(sheet, 2)} /></Card>;
}
