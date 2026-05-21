import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; //导航栏
import ScrapForm from './pages/账面报废申请单——编辑页';  //账面报废——编辑页
import ApprovalPage from './pages/账面报废申请单——审批';  //账面报废——审批页
import BaofeiNeishen from './pages/报废申请单——内审';
import BaofeiCaigou2 from './pages/报废申请单——采购（2）';
import BaofeiCaigou3 from './pages/报废申请单——采购（3）';
import BaofeiCaigou4 from './pages/报废申请单——采购（4）';
import Dashboard from './pages/机房资产看板';
import Dashboardapp from './pages/机房资产看板app';
import Caigoudingdan from './pages/采购订单编辑页';
import BaofeiCaigou1 from './pages/报废申请单——采购（1）';
import Jifang from './pages/机房资产管理';
import Jifanglist from './pages/机房资产维护查询列表';
import Jifanglistone from './pages/机房资产维护查询列表（员工端）';
import Weizhi from './pages/信息变更编辑页';
import PCS from './pages/域名&证书查询列表';
import SN from './pages/序列号变更编辑页';
import PCSDASHBOARD from './pages/PCS看板';
import PCSDASHBOARD2 from './pages/PCS看板 副本';
import Connectzhu from './pages/主备维护主编辑页';
import Connectbei from './pages/主备维护备件编辑页';
import Connectshenpi from './pages/主备维护审批页';
import Positionshenpi from './pages/位置变更审批页';
import SNshenpi from './pages/序列号变更审批页';
import People from './pages/责任人变更编辑页';
import Peoplejieshou from './pages/责任人变更接收人确认——审批';
import Peopleshiwu from './pages/责任人变更实物确认——审批';
// import Peopleshiws from './pages/责任人变更认——审批';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ScrapForm />} />
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/BaofeiNeishen" element={<BaofeiNeishen />} />
        <Route path="/BaofeiCaigou2" element={<BaofeiCaigou2 />} />
        <Route path="/BaofeiCaigou3" element={<BaofeiCaigou3 />} />
        <Route path="/BaofeiCaigou4" element={<BaofeiCaigou4 />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Dashboardapp" element={<Dashboardapp />} />
        <Route path="/Caigoudingdan" element={<Caigoudingdan />} />
        <Route path="/BaofeiCaigou1" element={<BaofeiCaigou1 />} />
        <Route path="/Jifang" element={<Jifang />} />
        <Route path="/Jifanglist" element={<Jifanglist />} />
        <Route path="/Jifanglistone" element={<Jifanglistone />} />
        <Route path="/Weizhi" element={<Weizhi />} />
        <Route path="/SN" element={<SN />} />
        <Route path="/PCS" element={<PCS />} />
        <Route path="/PCSDASHBOARD" element={<PCSDASHBOARD />} />
        <Route path="/PCSDASHBOARD(2)" element={<PCSDASHBOARD2 />} />
        <Route path="/Connectzhu" element={<Connectzhu />} />
        <Route path="/Connectbei" element={<Connectbei />} />
        <Route path="/Connectshenpi" element={<Connectshenpi />} />
        <Route path="/Positionshenpi" element={<Positionshenpi />} />
        <Route path="/SNshenpi" element={<SNshenpi />} />
        <Route path="/People" element={<People />} />
        <Route path="/Peoplejieshou" element={<Peoplejieshou />} />
        <Route path="/Peopleshiwu" element={<Peopleshiwu />} />
        {/* <Route path="/Peopleshiws" element={<Peopleshiws />} /> */}
      </Routes>
    </BrowserRouter>
  );
}