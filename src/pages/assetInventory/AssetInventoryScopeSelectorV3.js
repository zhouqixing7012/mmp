import React, { useMemo, useState } from 'react';
import { Button, Card, InputNumber, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import { Eye, Search, Trash2 } from 'lucide-react';
import {
  mockBuildings,
  mockCities,
  mockDepartments,
  mockLocationBasicDataData,
  mockMaterialCategories,
  mockRealAdmins,
  mockVirtualAdmins,
  mockWarehouseInfoData,
  mockWarehousePermissionData,
  mockWarehouses,
} from '../../mock/businessRulesMock';
import { ASSET_ROWS, EMPLOYEE_ROWS, SCOPE_ROWS } from './mockData';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';
import SectionCardTitle from './SectionCardTitle';

const SUBSIDIARY_OPTIONS = ['集团', '搜狐媒体', '焦点', '视频'];

function unique(values) {
  return [...new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function withAll(values) {
  return ['全部', ...unique(values).filter((value) => value !== '全部')];
}

function splitText(value) {
  return String(value || '').split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
}

function toOptions(values) {
  return values.map((value) => ({ label: value, value }));
}

export function getScheme3InventoryDemoOptions(allowedRanges) {
  const assets = ASSET_ROWS.filter((row) => isInventoryRangeAllowed(row, allowedRanges));
  const locationCities = mockLocationBasicDataData.filter((row) => row.enabled).map((row) => row.cityName);
  const locationBuildings = mockLocationBasicDataData.flatMap((row) => (row.children || []).filter((child) => child.enabled).map((child) => child.buildingName));
  const people = [
    ...mockWarehouseInfoData.map((row) => row.admin),
    ...mockWarehousePermissionData.map((row) => row.operator),
    ...mockVirtualAdmins.map((row) => row.desc),
    ...mockRealAdmins.map((row) => row.desc),
    ...EMPLOYEE_ROWS.map((row) => row.employeeName),
    ...assets.map((row) => row.owner),
  ];

  return {
    organization: SUBSIDIARY_OPTIONS,
    department: withAll([
      ...mockDepartments.map((row) => `${row.code}.${row.desc}`),
      ...assets.map((row) => row.ownerDept),
    ]),
    assetCategory: withAll([
      ...mockMaterialCategories.map((row) => row.desc),
      ...assets.map((row) => row.category),
    ]),
    assetStatus: withAll([
      ...SCOPE_ROWS.flatMap((row) => splitText(row.assetStatus)),
      ...assets.map((row) => String(row.useStatus || '').split('-')[0]),
    ]),
    warehouse: withAll([
      ...mockWarehouses.map((row) => `${row.code}.${row.desc}`),
      ...mockWarehouseInfoData.map((row) => `${row.code}.${row.desc}`),
    ]),
    city: withAll([
      ...locationCities,
      ...mockCities.map((row) => row.desc.endsWith('市') ? row.desc : `${row.desc}市`),
      ...assets.map((row) => row.city),
    ]),
    building: withAll([
      ...locationBuildings,
      ...mockBuildings.map((row) => row.desc),
      ...assets.map((row) => row.building),
    ]),
    floor: withAll(assets.map((row) => row.floor)),
    owner: withAll(people),
    ownerLevel: withAll([
      ...assets.map((row) => row.ownerLevel),
      '1', '5', '实习生', '公共',
    ]),
  };
}

export default function AssetInventoryScopeSelectorV3({ projectType = '初盘' }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const options = useMemo(() => getScheme3InventoryDemoOptions(allowedRanges), [allowedRanges]);
  const [filters, setFilters] = useState({
    organization: '', department: '', assetCategory: '', assetStatus: '', warehouse: '',
    city: '', building: '', floor: '', owner: '', ownerLevel: '', ratio: 100,
  });
  const [rows, setRows] = useState(() => SCOPE_ROWS.map((row) => ({ ...row })));
  const [selectedKeys, setSelectedKeys] = useState([]);

  const fields = [
    ['子公司', 'organization'], ['部门', 'department'], ['资产类别', 'assetCategory'], ['资产状态', 'assetStatus'], ['仓库', 'warehouse'],
    ['City', 'city'], ['Building', 'building'], ['Floor', 'floor'], ['资产责任人', 'owner'], ['资产责任人职级', 'ownerLevel'],
  ];

  const columns = [
    { title: '子公司', dataIndex: 'organization', width: 140 },
    { title: '部门', dataIndex: 'department', width: 190 },
    { title: '资产类别', dataIndex: 'assetCategory', width: 170 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '仓库', dataIndex: 'warehouse', width: 190 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'Building', dataIndex: 'building', width: 180 },
    { title: 'Floor', dataIndex: 'floor', width: 100 },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 130 },
    { title: '启用开始日期', dataIndex: 'enableFrom', width: 130 },
    { title: '启用结束日期', dataIndex: 'enableTo', width: 130 },
    { title: '清单', width: 80, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('已展示该盘点范围资产清单')}>查看</Button> },
  ];

  const generate = () => {
    setRows((current) => [...current, {
      key: `scope-v3-${Date.now()}`,
      organization: filters.organization || '集团',
      department: filters.department || '全部',
      assetCategory: filters.assetCategory || '全部',
      assetStatus: filters.assetStatus || '全部',
      warehouse: filters.warehouse || '全部',
      city: filters.city || '全部',
      building: filters.building || '全部',
      floor: filters.floor || '全部',
      owner: filters.owner || '全部',
      ownerLevel: filters.ownerLevel || '全部',
      enableFrom: '2020-01-01',
      enableTo: '2026-06-30',
    }]);
    messageApi.success(projectType === '复盘' ? `已生成复盘范围，本次复盘比例 ${filters.ratio}%` : '已根据当前筛选规则生成盘点范围分录');
  };

  return (
    <Card size="small" title={<SectionCardTitle>盘点范围筛选</SectionCardTitle>}>
      {contextHolder}
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {fields.map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              value={filters[field] || undefined}
              placeholder={`请选择${label}`}
              className="flex-1"
              options={toOptions(options[field] || ['全部'])}
              onChange={(value) => setFilters((current) => ({ ...current, [field]: value || '' }))}
            />
          </div>
        ))}
        {projectType === '复盘' && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-24 shrink-0 text-right text-sm text-gray-600">比例:</span>
            <InputNumber min={1} max={100} value={filters.ratio} className="flex-1" addonAfter="%" onChange={(value) => setFilters((current) => ({ ...current, ratio: value || 100 }))} />
          </div>
        )}
      </div>

      <div className="my-4 flex justify-center">
        <Button type="primary" icon={<Search size={14} />} onClick={generate}>生成查询</Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Typography.Text strong>盘点范围明细</Typography.Text>
        <Space>
          <Button icon={<Eye size={14} />} onClick={() => messageApi.info('已展示全部盘点范围资产')}>查看全部</Button>
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => {
              if (!selectedKeys.length) {
                messageApi.warning('请先选择需要删除的盘点范围');
                return;
              }
              const selected = new Set(selectedKeys);
              setRows((current) => current.filter((row) => !selected.has(row.key)));
              setSelectedKeys([]);
            }}
          >
            删除所选
          </Button>
          <Button danger onClick={() => { setRows([]); setSelectedKeys([]); }}>删除全部</Button>
        </Space>
      </div>

      <Table
        rowKey="key"
        size="small"
        bordered
        columns={columns}
        dataSource={rows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        scroll={{ x: 1600 }}
        pagination={false}
      />
    </Card>
  );
}
