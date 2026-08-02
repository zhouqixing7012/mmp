import PersonalWorkspace from '../../gerengerzuotai';
import Haoma from '../../haoma';
import Haomakongzhi from '../../haomakongzhi';
import UnifiedAssetApplySummary from '../../UnifiedAssetApplySummary';
import FrontDeskAssetClaim from '../../FrontDeskAssetClaim';
import EmployeeAssetClaimConfirm from '../../EmployeeAssetClaimConfirm';
import EmployeeAssetApplyPage from '../../employeeSelfService/AssetApplyPage';
import EmployeeAssetApprovalPage from '../../employeeSelfService/AssetApprovalPage';
import EmployeeAssetAllocationPage from '../../employeeSelfService/AssetAllocationPage';
import {
  BorrowingApplyPage,
  BorrowingAllocationPage,
  BorrowingApprovalPage,
  BorrowingIssuePage,
  BorrowingConfirmPage,
} from '../../assetBorrowing';
import {
  ReplacementAssetsPage,
  ReplacementApplyPage,
  MyReplacementApplicationsPage,
  ReplacementMisPage,
  ReplacementHandlingPage,
  ReplacementConfirmPage,
} from '../../assetReplacement';

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
  { key: '资产借用', label: '资产借用', Page: BorrowingApplyPage },
  { key: '借用配给', label: '借用配给', Page: BorrowingAllocationPage },
  { key: '借用审批', label: '借用审批', Page: BorrowingApprovalPage },
  { key: '借用发放', label: '借用发放', Page: BorrowingIssuePage },
  { key: '员工借用确认', label: '员工借用确认', Page: BorrowingConfirmPage },
  { key: '我的资产', label: '我的资产', Page: ReplacementAssetsPage },
  { key: '资产更换申请', label: '资产更换申请', Page: ReplacementApplyPage },
  { key: '我的资产更换申请', label: '我的资产更换申请', Page: MyReplacementApplicationsPage },
  { key: 'MIS鉴定', label: 'MIS鉴定', Page: ReplacementMisPage },
  { key: '资产更换办理', label: '资产更换办理', Page: ReplacementHandlingPage },
  { key: '员工资产确认', label: '员工资产确认', Page: ReplacementConfirmPage },
];

export function getWorkspacePage(menuKey) {
  return WORKSPACE_MENU_ITEMS.find((item) => item.key === menuKey)?.Page || null;
}
