import React, { useState } from 'react';
import { Button, DatePicker, Result, Select, Space, Tabs, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { buildFinanceInventoryReport, exportFinanceInventoryReport, getFinanceInventoryQueryOptions, selectFinanceInventoryReportInput } from '../../services/inventoryFinanceReportService';
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
  const [filters, setFilters] = useState(() => ({ company: reportInput?.companyCode || '', plates: reportInput?.plates || [], year: reportInput?.year || new Date().getFullYear() }));
  const options = getFinanceInventoryQueryOptions();
  const change = (field, value) => setFilters(current => ({ ...current, [field]: value }));
  const complete = Boolean(filters.company && filters.plates.length && filters.year);
  let report;
  try { report = buildFinanceInventoryReport(selectFinanceInventoryReportInput(reportInput, filters, options.companies)); }
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
      <Space wrap size={16}>
        <Space><Typography.Text>子公司</Typography.Text><Select aria-label="子公司" showSearch allowClear optionFilterProp="label" placeholder="请选择子公司" style={{ width: 240 }} value={filters.company || undefined} options={options.companies} onChange={value => change('company', value || '')} /></Space>
        <Space><Typography.Text>板块</Typography.Text><Select aria-label="板块" mode="multiple" showSearch allowClear optionFilterProp="label" placeholder="请选择板块" style={{ width: 260 }} value={filters.plates} options={options.plates} onChange={value => change('plates', value)} /></Space>
        <Space><Typography.Text>年度</Typography.Text><DatePicker aria-label="年度" picker="year" allowClear={false} style={{ width: 120 }} value={dayjs(`${filters.year}-01-01`)} onChange={value => { if (value) change('year', value.year()); }} /></Space>
      </Space>
      <Button disabled={!complete} loading={exporting} onClick={download}>导出</Button>
    </div>
    <Space orientation="vertical" size={16} className="w-full">
      <Tabs activeKey={active} onChange={setActive} items={sheets.map((sheet, index) => ({
        key: String(index), label: sheet.name,
        children: index === 0 ? <FinanceSummaryTable sheet={sheet} notes={report.notes} /> : <FinanceDetailTable sheet={sheet} />,
      }))} />
    </Space>
  </main>;
}
