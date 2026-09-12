import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PageMotionBoundary from './components/PageMotionBoundary';
import routes from './config/routes';
import PrototypeAnnotationLayer from './prototype-annotations/PrototypeAnnotationLayer';

function AppRoutes() {
  const location = useLocation();
  const isAdminWorkspace = location.pathname === '/yewurules';

  return (
    <PageMotionBoundary key={location.key} disabled={isAdminWorkspace}>
      <Routes location={location}>
        {routes.map((route) => {
          const Component = route.Page;
          return Component ? <Route key={route.path} path={route.path} element={<Component />} /> : null;
        })}
      </Routes>
    </PageMotionBoundary>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
        <PrototypeAnnotationLayer />
      </BrowserRouter>
    </ConfigProvider>
  );
}
