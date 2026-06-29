import React, { useState } from 'react';
import { Button, Input, Select, Table, Card, Tag, Modal, Form, InputNumber } from 'antd';
import { Plus, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Mock data for 130 items across 13 pages
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
    <Modal open={open} onCancel={onClose} footer={null} width={600} destroyOnClose>
      <div style={{ background: '#1677ff', color: 'white', padding: '12px 20px', margin: -24, marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: 16, fontWeight: 500 }}>字典-新增</span>
      </div>
      <div style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical">
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
      </div>
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
    <Modal open={open} onCancel={onClose} footer={null} width={600} destroyOnClose>
      <div style={{ background: '#1677ff', color: 'white', padding: '12px 20px', margin: -24, marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: 16, fontWeight: 500 }}>字典项-新增</span>
      </div>
      <div style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical" initialValues={{ dictCode, dictName, status: '启用', priority: 0 }}>
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
      </div>
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
      <div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ background: '#1677ff', color: 'white', padding: '12px 20px', margin: -16, marginBottom: 0, borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>字典项管理</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select style={{ width: 100 }} defaultValue="all" options={[{ label: '查询', value: 'all' }]} />
              <Input placeholder="字典编码" style={{ width: 150 }} />
              <Input placeholder="字典名称" style={{ width: 150 }} />
              <Input placeholder="字典项编码" style={{ width: 150 }} />
              <Input placeholder="字典项名称" style={{ width: 150 }} />
              <Button type="primary">查询</Button>
              <Button>重置</Button>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setAddItemModalOpen(true)}>新增</Button>
            <Button style={{ color: '#52c41a', borderColor: '#b7eb8f' }} icon={<CheckCircle size={14} />}>启用</Button>
            <Button danger icon={<XCircle size={14} />}>停用</Button>
            <Button icon={<ArrowLeft size={14} />} onClick={() => setViewMode('list')}>返回</Button>
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
            pagination={{ pageSize: 10, showQuickJumper: true, showSizeChanger: false, total: mockDictItemData.length }}
          />
        </Card>
        <DictItemAddModal open={addItemModalOpen} onClose={() => setAddItemModalOpen(false)} dictCode={selectedDict.dictCode} dictName={selectedDict.dictName} />
      </div>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ background: '#1677ff', color: 'white', padding: '12px 20px', margin: -16, marginBottom: 0, borderRadius: '8px 8px 0 0' }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>字典管理</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select style={{ width: 100 }} defaultValue="dictCode" options={[{ label: '查询', value: 'dictCode' }]} />
            <Input placeholder="字典编码" style={{ width: 160 }} />
            <Input placeholder="字典名称" style={{ width: 160 }} />
            <Button type="primary">查询</Button>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{ marginBottom: 16 }}>
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
          pagination={{
            current: currentPage,
            total: 130,
            pageSize: 10,
            showQuickJumper: true,
            showSizeChanger: false,
            showTotal: (total) => '共 ' + total + ' 条',
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>
      <DictAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}