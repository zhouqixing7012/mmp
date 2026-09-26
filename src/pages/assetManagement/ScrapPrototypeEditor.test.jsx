import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';

jest.mock('../../components/LookupInput', () => {
  const ReactModule = require('react');
  return function MockLookupInput({ value, placeholder, onOpen, disabled }) {
    return ReactModule.createElement('button', { type: 'button', disabled, onClick: onOpen }, value || placeholder);
  };
});

jest.mock('../../components/SelectModal', () => {
  const ReactModule = require('react');
  return function MockSelectModal({ open, title, dataSource = [], onConfirm }) {
    if (!open) return null;
    return ReactModule.createElement(
      'div',
      { role: 'dialog', 'aria-label': title },
      ReactModule.createElement('span', null, title),
      ReactModule.createElement('button', { type: 'button', onClick: () => onConfirm(dataSource[0]) }, '选择候选公司'),
    );
  };
});

jest.mock('./ScrapPrototypeAssetTable', () => {
  const ReactModule = require('react');
  return () => ReactModule.createElement('div', { 'data-testid': 'asset-table' });
});
jest.mock('../assetBorrowing/BorrowingApprovalHistory', () => {
  const ReactModule = require('react');
  return ({ children }) => ReactModule.createElement('div', null, children);
});

const accountingForm = {
  applicationNo: '',
  documentStatus: '草稿',
  creator: '213852-孙志强',
  applicationDate: '2026-09-26',
  company: '114.新媒体',
  officeArea: '北京',
  contactPhone: '13800000000',
  email: 'test@example.com',
  department: '资产管理部',
  remark: '',
  scrapMethod: '非调账',
  scrapReasons: {},
  attachments: [],
};

test('账面报废公司通过弹窗选择，三个报废原因分别可编辑', () => {
  render(
    <ScrapPrototypeEditor
      type="accounting"
      config={{ title: '账面报废', createLabel: '创建账面报废申请单' }}
      initialForm={accountingForm}
      initialAssets={[]}
      readOnly={false}
      approvalPage={false}
      onBack={jest.fn()}
      onSave={jest.fn()}
      onApprove={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: '114.新媒体' }));
  expect(screen.getByRole('dialog', { name: '选择公司' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请填写已到报废期资产的报废原因')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请填写未到报废期资产的报废原因')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请填写丢失资产的报废原因')).toBeInTheDocument();
});
