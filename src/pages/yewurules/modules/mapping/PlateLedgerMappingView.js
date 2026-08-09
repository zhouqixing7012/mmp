import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import {
  mockPlateLedgerData,
} from '../../../../mock/businessRulesMock';

const PlateLedgerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ plate: '', ledger: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ plate: '', ledger: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ plate: record.plate, ledger: record.ledger, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账簿', dataIndex: 'ledger' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockPlateLedgerData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">账簿:</span>
        <Input placeholder="请输入账簿" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="全部" 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>账簿</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.ledger} onChange={(e) => setFormData({...formData, ledger: e.target.value})} placeholder="请选择账簿" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.enabled} onChange={(value) => setFormData({...formData, enabled: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
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
    </div>
  );
};

export default PlateLedgerMappingView;
