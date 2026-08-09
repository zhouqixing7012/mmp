import React, { useState } from 'react';
import { Search, Plus, Download, Edit, Trash2, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockWarehousePermissionData,
} from '../../../../mock/businessRulesMock';

const WarehousePermissionView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    warehouse: '', operator: '', 
    inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' 
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ warehouse: '', operator: '', inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ 
      warehouse: record.warehouse, operator: record.operator, 
      inPerm: record.inPerm ? '1' : '0', defaultIn: record.defaultIn ? '1' : '0', 
      outPerm: record.outPerm ? '1' : '0', defaultOut: record.defaultOut ? '1' : '0', 
      invPerm: record.invPerm ? '1' : '0' 
    });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '入库权限', dataIndex: 'inPerm', render: (val) => <StatusTag value={val} /> },
    { title: '默认入库仓库', dataIndex: 'defaultIn', render: (val) => <StatusTag value={val} /> },
    { title: '出库权限', dataIndex: 'outPerm', render: (val) => <StatusTag value={val} /> },
    { title: '默认出库仓库', dataIndex: 'defaultOut', render: (val) => <StatusTag value={val} /> },
    { title: '查看权限', dataIndex: 'invPerm', render: (val) => <StatusTag value={val} /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockWarehousePermissionData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="仓库编号">
          <div className="flex-1 relative">
          <Input placeholder="搜索仓库..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="操作人">
          <div className="flex-1 relative">
          <Input placeholder="搜索操作人..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="入库权限">
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
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.warehouse} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} placeholder="请选择仓库" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>操作人</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.operator} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, operator: e.target.value})} placeholder="请选择操作人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>入库权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.inPerm} onChange={(value) => setFormData({...formData, inPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>出库权限</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.outPerm} onChange={(value) => setFormData({...formData, outPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认入库仓库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.defaultIn} onChange={(value) => setFormData({...formData, defaultIn: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认出库仓库</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.defaultOut} onChange={(value) => setFormData({...formData, defaultOut: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>查看权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.invPerm} onChange={(value) => setFormData({...formData, invPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"></div>
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
    </div>
  );
};

export default WarehousePermissionView;
