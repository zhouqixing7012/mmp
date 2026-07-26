import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Search, Plus, CheckCircle, XCircle, Download, Edit, Settings,
  ChevronDown, ChevronUp, Folder, LayoutDashboard, Monitor, Layers, ClipboardList,
  Menu, User, Bell, ChevronRight, MoreHorizontal, Trash2, RefreshCcw, MinusSquare, X, Upload, ArrowLeft
} from 'lucide-react';
// 导入 xitongrules.js 中的组织与用户管理组件
import { UserManagementView, OrgManagementView } from './xitongrules';
import DictManagementView from "./dictmanagement";
import RoleManagementView from "./rolemgt";
import AdminSidebar from './yewurules/components/AdminSidebar';
import AdminHeader from './yewurules/components/AdminHeader';
import AdminContent from './yewurules/components/AdminContent';
import WorkspaceContent from './yewurules/components/WorkspaceContent';
import { BrandView, ConfigView, MaterialCategoryView, MaterialComprehensiveView, MaterialSubCategoryView, ModelView } from './yewurules/modules/material';
import { OfficeWarehouseMappingView, PSNewEmployeeMappingView, NOLocationMappingView, VirtualWarehouseManagerMappingView, PlateLedgerMappingView } from './yewurules/modules/mapping';
import { WarehouseInfoView, WarehouseUsageView, WarehousePermissionView } from './yewurules/modules/warehouse';
import { LocationBasicDataView } from './yewurules/modules/location';
import { getDefaultTabBySubMenu, getTabsBySubMenu } from './yewurules/config/tabConfig';
import { Button, Input, Select, Modal, Table, Radio, Card, Tag, DatePicker } from 'antd';
import StatusTag from '../components/StatusTag';
import SelectModal from '../components/SelectModal';
import QueryBar, { QueryItem } from '../components/QueryBar';
import {
  mockMaterialCategories, mockBrands, mockModels, mockConfigs,
  mockCompanies, mockDepartments, mockWarehouses,
  mockComprehensiveData, mockCategoryData, mockSubCategoryData,
  mockBrandListData, mockModelListData, mockNOServiceData,
  mockOffices,
  mockBuildings,
  mockCities,
  mockOfficeWarehouseData, mockEmployeeMappingData, mockNOLocationData,
  mockVirtualWarehouseData, mockVirtualWarehouseManagerData,
  mockVirtualAdmins, mockRealAdmins,
  mockPlateLedgerData, mockCompanyPlateAuthData, mockNODeviceAuthData,
  mockCompanyBelongingAuthData,
  mockWarehouseInfoData, mockWarehouseUsageData, mockWarehousePermissionData,
  mockLocationBasicDataData, mockReceiptRuleManagementData,
  mockHRCompanyFinanceMappingData, mockDeptCostCenterMappingData,
  mockCostCenterPlateMappingData, mockCityBusinessLineMappingData,
  mockDeptBusinessLineMappingData, mockAssetAllocationRuleData,
  mockExcludeSubCats,
  mockExpenseSubjects, mockExpenseDescs, mockRemarks, mockSortOrders,
  mockCostCenters, mockPlates, mockSubjects, mockSubSubjects,
  mockLines, mockProjects, mockTrans, mockMisc,
  mockMaterialRequestLimitData, mockAssetDepreciationRuleData,
  mockAccountBookContentData, mockExpenseAccountRuleData,
  mockCostCenterSubjectMappingData, mockMaterialSubSubjectMappingData,
  mockNOServiceSubjectMappingData, mockEmployeeProjectMappingData,
  mockPSNewEmployeeMappingData,
} from '../mock/businessRulesMock';
// --- 选择物料大类弹窗组件 ---
// 模拟物料大类数据
// --- Sub-Views ---
// 7. NO服务
const NOServiceView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '服务描述', dataIndex: 'desc' },
  ];
  const data = mockNOServiceData;
  
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-600 whitespace-nowrap">服务描述:</span>
           <Input placeholder="请输入服务描述" className="w-64" />
           <Button type="primary" icon={<Search size={14}/>}>查询</Button>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="flex-1 overflow-auto bg-white p-4">
           <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>
    </div>
  )
}
// 8. 办公区与仓库映射
// 9. PS新员工领用物料映射
// 10. NO地点与资产地点映射
// 11. 虚拟库管员映射
// 12. 板块与账簿映射
// 13. 公司板块提取资产权限
const CompanyPlateAssetAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, materialCat: record.materialCategory, empCompany: record.empCompany, empPlate: record.empPlate, enabled: record.enabled || '1' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockCompanyPlateAuthData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <QueryItem label="物料大类">
          <div className="flex-1 relative">
          <Input placeholder="搜索物料大类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <Input value={formData.materialCat} onChange={(e) => setFormData({...formData, materialCat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>员工所属公司</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.empCompany} onChange={(e) => setFormData({...formData, empCompany: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属板块</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.empPlate} onChange={(e) => setFormData({...formData, empPlate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <Radio checked={formData.enabled==='1'} onChange={() => setFormData({...formData, enabled: '1'})}>是</Radio>
              <Radio checked={formData.enabled==='0'} onChange={() => setFormData({...formData, enabled: '0'})}>否</Radio>
            </div>
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
        open={isMaterialCategoryModalOpen}
        title="选择物料大类"
        dataSource={mockMaterialCategories}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsMaterialCategoryModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          materialCat: record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
    </div>
  );
};
const NODeviceAssetAuthView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: '服务器', owner: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '服务器', owner: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type, owner: record.owner, enabled: record.enabled || '1' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO设备类型', dataIndex: 'type' },
    { title: '责任人', dataIndex: 'owner' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockNODeviceAuthData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">NO类型:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'服务器', value:'1'}, {label:'网络设备', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
        <Input placeholder="请输入编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">姓名:</span>
        <Input placeholder="请输入姓名" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
         <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
         <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增设备权限' : '编辑设备权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO设备类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[{label:'服务器', value:'服务器'}, {label:'网络设备', value:'网络设备'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>责任人</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.owner} onChange={(e) => setFormData({...formData, owner: e.target.value})} placeholder="请选择责任人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.enabled==='1'} onChange={() => setFormData({...formData, enabled: '1'})}>是</Radio>
              <Radio checked={formData.enabled==='0'} onChange={() => setFormData({...formData, enabled: '0'})}>否</Radio>
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
    </div>
  );
};
// 15. 公司归属权限
const CompanyBelongingAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
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
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockCompanyBelongingAuthData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司归属:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'焦点', value:'1'}, {label:'搜狐', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增归属' : '编辑归属'} width="700px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司归属</div>
            <div className="w-[80%] p-2 flex items-center">
              <Select value={formData.belonging} onChange={(value) => setFormData({...formData, belonging: value})} options={[{label:'焦点', value:'焦点'}, {label:'搜狐', value:'搜狐'}]} className="max-w-[300px]"  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[80%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none max-w-[300px]" />
              <Search className="absolute right-[calc(100%-300px+12px)] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[80%] p-2 flex items-center relative">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" className="max-w-[300px]" />
              <Search className="absolute right-[calc(100%-300px+12px)] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
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
    </div>
  );
};
// 16. 仓库信息
// 17. 仓库用途
// 18. 仓库权限
// 19. 地点基础数据维护
// 20. 单据编号规则管理
const ReceiptRuleManagementView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type || '', prefix: record.prefix || '', separator: record.separator || '', hasCompany: record.hasCompany ? '1' : '0', dateType: record.dateType || '', serialType: record.serialType || '' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '单据类型', dataIndex: 'type' },
    { title: '前缀', dataIndex: 'prefix' },
    { title: '分隔符', dataIndex: 'separator' },
    { title: '是否包含公司缩写', dataIndex: 'hasCompany', render: (val) => <StatusTag value={val} /> },
    { title: '日期类型', dataIndex: 'dateType' },
    { title: '流水号类型', dataIndex: 'serialType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockReceiptRuleManagementData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">单据类型:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'员工信息', value:'1'}, {label:'资产调拨', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">前缀:</span>
        <Input placeholder="请输入前缀" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">分隔符:</span>
        <Input placeholder="请输入分隔符" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col h-full relative">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <div className="flex-1 overflow-x-auto">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
        <div className="p-4 bg-[#fff1f0] border-t border-[#ffccc7] text-[#ff4d4f] text-sm">
          <div className="font-semibold mb-1">规范说明：</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>单据编号规则必须包含有单据类型</li>
            <li>单据前缀及其连缀符仅在规则生成时使用</li>
          </ol>
        </div>
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增规则' : '编辑规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>单据类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[{label:'员工信息', value:'员工信息'}, {label:'资产调拨', value:'资产调拨'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">前缀</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.prefix} onChange={(e) => setFormData({...formData, prefix: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">分隔符</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.separator} onChange={(e) => setFormData({...formData, separator: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否包含公司缩写</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.hasCompany} onChange={(value) => setFormData({...formData, hasCompany: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">日期类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.dateType} onChange={(value) => setFormData({...formData, dateType: value})} options={[{label:'年月日', value:'年月日'}, {label:'年月', value:'年月'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">流水号类型</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.serialType} onChange={(value) => setFormData({...formData, serialType: value})} options={[{label:'5位流水号', value:'5位流水号'}, {label:'4位流水号', value:'4位流水号'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
    </div>
  );
};
// 21. HR公司与财务公司映射
const HRCompanyFinanceMappingView = () => {

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR公司', dataIndex: 'hrCompany' },
    { title: 'HR公司描述', dataIndex: 'hrCompanyDesc' },
    { title: '财务公司', dataIndex: 'financeCompany' },
    { title: '财务公司描述', dataIndex: 'financeCompanyDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
  ];
  const data = mockHRCompanyFinanceMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR公司:</span>
        <Input placeholder="请输入HR公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">财务公司:</span>
        <Input placeholder="请输入财务公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 22. 部门与成本中心映射
const DeptCostCenterMappingView = () => {

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
  ];
  const data = mockDeptCostCenterMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
        <Input placeholder="请输入HR部门" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <Input placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 23. 成本中心与板块映射
const CostCenterPlateMappingView = () => {

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '板块', dataIndex: 'plate' },
    { title: '板块描述', dataIndex: 'plateDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
  ];
  const data = mockCostCenterPlateMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <Input placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <Input placeholder="请输入板块" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 24. 城市与业务线映射
const CityBusinessLineMappingView = () => {

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '城市', dataIndex: 'city' },
    { title: '城市描述', dataIndex: 'cityDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
  ];
  const data = mockCityBusinessLineMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">城市:</span>
        <Input placeholder="请输入城市" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
        <Input placeholder="请输入业务线" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 25. 部门与业务线映射
const DeptBusinessLineMappingView = () => {

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
  ];
  const data = mockDeptBusinessLineMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
        <Input placeholder="请输入HR部门" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
        <Input placeholder="请输入业务线" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 26. 资产配给规则管理
const AssetAllocationRuleView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '影像器材配给方案名称', dataIndex: 'name' },
    { title: '影像器材配给方案描述', dataIndex: 'desc' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '资产级别', dataIndex: 'level' },
    { title: '数量', dataIndex: 'qty' },
    { title: '操作', dataIndex: 'action', render: () => <Button type="link">操作</Button> }
  ];
  const data = mockAssetAllocationRuleData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案名称:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'高配影像器材', value:'1'}, {label:'标配影像器材', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案描述:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'方案1', value:'1'}, {label:'方案2', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">资产级别:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'高端', value:'1'}, {label:'中低端', value:'2'}]} 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// 27. 物资申请超标配置
const MaterialRequestLimitView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ name: '', subCat: '', excludeSubCat: [] });
  const [isExcludeSubCatModalOpen, setIsExcludeSubCatModalOpen] = useState(false);
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ name: '', subCat: '', excludeSubCat: [] });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ name: record.name || '', subCat: record.subCat || '', excludeSubCat: (record.excludeSubCat || '').split(',').filter(Boolean) });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '小类', dataIndex: 'subCat' },
    { title: '排除小类', dataIndex: 'excludeSubCat', render: (val) => Array.isArray(val) ? val.join(', ') : val || '-' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockMaterialRequestLimitData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">规则名称:</span>
        <Input placeholder="请输入规则名称" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">小类:</span>
        <Input placeholder="请输入小类" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增超标规则' : '编辑超标规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规则名称</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">小类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.subCat} onChange={(e) => setFormData({...formData, subCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">排除小类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsExcludeSubCatModalOpen(true)}>
              <Input value={Array.isArray(formData.excludeSubCat) ? formData.excludeSubCat.join(', ') : formData.excludeSubCat} onChange={() => {}} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
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
      <SelectModal
        multiple={true}
        open={isExcludeSubCatModalOpen}
        title="选择排除小类"
        dataSource={mockExcludeSubCats}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsExcludeSubCatModalOpen(false)}
        onConfirm={(records) => {
          setFormData({
          ...formData,
          excludeSubCat: records.map(r => r.desc)
          });
          setIsExcludeSubCatModalOpen(false);
        }}
      />
    </div>
  );
};
// 28. 资产折旧规则管理
const AssetDepreciationRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', subCat: record.subCat || '', originalValue: record.originalValue || '', relation: record.relation || '>=', years: record.years || '', valueType: record.valueType || '' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '原值要求', dataIndex: 'originalValue' },
    { title: '计算关系', dataIndex: 'relation' },
    { title: '使用年限', dataIndex: 'years' },
    { title: '账面金额类型', dataIndex: 'valueType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockAssetDepreciationRuleData;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-[-10px] mt-2 relative z-10 mr-4">
         <Button type="default" className="text-gray-600 hover:text-[#1677ff]">计算</Button>
      </div>
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索物料大类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料小类:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索物料小类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">使用年限:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'4年以上', value:'1'}, {label:'4年以内', value:'2'}]} placeholder="请选择..." 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />}>编辑</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增折旧规则' : '编辑折旧规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.mainCat} onChange={(e) => setFormData({...formData, mainCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料小类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.subCat} onChange={(e) => setFormData({...formData, subCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">原值要求</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.originalValue} onChange={(e) => setFormData({...formData, originalValue: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">计算关系</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.relation} onChange={(value) => setFormData({...formData, relation: value})} options={[{label:'>=', value:'>='}, {label:'<=', value:'<='}, {label:'=', value:'='}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">使用年限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.years} onChange={(value) => setFormData({...formData, years: value})} options={[{label:'4年以上', value:'4年以上'}, {label:'4年以内', value:'4年以内'}, {label:'不限', value:'不限'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">账面金额类型</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.valueType} onChange={(value) => setFormData({...formData, valueType: value})} options={[{label:'净值', value:'净值'}, {label:'原值', value:'原值'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
    </div>
  );
};
// 29. 账套内容维护
const AccountBookContentView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', name: '', cnName: '', enName: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', name: '', cnName: '', enName: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company || '', plate: record.plate || '', name: record.name || '', cnName: record.cnName || '', enName: record.enName || '' });
    setIsModalOpen(true);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
 const columns = [
    { title: '序号', dataIndex: 'id' },
   { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '标签名中文', dataIndex: 'cnName' },
    { title: '标签名英文', dataIndex: 'enName' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockAccountBookContentData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <Input placeholder="请输入公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <Input placeholder="请输入板块" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增账套内容' : '编辑账套内容'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsPlateModalOpen(true)}>
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>账套名称</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="请输入账套名称" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">标签名中文</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.cnName} onChange={(e) => setFormData({...formData, cnName: e.target.value})} placeholder="请输入标签名中文" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">标签名英文</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.enName} onChange={(e) => setFormData({...formData, enName: e.target.value})} placeholder="请输入标签名英文" />
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
      <SelectModal
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.code + '.' + record.desc
          });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isPlateModalOpen}
        title="选择板块"
        dataSource={mockPlates}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsPlateModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          plate: record.code + '.' + record.desc
          });
          setIsPlateModalOpen(false);
        }}
      />
    </div>
  );
};
// 30. 费用账户规则
const ExpenseAccountRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1' });
  const [isInCompModalOpen, setIsInCompModalOpen] = useState(false);
  const [isInCostModalOpen, setIsInCostModalOpen] = useState(false);
  const [isOutCompModalOpen, setIsOutCompModalOpen] = useState(false);
  const [isOutPlateModalOpen, setIsOutPlateModalOpen] = useState(false);
  const [isOutCostModalOpen, setIsOutCostModalOpen] = useState(false);
  const [isOutSubjModalOpen, setIsOutSubjModalOpen] = useState(false);
  const [isOutSubSubjModalOpen, setIsOutSubSubjModalOpen] = useState(false);
  const [isOutLineModalOpen, setIsOutLineModalOpen] = useState(false);
  const [isOutProjModalOpen, setIsOutProjModalOpen] = useState(false);
  const [isOutTransModalOpen, setIsOutTransModalOpen] = useState(false);
  const [isOutMiscModalOpen, setIsOutMiscModalOpen] = useState(false);
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ inCat: record.inCat || '', inComp: record.inComp || '', inCost: record.inCost || '', outComp: record.outComp || '', outPlate: record.outPlate || '', outCost: record.outCost || '', outSubj: record.outSubj || '', outSubSubj: record.outSubSubj || '', outLine: record.outLine || '', outProj: record.outProj || '', outTrans: record.outTrans || '', outMisc: record.outMisc || '', enabled: record.enabled ? '1' : '0' });
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
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockExpenseAccountRuleData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
        <Select style={{ width: '100%' }} allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="全部" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增费用账户规则' : '编辑费用账户规则'} width="900px">
        {/* 输入属性信息 */}
        <div className="mb-4">
          <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">
            输入属性信息
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类(输入)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
                <Input value={formData.inCat} onChange={(e) => setFormData({...formData, inCat: e.target.value})} readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司(输入)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsInCompModalOpen(true)}>
               <Input value={formData.inComp} onChange={(e) => setFormData({...formData, inComp: e.target.value})}  placeholder="请选择" readOnly className="pointer-events-none" />
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
             </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心(输入)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsInCostModalOpen(true)}>
                <Input value={formData.inCost} onChange={(e) => setFormData({...formData, inCost: e.target.value})}  placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 flex items-center">
              <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
          </div>
        </div>
        </div>
        {/* 输出属性信息 */}
        <div className="mb-4">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">
            输出属性信息
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutCompModalOpen(true)}>
                <Input value={formData.outComp} onChange={(e) => setFormData({...formData, outComp: e.target.value})}  placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutPlateModalOpen(true)}>
               <Input value={formData.outPlate} onChange={(e) => setFormData({...formData, outPlate: e.target.value})}  placeholder="请选择" readOnly className="pointer-events-none" />
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
             </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心(输出)</div>
             <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsOutCostModalOpen(true)}>
               <Input value={formData.outCost} onChange={(e) => setFormData({...formData, outCost: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
             </div>
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutSubjModalOpen(true)}>
                <Input value={formData.outSubj} onChange={(e) => setFormData({...formData, outSubj: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
            </div>
           <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子目(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsOutSubSubjModalOpen(true)}>
                <Input value={formData.outSubSubj} onChange={(e) => setFormData({...formData, outSubSubj: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">业务线(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutLineModalOpen(true)}>
                <Input value={formData.outLine} onChange={(e) => setFormData({...formData, outLine: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">项目(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsOutProjModalOpen(true)}>
                <Input value={formData.outProj} onChange={(e) => setFormData({...formData, outProj: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">往来(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutTransModalOpen(true)}>
               <Input value={formData.outTrans} onChange={(e) => setFormData({...formData, outTrans: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
             </div>
            </div>
            <div className="flex min-h-[40px]">
             <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">备用(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsOutMiscModalOpen(true)}>
                <Input value={formData.outMisc} onChange={(e) => setFormData({...formData, outMisc: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]"></div>
              <div className="w-[35%] p-2"></div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
      <SelectModal
        open={isMaterialCategoryModalOpen}
        title="选择物料大类"
        dataSource={mockMaterialCategories}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsMaterialCategoryModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          inCat: record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
      <SelectModal
        open={isInCompModalOpen}
        title="选择公司(输入)"
        dataSource={mockCompanies}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsInCompModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          inComp: record.desc
          });
          setIsInCompModalOpen(false);
        }}
      />
      <SelectModal
        open={isInCostModalOpen}
        title="选择成本中心(输入)"
        dataSource={mockCostCenters}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsInCostModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          inCost: record.desc
          });
          setIsInCostModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutCompModalOpen}
        title="选择公司(输出)"
        dataSource={mockCompanies}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutCompModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outComp: record.desc
          });
          setIsOutCompModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutPlateModalOpen}
        title="选择板块(输出)"
        dataSource={mockPlates}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutPlateModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outPlate: record.desc
          });
          setIsOutPlateModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutCostModalOpen}
        title="选择成本中心(输出)"
        dataSource={mockCostCenters}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutCostModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outCost: record.desc
          });
          setIsOutCostModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutSubjModalOpen}
        title="选择科目(输出)"
        dataSource={mockSubjects}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutSubjModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outSubj: record.desc
          });
          setIsOutSubjModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutSubSubjModalOpen}
        title="选择子目(输出)"
        dataSource={mockSubSubjects}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutSubSubjModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outSubSubj: record.desc
          });
          setIsOutSubSubjModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutLineModalOpen}
        title="选择业务线(输出)"
        dataSource={mockLines}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutLineModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outLine: record.desc
          });
          setIsOutLineModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutProjModalOpen}
        title="选择项目(输出)"
        dataSource={mockProjects}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutProjModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outProj: record.desc
          });
          setIsOutProjModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutTransModalOpen}
        title="选择往来(输出)"
        dataSource={mockTrans}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutTransModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outTrans: record.desc
          });
          setIsOutTransModalOpen(false);
        }}
      />
      <SelectModal
        open={isOutMiscModalOpen}
        title="选择备用(输出)"
        dataSource={mockMisc}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOutMiscModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          outMisc: record.desc
          });
          setIsOutMiscModalOpen(false);
        }}
      />
    </div>
  );
};
// 31. 成本中心与科目映射
const CostCenterSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' });
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ costCenter: record.costCenter || '', costCenterDesc: record.costCenterDesc || '', cat: record.cat || '', company: record.company || '', subject: record.subject || '', subjectDesc: record.subjectDesc || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '大类', dataIndex: 'cat' },
    { title: '公司', dataIndex: 'company' },
    { title: '科目', dataIndex: 'subject' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockCostCenterSubjectMappingData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">大类:</span>
        <Input placeholder="请输入大类" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <Input placeholder="请输入公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <Input placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">科目:</span>
        <Input placeholder="请输入科目" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />}>批量修改</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增成本中心与科目映射' : '编辑成本中心与科目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>成本中心</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCostCenterModalOpen(true)}>
              <Input value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCatModalOpen(true)}>
              <Input value={formData.cat} onChange={(e) => setFormData({...formData, cat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsSubjectModalOpen(true)}>
              <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
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
     <SelectModal
       open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '公司编码', dataIndex: 'code' }, { title: '公司描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '公司描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.code + '.' + record.desc
          });
         setIsCompanyModalOpen(false);
       }}
      />
      <SelectModal
        open={isCostCenterModalOpen}
        title="选择成本中心"
        dataSource={mockCostCenters}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCostCenterModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          costCenter: record.code + '.' + record.desc
          });
          setIsCostCenterModalOpen(false);
        }}
      />
      <SelectModal
        open={isCatModalOpen}
        title="选择大类"
        dataSource={mockMaterialCategories}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCatModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          cat: record.code + '.' + record.desc
          });
          setIsCatModalOpen(false);
        }}
      />
      <SelectModal
        open={isSubjectModalOpen}
        title="选择科目"
        dataSource={mockSubjects}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsSubjectModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          subject: record.code + '.' + record.desc
          });
          setIsSubjectModalOpen(false);
        }}
      />

    </div>
  );
};
// 32. 物料大类与子目映射
const MaterialSubSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [isSubSubjectModalOpen, setIsSubSubjectModalOpen] = useState(false);
  const [formData, setFormData] = useState({ mainCat: '', subSubj: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', subSubj: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', subSubj: record.subSubj || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '子科目', dataIndex: 'subSubj' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockMaterialSubSubjectMappingData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
        <Input placeholder="请输入物料大类" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">子科目:</span>
        <Input placeholder="请输入子科目" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
         <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />}>批量修改</Button>
         <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
         <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
       </div>
       <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
     </div>
     <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料大类与子目映射' : '编辑物料大类与子目映射'} width="900px">
       <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
           <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <Input value={formData.mainCat} onChange={(e) => setFormData({...formData, mainCat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子科目</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsSubSubjectModalOpen(true)}>
              <Input value={formData.subSubj} onChange={(e) => setFormData({...formData, subSubj: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
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
      <SelectModal
        open={isMaterialCategoryModalOpen}
        title="选择物料大类"
        dataSource={mockMaterialCategories}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsMaterialCategoryModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          mainCat: record.code + "." + record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
      <SelectModal
        open={isSubSubjectModalOpen}
        title="选择子科目"
        dataSource={mockSubSubjects}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsSubSubjectModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          subSubj: record.code + "." + record.desc
          });
          setIsSubSubjectModalOpen(false);
        }}
      />
    </div>
  );
};
// 33. NO一级服务与科目映射
const NOServiceSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState('add');
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
 const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
 const [formData, setFormData] = useState({ service: '', plate: '', costCenter: '', subject: '', enabled: '1' });
 const handleAdd = () => {
   setModalMode('add');
    setFormData({ service: '', plate: '', costCenter: '', subject: '', enabled: '1' });
   setIsModalOpen(true);
 };
 const handleEdit = (record) => {
   setModalMode('edit');
    setFormData({ service: record.service || '', plate: record.plate || '', costCenter: record.costCenter || '', subject: record.subject || '', enabled: record.enabled ? '1' : '0' });
   setIsModalOpen(true);
 };
 const columns = [
   { title: '序号', dataIndex: 'id' },
   { title: 'NO一级服务', dataIndex: 'service' },
   { title: '板块', dataIndex: 'plate' },
   { title: '成本中心', dataIndex: 'costCenter' },
   { title: '科目', dataIndex: 'subject' },
   { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
   { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
 ];
  const data = mockNOServiceSubjectMappingData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="NO一级服务">
          <Input placeholder="请输入服务" />
        </QueryItem>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <Input placeholder="请输入板块" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
         <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" icon={<Edit size={14} />}>批量修改</Button>
         <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
         <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
       </div>
       <div className="min-h-[200px]">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
          {data.length === 0 && <div className="text-center py-10 text-gray-400">暂无数据</div>}
       </div>
     </div>
     <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增NO一级服务与科目映射' : '编辑NO一级服务与科目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
         <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
           <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO一级服务</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.service} onChange={(value) => setFormData({...formData, service: value})} placeholder="请选择" allowClear options={mockNOServiceData.map(item => ({label: item.code + '.' + item.desc, value: item.code + '.' + item.desc}))} style={{ width: '100%' }} />
            </div>
           <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsPlateModalOpen(true)}>
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
           </div>
         </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCostCenterModalOpen(true)}>
              <Input value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsSubjectModalOpen(true)}>
              <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
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
     <SelectModal
       open={isPlateModalOpen}
       title="选择板块"
        dataSource={mockPlates}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsPlateModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          plate: record.code + "." + record.desc
          });
          setIsPlateModalOpen(false);
        }}
      />
      <SelectModal
        open={isCostCenterModalOpen}
        title="选择成本中心"
        dataSource={mockCostCenters}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsCostCenterModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          costCenter: record.code + "." + record.desc
          });
          setIsCostCenterModalOpen(false);
        }}
      />
      <SelectModal
        open={isSubjectModalOpen}
        title="选择科目"
        dataSource={mockSubjects}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsSubjectModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          subject: record.code + "." + record.desc
          });
          setIsSubjectModalOpen(false);
        }}
      />
    </div>
  );
};
// 34. 员工与项目映射
const EmployeeProjectMappingView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '员工编号', dataIndex: 'empNo' },
    { title: '员工姓名', dataIndex: 'empName' },
    { title: '项目名称', dataIndex: 'projName' }
  ];
  const data = mockEmployeeProjectMappingData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
        <Input placeholder="请输入员工编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工姓名:</span>
        <Input placeholder="请输入员工姓名" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">项目名称:</span>
        <Input placeholder="请输入项目名称" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
// --- Main Application Layout ---
export default function App() {
  const [activeMenu, setActiveMenu] = useState('后台基础配置');
  const [activeSubMenu, setActiveSubMenu] = useState('物料数据维护');
  const [activeTab, setActiveTab] = useState('物料大类');

  const tabs = getTabsBySubMenu(activeSubMenu);

  const handleMenuToggle = (menuKey, collapsible = true) => {
    setActiveMenu((currentMenu) => {
      if (collapsible && currentMenu === menuKey) {
        return '';
      }
      return menuKey;
    });
  };

  const handleSubMenuSelect = (subMenu) => {
    setActiveSubMenu(subMenu);
    setActiveTab(getDefaultTabBySubMenu(subMenu));
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">
      <AdminSidebar
        activeMenu={activeMenu}
        activeSubMenu={activeSubMenu}
        onMenuToggle={handleMenuToggle}
        onSubMenuSelect={handleSubMenuSelect}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        <AdminHeader activeSubMenu={activeSubMenu} />

        <AdminContent
          activeMenu={activeMenu}
          activeSubMenu={activeSubMenu}
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={setActiveTab}
        >
          {/* 用户与组织管理 */}
          {activeSubMenu === '用户管理' && (
            <div className="flex-1 flex flex-col relative">
              <UserManagementView />
            </div>
          )}
          {activeSubMenu === '组织管理' && (
            <div className="flex-1 flex flex-col relative">
              <OrgManagementView />
            </div>
          )}
          {activeSubMenu === '角色管理' && (
            <div className="flex-1 flex flex-col relative">
              <RoleManagementView />
            </div>
          )}
          {activeSubMenu === '字典管理' && (
            <div className="flex-1 flex flex-col relative">
              <DictManagementView />
            </div>
          )}

          {/* 个人工作台页面 */}
          {activeMenu === '个人工作台' && (
            <WorkspaceContent activeSubMenu={activeSubMenu} />
          )}

          {/* 业务基础数据维护 */}
          {activeMenu === '后台基础配置' && activeTab === '物料维度组合' && <MaterialComprehensiveView />}
          {activeMenu === '后台基础配置' && activeTab === '物料大类' && <MaterialCategoryView />}
          {activeMenu === '后台基础配置' && activeTab === '物料小类' && <MaterialSubCategoryView />}
          {activeMenu === '后台基础配置' && activeTab === '品牌' && <BrandView />}
          {activeMenu === '后台基础配置' && activeTab === '型号' && <ModelView />}
          {activeMenu === '后台基础配置' && activeTab === '配置' && <ConfigView />}

          {/* 业务映射规则管理 */}
          {activeMenu === '后台基础配置' && activeTab === '办公区与仓库映射' && <OfficeWarehouseMappingView />}
          {activeMenu === '后台基础配置' && activeTab === 'PS新员工领用物料映射' && <PSNewEmployeeMappingView />}
          {activeMenu === '后台基础配置' && activeTab === 'NO地点与资产地点映射' && <NOLocationMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '虚拟库管员映射' && <VirtualWarehouseManagerMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '板块与账簿映射' && <PlateLedgerMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '公司板块领取资产权限' && <CompanyPlateAssetAuthView />}
          {activeMenu === '后台基础配置' && activeTab === '机房资产领取权限' && <NODeviceAssetAuthView />}
          {activeMenu === '后台基础配置' && activeTab === '公司归属权限' && <CompanyBelongingAuthView />}

          {/* 仓库与地点数据维护 */}
          {activeMenu === '后台基础配置' && activeTab === '仓库信息' && <WarehouseInfoView />}
          {activeMenu === '后台基础配置' && activeTab === '仓库用途' && <WarehouseUsageView />}
          {activeMenu === '后台基础配置' && activeTab === '仓库权限' && <WarehousePermissionView />}
          {activeMenu === '后台基础配置' && activeTab === '地点基础数据维护' && <LocationBasicDataView />}
          {activeMenu === '后台基础配置' && activeTab === '单据编号规则管理' && <ReceiptRuleManagementView />}

          {/* 会计映射规则 */}
          {activeMenu === '后台基础配置' && activeTab === 'HR公司与财务公司映射' && <HRCompanyFinanceMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '部门与成本中心映射' && <DeptCostCenterMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '成本中心与板块映射' && <CostCenterPlateMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '城市与业务线映射' && <CityBusinessLineMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '部门与业务线映射' && <DeptBusinessLineMappingView />}

          {/* 规则与账套维护 */}
          {activeMenu === '后台基础配置' && activeTab === '影像器材配给方案' && <AssetAllocationRuleView />}
          {activeMenu === '后台基础配置' && activeTab === '超标规则' && <MaterialRequestLimitView />}
          {activeMenu === '后台基础配置' && activeTab === '费用账户规则' && <ExpenseAccountRuleView />}
          {activeMenu === '后台基础配置' && activeTab === '成本中心与科目映射' && <CostCenterSubjectMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '物料大类与子目映射' && <MaterialSubSubjectMappingView />}
          {activeMenu === '后台基础配置' && activeTab === 'NO一级服务与科目映射' && <NOServiceSubjectMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '员工与项目映射' && <EmployeeProjectMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '资产折旧规则管理' && <AssetDepreciationRuleView />}
          {activeMenu === '后台基础配置' && activeTab === '账套内容维护' && <AccountBookContentView />}
        </AdminContent>
      </div>
    </div>
  );
}
