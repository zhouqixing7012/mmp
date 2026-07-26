import React, { useState } from 'react';
import { Edit, Plus } from 'lucide-react';
import { Button, Input, Modal, Radio, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import { mockCostCenterSubjectMappingData } from '../../../../mock/businessRulesMock';

export default function CostCenterSubjectMappingView() {
  const emptyForm = { costCenter: '', cat: '', company: '', subject: '', enabled: '1' };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '大类', dataIndex: 'cat' },
    { title: '公司', dataIndex: 'company' },
    { title: '科目', dataIndex: 'subject' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setMode('edit'); setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入大类" />
      <Input placeholder="请输入公司" />
      <Input placeholder="请输入成本中心" />
      <Input placeholder="请输入科目" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
        <Button type="primary" icon={<Plus size={14} />} onClick={() => { setMode('add'); setFormData(emptyForm); setOpen(true); }}>新增</Button>
        <Button icon={<Edit size={14} />} disabled={!selectedRowKeys.length}>批量修改</Button>
      </div>
      <Table rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockCostCenterSubjectMappingData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title={`${mode === 'add' ? '新增' : '编辑'}成本中心与科目映射`}>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input value={formData.costCenter} onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })} placeholder="成本中心" />
        <Input value={formData.cat} onChange={(e) => setFormData({ ...formData, cat: e.target.value })} placeholder="大类" />
        <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="公司" />
        <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="科目" />
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} />
      </div>
    </Modal>
  </div>;
}
