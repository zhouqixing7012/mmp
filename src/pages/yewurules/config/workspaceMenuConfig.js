import PersonalWorkspace from '../../gerengerzuotai';
import Haoma from '../../haoma';
import Haomakongzhi from '../../haomakongzhi';
import UnifiedAssetApplySummary from '../../UnifiedAssetApplySummary';
import FrontDeskAssetClaim from '../../FrontDeskAssetClaim';
import EmployeeAssetClaimConfirm from '../../EmployeeAssetClaimConfirm';
import EmployeeAssetApplyPage from '../../employeeSelfService/AssetApplyPage';
import EmployeeAssetApprovalPage from '../../employeeSelfService/AssetApprovalPage';
import EmployeeAssetAllocationPage from '../../employeeSelfService/AssetAllocationPage';

export const WORKSPACE_MENU_ITEMS = [
  { key: '工作台首页', label: '工作台首页', Page: PersonalWorkspace },
  { key: '号码管理', label: '号码管理', Page: Haoma },
  { key: '号码控制', label: '号码控制', Page: Haomakongzhi },
  { key: '资产申请', label: '资产申请', Page: EmployeeAssetApplyPage },
  { key: '业务审批', label: '业务审批', Page: EmployeeAssetApprovalPage },
  { key: '资产配给', label: '资产配给', Page: EmployeeAssetAllocationPage },
  { key: '统一申请汇总-资产', label: '统一申请汇总-资产', Page: UnifiedAssetApplySummary },
  { key: 'ES前台领用', label: 'ES前台领用', Page: FrontDeskAssetClaim },
  { key: '员工领用确认', label: '员工领用确认', Page: EmployeeAssetClaimConfirm },
];

export function getWorkspacePage(menuKey) {
  return WORKSPACE_MENU_ITEMS.find((item) => item.key === menuKey)?.Page || null;
}
