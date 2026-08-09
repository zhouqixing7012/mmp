import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Table } from 'antd';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import { mockExcludeSubCats, mockMaterialRequestLimitData } from '../../../../mock/businessRulesMock';

const MaterialRequestLimitView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ name: '', subCat: '', excludeSubCat: [] });
  const [isExcludeSubCatModalOpen, setIsExcludeSubCatModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ name: '', subCat: '', excludeSubCat: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      name: record.name || '',
      subCat: record.subCat || '',
      excludeSubCat: Array.isArray(record.excludeSubCat)
        ? record.excludeSubCat
        : (record.excludeSubCat || '').split(',').filter(Boolean),
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '小类', dataIndex: 'subCat' },
    { title: '排除小类', dataIndex: 'excludeSubCat', render: (value) => Array.isArray(value) ? value.join(', ') : value || '-' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">规则名称:</span>
          <Input placeholder="请输入规则名称" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">小类:</span>
          <Input placeholder="请输入小类" />
        </div>
      </QueryBar>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table
          rowKey="id"
          rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={mockMaterialRequestLimitData}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>

      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增超标规则' : '编辑超标规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规则名称</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">小类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.subCat} onChange={(e) => setFormData({ ...formData, subCat: e.target.value })} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">排除小类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsExcludeSubCatModalOpen(true)}>
              <Input value={Array.isArray(formData.excludeSubCat) ? formData.excludeSubCat.join(', ') : formData.excludeSubCat} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]" />
            <div className="w-[35%] p-2" />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>

      <SelectModal
        multiple
        open={isExcludeSubCatModalOpen}
        title="选择排除小类"
        dataSource={mockExcludeSubCats}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsExcludeSubCatModalOpen(false)}
        onConfirm={(records) => {
          setFormData({ ...formData, excludeSubCat: records.map((record) => record.desc) });
          setIsExcludeSubCatModalOpen(false);
        }}
      />
    </div>
  );
};

export default MaterialRequestLimitView;
