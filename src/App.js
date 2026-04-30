import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; //导航栏
import ScrapForm from './pages/ScrapForm';  //账面报废——编辑页
import ApprovalPage from './pages/ApprovalPage';  //账面报废——审批页
import BaofeiNeishen from './pages/报废申请单——内审';
import BaofeiCaigou2 from './pages/报废申请单——采购（2）';
import BaofeiCaigou3 from './pages/报废申请单——采购（3）';
import BaofeiCaigou4 from './pages/报废申请单——采购（4）';

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
      </Routes>
    </BrowserRouter>
  );
}