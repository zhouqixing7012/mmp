import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockMaterialCategories, mockSubCategoryData,
} from '../../../../mock/businessRulesMock';

const MaterialSubCategoryView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1'
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCatCode: '001', mainCatDesc: record.catDesc, subDesc: record.subDesc, enabled: record.enabled ? '1' : '0', mis: record.mis ? '1' : '0', borrowable: record.borrowable ? '1' : '0', pcPart: record.pcPart ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类描述', dataIndex: 'catDesc' },
    { title: '物料小类编号', dataIndex: 'subCode' },
    { title: '物料小类描述', dataIndex: 'subDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '标签生成规则', dataIndex: 'rule' },
    { title: '是否允许借用', dataIndex: 'borrowable', render: (val) => <StatusTag value={val} /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockSubCategoryData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="物料大类">
          <div className="relative w-full cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
            <Input placeholder="请选择物料大类" readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
      <QueryItem label="物料小类编号">
          <Input placeholder="请输入小类编号" />
        </QueryItem>
      <QueryItem label="物料小类描述">
          <Input placeholder="请输入小类描述" />
        </QueryItem>
      <QueryItem label="是否启用">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料小类' : '编辑物料小类'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
              {modalMode === 'edit'? (
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <Input value={formData.mainCatCode && formData.mainCatDesc ? formData.mainCatCode + " - " + formData.mainCatDesc : ""} disabled />
                </div>
              ) : (
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
                  <Input value={formData.mainCatCode && formData.mainCatDesc ? formData.mainCatCode + " - " + formData.mainCatDesc : ""} placeholder="请选择物料大类" readOnly className="pointer-events-none" />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                </div>
              )}
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类描述</div>
              <div className="w-[35%] p-2 flex items-center">
                <Input value={formData.subDesc} onChange={(e) => setFormData({...formData, subDesc: e.target.value})} />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
                <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
                <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否允许借用</div>
              <div className="w-[35%] p-2 flex items-center gap-4 px-3">
                <Radio checked={formData.borrowable === '1'} onChange={() => setFormData({...formData, borrowable: '1'})} label="是" />
                <Radio checked={formData.borrowable === '0'} onChange={() => setFormData({...formData, borrowable: '0'})} label="否" />
              </div>
            </div>
          </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
      <Modal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} footer={null} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <Button type="primary" icon={<Upload size={14} />}>上传文件</Button>
            <Button type="default" icon={<Download size={14} />}>下载模板</Button>
          </div>
        </div>
      </Modal>
      <SelectModal
        open={isMaterialCategoryModalOpen}
        title="选择物料大类"
        dataSource={mockMaterialCategories}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsMaterialCategoryModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          mainCatCode: record.code,
          mainCatDesc: record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
    </div>
  );
};

export default MaterialSubCategoryView;
