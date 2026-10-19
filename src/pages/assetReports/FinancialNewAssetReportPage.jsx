import React, { useState } from 'react';
import { Button, Card, DatePicker, Select, Space, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { ASSET_PLATE_OPTIONS } from '../../config/assetPlates';
import { financialAssetFields, getFinancialAssetCompanyOptions, queryFinancialNewAssets, totalFinancialNewAssets, formatFinancialAssetValue, exportFinancialNewAssets } from '../../services/financialNewAssetReportService';

const emptyFilters = () => ({ companies: [], plates: [], dates: [] });
const widths = [180, 180, 180, 150, 250, 340, 90, 150, 150, 150, 130, 280, 180, 190, 150];
const numeric = ['数量', '原值', '税金', '含税金额'];
export default function FinancialNewAssetReportPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [rows, setRows] = useState(() => queryFinancialNewAssets());
  const companyOptions = getFinancialAssetCompanyOptions();
  const [page, setPage] = useState({ current: 1, pageSize: 10 });
  const totals = totalFinancialNewAssets(rows);
  const query = () => {
    try { const result = queryFinancialNewAssets(draft); setApplied(draft); setRows(result); setPage(previous => ({ ...previous, current: 1 })); }
    catch (error) { message.error(error.message); }
  };
  const reset = () => { const filters = emptyFilters(); setDraft(filters); setApplied(filters); setRows(queryFinancialNewAssets(filters)); setPage(previous => ({ ...previous, current: 1 })); };
  const download = () => {
    try { exportFinancialNewAssets(applied); message.success('已导出固定资产新增报表'); }
    catch (error) { message.error(error.message); }
  };
  return <div className="flex flex-col gap-4">
    <Typography.Title level={4} className="!mb-0">固定资产新增报表</Typography.Title>
    <QueryBar onQuery={query} onReset={reset}>
      <QueryItem label="公司"><Select mode="multiple" aria-label="公司" showSearch optionFilterProp="label" allowClear style={{ width: '100%' }} placeholder="请选择公司" options={companyOptions} value={draft.companies} onChange={companies => setDraft(previous => ({ ...previous, companies }))} /></QueryItem>
      <QueryItem label="板块"><Select mode="multiple" aria-label="板块" showSearch optionFilterProp="label" allowClear style={{ width: '100%' }} placeholder="请选择板块" options={ASSET_PLATE_OPTIONS.map(value => ({ label: value, value }))} value={draft.plates} onChange={plates => setDraft(previous => ({ ...previous, plates }))} /></QueryItem>
      <QueryItem label="启用日期"><DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" allowEmpty={[true, true]} placeholder={['开始日期', '结束日期']}
        value={draft.dates.length ? draft.dates.map(value => value ? dayjs(value) : null) : null}
        onChange={dates => setDraft(previous => ({ ...previous, dates: dates ? dates.map(date => date ? date.format('YYYY-MM-DD') : null) : [] }))} /></QueryItem>
    </QueryBar>
    <Card size="small" title="查询结果" styles={{ extra: { maxWidth: 'calc(100% - 88px)' } }} extra={<Space wrap size={[16, 8]}>
      {numeric.map(field => <span key={field}><Typography.Text type="secondary">{field}合计：</Typography.Text><Typography.Text strong>{formatFinancialAssetValue(totals[field], field)}</Typography.Text></span>)}
      <Button onClick={download}>导出</Button></Space>}>
      <Table rowKey="id" size="small" bordered dataSource={rows} scroll={{ x: 'max-content' }} locale={{ emptyText: '暂无数据' }}
        columns={financialAssetFields.map((field, index) => ({ title: field, dataIndex: ['values', field], key: field, width: widths[index], align: numeric.includes(field) ? 'right' : 'left',
          render: value => formatFinancialAssetValue(value, field) }))}
        pagination={{ ...page, showSizeChanger: true, onChange: (current, pageSize) => setPage({ current, pageSize }) }} />
    </Card>

  </div>;
}
