import React, { useState } from 'react';
import { Button, Result, Space, Tabs, Typography } from 'antd';
import { getInventoryFinanceReportTemplate, inventoryFinanceTemplateUrl } from '../../services/inventoryFinanceReportService';
import { FinanceDetailTable, FinanceSummaryTable } from './InventoryFinanceReportTables';
import { canAccessInventoryReport } from './inventoryReportAccess';
import { useInventoryOperator } from './useInventoryOperator';
import './inventoryReport.css';

export default function InventoryFinanceReport() {
  const [operator] = useInventoryOperator();
  if (!canAccessInventoryReport(operator)) return <Result status="403" title="无权访问财务盘点报告" subTitle="请联系管理员核对菜单权限" />;
  return <FinanceReportContent />;
}

function FinanceReportContent() {
  const [active, setActive] = useState('0');
  const sheets = getInventoryFinanceReportTemplate();
  return <main aria-label="财务盘点报告" className="inventory-report flex flex-col gap-4">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <Typography.Title level={4} className="!mb-0">财务盘点报告</Typography.Title>
      <Button href={inventoryFinanceTemplateUrl()} download="年度盘点报告制作模板.xls">导出模板</Button>
    </div>
    <Space orientation="vertical" size={16} className="w-full">
      <Typography.Text type="secondary">模板预览 · 金额单位：元，保留两位小数</Typography.Text>
      <Tabs activeKey={active} onChange={setActive} items={sheets.map((sheet, index) => ({
        key: String(index), label: sheet.name,
        children: index === 0 ? <FinanceSummaryTable sheet={sheet} /> : <FinanceDetailTable sheet={sheet} />,
      }))} />
    </Space>
  </main>;
}
