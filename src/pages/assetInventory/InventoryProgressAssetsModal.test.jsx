import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryProgressAssetsModal from './InventoryProgressAssetsModal';
jest.mock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }));
jest.mock('antd', () => ({ Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>, Input: () => null, Modal: ({ children }) => <div>{children}</div>, Space: ({ children }) => <div>{children}</div>, Table: () => null }));
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: () => null, QueryItem: () => null }));
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, AssetValueSelect: () => null, OwnerLevelSelect: () => null, formatAssetCategory: () => '', matchesAssetCategory: () => true, matchesQuerySelection: () => true }));
jest.mock('../../components/StatusTag', () => () => null);
test('父查询为空时资产下钻导出回退显式权限母集，非空仍只导出匹配资产', () => {
 const permitted = [{ assetTag: '本范围A' }, { assetTag: '本范围B' }];
 const view = render(<InventoryProgressAssetsModal title="未盘资产" assets={[]} exportAssets={permitted} projectNo="P" />);
 fireEvent.click(screen.getByRole('button', { name: '导出' }));
 expect(XLSX.utils.sheet_to_json(XLSX.writeFile.mock.calls.at(-1)[0].Sheets['资产清单']).map(row => row['资产标签号'])).toEqual(['本范围A', '本范围B']);
 view.rerender(<InventoryProgressAssetsModal title="未盘资产" assets={[permitted[1]]} exportAssets={permitted} projectNo="P" />);
 fireEvent.click(screen.getByRole('button', { name: '导出' }));
 expect(XLSX.utils.sheet_to_json(XLSX.writeFile.mock.calls.at(-1)[0].Sheets['资产清单']).map(row => row['资产标签号'])).toEqual(['本范围B']);
});
