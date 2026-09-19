import React from 'react';

jest.mock('antd', () => ({ ConfigProvider: ({ children }) => children }));
jest.mock('antd/locale/zh_CN', () => ({}));
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  useLocation: () => ({ pathname: '/' }),
}), { virtual: true });
jest.mock('./components/Navbar', () => () => null);
jest.mock('./components/PageMotionBoundary', () => ({ children }) => children);
jest.mock('./config/routes', () => []);
jest.mock('./prototype-annotations/PrototypeAnnotationLayer', () => () => null);

import { getRouterBasename } from './App';

test('uses the deployed public path as the router basename', () => {
  expect(getRouterBasename('/mmp/feature-asset-inventory/')).toBe('/mmp/feature-asset-inventory');
  expect(getRouterBasename('.')).toBeUndefined();
});
