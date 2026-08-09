import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import {
  mockAssetAllocationRuleData, mockReceiptRuleManagementData,
} from '../../../../mock/businessRulesMock';

export const ReceiptRuleManagementView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type || '', prefix: record.prefix || '', separator: record.separator || '', hasCompany: record.hasCompany ? '1' : '0', dateType: record.dateType || '', serialType: record.serialType || '' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '单据类型', dataIndex: 'type' },
    { title: '前缀', dataIndex: 'prefix' },
    { title: '分隔符', dataIndex: 'separator' },
    { title: '是否包含公司缩写', dataIndex: 'hasCompany', render: (val) => <StatusTag value={val} /> },
    { title: '日期类型', dataIndex: 'dateType' },
    { title: '流水号类型', dataIndex: 'serialType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockReceiptRuleManagementData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">单据类型:</span>
        <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'员工信息', value:'1'}, {label:'资产调拨', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">前缀:</span>
        <Input placeholder="请输入前缀" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">分隔符:</span>
        <Input placeholder="请输入分隔符" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col h-full relative">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <div className="flex-1 overflow-x-auto">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
        <div className="p-4 bg-[#fff1f0] border-t border-[#ffccc7] text-[#ff4d4f] text-sm">
          <div className="font-semibold mb-1">规范说明：</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>单据编号规则必须包含有单据类型</li>
            <li>单据前缀及其连缀符仅在规则生成时使用</li>
          </ol>
        </div>
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增规则' : '编辑规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>单据类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[{label:'员工信息', value:'员工信息'}, {label:'资产调拨', value:'资产调拨'}]} placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">前缀</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.prefix} onChange={(e) => setFormData({...formData, prefix: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">分隔符</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.separator} onChange={(e) => setFormData({...formData, separator: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否包含公司缩写</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.hasCompany} onChange={(value) => setFormData({...formData, hasCompany: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">日期类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.dateType} onChange={(value) => setFormData({...formData, dateType: value})} options={[{label:'年月日', value:'年月日'}, {label:'年月', value:'年月'}]} placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">流水号类型</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.serialType} onChange={(value) => setFormData({...formData, serialType: value})} options={[{label:'5位流水号', value:'5位流水号'}, {label:'4位流水号', value:'4位流水号'}]} placeholder="请选择" allowClear />
            </div>
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

export const AssetAllocationRuleView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '影像器材配给方案名称', dataIndex: 'name' },
    { title: '影像器材配给方案描述', dataIndex: 'desc' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '资产级别', dataIndex: 'level' },
    { title: '数量', dataIndex: 'qty' },
    { title: '操作', dataIndex: 'action', render: () => <Button type="link">操作</Button> }
  ];
  const data = mockAssetAllocationRuleData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案名称:</span>
        <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'高配影像器材', value:'1'}, {label:'标配影像器材', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案描述:</span>
        <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'方案1', value:'1'}, {label:'方案2', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">资产级别:</span>
        <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'高端', value:'1'}, {label:'中低端', value:'2'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
