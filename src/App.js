import React, { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PageMotionBoundary from './components/PageMotionBoundary';
import routes from './config/routes';
import erpTheme from './config/erpTheme';
import PrototypeAnnotationLayer from './prototype-annotations/PrototypeAnnotationLayer';

// 静态Modal/Message/Notification同样使用主题，不依赖业务页自行传色值。
ConfigProvider.config({
  holderRender: children => <ConfigProvider locale={zhCN} theme={erpTheme}>{children}</ConfigProvider>,
});

export function getRouterBasename(publicUrl = process.env.PUBLIC_URL) {
  if (!publicUrl || publicUrl === '.') return undefined;
  return publicUrl.replace(/\/+$/, '');
}

function AppRoutes() {
  const location = useLocation();
  const [signedOut, setSignedOut] = useState(() => sessionStorage.getItem('mmp-demo-signed-out') === '1');
  useEffect(() => {
    const update = () => setSignedOut(sessionStorage.getItem('mmp-demo-signed-out') === '1');
    window.addEventListener('mmp-demo-session-change', update);
    return () => window.removeEventListener('mmp-demo-session-change', update);
  }, []);
  if (signedOut) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <h1 className="text-xl font-semibold">搜狐资产管理平台</h1><p>已退出登录</p>
    <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => { sessionStorage.removeItem('mmp-demo-signed-out'); setSignedOut(false); }}>重新进入演示</button>
  </main>;
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

function NavbarGate() {
  const location = useLocation();
  if (['/inventory/move/mobile', '/asset-inventory/mobile'].includes(location.pathname)) return null;
  return <Navbar />;
}

export default function App() {
  const routerBasename = getRouterBasename();

  return (
    <ConfigProvider locale={zhCN} theme={erpTheme}>
      <BrowserRouter basename={routerBasename}>
        <NavbarGate />
        <AppRoutes />
        <PrototypeAnnotationLayer />
      </BrowserRouter>
    </ConfigProvider>
  );
}
