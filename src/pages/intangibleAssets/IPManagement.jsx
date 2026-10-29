import React, { useState } from 'react';
import { Button, Card, Input, Modal, Select, Space, Typography } from 'antd';
import StatusTag from '../../components/StatusTag';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';
import AutoWidthTable from '../../components/tableSizing/AutoWidthTable';
import { getIPDetail, getIPTypes, queryIPs } from '../../services/intangibleIPService';
import { basicFields, displayIPValue, relatedSections } from './ipFields';

const { Text } = Typography;
const pagination = { defaultPageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` };
export default function IPManagement() {
  const [filters, setFilters] = useState({ keyword: '', type: undefined });
  const [rows, setRows] = useState(() => queryIPs());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState(null);
  const [document, setDocument] = useState(null);
  const query = () => { setRows(queryIPs(filters)); setPage(1); };
  const reset = () => { setFilters({ keyword: '', type: undefined }); setRows(queryIPs()); setPage(1); };
  const openDetail = row => setDetail(getIPDetail(row.id));
  const columns = [
    { title: 'IP代码', dataIndex: 'code', render: (value, row) => <Button type="link" onClick={() => openDetail(row)}>{value}</Button> },
    { title: '名称', dataIndex: 'name', sizing: { type: 'text', flex: true } },
    { title: '类型', dataIndex: 'type' },
    ...[['作者', 'author'], ['题材', 'subject'], ['IP来源', 'source']].map(([title, key]) => ({ title, dataIndex: key, render: value => displayIPValue(value, key) })),
    { title: '评审状态', dataIndex: 'reviewStatus', render: value => <StatusTag value={value} type="business" /> },
    { title: '操作', key: 'actions', render: (_, row) => <Button type="link" onClick={() => openDetail(row)}>查看详情</Button>, sizing: { text: () => '查看详情' } },
  ];
  if (detail) return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Space data-mmp-page-title={(detail.name)}><Button onClick={() => setDetail(null)}>返回列表</Button><Text strong>{detail.name}</Text><Text type="secondary">{detail.code} · {detail.reviewStatus}</Text></Space>
      <Card title="IP基本信息" size="small">
        <DetailGrid>{basicFields.map(([label, key, span]) => <DetailItem key={key} label={label} span={span}>{displayIPValue(detail[key], key)}</DetailItem>)}</DetailGrid>
      </Card>
      {relatedSections.map(section => <Card key={section.key} title={section.title} size="small">
        <AutoWidthTable rowKey="id" dataSource={detail[section.key]} size="middle" locale={{ emptyText: `暂无${section.title}` }} pagination={pagination}
          columns={section.fields.map(([title, key]) => ({ title, dataIndex: key, sizing: { type: key === 'amount' ? 'number' : 'text', format: value => displayIPValue(value, key) }, align: key === 'amount' ? 'right' : undefined,
            render: (value, row) => key === 'name' ? <Button type="link" onClick={() => setDocument({ section, row })}>{value}</Button> : key === 'status' ? <StatusTag value={value} type="business" /> : displayIPValue(value, key) }))} />
      </Card>)}
      <Modal title={document?.section.title} open={Boolean(document)} onCancel={() => setDocument(null)} footer={<Button onClick={() => setDocument(null)}>关闭</Button>} width={960}>
        {document && <DetailGrid>{document.section.fields.map(([label, key]) => <DetailItem label={label} key={key}>{displayIPValue(document.row[key], key)}</DetailItem>)}</DetailGrid>}
      </Modal>
    </Space>
  );
  return <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
    <QueryBar onQuery={query} onReset={reset}>
      <QueryItem label="关键字"><Input allowClear value={filters.keyword} placeholder="请输入IP代码或名称" onChange={event => setFilters({ ...filters, keyword: event.target.value })} onPressEnter={query} /></QueryItem>
      <QueryItem label="类型"><Select allowClear placeholder="请选择" style={{ width: '100%' }} value={filters.type} options={getIPTypes().map(value => ({ label: value, value }))} onChange={type => setFilters({ ...filters, type })} /></QueryItem>
    </QueryBar>
    <Card size="small" title="IP">
      <AutoWidthTable rowKey="id" columns={columns} dataSource={rows} locale={{ emptyText: '暂无符合条件的IP' }}
        pagination={{ ...pagination, current: page, pageSize, onChange: (next, size) => { setPage(next); setPageSize(size); } }} />
    </Card>
  </Space>;
}
