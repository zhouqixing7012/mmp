import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Select, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockAssetDepreciationRuleData } from '../../../../mock/businessRulesMock';

export default function AssetDepreciationRuleView() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
  const columns = [
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '原值要求', dataIndex: 'originalValue' },
    { title: '计算关系', dataIndex: 'relation' },
    { title: '使用年限', dataIndex: 'years' },
    { title: '账面金额类型', dataIndex: 'valueType' },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setFormData({ ...formData, ...record }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <Input placeholder="请输入物料大类" />
      <Input placeholder="请输入物料小类" />
      <Select placeholder="请选择使用年限" options={[{ label: '4年以上', value: '4年以上' }, { label: '4年以内', value: '4年以内' }]} />
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
        <Button type="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>新增</Button>
        <Button danger icon={<Trash2 size={14} />} disabled={!selectedRowKeys.length}>删除</Button>
      </div>
      <Table rowKey="id" rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockAssetDepreciationRuleData} pagination={{ pageSize: 10 }} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="资产折旧规则">
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input value={formData.mainCat} onChange={(e) => setFormData({ ...formData, mainCat: e.target.value })} placeholder="物料大类" />
        <Input value={formData.subCat} onChange={(e) => setFormData({ ...formData, subCat: e.target.value })} placeholder="物料小类" />
        <Input value={formData.originalValue} onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })} placeholder="原值要求" />
        <Select value={formData.relation} onChange={(relation) => setFormData({ ...formData, relation })} options={['>=', '<=', '='].map((value) => ({ label: value, value }))} />
        <Input value={formData.years} onChange={(e) => setFormData({ ...formData, years: e.target.value })} placeholder="使用年限" />
        <Select value={formData.valueType} onChange={(valueType) => setFormData({ ...formData, valueType })} options={['净值', '原值'].map((value) => ({ label: value, value }))} />
      </div>
    </Modal>
  </div>;
}
