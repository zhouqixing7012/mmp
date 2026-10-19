import React, { useState } from 'react';
import { Alert, Button, Card, Empty, Select, Space, Tabs, Typography, message } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { exportInventoryReport, getInventoryReport } from '../../services/inventoryReportService';
import { AnalysisTables, DetailTable } from './InventoryReportTables';
import InventoryReportCharts from './InventoryReportCharts';

const files = ['年度资产盘点报告模板（ES管控资产）.pptx', '年度资产盘点盘亏清单模版（ES管控资产）.xlsx'];
export default function AssetInventoryReportPage() {
  const [year, setYear] = useState(2025);
  const [appliedYear, setAppliedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState('analysis');
  const [detailStatus, setDetailStatus] = useState('全部');
  const report = getInventoryReport(appliedYear);
  const reset = () => { setYear(2025); setAppliedYear(2025); setDetailStatus('全部'); };
  const download = () => {
    try { exportInventoryReport(report); message.success('已导出模板示例报表'); }
    catch (error) { message.error(`导出失败：${error.message}`); }
  };
  const showDetails = status => { setDetailStatus(status); setActiveTab('details'); };
  return <div className="flex flex-col gap-4">
    <Typography.Title level={4} className="!mb-0">盘点报表</Typography.Title>
    <QueryBar onQuery={() => { setAppliedYear(year); setDetailStatus('全部'); }} onReset={reset}>
      <QueryItem label="盘点年份"><Select className="w-full" value={year} onChange={setYear} options={[2022, 2023, 2024, 2025, 2026].map(value => ({ label: `${value}年`, value }))} /></QueryItem>
      <QueryItem label="资产管控方">ES</QueryItem>
    </QueryBar>
    <Alert type="info" showIcon title="当前展示附件模板示例，尚未关联正式盘点项目。实际项目报告须在项目关闭后查看和导出。" />
    <Card size="small" title="原始模板" extra={<Space wrap>{files.map((file, index) => <Button key={file} href={`${process.env.PUBLIC_URL}/templates/asset-inventory/${encodeURIComponent(file)}`} download={file}>{index === 0 ? '下载报告模板（PPT）' : '下载盘亏清单模板（Excel）'}</Button>)}</Space>}>
      <Typography.Text type="secondary">ES数量按资产卡片数量之和统计；金额为人民币元。全量净值取当年6月末，盘亏明细净值取报失当月。</Typography.Text>
    </Card>
    <div data-mmp-query-result>
      {!report ? <Card size="small"><Empty description={`${appliedYear}年尚未提供完整报告，模板示例请查询2025年`} /></Card> : <Space orientation="vertical" size={16} className="w-full">
        <Card size="small" title={`${report.year}年度资产盘点报告（ES管控资产）`} extra={<Button onClick={download}>导出</Button>}>
          <Typography.Paragraph>资产变化周期：{report.period}</Typography.Paragraph>
          <Typography.Paragraph className="!mb-0">资产盘点类别：{report.scope}</Typography.Paragraph>
        </Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'analysis', label: '盘点结果比较分析', children: <AnalysisTables report={report} onDetails={showDetails} /> },
          { key: 'details', label: '盘亏及待查明细', children: <Space orientation="vertical" size={16} className="w-full">
            <Space><Typography.Text>盘点状态</Typography.Text><Select aria-label="盘点状态" style={{ width: 160 }} value={detailStatus} onChange={setDetailStatus} options={['全部', '盘亏', '待查'].map(value => ({ label: value, value }))} /></Space>
            <DetailTable report={report} status={detailStatus} />
          </Space> },
          { key: 'charts', label: '年度报告图表', children: <InventoryReportCharts report={report} /> },
        ]} />
      </Space>}
    </div>
  </div>;
}
