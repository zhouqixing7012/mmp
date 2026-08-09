import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import {
  mockCompanies, mockRealAdmins, mockVirtualAdmins, mockVirtualWarehouseManagerData,
} from '../../../../mock/businessRulesMock';

const VirtualWarehouseManagerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isVirtualAdminModalOpen, setIsVirtualAdminModalOpen] = useState(false);
  const [isRealAdminModalOpen, setIsRealAdminModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', virtualAdmin: '', realAdmin: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', virtualAdmin: '', realAdmin: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, virtualAdmin: record.virtualAdmin, realAdmin: record.realAdmin, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '虚拟库管员', dataIndex: 'virtualAdmin' },
    { title: '仓库管理员', dataIndex: 'realAdmin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockVirtualWarehouseManagerData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">虚拟库管员:</span>
        <div className="flex-1 relative cursor-pointer" onClick={() => setIsVirtualAdminModalOpen(true)}>
          <Input placeholder="请选择虚拟库管员" readOnly className="pointer-events-none" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
        </div>
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>虚拟库管员</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsVirtualAdminModalOpen(true)}>
              <Input value={formData.virtualAdmin} onChange={(e) => setFormData({...formData, virtualAdmin: e.target.value})} placeholder="请选择虚拟库管员" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库管理员</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsRealAdminModalOpen(true)}>
              <Input value={formData.realAdmin} onChange={(e) => setFormData({...formData, realAdmin: e.target.value})} placeholder="请选择仓库管理员" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
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
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '公司编码', dataIndex: 'code' }, { title: '公司描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '公司描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.desc
          });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isVirtualAdminModalOpen}
        title="选择虚拟库管员"
        dataSource={mockVirtualAdmins}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsVirtualAdminModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          virtualAdmin: record.desc
          });
          setIsVirtualAdminModalOpen(false);
        }}
      />
      <SelectModal
        open={isRealAdminModalOpen}
        title="选择仓库管理员"
        dataSource={mockRealAdmins}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsRealAdminModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          realAdmin: record.desc
          });
          setIsRealAdminModalOpen(false);
        }}
      />
    </div>
  );
};

export default VirtualWarehouseManagerMappingView;
