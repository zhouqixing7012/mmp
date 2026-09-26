import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ScrapPrototypeAssetTable from './ScrapPrototypeAssetTable';
import { SCRAP_ASSET_POOL } from './scrapPrototypeData';

jest.mock('antd', () => {
  const ReactModule = require('react');
  const Button = ({ children, ...props }) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !['danger', 'icon'].includes(key)));
    return ReactModule.createElement('button', domProps, children);
  };
  const Input = (props) => ReactModule.createElement('input', props);
  const Select = ({ options = [], ...props }) => ReactModule.createElement(
    'select',
    props,
    ...options.map((option) => ReactModule.createElement(
      'option',
      { key: option.value, value: option.value },
      option.label,
    )),
  );
  const Table = ({ columns, dataSource }) => ReactModule.createElement(
    'table',
    null,
    ReactModule.createElement(
      'thead',
      null,
      ReactModule.createElement(
        'tr',
        null,
        ...columns.map((column, index) => ReactModule.createElement('th', { key: index }, column.title)),
      ),
    ),
    ReactModule.createElement(
      'tbody',
      null,
      ...dataSource.map((record) => ReactModule.createElement(
        'tr',
        { key: record.id },
        ...columns.map((column, index) => ReactModule.createElement(
          'td',
          { key: index },
          column.render ? column.render(record[column.dataIndex], record) : record[column.dataIndex],
        )),
      )),
    ),
  );

  return {
    Button,
    Input,
    InputNumber: Input,
    Select,
    Space: ({ children }) => ReactModule.createElement('div', null, children),
    Table,
    Upload: ({ children }) => ReactModule.createElement('div', null, children),
    message: { error: jest.fn(), success: jest.fn() },
  };
});

jest.mock('../../components/StatusTag', () => () => null);

jest.mock('../../components/SelectModal', () => {
  const ReactModule = require('react');

  return function MockSelectModal({ open, dataSource, onConfirm }) {
    if (!open) return null;
    return ReactModule.createElement(
      'div',
      { 'data-testid': 'asset-picker' },
      ...dataSource.map((asset) => ReactModule.createElement(
        'button',
        {
          key: asset.id,
          type: 'button',
          onClick: () => onConfirm([asset]),
        },
        asset.tagNo,
      )),
    );
  };
});

jest.mock('../../services/scrapPrototypeService', () => ({
  getScrapPrototypeRecords: () => [],
  getAccountingCandidates: () => [],
  getDisposalCandidates: () => [],
}));

test('跨公司转移按所选公司筛选资产，添加时带出当前资产目标字段', () => {
  const source = SCRAP_ASSET_POOL[0];
  const anotherCompanyAsset = SCRAP_ASSET_POOL.find((asset) => asset.company !== source.company);
  const onReplace = jest.fn();

  render(
    <ScrapPrototypeAssetTable
      type="crossCompany"
      assetScope=""
      sourceCompany={source.company}
      assets={[]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={onReplace}
    />,
  );

  expect(screen.getByText('资产类别')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '添加资产' }));
  expect(screen.getByTestId('asset-picker')).toHaveTextContent(source.tagNo);
  if (anotherCompanyAsset) {
    expect(screen.getByTestId('asset-picker')).not.toHaveTextContent(anotherCompanyAsset.tagNo);
  }

  fireEvent.click(screen.getByRole('button', { name: source.tagNo }));

  const [addedAsset] = onReplace.mock.calls[0][0];
  expect(addedAsset.newResponsiblePerson).toBe(source.responsiblePerson);
  expect(addedAsset.newCompany).toBe(source.company);
  expect(addedAsset.newPlate).toBe(source.plate);
  expect(addedAsset.newCostCenter).toBe(source.costCenter);
  expect(addedAsset.targetCity).toBe(source.city);
  expect(addedAsset.targetBuilding).toBe(source.building);
  expect(addedAsset.targetFloor).toBe(source.floor);
  expect(addedAsset.targetWarehouse).toBe(source.warehouse);
});
