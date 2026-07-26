import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import { mockCompanies, mockCostCenterSubjectMappingData, mockCostCenters, mockMaterialCategories, mockSubjects } from '../../../../mock/businessRulesMock';

const CostCenterSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' });
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const handleAdd = () => { setModalMode('add'); setFormData({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' }); setIsModalOpen(true); };
  const handleEdit = (record) => { setModalMode('edit'); setFormData({ costCenter: record.costCenter || '', costCenterDesc: record.costCenterDesc || '', cat: record.cat || '', company: record.company || '', subject: record.subject || '', subjectDesc: record.subjectDesc || '', enabled: record.enabled ? '1' : '0' }); setIsModalOpen(true); };
  const columns = [
    { title: '序号', dataIndex: 'id' }, { title: '成本中心', dataIndex: 'costCenter' }, { title: '大类', dataIndex: 'cat' }, { title: '公司', dataIndex: 'company' }, { title: '科目', dataIndex: 'subject' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">大类:</span><Input placeholder="请输入大类" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司:</span><Input placeholder="请输入公司" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">成本中心:</span><Input placeholder="请输入成本中心" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">科目:</span><Input placeholder="请输入科目" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">是否启用:</span><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
        <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button><Button icon={<Edit size={14} />}>批量修改</Button><Button className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button><Button className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
      </div>
      <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={mockCostCenterSubjectMappingData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </div>
    <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增成本中心与科目映射' : '编辑成本中心与科目映射'} width="900px">
      <div className="border border-[#e8e8e8] text-sm mb-4">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>成本中心</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCostCenterModalOpen(true)}><Input value={formData.costCenter} placeholder="请选择" readOnly className="pointer-events-none" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">大类</div>
          <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsCatModalOpen(true)}><Input value={formData.cat} placeholder="请选择" readOnly className="pointer-events-none" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
        </div>
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">公司</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}><Input value={formData.company} placeholder="请选择" readOnly className="pointer-events-none" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">科目</div>
          <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsSubjectModalOpen(true)}><Input value={formData.subject} placeholder="请选择" readOnly className="pointer-events-none" /><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div>
        </div>
        <div className="flex min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>是否启用</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4"><Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled:'1'})}>是</Radio><Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled:'0'})}>否</Radio></div><div className="w-[50%]" />
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={() => setIsModalOpen(false)}>保存</Button><Button onClick={() => setIsModalOpen(false)}>返回</Button></div>
    </Modal>
    <SelectModal open={isCompanyModalOpen} title="选择公司" dataSource={mockCompanies} columns={[{title:'公司编码',dataIndex:'code'},{title:'公司描述',dataIndex:'desc'}]} searchFields={[{label:'公司编码',name:'code',dataIndex:'code'},{label:'公司描述',name:'desc',dataIndex:'desc'}]} onCancel={() => setIsCompanyModalOpen(false)} onConfirm={(r) => { setFormData({...formData, company:`${r.code}.${r.desc}`}); setIsCompanyModalOpen(false); }} />
    <SelectModal open={isCostCenterModalOpen} title="选择成本中心" dataSource={mockCostCenters} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={() => setIsCostCenterModalOpen(false)} onConfirm={(r) => { setFormData({...formData, costCenter:`${r.code}.${r.desc}`}); setIsCostCenterModalOpen(false); }} />
    <SelectModal open={isCatModalOpen} title="选择大类" dataSource={mockMaterialCategories} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={() => setIsCatModalOpen(false)} onConfirm={(r) => { setFormData({...formData, cat:`${r.code}.${r.desc}`}); setIsCatModalOpen(false); }} />
    <SelectModal open={isSubjectModalOpen} title="选择科目" dataSource={mockSubjects} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={() => setIsSubjectModalOpen(false)} onConfirm={(r) => { setFormData({...formData, subject:`${r.code}.${r.desc}`}); setIsSubjectModalOpen(false); }} />
  </div>;
};

export default CostCenterSubjectMappingView;
