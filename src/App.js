import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import routes from './config/routes';
import PrototypeAnnotationLayer from './prototype-annotations/PrototypeAnnotationLayer';

// Page imports (using new English names after rename)
import ApprovalPage from './pages/ApprovalPage';
import ScrapInternalReview from './pages/ScrapInternalReview';
import ScrapProcurement1 from './pages/ScrapProcurement1';
import ScrapProcurement2 from './pages/ScrapProcurement2';
import ScrapProcurement3 from './pages/ScrapProcurement3';
import ScrapProcurement4 from './pages/ScrapProcurement4';
import AssetDashboard from './pages/AssetDashboard';
import AssetDashboardMobile from './pages/AssetDashboardMobile';
import PurchaseOrderEdit from './pages/PurchaseOrderEdit';
import AssetManagement from './pages/AssetManagement';
import AssetMaintenanceList from './pages/AssetMaintenanceList';
import AssetMaintenanceListEmployee from './pages/AssetMaintenanceListEmployee';
import InfoChangeEdit from './pages/InfoChangeEdit';
import PositionChangeApproval from './pages/PositionChangeApproval';
import SerialNumberEdit from './pages/SerialNumberEdit';
import SerialNumberApproval from './pages/SerialNumberApproval';
import DomainCertList from './pages/DomainCertList';
import PCSDashboard from './pages/PCSDashboard';
import PCSDashboard2 from './pages/PCSDashboard2';
import MainSpareEdit from './pages/MainSpareEdit';
import MainSparePartEdit from './pages/MainSparePartEdit';
import MainSpareApproval from './pages/MainSpareApproval';
import ResponsiblePersonEdit from './pages/ResponsiblePersonEdit';
import ResponsiblePersonReceiverApproval from './pages/ResponsiblePersonReceiverApproval';
import ResponsiblePersonPhysicalApproval from './pages/ResponsiblePersonPhysicalApproval';
import AccountingScrapEdit from './pages/AccountingScrapEdit';
import yewurules from './pages/yewurules';
import xitongrules from './pages/xitongrules';
import applylist from './pages/applylist';

const componentMap = {
  '/': AccountingScrapEdit,
  '/approval': ApprovalPage,
  '/BaofeiNeishen': ScrapInternalReview,
  '/BaofeiCaigou1': ScrapProcurement1,
  '/BaofeiCaigou2': ScrapProcurement2,
  '/BaofeiCaigou3': ScrapProcurement3,
  '/BaofeiCaigou4': ScrapProcurement4,
  '/Dashboard': AssetDashboard,
  '/Dashboardapp': AssetDashboardMobile,
  '/Caigoudingdan': PurchaseOrderEdit,
  '/Jifang': AssetManagement,
  '/Jifanglist': AssetMaintenanceList,
  '/Jifanglistone': AssetMaintenanceListEmployee,
  '/Weizhi': InfoChangeEdit,
  '/Positionshenpi': PositionChangeApproval,
  '/SN': SerialNumberEdit,
  '/SNshenpi': SerialNumberApproval,
  '/PCS': DomainCertList,
  '/PCSDASHBOARD': PCSDashboard,
  '/PCSDASHBOARD(2)': PCSDashboard2,
  '/Connectzhu': MainSpareEdit,
  '/Connectbei': MainSparePartEdit,
  '/Connectshenpi': MainSpareApproval,
  '/People': ResponsiblePersonEdit,
  '/Peoplejieshou': ResponsiblePersonReceiverApproval,
  '/Peopleshiwu': ResponsiblePersonPhysicalApproval,
  '/yewurules': yewurules,
  '/xitongrules': xitongrules,
  '/applylist': applylist,
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {routes.map((route) => {
          const Component = componentMap[route.path];
          return Component ? <Route key={route.path} path={route.path} element={<Component />} /> : null;
        })}
      </Routes>
      <PrototypeAnnotationLayer />
    </BrowserRouter>
  );
}
