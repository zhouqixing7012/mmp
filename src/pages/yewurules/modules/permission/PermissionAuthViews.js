import React, { useMemo, useState } from 'react';
import { Download, Edit, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Button, Input, Modal, Radio, Select, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import {
  mockCompanyBelongingAuthData,
  mockCompanyPlateAuthData,
  mockNODeviceAuthData,
} from '../../../../mock/businessRulesMock';

const SearchInput = ({ placeholder }) => (
  <div className="flex-1 relative">
    <Input placeholder={placeholder} />
    <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" />
  </div>
);

const BatchModal = ({ open, onClose }) => (
  <Modal open={open} onCancel={onClose} footer={null} title="批量修改" width="400px">
    <div className="flex flex-col items-center py-6 gap-5">
      <p className="text-gray-500">请选择您要进行的操作</p>
      <div className="flex gap-4">
        <Button type="primary" icon={<Upload size={14} />}>上传文件</Button>
        <Button icon={<Download size={14} />}>下载模板</Button>
      </div>
    </div>
  </Modal>
);

const Toolbar = ({ onAdd, onBatch, selectedCount, deletable = false }) => (
  <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
    <Button type="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
    {deletable && <Button danger disabled={!selectedCount} icon={<Trash2 size={14} />}>删除</Button>}
    <Button icon={<Edit size={14} />} onClick={onBatch}>批量修改</Button>
  </div>
);

const AuthTable = ({ columns, data, selectedRowKeys, setSelectedRowKeys }) => (
  <Table
    rowKey="id"
    rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }}
    columns={columns}
    dataSource={data}
    size="middle"
    scroll={{ x: 'max-content' }}
    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
  />
);

export const CompanyPlateAssetAuthView = () => {
  const emptyForm = { company: '', plate: '', materialCat: '', empCompany: '', empPlate: '', enabled: '1' };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const columns = useMemo(() => [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', fixed: 'right', render: (_, record) => <Button type="link" onClick={() => { setMode('edit'); setFormData({ company: record.company || '', plate: record.plate || '', materialCat: record.materialCategory || '', empCompany: record.empCompany || '', empPlate: record.empPlate || '', enabled: record.enabled || '1' }); setOpen(true); }}>编辑</Button> },
  ], []);
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司:</span><SearchInput placeholder="搜索公司..." /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">板块:</span><SearchInput placeholder="搜索板块..." /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">物料大类:</span><SearchInput placeholder="搜索物料大类..." /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <Toolbar onAdd={() => { setMode('add'); setFormData(emptyForm); setOpen(true); }} onBatch={() => setBatchOpen(true)} selectedCount={selectedRowKeys.length} />
      <AuthTable columns={columns} data={mockCompanyPlateAuthData} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} title={mode === 'add' ? '新增权限' : '编辑权限'} onOk={() => setOpen(false)} width={760}>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="公司" />
        <Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="板块" />
        <Input value={formData.materialCat} onChange={(e) => setFormData({ ...formData, materialCat: e.target.value })} placeholder="物料大类" />
        <Input value={formData.empCompany} onChange={(e) => setFormData({ ...formData, empCompany: e.target.value })} placeholder="员工所属公司" />
        <Input value={formData.empPlate} onChange={(e) => setFormData({ ...formData, empPlate: e.target.value })} placeholder="员工所属板块" />
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
      </div>
    </Modal>
    <BatchModal open={batchOpen} onClose={() => setBatchOpen(false)} />
  </div>;
};

export const NODeviceAssetAuthView = () => {
  const emptyForm = { type: '服务器', owner: '', enabled: '1' };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const columns = [
    { title: '序号', dataIndex: 'id' }, { title: 'NO设备类型', dataIndex: 'type' }, { title: '责任人', dataIndex: 'owner' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setMode('edit'); setFormData({ type: record.type || '', owner: record.owner || '', enabled: record.enabled || '1' }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <div className="flex items-center gap-2"><span className="w-24 text-right text-sm text-gray-600">NO设备类型:</span><Select style={{ width: '100%' }} allowClear options={[{ label: '服务器', value: '服务器' }, { label: '网络设备', value: '网络设备' }]} /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">员工编号:</span><Input placeholder="请输入员工编号" /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">姓名:</span><Input placeholder="请输入姓名" /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <Toolbar onAdd={() => { setMode('add'); setFormData(emptyForm); setOpen(true); }} onBatch={() => setBatchOpen(true)} selectedCount={selectedRowKeys.length} />
      <AuthTable columns={columns} data={mockNODeviceAuthData} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} title={mode === 'add' ? '新增设备权限' : '编辑设备权限'} onOk={() => setOpen(false)}>
      <div className="flex flex-col gap-4 pt-2">
        <Select value={formData.type} onChange={(type) => setFormData({ ...formData, type })} options={[{ label: '服务器', value: '服务器' }, { label: '网络设备', value: '网络设备' }]} />
        <Input value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="责任人" />
        <Radio.Group value={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.value })} options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} />
      </div>
    </Modal>
    <BatchModal open={batchOpen} onClose={() => setBatchOpen(false)} />
  </div>;
};

export const CompanyBelongingAuthView = () => {
  const emptyForm = { belonging: '焦点', company: '', plate: '' };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const columns = [
    { title: '序号', dataIndex: 'id' }, { title: '公司归属', dataIndex: 'belonging' }, { title: '公司', dataIndex: 'company' }, { title: '板块', dataIndex: 'plate' },
    { title: '操作', render: (_, record) => <Button type="link" onClick={() => { setMode('edit'); setFormData({ belonging: record.belonging || '', company: record.company || '', plate: record.plate || '' }); setOpen(true); }}>编辑</Button> },
  ];
  return <div className="flex flex-col gap-4">
    <QueryBar>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司归属:</span><Select style={{ width: '100%' }} allowClear options={[{ label: '焦点', value: '焦点' }, { label: '搜狐', value: '搜狐' }]} /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">公司:</span><SearchInput placeholder="搜索公司..." /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">板块:</span><SearchInput placeholder="搜索板块..." /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <Toolbar deletable onAdd={() => { setMode('add'); setFormData(emptyForm); setOpen(true); }} onBatch={() => setBatchOpen(true)} selectedCount={selectedRowKeys.length} />
      <AuthTable columns={columns} data={mockCompanyBelongingAuthData} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />
    </div>
    <Modal open={open} onCancel={() => setOpen(false)} title={mode === 'add' ? '新增归属' : '编辑归属'} onOk={() => setOpen(false)}>
      <div className="flex flex-col gap-4 pt-2">
        <Select value={formData.belonging} onChange={(belonging) => setFormData({ ...formData, belonging })} options={[{ label: '焦点', value: '焦点' }, { label: '搜狐', value: '搜狐' }]} />
        <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="公司" />
        <Input value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="板块" />
      </div>
    </Modal>
    <BatchModal open={batchOpen} onClose={() => setBatchOpen(false)} />
  </div>;
};
