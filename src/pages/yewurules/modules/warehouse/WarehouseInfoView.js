import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Search, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio, DatePicker } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockWarehouseInfoData,
} from '../../../../mock/businessRulesMock';

const WarehouseInfoView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
    company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
    isEnabled: '1', startDate: '', endDate: ''
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
      company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: '1', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      code: record.code, desc: record.desc, city: record.city || '', building: '', floor: '', address: '', 
      type: '', usage: record.usage, company: record.company, admin: record.admin,
      isVirtual: record.isVirtual ? '1' : '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: record.enabled ? '1' : '0', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库编码', dataIndex: 'code' },
    { title: '仓库描述', dataIndex: 'desc' },
    { title: '仓库用途', dataIndex: 'usage' },
    { title: '是否虚拟库', dataIndex: 'isVirtual', render: (val) => <StatusTag value={val} /> },
    { title: '公司', dataIndex: 'company' },
    { title: 'City', dataIndex: 'city' },
    { title: '库管员', dataIndex: 'admin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockWarehouseInfoData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <QueryItem label="仓库编码">
          <Input placeholder="请输入仓库编码" />
        </QueryItem>
        <QueryItem label="仓库描述">
          <Input placeholder="请输入仓库描述" />
        </QueryItem>
        <QueryItem label="是否虚拟库">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
        </QueryItem>
        <QueryItem label="是否启用">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-[#f0f0f0] bg-white flex gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title="仓库信息" width="850px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库编码</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>城市</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>楼栋</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">楼层</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.floor} onChange={(value) => setFormData({...formData, floor: value})} options={[]} placeholder="请选择" allowClear className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库地址</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[]} placeholder="请选择" allowClear className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库用途</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>管理员</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.admin} onChange={(e) => setFormData({...formData, admin: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否虚拟库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.isVirtual === '1'} onChange={() => setFormData({...formData, isVirtual: '1'})}>是</Radio>
              <Radio checked={formData.isVirtual === '0'} onChange={() => setFormData({...formData, isVirtual: '0'})}>否</Radio>
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <Radio checked={formData.isEnabled === '1'} onChange={() => setFormData({...formData, isEnabled: '1'})}>是</Radio>
              <Radio checked={formData.isEnabled === '0'} onChange={() => setFormData({...formData, isEnabled: '0'})}>否</Radio>
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">启用日期</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <DatePicker value={formData.startDate ? dayjs(formData.startDate) : null} onChange={(date, dateString) => setFormData({...formData, startDate: dateString})} placeholder="请选择启用日期" className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">停用日期</div>
            <div className="w-[35%] p-2 flex items-center">
              <DatePicker value={formData.endDate ? dayjs(formData.endDate) : null} onChange={(date, dateString) => setFormData({...formData, endDate: dateString})} placeholder="请选择停用日期" className="w-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
    </div>
  )
}

export default WarehouseInfoView;
