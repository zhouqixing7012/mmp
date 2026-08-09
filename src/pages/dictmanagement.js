import React, { useState } from 'react';
import { Button, Input, Select, Table, Modal, InputNumber, Tag } from 'antd';
import { Plus, CheckCircle, XCircle, ArrowLeft, Search } from 'lucide-react';
import QueryBar, { QueryItem } from '../components/QueryBar';

const mockDictData = Array.from({ length: 130 }, (_, i) => {
  const baseDicts = [
    { dictCode: 'misView', dictName: 'mis鉴定结果', description: 'mis鉴定结果字典' },
    { dictCode: 'cs', dictName: 'cs字典', description: 'cs字典描述' },
    { dictCode: 'Y_OR_N', dictName: '是否', description: '是否选择字典' },
  ];
  const base = baseDicts[i % 3];
  const page = Math.floor(i / 3) + 1;
  const suffix = page > 1 ? 'I' + page : '';
  return { ...base, id: i + 1, dictCode: suffix ? base.dictCode + suffix : base.dictCode, dictName: suffix ? base.dictName + suffix : base.dictName };
});

const mockDictItemData = [
  { id: 1, itemCode: 'misApprove', itemName: '鉴定通过', dictCode: 'misView', dictName: 'mis鉴定结果', description: '鉴定通过', status: '启用', priority: 0 },
  { id: 2, itemCode: 'misDecline', itemName: '鉴定不通过', dictCode: 'misView', dictName: 'mis鉴定结果', description: '鉴定不通过', status: '启用', priority: 0 },
  { id: 3, itemCode: 'Y', itemName: '是', dictCode: 'Y_OR_N', dictName: '是否', description: '是', status: '启用', priority: 0 },
  { id: 4, itemCode: 'N', itemName: '否', dictCode: 'Y_OR_N', dictName: '是否', description: '否', status: '启用', priority: 0 },
];

function DictAddModal({ open, onClose }) {
  const [values, setValues] = useState({ dictCode: '', dictName: '', description: '' });
  const handleSave = () => {
    if (!values.dictCode || !values.dictName) return;
    console.log('Save:', values);
    setValues({ dictCode: '', dictName: '', description: '' });
    onClose();
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="字典-新增" width="900px" destroyOnClose>
      <div className="border border-[#e8e8e8] text-sm mb-4">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典编码</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
            <Input value={values.dictCode} onChange={(e) => setValues({...values, dictCode: e.target.value})} placeholder="请输入字典编码" />
          </div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典名称</div>
          <div className="w-[35%] p-2 flex items-center">
            <Input value={values.dictName} onChange={(e) => setValues({...values, dictName: e.target.value})} placeholder="请输入字典名称" />
          </div>
        </div>
        <div className="flex min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">描述</div>
          <div className="w-[85%] p-2 flex items-center">
            <Input.TextArea rows={4} value={values.description} onChange={(e) => setValues({...values, description: e.target.value})} placeholder="请输入描述" />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <Button type="primary" onClick={handleSave} className="px-6">保存</Button>
        <Button type="default" onClick={onClose} className="px-6">返回</Button>
      </div>
    </Modal>
  );
}

function DictItemAddModal({ open, onClose, dictCode, dictName }) {
  const [values, setValues] = useState({ itemCode: '', itemName: '', priority: 0, status: '启用', description: '' });
  const handleSave = () => {
    if (!values.itemCode || !values.itemName) return;
    console.log('Save item:', { ...values, dictCode, dictName });
    onClose();
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="字典项-新增" width="900px" destroyOnClose>
      <div className="border border-[#e8e8e8] text-sm mb-4">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典编码</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
            <Input value={dictCode} disabled />
          </div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典名称</div>
          <div className="w-[35%] p-2 flex items-center">
            <Input value={dictName} disabled />
          </div>
        </div>
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典项编码</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
            <Input value={values.itemCode} onChange={(e) => setValues({...values, itemCode: e.target.value})} placeholder="请输入字典项编码" />
          </div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>字典项名称</div>
          <div className="w-[35%] p-2 flex items-center">
            <Input value={values.itemName} onChange={(e) => setValues({...values, itemName: e.target.value})} placeholder="请输入字典项名称" />
          </div>
        </div>
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">字典优先级</div>
          <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
            <InputNumber min={0} value={values.priority} onChange={(val) => setValues({...values, priority: val})} style={{ width: '100%' }} />
          </div>
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">状态</div>
          <div className="w-[35%] p-2 flex items-center">
            <Select value={values.status} onChange={(val) => setValues({...values, status: val})} style={{ width: '100%' }} options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} />
          </div>
        </div>
        <div className="flex min-h-[40px]">
          <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">描述</div>
          <div className="w-[85%] p-2 flex items-center">
            <Input.TextArea rows={4} value={values.description} onChange={(e) => setValues({...values, description: e.target.value})} placeholder="请输入描述" />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <Button type="primary" onClick={handleSave} className="px-6">保存</Button>
        <Button type="default" onClick={onClose} className="px-6">返回</Button>
      </div>
    </Modal>
  );
}

export default function DictManagementView() {
  const [viewMode, setViewMode] = useState('list');
  const [selectedDict, setSelectedDict] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  if (viewMode === 'item' && selectedDict) {
    return (
      <div className="flex flex-col gap-4">
        <QueryBar onQuery={() => {}} onReset={() => {}}>
          <QueryItem label="查询">
            <Select style={{ width: '100%' }} defaultValue="all" options={[{ label: '全部', value: 'all' }]} />
          </QueryItem>
          <QueryItem label="字典编码">
            <Input placeholder="请输入字典编码" />
          </QueryItem>
          <QueryItem label="字典名称">
            <Input placeholder="请输入字典名称" />
          </QueryItem>
          <QueryItem label="字典项编码">
            <Input placeholder="请输入字典项编码" />
          </QueryItem>
          <QueryItem label="字典项名称">
            <Input placeholder="请输入字典项名称" />
          </QueryItem>
        </QueryBar>
        <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
          <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setAddItemModalOpen(true)}>新增</Button>
            <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
            <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
            <Button type="default" icon={<ArrowLeft size={14} />} onClick={() => setViewMode('list')}>返回</Button>
          </div>
          <Table
            rowKey="id"
            rowSelection={{ type: 'checkbox', onChange: () => {} }}
            columns={[
              { title: '字典项编码', dataIndex: 'itemCode' },
              { title: '字典项名称', dataIndex: 'itemName' },
              { title: '字典编码', dataIndex: 'dictCode' },
              { title: '字典名称', dataIndex: 'dictName' },
              { title: '描述', dataIndex: 'description' },
              { title: '状态', dataIndex: 'status', render: (val) => <Tag color={val === '启用' ? 'green' : 'default'}>{val}</Tag> },
            ]}
            dataSource={mockDictItemData}
            pagination={{ pageSize: 10, showQuickJumper: true, showSizeChanger: false, total: mockDictItemData.length, showTotal: (total) => `共 ${total} 条` }}
            size="middle" scroll={{ x: 'max-content' }}
          />
        </div>
        <DictItemAddModal open={addItemModalOpen} onClose={() => setAddItemModalOpen(false)} dictCode={selectedDict.dictCode} dictName={selectedDict.dictName} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <QueryBar buttons={<Button type="primary" icon={<Search size={14} />} onClick={() => {}}>查询</Button>}>
        <QueryItem label="字典编码">
          <Input placeholder="请输入字典编码" />
        </QueryItem>
        <QueryItem label="字典名称">
          <Input placeholder="请输入字典名称" />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setAddModalOpen(true)}>新增</Button>
        </div>
        <Table
          rowKey="id"
          rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }}
          columns={[
            { title: '字典编码', dataIndex: 'dictCode' },
            { title: '字典名称', dataIndex: 'dictName' },
            { title: '描述', dataIndex: 'description' },
            { title: '字典明细', render: (_, record) => <Button type="link" onClick={() => { setSelectedDict(record); setViewMode('item'); }}>管理</Button> }
          ]}
          dataSource={mockDictData.slice((currentPage - 1) * 10, currentPage * 10)}
          pagination={{ current: currentPage, total: 130, pageSize: 10, showQuickJumper: true, showSizeChanger: false, showTotal: (total) => `共 ${total} 条`, onChange: (page) => setCurrentPage(page) }}
          size="middle" scroll={{ x: 'max-content' }}
        />
      </div>
      <DictAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}