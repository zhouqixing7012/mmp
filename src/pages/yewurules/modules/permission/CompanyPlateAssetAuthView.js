import React, { useState } from 'react';
import { Search, Plus, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import { mockCompanyPlateAuthData, mockMaterialCategories } from '../../../../mock/businessRulesMock';

const CompanyPlateAssetAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '', enabled: '1' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, materialCat: record.materialCategory, empCompany: record.empCompany, empPlate: record.empPlate, enabled: record.enabled || '1' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <QueryItem label="公司"><div className="flex-1 relative"><Input placeholder="搜索公司..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" /></div></QueryItem>
        <QueryItem label="板块"><div className="flex-1 relative"><Input placeholder="搜索板块..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" /></div></QueryItem>
        <QueryItem label="物料大类"><div className="flex-1 relative"><Input placeholder="搜索物料大类..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" /></div></QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockCompanyPlateAuthData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative"><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative"><Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}><Input value={formData.materialCat} placeholder="请选择" readOnly className="pointer-events-none" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>员工所属公司</div>
            <div className="w-[35%] p-2 flex items-center relative"><Input value={formData.empCompany} onChange={(e) => setFormData({ ...formData, empCompany: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属板块</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative"><Input value={formData.empPlate} onChange={(e) => setFormData({ ...formData, empPlate: e.target.value })} placeholder="请选择" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4"><Radio checked={formData.enabled === '1'} onChange={() => setFormData({ ...formData, enabled: '1' })}>是</Radio><Radio checked={formData.enabled === '0'} onChange={() => setFormData({ ...formData, enabled: '0' })}>否</Radio></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={() => setIsModalOpen(false)}>保存</Button><Button onClick={() => setIsModalOpen(false)}>返回</Button></div>
      </Modal>
      <Modal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} footer={null} title="批量修改" width="400px"><div className="flex flex-col items-center py-6 gap-5"><p className="text-gray-500 mb-2">请选择您要进行的操作</p><div className="flex gap-4"><Button type="primary" icon={<Upload size={14} />}>上传文件</Button><Button icon={<Download size={14} />}>下载模板</Button></div></div></Modal>
      <SelectModal open={isMaterialCategoryModalOpen} title="选择物料大类" dataSource={mockMaterialCategories} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]} searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]} onCancel={() => setIsMaterialCategoryModalOpen(false)} onConfirm={(record) => { setFormData({ ...formData, materialCat: record.desc }); setIsMaterialCategoryModalOpen(false); }} />
    </div>
  );
};

export default CompanyPlateAssetAuthView;
