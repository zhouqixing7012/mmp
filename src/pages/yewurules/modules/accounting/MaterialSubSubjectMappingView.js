import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Modal, Radio, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import { mockMaterialSubSubjectMappingData } from '../../../../mock/businessRulesMock';

export default function MaterialSubSubjectMappingView() {
  const emptyForm = { mainCat: '', subSubj: '', enabled: '1' };
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '子科目', dataIndex: 'subSubj' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar><Input placeholder="请输入物料大类" /><Input placeholder="请输入子科目" /></QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0]"><Button type="primary" icon={<Plus size={14} />} onClick={() => { setFormData(emptyForm); setOpen(true); }}>新增</Button></div>
      <Table rowKey="id" columns={columns} dataSource={mockMaterialSubSubjectMappingData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="物料大类与子科目映射">
      <div className="flex flex-col gap-4 pt-2">
        <Input value={formData.mainCat} onChange={(e) => setFormData({ ...formData, mainCat: e.target.value })} placeholder="物料大类" />
        <Input value={formData.subSubj} onChange={(e) => setFormData({ ...formData, subSubj: e.target.value })} placeholder="子科目" />
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
      </div>
    </Modal>
  </div>;
}
