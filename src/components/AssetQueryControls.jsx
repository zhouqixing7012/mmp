import React, { useMemo, useState } from 'react';
import { Select, TreeSelect } from 'antd';
import LookupInput from './LookupInput';
import SelectModal from './SelectModal';
import { PERSON_LOOKUP_FIELDS, PERSON_LOOKUP_COLUMNS } from '../services/assetReferenceOptions';

export { formatAssetCategory, matchesAssetCategory, matchesQuerySelection } from './assetQueryModel';

export function AssetTreeSelect({ value, onChange, treeCheckable = true, ...props }) {
  return <TreeSelect treeCheckable={treeCheckable} showCheckedStrategy={TreeSelect.SHOW_PARENT} showSearch treeNodeFilterProp="title" allowClear style={{ width: "100%" }} value={value ?? (treeCheckable ? [] : undefined)} onChange={onChange} {...props} />;
}

export function AssetCategorySelect({ rows, value, onChange, ...props }) {
  const treeData = useMemo(() => {
    const categories = new Map();
    rows.forEach((row) => {
      if (!row.category) return;
      if (!categories.has(row.category)) categories.set(row.category, new Set());
      if (row.subCategory) categories.get(row.category).add(row.subCategory);
    });
    return [...categories].map(([major, minors]) => ({
      title: major, value: `major:${major}`,
      children: [...minors].map((minor) => ({ title: minor, value: `minor:${major}|${minor}` })),
    }));
  }, [rows]);
  return <AssetTreeSelect treeData={treeData} placeholder="请选择资产类别" value={value} onChange={onChange} {...props} />;
}

// 正式职级由PS提供；原型选项仅使用已有演示记录，实习生和公共独立展示。
export function OwnerLevelSelect({ rows, value, onChange, ...props }) {
  const levels = [...new Set(rows.map((row) => row.ownerLevel).filter((level) => level && level !== '-' && !['实习生', '公共'].includes(level)))];
  return <Select mode="multiple" showSearch optionFilterProp="label" allowClear style={{ width: '100%' }} placeholder="请选择责任人职级" value={value || []} options={[...levels, '实习生', '公共'].map((level) => ({ label: level, value: level }))} onChange={onChange} {...props} />;
}

export function AssetValueSelect({ rows, field, value, onChange, multiple = false, placeholder = '请选择', ...props }) {
  const options = [...new Set(rows.map((row) => row[field]).filter((item) => item && item !== '-'))].map((item) => ({ label: item, value: item }));
  return <Select mode={multiple ? 'multiple' : undefined} showSearch optionFilterProp="label" allowClear style={{ width: '100%' }} placeholder={placeholder} value={multiple ? value || [] : value || undefined} options={options} onChange={onChange} {...props} />;
}

export function AssetPersonSelect({ rows = [], options, field = 'owner', value, onChange, title = '选择资产责任人', multiple = true }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const dataSource = useMemo(() => {
    if (options) return options.map(option => ({ ...option, id: option.value }));
    const people = new Map();
    rows.forEach((row) => {
      const name = row[field];
      if (!name || name === '-' || people.has(name)) return;
      people.set(name, { id: name, name, code: field === 'owner' ? row.ownerNo || '' : '', department: field === 'owner' ? row.ownerDept || '' : '' });
    });
    return [...people.values()];
  }, [rows, field, options]);
  return <>
    <LookupInput aria-label={title.replace(/^选择/, '')} value={selected.map(item => options ? options.find(option => option.value === item)?.label || item : item).join('、')} placeholder="请选择" onOpen={() => setOpen(true)} onClear={() => onChange(multiple ? [] : '')} />
    <SelectModal open={open} title={title} rowKey="id" multiple={multiple} dataSource={dataSource} initialSelectedKeys={selected}
      searchFields={PERSON_LOOKUP_FIELDS}
      columns={PERSON_LOOKUP_COLUMNS}
      onCancel={() => setOpen(false)} onConfirm={(records) => onChange(multiple ? records.map(record => options ? record.value : record.name) : options ? records.value : records.name)} />
  </>;
}
