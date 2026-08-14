import PersonalWorkspace from '../../gerengerzuotai';
import MobileWorkspacePage from '../../mobileWorkspace/MobileWorkspacePageV2';
import Haoma from '../../haoma';
import Haomakongzhi from '../../haomakongzhi';
import UnifiedAssetApplySummary from '../../UnifiedAssetApplySummary';
import FrontDeskAssetClaim from '../../FrontDeskAssetClaim';
import EmployeeAssetClaimConfirm from '../../EmployeeAssetClaimConfirm';
import EmployeeAssetApplyPage from '../../employeeSelfService/AssetApplyPage';
import EmployeeAssetApprovalPage from '../../employeeSelfService/AssetApprovalPage';
import EmployeeAssetAllocationPage from '../../employeeSelfService/AssetAllocationPage';
import NewEmployeeAssetClaimPage from '../../employeeSelfService/NewEmployeeAssetClaimPage';
import NewEmployeeAssetClaimConfirmPage from '../../employeeSelfService/NewEmployeeAssetClaimConfirmPage';
import ContractNumberAllocationPage from '../../contractNumber/ContractNumberAllocationPage';
import ContractNumberSupervisorApprovalPage from '../../contractNumber/ContractNumberSupervisorApprovalPage';
import ContractNumberWarehousePage from '../../contractNumber/ContractNumberWarehousePage';
import ContractNumberReceiptConfirmPage from '../../contractNumber/ContractNumberReceiptConfirmPage';
import {
  ConsumableMisApprovalPage,
  ConsumableLeaderApprovalPage,
  ConsumableSummaryApprovalPage,
} from '../../consumableWorkflow/refinedPages';
import ConsumableAllocationPage from '../../consumableWorkflow/ConsumableAllocationPage';
import ConsumableClaimPage from '../../consumableWorkflow/ConsumableClaimPage';
import ConsumableClaimConfirmPage from '../../consumableWorkflow/ConsumableClaimConfirmPage';
import ConsumableSummaryPage from '../../consumableWorkflow/ConsumableSummaryPage';
import {
  ConsumableClaimMaterialCodePage,
  ConsumableClaimAssetTagPage,
} from '../../consumableWorkflow/ConsumableClaimAlternatives';
import {
  BorrowingApplyPage,
  BorrowingAllocationPage,
  BorrowingApprovalPage,
  BorrowingIssuePage,
  BorrowingConfirmPage,
} from '../../assetBorrowing';
import {
  AssetTransferDetailPage,
  TransferOutManagerApprovalPage,
  ReceiverManagerApprovalPage,
} from '../../assetTransfer/TransferApprovalPages';
import {
  ReplacementApplyPage,
  ReplacementMisPage,
  ReplacementHandlingPage,
  ReplacementConfirmPage,
} from '../../assetReplacement';
import {
  AssetReturnApplyPage,
  AssetReturnApprovalPage,
  LeaderAssetReturnApprovalPage,
  AssetReturnHandlingPage,
  AssetReturnConfirmPage,
  ContractReturnApplyPage,
  ContractReturnHandlingPage,
  ContractReturnConfirmPage,
} from '../../assetReturn';

export const WORKSPACE_MENU_ITEMS = [
  { key: '工作台首页', label: '工作台首页', Page: PersonalWorkspace },
  { key: '移动端工作台', label: '移动端工作台', Page: MobileWorkspacePage },
  { key: '合约号码申请', label: '合约号码申请', Page: Haoma },
  { key: '号码控制', label: '号码控制', Page: Haomakongzhi },
  { key: '合约号码ES配给', label: '合约号码ES配给', Page: ContractNumberAllocationPage },
  { key: '合约号码配给主管审批', label: '合约号码配给主管审批', Page: ContractNumberSupervisorApprovalPage },
  { key: '合约号码库管员待办', label: '合约号码库管员待办', Page: ContractNumberWarehousePage },
  { key: '员工合约号码领取确认', label: '员工合约号码领取确认', Page: ContractNumberReceiptConfirmPage },
  { key: '物资申请', label: '物资申请', Page: EmployeeAssetApplyPage },
  { key: '业务审批', label: '业务审批', Page: EmployeeAssetApprovalPage },
  { key: '资产配给', label: '资产配给', Page: EmployeeAssetAllocationPage },
  { key: '统一申请汇总-资产', label: '统一申请汇总-资产', Page: UnifiedAssetApplySummary },
  { key: 'ES前台领用', label: 'ES前台领用', Page: FrontDeskAssetClaim },
  { key: '新员工领用单', label: '新员工领用单', Page: NewEmployeeAssetClaimPage },
  { key: '新员工领用员工确认', label: '新员工领用员工确认', Page: NewEmployeeAssetClaimConfirmPage },
  { key: '员工领用确认', label: '员工领用确认', Page: EmployeeAssetClaimConfirm },
  { key: '耗材MIS鉴定', label: '耗材MIS鉴定', Page: ConsumableMisApprovalPage },
  { key: '耗材审批', label: '耗材审批', Page: ConsumableLeaderApprovalPage },
  { key: '耗材配给', label: '耗材配给', Page: ConsumableAllocationPage },
  { key: '耗材领用', label: '耗材领用', Page: ConsumableClaimPage },
  { key: '耗材领用方案一', label: '耗材领用方案一', Page: ConsumableClaimMaterialCodePage },
  { key: '耗材领用方案二', label: '耗材领用方案二', Page: ConsumableClaimAssetTagPage },
  { key: '员工耗材领用确认', label: '员工耗材领用确认', Page: ConsumableClaimConfirmPage },
  { key: '耗材汇总', label: '耗材汇总', Page: ConsumableSummaryPage },
  { key: '耗材汇总审批', label: '耗材汇总审批', Page: ConsumableSummaryApprovalPage },
  { key: '资产借用', label: '资产借用', Page: BorrowingApplyPage },
  { key: '借用配给', label: '借用配给', Page: BorrowingAllocationPage },
  { key: '借用审批', label: '借用审批', Page: BorrowingApprovalPage },
  { key: '借用发放', label: '借用发放', Page: BorrowingIssuePage },
  { key: '员工借用确认', label: '员工借用确认', Page: BorrowingConfirmPage },
  { key: '资产转移详情', label: '资产转移详情', Page: AssetTransferDetailPage },
  { key: '转出部门经理审批', label: '转出部门经理审批', Page: TransferOutManagerApprovalPage },
  { key: '接收部门经理审批', label: '接收部门经理审批', Page: ReceiverManagerApprovalPage },
  { key: '资产更换申请', label: '资产更换申请', Page: ReplacementApplyPage },
  { key: 'MIS鉴定', label: 'MIS鉴定', Page: ReplacementMisPage },
  { key: '资产更换办理', label: '资产更换办理', Page: ReplacementHandlingPage },
  { key: '员工资产确认', label: '员工资产确认', Page: ReplacementConfirmPage },
  { key: '资产退库', label: '资产退库', Page: AssetReturnApplyPage },
  { key: '退库审批', label: '退库审批', Page: AssetReturnApprovalPage },
  { key: '领导退库审批', label: '领导退库审批', Page: LeaderAssetReturnApprovalPage },
  { key: '资产退库办理', label: '资产退库办理', Page: AssetReturnHandlingPage },
  { key: '员工退库确认', label: '员工退库确认', Page: AssetReturnConfirmPage },
  { key: '合约号码退库', label: '合约号码退库', Page: ContractReturnApplyPage },
  { key: '合约号码退库办理', label: '合约号码退库办理', Page: ContractReturnHandlingPage },
  { key: '员工合约号码退库确认', label: '员工合约号码退库确认', Page: ContractReturnConfirmPage },
];

export function getWorkspacePage(menuKey) {
  return WORKSPACE_MENU_ITEMS.find((item) => item.key === menuKey)?.Page || null;
}
