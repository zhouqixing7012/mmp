import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
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
import { Download, Edit3, Search } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  getAssetMaintenanceRows,
  updateAssetMaintenanceRow,
} from '../../services/assetManagementService';

const EMPTY_FILTERS = {
  tag: '',
  company: '',
  department: '',
  ownerName: '',
  serialNumber: '',
  assetDesc: '',
  category: '',
  status: '',
  plate: '',
  costCenter: '',
  purpose: '',
  warehouse: '',
  assetType: '',
  mainTag: '',
};

const LOOKUP_CONFIG = {
  company: { title: '选择公司', label: '公司', sourceField: 'company' },
  department: { title: '选择部门', label: '部门', sourceField: 'department' },
  ownerName: { title: '选择资产责任人', label: '资产责任人', sourceField: 'ownerName' },
  category: { title: '选择资产类别', label: '资产类别', sourceField: 'majorCategory' },
  status: { title: '选择资产状态', label: '资产状态', sourceField: 'status' },
  costCenter: { title: '选择成本中心', label: '成本中心', sourceField: 'costCenter' },
  warehouse: { title: '选择仓库', label: '仓库', sourceField: 'warehouse' },
};

const TABLE_EXPORT_FIELDS = [
  ['标签号', 'tag'],
  ['公司', 'company'],
  ['板块', 'plate'],
  ['资产大类', 'majorCategory'],
  ['资产小类', 'minorCategory'],
  ['资产说明', 'assetDesc'],
  ['品牌', 'brand'],
  ['数量', 'quantity'],
  ['原值', 'originalValue'],
  ['净值', 'netValue'],
  ['资产责任人编号', 'ownerId'],
  ['资产责任人', 'ownerName'],
  ['资产状态', 'status'],
  ['成本中心', 'costCenter'],
  ['仓库', 'warehouse'],
  ['启用日期', 'enabledDate'],
  ['资产类型', 'assetType'],
];

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
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
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

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <Input
      value={value || ''}
      readOnly
      allowClear
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={onOpen}
      onClear={() => {}}
    />
  );
}

export default function AssetMaintenancePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => getAssetMaintenanceRows());
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [lookupKey, setLookupKey] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const plateOptions = useMemo(() => uniqueOptions(rows, 'plate'), [rows]);
  const purposeOptions = useMemo(() => uniqueOptions(rows, 'purpose'), [rows]);
  const assetTypeOptions = useMemo(() => uniqueOptions(rows, 'assetType'), [rows]);
  const statusOptions = useMemo(() => uniqueOptions(rows, 'status'), [rows]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.tag, appliedFilters.tag)
    && includesText(row.company, appliedFilters.company)
    && includesText(row.department, appliedFilters.department)
    && (includesText(row.ownerName, appliedFilters.ownerName) || includesText(row.ownerId, appliedFilters.ownerName))
    && includesText(row.serialNumber, appliedFilters.serialNumber)
    && includesText(row.assetDesc, appliedFilters.assetDesc)
    && (!appliedFilters.category
      || includesText(row.majorCategory, appliedFilters.category)
      || includesText(row.minorCategory, appliedFilters.category))
    && includesText(row.status, appliedFilters.status)
    && includesText(row.plate, appliedFilters.plate)
    && includesText(row.costCenter, appliedFilters.costCenter)
    && includesText(row.purpose, appliedFilters.purpose)
    && includesText(row.warehouse, appliedFilters.warehouse)
    && includesText(row.assetType, appliedFilters.assetType)
    && includesText(row.mainTag, appliedFilters.mainTag)
  )), [rows, appliedFilters]);

  const lookupData = useMemo(() => {
    const config = LOOKUP_CONFIG[lookupKey];
    if (!config) return [];
    return uniqueOptions(rows, config.sourceField).map((item, index) => ({
      id: `${lookupKey}-${index}`,
      value: item.value,
    }));
  }, [lookupKey, rows]);

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handleQuery = () => {
    setAppliedFilters({ ...draftFilters });
    setSelectedRowKeys([]);
  };

  const handleReset = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setSelectedRowKeys([]);
  };

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      messageApi.warning('请选择一条资产后再编辑');
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
    const values = await form.validateFields();
    const nextRows = updateAssetMaintenanceRow(editingRecord.id, values);
    setRows(nextRows);
    setEditOpen(false);
    setEditingRecord(null);
    setSelectedRowKeys([]);
    messageApi.success('资产信息已更新');
  };

  const handleExport = () => {
    if (filteredRows.length === 0) {
      messageApi.warning('当前没有可导出的数据');
      return;
    }
    const header = TABLE_EXPORT_FIELDS.map(([title]) => escapeCsv(title)).join(',');
    const body = filteredRows.map((row) => TABLE_EXPORT_FIELDS
      .map(([, field]) => escapeCsv(row[field]))
      .join(','));
    const csvContent = `\uFEFF${[header, ...body].join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `资产维护_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${filteredRows.length} 条资产数据`);
  };

  const columns = [
    { title: '标签号', dataIndex: 'tag', width: 150, fixed: 'left', render: displayText },
    { title: '公司', dataIndex: 'company', width: 130, render: displayText },
    { title: '板块', dataIndex: 'plate', width: 150, render: displayText },
    { title: '资产大类', dataIndex: 'majorCategory', width: 160, render: displayText },
    { title: '资产小类', dataIndex: 'minorCategory', width: 180, render: displayText },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220, render: displayText },
    { title: '品牌', dataIndex: 'brand', width: 100, render: displayText },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'right', render: displayText },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatAmount },
    { title: '净值', dataIndex: 'netValue', width: 110, align: 'right', render: formatAmount },
    { title: '资产责任人编号', dataIndex: 'ownerId', width: 150, render: displayText },
    { title: '资产责任人', dataIndex: 'ownerName', width: 180, render: displayText },
    {
      title: '资产状态',
      dataIndex: 'status',
      width: 130,
      render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-',
    },
    { title: '成本中心', dataIndex: 'costCenter', width: 160, render: displayText },
    { title: '仓库', dataIndex: 'warehouse', width: 140, render: displayText },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120, render: displayText },
    { title: '资产类型', dataIndex: 'assetType', width: 120, render: displayText },
  ];

  const activeLookup = LOOKUP_CONFIG[lookupKey];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <div className="flex items-center justify-between">
        <Typography.Title level={4} className="mb-0">资产维护</Typography.Title>
      </div>

      <QueryBar onQuery={handleQuery} onReset={handleReset}>
        <QueryItem label="标签号">
          <Input value={draftFilters.tag} placeholder="请输入标签号" allowClear onChange={(event) => updateDraftFilter('tag', event.target.value)} />
        </QueryItem>
        <QueryItem label="公司">
          <LookupInput value={draftFilters.company} placeholder="请选择公司" onOpen={() => setLookupKey('company')} />
        </QueryItem>
        <QueryItem label="部门">
          <LookupInput value={draftFilters.department} placeholder="请选择部门" onOpen={() => setLookupKey('department')} />
        </QueryItem>
        <QueryItem label="资产责任人">
          <LookupInput value={draftFilters.ownerName} placeholder="请选择资产责任人" onOpen={() => setLookupKey('ownerName')} />
        </QueryItem>
        <QueryItem label="序列号">
          <Input value={draftFilters.serialNumber} placeholder="请输入序列号" allowClear onChange={(event) => updateDraftFilter('serialNumber', event.target.value)} />
        </QueryItem>
        <QueryItem label="资产说明">
          <Input value={draftFilters.assetDesc} placeholder="请输入资产说明" allowClear onChange={(event) => updateDraftFilter('assetDesc', event.target.value)} />
        </QueryItem>
        <QueryItem label="资产类别">
          <LookupInput value={draftFilters.category} placeholder="请选择资产类别" onOpen={() => setLookupKey('category')} />
        </QueryItem>
        <QueryItem label="资产状态">
          <LookupInput value={draftFilters.status} placeholder="请选择资产状态" onOpen={() => setLookupKey('status')} />
        </QueryItem>
        <QueryItem label="板块">
          <Select value={draftFilters.plate || undefined} placeholder="请选择" allowClear options={plateOptions} onChange={(value) => updateDraftFilter('plate', value)} />
        </QueryItem>
        <QueryItem label="成本中心">
          <LookupInput value={draftFilters.costCenter} placeholder="请选择成本中心" onOpen={() => setLookupKey('costCenter')} />
        </QueryItem>
        <QueryItem label="用途">
          <Select value={draftFilters.purpose || undefined} placeholder="请选择" allowClear options={purposeOptions} onChange={(value) => updateDraftFilter('purpose', value)} />
        </QueryItem>
        <QueryItem label="仓库">
          <LookupInput value={draftFilters.warehouse} placeholder="请选择仓库" onOpen={() => setLookupKey('warehouse')} />
        </QueryItem>
        <QueryItem label="资产类型">
          <Select value={draftFilters.assetType || undefined} placeholder="请选择" allowClear options={assetTypeOptions} onChange={(value) => updateDraftFilter('assetType', value)} />
        </QueryItem>
        <QueryItem label="主资产标签号">
          <Input value={draftFilters.mainTag} placeholder="请输入主资产标签号" allowClear onChange={(event) => updateDraftFilter('mainTag', event.target.value)} />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="资产列表"
        extra={(
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={handleEdit}>编辑</Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>导出</Button>
          </Space>
        )}
      >
        <div className="mb-3 text-sm text-gray-500">共 {filteredRows.length} 条</div>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
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
        title={activeLookup?.title || ''}
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
        title={`编辑资产${editingRecord ? `：${editingRecord.tag}` : ''}`}
        open={editOpen}
        width={900}
        okText="保存"
        cancelText="取消"
        onOk={handleEditSave}
        onCancel={() => {
          setEditOpen(false);
          setEditingRecord(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}><Form.Item label="标签号"><Input value={editingRecord?.tag || ''} disabled /></Form.Item></Col>
            <Col span={8}><Form.Item label="公司"><Input value={editingRecord?.company || ''} disabled /></Form.Item></Col>
            <Col span={8}><Form.Item label="板块"><Input value={editingRecord?.plate || ''} disabled /></Form.Item></Col>
            <Col span={8}><Form.Item label="资产大类"><Input value={editingRecord?.majorCategory || ''} disabled /></Form.Item></Col>
            <Col span={8}><Form.Item label="资产小类"><Input value={editingRecord?.minorCategory || ''} disabled /></Form.Item></Col>
            <Col span={8}><Form.Item name="brand" label="品牌"><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="assetDesc" label="资产说明" rules={[{ required: true, message: '请输入资产说明' }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="ownerId" label="资产责任人编号"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="ownerName" label="资产责任人"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="资产状态"><Select allowClear options={statusOptions} /></Form.Item></Col>
            <Col span={8}><Form.Item name="costCenter" label="成本中心"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="warehouse" label="仓库"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="enabledDate" label="启用日期"><Input placeholder="YYYY-MM-DD" /></Form.Item></Col>
            <Col span={8}><Form.Item name="assetType" label="资产类型"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
