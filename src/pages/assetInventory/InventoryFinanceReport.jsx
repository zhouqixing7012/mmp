import React, { useState } from 'react';
import { Button, Card, Space, Tabs, Typography } from 'antd';
import { financeTemplateCellSpan, formatFinanceTemplateValue, getInventoryFinanceReportTemplate, inventoryFinanceTemplateUrl } from '../../services/inventoryFinanceReportService';
import './inventoryFinanceReport.css';

function FinanceTemplateTable({ sheet, summary }) {
  const headerRows = summary ? 5 : 2;
  const renderRow = (values, row) => <tr key={row}>
    {values.map((value, column) => {
      // 说明行在Excel中跨空白单元格显示，页面将其作为完整的报告说明。
      if (summary && row >= 23 && row <= 26 && column > 1) return null;
      const span = financeTemplateCellSpan(sheet, row, column);
      if (!span) return null;
      if (summary && row >= 23 && row <= 26 && column === 1) span.colSpan = 19;
      const Cell = row < headerRows ? 'th' : 'td';
      return <Cell key={column} {...span} className={typeof value === 'number' ? 'finance-template-number' : undefined}>
        {formatFinanceTemplateValue(value, column, summary)}
      </Cell>;
    })}
  </tr>;
  return <div className="finance-template-scroll" tabIndex={0} role="region" aria-label={`${sheet.name}模板表格`}>
    <table className="finance-template-table" aria-label={sheet.name}>
      <thead>{sheet.rows.slice(0, headerRows).map(renderRow)}</thead>
      <tbody>{sheet.rows.slice(headerRows).map((values, index) => renderRow(values, index + headerRows))}</tbody>
    </table>
  </div>;
}

export default function InventoryFinanceReport() {
  const [active, setActive] = useState('0');
  const sheets = getInventoryFinanceReportTemplate();
  return <Card size="small" title="财务盘点报告" extra={<Button href={inventoryFinanceTemplateUrl()} download="年度盘点报告制作模板.xls">导出模板</Button>}>
    <Space orientation="vertical" size={12} className="w-full">
      <Typography.Text type="secondary">模板预览 · 金额单位：元，保留两位小数</Typography.Text>
      <Tabs activeKey={active} onChange={setActive} items={sheets.map((sheet, index) => ({
        key: String(index), label: sheet.name, children: <FinanceTemplateTable sheet={sheet} summary={index === 0} />,
      }))} />
    </Space>
  </Card>;
}
