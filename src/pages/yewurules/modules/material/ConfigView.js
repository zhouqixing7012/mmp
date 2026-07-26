import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Download, Edit, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Table, Radio } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockBrands, mockModels, mockConfigs,
} from '../../../../mock/businessRulesMock';

const ConfigView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [formData, setFormData] = useState({ brand: '', model: '', code: '', desc: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ brand: '', model: '', code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ brand: record.brand, model: record.model, code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '型号', dataIndex: 'model' },
    { title: '配置编码', dataIndex: 'code' },
    { title: '配置描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockConfigs;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="品牌">
          <div className="relative w-full cursor-pointer" onClick={() => setIsBrandModalOpen(true)}>
            <Input placeholder="请选择品牌" readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
      <QueryItem label="型号">
          <div className="relative w-full cursor-pointer" onClick={() => setIsModelModalOpen(true)}>
            <Input placeholder="请选择型号" readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
      <QueryItem label="配置编码">
          <Input placeholder="请输入编码" />
        </QueryItem>
      <QueryItem label="配置描述">
          <Input placeholder="请输入描述" />
        </QueryItem>
      <QueryItem label="是否启用">
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
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增配置' : '编辑配置'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">{modalMode === 'edit' ? (
              <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <Input value={formData.brand || ""} disabled />
                </div>
                <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>型号</div>
                <div className="w-[35%] p-2 flex items-center">
                  <Input value={formData.model || ""} disabled />
                </div>
              </div>
            ) : (
              <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <Input value={formData.brand || ""} disabled />
                </div>
                <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>型号</div>
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsModelModalOpen(true)}>
                  <Input value={formData.brand && formData.model ? formData.brand + " / " + formData.model : ""} placeholder="请选择型号" readOnly className="pointer-events-none" />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                </div>
              </div>
            )}
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>配置编码</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                <Input value={formData.code} disabled onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>配置描述</div>
              <div className="w-[35%] p-2 flex items-center">
                <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
                <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
                <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
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
      <SelectModal
        open={isBrandModalOpen}
        title="选择品牌"
        dataSource={mockBrands}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsBrandModalOpen(false)}
        onConfirm={(record) => {
          setFormData({ ...formData, brand: record.desc });
          setIsBrandModalOpen(false);
        }}
      />
<SelectModal
        open={isBrandModalOpen}
        title="选择品牌"
        dataSource={mockBrands}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsBrandModalOpen(false)}
        onConfirm={(record) => {
          setFormData({ ...formData, brand: record.desc });
          setIsBrandModalOpen(false);
        }}
      />
<SelectModal
        open={isModelModalOpen}
        title="选择型号"
        dataSource={mockModels.filter(function(m) { return !formData.brand || m.brand === formData.brand })}
        columns={[{ title: '品牌', dataIndex: 'brand' }, { title: '型号编码', dataIndex: 'code' }, { title: '型号描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '品牌', name: 'brand', dataIndex: 'brand' }, { label: '型号编码', name: 'code', dataIndex: 'code' }, { label: '型号描述', name: 'desc', dataIndex: 'desc' }]}
        onCancel={() => setIsModelModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          brand: record.brand,
          model: record.desc
          });
          setIsModelModalOpen(false);
        }}
      />
    </div>
  );
};

export default ConfigView;
