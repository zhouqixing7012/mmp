import './inventoryReport.css';
import React, { useState } from 'react';
import { Button, Card, Empty, Result, Select, Space, Tabs, message } from 'antd';
import { exportInventoryReport, getInventoryReport, getInventoryReportProjects } from '../../services/inventoryReportService';
import { AnalysisTables, DetailTable } from './InventoryReportTables';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import InventoryReportCharts from './InventoryReportCharts';
import { canAccessInventoryReport } from './inventoryReportAccess';
import { useInventoryOperator } from './useInventoryOperator';

export default function AssetInventoryReportPage() {
  const [operator] = useInventoryOperator();
  if (!canAccessInventoryReport(operator)) return <Result status="403" title="无权访问盘点报表" subTitle="仅指定ES人员可查看盘点报表" />;
  return <InventoryReportContent />;
}

function InventoryReportContent() {
  const defaults = () => ({ year: new Date().getFullYear(), projectNo: undefined });
  const [draft, setDraft] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const { year, projectNo } = applied;
  const [activeTab, setActiveTab] = useState('analysis');
  const projects = getInventoryReportProjects(year);
  const draftProjects = draft.year === year ? projects : getInventoryReportProjects(draft.year);
  const selectedProject = projects.length === 1 ? projects[0] : projects.find(project => project.projectNo === projectNo);
  const projectReport = selectedProject?.report;
  const current = projectReport?.history?.find?.(row => row.year === Number(year));
  const completeProjectReport = projectReport && Number(projectReport.year) === Number(year)
    && ['history', 'indicators', 'distribution', 'companyLoss', 'details', 'categoryLoss', 'increments'].every(key => Array.isArray(projectReport[key]))
    && current && current.lossQuantity != null && current.lossNet != null;
  const report = projects.length === 0 ? getInventoryReport(year)
    : completeProjectReport ? { ...projectReport, projectNo: selectedProject.projectNo, period: `${year - 1}年7月—${year}年7月` }
      : null;
  const needsProject = projects.length > 1 && !selectedProject;
  const emptyDescription = needsProject ? '请选择盘点项目' : selectedProject ? projectReport ? '该项目报告数据不完整' : '该项目暂无盘点报告' : `${year}年暂无盘点报告`;
  const yearOptions = [...new Set([2022, 2023, 2024, 2025, 2026, new Date().getFullYear()])].sort((a, b) => a - b);
  const download = () => {
    try { exportInventoryReport(report); message.success('已导出盘点报表'); }
    catch (error) { message.error(`导出失败：${error.message}`); }
  };
  const unavailable = <Card size="small"><Empty description={emptyDescription} /></Card>;
  return <div className="inventory-report flex flex-col gap-4">
    <QueryBar singleFieldFullWidth={false} buttons={<>
      <Button onClick={() => { const next = defaults(); setDraft(next); setApplied(next); }}>重置</Button>
      <Button type="primary" onClick={() => setApplied({ ...draft })}>查询</Button>
      <Button disabled={!report} onClick={download}>导出</Button>
    </>}>
      <QueryItem label="盘点年份"><Select aria-label="盘点年份" style={{ width: '100%' }} value={draft.year}
        onChange={value => setDraft({ year: value, projectNo: undefined })} options={yearOptions.map(value => ({ label: `${value}年`, value }))} /></QueryItem>
      {draftProjects.length > 1 && <QueryItem label="盘点项目"><Select aria-label="盘点项目" style={{ width: '100%' }} placeholder="请选择盘点项目"
        value={draft.projectNo} onChange={value => setDraft(current => ({ ...current, projectNo: value }))}
        options={draftProjects.map(project => ({ label: `${project.projectNo} ${project.projectName}`, value: project.projectNo }))} /></QueryItem>}
    </QueryBar>
    <div data-mmp-query-result>
      <Space orientation="vertical" size={16} className="w-full">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'analysis', label: '盘点结果比较分析', children: report ? <AnalysisTables report={report} /> : unavailable },
          { key: 'details', label: '盘亏及待查明细', children: report ? <DetailTable report={report} /> : unavailable },
          { key: 'charts', label: '年度报告图表', children: report ? <InventoryReportCharts report={report} /> : unavailable },
        ]} />
      </Space>
    </div>
  </div>;
}
