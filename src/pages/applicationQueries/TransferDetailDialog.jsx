import { renderApplicationStatus } from './ApplicationStatus';
import React, { useState } from 'react';
import { App, DatePicker, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { DetailGrid, DetailItem } from '../../components/DetailGrid';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
import { transferChoices } from './TransferLookup';
import { applicationTransferService as service } from '../../services/applicationTransferService';

export default function TransferDetailDialog({ value, readOnly, onCancel, onSave, references }) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState(value);
  const [picker, setPicker] = useState('');
  const patch = (key, next) => setDraft(previous => ({ ...previous, [key]: next }));
  const enabled = references.warehouses.filter(row => row.status === '启用');
  const options = picker === 'recipient' ? references.people.map(row => ({ id: row.id, label: row.id + '.' + row.name }))
    : picker === 'city' ? transferChoices(enabled.map(row => row.city))
      : transferChoices(enabled.filter(row => !draft.city || row.city === draft.city).map(row => row.building));
  const pick = row => {
    if (picker === 'recipient') setDraft(service.selectRecipient(draft, row.id));
    else if (picker === 'city') setDraft({ ...draft, city: row.id, building: '', floor: '' });
    else { const location = enabled.find(item => item.building === row.id); setDraft({ ...draft, city: location.city, building: row.id, floor: '' }); }
  };
  const display = (key, label) => <DetailItem label={label}>{draft[key]}</DetailItem>;
  const lookup = (key, label) => <DetailItem label={label}>{readOnly ? (key === 'recipient' ? references.people.find(row => row.id === draft.recipient)?.name : draft[key]) : <LookupInput value={key === 'recipient' ? references.people.find(row => row.id === draft.recipient)?.name : draft[key]} placeholder={'请选择' + label.replace('*', '')} onOpen={() => setPicker(key)} />}</DetailItem>;
  const text = (key, label, multi = false) => <DetailItem label={label} span={multi ? 3 : 1}>{readOnly ? draft[key] : multi ? <Input.TextArea value={draft[key]} onChange={event => patch(key, event.target.value)} /> : <Input value={draft[key]} onChange={event => patch(key, event.target.value)} />}</DetailItem>;
  const save = () => { try { onSave(service.validateDetail(draft)); } catch (error) { message.error(error.message); } };
  return <>
    <Modal open={!picker} title={readOnly ? '转移明细查看' : '转移明细填写'} width={960} onCancel={onCancel} onOk={save} okText="确定" cancelText={readOnly ? '关闭' : '取消'} footer={readOnly ? null : undefined}>
      <DetailGrid>
        {display('tag', '资产标签号')}{display('serial', 'SN号')}{lookup('recipient', '*转入人')}
        {display('plate', '转入板块')}{display('department', '转入部门')}{display('costCenter', '*转入成本中心')}
        {lookup('city', '*City')}{lookup('building', '*Building')}
        <DetailItem label="*Floor">{readOnly ? draft.floor : <Select style={{ width: '100%' }} value={draft.floor || undefined} onChange={next => patch('floor', next)} options={transferChoices(enabled.filter(row => row.city === draft.city && row.building === draft.building).map(row => row.floor)).map(row => ({ value: row.id, label: row.label }))} />}</DetailItem>
        {text('room', 'Room')}
        <DetailItem label="*用途">{readOnly ? draft.purpose : <Select value={draft.purpose || undefined} style={{ width: '100%' }} onChange={next => patch('purpose', next)} options={references.purposes.map(value => ({ value, label: value }))} />}</DetailItem>
        <DetailItem label="*资产状态">{renderApplicationStatus(draft.original.status)}</DetailItem>
        {display('businessLine', '业务线')}{display('project', '项目')}{text('reason', '转移原因')}
        <DetailItem label="*转移日期">{readOnly ? draft.transferDate : <DatePicker value={draft.transferDate ? dayjs(draft.transferDate) : null} onChange={date => patch('transferDate', date ? date.format('YYYY-MM-DD') : '')} style={{ width: '100%' }} />}</DetailItem>
        {text('usageDescription', '使用说明', true)}
        {draft.kind === 'material' && <><DetailItem label="原SN号">{draft.original.serial}</DetailItem>
        <DetailItem label="原NO地点">{draft.original.noLocation}</DetailItem>
        <DetailItem label="原服务">{draft.original.service}</DetailItem>
        <DetailItem label="原子服务">{draft.original.subService}</DetailItem>
        {display('newSerial', '新SN号')}{display('newNoLocation', '新NO地点')}{display('newService', '新服务')}{display('newSubService', '新子服务')}</>}
      </DetailGrid>
    </Modal>
    <SelectModal open={Boolean(picker)} title={'选择' + ({ recipient: '转入人', city: 'City', building: 'Building' }[picker] || '')} onCancel={() => setPicker('')} onSelect={pick} dataSource={options} columns={[{ title: '编码.名称', dataIndex: 'label', width: 300 }]} searchFields={[{ name: 'label', label: '编码或名称', dataIndex: 'label' }]} />
  </>;
}
