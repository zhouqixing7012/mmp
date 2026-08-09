import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Edit, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import { Button, Input, Select, Table } from 'antd';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import MaterialBatchActionModal from './MaterialBatchActionModal';
import MaterialComprehensiveFormModal from './MaterialComprehensiveFormModal';
import MaterialComprehensiveSelectModals from './MaterialComprehensiveSelectModals';
import { createMaterialComprehensiveColumns, initialMaterialComprehensiveForm, materialComprehensiveResetFields } from './materialComprehensiveConfig';
import { mockComprehensiveData } from '../../../../mock/businessRulesMock';

const MaterialComprehensiveView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [formData, setFormData] = useState({ ...initialMaterialComprehensiveForm });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ ...formData, ...materialComprehensiveResetFields });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      ...formData,
      ...record,
      mainCatDesc: record.mainCatDesc || record.catDesc || '',
      modelDesc: record.modelDesc || record.model || '',
      modelCode: record.modelCode || record.model || '',
    });
    setIsModalOpen(true);
  };

  const columns = createMaterialComprehensiveColumns(handleEdit);

  return (
    <div className="flex flex-col gap-4">
      <div data-prototype-anchor="material-query-bar">
        <QueryBar buttons={
          <>
            <Button type="primary" icon={<Search size={14} />}>查询</Button>
            <Button icon={<RefreshCcw size={14} />}>重置</Button>
            <Button type="link" onClick={() => setIsQueryExpanded(!isQueryExpanded)} icon={isQueryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}>
              {isQueryExpanded ? '收起更多' : '展开更多'}
            </Button>
          </>
        }>
          <QueryItem label="维度组合编码"><Input placeholder="请输入编码" /></QueryItem>
          <QueryItem label="维度组合描述"><Input placeholder="请输入描述" /></QueryItem>
          <QueryItem label="物料总类"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '资产', value: '1' }, { label: '耗材', value: '2' }, { label: '低值耐用品', value: '3' }]} /></QueryItem>
          {['物料大类', '物料小类', '品牌', '型号', '配置描述'].map((label) => (
            <QueryItem key={label} label={label}>
              <div className="relative w-full cursor-pointer">
                <Input placeholder={`搜索${label.replace('物料', '')}...`} readOnly className="pointer-events-none" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </QueryItem>
          ))}
          <QueryItem label="单位"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '台', value: '1' }, { label: '块', value: '2' }, { label: '个', value: '3' }, { label: '套', value: '4' }, { label: '件', value: '5' }]} /></QueryItem>
          {isQueryExpanded && <QueryItem label="是否启用"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '启用', value: '1' }, { label: '停用', value: '0' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="正式员工可申请"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="耗材申请是否需要MIS审核"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="退库是否需要MIS鉴定"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="是否关联主资产"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="是否需要盘点"><Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} /></QueryItem>}
          {isQueryExpanded && <QueryItem label="参考价格"><div className="flex items-center w-full gap-2"><Input placeholder="从" /><span className="text-gray-400">至</span><Input placeholder="至" /></div></QueryItem>}
        </QueryBar>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div data-prototype-anchor="material-table-toolbar" className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <div data-prototype-anchor="material-table" className="overflow-x-auto">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={mockComprehensiveData} size="middle" scroll={{ x: 2800 }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>

      <MaterialComprehensiveFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        setIsMaterialCategoryModalOpen={setIsMaterialCategoryModalOpen}
        setIsSubCategoryModalOpen={setIsSubCategoryModalOpen}
        setIsBrandModalOpen={setIsBrandModalOpen}
        setIsModelModalOpen={setIsModelModalOpen}
        setIsConfigModalOpen={setIsConfigModalOpen}
        setIsDeptModalOpen={setIsDeptModalOpen}
        setIsEmpModalOpen={setIsEmpModalOpen}
      />
      <MaterialBatchActionModal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} />
      <MaterialComprehensiveSelectModals
        formData={formData}
        setFormData={setFormData}
        isMaterialCategoryModalOpen={isMaterialCategoryModalOpen}
        setIsMaterialCategoryModalOpen={setIsMaterialCategoryModalOpen}
        isBrandModalOpen={isBrandModalOpen}
        setIsBrandModalOpen={setIsBrandModalOpen}
        isModelModalOpen={isModelModalOpen}
        setIsModelModalOpen={setIsModelModalOpen}
        isConfigModalOpen={isConfigModalOpen}
        setIsConfigModalOpen={setIsConfigModalOpen}
        isDeptModalOpen={isDeptModalOpen}
        setIsDeptModalOpen={setIsDeptModalOpen}
        isEmpModalOpen={isEmpModalOpen}
        setIsEmpModalOpen={setIsEmpModalOpen}
        isSubCategoryModalOpen={isSubCategoryModalOpen}
        setIsSubCategoryModalOpen={setIsSubCategoryModalOpen}
      />
    </div>
  );
};

export default MaterialComprehensiveView;
