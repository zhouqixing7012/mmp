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
  return function MockAssetTable({ showTransferDiff }) {
    return ReactModule.createElement('div', {
      'data-testid': 'asset-table',
      'data-show-transfer-diff': String(Boolean(showTransferDiff)),
    });
  };
});
jest.mock('../assetBorrowing/BorrowingApprovalHistory', () => {
  const ReactModule = require('react');
  return function MockApprovalHistory({ children, records = [] }) {
    return ReactModule.createElement('div', null,
      ReactModule.createElement('div', { 'data-testid': 'approval-history-records' },
        records.map((record, index) => ReactModule.createElement(
          'div',
          { key: `${record.node}-${index}` },
          `${record.node} ${record.status} ${record.comment}`,
        )),
      ),
      children,
    );
  };
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


test('资产处置编辑页不展示独立报价与处置信息区块', () => {
  render(
    <ScrapPrototypeEditor
      type="disposal"
      config={{ title: '资产处置', createLabel: '创建资产处置申请单' }}
      initialForm={{ ...accountingForm, documentStatus: '草稿' }}
      initialAssets={[]}
      readOnly={false}
      approvalPage={false}
      onBack={jest.fn()}
      onSave={jest.fn()}
      onApprove={jest.fn()}
    />,
  );

  expect(screen.queryByText('报价与处置信息')).not.toBeInTheDocument();
});

test.each([
  ['crossCompany', '跨公司转移'],
  ['scrap', '资产报废'],
])('%s提交审批页与单号详情页共用单头、明细差异和审批记录，只在审批页显示办理操作', (type, title) => {
  const submittedForm = {
    ...accountingForm,
    applicationNo: 'DEMO-APPROVAL-001',
    documentStatus: '审批中',
    creator: '213852-孙志强',
    company: '114.新媒体',
    currentNode: type === 'crossCompany' ? '责任人7级及以上直属领导' : 'ES主管确认',
    description: '设备已达到报废条件',
    approvalHistory: [
      { node: '发起人提交', person: '213852-孙志强', result: '提交', opinion: '', time: '2026-09-26 10:00:00' },
    ],
  };
  const props = {
    type,
    config: { title, createLabel: `创建${title}申请单` },
    initialForm: submittedForm,
    initialAssets: [],
    readOnly: true,
    onBack: jest.fn(),
    onSave: jest.fn(),
    onApprove: jest.fn(),
  };

  const approval = render(<ScrapPrototypeEditor {...props} approvalPage />);
  const approvalLayoutKey = approval.container.firstChild.getAttribute('data-page-view-key');
  expect(screen.getByRole('heading', { name: `${title}审批` })).toBeInTheDocument();
  expect(screen.getByText('申请人信息')).toBeInTheDocument();
  expect(screen.getByText('申请单号：DEMO-APPROVAL-001')).toBeInTheDocument();
  expect(screen.getAllByText('213852-孙志强').length).toBeGreaterThan(0);
  expect(screen.queryByText('单据状态')).not.toBeInTheDocument();
  expect(screen.queryByText('审批中')).not.toBeInTheDocument();
  expect(screen.getByTestId('asset-table')).toHaveAttribute(
    'data-show-transfer-diff',
    type === 'crossCompany' ? 'true' : 'false',
  );
  expect(screen.getByTestId('approval-history-records')).toHaveTextContent('发起人提交');
  const approvalHistory = screen.getByTestId('approval-history-records').textContent;
  expect(screen.getByPlaceholderText('同意时非必填，驳回时必填')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '同意' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '驳回' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '加签' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
  approval.unmount();

  const detail = render(<ScrapPrototypeEditor {...props} approvalPage={false} />);
  expect(detail.container.firstChild.getAttribute('data-page-view-key')).toBe(approvalLayoutKey);
  expect(screen.getByRole('heading', { name: `${title}审批` })).toBeInTheDocument();
  expect(screen.getByText('申请人信息')).toBeInTheDocument();
  expect(screen.getByText('申请单号：DEMO-APPROVAL-001')).toBeInTheDocument();
  expect(screen.getAllByText('213852-孙志强').length).toBeGreaterThan(0);
  expect(screen.queryByText('单据状态')).not.toBeInTheDocument();
  expect(screen.queryByText('审批中')).not.toBeInTheDocument();
  expect(screen.getByTestId('asset-table')).toHaveAttribute(
    'data-show-transfer-diff',
    type === 'crossCompany' ? 'true' : 'false',
  );
  expect(screen.getByTestId('approval-history-records').textContent).toBe(approvalHistory);
  expect(screen.queryByPlaceholderText('同意时非必填，驳回时必填')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '同意' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '驳回' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
});
