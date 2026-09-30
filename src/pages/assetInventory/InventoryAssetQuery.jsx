import React from 'react';
import { DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, OwnerLevelSelect } from '../../components/AssetQueryControls';

export default function InventoryAssetQuery({ rows, filters, onChange, onQuery, onReset, started, rangeOptions }) {
  const update = (field, value) => onChange({ ...filters, [field]: value ?? '' });
  const text = (label, field) => <QueryItem key={field} label={label}><Input value={filters[field]} allowClear onChange={(event) => update(field, event.target.value)} onPressEnter={onQuery} /></QueryItem>;
  const select = (label, field) => <QueryItem key={field} label={label}><AssetValueSelect rows={rows} field={field} value={filters[field]} onChange={(value) => update(field, value)} /></QueryItem>;
  const person = (label, field, title) => <QueryItem key={field} label={label}><AssetPersonSelect rows={rows} field={field} value={filters[field]} title={title} onChange={(value) => update(field, value)} /></QueryItem>;
  const date = (label, field) => <QueryItem key={field} label={label}><DatePicker style={{ width: '100%' }} value={filters[field] ? dayjs(filters[field]) : null} onChange={(value) => update(field, value?.format('YYYY-MM-DD') || '')} /></QueryItem>;
  const category = <QueryItem key="category" label="资产类别"><AssetCategorySelect rows={rows} value={filters.category} onChange={(value) => update('category', value)} /></QueryItem>;
  return <QueryBar labelWidth={112} onQuery={onQuery} onReset={onReset}>
    {started ? [
      text('资产标签号', 'assetTag'), category, text('序列号', 'serialNo'),
      text('成本中心', 'costCenter'), text('资产说明', 'description'), select('使用状态', 'useStatus'),
      person('资产责任人', 'owner', '选择资产责任人'),
      <QueryItem key="ownerLevel" label="资产责任人职级"><OwnerLevelSelect rows={rows} value={filters.ownerLevel} onChange={(value) => update('ownerLevel', value)} /></QueryItem>,
      select('责任人部门', 'ownerDept'), person('执行人', 'executor', '选择盘点执行人'), person('盘点监督人', 'supervisor', '选择盘点监督人'), select('City', 'city'),
      select('Building', 'building'), date('启用日期从', 'enableFrom'), date('启用日期至', 'enableTo'),
      select('盘点方式', 'inventoryMethod'), select('盘点状态', 'inventoryStatus'), select('NO状态', 'noStatus'),
    ] : [
      text('资产标签号', 'assetTag'), category, select('盘点状态', 'inventoryStatus'),
      person('资产责任人', 'owner', '选择资产责任人'), select('City', 'city'),
      <QueryItem key="range" label="盘点范围"><Select style={{ width: '100%' }} allowClear value={filters.range || undefined} options={rangeOptions.map((value) => ({ label: value, value }))} onChange={(value) => update('range', value)} /></QueryItem>,
    ]}
  </QueryBar>;
}
