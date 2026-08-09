import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import { mockCostCenters, mockNOServiceData, mockNOServiceSubjectMappingData, mockPlates, mockSubjects } from '../../../../mock/businessRulesMock';

const NOServiceSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [formData, setFormData] = useState({ service: '', plate: '', costCenter: '', subject: '', enabled: '1' });
  const handleAdd = () => { setModalMode('add'); setFormData({ service: '', plate: '', costCenter: '', subject: '', enabled: '1' }); setIsModalOpen(true); };
  const handleEdit = (record) => { setModalMode('edit'); setFormData({ service: record.service || '', plate: record.plate || '', costCenter: record.costCenter || '', subject: record.subject || '', enabled: record.enabled ? '1' : '0' }); setIsModalOpen(true); };
  const columns = [
    { title: '序号', dataIndex: 'id' }, { title: 'NO一级服务', dataIndex: 'service' }, { title: '板块', dataIndex: 'plate' }, { title: '成本中心', dataIndex: 'costCenter' }, { title: '科目', dataIndex: 'subject' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <QueryItem label="NO一级服务"><Input placeholder="请输入服务" /></QueryItem>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">板块:</span><Input placeholder="请输入板块" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">是否启用:</span><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2"><Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button><Button icon={<Edit size={14} />}>批量修改</Button><Button className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button><Button className="text-red-500" icon={<XCircle size={14} />}>停用</Button></div>
      <Table rowKey="id" rowSelection={{ type:'checkbox', onChange:setSelectedRowKeys }} columns={columns} dataSource={mockNOServiceSubjectMappingData} size="middle" scroll={{x:'max-content'}} pagination={{pageSize:10,showSizeChanger:true,showTotal:(total)=>`共 ${total} 条`}} />
    </div>
    <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增NO一级服务与科目映射' : '编辑NO一级服务与科目映射'} width="900px">
      <div className="border border-[#e8e8e8] text-sm mb-4">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>NO一级服务</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8]"><Select value={formData.service} onChange={(value)=>setFormData({...formData,service:value})} placeholder="请选择" allowClear options={mockNOServiceData.map(item=>({label:`${item.code}.${item.desc}`,value:`${item.code}.${item.desc}`}))} style={{width:'100%'}} /></div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">板块</div>
          <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={()=>setIsPlateModalOpen(true)}><Input value={formData.plate} placeholder="请选择" readOnly className="pointer-events-none"/><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]"/></div>
        </div>
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">成本中心</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={()=>setIsCostCenterModalOpen(true)}><Input value={formData.costCenter} placeholder="请选择" readOnly className="pointer-events-none"/><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]"/></div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium">科目</div>
          <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={()=>setIsSubjectModalOpen(true)}><Input value={formData.subject} placeholder="请选择" readOnly className="pointer-events-none"/><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]"/></div>
        </div>
        <div className="flex min-h-[40px]"><div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium"><span className="text-red-500 mr-1">*</span>是否启用</div><div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4"><Radio checked={formData.enabled==='1'} onChange={()=>setFormData({...formData,enabled:'1'})}>是</Radio><Radio checked={formData.enabled==='0'} onChange={()=>setFormData({...formData,enabled:'0'})}>否</Radio></div><div className="w-[50%]"/></div>
      </div>
      <div className="flex justify-center gap-3 mt-6"><Button type="primary" onClick={()=>setIsModalOpen(false)}>保存</Button><Button onClick={()=>setIsModalOpen(false)}>返回</Button></div>
    </Modal>
    <SelectModal open={isPlateModalOpen} title="选择板块" dataSource={mockPlates} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={()=>setIsPlateModalOpen(false)} onConfirm={(r)=>{setFormData({...formData,plate:`${r.code}.${r.desc}`});setIsPlateModalOpen(false);}} />
    <SelectModal open={isCostCenterModalOpen} title="选择成本中心" dataSource={mockCostCenters} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={()=>setIsCostCenterModalOpen(false)} onConfirm={(r)=>{setFormData({...formData,costCenter:`${r.code}.${r.desc}`});setIsCostCenterModalOpen(false);}} />
    <SelectModal open={isSubjectModalOpen} title="选择科目" dataSource={mockSubjects} columns={[{title:'编码',dataIndex:'code'},{title:'描述',dataIndex:'desc'}]} searchFields={[{label:'编码',name:'code',dataIndex:'code'},{label:'描述',name:'desc',dataIndex:'desc'}]} onCancel={()=>setIsSubjectModalOpen(false)} onConfirm={(r)=>{setFormData({...formData,subject:`${r.code}.${r.desc}`});setIsSubjectModalOpen(false);}} />
  </div>;
};

export default NOServiceSubjectMappingView;
