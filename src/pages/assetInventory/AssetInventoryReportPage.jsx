import React, { useState } from 'react';
import { Button, Card, Empty, Result, Select, Space, Tabs, Typography, message } from 'antd';
import { exportInventoryReport, getInventoryReport } from '../../services/inventoryReportService';
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
  const [year, setYear] = useState(2026);
  const [activeTab, setActiveTab] = useState('analysis');
  const report = getInventoryReport(year);
  const download = () => {
    try { exportInventoryReport(report); message.success('已导出盘点报表'); }
    catch (error) { message.error(`导出失败：${error.message}`); }
  };
  return <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <Typography.Title level={4} className="!mb-0">盘点报表</Typography.Title>
      <Space><Typography.Text>盘点年份</Typography.Text><Select aria-label="盘点年份" style={{ width: 140 }} value={year} onChange={setYear} options={[2022, 2023, 2024, 2025, 2026].map(value => ({ label: `${value}年`, value }))} /></Space>
    </div>
    <div data-mmp-query-result>
      {!report ? <Card size="small"><Empty description={`${year}年暂无盘点报告`} /></Card> : <Space orientation="vertical" size={16} className="w-full">
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
