import React, { useState } from 'react';
import { CheckCircle, Plus, Search, XCircle } from 'lucide-react';
import { Button, Input, Modal, Radio, Select, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import SelectModal from '../../../../components/SelectModal';
import QueryBar from '../../../../components/QueryBar';
import {
  mockMaterialCategories,
  mockCompanies,
  mockCostCenters,
  mockPlates,
  mockSubjects,
  mockSubSubjects,
  mockLines,
  mockProjects,
  mockTrans,
  mockMisc,
  mockExpenseAccountRuleData,
} from '../../../../mock/businessRulesMock';

const EMPTY_FORM = {
  inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '',
  outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1',
};

const pickerConfig = {
  inCat: { title: '选择物料大类', dataSource: mockMaterialCategories },
  inComp: { title: '选择公司(输入)', dataSource: mockCompanies },
  inCost: { title: '选择成本中心(输入)', dataSource: mockCostCenters },
  outComp: { title: '选择公司(输出)', dataSource: mockCompanies },
  outPlate: { title: '选择板块(输出)', dataSource: mockPlates },
  outCost: { title: '选择成本中心(输出)', dataSource: mockCostCenters },
  outSubj: { title: '选择科目(输出)', dataSource: mockSubjects },
  outSubSubj: { title: '选择子目(输出)', dataSource: mockSubSubjects },
  outLine: { title: '选择业务线(输出)', dataSource: mockLines },
  outProj: { title: '选择项目(输出)', dataSource: mockProjects },
  outTrans: { title: '选择往来(输出)', dataSource: mockTrans },
  outMisc: { title: '选择备用(输出)', dataSource: mockMisc },
};

const PickerField = ({ label, required, value, onOpen }) => (
  <>
    <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">
      {required && <span className="text-red-500 mr-1">*</span>}{label}
    </div>
    <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={onOpen}>
      <Input value={value} placeholder="请选择" readOnly className="pointer-events-none" />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
    </div>
  </>
);

const ExpenseAccountRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [activePicker, setActivePicker] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleAdd = () => {
    setModalMode('add');
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      ...EMPTY_FORM,
      ...record,
      enabled: record.enabled ? '1' : '0',
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类(输入)', dataIndex: 'inCat' },
    { title: '公司(输入)', dataIndex: 'inComp' },
    { title: '成本中心(输入)', dataIndex: 'inCost' },
    { title: '公司(输出)', dataIndex: 'outComp' },
    { title: '板块(输出)', dataIndex: 'outPlate' },
    { title: '成本中心(输出)', dataIndex: 'outCost' },
    { title: '科目(输出)', dataIndex: 'outSubj' },
    { title: '子目(输出)', dataIndex: 'outSubSubj' },
    { title: '业务线(输出)', dataIndex: 'outLine' },
    { title: '项目(输出)', dataIndex: 'outProj' },
    { title: '往来(输出)', dataIndex: 'outTrans' },
    { title: '备用(输出)', dataIndex: 'outMisc' },
    { title: '是否启用', dataIndex: 'enabled', render: (value) => <StatusTag value={value} type="enabled" /> },
    { title: '操作', dataIndex: 'action', fixed: 'right', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
  ];

  const picker = activePicker ? pickerConfig[activePicker] : null;

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-28 text-right text-sm text-gray-600">物料大类(输入):</span>
          <Input placeholder="请输入物料大类" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 text-right text-sm text-gray-600">公司:</span>
          <Input placeholder="请输入公司" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 text-right text-sm text-gray-600">成本中心(输入):</span>
          <Input placeholder="请输入成本中心" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
          <Select style={{ width: '100%' }} allowClear placeholder="全部" options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} />
        </div>
      </QueryBar>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button disabled={selectedRowKeys.length === 0} className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button disabled={selectedRowKeys.length === 0} className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <Table
          rowKey="id"
          rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={mockExpenseAccountRuleData}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </div>

      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增费用账户规则' : '编辑费用账户规则'} width="900px">
        <div className="mb-4">
          <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">输入属性信息</div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <PickerField label="物料大类(输入)" required value={formData.inCat} onOpen={() => setActivePicker('inCat')} />
              <PickerField label="公司(输入)" required value={formData.inComp} onOpen={() => setActivePicker('inComp')} />
            </div>
            <div className="flex min-h-[40px]">
              <PickerField label="成本中心(输入)" value={formData.inCost} onOpen={() => setActivePicker('inCost')} />
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 flex items-center">
                <Radio.Group value={formData.enabled} onChange={(event) => setFormData({ ...formData, enabled: event.target.value })}>
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
                </Radio.Group>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">输出属性信息</div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <PickerField label="公司(输出)" required value={formData.outComp} onOpen={() => setActivePicker('outComp')} />
              <PickerField label="板块(输出)" value={formData.outPlate} onOpen={() => setActivePicker('outPlate')} />
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <PickerField label="成本中心(输出)" value={formData.outCost} onOpen={() => setActivePicker('outCost')} />
              <PickerField label="科目(输出)" value={formData.outSubj} onOpen={() => setActivePicker('outSubj')} />
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <PickerField label="子目(输出)" value={formData.outSubSubj} onOpen={() => setActivePicker('outSubSubj')} />
              <PickerField label="业务线(输出)" value={formData.outLine} onOpen={() => setActivePicker('outLine')} />
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <PickerField label="项目(输出)" value={formData.outProj} onOpen={() => setActivePicker('outProj')} />
              <PickerField label="往来(输出)" value={formData.outTrans} onOpen={() => setActivePicker('outTrans')} />
            </div>
            <div className="flex min-h-[40px]">
              <PickerField label="备用(输出)" value={formData.outMisc} onOpen={() => setActivePicker('outMisc')} />
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]" />
              <div className="w-[35%] p-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>

      <SelectModal
        open={Boolean(picker)}
        title={picker?.title || ''}
        dataSource={picker?.dataSource || []}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setActivePicker(null)}
        onConfirm={(record) => {
          if (activePicker) {
            setFormData({ ...formData, [activePicker]: activePicker === 'inCat' ? record.desc : record.desc });
          }
          setActivePicker(null);
        }}
      />
    </div>
  );
};

export default ExpenseAccountRuleView;
