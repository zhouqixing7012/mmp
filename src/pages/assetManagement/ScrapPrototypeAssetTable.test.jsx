import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as XLSX from 'xlsx';
import ScrapPrototypeAssetTable, { exportScrapPrototypeAssets } from './ScrapPrototypeAssetTable';
import { SCRAP_ASSET_POOL } from './scrapPrototypeData';

jest.mock('xlsx', () => ({
  __esModule: true,
  utils: {
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    json_to_sheet: jest.fn((rows) => ({ rows })),
  },
  writeFile: jest.fn(),
}));

jest.mock('antd', () => {
  const ReactModule = require('react');
  const Button = ({ children, ...props }) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !['danger', 'icon'].includes(key)));
    return ReactModule.createElement('button', domProps, children);
  };
  const Input = ({ suffix, allowClear, ...props }) => ReactModule.createElement('input', props);
  const InputNumber = ({ onChange, formatter, parser, precision, size, min, ...props }) => ReactModule.createElement('input', {
    ...props,
    min,
    type: 'number',
    'data-precision': precision,
    'data-formatted-value': props.value == null
      ? ''
      : formatter?.(props.value, { userTyping: false, input: String(props.value) }),
    onChange: (event) => {
      const rawValue = event.target.value;
      const parsedValue = parser ? parser(rawValue) : rawValue;
      onChange?.(rawValue === '' ? null : Number(parsedValue));
    },
  });
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
  const Tabs = ({ items = [] }) => ReactModule.createElement(
    'div',
    null,
    ...items.map((item) => ReactModule.createElement(
      'section',
      { key: item.key },
      ReactModule.createElement('div', null, item.label),
      item.children,
    )),
  );


  return {
    Button,
    Input,
    InputNumber,
    Select,
    Space: ({ children }) => ReactModule.createElement('div', null, children),
    Table,
    Tabs,
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
  getAccountingLostCandidates: ({ company }) => require('./scrapPrototypeData').SCRAP_ASSET_POOL
    .filter((item) => item.company === company)
    .map((item) => ({
      ...item,
      scrapMethod: '非调账',
      detailScrapMethod: '全部报废',
      scrapType: '丢失',
      sourceBusinessType: '手动添加资产',
      sourceBusinessNo: '-',
      cardQuantity: item.quantity || 1,
      cardOriginalValue: item.originalValue || 0,
      cardNetValue: item.netValue || 0,
    })),
  getDisposalCandidates: () => [],
  getScrapCandidates: ({ assetScope, assetCategory } = {}) => require('./scrapPrototypeData').SCRAP_ASSET_POOL
    .filter((item) => !item.parentAssetTag && (!assetScope || item.scope === assetScope)
      && (!assetCategory || item.majorCategory === assetCategory)),
  getRelatedScrapAccessories: () => [],
  prepareScrapAsset: (asset) => ({
    ...asset,
    cardQuantity: asset.cardQuantity ?? asset.quantity,
    requestedScrapQuantity: asset.requestedScrapQuantity ?? asset.quantity,
    detailScrapMethod: '全部报废',
  }),
  validateAccountingAssets: () => ({ valid: true, errors: [] }),
  validateScrapAssets: () => ({ valid: true, errors: [] }),
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
  // 调账后仓库只按新公司 + City 匹配；存在多个候选时不自动猜测。
  expect(typeof addedAsset.targetWarehouse).toBe('string');
});

test('账面报废资产字段只读，位置列使用 City、Building、Floor', () => {
  const source = { ...SCRAP_ASSET_POOL[0], scrapMethod: '非调账', scrapType: '已到报废期' };
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      sourceCompany={source.company}
      accountingActor={{ id: 'test-accountant' }}
      accountingAuthorizationScopes={[{ company: source.company, plates: '*' }]}
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
  expect(screen.getByRole('combobox')).toBeInTheDocument();
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
      sourceCompany={source.company}
      accountingActor={{ id: 'test-accountant' }}
      accountingAuthorizationScopes={[{ company: source.company, plates: '*' }]}
      assets={[source]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByRole('button', { name: '待报废资产' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '添加资产' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});

test('账面报废分别从审批通过待报废资产和不限范围的丢失资产添加', () => {
  const onReplace = jest.fn();
  const source = SCRAP_ASSET_POOL[0];
  const otherScope = SCRAP_ASSET_POOL.find((asset) => asset.company === source.company && asset.scope !== source.scope);
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      sourceCompany={source.company}
      accountingActor={{ id: 'test-accountant' }}
      accountingAuthorizationScopes={[{ company: source.company, plates: '*' }]}
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
  expect(addedAsset.sourceBusinessType).toBe('手动添加资产');
  expect(addedAsset.scrapMethod).toBe('非调账');
  expect(addedAsset.detailScrapMethod).toBe('全部报废');
  expect(addedAsset.reason).toBe('');
});

test('账面报废未选择公司时不能打开候选资产和导入', () => {
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      assets={[]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByRole('button', { name: '待报废资产' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '添加资产' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Excel导入' })).toBeDisabled();
});

test('责任人只读，新公司和新成本中心从弹窗选择', () => {
  const source = SCRAP_ASSET_POOL[0];
  const onChange = jest.fn();
  render(
    <ScrapPrototypeAssetTable
      type="crossCompany"
      assetScope={source.scope}
      sourceCompany={source.company}
      assets={[{ ...source, newResponsiblePerson: '114111-杨芊', newCompany: '', newCostCenter: '' }]}
      readOnly={false}
      onChange={onChange}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByText('114111-杨芊')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText('请选择新责任人')).not.toBeInTheDocument();

  [
    ['请选择新公司', '选择新公司', 'newCompany'],
    ['请选择新成本中心', '选择新成本中心', 'newCostCenter'],
  ].forEach(([placeholder, modalTitle, field]) => {
    fireEvent.click(screen.getByPlaceholderText(placeholder));
    expect(screen.getByTestId('selection-modal')).toHaveTextContent(modalTitle);
    fireEvent.click(screen.getByTestId('selection-modal').querySelector('button'));
    expect(onChange).toHaveBeenLastCalledWith(source.id, field, expect.any(String));
  });
});


test('资产处置回收商一至三按报价金额输入', () => {
  const source = { ...SCRAP_ASSET_POOL[0], recycler1: 1250.5, recycler2: null, recycler3: null };
  const onChange = jest.fn();
  render(
    <ScrapPrototypeAssetTable
      type="disposal"
      assetScope="办公设备"
      assets={[source]}
      readOnly={false}
      onChange={onChange}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByText('回收商一报价')).toBeInTheDocument();
  const amountInputs = screen.getAllByRole('spinbutton');
  expect(amountInputs).toHaveLength(3);
  expect(amountInputs[0]).toHaveAttribute('data-precision', '2');
  expect(amountInputs[0]).toHaveAttribute('data-formatted-value', '1,250.50');
  fireEvent.change(amountInputs[0], { target: { value: '1200.5' } });
  expect(onChange).toHaveBeenCalledWith(source.id, 'recycler1', 1200.5);
});

test('机房资产处置明细和导出没有三家回收商或报价', () => {
  const source = { ...SCRAP_ASSET_POOL.find((item) => item.scope === '机房资产') };
  render(<ScrapPrototypeAssetTable type="disposal" assetScope="机房资产" assets={[source]}
    readOnly onChange={jest.fn()} onReplace={jest.fn()} />);
  expect(screen.queryByText('回收商一报价')).not.toBeInTheDocument();
  XLSX.utils.json_to_sheet.mockClear();
  exportScrapPrototypeAssets([source], 'disposal', undefined, { assetScope: '机房资产' });
  expect(Object.keys(XLSX.utils.json_to_sheet.mock.calls[0][0][0])
    .some((key) => key.includes('回收商') || key.includes('报价'))).toBe(false);
});


test('资产报废明细使用报废数量，账面报废删除按钮只显示删除', () => {
  const source = SCRAP_ASSET_POOL[0];
  const scrap = render(
    <ScrapPrototypeAssetTable
      type="scrap"
      assetScope={source.scope}
      assets={[source]}
      readOnly
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );
  expect(screen.getByText('报废数量')).toBeInTheDocument();
  scrap.unmount();

  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      sourceCompany={source.company}
      accountingActor={{ id: 'test-accountant' }}
      accountingAuthorizationScopes={[{ company: source.company, plates: '*' }]}
      assets={[{ ...source, scrapMethod: '非调账', scrapType: '已到报废期' }]}
      readOnly={false}
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );
  expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '删除所选' })).not.toBeInTheDocument();
});


test('资产处置明细导出包含完整处置字段和三家报价', () => {
  jest.clearAllMocks();
  exportScrapPrototypeAssets([{
    id: 'disposal-export-1',
    tagNo: 'FA-2026-000120',
    serialNumber: 'SN-120',
    reason: '达到报废条件',
    majorCategory: 'OFFICE EQUIPMENT',
    minorCategory: '标准办公设备',
    scope: '办公设备',
    description: '办公设备',
    config: '双路处理器',
    enableDate: '2022-06-18',
    plate: '17.Corporate',
    city: '北京',
    building: '北京亦庄数据中心',
    quantity: 1,
    originalValue: 128000,
    netValue: 32000,
    recycler1: 1250.5,
    recycler2: 1380,
    recycler3: 1198.88,
  }], 'disposal', undefined, {
    recycler1Name: '广环再生资源利用有限公司',
    recycler2Name: '广州源创再生资源有限公司',
    recycler3Name: '东莞市创鑫再生资源有限公司',
  });

  expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
    expect.objectContaining({
      序号: 1,
      报废原因: '达到报废条件',
      资产类别: 'OFFICE EQUIPMENT.标准办公设备',
      City: '北京',
      回收商一供应商名称: '广环再生资源利用有限公司',
      回收商一报价: 1250.5,
      回收商二供应商名称: '广州源创再生资源有限公司',
      回收商二报价: 1380,
      回收商三供应商名称: '东莞市创鑫再生资源有限公司',
      回收商三报价: 1198.88,
    }),
  ]);
  expect(XLSX.writeFile.mock.calls[0][1]).toBe('资产处置明细.xlsx');
});

test('机房报废按报废资产和关联配件分组展示', () => {
  const main = {
    ...SCRAP_ASSET_POOL.find((item) => item.scope === '机房资产'),
    id: 'machine-main-tab',
    tagNo: 'MACHINE-MAIN-TAB',
  };
  const accessory = {
    ...main,
    id: 'machine-accessory-tab',
    tagNo: 'MACHINE-ACCESSORY-TAB',
    parentAssetTag: main.tagNo,
    isAccessory: true,
  };

  render(
    <ScrapPrototypeAssetTable
      type="scrap"
      assetScope="机房资产"
      assetCategory={main.majorCategory}
      assets={[main, accessory]}
      readOnly
      onChange={jest.fn()}
      onReplace={jest.fn()}
    />,
  );

  expect(screen.getByText('报废资产（1）')).toBeInTheDocument();
  expect(screen.getByText('关联配件（1）')).toBeInTheDocument();
  expect(screen.getByText(main.tagNo)).toBeInTheDocument();
  expect(screen.getByText(accessory.tagNo)).toBeInTheDocument();
});



test('账面报废手动添加资产默认丢失但报废类型可选三类', () => {
  const source = SCRAP_ASSET_POOL.find((asset) => asset.company === '114.新媒体');
  const onChange = jest.fn();
  render(
    <ScrapPrototypeAssetTable
      type="accounting"
      assetScope="混合"
      accountingMethod="非调账"
      sourceCompany="114.新媒体"
      accountingActor={{ id: 'test-accountant' }}
      accountingAuthorizationScopes={[{ company: '114.新媒体', plates: '*' }]}
      assets={[{
        ...source,
        id: 'manual-accounting-asset',
        scrapMethod: '非调账',
        detailScrapMethod: '全部报废',
        scrapType: '丢失',
        sourceBusinessType: '手动添加资产',
        cardQuantity: source.quantity || 1,
      }]}
      readOnly={false}
      onChange={onChange}
      onReplace={jest.fn()}
    />,
  );

  const typeSelect = screen.getByRole('combobox');
  expect(typeSelect).toHaveValue('丢失');
  expect(screen.getByRole('option', { name: '已到报废期' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: '未到报废期' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: '丢失' })).toBeInTheDocument();
});
