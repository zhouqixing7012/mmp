import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('antd', () => {
  const React = require('react');
  const Card = ({ title, extra, children }) => <section><h2>{title}</h2>{extra}{children}</section>;
  const Space = ({ children }) => <div>{children}</div>;
  const Table = ({ dataSource = [], columns = [] }) => (
    <div role="table">
      {dataSource.map((record, index) => (
        <div key={record.id || index}>
          {columns.map((column, columnIndex) => (
            <span key={column.key || column.dataIndex || columnIndex}>
              {column.render
                ? column.render(record[column.dataIndex], record, index)
                : record[column.dataIndex]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
  const Button = ({ children, onClick }) => <button type="button" onClick={onClick}>{children}</button>;
  const Typography = {
    Title: ({ children }) => <h1>{children}</h1>,
    Text: ({ children }) => <span>{children}</span>,
  };
  return { Button, Card, Space, Table, Typography };
});

jest.mock('../../components/DetailGrid', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
  DetailItem: ({ label, children }) => <div><span>{label}</span>{children}</div>,
}));

jest.mock('../../components/StatusTag', () => ({
  __esModule: true,
  default: ({ value }) => <span>{value}</span>,
}));

import OutboundApprovalHistoryPage from './OutboundApprovalHistoryPage';

test('出库审批记录页可以渲染出库物资卡片', () => {
  render(
    <OutboundApprovalHistoryPage
      outbound={{
        documentNo: 'CK-20260919-001',
        lines: [{ id: 'line-1', materialDesc: '测试资产', assetTag: 'TAG-001', quantity: 1 }],
        approvalHistory: [],
      }}
      onBack={() => {}}
    />,
  );

  expect(screen.getByText('出库物资')).toBeInTheDocument();
  expect(screen.getByText('TAG-001')).toBeInTheDocument();
});
