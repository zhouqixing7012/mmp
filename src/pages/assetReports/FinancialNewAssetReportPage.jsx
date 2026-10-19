import React, { useState } from 'react';
import { Button, Card, DatePicker, Space, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { financialAssetFields, financialAssetCompanies, queryFinancialNewAssets, totalFinancialNewAssets, formatFinancialAssetValue, exportFinancialNewAssets } from '../../services/financialNewAssetReportService';

const emptyFilters = () => ({ companies: [], dates: [] });
const widths = [180, 150, 250, 340, 90, 150, 150, 150, 130, 280, 180, 190, 150];
const numeric = ['数量', '原值', '税金', '含税金额'];
export default function FinancialNewAssetReportPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [rows, setRows] = useState(() => queryFinancialNewAssets());
  const [open, setOpen] = useState(false);
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
    <QueryBar buttons={<Space><Button type="primary" onClick={query}>查询</Button><Button onClick={reset}>重置</Button></Space>}>
      <QueryItem label="公司"><LookupInput value={draft.companies.join('、')} placeholder="请选择公司" onOpen={() => setOpen(true)} onClear={() => setDraft(previous => ({ ...previous, companies: [] }))} /></QueryItem>
      <QueryItem label="启用日期"><DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" allowEmpty={[true, true]} placeholder={['开始日期', '结束日期']}
        value={draft.dates.length ? draft.dates.map(value => value ? dayjs(value) : null) : null}
        onChange={dates => setDraft(previous => ({ ...previous, dates: dates ? dates.map(date => date ? date.format('YYYY-MM-DD') : null) : [] }))} /></QueryItem>
    </QueryBar>
    <Card size="small" title="查询结果" extra={<Space><Typography.Text>共 {rows.length} 条</Typography.Text><Button onClick={download}>导出</Button></Space>}>
      <Table rowKey="id" size="small" bordered dataSource={rows} scroll={{ x: 'max-content' }} locale={{ emptyText: '暂无数据' }}
        columns={financialAssetFields.map((field, index) => ({ title: field, dataIndex: ['values', field], key: field, width: widths[index], align: numeric.includes(field) ? 'right' : 'left',
          render: value => formatFinancialAssetValue(value, field) }))}
        pagination={{ ...page, showSizeChanger: true, showTotal: total => `共 ${total} 条`, onChange: (current, pageSize) => setPage({ current, pageSize }) }}
        summary={() => <Table.Summary.Row>{financialAssetFields.map((field, index) => <Table.Summary.Cell key={field} index={index} align={numeric.includes(field) ? 'right' : 'left'}>
          <strong>{index === 0 ? '合计' : numeric.includes(field) ? formatFinancialAssetValue(totals[field], field) : ''}</strong>
        </Table.Summary.Cell>)}</Table.Summary.Row>} />
    </Card>
    <SelectModal title="选择公司" open={open} onCancel={() => setOpen(false)} multiple rowKey="id" initialSelectedKeys={draft.companies}
      dataSource={financialAssetCompanies.map(company => ({ id: company, name: company }))} searchFields={[{ name: 'name', label: '公司', dataIndex: 'name' }]} columns={[{ title: '公司', dataIndex: 'name' }]}
      onConfirm={records => { setDraft(previous => ({ ...previous, companies: records.map(record => record.id) })); setOpen(false); }} />
  </div>;
}
