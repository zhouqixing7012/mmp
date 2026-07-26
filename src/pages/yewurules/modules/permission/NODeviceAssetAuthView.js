import React, { useState } from 'react';
import { Search, Plus, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import { mockNODeviceAuthData } from '../../../../mock/businessRulesMock';

const NODeviceAssetAuthView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: '服务器', owner: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '服务器', owner: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type, owner: record.owner, enabled: record.enabled || '1' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO设备类型', dataIndex: 'type' },
    { title: '责任人', dataIndex: 'owner' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">NO类型:</span><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '服务器', value: '1' }, { label: '网络设备', value: '2' }]} /></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">员工编号:</span><Input placeholder="请输入编号" /></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">姓名:</span><Input placeholder="请输入姓名" /></div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockNODeviceAuthData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增设备权限' : '编辑设备权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO设备类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center"><Select value={formData.type} onChange={(value) => setFormData({ ...formData, type: value })} options={[{ label: '服务器', value: '服务器' }, { label: '网络设备', value: '网络设备' }]} placeholder="请选择" allowClear /></div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>责任人</div>
            <div className="w-[35%] p-2 flex items-center relative"><Input value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="请选择责任人" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4"><Radio checked={formData.enabled === '1'} onChange={() => setFormData({ ...formData, enabled: '1' })}>是</Radio><Radio checked={formData.enabled === '0'} onChange={() => setFormData({ ...formData, enabled: '0' })}>否</Radio></div>
            <div className="w-[50%]" />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={() => setIsModalOpen(false)}>保存</Button><Button onClick={() => setIsModalOpen(false)}>返回</Button></div>
      </Modal>
      <Modal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} footer={null} title="批量修改" width="400px"><div className="flex flex-col items-center py-6 gap-5"><p className="text-gray-500 mb-2">请选择您要进行的操作</p><div className="flex gap-4"><Button type="primary" icon={<Upload size={14} />}>上传文件</Button><Button icon={<Download size={14} />}>下载模板</Button></div></div></Modal>
    </div>
  );
};

export default NODeviceAssetAuthView;
