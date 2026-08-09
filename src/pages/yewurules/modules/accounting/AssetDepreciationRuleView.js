import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockAssetDepreciationRuleData } from '../../../../mock/businessRulesMock';

const AssetDepreciationRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', subCat: record.subCat || '', originalValue: record.originalValue || '', relation: record.relation || '>=', years: record.years || '', valueType: record.valueType || '' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '原值要求', dataIndex: 'originalValue' },
    { title: '计算关系', dataIndex: 'relation' },
    { title: '使用年限', dataIndex: 'years' },
    { title: '账面金额类型', dataIndex: 'valueType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-[-10px] mt-2 relative z-10 mr-4"><Button>计算</Button></div>
      <QueryBar>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">物料大类:</span><div className="flex-1 relative"><Input placeholder="搜索物料大类..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">物料小类:</span><div className="flex-1 relative"><Input placeholder="搜索物料小类..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">使用年限:</span><Select style={{ width: '100%' }} allowClear options={[{ label: '4年以上', value: '1' }, { label: '4年以内', value: '2' }]} placeholder="请选择..." /></div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button icon={<Edit size={14} />}>编辑</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockAssetDepreciationRuleData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增折旧规则' : '编辑折旧规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>物料大类</div><div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative"><Input value={formData.mainCat} onChange={(e) => setFormData({ ...formData, mainCat: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">物料小类</div><div className="w-[35%] p-2 flex items-center relative"><Input value={formData.subCat} onChange={(e) => setFormData({ ...formData, subCat: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">原值要求</div><div className="w-[35%] p-2 border-r border-[#e8e8e8]"><Input value={formData.originalValue} onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })} /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">计算关系</div><div className="w-[35%] p-2"><Select value={formData.relation} onChange={(value) => setFormData({ ...formData, relation: value })} options={[{ label: '>=', value: '>=' }, { label: '<=', value: '<=' }, { label: '=', value: '=' }]} /></div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">使用年限</div><div className="w-[35%] p-2 border-r border-[#e8e8e8]"><Select value={formData.years} onChange={(value) => setFormData({ ...formData, years: value })} options={[{ label: '4年以上', value: '4年以上' }, { label: '4年以内', value: '4年以内' }, { label: '不限', value: '不限' }]} /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">账面金额类型</div><div className="w-[35%] p-2"><Select value={formData.valueType} onChange={(value) => setFormData({ ...formData, valueType: value })} options={[{ label: '净值', value: '净值' }, { label: '原值', value: '原值' }]} /></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={() => setIsModalOpen(false)}>保存</Button><Button onClick={() => setIsModalOpen(false)}>返回</Button></div>
      </Modal>
    </div>
  );
};

export default AssetDepreciationRuleView;
