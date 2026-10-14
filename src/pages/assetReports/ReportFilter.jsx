import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select, Space, TreeSelect, message } from 'antd';
import dayjs from 'dayjs';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { AssetCategorySelect, AssetTreeSelect, AssetValueSelect } from '../../components/AssetQueryControls';
import { ASSET_STATUS_OPTIONS } from '../../components/assetQueryModel';
import { getReportOptions } from '../../services/assetReportsService';
import { buildReportTree } from '../../services/assetReportOptions';

export default function ReportFilter({ definition, field, filters, access, onChange, onQuery }) {
  const [open, setOpen] = useState(false);
  const [treeDraft, setTreeDraft] = useState([]);
  const options = useMemo(() => getReportOptions(definition, field, filters, access), [definition, field, filters, access]);
  const value = filters[field.label];
  const selected = Array.isArray(value) ? value : value !== undefined && value !== null && value !== '' ? [value] : [];
  const change = next => onChange(field, next);
  const openLookup = () => {
    if (definition.id === 'report-2-1' && field.label === 'Building' && !filters.City) { message.warning('请先选择城市！'); return; }
    setTreeDraft(value || []);
    setOpen(true);
  };
  if (field.type === 'treeSelect') return <AssetCategorySelect rows={[]} treeData={buildReportTree(options)}
    aria-label={field.label} value={selected} onChange={change} />;
  if (field.type === 'departmentTreeSelect') return <AssetTreeSelect treeData={buildReportTree(options, true)}
    aria-label={field.label} placeholder="请选择HR部门" value={selected} onChange={change} />;
  if (field.type === 'assetStatusSelect') return <AssetValueSelect rows={ASSET_STATUS_OPTIONS.map(status => ({ status }))}
    field="status" multiple aria-label={field.label} value={selected} onChange={change} />;
  if (field.type === 'daterange') return <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" allowEmpty={[true, true]}
    placeholder={['开始日期', '结束日期']} value={value ? value.map(date => date ? dayjs(date) : null) : null}
    onChange={dates => change(dates ? dates.map(date => date ? date.format('YYYY-MM-DD') : null) : undefined)} />;
  if (field.type === 'date') {
    const other = definition.filters.find(item => item.key === field.key && item.side !== field.side && item.type === 'date');
    const boundary = other && filters[other.label];
    return <DatePicker aria-label={field.label} style={{ width: '100%' }} format="YYYY-MM-DD" value={value ? dayjs(value) : null}
      onChange={date => change(date ? date.format('YYYY-MM-DD') : undefined)}
      disabledDate={date => Boolean(boundary) && (field.side === 'from' ? date.isAfter(dayjs(boundary), 'day') : date.isBefore(dayjs(boundary), 'day'))} />;
  }
  if (field.type === 'select') return <Select aria-label={field.label} style={{ width: '100%' }} showSearch optionFilterProp="label" allowClear
    placeholder="请选择" options={options} mode={field.multiple ? 'multiple' : undefined} value={field.multiple ? selected : value ?? undefined} onChange={change}
    disabled={definition.id === 'report-2-1' && field.label === '报废类型' && filters['报废状态'] !== '已报废'} />;
  if (field.type === 'lookup' || field.type === 'tree') {
    const department = field.optionSet === 'department' || field.match === 'department';
    const treeData = buildReportTree(options, department);
    const person = field.optionSet === 'person' || ['责任人编号', '当前责任人'].includes(field.optionSet);
    return <>
      <LookupInput value={selected.map(item => options.find(option => option.value === item)?.label || item).join('、')}
        placeholder="请选择" onOpen={openLookup} onClear={() => change(field.multiple ? [] : undefined)} />
      {field.type === 'tree' ? <Modal title={`选择${field.label}`} open={open} onCancel={() => setOpen(false)}
        footer={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" disabled={!treeDraft?.length} onClick={() => { change(treeDraft); setOpen(false); }}>确定</Button></Space>} destroyOnHidden>
        <TreeSelect style={{ width: '100%' }} treeData={treeData} treeCheckable={field.multiple} showSearch treeNodeFilterProp="title"
          treeDefaultExpandAll showCheckedStrategy={department ? TreeSelect.SHOW_PARENT : TreeSelect.SHOW_CHILD} allowClear
          placeholder={department ? '请选择部门' : '请选择类别'} value={treeDraft} onChange={setTreeDraft} />
      </Modal> : <SelectModal open={open} onCancel={() => setOpen(false)} title={`选择${field.label}`} rowKey="value" multiple={field.multiple}
        dataSource={options} initialSelectedKeys={selected}
        searchFields={field.optionSet === 'Building' && definition.id === 'report-1-1' ? [
          { name: 'name', label: 'Building名称', dataIndex: 'name' }, { name: 'city', label: 'City名称', dataIndex: 'city' },
        ] : [{ name: 'code', label: person ? '员工编号' : '编码', dataIndex: 'code' },
          { name: person ? 'name' : 'label', label: person ? '姓名' : '名称', dataIndex: person ? 'name' : 'label' },
          ...(person ? [{ name: 'department', label: '部门', dataIndex: 'department' }] : [])]}
        columns={field.optionSet === 'Building' && definition.id === 'report-1-1' ? [
          { title: 'Building名称', dataIndex: 'name', width: 260 }, { title: 'City名称', dataIndex: 'city', width: 200 },
        ] : [{ title: person ? '员工编号' : '编码', dataIndex: 'code', width: 160 },
          { title: person ? '姓名' : '名称', dataIndex: person ? 'name' : 'label', width: 260 },
          ...(person ? [{ title: '部门', dataIndex: 'department', width: 200 }] : []),
          ...(field.optionSet === 'warehouse' && definition.id === 'report-1-1' ? [{ title: '公司', dataIndex: 'company', width: 220 }] : [])]}
        onConfirm={records => change(field.multiple ? records.map(record => record.value) : records.value)} />}
    </>;
  }
  return <Input aria-label={field.label} allowClear placeholder={`请输入${field.label}`} value={value ?? ''} onChange={event => change(event.target.value)} onPressEnter={onQuery}
    onBlur={field.type === 'amount' ? () => {
      if (value === undefined || value === '') return;
      const number = Number(String(value).replace(/,/g, ''));
      if (!Number.isFinite(number)) { change(undefined); message.warning(`${field.label}须填写有效金额`); return; }
      change(number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } : undefined} />;
}
