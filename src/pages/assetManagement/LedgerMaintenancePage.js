import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Download, Edit3, Search } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

function createEmptyFilters(definitions) {
  return definitions.reduce((result, item) => ({ ...result, [item.field]: '' }), {});
}

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
}

function includesText(value, query) {
  if (!query) return true;
  return normalizeText(value).includes(normalizeText(query));
}

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function formatAmount(value) {
  if (value === '-' || value === undefined || value === null || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return displayText(value);
  return numeric.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function uniqueOptions(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter((value) => value && value !== '-'))]
    .map((value) => ({ label: value, value }));
}

function escapeCsv(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function normalizeDate(value) {
  if (!value || value === '-') return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <Input
      value={value || ''}
      readOnly
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={onOpen}
    />
  );
}

function buildColumns(definitions) {
  return definitions.map((item) => ({
    title: item.title,
    dataIndex: item.field,
    width: item.width,
    fixed: item.fixed,
    align: item.align,
    render: (value) => {
      if (item.type === 'amount') return formatAmount(value);
      if (item.type === 'status') {
        return value && value !== '-' ? <StatusTag value={value} type="business" /> : '-';
      }
      return displayText(value);
    },
  }));
}

export default function LedgerMaintenancePage({
  title,
  listTitle,
  itemName,
  tagField,
  getRows,
  updateRow,
  filterDefinitions,
  tableColumns,
  exportFields,
  editFields,
}) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => getRows());
  const [draftFilters, setDraftFilters] = useState(() => createEmptyFilters(filterDefinitions));
  const [appliedFilters, setAppliedFilters] = useState(() => createEmptyFilters(filterDefinitions));
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [lookupKey, setLookupKey] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const filteredRows = useMemo(() => rows.filter((row) => filterDefinitions.every((definition) => {
    const query = appliedFilters[definition.field];
    if (!query) return true;
    const sourceField = definition.sourceField || definition.field;

    if (definition.type === 'dateFrom' || definition.type === 'dateTo') {
      const targetDate = normalizeDate(row[sourceField]);
      if (!targetDate) return false;
      return definition.type === 'dateFrom' ? targetDate >= query : targetDate <= query;
    }

    const matchFields = definition.matchFields || [sourceField];
    return matchFields.some((field) => includesText(row[field], query));
  })), [rows, appliedFilters, filterDefinitions]);

  const activeLookup = filterDefinitions.find((item) => item.field === lookupKey && item.type === 'lookup');
  const lookupData = useMemo(() => {
    if (!activeLookup) return [];
    const sourceField = activeLookup.sourceField || activeLookup.field;
    return uniqueOptions(rows, sourceField).map((item, index) => ({
      id: `${lookupKey}-${index}`,
      value: item.value,
    }));
  }, [activeLookup, lookupKey, rows]);

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handleQuery = () => {
    setAppliedFilters({ ...draftFilters });
    setSelectedRowKeys([]);
  };

  const handleReset = () => {
    const empty = createEmptyFilters(filterDefinitions);
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setSelectedRowKeys([]);
  };

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      messageApi.warning(`请选择一条${itemName}后再编辑`);
      return;
    }
    const record = rows.find((item) => item.id === selectedRowKeys[0]);
    if (!record) return;
    setEditingRecord(record);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;
    let values;
    try {
      values = await form.validateFields();
    } catch (error) {
      return;
    }
    const nextRows = updateRow(editingRecord.id, values);
    setRows(nextRows);
    setEditOpen(false);
    setEditingRecord(null);
    setSelectedRowKeys([]);
    messageApi.success(`${itemName}信息已更新`);
  };

  const handleExport = () => {
    if (filteredRows.length === 0) {
      messageApi.warning('当前没有可导出的数据');
      return;
    }
    const header = exportFields.map(([label]) => escapeCsv(label)).join(',');
    const body = filteredRows.map((row) => exportFields
      .map(([, field]) => escapeCsv(row[field]))
      .join(','));
    const csvContent = `\uFEFF${[header, ...body].join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${filteredRows.length} 条${itemName}数据`);
  };

  const renderFilter = (definition) => {
    const value = draftFilters[definition.field];
    if (definition.type === 'lookup') {
      return (
        <LookupInput
          value={value}
          placeholder={definition.placeholder || `请选择${definition.label}`}
          onOpen={() => setLookupKey(definition.field)}
        />
      );
    }
    if (definition.type === 'select') {
      const sourceField = definition.sourceField || definition.field;
      return (
        <Select
          value={value || undefined}
          placeholder={definition.placeholder || '请选择'}
          allowClear
          options={uniqueOptions(rows, sourceField)}
          onChange={(next) => updateDraftFilter(definition.field, next)}
        />
      );
    }
    if (definition.type === 'dateFrom' || definition.type === 'dateTo') {
      return (
        <DatePicker
          value={value ? dayjs(value) : null}
          format="YYYY-MM-DD"
          placeholder="请选择日期"
          onChange={(date) => updateDraftFilter(definition.field, date ? date.format('YYYY-MM-DD') : '')}
        />
      );
    }
    return (
      <Input
        value={value}
        placeholder={definition.placeholder || `请输入${definition.label}`}
        allowClear
        onChange={(event) => updateDraftFilter(definition.field, event.target.value)}
      />
    );
  };

  const renderEditField = (field) => {
    const commonProps = { disabled: field.disabled };
    let control = <Input {...commonProps} placeholder={field.placeholder} />;
    if (field.type === 'number') {
      control = <InputNumber {...commonProps} min={field.min ?? 1} precision={0} style={{ width: '100%' }} />;
    } else if (field.type === 'select') {
      control = (
        <Select
          {...commonProps}
          allowClear
          options={uniqueOptions(rows, field.sourceField || field.field)}
        />
      );
    }
    return (
      <Col span={field.span || 8} key={field.field}>
        <Form.Item
          name={field.field}
          label={field.label}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
        >
          {control}
        </Form.Item>
      </Col>
    );
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <div className="flex items-center justify-between">
        <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
      </div>

      <QueryBar onQuery={handleQuery} onReset={handleReset}>
        {filterDefinitions.map((definition) => (
          <QueryItem key={definition.field} label={definition.label}>
            {renderFilter(definition)}
          </QueryItem>
        ))}
      </QueryBar>

      <Card
        size="small"
        title={listTitle}
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={handleEdit}>编辑</Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>导出</Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={buildColumns(tableColumns)}
          dataSource={filteredRows}
          rowSelection={{
            type: 'checkbox',
            columnTitle: '选择',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
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

      <SelectModal
        open={Boolean(activeLookup)}
        title={activeLookup?.lookupTitle || `选择${activeLookup?.label || ''}`}
        rowKey="id"
        dataSource={lookupData}
        searchFields={activeLookup ? [{ name: 'value', label: activeLookup.label, dataIndex: 'value' }] : []}
        columns={activeLookup ? [{ title: activeLookup.label, dataIndex: 'value' }] : []}
        onCancel={() => setLookupKey('')}
        onConfirm={(record) => {
          updateDraftFilter(lookupKey, record.value);
          setLookupKey('');
        }}
      />

      <Modal
        title={`编辑${itemName}${editingRecord ? `：${editingRecord[tagField]}` : ''}`}
        open={editOpen}
        width={900}
        okText="保存"
        cancelText="取消"
        onOk={handleEditSave}
        onCancel={() => {
          setEditOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {editFields.map(renderEditField)}
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
