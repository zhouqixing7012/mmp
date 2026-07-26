import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Modal, Radio, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import { mockExpenseAccountRuleData } from '../../../../mock/businessRulesMock';

export default function ExpenseAccountRuleView() {
  const emptyForm = {
    inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '', outSubj: '',
    outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类(输入)', dataIndex: 'inCat' },
    { title: '公司(输入)', dataIndex: 'inComp' },
    { title: '成本中心(输入)', dataIndex: 'inCost' },
    { title: '公司(输出)', dataIndex: 'outComp' },
    { title: '板块(输出)', dataIndex: 'outPlate' },
    { title: '成本中心(输出)', dataIndex: 'outCost' },
    { title: '科目(输出)', dataIndex: 'outSubj' },
    { title: '子目(输出)', dataIndex: 'outSubSubj' },
    { title: '业务线(输出)', dataIndex: 'outLine' },
    { title: '项目(输出)', dataIndex: 'outProj' },
    { title: '往来(输出)', dataIndex: 'outTrans' },
    { title: '备用(输出)', dataIndex: 'outMisc' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', fixed: 'right', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...emptyForm, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  const fields = [
    ['inCat', '物料大类(输入)'], ['inComp', '公司(输入)'], ['inCost', '成本中心(输入)'],
    ['outComp', '公司(输出)'], ['outPlate', '板块(输出)'], ['outCost', '成本中心(输出)'],
    ['outSubj', '科目(输出)'], ['outSubSubj', '子目(输出)'], ['outLine', '业务线(输出)'],
    ['outProj', '项目(输出)'], ['outTrans', '往来(输出)'], ['outMisc', '备用(输出)'],
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入物料大类" />
      <Input placeholder="请输入公司" />
      <Input placeholder="请输入成本中心" />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0]"><Button type="primary" icon={<Plus size={14} />} onClick={() => { setFormData(emptyForm); setOpen(true); }}>新增</Button></div>
      <Table rowKey="id" columns={columns} dataSource={mockExpenseAccountRuleData} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="费用账户规则" width={900}>
      <div className="grid grid-cols-2 gap-4 pt-2">
        {fields.map(([key, label]) => <Input key={key} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} placeholder={label} />)}
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
      </div>
    </Modal>
  </div>;
}
