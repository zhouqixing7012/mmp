import React, { useMemo, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  SCRAP_ASSET_POOL,
  SCRAP_TYPE_OPTIONS,
  filterAssetsForScope,
  money,
} from './scrapPrototypeData';
import {
  mockCompanies,
  mockCostCenters,
  mockPlates,
  mockWarehouseInfoData,
} from '../../mock/businessRulesMock';

const { Text } = Typography;

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

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

export default function ScrapPrototypeAssetTable({
  type,
  assetScope,
  assets,
  readOnly,
  onChange,
  onReplace,
  scrapMethod,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const pickerAssets = useMemo(() => (
    type === 'accounting' || assetScope === '混合'
      ? SCRAP_ASSET_POOL
      : filterAssetsForScope(assetScope)
  ), [type, assetScope]);

  const addAssets = (selected) => {
    const existing = new Set(assets.map((item) => item.id));
    const next = selected
      .filter((item) => !existing.has(item.id))
      .map((item) => ({
        ...item,
        scrapMethod: type === 'crossCompany' ? '调账' : scrapMethod,
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

    onReplace([...assets, ...next]);
  };

  const baseColumns = [
    { title: '资产标签号', dataIndex: 'tagNo', width: 150, fixed: 'left' },
    { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
    { title: '资产小类', dataIndex: 'minorCategory', width: 190, ellipsis: true },
    { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '责任人', dataIndex: 'responsiblePerson', width: 150 },
    {
      title: '资产状态',
      dataIndex: 'status',
      width: 130,
      render: (value) => <StatusTag value={value} type="business" />,
    },
  ];

  const crossCompanyColumns = [
    ...baseColumns,
    {
      title: '新公司',
      dataIndex: 'newCompany',
      width: 180,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value || undefined}
          options={companyOptions}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'newCompany', nextValue)}
        />
      ),
    },
    {
      title: '新板块',
      dataIndex: 'newPlate',
      width: 180,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value || undefined}
          options={plateOptions}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'newPlate', nextValue)}
        />
      ),
    },
    {
      title: '新成本中心',
      dataIndex: 'newCostCenter',
      width: 190,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value || undefined}
          options={costCenterOptions}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'newCostCenter', nextValue)}
        />
      ),
    },
    {
      title: '新责任人',
      dataIndex: 'newResponsiblePerson',
      width: 150,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'newResponsiblePerson', event.target.value)}
        />
      ),
    },
    {
      title: 'City',
      dataIndex: 'targetCity',
      width: 130,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'targetCity', event.target.value)}
        />
      ),
    },
    {
      title: 'Building',
      dataIndex: 'targetBuilding',
      width: 150,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'targetBuilding', event.target.value)}
        />
      ),
    },
    {
      title: 'Floor',
      dataIndex: 'targetFloor',
      width: 110,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'targetFloor', event.target.value)}
        />
      ),
    },
    {
      title: '调账后仓库',
      dataIndex: 'targetWarehouse',
      width: 210,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          allowClear
          value={value || undefined}
          options={warehouseOptions}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'targetWarehouse', nextValue || '')}
        />
      ),
    },
  ];

  const scrapColumns = [
    ...baseColumns,
    {
      title: '报废数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => (
        <InputNumber
          disabled={readOnly}
          min={1}
          max={record.quantity || 1}
          value={value}
          onChange={(nextValue) => onChange(record.id, 'quantity', nextValue)}
        />
      ),
    },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value}
          options={SCRAP_TYPE_OPTIONS}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'scrapType', nextValue)}
        />
      ),
    },
    {
      title: '数据清洗',
      dataIndex: 'dataCleaning',
      width: 110,
      render: (value, record) => (
        record.scope === '机房资产'
          ? (
            <Select
              disabled={readOnly}
              value={value || '否'}
              options={options(['是', '否'])}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'dataCleaning', nextValue)}
            />
          )
          : '-'
      ),
    },
    {
      title: '报废原因',
      dataIndex: 'reason',
      width: 200,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'reason', event.target.value)}
        />
      ),
    },
  ];

  const accountingColumns = [
    ...baseColumns,
    {
      title: '原值',
      dataIndex: 'originalValue',
      width: 120,
      align: 'right',
      render: money,
    },
    {
      title: '净值',
      dataIndex: 'netValue',
      width: 120,
      align: 'right',
      render: money,
    },
    {
      title: '报废方式',
      dataIndex: 'scrapMethod',
      width: 120,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value}
          options={options(['全部报废', '部分报废', '调账'])}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'scrapMethod', nextValue)}
        />
      ),
    },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => (
        <Select
          disabled={readOnly}
          value={value}
          options={SCRAP_TYPE_OPTIONS}
          className="w-full"
          onChange={(nextValue) => onChange(record.id, 'scrapType', nextValue)}
        />
      ),
    },
    {
      title: '报废原因',
      dataIndex: 'reason',
      width: 200,
      render: (value, record) => (
        <Input
          disabled={readOnly}
          value={value}
          onChange={(event) => onChange(record.id, 'reason', event.target.value)}
        />
      ),
    },
  ];

  const disposalColumns = [
    ...baseColumns,
    {
      title: '原值',
      dataIndex: 'originalValue',
      width: 120,
      align: 'right',
      render: money,
    },
    {
      title: '净值',
      dataIndex: 'netValue',
      width: 120,
      align: 'right',
      render: money,
    },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'Building', dataIndex: 'building', width: 160 },
    { title: 'Floor', dataIndex: 'floor', width: 100 },
  ];

  const columns = type === 'crossCompany'
    ? crossCompanyColumns
    : type === 'scrap'
      ? scrapColumns
      : type === 'accounting'
        ? accountingColumns
        : disposalColumns;

  return (
    <>
      {!readOnly && (
        <div className="mb-3 flex justify-end">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setPickerOpen(true)}
            >
              添加物资
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={assets.length === 0}
              onClick={() => onReplace([])}
            >
              清空明细
            </Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={assets}
        scroll={{ x: 'max-content' }}
        pagination={false}
        locale={{ emptyText: '暂无资产明细' }}
      />

      <SelectModal
        open={pickerOpen}
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
          {
            title: '资产状态',
            dataIndex: 'status',
            width: 130,
            render: (value) => <StatusTag value={value} type="business" />,
          },
        ]}
        onCancel={() => setPickerOpen(false)}
        onConfirm={(selected) => {
          addAssets(selected);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
