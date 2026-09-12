import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import routes from './config/routes';
import PrototypeAnnotationLayer from './prototype-annotations/PrototypeAnnotationLayer';

function AppRoutes() {
  const location = useLocation();

  return (
    <div key={location.key} className="mmp-route-motion">
      <Routes location={location}>
        {routes.map((route) => {
          const Component = route.Page;
          return Component ? <Route key={route.path} path={route.path} element={<Component />} /> : null;
        })}
      </Routes>
    </div>
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
