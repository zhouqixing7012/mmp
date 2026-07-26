import PersonalWorkspace from '../../gerengerzuotai';
import Haoma from '../../haoma';
import Haomakongzhi from '../../haomakongzhi';
import AssetApplicationPrototype from '../../zichanshenqing';
import ApprovalPagePrototype from '../../zichanshenqingshenpi';
import AssetAdminApprovalPrototype from '../../zichanpeiji';
import UnifiedAssetApplySummary from '../../UnifiedAssetApplySummary';
import EmployeeAssetApplyPage from '../../employeeSelfService/AssetApplyPage';
import EmployeeAssetApprovalPage from '../../employeeSelfService/AssetApprovalPage';
import EmployeeAssetAllocationPage from '../../employeeSelfService/AssetAllocationPage';
import EmployeePurchaseSummaryPage from '../../employeeSelfService/PurchaseSummaryPage';
import EmployeeAssetClaimPage from '../../employeeSelfService/AssetClaimPage';
import EmployeeAssetClaimConfirmPage from '../../employeeSelfService/AssetClaimConfirmPage';

export const WORKSPACE_MENU_ITEMS = [
  { key: '工作台首页', label: '工作台首页', Page: PersonalWorkspace },
  { key: '号码管理', label: '号码管理', Page: Haoma },
  { key: '号码控制', label: '号码控制', Page: Haomakongzhi },
  { key: '新增资产申请', label: '新增资产申请', Page: AssetApplicationPrototype },
  { key: '资产申请审批', label: '资产申请审批', Page: ApprovalPagePrototype },
  { key: '资产申请配给', label: '资产申请配给', Page: AssetAdminApprovalPrototype },
  { key: '统一申请汇总-资产', label: '统一申请汇总-资产', Page: UnifiedAssetApplySummary },
  { key: '员工自助新版-资产申请', label: '员工自助新版-资产申请', Page: EmployeeAssetApplyPage },
  { key: '员工自助新版-业务审批', label: '员工自助新版-业务审批', Page: EmployeeAssetApprovalPage },
  { key: '员工自助新版-资产配给', label: '员工自助新版-资产配给', Page: EmployeeAssetAllocationPage },
  { key: '员工自助新版-汇总采购', label: '员工自助新版-汇总采购', Page: EmployeePurchaseSummaryPage },
  { key: '员工自助新版-资产领用', label: '员工自助新版-资产领用', Page: EmployeeAssetClaimPage },
  { key: '员工自助新版-领用确认', label: '员工自助新版-领用确认', Page: EmployeeAssetClaimConfirmPage },
];

export function getWorkspacePage(menuKey) {
  return WORKSPACE_MENU_ITEMS.find((item) => item.key === menuKey)?.Page || null;
}
