import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
jest.mock('antd', () => {
  const Box = ({ children }) => <div>{children}</div>;
  return { Alert: Box, Card: Box, Space: Box, Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>, DatePicker: () => null, Input: () => null, Select: () => null,
    Typography: { Title: Box, Text: Box }, Modal: Object.assign(() => null, { confirm: jest.fn() }),
    Table: ({ dataSource, rowSelection }) => <button onClick={() => rowSelection.onChange([dataSource[0].key])}>选择计划</button>,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), error: jest.fn() }, null] } };
});
jest.mock('../../components/AssetQueryControls', () => ({ AssetValueSelect: () => null, matchesQuerySelection: () => true }));
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: () => null, QueryItem: () => null }));
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: () => null, DetailItem: () => null }));
jest.mock('../../components/StatusTag', () => () => null);
jest.mock('./InventoryLocationChangeFlow', () => () => null);
jest.mock('./InventoryReplayReview', () => () => null);
test('启动前发现未分配资产，要求默认补计划或手工创建，不直接启动已选计划', () => {
  const setRows = jest.fn(); const onGenerateRemainingDefault = jest.fn(); const onManualCreate = jest.fn();
  render(<AssetInventoryPlansV2Refined project={{ projectNo: 'P', projectType: '初盘' }} rows={[{ key: 'p1', planNo: 'P1', range: '员工', status: '草稿' }]} setRows={setRows} assetsForPlan={() => [{ quantity: 2, inventoryStatus: '未盘' }]} canManualCreate onGenerateRemainingDefault={onGenerateRemainingDefault} onManualCreate={onManualCreate} />);
  fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
  fireEvent.click(screen.getByRole('button', { name: '启动盘点计划' }));
  const options = Modal.confirm.mock.calls[0][0];
  options.onOk(); options.onCancel();
  expect(onGenerateRemainingDefault).toHaveBeenCalledTimes(1);
  expect(onManualCreate).toHaveBeenCalledTimes(1);
  expect(setRows).not.toHaveBeenCalled();
});
