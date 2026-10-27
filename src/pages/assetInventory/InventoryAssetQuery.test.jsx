import React from 'react';
import { render, screen } from '@testing-library/react';
import InventoryAssetQuery from './InventoryAssetQuery';
import { EMPTY_INVENTORY_ASSET_QUERY } from './inventoryAssetQuery';
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, QueryItem: ({ label, children }) => <label data-testid="condition">{label}{children}</label> }));
jest.mock('../../components/AssetQueryControls', () => ({ AssetCategorySelect: () => null, AssetPersonSelect: () => null, AssetValueSelect: () => null, OwnerLevelSelect: () => null }));
jest.mock('antd', () => ({ Input: () => null, Select: () => null, DatePicker: { RangePicker: () => null } }));
test.each([false, true])('启动标志为%s时均展示完整17项，包括盘点范围', started => {
  render(<InventoryAssetQuery rows={[]} filters={EMPTY_INVENTORY_ASSET_QUERY} onChange={jest.fn()} rangeOptions={['员工']} started={started} />);
  expect(screen.getAllByTestId('condition')).toHaveLength(17);
  ['盘点范围', '序列号', '盘点监督人', '盘点方式', '启用日期'].forEach(label => expect(screen.getByText(label)).toBeInTheDocument());
});
