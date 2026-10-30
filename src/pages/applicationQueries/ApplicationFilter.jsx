import React, { useState } from 'react';
import { DatePicker, Input, Select, Tooltip } from 'antd';
import dayjs from 'dayjs';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { applicationFilterEntity } from '../../services/applicationFilterModel';
import { AssetTreeSelect, AssetPersonSelect } from '../../components/AssetQueryControls';
import { getApplicationOptions } from '../../services/applicationQueryService';

export default function ApplicationFilter({ definition, field, value, onChange, onQuery }) {
  const [open, setOpen] = useState(false);
  const entity = applicationFilterEntity(field);
  const lookupLabel = { department: '部门', company: '公司', warehouse: '仓库', office: '办公区' }[entity] || field.label;
  const options = getApplicationOptions(definition.id, field);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  if (field.disabledReason) return <Tooltip title={field.disabledReason}><Input aria-label={field.label} disabled placeholder="待确认" /></Tooltip>;
  if (field.kind === 'date') return <DatePicker.RangePicker style={{ width: '100%' }} allowEmpty={[true, true]} format="YYYY-MM-DD"
    value={value ? value.map(date => date ? dayjs(date) : null) : null} onChange={dates => onChange(dates ? dates.map(date => date ? date.format('YYYY-MM-DD') : null) : undefined)} />;
  if (field.kind === 'tree') return <AssetTreeSelect aria-label={field.label} treeCheckable={Boolean(field.multiple)}
    treeData={options.map(option => ({ title: option.label, value: option.value }))} value={value} onChange={onChange} />;
  if (entity === 'person') return <AssetPersonSelect title={`选择${field.label}`} options={options} multiple={Boolean(field.multiple)} value={value} onChange={onChange} />;
  if (field.kind === 'select' || ['subsidiary', 'plate'].includes(entity)) return <Select aria-label={field.label} style={{ width: '100%' }} allowClear showSearch optionFilterProp="label" placeholder="请选择"
    mode={field.multiple ? 'multiple' : undefined} options={options} value={value} onChange={onChange} />;
  if (field.kind === 'lookup') return <>
    <LookupInput aria-label={field.label} value={selected.map(item => options.find(option => option.value === item)?.label || item).join('、')}
      placeholder={`请选择${field.label}`} onOpen={() => setOpen(true)} onClear={() => onChange(field.multiple ? [] : undefined)} />
    <SelectModal title={`选择${field.label}`} open={open} onCancel={() => setOpen(false)} rowKey="value" multiple={Boolean(field.multiple)}
      dataSource={options} initialSelectedKeys={selected}
      columns={[{ title: `${lookupLabel}编码`, dataIndex: 'code', width: 180 }, { title: entity === 'department' ? '部门全称' : `${lookupLabel}名称`, dataIndex: 'name', width: 280 }, ...(entity === 'office' ? [{ title: '办公区地址', dataIndex: 'address', width: 360 }] : []), ...(entity === 'warehouse' ? [{ title: '公司', dataIndex: 'company', width: 220 }] : [])]}
      searchFields={[{ name: 'code', label: `${lookupLabel}编码`, dataIndex: 'code' }, { name: 'name', label: `${lookupLabel}名称`, dataIndex: 'name' }]}
      onConfirm={result => onChange(field.multiple ? result.map(item => item.value) : result.value)} />
  </>;
  return <Input aria-label={field.label} value={value || ''} allowClear placeholder={`请输入${field.label}`} onChange={event => onChange(event.target.value)} onPressEnter={onQuery} />;
}
