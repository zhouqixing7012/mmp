import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, InputNumber, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Eye, Search, Trash2 } from 'lucide-react';
import {
  mockBuildings,
  mockCities,
  mockLocationBasicDataData,
  mockWarehouseInfoData,
  mockWarehouses,
} from '../../mock/businessRulesMock';
import { ASSET_ROWS, SCOPE_ROWS } from './mockData';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';
import SectionCardTitle from './SectionCardTitle';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, OwnerLevelSelect } from '../../components/AssetQueryControls';
import { selectScopeAssets } from './inventoryScopeQuery';

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

  return {
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

  };
}

export default function AssetInventoryScopeSelectorV3({ projectType = '初盘', onScopeAssetsChange }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const options = useMemo(() => getScheme3InventoryDemoOptions(allowedRanges), [allowedRanges]);
  const [filters, setFilters] = useState({
    organization: [], department: [], assetCategory: [], assetStatus: [], warehouse: [],
    city: [], building: [], floor: [], owner: [], ownerLevel: [], enableFrom: '', enableTo: '', ratio: 100, netValueTopPercent: null,
  });
  const [rows, setRows] = useState(() => SCOPE_ROWS.map((row) => ({ ...row })));
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [previewKeys, setPreviewKeys] = useState(null);
  const updateRows = setRows;
  useEffect(() => {
    onScopeAssetsChange?.([...new Set(rows.flatMap((row) => row.assetKeys || []))]);
  }, [rows, onScopeAssetsChange]);

  const fields = [
    ['资产类别', 'assetCategory'], ['资产状态', 'assetStatus'], ['仓库', 'warehouse'],
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
    { title: '清单', width: 80, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => row.assetKeys ? setPreviewKeys(row.assetKeys) : messageApi.warning('历史演示范围未关联资产明细，请重新生成查询')}>查看</Button> },
  ];

  const generate = () => {
    const matches = selectScopeAssets(ASSET_ROWS.filter((row) => isInventoryRangeAllowed(row, allowedRanges)), filters, projectType);
    if (!matches.length) { messageApi.warning('当前条件下没有可纳入的资产'); return; }
    updateRows((current) => [...current, {
      key: `scope-v3-${Date.now()}`,
      organization: filters.organization.join('、') || '全部',
      department: filters.department.join('、') || '全部',
      assetCategory: filters.assetCategory.map((value) => value.startsWith('minor:') ? value.slice(6).replace('|', '.') : value.replace('major:', '')).join('、') || '全部',
      assetStatus: filters.assetStatus.join('、') || '全部',
      warehouse: filters.warehouse.join('、') || '全部',
      city: filters.city.join('、') || '全部',
      building: filters.building.join('、') || '全部',
      floor: filters.floor.join('、') || '全部',
      owner: filters.owner.join('、') || '全部',
      ownerLevel: filters.ownerLevel.join('、') || '全部',
      enableFrom: filters.enableFrom,
      enableTo: filters.enableTo,
      netValueTopPercent: projectType === '复盘' ? filters.netValueTopPercent : null,
      assetKeys: matches.map((asset) => asset.key),
    }]);
    messageApi.success(`已生成盘点范围分录，匹配 ${matches.length} 条资产`);
  };

  return (
    <Card size="small" title={<SectionCardTitle>盘点范围筛选</SectionCardTitle>}>
      {contextHolder}
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-28 shrink-0 text-right text-sm text-gray-600">子公司:</span>
          <AssetValueSelect rows={ASSET_ROWS} field="organization" multiple value={filters.organization} onChange={(value) => setFilters((current) => ({ ...current, organization: value }))} />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-28 shrink-0 text-right text-sm text-gray-600">部门:</span>
          <AssetValueSelect rows={ASSET_ROWS} field="ownerDept" multiple value={filters.department} onChange={(value) => setFilters((current) => ({ ...current, department: value }))} />
        </div>
        {fields.map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 min-w-0">
            <span className="w-28 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            {field === 'owner' ? <AssetPersonSelect rows={ASSET_ROWS} value={filters.owner} onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} />
              : field === 'ownerLevel' ? <OwnerLevelSelect rows={ASSET_ROWS} value={filters.ownerLevel} onChange={(value) => setFilters((current) => ({ ...current, ownerLevel: value }))} />
                : field === 'assetCategory' ? <AssetCategorySelect rows={ASSET_ROWS} value={filters.assetCategory} onChange={(value) => setFilters((current) => ({ ...current, assetCategory: value }))} />
                  : <Select mode="multiple" showSearch allowClear optionFilterProp="label" value={filters[field]} placeholder={`请选择${label}`} className="flex-1 min-w-0" options={toOptions(options[field])} onChange={(value) => setFilters((current) => ({ ...current, [field]: value || [] }))} />}
          </div>
        ))}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-28 shrink-0 text-right text-sm text-gray-600">启用日期:</span>
          <DatePicker.RangePicker
            className="flex-1"
            value={filters.enableFrom && filters.enableTo ? [dayjs(filters.enableFrom), dayjs(filters.enableTo)] : null}
            onChange={(dates) => setFilters((current) => ({
              ...current,
              enableFrom: dates?.[0]?.format('YYYY-MM-DD') || '',
              enableTo: dates?.[1]?.format('YYYY-MM-DD') || '',
            }))}
          />
        </div>
        {projectType === '复盘' && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-28 shrink-0 text-right text-sm text-gray-600">净值前:</span>
            <InputNumber min={1} max={100} precision={0} value={filters.netValueTopPercent} placeholder="不限制" className="flex-1" addonAfter="%" onChange={(value) => setFilters((current) => ({ ...current, netValueTopPercent: value }))} />
          </div>
        )}
        {projectType === '复盘' && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-28 shrink-0 text-right text-sm text-gray-600">比例:</span>
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
          <Button icon={<Eye size={14} />} onClick={() => setPreviewKeys([...new Set(rows.flatMap((row) => row.assetKeys || []))])}>查看全部</Button>
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => {
              if (!selectedKeys.length) {
                messageApi.warning('请先选择需要删除的盘点范围');
                return;
              }
              const selected = new Set(selectedKeys);
              updateRows((current) => current.filter((row) => !selected.has(row.key)));
              setSelectedKeys([]);
            }}
          >
            删除所选
          </Button>
          <Button danger onClick={() => { updateRows(() => []); setSelectedKeys([]); }}>删除全部</Button>
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
      <Modal open={previewKeys !== null} title="盘点范围资产明细" width={900} footer={<Button onClick={() => setPreviewKeys(null)}>返回</Button>} onCancel={() => setPreviewKeys(null)}>
        <Table rowKey="key" size="small" columns={[
          { title: '资产标签号', dataIndex: 'assetTag' },
          { title: '资产说明', dataIndex: 'description' },
          { title: '原值', dataIndex: 'originalValue' },
          { title: '净值', dataIndex: 'netValue' },
        ]} dataSource={ASSET_ROWS.filter((asset) => previewKeys?.includes(asset.key))} pagination={false} />
      </Modal>
    </Card>
  );
}
