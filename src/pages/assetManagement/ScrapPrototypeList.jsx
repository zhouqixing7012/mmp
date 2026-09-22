import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { ASSET_SCOPE_OPTIONS } from './scrapPrototypeData';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const EMPTY_FILTERS = {
  applicationNo: '',
  documentStatus: '',
  assetScope: '',
  company: '',
  dateRange: null,
};

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

export default function ScrapPrototypeList({
  config,
  records,
  onCreate,
  onOpen,
  onDeleteDrafts,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => records.filter((row) => {
    if (appliedFilters.applicationNo && !row.applicationNo.includes(appliedFilters.applicationNo.trim())) return false;
    if (appliedFilters.documentStatus && row.documentStatus !== appliedFilters.documentStatus) return false;
    if (appliedFilters.assetScope && row.assetScope !== appliedFilters.assetScope) return false;
    if (appliedFilters.company && !String(row.company).includes(appliedFilters.company.trim())) return false;

    if (appliedFilters.dateRange?.length === 2) {
      const value = dayjs(row.createdAt);
      if (
        value.isBefore(appliedFilters.dateRange[0], 'day')
        || value.isAfter(appliedFilters.dateRange[1], 'day')
      ) {
        return false;
      }
    }

    return true;
  }), [records, appliedFilters]);

  const columns = [
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      width: 180,
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => onOpen(record, false)}>
          {value}
        </Button>
      ),
    },
    {
      title: '单据状态',
      dataIndex: 'documentStatus',
      width: 120,
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '资产范围', dataIndex: 'assetScope', width: 120 },
    { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
    { title: '制单人', dataIndex: 'creator', width: 130 },
    { title: '制单时间', dataIndex: 'createdAt', width: 120 },
    { title: '资产数量', dataIndex: 'assetCount', width: 100, align: 'right' },
    { title: '当前节点', dataIndex: 'currentNode', width: 190, ellipsis: true },
    { title: '备注', dataIndex: 'remark', width: 220, ellipsis: true },
    {
      title: '操作',
      key: 'operation',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => onOpen(record, false)}>
            查看
          </Button>
          {['草稿', '已驳回'].includes(record.documentStatus) && (
            <Button type="link" size="small" onClick={() => onOpen(record, true)}>
              编辑
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Title level={3} className="!mb-0">{config.title}</Title>

      <QueryBar
        onQuery={() => setAppliedFilters({ ...filters })}
        onReset={() => {
          setFilters(EMPTY_FILTERS);
          setAppliedFilters(EMPTY_FILTERS);
        }}
      >
        <QueryItem label="申请单号">
          <Input
            value={filters.applicationNo}
            allowClear
            onChange={(event) => setFilters((current) => ({
              ...current,
              applicationNo: event.target.value,
            }))}
          />
        </QueryItem>

        <QueryItem label="单据状态">
          <Select
            value={filters.documentStatus || undefined}
            allowClear
            options={options(config.statuses)}
            onChange={(value) => setFilters((current) => ({
              ...current,
              documentStatus: value || '',
            }))}
          />
        </QueryItem>

        <QueryItem label="资产范围">
          <Select
            value={filters.assetScope || undefined}
            allowClear
            options={[...ASSET_SCOPE_OPTIONS, { label: '混合', value: '混合' }]}
            onChange={(value) => setFilters((current) => ({
              ...current,
              assetScope: value || '',
            }))}
          />
        </QueryItem>

        <QueryItem label="公司">
          <Input
            value={filters.company}
            allowClear
            onChange={(event) => setFilters((current) => ({
              ...current,
              company: event.target.value,
            }))}
          />
        </QueryItem>

        <QueryItem label="制单时间">
          <RangePicker
            value={filters.dateRange}
            className="w-full"
            onChange={(value) => setFilters((current) => ({
              ...current,
              dateRange: value,
            }))}
          />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="申请单列表"
        extra={<Text type="secondary">共 {filteredRows.length} 条</Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              {config.createLabel}
            </Button>

            <Popconfirm
              title="确认删除所选草稿？"
              disabled={selectedKeys.length === 0}
              onConfirm={() => {
                onDeleteDrafts(selectedKeys);
                setSelectedKeys([]);
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedKeys.length === 0}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
            fixed: true,
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}
