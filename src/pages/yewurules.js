import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Search, Plus, CheckCircle, XCircle, Download, Edit, Settings,
  ChevronDown, ChevronUp, Folder, LayoutDashboard, Monitor, Layers, ClipboardList,
  Menu, User, Bell, ChevronRight, MoreHorizontal, Trash2, RefreshCcw, MinusSquare, X, Upload, ArrowLeft
} from 'lucide-react';
// 导入 xitongrules.js 中的组织与用户管理组件
import OrgAndUserContainer from './xitongrules';
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
} from '../mock/businessRulesMock';
// --- 选择物料大类弹窗组件 ---
// 模拟物料大类数据
// --- Sub-Views ---
// 1. 物料综合集合
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
  const [formData, setFormData] = useState({
    mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '',
    configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '',
    enabled: '1', enableDate: '', stopDate: '', formalCanApply: '是', internCanApply: '否', canApply: '', refPrice: '', isStop: '', needCheck: '是',
    allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0',
    nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: '',
    tempEffStartDate: '', tempEffEndDate: '', tempDept: '', tempEmployee: ''
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ ...formData, mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '', configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '', enabled: '1', enableDate: '', stopDate: '', formalCanApply: '是', internCanApply: '否', canApply: '', refPrice: '', isStop: '', needCheck: '是', allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0', nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: '' });
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
  const columns = [
    { title: '序号', dataIndex: 'id', width: 60 },
    { title: '维度组合编码', dataIndex: 'code', width: 140 },
    { title: '维度组合描述', dataIndex: 'desc', width: 180 },
    { title: '物料总类', dataIndex: 'mainCatCode', width: 100, render: (val) => val === '1' ? '资产' : val === '2' ? '耗材' : val === '3' ? '低值耐用品' : '-' },
    { title: '物料大类', dataIndex: 'catDesc', width: 120 },
    { title: '物料小类', dataIndex: 'subCatDesc', width: 120 },
    { title: '品牌', dataIndex: 'brand', width: 120 },
    { title: '规格型号', dataIndex: 'model', width: 120 },
    { title: '配置描述', dataIndex: 'configDesc', width: 130, render: (val) => val || '-' },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '参考价格', dataIndex: 'refPrice', width: 100, render: (val) => val || '0.00' },
    { title: '是否启用', dataIndex: 'enabled', width: 90, render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '是否停产', dataIndex: 'isStop', width: 90, render: (val) => <StatusTag value={val} /> },
    { title: '正式员工可申请', dataIndex: 'formalCanApply', width: 120, render: (val) => val || '-' },
    { title: '实习生可申请', dataIndex: 'internCanApply', width: 110, render: (val) => val || '-' },
    { title: '是否允许退库', dataIndex: 'allowReturn', width: 110, render: (val) => <StatusTag value={val} /> },
    { title: '是否需要盘点', dataIndex: 'needCheck', width: 100, render: (val) => <StatusTag value={val} /> },
    { title: '退库是否需要MIS鉴定', dataIndex: 'misIdentifyOnReturn', width: 140, render: (val) => <StatusTag value={val} /> },
    { title: '耗材申请是否需要MIS审核', dataIndex: 'misAudit', width: 160, render: (val) => <StatusTag value={val} /> },
    { title: '是否关联主资产', dataIndex: 'hasMainAsset', width: 120, render: (val) => <StatusTag value={val} /> },
    { title: '是否允许更换', dataIndex: 'allowReplace', width: 110, render: (val) => <StatusTag value={val} /> },
    { title: '是否允许转移', dataIndex: 'allowTransfer', width: 110, render: (val) => <StatusTag value={val} /> },
    { title: '操作', dataIndex: 'action', width: 80, fixed: 'right', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockComprehensiveData;
  return (
    <div className="flex flex-col gap-4">
      <div data-prototype-anchor="material-query-bar">
      <QueryBar buttons={
        <>
          <Button type="primary" icon={<Search size={14} />}>查询</Button>
          <Button icon={<RefreshCcw size={14} />}>重置</Button>
          <Button type="link" onClick={() => setIsQueryExpanded(!isQueryExpanded)} icon={isQueryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}>{isQueryExpanded ? '收起更多' : '展开更多'}</Button>
        </>
      }>
        <QueryItem label="维度组合编码">
          <Input placeholder="请输入编码" />
        </QueryItem>
        <QueryItem label="维度组合描述">
          <Input placeholder="请输入描述" />
        </QueryItem>
        <QueryItem label="物料总类">
          <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'资产', value:'1'}, {label:'耗材', value:'2'}, {label:'低值耐用品', value:'3'}]} />
        </QueryItem>
        <QueryItem label="物料大类">
          <div className="relative w-full cursor-pointer">
            <Input placeholder="搜索大类..." readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
        <QueryItem label="物料小类">
          <div className="relative w-full cursor-pointer">
            <Input placeholder="搜索小类..." readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
        <QueryItem label="品牌">
          <div className="relative w-full cursor-pointer">
            <Input placeholder="搜索品牌..." readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
        <QueryItem label="型号">
          <div className="relative w-full cursor-pointer">
            <Input placeholder="搜索型号..." readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
        <QueryItem label="配置描述">
          <div className="relative w-full cursor-pointer">
            <Input placeholder="搜索配置..." readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
        <QueryItem label="单位">
          <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'台', value:'1'}, {label:'块', value:'2'}, {label:'个', value:'3'}, {label:'套', value:'4'}, {label:'件', value:'5'}]} />
        </QueryItem>
        {isQueryExpanded && <QueryItem label="是否启用">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="正式员工可申请">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'是'}, {label:'否', value:'否'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="耗材申请是否需要MIS审核">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="退库是否需要MIS鉴定">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="是否关联主资产">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="是否需要盘点">
              <Select style={{ width: '100%' }} placeholder="请选择" allowClear options={[{label:'是', value:'是'}, {label:'否', value:'否'}]} />
            </QueryItem>}
            {isQueryExpanded && <QueryItem label="参考价格">
              <div className="flex items-center w-full gap-2">
                <Input placeholder="从" />
                <span className="text-gray-400">至</span>
                <Input placeholder="至" />
              </div>
            </QueryItem>}
      </QueryBar>

      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div data-prototype-anchor="material-table-toolbar" className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <div className="relative">
            <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
          </div>
        </div>
        <div data-prototype-anchor="material-table" className="overflow-x-auto">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 2800 }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料维度组合' : '编辑物料维度组合'} width="1100px">
        {/* 核心字段 */}
        <div className="mb-4">
          <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">
            核心字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">维度组合编码</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <Input value={formData.code || '系统自动生成'} disabled={true} className="bg-[#f5f5f5]" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>维度组合描述</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <Input value={formData.brand && formData.modelCode ? formData.brand + "." + formData.modelCode : "请先选择品牌/规格型号"} disabled={true} className="bg-[#f5f5f5]" />
              </div>
            </div>
            {modalMode === 'add' ? (
              <>
                <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料总类</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                    <Select value={formData.mainCatCode} onChange={(value) => setFormData({...formData, mainCatCode: value})} options={[{label:'资产', value:'1'}, {label:'耗材', value:'2'}, {label:'低值耐用品', value:'3'}]} className="w-full" placeholder="请选择" allowClear />
                  </div>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类/小类</div>
                  <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => {if (formData.mainCatDesc) setIsSubCategoryModalOpen(true); else setIsMaterialCategoryModalOpen(true);}}>
                    <Input value={formData.mainCatDesc && formData.subCatDesc ? formData.mainCatDesc + ' / ' + formData.subCatDesc : ''} placeholder="请先选择物料大类" readOnly className="pointer-events-none" />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                  </div>
                </div>
                <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌/规格型号</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => {if (!formData.brand) setIsBrandModalOpen(true); else setIsModelModalOpen(true);}}>
                    <Input value={formData.brand && formData.modelCode ? formData.brand + " / " + formData.modelCode : ""} placeholder="请先选择品牌" readOnly className="pointer-events-none" />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                  </div>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">配置描述</div>
                  <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsConfigModalOpen(true)}>
                    <Input value={formData.configDesc || ''} placeholder="请选择配置" readOnly className="pointer-events-none" />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料总类</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                    <Select value={formData.mainCatCode} disabled className="w-full" options={[{label:'资产', value:'1'}, {label:'耗材', value:'2'}, {label:'低值耐用品', value:'3'}]} />
                  </div>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
                  <div className="w-[37.5%] p-2 flex items-center">
                    <Input value={formData.mainCatDesc || ''} disabled />
                  </div>
                </div>
                <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                    <Input value={formData.subCatDesc || ''} disabled />
                  </div>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
                  <div className="w-[37.5%] p-2 flex items-center">
                    <Input value={formData.brand || ''} disabled />
                  </div>
                </div>
                <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                    <Input value={formData.modelDesc || formData.model || ''} disabled />
                  </div>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">配置</div>
                  <div className="w-[37.5%] p-2 flex items-center">
                    <Input value={formData.configDesc || ''} disabled />
                  </div>
                </div>
              </>
            )}
            <div className="flex min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">单位</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <Input value={formData.unit || ""} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="请输入单位" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>参考价格</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <Input value={formData.refPrice || ""} onChange={(e) => setFormData({...formData, refPrice: e.target.value})} placeholder={"请输入价格（元）"} />
              </div>
            </div>
          </div>
        </div>
{/* 状态字段 */}
        <div className="mb-4">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">
            状态字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
                <Radio checked={formData.enabled==='1'} onChange={() => setFormData({...formData, enabled: '1'})}>启用</Radio>
                <Radio checked={formData.enabled==='0'} onChange={() => setFormData({...formData, enabled: '0'})}>停用</Radio>
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否停产</div>
              <div className="w-[37.5%] p-2 flex items-center gap-4 px-3">
                <Radio checked={formData.isStop==='1'} onChange={() => setFormData({...formData, isStop: '1'})}>是</Radio>
                <Radio checked={formData.isStop==='0'} onChange={() => setFormData({...formData, isStop: '0'})}>否</Radio>
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">启用日期</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <DatePicker value={formData.enableDate} onChange={(date, dateString) => setFormData({...formData, enableDate: dateString})} placeholder={'请选择启用日期'} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">停用日期</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <DatePicker value={formData.stopDate} onChange={(date, dateString) => setFormData({...formData, stopDate: dateString})} placeholder={'请选择停用日期'} className="w-full" />
              </div>
            </div>
          </div>
        </div>
        {/* 业务规则字段 */}
        <div className="mb-4">
          <div className="bg-[#fff7e6] border border-[#ffd591] px-4 py-2 rounded-t text-sm font-medium text-[#fa8c16]">
            业务规则字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            {(() => {
              // 基础字段（始终显示）
              const baseFields = [
                {
                  key: 'formalCanApply',
                  label: '正式员工可申请',
                  content: (
                    <div className="flex items-center gap-2 px-3">
                      <Radio checked={formData.formalCanApply==='是'} onChange={() => setFormData({...formData, formalCanApply: '是'})}>是</Radio>
                      <Radio checked={formData.formalCanApply==='否'} onChange={() => setFormData({...formData, formalCanApply: '否'})}>否</Radio>
                      <Radio checked={formData.formalCanApply==='临时可申请'} onChange={() => setFormData({...formData, formalCanApply: '临时可申请'})}>临时可申请</Radio>
                    </div>
                  ),
                },
                {
                  key: 'internCanApply',
                  label: '实习生可申请',
                  visible: formData.formalCanApply !== '临时可申请',
                  content: (
                    <div className="flex items-center gap-4 px-3">
                      <Radio checked={formData.internCanApply==='是'} onChange={() => setFormData({...formData, internCanApply: '是'})}>是</Radio>
                      <Radio checked={formData.internCanApply==='否'} onChange={() => setFormData({...formData, internCanApply: '否'})}>否</Radio>
                    </div>
                  ),
                },
                {
                  key: 'tempDateRange',
                  label: '生效时间',
                  visible: formData.formalCanApply === '临时可申请',
                  content: (
                    <DatePicker.RangePicker value={formData.tempEffStartDate && formData.tempEffEndDate ? [dayjs(formData.tempEffStartDate), dayjs(formData.tempEffEndDate)] : null} onChange={(dates, dateStrings) => setFormData({...formData, tempEffStartDate: dateStrings[0], tempEffEndDate: dateStrings[1]})} placeholder={['开始日期', '结束日期']} className="w-full" />
                  ),
                },
                {
                  key: 'tempDept',
                  label: '可申请部门',
                  visible: formData.formalCanApply === '临时可申请',
                  content: (
                    <div className="flex items-center relative w-full cursor-pointer" onClick={() => setIsDeptModalOpen(true)}>
                      <Input value={formData.tempDept || ''} placeholder="请选择部门" readOnly className="pointer-events-none bg-white w-full" />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                    </div>
                  ),
                },
                {
                  key: 'tempEmployee',
                  label: '可申请员工',
                  visible: formData.formalCanApply === '临时可申请',
                  content: (
                    <div className="flex items-center relative w-full cursor-pointer" onClick={() => setIsEmpModalOpen(true)}>
                      <Input value={formData.tempEmployee || ''} placeholder="请选择员工" readOnly className="pointer-events-none bg-white w-full" />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                    </div>
                  ),
                },
              ];
              // 条件字段（根据物料总类插入在正式员工/实习生之后、盘点/退库之前）
              const conditionFields = [];
              if (formData.mainCatCode === '1') {
                conditionFields.push(
                  { key: 'misIdentifyOnReturn', label: '退库是否需要MIS鉴定', content: (<div className="flex items-center gap-4 px-3"><Radio checked={formData.misIdentifyOnReturn==='1'} onChange={() => setFormData({...formData, misIdentifyOnReturn: '1'})}>是</Radio><Radio checked={formData.misIdentifyOnReturn==='0'} onChange={() => setFormData({...formData, misIdentifyOnReturn: '0'})}>否</Radio></div>) },
                  { key: 'allowReplace', label: '是否允许更换', content: (<div className="flex items-center gap-4 px-3"><Radio checked={formData.allowReplace==='1'} onChange={() => setFormData({...formData, allowReplace: '1'})}>是</Radio><Radio checked={formData.allowReplace==='0'} onChange={() => setFormData({...formData, allowReplace: '0'})}>否</Radio></div>) },
                  { key: 'allowTransfer', label: '是否允许转移', content: (<div className="flex items-center gap-4 px-3"><Radio checked={formData.allowTransfer==='1'} onChange={() => setFormData({...formData, allowTransfer: '1'})}>是</Radio><Radio checked={formData.allowTransfer==='0'} onChange={() => setFormData({...formData, allowTransfer: '0'})}>否</Radio></div>) },
                );
              } else if (formData.mainCatCode === '2' || formData.mainCatCode === '3') {
                conditionFields.push(
                  { key: 'misAudit', label: '耗材申请是否需要MIS审核', content: (<div className="flex items-center gap-4 px-3"><Radio checked={formData.misAudit==='1'} onChange={() => setFormData({...formData, misAudit: '1'})}>是</Radio><Radio checked={formData.misAudit==='0'} onChange={() => setFormData({...formData, misAudit: '0'})}>否</Radio></div>) },
                  { key: 'hasMainAsset', label: '是否关联主资产', content: (<div className="flex items-center gap-4 px-3"><Radio checked={formData.hasMainAsset==='1'} onChange={() => setFormData({...formData, hasMainAsset: '1'})}>是</Radio><Radio checked={formData.hasMainAsset==='0'} onChange={() => setFormData({...formData, hasMainAsset: '0'})}>否</Radio></div>) },
                );
                if (formData.hasMainAsset === '1') {
                  conditionFields.push(
                    { key: 'mainAssetSubCat', label: '主资产物料小类', content: (<div className="flex items-center relative w-full"><Input value={formData.mainAssetSubCat || ''} onChange={(e) => setFormData({...formData, mainAssetSubCat: e.target.value})} placeholder="请选择主资产物料小类" className="w-full" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" /></div>) },
                  );
                }
              }
              // 尾部字段（始终显示）
              const tailFields = [
                {
                  key: 'needCheck',
                  label: '是否需要盘点',
                  content: (
                    <div className="flex items-center gap-4 px-3">
                      <Radio checked={formData.needCheck==='是'} onChange={() => setFormData({...formData, needCheck: '是'})}>是</Radio>
                      <Radio checked={formData.needCheck==='否'} onChange={() => setFormData({...formData, needCheck: '否'})}>否</Radio>
                    </div>
                  ),
                },
                {
                  key: 'allowReturn',
                  label: '是否允许退库',
                  content: (
                    <div className="flex items-center gap-4 px-3">
                      <Radio checked={formData.allowReturn==='1'} onChange={() => setFormData({...formData, allowReturn: '1'})}>是</Radio>
                      <Radio checked={formData.allowReturn==='0'} onChange={() => setFormData({...formData, allowReturn: '0'})}>否</Radio>
                    </div>
                  ),
                },
              ];
              // 拼接：基础(可见) + 条件 + 尾部
              const allFields = [...baseFields.filter(f => f.visible !== false), ...conditionFields, ...tailFields];
              // 每2个一行
              const rows = [];
              for (let i = 0; i < allFields.length; i += 2) {
                rows.push([allFields[i], i + 1 < allFields.length ? allFields[i + 1] : null]);
              }
              return rows.map((row, rowIdx) => (
                <div key={rowIdx} className={"flex min-h-[40px]" + (rowIdx < rows.length - 1 ? " border-b border-[#e8e8e8]" : "")}>
                  <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">{row[0].label}</div>
                  <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">{row[0].content}</div>
                  {row[1] ? (
                    <>
                      <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">{row[1].label}</div>
                      <div className="w-[37.5%] p-2 flex items-center">{row[1].content}</div>
                    </>
                  ) : (
                    <>
                      <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"></div>
                      <div className="w-[37.5%] p-2 flex items-center"></div>
                    </>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
      <Modal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} footer={null} title="批量修改" width="400px">
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <Upload size={18} className="text-[#1677ff]" />
            <span className="text-sm text-gray-700">上传文件</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <Download size={18} className="text-[#1677ff]" />
            <span className="text-sm text-gray-700">下载模板</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <CheckCircle size={18} className="text-[#52c41a]" />
            <span className="text-sm text-gray-700">无须盘点设置</span>
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
          mainCatCode: record.code,
          mainCatDesc: record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
      <SelectModal
        open={isBrandModalOpen}
        title="选择品牌"
        dataSource={mockBrands}
        columns={[{ title: '品牌编码', dataIndex: 'code' }, { title: '品牌描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '品牌编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '品牌描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsBrandModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          brand: record.desc
          });
          setIsBrandModalOpen(false);
          setTimeout(() => setIsModelModalOpen(true), 100);
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
          modelCode: record.code,
          modelDesc: record.desc
          });
          setIsModelModalOpen(false);
        }}
      />
      <SelectModal
        open={isSubCategoryModalOpen}
        title="选择物料小类"
        dataSource={mockSubCategoryData}
        columns={[{ title: '小类编码', dataIndex: 'code' }, { title: '小类描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsSubCategoryModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          subCatCode: record.code,
          subCatDesc: record.desc
          });
          setIsSubCategoryModalOpen(false);
        }}
      />
      <SelectModal
        open={isDeptModalOpen}
        title="选择部门"
        dataSource={mockDepartments}
        columns={[{ title: '部门编码', dataIndex: 'code' }, { title: '部门名称', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '名称', name: 'desc', dataIndex: 'desc', placeholder: '请输入名称' }]}
        onCancel={() => setIsDeptModalOpen(false)}
        onConfirm={(record) => {
          setFormData({...formData, tempDept: record.desc});
          setIsDeptModalOpen(false);
        }}
      />
      <SelectModal
        open={isEmpModalOpen}
        title="选择员工"
        dataSource={mockEmployeeMappingData}
        columns={[{ title: '员工编码', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '姓名', name: 'desc', dataIndex: 'desc', placeholder: '请输入姓名' }]}
        onCancel={() => setIsEmpModalOpen(false)}
        onConfirm={(record) => {
          setFormData({...formData, tempEmployee: record.desc});
          setIsEmpModalOpen(false);
        }}
      />
      <SelectModal
        open={isConfigModalOpen}
        title="选择配置"
        dataSource={mockConfigs.filter(function(m) { return (!formData.brand || m.brand === formData.brand) && (!formData.modelCode || m.model === formData.modelCode) })}
        columns={[{ title: '品牌', dataIndex: 'brand' }, { title: '型号', dataIndex: 'model' }, { title: '配置编码', dataIndex: 'code' }, { title: '配置描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '品牌', name: 'brand', dataIndex: 'brand' }, { label: '型号', name: 'model', dataIndex: 'model' }, { label: '配置编码', name: 'code', dataIndex: 'code' }, { label: '配置描述', name: 'desc', dataIndex: 'desc' }]}
        onCancel={() => setIsConfigModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          configDesc: record.desc
          });
          setIsConfigModalOpen(false);
        }}
      />
    </div>
  );
};
// 2. 物料大类
const MaterialCategoryView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', enabled: '', borrowable: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', enabled: '', borrowable: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0', borrowable: record.borrowable ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类编号', dataIndex: 'code' },
    { title: '物料大类描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockCategoryData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="物料大类编号">
          <Input placeholder="请输入大类编号" />
        </QueryItem>
      <QueryItem label="物料大类描述">
          <Input placeholder="请输入大类描述" />
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
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button danger icon={<XCircle disabled={selectedRowKeys.length === 0} size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料大类' : '编辑物料大类'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>物料大类编码
            </div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>物料大类描述
            </div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>是否启用
            </div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
            </div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
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
    </div>
  );
}
// 3. 物料小类
const MaterialSubCategoryView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1'
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCatCode: '001', mainCatDesc: record.catDesc, subDesc: record.subDesc, enabled: record.enabled ? '1' : '0', mis: record.mis ? '1' : '0', borrowable: record.borrowable ? '1' : '0', pcPart: record.pcPart ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类描述', dataIndex: 'catDesc' },
    { title: '物料小类编号', dataIndex: 'subCode' },
    { title: '物料小类描述', dataIndex: 'subDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '标签生成规则', dataIndex: 'rule' },
    { title: '是否允许借用', dataIndex: 'borrowable', render: (val) => <StatusTag value={val} /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockSubCategoryData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="物料大类">
          <div className="relative w-full cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
            <Input placeholder="请选择物料大类" readOnly className="pointer-events-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
          </div>
        </QueryItem>
      <QueryItem label="物料小类编号">
          <Input placeholder="请输入小类编号" />
        </QueryItem>
      <QueryItem label="物料小类描述">
          <Input placeholder="请输入小类描述" />
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
          <Button danger icon={<XCircle disabled={selectedRowKeys.length === 0} size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增物料小类' : '编辑物料小类'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
              {modalMode === 'edit'? (
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <Input value={formData.mainCatCode && formData.mainCatDesc ? formData.mainCatCode + " - " + formData.mainCatDesc : ""} disabled />
                </div>
              ) : (
                <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
                  <Input value={formData.mainCatCode && formData.mainCatDesc ? formData.mainCatCode + " - " + formData.mainCatDesc : ""} placeholder="请选择物料大类" readOnly className="pointer-events-none" />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                </div>
              )}
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类描述</div>
              <div className="w-[35%] p-2 flex items-center">
                <Input value={formData.subDesc} onChange={(e) => setFormData({...formData, subDesc: e.target.value})} />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
                <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
                <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否允许借用</div>
              <div className="w-[35%] p-2 flex items-center gap-4 px-3">
                <Radio checked={formData.borrowable === '1'} onChange={() => setFormData({...formData, borrowable: '1'})} label="是" />
                <Radio checked={formData.borrowable === '0'} onChange={() => setFormData({...formData, borrowable: '0'})} label="否" />
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
          mainCatCode: record.code,
          mainCatDesc: record.desc
          });
          setIsMaterialCategoryModalOpen(false);
        }}
      />
    </div>
  );
};
// 4. 品牌
const BrandView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌编码', dataIndex: 'code' },
    { title: '品牌描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockBrandListData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="品牌编码">
          <Input placeholder="请输入编码" />
        </QueryItem>
      <QueryItem label="品牌描述">
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
          <Button danger icon={<XCircle disabled={selectedRowKeys.length === 0} size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增品牌' : '编辑品牌'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌编码</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} disabled={true} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌描述</div>
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
    </div>
  );
};
// 5. 型号
const ModelView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [formData, setFormData] = useState({ brand: '', code: '', desc: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ brand: '', code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ brand: record.brand, code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '规格型号编码', dataIndex: 'code' },
    { title: '规格型号描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockModelListData;
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
      <QueryItem label="规格型号编码">
          <Input placeholder="请输入编码" />
        </QueryItem>
      <QueryItem label="规格型号描述">
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
          <Button danger icon={<XCircle disabled={selectedRowKeys.length === 0} size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增型号' : '编辑型号'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
            <div className="w-[35%] p-2 flex items-center">
              {modalMode === 'edit' ? (
                <Input value={formData.brand} disabled />
              ) : (
                <div className="relative cursor-pointer w-full" onClick={() => setIsBrandModalOpen(true)}>
                  <Input value={formData.brand} placeholder="请选择品牌" readOnly className="pointer-events-none" />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
                </div>
              )}
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号编码</div>
            <div className="w-[35%] p-2 flex items-center">
<Input value={formData.code} disabled={true} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <Radio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <Radio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
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
    </div>
  );
};
// 6. 配置
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
          <Button danger icon={<XCircle disabled={selectedRowKeys.length === 0} size={14} />}>停用</Button>
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
const OfficeWarehouseMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
 const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
 const [formData, setFormData] = useState({ company: '', dept: '', office: '', warehouse: '', enabled: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', dept: '', office: '', warehouse: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, dept: record.dept, office: record.office, warehouse: record.warehouse, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '部门', dataIndex: 'dept' },
    { title: '办公区', dataIndex: 'office' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockOfficeWarehouseData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="公司">
          <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="办公区">
          <div className="flex-1 relative">
          <Input placeholder="搜索办公区..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="仓库">
          <div className="flex-1 relative">
          <Input placeholder="搜索仓库..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="部门">
          <div className="flex-1 relative">
          <Input placeholder="搜索部门..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
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
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>部门</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsDepartmentModalOpen(true)}>
              <Input value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} placeholder="请选择部门" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>办公区</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsOfficeModalOpen(true)}>
              <Input value={formData.office} onChange={(e) => setFormData({...formData, office: e.target.value})} placeholder="请选择办公区" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsWarehouseModalOpen(true)}>
              <Input value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} placeholder="请选择仓库" readOnly className="pointer-events-none" />
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
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '公司编码', dataIndex: 'code' }, { title: '公司描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '公司描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.desc
          });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isDepartmentModalOpen}
        title="选择部门"
        dataSource={mockDepartments}
        columns={[{ title: '部门编码', dataIndex: 'code' }, { title: '部门描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '部门编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '部门描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsDepartmentModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          dept: record.desc
          });
          setIsDepartmentModalOpen(false);
        }}
      />
      <SelectModal
        open={isWarehouseModalOpen}
        title="选择仓库"
        dataSource={mockWarehouses}
        columns={[{ title: '仓库编码', dataIndex: 'code' }, { title: '仓库描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '仓库编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '仓库描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsWarehouseModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          warehouse: record.desc
          });
          setIsWarehouseModalOpen(false);
        }}
      />
      <SelectModal
        open={isOfficeModalOpen}
        title="选择办公区"
        dataSource={mockOffices}
        columns={[{ title: '办公区编码', dataIndex: 'code' }, { title: '办公区描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '办公区编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '办公区描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsOfficeModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          office: record.desc
          });
          setIsOfficeModalOpen(false);
        }}
      />
    </div>
  );
};
// 9. PS新员工领用物料映射
const PSNewEmployeeMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', config: '', city: '', desc: '', qty: '', dept: '', enabled: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', config: '', city: '', desc: '', qty: '1', dept: 'MIS', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, config: record.config, city: record.city, desc: record.desc, qty: record.qty, dept: record.dept, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '资产配置', dataIndex: 'config' },
    { title: 'City', dataIndex: 'city' },
    { title: '物料描述', dataIndex: 'desc' },
    { title: '数量', dataIndex: 'qty' },
    { title: '处理部门', dataIndex: 'dept' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockNOLocationData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="资产配置">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'标准台式设计机', value:'1'}]} 
            />
        </QueryItem>
      <QueryItem label="公司">
          <div className="flex-1 relative">
          <Input placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="City">
          <div className="flex-1 relative">
          <Input placeholder="搜索City..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="物料描述">
          <div className="flex-1 relative">
          <Input placeholder="搜索物料描述..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="数量">
          <Input placeholder="请输入数量" />
        </QueryItem>
      <QueryItem label="处理部门">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'MIS', value:'1'}, {label:'ES', value:'0'}]} 
            />
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
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>资产配置</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.config} onChange={(value) => setFormData({...formData, config: value})} options={[{label:'标准台式设计机', value:'标准台式设计机'}, {label:'标准笔记本配置', value:'标准笔记本配置'}]} placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCityModalOpen(true)}>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料描述</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请选择物料描述" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>处理部门</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.dept} onChange={(value) => setFormData({...formData, dept: value})} options={[{label:'MIS', value:'MIS'}, {label:'ES', value:'ES'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>数量</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input type="number" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="请输入数量" min={0} />
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
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '公司编码', dataIndex: 'code' }, { title: '公司描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '公司描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.desc
          });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isCityModalOpen}
        title="选择City"
        dataSource={mockCities}
        columns={[{ title: '城市编码', dataIndex: 'code' }, { title: '城市描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '城市编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '城市描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCityModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          city: record.desc
          });
          setIsCityModalOpen(false);
        }}
      />
    </div>
  );
};
// 10. NO地点与资产地点映射
const NOLocationMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', info: '', city: '', building: '', floor: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', info: '', city: '', building: '', floor: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, info: record.info, city: record.city, building: record.building, floor: record.floor, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO地点英文缩写', dataIndex: 'code' },
    { title: 'NO地点中文描述', dataIndex: 'desc' },
    { title: 'NO地点详细信息', dataIndex: 'info' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Building', dataIndex: 'building' },
    { title: 'Floor', dataIndex: 'floor' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockNOLocationData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点英文缩写:</span>
        <Input placeholder="请输入英文缩写" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点中文描述:</span>
        <Input placeholder="请输入中文描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点详细信息:</span>
        <Input placeholder="请输入详细信息" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" className="text-green-600" icon={<RefreshCcw size={14} />}>刷新</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>英文缩写</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入英文缩写" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>中文描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入中文描述" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>详细信息</div>
            <div className="w-[85%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.info} onChange={(e) => setFormData({...formData, info: e.target.value})} placeholder="请输入详细信息" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCityModalOpen(true)}>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Building</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsBuildingModalOpen(true)}>
              <Input value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} placeholder="请选择Building" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Floor</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.floor} onChange={(value) => setFormData({...formData, floor: value})} options={[{label:'缺省', value:'缺省'}, {label:'1层', value:'1层'}, {label:'2层', value:'2层'}, {label:'3层', value:'3层'}, {label:'B1层', value:'B1层'}]} placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
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
        open={isCityModalOpen}
        title="选择City"
        dataSource={mockCities}
        columns={[{ title: '城市编码', dataIndex: 'code' }, { title: '城市描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '城市编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '城市描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCityModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          city: record.desc
          });
          setIsCityModalOpen(false);
        }}
      />
      <SelectModal
        open={isBuildingModalOpen}
        title="选择Building"
        dataSource={mockBuildings}
        columns={[{ title: '建筑编码', dataIndex: 'code' }, { title: '建筑描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '建筑编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '建筑描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsBuildingModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          building: record.desc
          });
          setIsBuildingModalOpen(false);
        }}
      />
    </div>
  );
};
// 11. 虚拟库管员映射
const VirtualWarehouseManagerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isVirtualAdminModalOpen, setIsVirtualAdminModalOpen] = useState(false);
  const [isRealAdminModalOpen, setIsRealAdminModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', virtualAdmin: '', realAdmin: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', virtualAdmin: '', realAdmin: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, virtualAdmin: record.virtualAdmin, realAdmin: record.realAdmin, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '虚拟库管员', dataIndex: 'virtualAdmin' },
    { title: '仓库管理员', dataIndex: 'realAdmin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockVirtualWarehouseManagerData;
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
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">虚拟库管员:</span>
        <div className="flex-1 relative cursor-pointer" onClick={() => setIsVirtualAdminModalOpen(true)}>
          <Input placeholder="请选择虚拟库管员" readOnly className="pointer-events-none" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
        </div>
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>虚拟库管员</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsVirtualAdminModalOpen(true)}>
              <Input value={formData.virtualAdmin} onChange={(e) => setFormData({...formData, virtualAdmin: e.target.value})} placeholder="请选择虚拟库管员" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库管理员</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsRealAdminModalOpen(true)}>
              <Input value={formData.realAdmin} onChange={(e) => setFormData({...formData, realAdmin: e.target.value})} placeholder="请选择仓库管理员" readOnly className="pointer-events-none" />
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
        open={isCompanyModalOpen}
        title="选择公司"
        dataSource={mockCompanies}
        columns={[{ title: '公司编码', dataIndex: 'code' }, { title: '公司描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '公司描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsCompanyModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          company: record.desc
          });
          setIsCompanyModalOpen(false);
        }}
      />
      <SelectModal
        open={isVirtualAdminModalOpen}
        title="选择虚拟库管员"
        dataSource={mockVirtualAdmins}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsVirtualAdminModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          virtualAdmin: record.desc
          });
          setIsVirtualAdminModalOpen(false);
        }}
      />
      <SelectModal
        open={isRealAdminModalOpen}
        title="选择仓库管理员"
        dataSource={mockRealAdmins}
        columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
        searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
        onCancel={() => setIsRealAdminModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          realAdmin: record.desc
          });
          setIsRealAdminModalOpen(false);
        }}
      />
    </div>
  );
};
// 12. 板块与账簿映射
const PlateLedgerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ plate: '', ledger: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ plate: '', ledger: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ plate: record.plate, ledger: record.ledger, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账簿', dataIndex: 'ledger' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockPlateLedgerData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <Input placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">账簿:</span>
        <Input placeholder="请输入账簿" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="全部" 
            />
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
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>账簿</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.ledger} onChange={(e) => setFormData({...formData, ledger: e.target.value})} placeholder="请选择账簿" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select style={{ width: '100%' }} value={formData.enabled} onChange={(value) => setFormData({...formData, enabled: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
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
    </div>
  );
};
// 13. 公司板块提取资产权限
const CompanyPlateAssetAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, materialCat: record.materialCategory, empCompany: record.empCompany, empPlate: record.empPlate });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <Input value={formData.materialCat} onChange={(e) => setFormData({...formData, materialCat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属公司</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.empCompany} onChange={(e) => setFormData({...formData, empCompany: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属板块</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.empPlate} onChange={(e) => setFormData({...formData, empPlate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
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
  const [formData, setFormData] = useState({ type: '服务器', owner: '' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '服务器', owner: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type, owner: record.owner });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO设备类型', dataIndex: 'type' },
    { title: '责任人', dataIndex: 'owner' },
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增设备权限' : '编辑设备权限'} width="700px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[30%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO设备类型</div>
            <div className="w-[70%] p-2 flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[{label:'服务器', value:'服务器'}, {label:'网络设备', value:'网络设备'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[30%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>责任人</div>
            <div className="w-[70%] p-2 flex items-center relative">
              <Input value={formData.owner} onChange={(e) => setFormData({...formData, owner: e.target.value})} placeholder="请选择责任人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
const WarehouseInfoView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
    company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
    isEnabled: '1', startDate: '', endDate: ''
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
      company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: '1', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      code: record.code, desc: record.desc, city: record.city || '', building: '', floor: '', address: '', 
      type: '', usage: record.usage, company: record.company, admin: record.admin,
      isVirtual: record.isVirtual ? '1' : '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: record.enabled ? '1' : '0', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库编码', dataIndex: 'code' },
    { title: '仓库描述', dataIndex: 'desc' },
    { title: '仓库用途', dataIndex: 'usage' },
    { title: '是否虚拟库', dataIndex: 'isVirtual', render: (val) => <StatusTag value={val} /> },
    { title: '公司', dataIndex: 'company' },
    { title: 'City', dataIndex: 'city' },
    { title: '库管员', dataIndex: 'admin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockWarehouseInfoData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <QueryItem label="仓库编码">
          <Input placeholder="请输入仓库编码" />
        </QueryItem>
        <QueryItem label="仓库描述">
          <Input placeholder="请输入仓库描述" />
        </QueryItem>
        <QueryItem label="是否虚拟库">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
        </QueryItem>
        <QueryItem label="是否启用">
          <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} 
            />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-[#f0f0f0] bg-white flex gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title="仓库信息" width="850px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库编码</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>城市</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>楼栋</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">楼层</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.floor} onChange={(value) => setFormData({...formData, floor: value})} options={[]} placeholder="请选择" allowClear className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库地址</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.type} onChange={(value) => setFormData({...formData, type: value})} options={[]} placeholder="请选择" allowClear className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库用途</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <Input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>管理员</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.admin} onChange={(e) => setFormData({...formData, admin: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否虚拟库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <Radio checked={formData.isVirtual === '1'} onChange={() => setFormData({...formData, isVirtual: '1'})}>是</Radio>
              <Radio checked={formData.isVirtual === '0'} onChange={() => setFormData({...formData, isVirtual: '0'})}>否</Radio>
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <Radio checked={formData.isEnabled === '1'} onChange={() => setFormData({...formData, isEnabled: '1'})}>是</Radio>
              <Radio checked={formData.isEnabled === '0'} onChange={() => setFormData({...formData, isEnabled: '0'})}>否</Radio>
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">启用日期</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <DatePicker value={formData.startDate} onChange={(date, dateString) => setFormData({...formData, startDate: dateString})} placeholder="请选择启用日期" className="w-full" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">停用日期</div>
            <div className="w-[35%] p-2 flex items-center">
              <DatePicker value={formData.endDate} onChange={(date, dateString) => setFormData({...formData, endDate: dateString})} placeholder="请选择停用日期" className="w-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</Button>
          <Button type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</Button>
        </div>
      </Modal>
    </div>
  )
}
// 17. 仓库用途
const WarehouseUsageView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', category: '', mainCategory: '', subCategory: '', enabled: '1' });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', category: '', mainCategory: '', subCategory: '', enabled: '1' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ 
      code: record.code, desc: record.desc, category: record.category, 
      mainCategory: record.mainCategory, subCategory: record.subCategory, 
      enabled: record.enabled ? '1' : '0' 
    });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '编号', dataIndex: 'code' },
    { title: '描述', dataIndex: 'desc' },
    { title: '物料总类', dataIndex: 'category' },
    { title: '物料大类', dataIndex: 'mainCategory' },
    { title: '物料小类', dataIndex: 'subCategory' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockWarehouseUsageData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">编号:</span>
        <Input placeholder="请输入编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">描述:</span>
        <Input placeholder="请输入描述" />
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增用途' : '编辑用途'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>编号</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Input value={formData.code} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编号" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料总类</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料大类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.mainCategory} onChange={(e) => setFormData({...formData, mainCategory: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料小类</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.enabled} onChange={(value) => setFormData({...formData, enabled: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
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
// 18. 仓库权限
const WarehousePermissionView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    warehouse: '', operator: '', 
    inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' 
  });
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ warehouse: '', operator: '', inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' });
    setIsModalOpen(true);
  };
  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ 
      warehouse: record.warehouse, operator: record.operator, 
      inPerm: record.inPerm ? '1' : '0', defaultIn: record.defaultIn ? '1' : '0', 
      outPerm: record.outPerm ? '1' : '0', defaultOut: record.defaultOut ? '1' : '0', 
      invPerm: record.invPerm ? '1' : '0' 
    });
    setIsModalOpen(true);
  };
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '入库权限', dataIndex: 'inPerm', render: (val) => <StatusTag value={val} /> },
    { title: '默认入库仓库', dataIndex: 'defaultIn', render: (val) => <StatusTag value={val} /> },
    { title: '出库权限', dataIndex: 'outPerm', render: (val) => <StatusTag value={val} /> },
    { title: '默认出库仓库', dataIndex: 'defaultOut', render: (val) => <StatusTag value={val} /> },
    { title: '查看权限', dataIndex: 'invPerm', render: (val) => <StatusTag value={val} /> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> }
  ];
  const data = mockWarehousePermissionData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <QueryItem label="仓库编号">
          <div className="flex-1 relative">
          <Input placeholder="搜索仓库..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="操作人">
          <div className="flex-1 relative">
          <Input placeholder="搜索操作人..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
        </QueryItem>
      <QueryItem label="入库权限">
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
          <Button type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库</div>
            <div className="w-[35%] p-2 flex items-center">
              <Input value={formData.warehouse} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} placeholder="请选择仓库" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>操作人</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <Input value={formData.operator} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, operator: e.target.value})} placeholder="请选择操作人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>入库权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.inPerm} onChange={(value) => setFormData({...formData, inPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>出库权限</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.outPerm} onChange={(value) => setFormData({...formData, outPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认入库仓库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.defaultIn} onChange={(value) => setFormData({...formData, defaultIn: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认出库仓库</div>
            <div className="w-[35%] p-2 flex items-center">
              <Select value={formData.defaultOut} onChange={(value) => setFormData({...formData, defaultOut: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>查看权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <Select value={formData.invPerm} onChange={(value) => setFormData({...formData, invPerm: value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]}  placeholder="请选择" allowClear />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"></div>
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
// 19. 地点基础数据维护
const LocationBasicDataView = () => {
  const [expandedKeys, setExpandedKeys] = useState(['1', '2', '3']);
  const columns = [
    { title: '城市名称', dataIndex: 'cityName', render: (text, record) => record.children ? <span className="font-medium">{text}</span> : '' },
    { title: '建筑名称', dataIndex: 'buildingName', render: (text) => text || '-' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> }
  ];
  const data = mockLocationBasicDataData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 递归筛选函数：筛选后保留完整树结构
  const filterTreeData = (treeData, cityNameFilter, buildingNameFilter, enabledFilter) => {
    return treeData.reduce((acc, node) => {
      // 检查城市名称是否匹配
      const cityMatch = !cityNameFilter || node.cityName?.includes(cityNameFilter);
      // 筛选子节点（建筑）
      const filteredChildren = node.children?.filter(child => {
        const buildingMatch = !buildingNameFilter || child.buildingName?.includes(buildingNameFilter);
        const statusMatch = enabledFilter === '' || enabledFilter === undefined ||
          (enabledFilter === '1' && child.enabled) || (enabledFilter === '0' && !child.enabled);
        return buildingMatch && statusMatch;
      }) || [];
      // 如果有匹配的子节点，或者城市名称匹配，则保留该节点
      if (filteredChildren.length > 0 || (cityMatch && (!buildingNameFilter || !node.children?.length))) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      return acc;
    }, []);
  };
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <QueryItem label="城市名称">
          <Input placeholder="请输入城市名称" />
        </QueryItem>
        <QueryItem label="建筑名称">
          <Input placeholder="请输入建筑名称" />
        </QueryItem>
        <QueryItem label="状态">
          <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} placeholder="全部" 
            />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">

        <div className="flex-1 overflow-auto bg-white p-4">
          <div className="border border-[#e8e8e8] rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#e8e8e8]">
                  <th className="w-[8%] p-2 text-left font-medium text-gray-700">序号</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">城市名称</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">建筑名称</th>
                  <th className="w-[22%] p-2 text-left font-medium text-gray-700">是否启用</th>
                </tr>
              </thead>
              <tbody>
                {data.map((city, cityIndex) => (
                  <React.Fragment key={city.id}>
                    {/* 城市行 */}
                    <tr className="border-b border-[#e8e8e8] bg-[#f5f5f5] hover:bg-[#e6f7ff] cursor-pointer"
                        onClick={() => {
                          const newExpanded = expandedKeys.includes(city.id)
                            ? expandedKeys.filter(k => k !== city.id)
                            : [...expandedKeys, city.id];
                          setExpandedKeys(newExpanded);
                        }}>
                      <td className="p-2">
                        <div className="flex items-center">
                          <span className="w-4">{expandedKeys.includes(city.id) ? '▼' : '▶'}</span>
                          <span>{cityIndex + 1}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium text-gray-800">{city.cityName}</span>
                      </td>
                      <td className="p-2 text-gray-500">-</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${city.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {city.enabled ? '启用' : '停用'}
                        </span>
                      </td>
                    </tr>
                    {/* 建筑行 */}
                    {expandedKeys.includes(city.id) && city.children?.map((building, buildingIndex) => (
                      <tr key={building.id} className="border-b border-[#e8e8e8] hover:bg-[#f0f5ff]">
                        <td className="p-2 pl-10 text-gray-500">
                          {cityIndex + 1}.{buildingIndex + 1}
                        </td>
                        <td className="p-2 pl-8 text-gray-400">
                          {city.cityName}
                        </td>
                        <td className="p-2">
                          <span className="text-gray-700">{building.buildingName}</span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${building.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {building.enabled ? '启用' : '停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  )
}
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '账套名称中文', dataIndex: 'cnName' },
    { title: '账套名称英文', dataIndex: 'enName' },
    { title: '操作', dataIndex: 'action', render: () => <Button type="link">操作</Button> }
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
          <Button type="primary" icon={<Plus size={14} />}>新增</Button>
          <Button danger icon={<Trash2 disabled={selectedRowKeys.length === 0} size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
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
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
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
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsServiceModalOpen(true)}>
              <Input value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
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
        open={isServiceModalOpen}
        title="选择NO一级服务"
        dataSource={mockNOServiceData}
        columns={[{ title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "desc" }]}
        searchFields={[{ label: "编码", name: "code", dataIndex: "code", placeholder: "请输入编码" }, { label: "描述", name: "desc", dataIndex: "desc", placeholder: "请输入描述" }]}
        onCancel={() => setIsServiceModalOpen(false)}
        onConfirm={(record) => {
          setFormData({
          ...formData,
          service: record.code + "." + record.desc
          });
          setIsServiceModalOpen(false);
        }}
      />
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const baseDataTabs = ['物料维度组合', '物料大类', '物料小类', '品牌', '型号', '配置'];  //, 'NO服务'
  const mappingTabs = ['办公区与仓库映射', 'PS新员工领用物料映射', 'NO地点与资产地点映射', '虚拟库管员映射', '板块与账簿映射'];
  const authTabs = ['公司板块提取资产权限', 'NO设备提取资产权限', '公司归属权限'];
  const warehouseTabs = ['仓库信息', '仓库用途', '仓库权限'];
  const locationTabs = ['地点基础数据维护'];
  const receiptRuleTabs = ['单据编号规则管理'];
  const accountingTabs = ['HR公司与财务公司映射', '部门与成本中心映射', '成本中心与板块映射', '城市与业务线映射', '部门与业务线映射'];
  const assetAllocationTabs = ['电脑配给方案', '影像器材配给方案', '配给规则'];
  const materialLimitTabs = ['超标规则'];
  const expenseAccountTabs = ['费用账户规则', '成本中心与科目映射', '物料大类与子目映射', 'NO一级服务与科目映射', '员工与项目映射'];
  const depreciationTabs = ['资产折旧规则管理'];
  const accountBookTabs = ['账套内容维护'];
  
  const tabs = activeSubMenu === '物料数据维护' ? baseDataTabs : 
               activeSubMenu === '业务映射规则' ? mappingTabs : 
               activeSubMenu === '业务权限规则管理' ? authTabs : 
               activeSubMenu === '仓库数据维护' ? warehouseTabs : 
               activeSubMenu === '地点数据维护' ? locationTabs : 
              //  activeSubMenu === '单据编号规则管理' ? receiptRuleTabs : 
               activeSubMenu === '会计映射规则' ? accountingTabs : 
              //  activeSubMenu === '资产配给规则' ? assetAllocationTabs : 
               activeSubMenu === '物资申请超标配置' ? materialLimitTabs : 
               activeSubMenu === '费用账户规则' ? expenseAccountTabs :
               activeSubMenu === '资产折旧规则管理' ? depreciationTabs : 
               activeSubMenu === '账套内容维护' ? accountBookTabs : [];
  const handleSubMenuClick = (sub) => {
    setActiveSubMenu(sub);
    if (sub === '物料数据维护') setActiveTab('物料大类');
    if (sub === '业务映射规则') setActiveTab('办公区与仓库映射');
    // if (sub === '业务权限规则管理') setActiveTab('公司板块提取资产权限');
    if (sub === '仓库数据维护') setActiveTab('仓库信息');
    if (sub === '地点数据维护') setActiveTab('地点基础数据维护');
    // if (sub === '单据编号规则管理') setActiveTab('单据编号规则管理');
    if (sub === '会计映射规则') setActiveTab('HR公司与财务公司映射');
    // if (sub === '资产配给规则管理') setActiveTab('影像器材配给方案');
    if (sub === '物资申请超标配置') setActiveTab('超标规则');
    if (sub === '费用账户规则') setActiveTab('费用账户规则');
    // if (sub === '资产折旧规则管理') setActiveTab('资产折旧规则管理');
    if (sub === '账套内容维护') setActiveTab('账套内容维护');
    if (sub === '组织与用户管理') setActiveTab('组织与用户管理');
  };
  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">
      <div className="w-56 bg-[#001529] text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative">
        <div className="h-14 flex items-center gap-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.3)] z-10 bg-[#002140]">
          <div className="w-8 h-8 rounded bg-[#1677ff] flex items-center justify-center font-bold text-lg shadow-sm">E</div>
          <span className="font-semibold text-base tracking-wide text-white">企业资产管理系统</span>
        </div>
        <div className="py-4 px-5 border-b border-white/10 flex flex-col gap-1 text-sm bg-[#001529]">
          <div className="flex items-center gap-2 text-gray-300">
            <User size={14} />
            <span className="font-medium text-white">系统管理员 (admin)</span>
          </div>
          <div className="text-gray-400 text-xs ml-5">2026年05月27日 星期三</div>
        </div>
        <div className="flex-1 py-2">
          {[
            { id: '个人工作台', icon: <LayoutDashboard size={16} /> },
            { id: '资产管理', icon: <Monitor size={16} /> },
            { id: '无形资产', icon: <Layers size={16} /> },
            { id: '资产盘点', icon: <ClipboardList size={16} /> },
          ].map(item => (
             <div 
               key={item.id}
               className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors hover:text-white ${activeMenu === item.id ? 'text-white bg-[#1677ff]' : 'text-gray-300 hover:bg-white/5'}`}
               onClick={() => setActiveMenu(item.id)}
             >
               {item.icon}
               <span>{item.id}</span>
             </div>
          ))}
          <div className="mt-1">
            <div
              className={`flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5`}
              onClick={() => setActiveMenu(activeMenu === '后台基础配置' ? '' : '后台基础配置')}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>后台基础配置</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${activeMenu === '后台基础配置' ? 'rotate-180' : ''}`} />
            </div>
            {activeMenu === '后台基础配置' && (
              <div className="bg-[#000c17] py-1">
                {[
                  '物料数据维护',
                  '业务映射规则',
                  // '业务权限规则管理',
                  '仓库数据维护',
                  '地点数据维护',
                  // '单据编号规则管理',
                  '会计映射规则',
                  // '资产配给规则管理',
                  '物资申请超标配置',
                  '费用账户规则',
                  // '资产折旧规则管理',
                  '账套内容维护',
                  '组织管理',
                  '用户管理',
                  '角色管理',
                  '字典管理',
                ].map(sub => (
                  <div
                    key={sub}
                    className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === sub ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => handleSubMenuClick(sub)}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        <div className="h-14 bg-white shadow-[0_1px_4px_rgba(0,21,41,0.08)] flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <div className="p-1 cursor-pointer text-gray-500 hover:bg-gray-100 rounded transition-colors">
              <Menu size={20} />
            </div>
            <div className="flex items-end h-full pt-3 gap-1">
               <div className="px-4 py-1.5 bg-[#fafafa] border border-b-0 border-[#f0f0f0] rounded-t-md text-sm text-gray-500 cursor-pointer flex items-center gap-2 hover:bg-gray-50">
                 我的资产
                 <XCircle size={12} className="hover:text-red-500" />
               </div>
               <div className="px-4 py-1.5 bg-[#e6f4ff] border border-b-0 border-[#1677ff] rounded-t-md text-sm text-[#1677ff] font-medium cursor-pointer flex items-center gap-2 relative top-[1px]">
                 {activeSubMenu}
                 <XCircle size={12} className="hover:text-[#1677ff]" />
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Bell size={18} className="cursor-pointer hover:text-gray-800 transition-colors" />
            <div className="w-7 h-7 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs shadow-sm cursor-pointer hover:opacity-90">A</div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
             <span>首页</span>
             <ChevronRight size={14} />
             <span>{activeMenu}</span>
             <ChevronRight size={14} />
             <span className="text-gray-800 font-medium">{activeSubMenu}</span>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-[#f0f0f0] min-h-[calc(100vh-140px)] flex flex-col">
            {tabs.length > 0 && (
              <div className="flex items-center border-b border-[#f0f0f0] px-4 pt-2 overflow-x-auto custom-scrollbar bg-white rounded-t-md">
                {tabs.map(tab => (
                  <div
                    key={tab}
                    className={`px-5 py-3 text-sm cursor-pointer whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#1677ff] font-medium' : 'text-gray-600 hover:text-[#1677ff]'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1677ff]" />}
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 md:p-5 bg-[#fafafa] flex-1 flex flex-col relative">
              {/* 组织与用户管理 */}
              {activeSubMenu === '组织与用户管理' && (
                <div className="flex-1 flex flex-col relative">
                  <OrgAndUserContainer />
                </div>
              )}
              {/* 业务基础数据维护 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '物料维度组合' && <MaterialComprehensiveView />}
              {activeMenu === '后台基础配置' && activeTab === '物料大类' && <MaterialCategoryView />}
              {activeMenu === '后台基础配置' && activeTab === '物料小类' && <MaterialSubCategoryView />}
              {activeMenu === '后台基础配置' && activeTab === '品牌' && <BrandView />}
              {activeMenu === '后台基础配置' && activeTab === '型号' && <ModelView />}
              {activeMenu === '后台基础配置' && activeTab === '配置' && <ConfigView />}
              {/* {activeMenu === '后台基础配置' && activeTab === 'NO服务' && <NOServiceView />} */}
              
              {/* 业务映射规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '办公区与仓库映射' && <OfficeWarehouseMappingView />}
              {activeMenu === '后台基础配置' && activeTab === 'PS新员工领用物料映射' && <PSNewEmployeeMappingView />}
              {activeMenu === '后台基础配置' && activeTab === 'NO地点与资产地点映射' && <NOLocationMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '虚拟库管员映射' && <VirtualWarehouseManagerMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '板块与账簿映射' && <PlateLedgerMappingView />}
              {/* 业务权限规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '公司板块提取资产权限' && <CompanyPlateAssetAuthView />}
              {activeMenu === '后台基础配置' && activeTab === 'NO设备提取资产权限' && <NODeviceAssetAuthView />}
              {activeMenu === '后台基础配置' && activeTab === '公司归属权限' && <CompanyBelongingAuthView />}
              {/* 仓库基础数据维护 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '仓库信息' && <WarehouseInfoView />}
              {activeMenu === '后台基础配置' && activeTab === '仓库用途' && <WarehouseUsageView />}
              {activeMenu === '后台基础配置' && activeTab === '仓库权限' && <WarehousePermissionView />}
              {/* 地点基础数据维护 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '地点基础数据维护' && <LocationBasicDataView />}
              {/* 单据编号规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '单据编号规则管理' && <ReceiptRuleManagementView />}
              {/* 会计映射规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === 'HR公司与财务公司映射' && <HRCompanyFinanceMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '部门与成本中心映射' && <DeptCostCenterMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '成本中心与板块映射' && <CostCenterPlateMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '城市与业务线映射' && <CityBusinessLineMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '部门与业务线映射' && <DeptBusinessLineMappingView />}
              {/* 资产配给规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '影像器材配给方案' && <AssetAllocationRuleView />}
              {/* 物资申请超标配置 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '超标规则' && <MaterialRequestLimitView />}
              {/* 费用账户规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '费用账户规则' && <ExpenseAccountRuleView />}
              {activeMenu === '后台基础配置' && activeTab === '成本中心与科目映射' && <CostCenterSubjectMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '物料大类与子目映射' && <MaterialSubSubjectMappingView />}
              {activeMenu === '后台基础配置' && activeTab === 'NO一级服务与科目映射' && <NOServiceSubjectMappingView />}
              {activeMenu === '后台基础配置' && activeTab === '员工与项目映射' && <EmployeeProjectMappingView />}
              {/* 资产折旧规则管理 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '资产折旧规则管理' && <AssetDepreciationRuleView />}
              {/* 账套内容维护 - 只在后台基础配置下显示 */}
              {activeMenu === '后台基础配置' && activeTab === '账套内容维护' && <AccountBookContentView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
