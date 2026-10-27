import './inventoryReport.css';
import React, { useState } from 'react';
import { Button, Card, Empty, Result, Select, Space, Tabs, Typography, message } from 'antd';
import { exportInventoryReport, getInventoryReport, getInventoryReportProjects } from '../../services/inventoryReportService';
import { AnalysisTables, DetailTable } from './InventoryReportTables';
import InventoryReportCharts from './InventoryReportCharts';
import { canAccessInventoryReport } from './inventoryReportAccess';
import { useInventoryOperator } from './useInventoryOperator';

export default function AssetInventoryReportPage() {
  const [operator] = useInventoryOperator();
  if (!canAccessInventoryReport(operator)) return <Result status="403" title="无权访问盘点报表" subTitle="仅指定ES人员可查看盘点报表" />;
  return <InventoryReportContent />;
}

function InventoryReportContent() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [projectNo, setProjectNo] = useState(undefined);
  const [activeTab, setActiveTab] = useState('analysis');
  const projects = getInventoryReportProjects(year);
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
  return <div className="inventory-report flex flex-col gap-4">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <Typography.Title level={4} className="!mb-0">盘点报表</Typography.Title>
      <Space wrap><Typography.Text>盘点年份</Typography.Text><Select aria-label="盘点年份" style={{ width: 140 }} value={year} onChange={(value) => { setYear(value); setProjectNo(undefined); }} options={yearOptions.map(value => ({ label: `${value}年`, value }))} />
        {projects.length > 1 && <><Typography.Text>盘点项目</Typography.Text><Select aria-label="盘点项目" style={{ width: 260 }} placeholder="请选择盘点项目" value={projectNo} onChange={setProjectNo} options={projects.map(project => ({ label: `${project.projectNo} ${project.projectName}`, value: project.projectNo }))} /></>}
      </Space>
    </div>
    <div data-mmp-query-result>
      {!report ? <Card size="small"><Empty description={emptyDescription} /></Card> : <Space orientation="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between gap-4"><Typography.Text strong>{report.year}年度资产盘点报告（ES管控资产）</Typography.Text><Button onClick={download}>导出</Button></div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'analysis', label: '盘点结果比较分析', children: <AnalysisTables report={report} /> },
          { key: 'details', label: '盘亏及待查明细', children: <DetailTable report={report} /> },
          { key: 'charts', label: '年度报告图表', children: <InventoryReportCharts report={report} /> },
        ]} />
      </Space>}
    </div>
  </div>;
}
