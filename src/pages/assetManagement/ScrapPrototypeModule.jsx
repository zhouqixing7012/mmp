import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import ScrapWorkflowCard from './ScrapWorkflowCard';
import {
  ASSET_SCOPE_OPTIONS,
  SCRAP_ASSET_POOL,
  SCRAP_TYPE_OPTIONS,
  filterAssetsForScope,
  getInitialBusinessRows,
  money,
} from './scrapPrototypeData';
import {
  mockCompanies,
  mockCostCenters,
  mockPlates,
  mockWarehouseInfoData,
} from '../../mock/businessRulesMock';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const MODULES = {
  crossCompany: {
    title: '跨公司转移',
    createLabel: '创建跨公司转移申请单',
    statuses: ['草稿', '审批中', '已驳回', '已完成'],
  },
  scrap: {
    title: '资产报废',
    createLabel: '创建资产报废申请单',
    statuses: ['草稿', '审批中', '已驳回', '已审批'],
  },
  accounting: {
    title: '账面报废',
    createLabel: '创建账面报废申请单',
    statuses: ['草稿', '审批中', '已驳回', '待提单人确认', '已完成'],
  },
  disposal: {
    title: '资产处置',
    createLabel: '创建资产处置申请单',
    statuses: ['草稿', '审批中', '处理中', '已驳回', '已完成'],
  },
};

const EMPTY_FILTERS = {
  applicationNo: '',
  documentStatus: '',
  assetScope: '',
  company: '',
  dateRange: null,
};

const companyOptions = mockCompanies.map((item) => ({
  label: `${item.code}.${item.desc}`,
  value: `${item.code}.${item.desc}`,
}));
const plateOptions = mockPlates.map((item) => ({
  label: `${item.code}.${item.desc}`,
  value: `${item.code}.${item.desc}`,
}));
const costCenterOptions = mockCostCenters.map((item) => ({
  label: `${item.code}.${item.desc}`,
  value: `${item.code}.${item.desc}`,
}));
const warehouseOptions = mockWarehouseInfoData
  .filter((item) => item.enabled)
  .map((item) => ({
    label: `${item.code}.${item.desc}`,
    value: `${item.code}.${item.desc}`,
  }));

function defaultForm(type) {
  return {
    applicationNo: '',
    documentStatus: '草稿',
    creator: type === 'accounting' ? '吕静' : type === 'disposal' ? 'ES专员' : '当前登录人',
    applicationDate: dayjs().format('YYYY-MM-DD'),
    company: '114.新媒体',
    assetScope: type === 'accounting' ? '混合' : type === 'scrap' ? '机房资产' : '办公设备',
    remark: '',
    description: '',
    scrapMethod: '全部报废',
    disposedComplete: '否',
    region: '北京',
    needsCleaning: '否',
    sourceType: '待报废池',
    manualScenario: '',
    quoteReceiver: '采购专员',
    supplier: '',
    quoteAmount: null,
    currentNode: '',
  };
}

function nextNode(type, form, assets) {
  if (type === 'crossCompany') return form.assetScope === '办公设备' ? 'ES主管确认' : '5级及以上直属领导';
  if (type === 'scrap') {
    if (form.assetScope === '机房资产') return '专家评估';
    if (form.assetScope === '软件') return '5级及以上直属领导';
    return ['PC', 'NOTEBOOK'].includes(assets[0]?.majorCategory) ? 'MIS鉴定' : 'ES主管确认';
  }
  if (type === 'accounting') return '财务初审';
  return form.assetScope === '机房资产' ? '采购专员协办' : 'ES二级审批';
}

function recordStatus(type) {
  return type === 'disposal' ? '处理中' : '审批中';
}

function createApplicationNo(type) {
  const prefix = type === 'crossCompany' ? 'CT' : type === 'scrap' ? 'BF' : type === 'accounting' ? 'ZMBF' : 'CZ';
  return `${prefix}${dayjs().format('YYYYMMDDHHmmss')}`;
}

function fieldOptions(values) {
  return values.map((value) => ({ label: value, value }));
}

export default function ScrapPrototypeModule({ type }) {
  const config = MODULES[type];
  const [view, setView] = useState('list');
  const [records, setRecords] = useState(() => getInitialBusinessRows(type));
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [form, setForm] = useState(() => defaultForm(type));
  const [assets, setAssets] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const filteredRows = useMemo(() => records.filter((row) => {
    if (appliedFilters.applicationNo && !row.applicationNo.includes(appliedFilters.applicationNo.trim())) return false;
    if (appliedFilters.documentStatus && row.documentStatus !== appliedFilters.documentStatus) return false;
    if (appliedFilters.assetScope && row.assetScope !== appliedFilters.assetScope) return false;
    if (appliedFilters.company && !String(row.company).includes(appliedFilters.company.trim())) return false;
    if (appliedFilters.dateRange?.length === 2) {
      const value = dayjs(row.createdAt);
      if (value.isBefore(appliedFilters.dateRange[0], 'day') || value.isAfter(appliedFilters.dateRange[1], 'day')) return false;
    }
    return true;
  }), [records, appliedFilters]);

  const pickerAssets = useMemo(() => (
    type === 'accounting' || form.assetScope === '混合'
      ? SCRAP_ASSET_POOL
      : filterAssetsForScope(form.assetScope)
  ), [type, form.assetScope]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setForm(defaultForm(type));
    setAssets([]);
    setReadOnly(false);
    setView('form');
  };

  const openRecord = (record, editable = false) => {
    setForm({
      ...defaultForm(type),
      ...record,
      applicationDate: record.createdAt,
      documentStatus: record.documentStatus,
      currentNode: record.currentNode,
    });
    const candidates = record.assetScope === '混合'
      ? SCRAP_ASSET_POOL
      : filterAssetsForScope(record.assetScope);
    setAssets(candidates.slice(0, Math.min(3, Math.max(1, record.assetCount || 1))).map((item) => ({
      ...item,
      scrapMethod: type === 'crossCompany' ? '调账' : '全部报废',
      scrapType: '已到报废期',
      reason: record.remark || '',
      dataCleaning: item.scope === '机房资产' ? '否' : undefined,
    })));
    setReadOnly(!editable);
    setView('form');
  };

  const deleteDrafts = () => {
    const selected = records.filter((item) => selectedKeys.includes(item.id));
    if (selected.some((item) => item.documentStatus !== '草稿')) {
      message.warning('仅草稿单据允许删除');
      return;
    }
    setRecords((current) => current.filter((item) => !selectedKeys.includes(item.id)));
    setSelectedKeys([]);
    message.success('删除成功');
  };

  const addAssets = (selected) => {
    const existing = new Set(assets.map((item) => item.id));
    const next = selected
      .filter((item) => !existing.has(item.id))
      .map((item) => ({
        ...item,
        scrapMethod: type === 'crossCompany' ? '调账' : form.scrapMethod,
        scrapType: '已到报废期',
        reason: '',
        dataCleaning: item.scope === '机房资产' ? '否' : undefined,
        newCompany: '',
        newPlate: '',
        newCostCenter: '',
        newResponsiblePerson: '',
        targetWarehouse: '',
        targetCity: '',
        targetBuilding: '',
        targetFloor: '',
      }));
    setAssets((current) => [...current, ...next]);
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const saveRecord = (submit = false) => {
    if (assets.length === 0) {
      message.error('请至少添加一条资产明细');
      return;
    }
    if (type === 'crossCompany') {
      const invalid = assets.find((item) => (
        !item.newCompany || !item.newPlate || !item.newCostCenter || !item.newResponsiblePerson
        || !item.targetCity || !item.targetBuilding || !item.targetFloor
      ));
      if (invalid) {
        message.error(`资产 ${invalid.tagNo} 的调账目标信息未填写完整`);
        return;
      }
    }
    if (type === 'scrap' && !form.description.trim()) {
      message.error('请填写报废说明');
      return;
    }
    if (type === 'accounting' && form.sourceType === '手动导入' && !form.manualScenario) {
      message.error('请选择手动导入业务类型');
      return;
    }
    if (type === 'disposal' && form.assetScope === '办公设备' && (!form.supplier || !form.quoteAmount)) {
      message.error('请填写回收供应商和报价金额');
      return;
    }

    const applicationNo = form.applicationNo || createApplicationNo(type);
    const status = submit ? recordStatus(type) : '草稿';
    const currentNode = submit ? nextNode(type, form, assets) : '草稿';
    const nextRecord = {
      id: form.id || `${type}-${applicationNo}`,
      applicationNo,
      documentStatus: status,
      assetScope: type === 'accounting'
        ? (new Set(assets.map((item) => item.scope)).size > 1 ? '混合' : assets[0].scope)
        : form.assetScope,
      company: form.company,
      creator: form.creator,
      createdAt: form.applicationDate,
      assetCount: assets.length,
      currentNode,
      remark: form.remark || form.description,
    };

    setRecords((current) => {
      const exists = current.some((item) => item.id === nextRecord.id);
      return exists
        ? current.map((item) => (item.id === nextRecord.id ? nextRecord : item))
        : [nextRecord, ...current];
    });
    message.success(submit ? '提交成功' : '草稿保存成功');
    setView('list');
  };

  const columns = [
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      width: 180,
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => openRecord(record, false)}>{value}</Button>
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
          <Button type="link" size="small" onClick={() => openRecord(record, false)}>查看</Button>
          {['草稿', '已驳回'].includes(record.documentStatus) && (
            <Button type="link" size="small" onClick={() => openRecord(record, true)}>编辑</Button>
          )}
        </Space>
      ),
    },
  ];

  const baseAssetColumns = [
    { title: '资产标签号', dataIndex: 'tagNo', width: 150, fixed: 'left' },
    { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
    { title: '资产小类', dataIndex: 'minorCategory', width: 190, ellipsis: true },
    { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '责任人', dataIndex: 'responsiblePerson', width: 150 },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
  ];

  const crossCompanyColumns = [
    ...baseAssetColumns,
    {
      title: '新公司',
      dataIndex: 'newCompany',
      width: 180,
      render: (value, record) => <Select disabled={readOnly} value={value || undefined} options={companyOptions} className="w-full" onChange={(v) => updateAsset(record.id, 'newCompany', v)} />,
    },
    {
      title: '新板块',
      dataIndex: 'newPlate',
      width: 180,
      render: (value, record) => <Select disabled={readOnly} value={value || undefined} options={plateOptions} className="w-full" onChange={(v) => updateAsset(record.id, 'newPlate', v)} />,
    },
    {
      title: '新成本中心',
      dataIndex: 'newCostCenter',
      width: 190,
      render: (value, record) => <Select disabled={readOnly} value={value || undefined} options={costCenterOptions} className="w-full" onChange={(v) => updateAsset(record.id, 'newCostCenter', v)} />,
    },
    {
      title: '新责任人',
      dataIndex: 'newResponsiblePerson',
      width: 150,
      render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'newResponsiblePerson', e.target.value)} />,
    },
    {
      title: 'City',
      dataIndex: 'targetCity',
      width: 130,
      render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'targetCity', e.target.value)} />,
    },
    {
      title: 'Building',
      dataIndex: 'targetBuilding',
      width: 150,
      render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'targetBuilding', e.target.value)} />,
    },
    {
      title: 'Floor',
      dataIndex: 'targetFloor',
      width: 110,
      render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'targetFloor', e.target.value)} />,
    },
    {
      title: '调账后仓库',
      dataIndex: 'targetWarehouse',
      width: 210,
      render: (value, record) => <Select disabled={readOnly} allowClear value={value || undefined} options={warehouseOptions} className="w-full" onChange={(v) => updateAsset(record.id, 'targetWarehouse', v || '')} />,
    },
  ];

  const scrapColumns = [
    ...baseAssetColumns,
    {
      title: '报废数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => <InputNumber disabled={readOnly} min={1} max={record.quantity || 1} value={value} onChange={(v) => updateAsset(record.id, 'quantity', v)} />,
    },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => <Select disabled={readOnly} value={value} options={SCRAP_TYPE_OPTIONS} className="w-full" onChange={(v) => updateAsset(record.id, 'scrapType', v)} />,
    },
    {
      title: '数据清洗',
      dataIndex: 'dataCleaning',
      width: 110,
      render: (value, record) => record.scope === '机房资产'
        ? <Select disabled={readOnly} value={value || '否'} options={fieldOptions(['是', '否'])} className="w-full" onChange={(v) => updateAsset(record.id, 'dataCleaning', v)} />
        : '-',
    },
    {
      title: '报废原因',
      dataIndex: 'reason',
      width: 200,
      render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'reason', e.target.value)} />,
    },
  ];

  const accountingColumns = [
    ...baseAssetColumns,
    { title: '原值', dataIndex: 'originalValue', width: 120, align: 'right', render: money },
    { title: '净值', dataIndex: 'netValue', width: 120, align: 'right', render: money },
    {
      title: '报废方式',
      dataIndex: 'scrapMethod',
      width: 120,
      render: (value, record) => <Select disabled={readOnly} value={value} options={fieldOptions(['全部报废', '部分报废', '调账'])} className="w-full" onChange={(v) => updateAsset(record.id, 'scrapMethod', v)} />,
    },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => <Select disabled={readOnly} value={value} options={SCRAP_TYPE_OPTIONS} className="w-full" onChange={(v) => updateAsset(record.id, 'scrapType', v)} />,
    },
    { title: '报废原因', dataIndex: 'reason', width: 200, render: (value, record) => <Input disabled={readOnly} value={value} onChange={(e) => updateAsset(record.id, 'reason', e.target.value)} /> },
  ];

  const disposalColumns = [
    ...baseAssetColumns,
    { title: '原值', dataIndex: 'originalValue', width: 120, align: 'right', render: money },
    { title: '净值', dataIndex: 'netValue', width: 120, align: 'right', render: money },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'Building', dataIndex: 'building', width: 160 },
    { title: 'Floor', dataIndex: 'floor', width: 100 },
  ];

  const assetColumns = type === 'crossCompany'
    ? crossCompanyColumns
    : type === 'scrap'
      ? scrapColumns
      : type === 'accounting'
        ? accountingColumns
        : disposalColumns;

  if (view === 'list') {
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
            <Input value={filters.applicationNo} allowClear onChange={(e) => setFilters((c) => ({ ...c, applicationNo: e.target.value }))} />
          </QueryItem>
          <QueryItem label="单据状态">
            <Select value={filters.documentStatus || undefined} allowClear options={fieldOptions(config.statuses)} onChange={(v) => setFilters((c) => ({ ...c, documentStatus: v || '' }))} />
          </QueryItem>
          <QueryItem label="资产范围">
            <Select value={filters.assetScope || undefined} allowClear options={[...ASSET_SCOPE_OPTIONS, { label: '混合', value: '混合' }]} onChange={(v) => setFilters((c) => ({ ...c, assetScope: v || '' }))} />
          </QueryItem>
          <QueryItem label="公司">
            <Input value={filters.company} allowClear onChange={(e) => setFilters((c) => ({ ...c, company: e.target.value }))} />
          </QueryItem>
          <QueryItem label="制单时间">
            <RangePicker value={filters.dateRange} className="w-full" onChange={(v) => setFilters((c) => ({ ...c, dateRange: v }))} />
          </QueryItem>
        </QueryBar>

        <Card size="small" title="申请单列表" extra={<Text type="secondary">共 {filteredRows.length} 条</Text>}>
          <div className="mb-3 flex justify-end">
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{config.createLabel}</Button>
              <Popconfirm title="确认删除所选草稿？" onConfirm={deleteDrafts} disabled={selectedKeys.length === 0}>
                <Button danger icon={<DeleteOutlined />} disabled={selectedKeys.length === 0}>删除</Button>
              </Popconfirm>
            </Space>
          </div>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={columns}
            dataSource={filteredRows}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4" data-page-view-key={`${type}-${readOnly ? 'detail' : 'edit'}`}>
      <Title level={3} className="!mb-0">{readOnly ? `${config.title}详情` : config.createLabel}</Title>

      <Card size="small" title="基本信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请单号">{form.applicationNo || '保存/提交后生成'}</Descriptions.Item>
          <Descriptions.Item label="单据状态"><StatusTag value={form.documentStatus} type="business" /></Descriptions.Item>
          <Descriptions.Item label="申请日期">{form.applicationDate}</Descriptions.Item>
          <Descriptions.Item label="发起人">{form.creator}</Descriptions.Item>
          <Descriptions.Item label="公司">
            <Select disabled={readOnly} value={form.company} options={companyOptions} className="w-full" onChange={(v) => updateForm('company', v)} />
          </Descriptions.Item>
          {type !== 'accounting' && (
            <Descriptions.Item label="资产范围">
              <Select disabled={readOnly || assets.length > 0} value={form.assetScope} options={ASSET_SCOPE_OPTIONS} className="w-full" onChange={(v) => updateForm('assetScope', v)} />
            </Descriptions.Item>
          )}
          {type === 'scrap' && (
            <>
              <Descriptions.Item label="报废方式">
                <Select disabled={readOnly} value={form.scrapMethod} options={fieldOptions(['全部报废', '部分报废'])} className="w-full" onChange={(v) => updateForm('scrapMethod', v)} />
              </Descriptions.Item>
              {form.assetScope === '办公设备' && (
                <Descriptions.Item label="是否已处置完成">
                  <Select disabled={readOnly} value={form.disposedComplete} options={fieldOptions(['是', '否'])} className="w-full" onChange={(v) => updateForm('disposedComplete', v)} />
                </Descriptions.Item>
              )}
              {form.assetScope === '机房资产' && (
                <Descriptions.Item label="地区">
                  <Select disabled={readOnly} value={form.region} options={fieldOptions(['北京', '非北京'])} className="w-full" onChange={(v) => updateForm('region', v)} />
                </Descriptions.Item>
              )}
            </>
          )}
          {type === 'accounting' && (
            <>
              <Descriptions.Item label="数据来源">
                <Select disabled={readOnly} value={form.sourceType} options={fieldOptions(['待报废池', '手动导入'])} className="w-full" onChange={(v) => updateForm('sourceType', v)} />
              </Descriptions.Item>
              {form.sourceType === '手动导入' && (
                <Descriptions.Item label="手动导入类型">
                  <Select disabled={readOnly} value={form.manualScenario || undefined} options={fieldOptions(['丢失赔偿', '机房资产盘亏', '装修'])} className="w-full" onChange={(v) => updateForm('manualScenario', v)} />
                </Descriptions.Item>
              )}
            </>
          )}
          {type === 'disposal' && form.assetScope === '机房资产' && (
            <>
              <Descriptions.Item label="归属地">
                <Select disabled={readOnly} value={form.region} options={fieldOptions(['北京', '非北京'])} className="w-full" onChange={(v) => updateForm('region', v)} />
              </Descriptions.Item>
              <Descriptions.Item label="是否需要数据清洗">
                <Select disabled value={form.needsCleaning} options={fieldOptions(['是', '否'])} className="w-full" />
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label={type === 'scrap' ? '报废说明' : '备注'} span={3}>
            <Input.TextArea
              disabled={readOnly}
              value={type === 'scrap' ? form.description : form.remark}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(e) => updateForm(type === 'scrap' ? 'description' : 'remark', e.target.value)}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <ScrapWorkflowCard
        type={type}
        assetScope={form.assetScope}
        selectedAssets={assets}
        region={form.region}
        needsCleaning={form.needsCleaning}
        currentNode={form.currentNode}
      />

      {type === 'disposal' && form.assetScope === '办公设备' && (
        <Card size="small" title="报价与处置信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="接收报价人">
              <Select disabled={readOnly} value={form.quoteReceiver} options={fieldOptions(['采购专员', '内审'])} className="w-full" onChange={(v) => updateForm('quoteReceiver', v)} />
            </Descriptions.Item>
            <Descriptions.Item label="回收供应商">
              <Input disabled={readOnly} value={form.supplier} onChange={(e) => updateForm('supplier', e.target.value)} />
            </Descriptions.Item>
            <Descriptions.Item label="报价金额">
              <InputNumber disabled={readOnly} min={0} precision={2} value={form.quoteAmount} className="w-full" onChange={(v) => updateForm('quoteAmount', v)} />
            </Descriptions.Item>
            <Descriptions.Item label="处置凭证" span={3}>
              <Upload disabled={readOnly} beforeUpload={(file) => {
                if (file.size > 20 * 1024 * 1024) {
                  message.error('单文件不能超过20MB');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}>
                <Button disabled={readOnly} icon={<UploadOutlined />}>上传实物照片/到款凭证/交接签字表</Button>
              </Upload>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card size="small" title="资产明细" extra={<Text type="secondary">共 {assets.length} 条</Text>}>
        {!readOnly && (
          <div className="mb-3 flex justify-end">
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAssetPickerOpen(true)}>添加物资</Button>
              <Button danger icon={<DeleteOutlined />} disabled={assets.length === 0} onClick={() => setAssets([])}>清空明细</Button>
            </Space>
          </div>
        )}
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={assetColumns}
          dataSource={assets}
          scroll={{ x: 'max-content' }}
          pagination={false}
          locale={{ emptyText: '暂无资产明细' }}
        />
      </Card>

      <div className="flex justify-center gap-3">
        <Button onClick={() => setView('list')}>返回</Button>
        {!readOnly && (
          <>
            <Button onClick={() => saveRecord(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => saveRecord(true)}>提交</Button>
          </>
        )}
      </div>

      <SelectModal
        open={assetPickerOpen}
        title="选择资产"
        width={960}
        multiple
        dataSource={pickerAssets}
        initialSelectedKeys={assets.map((item) => item.id)}
        searchFields={[
          { label: '资产标签号', name: 'tagNo', dataIndex: 'tagNo' },
          { label: '资产大类', name: 'majorCategory', dataIndex: 'majorCategory' },
          { label: '资产说明', name: 'description', dataIndex: 'description' },
        ]}
        columns={[
          { title: '资产标签号', dataIndex: 'tagNo', width: 150 },
          { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
          { title: '资产小类', dataIndex: 'minorCategory', width: 190 },
          { title: '资产说明', dataIndex: 'description', width: 220 },
          { title: '公司', dataIndex: 'company', width: 150 },
          { title: '责任人', dataIndex: 'responsiblePerson', width: 150 },
          { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
        ]}
        onCancel={() => setAssetPickerOpen(false)}
        onConfirm={(selected) => {
          addAssets(selected);
          setAssetPickerOpen(false);
        }}
      />
    </div>
  );
}
