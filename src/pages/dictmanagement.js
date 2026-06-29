import React, { useState } from 'react';
import { Button, Input, Select, Table, Modal, Form, InputNumber, Tag } from 'antd';
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
  const [form] = Form.useForm();
  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Save:', values);
      form.resetFields();
      onClose();
    });
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="字典-新增" width={600} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="字典编码" name="dictCode" rules={[{ required: true, message: '请输入字典编码' }]}>
          <Input placeholder="请输入字典编码" />
        </Form.Item>
        <Form.Item label="字典名称" name="dictName" rules={[{ required: true, message: '请输入字典名称' }]}>
          <Input placeholder="请输入字典名称" />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="primary" onClick={handleSave} style={{ marginRight: 8 }}>保存</Button>
        <Button onClick={onClose}>返回</Button>
      </div>
    </Modal>
  );
}

function DictItemAddModal({ open, onClose, dictCode, dictName }) {
  const [form] = Form.useForm();
  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Save item:', values);
      form.resetFields();
      onClose();
    });
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="字典项-新增" width={600} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ dictCode, dictName, status: '启用', priority: 0 }}>
        <Form.Item label="字典编码" name="dictCode"><Input disabled /></Form.Item>
        <Form.Item label="字典名称" name="dictName"><Input disabled /></Form.Item>
        <Form.Item label="字典项编码" name="itemCode" rules={[{ required: true, message: '请输入字典项编码' }]}>
          <Input placeholder="请输入字典项编码" />
        </Form.Item>
        <Form.Item label="字典项名称" name="itemName" rules={[{ required: true, message: '请输入字典项名称' }]}>
          <Input placeholder="请输入字典项名称" />
        </Form.Item>
        <Form.Item label="字典优先级" name="priority">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="primary" onClick={handleSave} style={{ marginRight: 8 }}>保存</Button>
        <Button onClick={onClose}>返回</Button>
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
        <QueryItem label="查询">
          <Select style={{ width: '100%' }} defaultValue="dictCode" options={[{ label: '字典编码', value: 'dictCode' }, { label: '字典名称', value: 'dictName' }]} />
        </QueryItem>
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