import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockAccountBookContentData } from '../../../../mock/businessRulesMock';

export default function AccountBookContentView() {
  const emptyForm = { company: '', plate: '', name: '', cnName: '', enName: '' };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '标签名中文', dataIndex: 'cnName' },
    { title: '标签名英文', dataIndex: 'enName' },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setMode('edit'); setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入公司" />
      <Input placeholder="请输入板块" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
        <Button type="primary" icon={<Plus size={14} />} onClick={() => { setMode('add'); setFormData(emptyForm); setOpen(true); }}>新增</Button>
        <Button danger icon={<Trash2 size={14} />} disabled={!selectedRowKeys.length}>删除</Button>
      </div>
      <Table rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockAccountBookContentData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title={`${mode === 'add' ? '新增' : '编辑'}账套内容`}>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="公司" />
        <Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="板块" />
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="账套名称" />
        <Input value={formData.cnName} onChange={(e) => setFormData({ ...formData, cnName: e.target.value })} placeholder="标签名中文" />
        <Input value={formData.enName} onChange={(e) => setFormData({ ...formData, enName: e.target.value })} placeholder="标签名英文" />
      </div>
    </Modal>
  </div>;
}
