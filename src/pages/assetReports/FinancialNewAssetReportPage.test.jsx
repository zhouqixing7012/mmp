// CRA的Jest版本不解析这些已安装依赖的子路径导出，测试显式加载同一真实模块。
jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetReportsContent from './index';
import { getFinancialAssetCompanyOptions } from '../../services/financialNewAssetReportService';
import { ASSET_PLATE_OPTIONS } from '../../config/assetPlates';
import { ASSET_REPORT_MENU_ITEMS } from '../yewurules/config/menuConfig';
beforeEach(() => {
  // JSDOM未提供MessageChannel，沿用盘点报表测试的浏览器消息任务适配。
  window.MessageChannel = class {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = { postMessage: () => Promise.resolve().then(() => this.port1.onmessage?.()) };
    }
  };
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
test('资产报表菜单可进入新查询页，公司/板块在前且汇总在右上角，重置恢复数据', () => {
  expect(ASSET_REPORT_MENU_ITEMS).toContain('固定资产新增报表');
  render(<AssetReportsContent activeSubMenu="固定资产新增报表" />);
  expect(screen.getByRole('heading', { name: '固定资产新增报表' })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(15);
  expect(screen.getByText('114122602627')).toBeInTheDocument();
  expect(screen.getByText('11216122601019')).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader').slice(0, 2).map(cell => cell.textContent)).toEqual(['公司', '板块']);
  expect(document.querySelector('.ant-table-summary')).toBeNull();
  expect(screen.getByText('含税金额合计：').closest('.ant-card-extra')).not.toBeNull();
  expect(screen.getByRole('button', { name: /查\s*询/ }).querySelector('svg')).not.toBeNull();
  expect(screen.getByRole('button', { name: /重\s*置/ }).querySelector('svg')).not.toBeNull();
  expect(screen.getByPlaceholderText('开始日期')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('结束日期')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
  expect(screen.queryByText('共 2 条')).not.toBeInTheDocument();
  expect(screen.getByText('数量合计：')).toBeInTheDocument();
});
test('公司与板块均为多选下拉，引用指定共享数据源', async () => {
  render(<AssetReportsContent activeSubMenu="固定资产新增报表" />);
  const company = screen.getByRole('combobox', { name: '公司' });
  fireEvent.mouseDown(company);
  const options = getFinancialAssetCompanyOptions();
  fireEvent.click(await screen.findByText(options[0].label, { selector: '.ant-select-item-option-content' }));
  fireEvent.click(await screen.findByText(options[1].label, { selector: '.ant-select-item-option-content' }));
  expect(company.closest('.ant-select')).toHaveClass('ant-select-multiple');
  expect(company.closest('.ant-select').querySelectorAll('.ant-select-selection-item')).toHaveLength(2);
  const plate = screen.getByRole('combobox', { name: '板块' });
  fireEvent.mouseDown(plate);
  fireEvent.click(await screen.findByText(ASSET_PLATE_OPTIONS[0], { selector: '.ant-select-item-option-content' }));
  fireEvent.click(await screen.findByText(ASSET_PLATE_OPTIONS[1], { selector: '.ant-select-item-option-content' }));
  expect(plate.closest('.ant-select')).toHaveClass('ant-select-multiple');
  expect(plate.closest('.ant-select').querySelectorAll('.ant-select-selection-item')).toHaveLength(2);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
