import React from 'react';
import { DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { AssetCategorySelect, AssetPersonSelect, AssetValueSelect, OwnerLevelSelect } from '../../components/AssetQueryControls';

export default function InventoryAssetQuery({ rows, filters, onChange, onQuery, onReset, rangeOptions }) {
  const update = (field, value) => onChange({ ...filters, [field]: value ?? '' });
  const text = (label, field) => <QueryItem key={field} label={label}><Input value={filters[field]} allowClear onChange={(event) => update(field, event.target.value)} onPressEnter={onQuery} /></QueryItem>;
  const select = (label, field) => <QueryItem key={field} label={label}><AssetValueSelect rows={rows} field={field} value={filters[field]} onChange={(value) => update(field, value)} /></QueryItem>;
  const person = (label, field, title) => <QueryItem key={field} label={label}><AssetPersonSelect rows={rows} field={field} value={filters[field]} title={title} onChange={(value) => update(field, value)} /></QueryItem>;
  const enableDate = <QueryItem key="enableDate" label="启用日期"><DatePicker.RangePicker
    style={{ width: '100%' }}
    value={[filters.enableFrom ? dayjs(filters.enableFrom) : null, filters.enableTo ? dayjs(filters.enableTo) : null]}
    allowEmpty={[true, true]}
    onChange={(dates) => onChange({ ...filters, enableFrom: dates?.[0]?.format('YYYY-MM-DD') || '', enableTo: dates?.[1]?.format('YYYY-MM-DD') || '' })}
  /></QueryItem>;
  const category = <QueryItem key="category" label="资产类别"><AssetCategorySelect rows={rows} value={filters.category} onChange={(value) => update('category', value)} /></QueryItem>;
  return <QueryBar labelWidth={84} onQuery={onQuery} onReset={onReset}>
    {[
      text('资产标签号', 'assetTag'), category, text('序列号', 'serialNo'),
      text('成本中心', 'costCenter'), text('资产说明', 'description'), select('使用状态', 'useStatus'),
      person('资产责任人', 'owner', '选择资产责任人'),
      <QueryItem key="ownerLevel" label="资产责任人职级"><OwnerLevelSelect rows={rows} value={filters.ownerLevel} onChange={(value) => update('ownerLevel', value)} /></QueryItem>,
      select('责任人部门', 'ownerDept'), person('执行人', 'executor', '选择盘点执行人'), person('盘点监督人', 'supervisor', '选择盘点监督人'), select('City', 'city'),
      select('Building', 'building'), enableDate,
      select('盘点状态', 'inventoryStatus'),
      <QueryItem key="range" label="盘点范围"><Select mode="multiple" style={{ width: '100%' }} allowClear value={filters.range || undefined} options={rangeOptions.map((value) => ({ label: value, value }))} onChange={(value) => update('range', value)} /></QueryItem>,
    ]}
  </QueryBar>;
}
