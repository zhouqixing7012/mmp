import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Modal, Space, Table, Typography, message } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { exportReport, formatReportValue, getReportDefinition, queryReport, updateReportFilter } from '../../services/assetReportsService';
import ReportFilter from './ReportFilter';
import { DEFAULT_REPORT_ACCESS, assertReportAccess } from '../../services/assetReportAccess';

export default function AssetReportPage({ reportId, access = DEFAULT_REPORT_ACCESS }) {
  const definition = getReportDefinition(reportId);
  const [filters, setFilters] = useState({});
  const [applied, setApplied] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sort, setSort] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [detail, setDetail] = useState(null);
  const queryResult = useMemo(() => {
    try { return { rows: queryReport(reportId, applied, sort, access), error: null }; }
    catch (error) { return { rows: [], error: error.message }; }
  }, [reportId, applied, sort, access]);
  let accessError = null;
  try { assertReportAccess(access); } catch (error) { accessError = error.message; }
  if (accessError) return <div className="flex flex-col gap-4">
    <Typography.Title level={4} className="!mb-0">{definition.title}</Typography.Title>
    <Alert type="error" showIcon title={accessError} />
  </div>;
  const rows = queryResult.rows;
  const moreIndex = definition.moreStart ? definition.filters.findIndex(field => field.label === definition.moreStart) : -1;
  const visibleFilters = expanded || moreIndex < 0 ? definition.filters : definition.filters.slice(0, moreIndex);
  const onQuery = () => {
    try {
      queryReport(reportId, filters, sort, access);
      setApplied({ ...filters });
      setPagination(previous => ({ ...previous, current: 1 }));
      setSelectedKeys([]);
    } catch (error) { message.error(error.message); }
  };
  const clear = () => Modal.confirm({ title: '此操作将清除所有查询条件，确定清除吗？', okText: '确定', cancelText: '取消', onOk: () => setFilters({}) });
  const download = () => {
    try {
      queryReport(reportId, filters, sort, access);
      Modal.confirm({ title: selectedKeys.length && definition.selectRows ? `导出选中的 ${selectedKeys.length} 条记录？` : '导出当前条件下的所有数据到 Excel？',
        okText: '确定', cancelText: '取消', onOk: () => { exportReport(reportId, filters, selectedKeys, sort, access); message.success('导出完成'); } });
    } catch (error) { message.error(error.message); }
  };
  const columns = [
    { title: '序号', key: 'index', width: 70, fixed: 'left', render: (_, row, index) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    ...definition.columns.map(column => ({ title: column.label, key: column.key, dataIndex: ['values', column.key], width: 160,
      ellipsis: !['审批节点', '当前审批人', '当前审批人名称'].includes(column.key), align: ['money', 'moneyOptional', 'integer'].includes(column.format) ? 'right' : 'left',
      sorter: definition.sortable && !(reportId === 'report-8-1' && ['报废原值', '报废净值'].includes(column.key))
        && !(reportId === 'report-5-1' && ['含税金额', '资产所属板块', '资产账簿'].includes(column.key)),
      sortOrder: sort?.key === column.key ? sort.order : null,
      render: (value, record) => definition.selectRows && column.key === '耗材标签号'
        ? <Button type="link" className="!p-0" onClick={() => setDetail(record)}>{value}</Button>
        : ['审批节点', '当前审批人', '当前审批人名称'].includes(column.key)
          ? <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{formatReportValue(value, column.format)}</span>
          : formatReportValue(value, column.format),
    })),
  ];
  return <div className="flex flex-col gap-4">
    <Typography.Title level={4} className="!mb-0">{definition.title}</Typography.Title>
    <div onDoubleClick={event => { if (!event.target.closest('button')) clear(); }}>
      <QueryBar labelWidth={112} buttons={<Space wrap><Button type="primary" onClick={onQuery}>查询</Button><Button onClick={clear}>重置</Button>
        {moreIndex >= 0 && <Button type="link" onClick={() => setExpanded(value => !value)}>{expanded ? '收起' : '更多'}</Button>}</Space>}>
        {visibleFilters.map(field => <QueryItem key={field.label} label={field.label} labelWidth={112}>
          <ReportFilter definition={definition} field={field} filters={filters} access={access} onQuery={onQuery}
            onChange={(changed, value) => setFilters(previous => updateReportFilter(definition, previous, changed, value))} />
        </QueryItem>)}
      </QueryBar>
    </div>
    {queryResult.error && <Alert type="error" showIcon title={queryResult.error} />}
    <Card size="small" title="查询结果" extra={<Button disabled={Boolean(queryResult.error)} onClick={download}>{definition.exportLabel}</Button>}>
      <Table rowKey="id" size="small" bordered columns={columns} dataSource={rows} scroll={{ x: 'max-content' }}
        rowSelection={definition.selectRows ? { selectedRowKeys: selectedKeys, onChange: setSelectedKeys, preserveSelectedRowKeys: true } : undefined}
        locale={queryResult.error ? { emptyText: '数据条件未满足，暂无法显示结果' } : { emptyText: '暂无数据' }}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
        onChange={(next, _, sorter, extra) => {
          setPagination({ current: next.current, pageSize: next.pageSize });
          if (extra.action === 'sort') { setSort(sorter.order ? { key: sorter.columnKey, order: sorter.order } : null); setPagination(previous => ({ ...previous, current: 1 })); }
        }} />
    </Card>
    <Modal open={Boolean(detail)} title="耗材详情" width={960} onCancel={() => setDetail(null)} footer={null} destroyOnHidden>
      {detail && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definition.exportColumns.map(column => <div key={column.label}><Typography.Text type="secondary">{column.label}：</Typography.Text>
          <Typography.Text>{formatReportValue(detail.exports?.[column.key] ?? detail.values[column.key], column.format)}</Typography.Text></div>)}
      </div>}
    </Modal>
  </div>;
}
