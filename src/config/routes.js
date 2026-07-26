import AccountingScrapEdit from '../pages/AccountingScrapEdit';
import ApprovalPage from '../pages/ApprovalPage';
import ScrapInternalReview from '../pages/ScrapInternalReview';
import ScrapProcurement1 from '../pages/ScrapProcurement1';
import ScrapProcurement2 from '../pages/ScrapProcurement2';
import ScrapProcurement3 from '../pages/ScrapProcurement3';
import ScrapProcurement4 from '../pages/ScrapProcurement4';
import AssetDashboard from '../pages/AssetDashboard';
import AssetDashboardMobile from '../pages/AssetDashboardMobile';
import PurchaseOrderEdit from '../pages/PurchaseOrderEdit';
import AssetManagement from '../pages/AssetManagement';
import AssetMaintenanceList from '../pages/AssetMaintenanceList';
import AssetMaintenanceListEmployee from '../pages/AssetMaintenanceListEmployee';
import InfoChangeEdit from '../pages/InfoChangeEdit';
import PositionChangeApproval from '../pages/PositionChangeApproval';
import SerialNumberEdit from '../pages/SerialNumberEdit';
import SerialNumberApproval from '../pages/SerialNumberApproval';
import DomainCertList from '../pages/DomainCertList';
import PCSDashboard from '../pages/PCSDashboard';
import PCSDashboard2 from '../pages/PCSDashboard2';
import MainSpareEdit from '../pages/MainSpareEdit';
import MainSparePartEdit from '../pages/MainSparePartEdit';
import MainSpareApproval from '../pages/MainSpareApproval';
import ResponsiblePersonEdit from '../pages/ResponsiblePersonEdit';
import ResponsiblePersonReceiverApproval from '../pages/ResponsiblePersonReceiverApproval';
import ResponsiblePersonPhysicalApproval from '../pages/ResponsiblePersonPhysicalApproval';
import ScrapApplicationEdit from '../pages/ScrapApplicationEdit';
import yewurules from '../pages/yewurules';
import xitongrules from '../pages/xitongrules';
import applylist from '../pages/applylist';
import zichanshenqing from '../pages/zichanshenqing';
import zichanshenqingshenpi from '../pages/zichanshenqingshenpi';
import zichanpeiji from '../pages/zichanpeiji';
import UnifiedAssetApplySummary from '../pages/UnifiedAssetApplySummary';
import FrontDeskAssetClaim from '../pages/FrontDeskAssetClaim';
import EmployeeAssetClaimConfirm from '../pages/EmployeeAssetClaimConfirm';

export const routeGroups = [
  { key: 'scrap', name: '报废管理' },
  { key: 'serverRoomAsset', name: '机房资产' },
  { key: 'responsiblePerson', name: '责任人变更' },
  { key: 'pcs', name: '域名证书' },
  { key: 'workspace', name: '个人工作台' },
  { key: 'config', name: '后台配置' },
];

const routes = [
  // 报废管理
  { path: '/', name: '账面报废申请单', Page: AccountingScrapEdit, nav: true, group: 'scrap' },
  { path: '/BaofeiShenqing', name: '报废申请单编辑', Page: ScrapApplicationEdit, nav: true, group: 'scrap' },
  { path: '/approval', name: '账面报废审批', Page: ApprovalPage, nav: true, group: 'scrap' },
  { path: '/BaofeiNeishen', name: '报废申请单——内审', Page: ScrapInternalReview, nav: true, group: 'scrap' },
  { path: '/BaofeiCaigou1', name: '报废申请单——采购（1）', Page: ScrapProcurement1, nav: true, group: 'scrap' },
  { path: '/BaofeiCaigou2', name: '报废申请单——采购（2）', Page: ScrapProcurement2, nav: true, group: 'scrap' },
  { path: '/BaofeiCaigou3', name: '报废申请单——采购（3）', Page: ScrapProcurement3, nav: true, group: 'scrap' },
  { path: '/BaofeiCaigou4', name: '报废申请单——采购（4）', Page: ScrapProcurement4, nav: true, group: 'scrap' },

  // 机房资产
  { path: '/Dashboard', name: '机房资产大盘', Page: AssetDashboard, nav: true, group: 'serverRoomAsset' },
  { path: '/Dashboardapp', name: '机房资产大盘移动端', Page: AssetDashboardMobile, nav: true, group: 'serverRoomAsset' },
  { path: '/Caigoudingdan', name: '采购订单编辑页', Page: PurchaseOrderEdit, nav: true, group: 'serverRoomAsset' },
  { path: '/Jifang', name: '机房资产管理', Page: AssetManagement, nav: true, group: 'serverRoomAsset' },
  { path: '/Jifanglist', name: '机房资产维护查询列表', Page: AssetMaintenanceList, nav: true, group: 'serverRoomAsset' },
  { path: '/Jifanglistone', name: '机房资产维护查询列表（员工端）', Page: AssetMaintenanceListEmployee, nav: true, group: 'serverRoomAsset' },
  { path: '/Weizhi', name: '位置变更编辑页', Page: InfoChangeEdit, nav: true, group: 'serverRoomAsset' },
  { path: '/Positionshenpi', name: '位置变更审批页', Page: PositionChangeApproval, nav: true, group: 'serverRoomAsset' },
  { path: '/SN', name: '序列号变更编辑页', Page: SerialNumberEdit, nav: true, group: 'serverRoomAsset' },
  { path: '/SNshenpi', name: '序列号变更审批页', Page: SerialNumberApproval, nav: true, group: 'serverRoomAsset' },
  { path: '/Connectzhu', name: '主备维护主编辑页', Page: MainSpareEdit, nav: true, group: 'serverRoomAsset' },
  { path: '/Connectbei', name: '主备维护备件编辑页', Page: MainSparePartEdit, nav: true, group: 'serverRoomAsset' },
  { path: '/Connectshenpi', name: '主备维护审批页', Page: MainSpareApproval, nav: true, group: 'serverRoomAsset' },

  // 责任人变更
  { path: '/People', name: '责任人变更编辑页', Page: ResponsiblePersonEdit, nav: true, group: 'responsiblePerson' },
  { path: '/Peoplejieshou', name: '责任人变更接收人确认——审批', Page: ResponsiblePersonReceiverApproval, nav: true, group: 'responsiblePerson' },
  { path: '/Peopleshiwu', name: '责任人变更实物确认——审批', Page: ResponsiblePersonPhysicalApproval, nav: true, group: 'responsiblePerson' },

  // 域名证书
  { path: '/PCS', name: '域名&证书查询列表', Page: DomainCertList, nav: true, group: 'pcs' },
  { path: '/PCSDASHBOARD', name: '域名&证书看板', Page: PCSDashboard, nav: true, group: 'pcs' },
  { path: '/PCSDASHBOARD(2)', name: '域名&证书看板（2）', Page: PCSDashboard2, nav: true, group: 'pcs' },

  // 个人工作台
  { path: '/applylist', name: '申请单列表', Page: applylist, nav: true, group: 'workspace' },
  { path: '/zichanshenqing', name: '新增资产申请', Page: zichanshenqing, nav: true, group: 'workspace' },
  { path: '/zichanshenqingshenpi', name: '资产申请审批', Page: zichanshenqingshenpi, nav: true, group: 'workspace' },
  { path: '/zichanpeiji', name: '资产申请配给', Page: zichanpeiji, nav: true, group: 'workspace' },
  { path: '/FrontDeskAssetClaim', name: 'ES前台领用', Page: FrontDeskAssetClaim, nav: true, group: 'workspace' },
  { path: '/EmployeeAssetClaimConfirm', name: '员工领用确认', Page: EmployeeAssetClaimConfirm, nav: true, group: 'workspace' },
  { path: '/UnifiedAssetApplySummary', name: '统一申请汇总-资产', Page: UnifiedAssetApplySummary, nav: false, group: 'workspace' },

  // 后台配置
  { path: '/yewurules', name: '后台基础配置', Page: yewurules, nav: true, group: 'config' },
  { path: '/xitongrules', name: '组织与用户管理', Page: xitongrules, nav: false, group: 'config' },
];

export const navRoutes = routes.filter((route) => route.nav);

export const navGroups = routeGroups
  .map((group) => ({
    ...group,
    routes: navRoutes.filter((route) => route.group === group.key),
  }))
  .filter((group) => group.routes.length > 0);

export default routes;
