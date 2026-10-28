import React, { useState } from 'react';
import { Button, Result, Space, Tabs, Typography, message } from 'antd';
import { buildFinanceInventoryReport, exportFinanceInventoryReport } from '../../services/inventoryFinanceReportService';
import { FinanceDetailTable, FinanceSummaryTable } from './InventoryFinanceReportTables';
import { canAccessInventoryReport } from './inventoryReportAccess';
import { useInventoryOperator } from './useInventoryOperator';
import './inventoryReport.css';

export default function InventoryFinanceReport({ reportInput }) {
  const [operator] = useInventoryOperator();
  if (!canAccessInventoryReport(operator)) return <Result status="403" title="无权访问财务盘点报告" subTitle="请联系管理员核对菜单权限" />;
  return <FinanceReportContent reportInput={reportInput} />;
}

function FinanceReportContent({ reportInput }) {
  const [active, setActive] = useState('0');
  const [exporting, setExporting] = useState(false);
  let report;
  try { report = buildFinanceInventoryReport(reportInput); }
  catch (error) { return <Result status="warning" title={error.message} />; }
  const sheets = report.sheets;
  const download = async () => {
    setExporting(true);
    try { await exportFinanceInventoryReport(report); }
    catch (error) { message.error(`导出失败：${error.message}`); }
    finally { setExporting(false); }
  };
  return <main aria-label="财务盘点报告" className="inventory-report flex flex-col gap-4">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <Typography.Title level={4} className="!mb-0">财务盘点报告</Typography.Title>
      <Button loading={exporting} onClick={download}>导出</Button>
    </div>
    <Space orientation="vertical" size={16} className="w-full">
      <Tabs activeKey={active} onChange={setActive} items={sheets.map((sheet, index) => ({
        key: String(index), label: sheet.name,
        children: index === 0 ? <FinanceSummaryTable sheet={sheet} notes={report.notes} /> : <FinanceDetailTable sheet={sheet} />,
      }))} />
    </Space>
  </main>;
}
