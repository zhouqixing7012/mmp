import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select, Space, TreeSelect, message } from 'antd';
import dayjs from 'dayjs';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { getReportOptions } from '../../services/assetReportsService';

export default function ReportFilter({ definition, field, filters, onChange, onQuery }) {
  const [open, setOpen] = useState(false);
  const [treeDraft, setTreeDraft] = useState([]);
  const options = useMemo(() => getReportOptions(definition, field, filters), [definition, field, filters]);
  const value = filters[field.label];
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const change = next => onChange(field, next);
  const openLookup = () => {
    if (definition.id === 'report-2-1' && field.label === 'Building' && !filters.City) {
      message.warning('请先选择城市！');
      return;
    }
    setTreeDraft(value || []);
    setOpen(true);
  };
  if (field.type === 'date') {
    const other = definition.filters.find(item => item.key === field.key && item.side !== field.side && item.type === 'date');
    const boundary = other && filters[other.label];
    return <DatePicker aria-label={field.label} style={{ width: '100%' }} format="YYYY-MM-DD" value={value ? dayjs(value) : null}
      onChange={date => change(date ? date.format('YYYY-MM-DD') : undefined)}
      disabledDate={date => Boolean(boundary) && (field.side === 'from' ? date.isAfter(dayjs(boundary), 'day') : date.isBefore(dayjs(boundary), 'day'))} />;
  }
  if (field.type === 'select') return <Select aria-label={field.label} style={{ width: '100%' }} showSearch optionFilterProp="label" allowClear
    placeholder="请选择" options={options} value={value || undefined} onChange={change}
    disabled={definition.id === 'report-2-1' && field.label === '报废类型' && filters['报废状态'] !== '已报废'} />;
  if (field.type === 'lookup' || field.type === 'tree') {
    const treeData = [...new Set(options.map(option => option.parent))].map(parent => ({
      title: parent, value: `parent:${parent}`, selectable: false, disableCheckbox: true,
      children: options.filter(option => option.parent === parent).map(option => ({ title: option.label, value: option.value })),
    }));
    const person = ['责任人编号', '员工内部ID', '申请人工号', '创建人', '汇总提交人名称'].includes(field.key);
    return <>
      <LookupInput value={selected.map(item => options.find(option => option.value === item)?.label || item).join('、')}
        placeholder="请选择" onOpen={openLookup} onClear={() => change(field.multiple ? [] : undefined)} />
      {field.type === 'tree' ? <Modal title={`选择${field.label}`} open={open} onCancel={() => setOpen(false)} footer={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" disabled={!treeDraft?.length} onClick={() => { change(treeDraft); setOpen(false); }}>确定</Button></Space>} destroyOnHidden>
        <TreeSelect style={{ width: '100%' }} treeData={treeData} treeCheckable={field.multiple} showSearch treeNodeFilterProp="title"
          treeDefaultExpandAll allowClear placeholder="请选择小类" value={treeDraft}
          onChange={setTreeDraft} />
      </Modal> : <SelectModal open={open} onCancel={() => setOpen(false)} title={`选择${field.label}`} rowKey="value" multiple={field.multiple}
        dataSource={options} initialSelectedKeys={selected}
        searchFields={[{ name: 'code', label: person ? '员工编号' : '编码', dataIndex: 'code' }, { name: 'label', label: person ? '姓名' : '名称', dataIndex: 'label' },
          ...(person ? [{ name: 'department', label: '部门', dataIndex: 'department' }] : [])]}
        columns={[{ title: person ? '员工编号' : '编码', dataIndex: 'code', width: 160 }, { title: person ? '姓名' : '名称', dataIndex: 'label', width: 260 },
          ...(person ? [{ title: '部门', dataIndex: 'department', width: 200 }] : [])]}
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
