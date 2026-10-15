import React, { useState } from 'react';
import { DatePicker, Input, Select, Tooltip } from 'antd';
import dayjs from 'dayjs';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { AssetTreeSelect } from '../../components/AssetQueryControls';
import { getApplicationOptions } from '../../services/applicationQueryService';

export default function ApplicationFilter({ definition, field, value, onChange, onQuery }) {
  const [open, setOpen] = useState(false);
  const options = getApplicationOptions(definition.id, field);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  if (field.disabledReason) return <Tooltip title={field.disabledReason}><Input aria-label={field.label} disabled placeholder="待确认" /></Tooltip>;
  if (field.kind === 'date') return <DatePicker.RangePicker style={{ width: '100%' }} allowEmpty={[true, true]} format="YYYY-MM-DD"
    value={value ? value.map(date => date ? dayjs(date) : null) : null} onChange={dates => onChange(dates ? dates.map(date => date ? date.format('YYYY-MM-DD') : null) : undefined)} />;
  if (field.kind === 'tree') return <AssetTreeSelect aria-label={field.label} treeCheckable={Boolean(field.multiple)}
    treeData={options.map(option => ({ title: option.label, value: option.value }))} value={value} onChange={onChange} />;
  if (field.kind === 'select') return <Select aria-label={field.label} style={{ width: '100%' }} allowClear showSearch optionFilterProp="label" placeholder="请选择"
    mode={field.multiple ? 'multiple' : undefined} options={options} value={value} onChange={onChange} />;
  if (field.kind === 'lookup') return <>
    <LookupInput value={selected.map(item => options.find(option => option.value === item)?.label || item).join('、')}
      placeholder={`请选择${field.label}`} onOpen={() => setOpen(true)} onClear={() => onChange(field.multiple ? [] : undefined)} />
    <SelectModal title={`选择${field.label}`} open={open} onCancel={() => setOpen(false)} rowKey="value" multiple={Boolean(field.multiple)}
      dataSource={options} initialSelectedKeys={selected}
      columns={[{ title: '编码', dataIndex: 'value', width: 180 }, { title: '名称', dataIndex: 'label', width: 280 }, ...(field.label === '仓库' ? [{ title: '公司', dataIndex: 'company', width: 220 }] : [])]}
      searchFields={[{ name: 'code', label: '编码', dataIndex: 'value' }, { name: 'name', label: '名称', dataIndex: 'label' }]}
      onConfirm={result => onChange(field.multiple ? result.map(item => item.value) : result.value)} />
  </>;
  return <Input aria-label={field.label} value={value || ''} allowClear placeholder={`请输入${field.label}`} onChange={event => onChange(event.target.value)} onPressEnter={onQuery} />;
}
