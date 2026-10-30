import React, { useState } from 'react';
import { Button, DatePicker, Result, Select, Space, Tabs, message } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
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
  const [applied, setApplied] = useState(filters);
  const options = getFinanceInventoryQueryOptions();
  const change = (field, value) => setFilters(current => ({ ...current, [field]: value }));
  const complete = Boolean(applied.company && applied.plates.length && applied.year);
  let report;
  try { report = buildFinanceInventoryReport(selectFinanceInventoryReportInput(reportInput, applied, options.companies)); }
  catch (error) { return <Result status="warning" title={error.message} />; }
  const sheets = report.sheets;
  const download = async () => {
    setExporting(true);
    try { await exportFinanceInventoryReport(report); }
    catch (error) { message.error(`导出失败：${error.message}`); }
    finally { setExporting(false); }
  };
  return <main aria-label="财务盘点报告" className="inventory-report flex flex-col gap-4">
    <QueryBar buttons={<>
      <Button onClick={() => { const next = { company: '', plates: [], year: new Date().getFullYear() }; setFilters(next); setApplied(next); }}>重置</Button>
      <Button type="primary" onClick={() => {
        if (!filters.company || !filters.plates.length) { message.warning('请选择子公司和板块'); return; }
        setApplied({ ...filters, plates: [...filters.plates] });
      }}>查询</Button>
      <Button disabled={!complete} loading={exporting} onClick={download}>导出</Button>
    </>}>
      <QueryItem label="子公司"><Select aria-label="子公司" showSearch allowClear optionFilterProp="label" placeholder="请选择子公司" style={{ width: '100%' }} value={filters.company || undefined} options={options.companies} onChange={value => change('company', value || '')} /></QueryItem>
      <QueryItem label="板块"><Select aria-label="板块" mode="multiple" showSearch allowClear optionFilterProp="label" placeholder="请选择板块" style={{ width: '100%' }} value={filters.plates} options={options.plates} onChange={value => change('plates', value)} /></QueryItem>
      <QueryItem label="年度"><DatePicker aria-label="年度" picker="year" allowClear={false} style={{ width: '100%' }} value={dayjs(`${filters.year}-01-01`)} onChange={value => { if (value) change('year', value.year()); }} /></QueryItem>
    </QueryBar>
    <Space orientation="vertical" size={16} className="w-full">
      <Tabs activeKey={active} onChange={setActive} items={sheets.map((sheet, index) => ({
        key: String(index), label: sheet.name,
        children: index === 0 ? <FinanceSummaryTable sheet={sheet} notes={report.notes} /> : <FinanceDetailTable sheet={sheet} />,
      }))} />
    </Space>
  </main>;
}
