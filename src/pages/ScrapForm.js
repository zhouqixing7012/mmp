import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrapForm from './pages/ScrapForm';
import ApprovalPage from './pages/ApprovalPage';
// import AssetList from './pages/AssetList';  // 等下会创建这个文件

export default function ScrapForm() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ScrapForm />} />
        <Route path="/approval" element={<ApprovalPage />} />
        {/* <Route path="/assets" element={<AssetList />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

