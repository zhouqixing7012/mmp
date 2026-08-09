import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Download, Edit, RefreshCcw, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import {
  mockBuildings, mockCities, mockNOLocationData,
} from '../../../../mock/businessRulesMock';

const NOLocationMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', info: '', city: '', building: '', floor: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', info: '', city: '', building: '', floor: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, info: record.info, city: record.city, building: record.building, floor: record.floor, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO地点英文缩写', dataIndex: 'code' },
    { title: 'NO地点中文描述', dataIndex: 'desc' },
    { title: 'NO地点详细信息', dataIndex: 'info' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Building', dataIndex: 'building' },
    { title: 'Floor', dataIndex: 'floor' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockNOLocationData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点英文缩写:</span>
        <Input placeholder="请输入英文缩写" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点中文描述:</span>
        <Input placeholder="请输入中文描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点详细信息:</span>
        <Input placeholder="请输入详细信息" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" className="text-green-600" icon={<RefreshCcw size={14} />}>刷新</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>英文缩写</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入英文缩写" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>中文描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入中文描述" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>详细信息</div>
            <div className="w-[85%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.info} onChange={(e) => setFormData({...formData, info: e.target.value})} placeholder="请输入详细信息" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCityModalOpen(true)}>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Building</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsBuildingModalOpen(true)}>
              <Input value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} placeholder="请选择Building" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Floor</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.floor} onChange={(value) => setFormData({...formData, floor: value})} options={[{label:'缺省', value:'缺省'}, {label:'1层', value:'1层'}, {label:'2层', value:'2层'}, {label:'3层', value:'3层'}, {label:'B1层', value:'B1层'}]} placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
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
      <SelectModal
        open={isBuildingModalOpen}
        title="选择Building"
        dataSource={mockBuildings}
        columns={[{ title: '建筑编码', dataIndex: 'code' }, { title: '建筑描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '建筑编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '建筑描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsBuildingModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          building: record.desc
          });
          setIsBuildingModalOpen(false);
        }}
      />
    </div>
  );
};

export default NOLocationMappingView;
