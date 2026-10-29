import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { canAccessInventoryReport, INVENTORY_REPORT_USERS, inventoryMenuItemsForOperator } from './inventoryReportAccess';
import { allowedProjectTypes } from './inventoryCreatorPermissions';
import { getInventoryOperator, INVENTORY_OPERATOR_STORAGE_KEY, setInventoryOperator } from './useInventoryOperator';
import AssetInventoryReportPage from './AssetInventoryReportPage';
import { AssetInventoryContent } from './index';
import AdminSidebar from '../yewurules/components/AdminSidebar';
import { getInventoryReport } from '../../services/inventoryReportService';
import { writeDemoData } from '../../services/demoStorage';

jest.mock('react-router-dom', () => ({ useLocation: () => ({pathname:'/yewurules',search:'',state:null,key:'test'}), useNavigate: () => jest.fn() }), {virtual:true});
jest.mock('../../services/inventoryReportService', () => ({ getInventoryReport: jest.fn(() => null), getInventoryReportProjects: jest.fn(() => []), exportInventoryReport: jest.fn() }));
jest.mock('./InventoryReportTables', () => ({ AnalysisTables: () => null, DetailTable: () => null }));
jest.mock('./InventoryReportCharts', () => () => null);
jest.mock('./AssetInventoryProjectPageV3', () => () => <div>现有盘点项目</div>);
jest.mock('./AssetInventoryFieldPolicy', () => ({ children }) => <>{children}</>);
jest.mock('../yewurules/components/WorkspaceMenu', () => () => null);
jest.mock('antd', () => ({
  Button: ({children,onClick}) => <button onClick={onClick}>{children}</button>,
  Card: ({children}) => <section>{children}</section>, Empty: ({description}) => <p>{description}</p>,
  Result: ({title,subTitle}) => <div role="alert">{title}{subTitle}</div>,
  Select: () => <select aria-label="盘点年份"/>, Space: ({children}) => <div>{children}</div>, Tabs: () => null,
  Typography: {Title: ({children}) => <h1>{children}</h1>,Text: ({children}) => <span>{children}</span>},
  message: {success:jest.fn(),error:jest.fn()},
}));

beforeEach(() => { window.localStorage.clear(); jest.clearAllMocks(); require('../../services/inventoryReportService').getInventoryReportProjects.mockReturnValue([]); });

test.each(INVENTORY_REPORT_USERS)('仅明确授权身份$name可直接进入盘点报表', person => {
  setInventoryOperator(person.value);
  render(<AssetInventoryReportPage/>);
  expect(screen.queryByRole('heading',{name:'盘点报表'})).toBeNull();
  expect(screen.getByRole('combobox',{name:'盘点年份'})).toBeInTheDocument();
  expect(getInventoryReport).toHaveBeenCalled();
});

test.each(['冯丽婷','徐博'])('未授权财务%s直接请求报表内容仍被阻止且不读取报表数据', operator => {
  setInventoryOperator(operator);
  render(<AssetInventoryContent activeSubMenu="盘点报表"/>);
  expect(screen.getByRole('alert')).toHaveTextContent('无权访问盘点报表');
  expect(screen.queryByRole('heading',{name:'盘点报表'})).toBeNull();
  expect(getInventoryReport).not.toHaveBeenCalled();
});

test('既有演示身份切换同时更新菜单及已打开报表，刷新继续使用同一身份', () => {
  const view = render(<><AdminSidebar activeMenu="资产盘点" activeSubMenu="盘点报表"/><AssetInventoryReportPage/></>);
  expect(screen.getAllByText('盘点报表')).toHaveLength(2);
  act(() => setInventoryOperator('冯丽婷'));
  expect(screen.queryByText('盘点报表')).toBeNull();
  expect(screen.getByRole('alert')).toHaveTextContent('无权访问盘点报表');
  expect(screen.getByText('盘点项目')).toBeInTheDocument();
  expect(screen.getByText('资产明细报表')).toBeInTheDocument();
  expect(getInventoryOperator()).toBe('冯丽婷');
  act(() => setInventoryOperator('穆晓丹'));
  expect(screen.getAllByText('盘点报表')).toHaveLength(2);
  view.unmount();
  render(<AssetInventoryReportPage/>);
  expect(screen.queryByRole('heading',{name:'盘点报表'})).toBeNull();
  expect(screen.getByRole('combobox',{name:'盘点年份'})).toBeInTheDocument();
  expect(getInventoryOperator()).toBe('穆晓丹');
});

test('只过滤盘点报表，其他菜单及原创建权限不变，未知工号不能借同名获得权限', () => {
  expect(inventoryMenuItemsForOperator(['盘点项目','盘点报表','其他'], '徐博')).toEqual(['盘点项目','其他']);
  expect(allowedProjectTypes('115720-吕静')).toEqual([]);
  expect(allowedProjectTypes('穆晓丹')).toEqual([]);
  expect(allowedProjectTypes('213852-孙志强')).toEqual(['初盘','抽盘']);
  expect(canAccessInventoryReport('999999-孙志强')).toBe(false);
  expect(canAccessInventoryReport('admin')).toBe(false);
  expect(INVENTORY_REPORT_USERS.find(person=>person.name==='穆晓丹').employeeNo).toBe('150690');
});

test('持久身份未知时直接访问不回退成有权身份', () => {
  writeDemoData(INVENTORY_OPERATOR_STORAGE_KEY, '未知人员');
  render(<AssetInventoryReportPage/>);
  expect(screen.getByRole('alert')).toHaveTextContent('无权访问盘点报表');
  expect(getInventoryReport).not.toHaveBeenCalled();
});
