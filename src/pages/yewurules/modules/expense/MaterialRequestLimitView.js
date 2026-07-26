import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Select, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockMaterialRequestLimitData } from '../../../../mock/businessRulesMock';

export default function MaterialRequestLimitView() {
  const emptyForm = { name: '', subCat: '', excludeSubCat: [] };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const columns = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '小类', dataIndex: 'subCat' },
    { title: '排除小类', dataIndex: 'excludeSubCat', render: (value) => Array.isArray(value) ? value.join(', ') : value || '-' },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入规则名称" />
      <Input placeholder="请输入物料小类" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
        <Button type="primary" icon={<Plus size={14} />} onClick={() => { setFormData(emptyForm); setOpen(true); }}>新增</Button>
        <Button danger icon={<Trash2 size={14} />} disabled={!selectedRowKeys.length}>删除</Button>
      </div>
      <Table rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockMaterialRequestLimitData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="物资申请超标配置">
      <div className="flex flex-col gap-4 pt-2">
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="规则名称" />
        <Input value={formData.subCat} onChange={(e) => setFormData({ ...formData, subCat: e.target.value })} placeholder="物料小类" />
        <Select mode="multiple" value={formData.excludeSubCat} onChange={(excludeSubCat) => setFormData({ ...formData, excludeSubCat })} placeholder="排除小类" options={[]} />
      </div>
    </Modal>
  </div>;
}
