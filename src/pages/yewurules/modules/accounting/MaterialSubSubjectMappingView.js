import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import { mockMaterialCategories, mockMaterialSubSubjectMappingData, mockSubSubjects } from '../../../../mock/businessRulesMock';

const MaterialSubSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [isSubSubjectModalOpen, setIsSubSubjectModalOpen] = useState(false);
  const [formData, setFormData] = useState({ mainCat: '', subSubj: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', subSubj: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', subSubj: record.subSubj || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '子科目', dataIndex: 'subSubj' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockMaterialSubSubjectMappingData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
          <Input placeholder="请输入物料大类" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">子科目:</span>
          <Input placeholder="请输入子科目" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
          <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
        </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />}>批量修改</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料大类与子目映射' : '编辑物料大类与子目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <Input value={formData.mainCat} onChange={(e) => setFormData({...formData, mainCat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子科目</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsSubSubjectModalOpen(true)}>
              <Input value={formData.subSubj} onChange={(e) => setFormData({...formData, subSubj: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})}>是</Radio>
              <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})}>否</Radio>
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
      <SelectModal open={isMaterialCategoryModalOpen} title="选择物料大类" dataSource={mockMaterialCategories} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]} searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]} onCancel={() => setIsMaterialCategoryModalOpen(false)} onConfirm={(record) => { setFormData({ ...formData, mainCat: `${record.code}.${record.desc}` }); setIsMaterialCategoryModalOpen(false); }} />
      <SelectModal open={isSubSubjectModalOpen} title="选择子科目" dataSource={mockSubSubjects} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]} searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]} onCancel={() => setIsSubSubjectModalOpen(false)} onConfirm={(record) => { setFormData({ ...formData, subSubj: `${record.code}.${record.desc}` }); setIsSubSubjectModalOpen(false); }} />
    </div>
  );
};

export default MaterialSubSubjectMappingView;
