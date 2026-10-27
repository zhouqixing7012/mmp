import InventoryScopeImport from './InventoryScopeImport';
import { inventoryManagementBlockReason } from './inventoryManagementPermissions';
import { useInventoryOperator } from './useInventoryOperator';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, InputNumber, Select, Space, Table, TreeSelect, Typography, message as antdMessage } from 'antd';
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
import { AssetCategorySelect, AssetPersonSelect, OwnerLevelSelect } from '../../components/AssetQueryControls';
import { selectScopeAssets } from './inventoryScopeQuery';
import { buildInventoryOrganizationTree } from './inventoryOrganizationQuery';

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

export default function AssetInventoryScopeSelectorV3({ projectType = '初盘', sourceAssets: suppliedAssets = ASSET_ROWS, project, onScopeAssetsChange, onPreviewAssets, initialAssetKeys }) {
  const [operator] = useInventoryOperator();
  const importBlock = !project || inventoryManagementBlockReason(project, operator);
  const { allowedRanges } = useAssetInventoryVariant();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const options = useMemo(() => getScheme3InventoryDemoOptions(allowedRanges), [allowedRanges]);
  const sourceAssets = useMemo(() => suppliedAssets.filter(row => isInventoryRangeAllowed(row, allowedRanges)), [suppliedAssets, allowedRanges]);
  const organizationTree = useMemo(() => buildInventoryOrganizationTree(sourceAssets), [sourceAssets]);
  const [filters, setFilters] = useState({
    organizationDepartments: [], assetCategory: [], assetStatus: [], warehouse: [],
    city: [], building: [], floor: [], owner: [], ownerLevel: [], enableFrom: '', enableTo: '', ratio: 100, netValueTopPercent: null,
  });
  const [rows, setRows] = useState(() => initialAssetKeys?.length ? [{ key: 'scope-import', assetKeys: initialAssetKeys }] : []);
  const [hasScopeSelection, setHasScopeSelection] = useState(Array.isArray(initialAssetKeys));
  const [selectedKeys, setSelectedKeys] = useState([]);
  const updateRows = (update) => {
    setHasScopeSelection(true);
    setRows(update);
    onPreviewAssets?.(null);
  };
  useEffect(() => {
    onScopeAssetsChange?.(hasScopeSelection ? [...new Set(rows.flatMap((row) => row.assetKeys || []))] : null);
  }, [rows, hasScopeSelection, onScopeAssetsChange]);

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
    { title: '资产责任人', dataIndex: 'owner', width: 160 },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 130 },
    { title: '启用日期', key: 'enableDateRange', width: 240, render: (_, row) => row.enableFrom || row.enableTo ? `${row.enableFrom || ''} ～ ${row.enableTo || ''}` : '' },
    { title: '清单', width: projectType === '复盘' ? 80 : 240, fixed: 'right', render: (_, row) => <Space><Button type="link" className="px-0" onClick={() => row.assetKeys ? onPreviewAssets?.(row.assetKeys) : messageApi.warning('历史演示范围未关联资产明细，请重新生成查询')}>查看</Button>{projectType !== '复盘' && project && <InventoryScopeImport project={project} rangeKey={row.key} disabled={Boolean(importBlock)} ledgerAssets={ASSET_ROWS} allowedAssets={sourceAssets}
      onClear={() => { if (importBlock) throw new Error(importBlock); updateRows(current => current.map(item => item.key === row.key ? { ...item, assetKeys: [] } : item)); onPreviewAssets?.([]); }}
      onImport={assets => { const keys = assets.map(asset => asset.key); updateRows(current => current.map(item => item.key === row.key ? { ...item, assetKeys: keys } : item)); onPreviewAssets?.(keys); }} />}</Space> },
  ];

  const generate = () => {
    const matches = selectScopeAssets(sourceAssets, filters, projectType);
    if (!matches.length) { messageApi.warning('当前条件下没有可纳入的资产'); return; }
    updateRows((current) => [...current, {
      key: `scope-v3-${Date.now()}-${rows.length}`,
      organization: filters.organizationDepartments.filter(value => value.startsWith('org:')).map(value => value.slice(4)).join('、'),
      department: filters.organizationDepartments.filter(value => value.startsWith('dept:')).map(value => value.slice(5).split('::')[1]).join('、'),
      assetCategory: filters.assetCategory.map((value) => value.startsWith('minor:') ? value.slice(6).replace('|', '.') : value.replace('major:', '')).filter(value => value !== '全部').join('、'),
      assetStatus: filters.assetStatus.filter(value => value !== '全部').join('、'),
      warehouse: filters.warehouse.filter(value => value !== '全部').join('、'),
      city: filters.city.filter(value => value !== '全部').join('、'),
      building: filters.building.filter(value => value !== '全部').join('、'),
      floor: filters.floor.filter(value => value !== '全部').join('、'),
      owner: filters.owner.filter(value => value !== '全部').join('、'),
      ownerLevel: filters.ownerLevel.filter(value => value !== '全部').join('、'),
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
          <span className="w-28 shrink-0 text-right text-sm text-gray-600">子公司/部门:</span>
          <TreeSelect className="w-full" treeData={organizationTree} value={filters.organizationDepartments} onChange={value => setFilters(current => ({ ...current, organizationDepartments: value }))} treeCheckable showCheckedStrategy={TreeSelect.SHOW_PARENT} showSearch treeNodeFilterProp="title" allowClear placeholder="请选择子公司或部门" />
        </div>
        {fields.map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 min-w-0">
            <span className="w-28 shrink-0 text-right text-sm text-gray-600">{label}:</span>
            {field === 'owner' ? <AssetPersonSelect rows={sourceAssets} value={filters.owner} onChange={(value) => setFilters((current) => ({ ...current, owner: value }))} />
              : field === 'ownerLevel' ? <OwnerLevelSelect rows={sourceAssets} value={filters.ownerLevel} onChange={(value) => setFilters((current) => ({ ...current, ownerLevel: value }))} />
                : field === 'assetCategory' ? <AssetCategorySelect rows={sourceAssets} value={filters.assetCategory} onChange={(value) => setFilters((current) => ({ ...current, assetCategory: value }))} />
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
          <Button icon={<Eye size={14} />} onClick={() => onPreviewAssets?.(null)}>查看全部</Button>
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
            删除
          </Button>
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
