import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Table } from 'antd';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import { mockCompanies, mockPlates, mockAccountBookContentData } from '../../../../mock/businessRulesMock';

const AccountBookContentView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', name: '', cnName: '', enName: '' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', name: '', cnName: '', enName: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      company: record.company || '',
      plate: record.plate || '',
      name: record.name || '',
      cnName: record.cnName || '',
      enName: record.enName || '',
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '标签名中文', dataIndex: 'cnName' },
    { title: '标签名英文', dataIndex: 'enName' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">公司:</span>
          <Input placeholder="请输入公司" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">板块:</span>
          <Input placeholder="请输入板块" />
        </div>
      </QueryBar>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table
          rowKey="id"
          rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={mockAccountBookContentData}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>

      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增账套内容' : '编辑账套内容'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsPlateModalOpen(true)}>
              <Input value={formData.plate} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>账套名称</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="请输入账套名称" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">标签名中文</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.cnName} onChange={(e) => setFormData({ ...formData, cnName: e.target.value })} placeholder="请输入标签名中文" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">标签名英文</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.enName} onChange={(e) => setFormData({ ...formData, enName: e.target.value })} placeholder="请输入标签名英文" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]" />
            <div className="w-[35%] p-2" />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>

      <SelectModal
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({ ...formData, company: `${record.code}.${record.desc}` });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isPlateModalOpen}
        title="选择板块"
        dataSource={mockPlates}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsPlateModalOpen(false)}
        onConfirm={(record) => {
          setFormData({ ...formData, plate: `${record.code}.${record.desc}` });
          setIsPlateModalOpen(false);
        }}
      />
    </div>
  );
};

export default AccountBookContentView;
