import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Modal, Radio, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import { mockNOServiceSubjectMappingData } from '../../../../mock/businessRulesMock';

export default function NOServiceSubjectMappingView() {
  const emptyForm = { service: '', plate: '', costCenter: '', subject: '', enabled: '1' };
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO一级服务', dataIndex: 'service' },
    { title: '板块', dataIndex: 'plate' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '科目', dataIndex: 'subject' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入NO一级服务" />
      <Input placeholder="请输入板块" />
      <Input placeholder="请输入成本中心" />
      <Input placeholder="请输入科目" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0]"><Button type="primary" icon={<Plus size={14} />} onClick={() => { setFormData(emptyForm); setOpen(true); }}>新增</Button></div>
      <Table rowKey="id" columns={columns} dataSource={mockNOServiceSubjectMappingData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="NO服务与科目映射">
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} placeholder="NO一级服务" />
        <Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="板块" />
        <Input value={formData.costCenter} onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })} placeholder="成本中心" />
        <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="科目" />
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
      </div>
    </Modal>
  </div>;
}
