import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Input, Table } from 'antd';
import { UserManagementView, OrgManagementView } from './xitongrules';
import DictManagementView from './dictmanagement';
import RoleManagementView from './rolemgt';
import { AssetManagementContent } from './assetManagement';
import AdminSidebar from './yewurules/components/AdminSidebar';
import AdminHeader from './yewurules/components/AdminHeader';
import AdminContent from './yewurules/components/AdminContent';
import WorkspaceContent from './yewurules/components/WorkspaceContent';
import { BrandView, ConfigView, MaterialCategoryView, MaterialComprehensiveView, MaterialSubCategoryView, ModelView } from './yewurules/modules/material';
import { OfficeWarehouseMappingView, PSNewEmployeeMappingView, NOLocationMappingView, VirtualWarehouseManagerMappingView, PlateLedgerMappingView } from './yewurules/modules/mapping';
import { WarehouseInfoView, WarehouseUsageView, WarehousePermissionView } from './yewurules/modules/warehouse';
import { LocationBasicDataView } from './yewurules/modules/location';
import { CompanyPlateAssetAuthView, NODeviceAssetAuthView, CompanyBelongingAuthView, ReceiptRuleManagementView, AssetAllocationRuleView } from './yewurules/modules/permission';
import { HRCompanyFinanceMappingView, DeptCostCenterMappingView, CostCenterPlateMappingView, CityBusinessLineMappingView, DeptBusinessLineMappingView, AssetDepreciationRuleView, AccountBookContentView, CostCenterSubjectMappingView, MaterialSubSubjectMappingView, NOServiceSubjectMappingView, EmployeeProjectMappingView } from './yewurules/modules/accounting';
import { MaterialRequestLimitView, ExpenseAccountRuleView } from './yewurules/modules/expense';
import { getDefaultTabBySubMenu, getTabsBySubMenu } from './yewurules/config/tabConfig';
import { mockNOServiceData } from '../mock/businessRulesMock';

const NOServiceView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '服务描述', dataIndex: 'desc' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 whitespace-nowrap">服务描述:</span>
          <Input placeholder="请输入服务描述" className="w-64" />
          <Button type="primary" icon={<Search size={14} />}>查询</Button>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="flex-1 overflow-auto bg-white p-4">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={mockNOServiceData} size="middle" pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const location = useLocation();
  const workspaceState = location.state?.workspace;
  const [activeMenu, setActiveMenu] = useState(workspaceState ? '个人工作台' : '后台基础配置');
  const [activeSubMenu, setActiveSubMenu] = useState(workspaceState || '物料数据维护');
  const [activeTab, setActiveTab] = useState(workspaceState || '物料大类');
  const tabs = getTabsBySubMenu(activeSubMenu);

  const handleMenuToggle = (menuKey, collapsible = true) => {
    const isClosing = collapsible && activeMenu === menuKey;
    if (menuKey === '资产管理' && !isClosing) {
      setActiveSubMenu('资产维护');
      setActiveTab('');
    }
    setActiveMenu(isClosing ? '' : menuKey);
  };

  const handleSubMenuSelect = (subMenu) => {
    setActiveSubMenu(subMenu);
    setActiveTab(getDefaultTabBySubMenu(subMenu));
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">
      <AdminSidebar activeMenu={activeMenu} activeSubMenu={activeSubMenu} onMenuToggle={handleMenuToggle} onSubMenuSelect={handleSubMenuSelect} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        <AdminHeader activeSubMenu={activeSubMenu} />
        <AdminContent activeMenu={activeMenu} activeSubMenu={activeSubMenu} activeTab={activeTab} tabs={tabs} onTabChange={setActiveTab}>
          {activeSubMenu === '用户管理' && <div className="flex-1 flex flex-col relative"><UserManagementView /></div>}
          {activeSubMenu === '组织管理' && <div className="flex-1 flex flex-col relative"><OrgManagementView /></div>}
          {activeSubMenu === '角色管理' && <div className="flex-1 flex flex-col relative"><RoleManagementView /></div>}
          {activeSubMenu === '字典管理' && <div className="flex-1 flex flex-col relative"><DictManagementView /></div>}
          {activeMenu === '个人工作台' && <WorkspaceContent activeSubMenu={activeSubMenu} />}
          {activeMenu === '资产管理' && <AssetManagementContent activeSubMenu={activeSubMenu} />}

          {activeMenu === '后台基础配置' && activeTab === '物料维度组合' && <MaterialComprehensiveView />}
          {activeMenu === '后台基础配置' && activeTab === '物料大类' && <MaterialCategoryView />}
          {activeMenu === '后台基础配置' && activeTab === '物料小类' && <MaterialSubCategoryView />}
          {activeMenu === '后台基础配置' && activeTab === '品牌' && <BrandView />}
          {activeMenu === '后台基础配置' && activeTab === '型号' && <ModelView />}
          {activeMenu === '后台基础配置' && activeTab === '配置' && <ConfigView />}
          {activeMenu === '后台基础配置' && activeTab === 'NO服务' && <NOServiceView />}

          {activeMenu === '后台基础配置' && activeTab === '办公区与仓库映射' && <OfficeWarehouseMappingView />}
          {activeMenu === '后台基础配置' && activeTab === 'PS新员工领用物料映射' && <PSNewEmployeeMappingView />}
          {activeMenu === '后台基础配置' && activeTab === 'NO地点与资产地点映射' && <NOLocationMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '虚拟库管员映射' && <VirtualWarehouseManagerMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '板块与账簿映射' && <PlateLedgerMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '公司板块领取资产权限' && <CompanyPlateAssetAuthView />}
          {activeMenu === '后台基础配置' && activeTab === '机房资产领取权限' && <NODeviceAssetAuthView />}
          {activeMenu === '后台基础配置' && activeTab === '公司归属权限' && <CompanyBelongingAuthView />}

          {activeMenu === '后台基础配置' && activeTab === '仓库信息' && <WarehouseInfoView />}
          {activeMenu === '后台基础配置' && activeTab === '仓库用途' && <WarehouseUsageView />}
          {activeMenu === '后台基础配置' && activeTab === '仓库权限' && <WarehousePermissionView />}
          {activeMenu === '后台基础配置' && activeTab === '地点基础数据维护' && <LocationBasicDataView />}
          {activeMenu === '后台基础配置' && activeTab === '单据编号规则管理' && <ReceiptRuleManagementView />}

          {activeMenu === '后台基础配置' && activeTab === 'HR公司与财务公司映射' && <HRCompanyFinanceMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '部门与成本中心映射' && <DeptCostCenterMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '成本中心与板块映射' && <CostCenterPlateMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '城市与业务线映射' && <CityBusinessLineMappingView />}
          {activeMenu === '后台基础配置' && activeTab === '部门与业务线映射' && <DeptBusinessLineMappingView />}

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
