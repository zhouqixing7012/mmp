import React, { useState } from 'react';
import { Search, Plus, Download, Edit, Trash2, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import SelectModal from '../../../../components/SelectModal';
import { mockCompanies, mockCompanyBelongingAuthData } from '../../../../mock/businessRulesMock';

const CompanyBelongingAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState({ belonging: '焦点', company: '', plate: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ belonging: '焦点', company: '', plate: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ belonging: record.belonging, company: record.company, plate: record.plate });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司归属', dataIndex: 'belonging' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司归属:</span><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '焦点', value: '1' }, { label: '搜狐', value: '2' }]} /></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司:</span><div className="flex-1 relative"><Input placeholder="搜索公司..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div></div>
        <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">板块:</span><div className="flex-1 relative"><Input placeholder="搜索板块..." /><Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div></div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
          <Button icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockCompanyBelongingAuthData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增归属' : '编辑归属'} width="700px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]"><div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>公司归属</div><div className="w-[80%] p-2"><Select value={formData.belonging} onChange={(value) => setFormData({ ...formData, belonging: value })} options={[{ label: '焦点', value: '焦点' }, { label: '搜狐', value: '搜狐' }]} className="max-w-[300px]" /></div></div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]"><div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>公司</div><div className="w-[80%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}><Input value={formData.company} placeholder="请选择" readOnly className="pointer-events-none max-w-[300px]" /><Search className="absolute left-[285px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" /></div></div>
          <div className="flex min-h-[40px]"><div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>板块</div><div className="w-[80%] p-2 flex items-center relative"><Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="请选择" className="max-w-[300px]" /><Search className="absolute left-[285px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div></div>
        </div>
        <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={() => setIsModalOpen(false)}>保存</Button><Button onClick={() => setIsModalOpen(false)}>返回</Button></div>
      </Modal>
      <Modal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} footer={null} title="批量修改" width="400px"><div className="flex flex-col items-center py-6 gap-5"><p className="text-gray-500 mb-2">请选择您要进行的操作</p><div className="flex gap-4"><Button type="primary" icon={<Upload size={14} />}>上传文件</Button><Button icon={<Download size={14} />}>下载模板</Button></div></div></Modal>
      <SelectModal open={isCompanyModalOpen} title="选择公司" dataSource={mockCompanies} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]} searchFields={[{ label: '编码', name: 'code', dataIndex: 'code' }, { label: '描述', name: 'desc', dataIndex: 'desc' }]} onCancel={() => setIsCompanyModalOpen(false)} onConfirm={(record) => { setFormData({ ...formData, company: `${record.code}.${record.desc}` }); setIsCompanyModalOpen(false); }} />
    </div>
  );
};

export default CompanyBelongingAuthView;
