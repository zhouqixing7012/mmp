import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Modal, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockEmployeeProjectMappingData } from '../../../../mock/businessRulesMock';

export default function EmployeeProjectMappingView() {
  const emptyForm = { empNo: '', empName: '', projName: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '员工编号', dataIndex: 'empNo' },
    { title: '员工姓名', dataIndex: 'empName' },
    { title: '项目名称', dataIndex: 'projName' },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入员工编号" />
      <Input placeholder="请输入员工姓名" />
      <Input placeholder="请输入项目名称" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0]"><Button type="primary" icon={<Plus size={14} />} onClick={() => { setFormData(emptyForm); setOpen(true); }}>新增</Button></div>
      <Table rowKey="id" columns={columns} dataSource={mockEmployeeProjectMappingData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="员工与项目映射">
      <div className="flex flex-col gap-4 pt-2">
        <Input value={formData.empNo} onChange={(e) => setFormData({ ...formData, empNo: e.target.value })} placeholder="员工编号" />
        <Input value={formData.empName} onChange={(e) => setFormData({ ...formData, empName: e.target.value })} placeholder="员工姓名" />
        <Input value={formData.projName} onChange={(e) => setFormData({ ...formData, projName: e.target.value })} placeholder="项目名称" />
      </div>
    </Modal>
  </div>;
}
