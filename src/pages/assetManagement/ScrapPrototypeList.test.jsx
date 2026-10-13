import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import ScrapPrototypeList from './ScrapPrototypeList';

jest.mock('antd', () => {
  const React = require('react');
  const Box = ({ children }) => <div>{children}</div>;
  const Modal = Box;
  Modal.confirm = jest.fn();
  return {
    Button: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
    Card: Box, Dropdown: Box, Input: Box, Modal, Select: Box, Space: Box,
    DatePicker: { RangePicker: Box }, Typography: { Text: Box, Title: Box },
    Table: ({ dataSource, rowSelection }) => <div>{dataSource.map((record) => <input
      key={record.id} type="checkbox" aria-label={record.id}
      checked={rowSelection.selectedRowKeys.includes(record.id)}
      disabled={rowSelection.getCheckboxProps(record).disabled}
      onChange={(event) => rowSelection.onChange(event.target.checked ? [...rowSelection.selectedRowKeys, record.id] : rowSelection.selectedRowKeys.filter((id) => id !== record.id))}
    />)}</div>,
  };
});
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: () => null, QueryItem: () => null }));
jest.mock('../../components/SelectModal', () => () => null);
jest.mock('../../components/LookupInput', () => () => null);
jest.mock('../../components/StatusTag', () => () => null);
jest.mock('../inventoryManagement/OutboundApprovalHistoryPage', () => () => null);

beforeEach(() => Modal.confirm.mockClear());

test.each(['crossCompany', 'scrap', 'accounting', 'disposal'])('%s 列表仅勾选本人草稿，确认后调用批量删除', (type) => {
  const onDeleteDrafts = jest.fn(() => true);
  render(<ScrapPrototypeList type={type} config={{ title: type, statuses: [] }} currentCreator="actor"
    records={[
      { id: 'draft', creator: 'actor', documentStatus: '草稿', createdAt: '2026-10-13' },
      { id: 'rejected', creator: 'actor', documentStatus: '已驳回', createdAt: '2026-10-13' },
      { id: 'other', creator: 'other', documentStatus: '草稿', createdAt: '2026-10-13' },
    ]} onDeleteDrafts={onDeleteDrafts} />);
  expect(screen.getByRole('button', { name: '删除' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'rejected' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'other' })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'draft' }));
  fireEvent.click(screen.getByRole('button', { name: '删除' }));
  expect(onDeleteDrafts).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'draft' }));
  act(() => Modal.confirm.mock.calls[0][0].onOk());
  expect(onDeleteDrafts).toHaveBeenCalledWith(['draft']);
});
