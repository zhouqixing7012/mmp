import React, { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QueryBar, { QueryItem } from '../../components/QueryBar';

const EMPTY_FILTERS = {
  applicationNo: '',
  documentStatus: '',
  company: '',
  createdFrom: '',
  createdTo: '',
};

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!value) return !from && !to;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function DateFilter({ value, onChange, placeholder }) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      format="YYYY-MM-DD"
      placeholder={placeholder}
      style={{ width: '100%' }}
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
    />
  );
}

export default function DocumentListPage({ title, createLabel, createPath, onCreate }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState([]);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.applicationNo, appliedFilters.applicationNo)
    && includesText(row.documentStatus, appliedFilters.documentStatus)
    && includesText(row.company, appliedFilters.company)
    && inDateRange(row.createdAt, appliedFilters.createdFrom, appliedFilters.createdTo)
  )), [rows, appliedFilters]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      return;
    }
    if (createPath) {
      navigate(createPath);
      return;
    }
    messageApi.info(`${title}新建页面字段待确认`);
  };

  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请先选择需要删除的申请单');
      return;
    }

    Modal.confirm({
      title: '确认删除所选申请单？',
      content: `共选择 ${selectedRowKeys.length} 条申请单。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selectedSet = new Set(selectedRowKeys);
        setRows((current) => current.filter((row) => !selectedSet.has(row.id)));
        setSelectedRowKeys([]);
        messageApi.success('已删除所选申请单');
      },
    });
  };

  const columns = [
    { title: '申请单', dataIndex: 'applicationNo', width: 220 },
    { title: '单据状态', dataIndex: 'documentStatus', width: 140 },
    { title: '公司', dataIndex: 'company', width: 180 },
    { title: '制单人', dataIndex: 'creator', width: 160 },
    { title: '制单时间', dataIndex: 'createdAt', width: 160 },
    { title: '资产数量', dataIndex: 'assetCount', width: 120, align: 'right' },
    { title: '备注', dataIndex: 'remark', width: 260 },
    { title: '操作', dataIndex: 'operation', width: 100, render: () => '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <div className="flex items-center gap-2">
        <div className="h-8 w-1.5 rounded bg-[#1677ff]" />
        <Typography.Title level={3} className="mb-0">{title}</Typography.Title>
      </div>

      <QueryBar
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setSelectedRowKeys([]);
        }}
        onReset={() => {
          setDraftFilters(EMPTY_FILTERS);
          setAppliedFilters(EMPTY_FILTERS);
          setSelectedRowKeys([]);
        }}
      >
        <QueryItem label="申请单号">
          <Input
            value={draftFilters.applicationNo}
            allowClear
            placeholder="请输入申请单号"
            onChange={(event) => updateFilter('applicationNo', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="单据状态">
          <Select
            value={draftFilters.documentStatus || undefined}
            allowClear
            placeholder="请选择"
            options={[]}
            onChange={(value) => updateFilter('documentStatus', value)}
          />
        </QueryItem>
        <QueryItem label="公司">
          <Input
            value={draftFilters.company}
            allowClear
            placeholder="请选择公司"
            suffix={<Search size={14} className="text-[#bfbfbf]" />}
            onChange={(event) => updateFilter('company', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="制单时间从">
          <DateFilter
            value={draftFilters.createdFrom}
            placeholder="开始日期"
            onChange={(value) => updateFilter('createdFrom', value)}
          />
        </QueryItem>
        <QueryItem label="制单时间至">
          <DateFilter
            value={draftFilters.createdTo}
            placeholder="结束日期"
            onChange={(value) => updateFilter('createdTo', value)}
          />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="申请单列表"
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={handleCreate}>{createLabel}</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={handleDelete}>删除</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </Space>
  );
}
