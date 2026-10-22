import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Modal, Space, Table, Typography, message } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { exportApplications, formatApplicationValue, getApplicationDefinition, queryApplications, removeApplicationDrafts } from '../../services/applicationQueryService';
import ApplicationFilter from './ApplicationFilter';
import ApplicationProgress from './ApplicationProgress';
import LegacyApplicationDetail from './LegacyApplicationDetail';
import ClaimApplicationDetail from './ClaimApplicationDetail';
import EmployeeApplicationDetail from './EmployeeApplicationDetail';
import './applicationQueries.css';

export default function ApplicationQueryPage({ id }) {
  const definition = getApplicationDefinition(id);
  const [draft, setDraft] = useState({}), [applied, setApplied] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sort, setSort] = useState(null), [selection, setSelection] = useState([]);
  const [detail, setDetail] = useState(null), [progress, setProgress] = useState(null);
  const [, refresh] = useState(0);
  const rows = queryApplications(id, applied, sort);
  const goBack = useCallback(() => setDetail(null), []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: [
      { label: '首页' }, { label: '申请' }, { label: definition.title, onClick: detail ? goBack : undefined },
      ...(detail ? [{ label: detail.view === 'summary' ? '汇总详情' : '单据详情' }] : []),
    ] } }));
    return () => window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change', { detail: { items: null } }));
  }, [detail, definition.title, goBack]);
  const onQuery = () => {
    try { queryApplications(id, draft, sort); setApplied({ ...draft }); setPagination(value => ({ ...value, current: 1 })); setSelection([]); }
    catch (error) { message.error(error.message); }
  };
  const reset = () => { setDraft({}); setApplied({}); setSelection([]); setPagination(value => ({ ...value, current: 1 })); };
  const remove = () => Modal.confirm({ title: `确定删除所选 ${selection.length} 张草稿单据？`, okText: '删除', okButtonProps: { danger: true }, cancelText: '取消',
    onOk: () => { try { const result = removeApplicationDrafts(id, selection); setSelection([]); refresh(value => value + 1); message.success('提交 ' + result.submitted + ' 张，成功删除 ' + result.succeeded + ' 张'); } catch (error) { message.error(error.message); } } });
  const download = page => {
    try { exportApplications(id, applied, sort, page); message.success('导出完成'); } catch (error) { message.error(error.message); }
  };
  const identifierKey = definition.columns.find(column => column.action === 'detail')?.key || definition.columns[0]?.key;
  const identifierKeys = ['asset', 'consumable'].includes(id) ? ['subNo', 'applicationNo'] : [identifierKey];
  const displayColumns = [...definition.columns.filter(column => identifierKeys.includes(column.key)), ...definition.columns.filter(column => !identifierKeys.includes(column.key))];
  const columns = [{ title: '序号', key: 'index', width: 70, render: (_, row, index) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    ...displayColumns.map(column => ({ title: column.label, key: column.key, dataIndex: ['values', column.key],
      width: column.width || (column.action === 'progress' ? 100 : column.key === identifierKey ? 210 : column.format === 'money' ? 170 : column.format === 'date' ? 130 : ['status', 'applicant', 'approver', 'formalEmployee', 'overStandard'].includes(column.key) ? 130 : 180), ellipsis: !column.action,
      fixed: column.action === 'progress' ? 'right' : identifierKeys.includes(column.key) ? 'left' : undefined,
      sorter: Boolean(definition.sortable), render: (value, row) => column.action
        ? value || column.action === 'progress' ? <Button type="link" className="!p-0" onClick={() => column.action === 'progress' ? setProgress(row) : setDetail({ record: row, view: column.action })}>
          {column.action === 'progress' ? '查看' : value}</Button> : '-'
        : column.format === 'status' ? value == null || value === '' ? '-' : <StatusTag value={value} type="business" /> : value == null || (typeof value === 'string' && !value.trim()) ? '-' : formatApplicationValue(value, column.format),
    })),
    ...(id === 'unfinished' ? [{ title: '操作', key: 'operation', fixed: 'right', width: 100, render: (_, row) => row.allowProgress ? <Button type="link" className="!p-0" onClick={() => setProgress(row)}>查看流程</Button> : '-' }] : []),
  ];
  const Detail = definition.detailType === 'employee' ? EmployeeApplicationDetail : ['storage', 'return', 'borrow'].includes(id) ? LegacyApplicationDetail : ClaimApplicationDetail;
  return <div className="flex flex-col gap-4">
    {detail ? <Detail definition={definition} record={detail.record} view={detail.view} onBack={goBack} onProgress={setProgress} /> : <>
      <Typography.Title level={4} className="!mb-0">{definition.title}</Typography.Title>
      {id === 'unfinished' && <Alert type="info" title="每周一汇总当前台账的未完成员工申请，通知杨芊、王英、孙志强、刘建、何文。" description="发送时刻和渠道尚未配置；当前可查询、导出汇总清单，未发送实际通知。" />}
      {definition.knownFilterWarning && <Alert type="info" showIcon title={definition.knownFilterWarning} />}
      <QueryBar labelWidth={112} onQuery={onQuery} onReset={reset}>
        {definition.filters.map(field => <QueryItem key={field.key} label={field.label} labelWidth={112}>
          <ApplicationFilter definition={definition} field={field} value={draft[field.key]} onQuery={onQuery} onChange={value => setDraft(previous => ({ ...previous, [field.key]: value }))} />
        </QueryItem>)}
      </QueryBar>
      <Card size="small" title="查询结果" extra={<Space>
        {definition.actions.remove && <Button danger disabled={!selection.length} onClick={remove}>删除</Button>}
        {definition.actions.export && <Button onClick={() => download(null)}>导出</Button>}
        {(id === 'storage' || definition.actions.pageExport) && <Button onClick={() => download(pagination)}>导出当前页</Button>}
      </Space>}>
        <Table size="small" bordered rowKey="id" locale={{ emptyText: `暂无符合条件的${definition.title}` }} columns={columns} dataSource={rows} scroll={{ x: 'max-content' }}
          rowSelection={definition.actions.remove ? { selectedRowKeys: selection, onChange: setSelection, getCheckboxProps: row => ({ disabled: String(row.statusCode) !== '0' }) } : undefined}
          pagination={{ ...pagination, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
          onChange={(next, _, sorter, extra) => { setPagination({ current: next.current, pageSize: next.pageSize }); if (extra.action === 'sort') setSort(sorter.order ? { key: sorter.columnKey, order: sorter.order } : null); }} />
      </Card>
    </>}
    <ApplicationProgress record={progress} onClose={() => setProgress(null)} />
  </div>;
}
