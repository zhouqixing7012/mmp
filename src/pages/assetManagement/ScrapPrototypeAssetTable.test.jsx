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
  const Input = ({ suffix, allowClear, ...props }) => ReactModule.createElement('input', props);
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

  return function MockSelectModal({ open, title, dataSource, multiple, onConfirm }) {
    if (!open) return null;
    return ReactModule.createElement(
      'div',
      { 'data-testid': title.includes('资产') ? 'asset-picker' : 'selection-modal' },
      ReactModule.createElement('div', null, title),
      ...dataSource.map((record) => ReactModule.createElement(
        'button',
        {
          key: record.id,
          type: 'button',
          onClick: () => onConfirm(multiple ? [record] : record),
        },
        record.tagNo || [record.code, record.name].filter(Boolean).join(' '),
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

test('账面报废资产字段只读，位置列使用 City、Building、Floor', () => {
  const source = { ...SCRAP_ASSET_POOL[0], scrapMethod: '非调账', scrapType: '已到报废期' };
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      assets={[source]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByText('City')).toBeInTheDocument();
  expect(screen.getByText('Building')).toBeInTheDocument();
  expect(screen.getByText('Floor')).toBeInTheDocument();
  expect(screen.queryByText('资产所在城市')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

test('调账资产信息只读，且不显示直接添加丢失资产入口', () => {
  const source = {
    ...SCRAP_ASSET_POOL[0],
    scrapMethod: '调账',
    newCompany: '115.新媒体-上海',
    targetCity: '37.上海市',
  };
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="调账"
      assets={[source]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByRole('button', { name: '待报废资产' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '添加资产' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

test('账面报废分别从审批通过待报废资产和不限范围的丢失资产添加', () => {
  const onReplace = jest.fn();
  const source = SCRAP_ASSET_POOL[0];
  const otherScope = SCRAP_ASSET_POOL.find((asset) => asset.scope !== source.scope);
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      assets={[]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={onReplace}
    />,
  );

  expect(screen.getByRole('button', { name: '待报废资产' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '添加资产' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '添加资产' }));
  expect(screen.getByTestId('asset-picker')).toHaveTextContent(source.tagNo);
  if (otherScope) expect(screen.getByTestId('asset-picker')).toHaveTextContent(otherScope.tagNo);
  fireEvent.click(screen.getByRole('button', { name: source.tagNo }));

  const [addedAsset] = onReplace.mock.calls[0][0];
  expect(addedAsset.scrapType).toBe('丢失');
  expect(addedAsset.scrapMethod).toBe('非调账');
  expect(addedAsset.reason).toBe('');
});

test('新责任人、新公司、新成本中心均从弹窗选择', () => {
  const source = SCRAP_ASSET_POOL[0];
  const onChange = jest.fn();
  render(
    <ScrapPrototypeAssetTable
      type="crossCompany"
      assetScope={source.scope}
      sourceCompany={source.company}
      assets={[{ ...source, newResponsiblePerson: '', newCompany: '', newCostCenter: '' }]}
      readOnly={false}
      onChange={onChange}
      onReplace={jest.fn()}
    />,
  );

  [
    ['请选择新责任人', '选择新责任人', 'newResponsiblePerson'],
    ['请选择新公司', '选择新公司', 'newCompany'],
    ['请选择新成本中心', '选择新成本中心', 'newCostCenter'],
  ].forEach(([placeholder, modalTitle, field]) => {
    fireEvent.click(screen.getByPlaceholderText(placeholder));
    expect(screen.getByTestId('selection-modal')).toHaveTextContent(modalTitle);
    fireEvent.click(screen.getByTestId('selection-modal').querySelector('button'));
    expect(onChange).toHaveBeenLastCalledWith(source.id, field, expect.any(String));
  });
});
