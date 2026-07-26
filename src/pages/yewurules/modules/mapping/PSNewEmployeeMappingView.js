import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockCities, mockCompanies, mockPSNewEmployeeMappingData,
} from '../../../../mock/businessRulesMock';

const PSNewEmployeeMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', config: '', city: '', desc: '', qty: '', dept: '', enabled: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', config: '', city: '', desc: '', qty: '1', dept: 'MIS', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, config: record.config, city: record.city, desc: record.desc, qty: record.qty, dept: record.dept, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '资产配置', dataIndex: 'config' },
    { title: 'City', dataIndex: 'city' },
    { title: '物料描述', dataIndex: 'desc' },
    { title: '数量', dataIndex: 'qty' },
    { title: '处理部门', dataIndex: 'dept' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockPSNewEmployeeMappingData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="资产配置">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'标准台式设计机', value:'1'}]} 
            />
        </QueryItem>
      <QueryItem label="公司">
          <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="City">
          <div className="flex-1 relative">
          <Input placeholder="搜索City..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="物料描述">
          <div className="flex-1 relative">
          <Input placeholder="搜索物料描述..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="数量">
          <Input placeholder="请输入数量" />
        </QueryItem>
      <QueryItem label="处理部门">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'MIS', value:'1'}, {label:'ES', value:'0'}]} 
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
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>资产配置</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.config} onChange={(value) => setFormData({...formData, config: value})} options={[{label:'标准台式设计机', value:'标准台式设计机'}, {label:'标准笔记本配置', value:'标准笔记本配置'}]} placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCityModalOpen(true)}>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料描述</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请选择物料描述" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>处理部门</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.dept} onChange={(value) => setFormData({...formData, dept: value})} options={[{label:'MIS', value:'MIS'}, {label:'ES', value:'ES'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>数量</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input type="number" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="请输入数量" min={0} />
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
        open={isCityModalOpen}
        title="选择City"
        dataSource={mockCities}
        columns={[{ title: '城市编码', dataIndex: 'code' }, { title: '城市描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '城市编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '城市描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCityModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          city: record.desc
          });
          setIsCityModalOpen(false);
        }}
      />
    </div>
  );
};

export default PSNewEmployeeMappingView;
