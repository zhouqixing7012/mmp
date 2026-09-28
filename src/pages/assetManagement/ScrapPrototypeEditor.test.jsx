import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import { exportScrapPrototypeAssets } from './ScrapPrototypeAssetTable';

jest.mock('antd', () => {
  const ReactModule = require('react');
  const element = (tag, value, props = {}) => ReactModule.createElement(tag, props, value);
  const fragment = (...children) => ReactModule.createElement(ReactModule.Fragment, null, ...children);
  const Button = ({ children, onClick, disabled }) => element('button', children, { type: 'button', onClick, disabled });
  const Card = ({ children, title, extra }) => element('section', fragment(element('div', title), extra, children));
  const Descriptions = ({ children }) => element('div', children);
  Descriptions.Item = ({ children, label }) => element('div', fragment(element('span', label), children));
  const Input = ({ value, onChange, placeholder, required, disabled }) => element('input', null, {
    value, onChange, placeholder, required, disabled,
  });
  Input.TextArea = ({ value, onChange, placeholder, required, disabled }) => element('textarea', null, {
    value, onChange, placeholder, required, disabled,
  });
  const Select = ({ value, onChange, options = [], disabled }) => ReactModule.createElement('select', {
    value, disabled, onChange: (event) => onChange?.(event.target.value),
  }, options.map((option) => element('option', option.label, { key: option.value, value: option.value })));
  const Table = ({ columns = [], dataSource = [] }) => element('table', element('tbody', dataSource.map((record, rowIndex) => (
    element('tr', columns.map((column, index) => element('td', column.render
      ? column.render(record[column.dataIndex], record, rowIndex)
      : record[column.dataIndex], { key: column.key || column.dataIndex || index })), { key: record.id || record.key || rowIndex })
  ))));
  const Tabs = ({ items = [] }) => element('div', items.map((item) => element('section', fragment(element('div', item.label), item.children), { key: item.key })));
  const Collapse = ({ items = [] }) => element('div', items.map((item) => element('section', fragment(element('div', item.label), item.children), { key: item.key })));
  const Typography = { Text: ({ children }) => element('span', children) };
  const Steps = ({ items = [] }) => element('div', items.map((item) => element('span', item.title, { key: item.title })));
  const Upload = ({ children }) => element('div', children);
  return {
    Button, Card, Descriptions, Input, Select, Table, Tabs, Collapse, Typography, Steps, Upload,
    Space: ({ children }) => element('div', children),
    theme: { useToken: () => ({ token: { colorBorderSecondary: '#ccc', fontSize: 14, lineHeight: 1.5, colorText: '#222' } }) },
    message: { error: jest.fn(), warning: jest.fn(), success: jest.fn() },
  };
});

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
      { role: 'dialog', 'aria-label': title, 'data-candidate-count': dataSource.length },
      ReactModule.createElement('span', null, title),
      ReactModule.createElement('button', { type: 'button', onClick: () => onConfirm(dataSource[0]) }, '选择候选公司'),
    );
  };
});

jest.mock('./ScrapPrototypeAssetTable', () => {
  const ReactModule = require('react');
  return {
    __esModule: true,
    default: function MockAssetTable({ showTransferDiff }) {
      return ReactModule.createElement('div', {
        'data-testid': 'asset-table',
        'data-show-transfer-diff': String(Boolean(showTransferDiff)),
      });
    },
    exportScrapPrototypeAssets: jest.fn(),
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

test('提单人确认作为审批中最后节点，审批页展示确认并执行', () => {
  const onExecute = jest.fn(() => ({
    documentStatus: '已完成', currentNode: '流程结束', approvalHistory: [],
  }));
  render(<ScrapPrototypeEditor
    type="accounting" config={{ title: '账面报废' }}
    initialForm={{ ...accountingForm, id: 'confirm-1', documentStatus: '审批中', currentNode: '提单人确认' }}
    initialAssets={[]} readOnly approvalPage onBack={jest.fn()} onSave={jest.fn()}
    onApprove={jest.fn()} onExecute={onExecute}
  />);
  expect(screen.getByRole('button', { name: '确认并执行' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '同意' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '确认并执行' }));
  expect(onExecute).toHaveBeenCalledWith('confirm-1', '同意');
});

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
  const picker = screen.getByRole('dialog', { name: '选择公司' });
  expect(Number(picker.getAttribute('data-candidate-count'))).toBeGreaterThan(0);
  expect(screen.getByPlaceholderText('请填写已到报废期资产的报废原因')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请填写未到报废期资产的报废原因')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请填写丢失资产的报废原因')).toBeInTheDocument();
  expect(screen.queryByText('单据状态')).not.toBeInTheDocument();
});


test('资产处置编辑页展示三个非必填回收商名称和自动报价合计', () => {
  render(
    <ScrapPrototypeEditor
      type="disposal"
      config={{ title: '资产处置', createLabel: '创建资产处置申请单' }}
      initialForm={{ ...accountingForm, assetScope: '办公设备', documentStatus: '草稿' }}
      initialAssets={[
        { id: 'asset-1', recycler1: 1250.5, recycler2: 1380, recycler3: 1198.88 },
        { id: 'asset-2', recycler1: 500, recycler2: 620.25, recycler3: 701.12 },
      ]}
      readOnly={false}
      approvalPage={false}
      onBack={jest.fn()}
      onSave={jest.fn()}
      onApprove={jest.fn()}
    />,
  );

  expect(screen.queryByText('报价与处置信息')).not.toBeInTheDocument();
  expect(screen.queryByText('单据状态')).not.toBeInTheDocument();
  expect(screen.getByText('备注')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请输入回收商一的供应商名称')).not.toBeRequired();
  expect(screen.getByPlaceholderText('请输入回收商二的供应商名称')).not.toBeRequired();
  expect(screen.getByPlaceholderText('请输入回收商三的供应商名称')).not.toBeRequired();
  expect(screen.getByText('回收商一报价合计：')).toBeInTheDocument();
  expect(screen.getByText('1,750.50')).toBeInTheDocument();
  expect(screen.getByText('2,000.25')).toBeInTheDocument();
  expect(screen.getByText('1,900.00')).toBeInTheDocument();
});

test('资产处置办公设备提交前进入预览并自动生成可编辑处置说明', () => {
  const onSave = jest.fn();
  render(
    <ScrapPrototypeEditor
      type="disposal"
      config={{ title: '资产处置', createLabel: '创建资产处置申请单' }}
      initialForm={{
        ...accountingForm,
        company: '114.新媒体',
        companies: ['114.新媒体'],
        plates: [],
        assetScope: '办公设备',
        documentStatus: '草稿',
        recycler1Name: '回收商甲',
        recycler2Name: '回收商乙',
        recycler3Name: '回收商丙',
      }}
      initialAssets={[{
        id: 'preview-asset-1',
        tagNo: 'FA-PREVIEW-001',
        company: '114.新媒体',
        plate: '17_Corporate',
        scope: '办公设备',
        majorCategory: 'PC',
        city: '北京',
        quantity: 2,
        originalValue: 20000,
        netValue: 500,
        recycler1: 12000,
        recycler2: 10000,
        recycler3: 9000,
      }]}
      readOnly={false}
      approvalPage={false}
      onBack={jest.fn()}
      onSave={onSave}
      onApprove={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: '预览' }));
  expect(screen.getByRole('heading', { name: '资产处置预览' })).toBeInTheDocument();
  expect(screen.getByText('提交发起审批后展示审批记录')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '提交发起审批' })).toBeInTheDocument();
  const description = screen.getByDisplayValue(/按照报废计划，ES拟对2台库存老旧办公资产进行变卖处置/);
  expect(description).toHaveValue(expect.stringContaining('回收商“回收商甲”总价最高'));
  expect(onSave).not.toHaveBeenCalled();

  fireEvent.change(description, { target: { value: '人工调整后的处置说明' } });
  fireEvent.click(screen.getByRole('button', { name: '提交发起审批' }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ disposalDescription: '人工调整后的处置说明' }),
    expect.any(Array),
    true,
  );
});

test('资产处置审批页展示会计格式报价并可导出当前申请明细', () => {
  jest.clearAllMocks();
  const assets = [{
    id: 'disposal-approval-asset',
    tagNo: 'FA-2026-000120',
    majorCategory: 'OFFICE EQUIPMENT',
    scope: '办公设备',
    description: '办公设备',
    city: '北京',
    quantity: 1,
    originalValue: 128000,
    netValue: 32000,
    recycler1: 1250.5,
    recycler2: 1380,
    recycler3: 1198.88,
  }, {
    id: 'disposal-approval-asset-2', tagNo: 'FA-2026-000121', majorCategory: 'OFFICE EQUIPMENT', scope: '办公设备',
    city: '北京', quantity: 1, originalValue: 2000, netValue: 800,
    recycler1: 1250.5, recycler2: 1200, recycler3: 1000,
  }];

  render(
    <ScrapPrototypeEditor
      type="disposal"
      config={{ title: '资产处置', createLabel: '创建资产处置申请单' }}
      initialForm={{
        ...accountingForm,
        applicationNo: 'CZ20260926000001',
        documentStatus: '审批中',
        assetScope: '办公设备',
        currentNode: 'ES二级审批',
        scrapMethod: '全部报废',
        remark: '办公资产处置说明',
        recycler1Name: '广环再生资源利用有限公司',
        recycler2Name: '广州源创再生资源有限公司',
        recycler3Name: '东莞市创鑫再生资源有限公司',
      }}
      initialAssets={assets}
      readOnly
      approvalPage
      onBack={jest.fn()}
      onSave={jest.fn()}
      onApprove={jest.fn()}
    />,
  );

  expect(screen.getByText('申请单号：CZ20260926000001')).toBeInTheDocument();
  expect(screen.getByText('备注')).toBeInTheDocument();
  expect(screen.getByText('办公资产处置说明')).toBeInTheDocument();
  expect(screen.getByText('广环再生资源利用有限公司')).toBeInTheDocument();
  expect(screen.getByText('1,250.50、1,250.50')).toBeInTheDocument();
  expect(screen.getByText('2,501.00')).toBeInTheDocument();
  expect(screen.queryByText('单据状态')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(exportScrapPrototypeAssets).toHaveBeenCalledWith(
    assets,
    'disposal',
    '全部报废',
    expect.objectContaining({
      recycler1Name: '广环再生资源利用有限公司',
      recycler2Name: '广州源创再生资源有限公司',
      recycler3Name: '东莞市创鑫再生资源有限公司',
    }),
  );
});

test('机房自动处置单仅展示清洗与资产，不显示或导出回收商报价', () => {
  jest.clearAllMocks();
  const assets = [{ id: 'machine-disposal', scope: '机房资产', majorCategory: 'SERVER', city: '北京', quantity: 1 }];
  render(<ScrapPrototypeEditor
    type="disposal" config={{ title: '资产处置' }}
    initialForm={{ ...accountingForm, applicationNo: 'CZ20260926000002', documentStatus: '审批中',
      assetScope: '机房资产', region: '北京', needsCleaning: '否', currentNode: '采购专员协办' }}
    initialAssets={assets} readOnly approvalPage onBack={jest.fn()} onSave={jest.fn()} onApprove={jest.fn()}
  />);
  expect(screen.getByText('是否需要数据清洗')).toBeInTheDocument();
  expect(screen.queryByText('回收商一')).not.toBeInTheDocument();
  expect(screen.queryByText('回收商一报价合计：')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(exportScrapPrototypeAssets).toHaveBeenCalledWith(assets, 'disposal', '非调账', expect.objectContaining({ assetScope: '机房资产' }));
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
  const opinionPlaceholder = type === 'crossCompany'
    ? '同意时非必填，驳回时必填'
    : '请输入审批意见（驳回时必填）';
  expect(screen.getByPlaceholderText(opinionPlaceholder)).toBeInTheDocument();
  const approvalButtons = within(screen.getByTestId('approval-action-buttons'));
  expect(approvalButtons.getByRole('button', { name: '同意' })).toBeInTheDocument();
  expect(approvalButtons.getByRole('button', { name: '驳回' })).toBeInTheDocument();
  expect(approvalButtons.getByRole('button', { name: '返回' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: '返回' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: '加签' })).not.toBeInTheDocument();
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
  expect(screen.queryByPlaceholderText(opinionPlaceholder)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '同意' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '驳回' })).not.toBeInTheDocument();
  expect(screen.queryByTestId('approval-action-buttons')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
});


test('机房资产报废审批单头展示资产大类、所在地和单独一行的报废说明', () => {
  render(
    <ScrapPrototypeEditor
      type="scrap"
      config={{ title: '资产报废', createLabel: '创建资产报废申请单' }}
      initialForm={{
        ...accountingForm,
        applicationNo: 'BF-MACHINE-001',
        documentStatus: '审批中',
        currentNode: '采购专员',
        officeArea: '北京-搜狐媒体大厦',
        assetScope: '机房资产',
        assetCategory: 'SERVER',
        assetLocation: '北京',
        description: '机房服务器达到报废条件',
      }}
      initialAssets={[]}
      readOnly
      approvalPage
      onBack={jest.fn()}
      onSave={jest.fn()}
      onApprove={jest.fn()}
    />,
  );

  expect(screen.getByText('资产大类')).toBeInTheDocument();
  expect(screen.getByText('SERVER')).toBeInTheDocument();
  expect(screen.getByText('资产所在地')).toBeInTheDocument();
  expect(screen.getByText('北京')).toBeInTheDocument();
  expect(screen.getByText('报废说明')).toBeInTheDocument();
  expect(screen.getByText('机房服务器达到报废条件')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument();
});

test.each(['非调账', '调账'])('账面报废%s详情与审批显示相同原因、明细和历史，详情没有审批按钮', (scrapMethod) => {
  const asset = {
    id: `accounting-${scrapMethod}`, tagNo: 'TAG-ACCOUNTING', majorCategory: 'SERVER', minorCategory: '标准服务器',
    quantity: 1, originalValue: 1000, netValue: 0, scrapType: '已到报废期',
    scrapMethod, detailScrapMethod: scrapMethod === '调账' ? '调账' : '全部报废',
  };
  const props = {
    type: 'accounting', config: { title: '账面报废', createLabel: '创建账面报废申请单' },
    initialForm: {
      ...accountingForm, applicationNo: 'ZMBF-DETAIL-001', documentStatus: '审批中',
      currentNode: '财务初审', scrapMethod, scrapReasons: { 已到报废期: '达到报废条件' },
      approvalHistory: [{ node: '发起人提交', person: '115720-吕静', result: '提交', opinion: '', time: '2026-09-28 10:00:00' }],
    },
    initialAssets: [asset], readOnly: true, onBack: jest.fn(), onSave: jest.fn(), onApprove: jest.fn(),
  };
  const approval = render(<ScrapPrototypeEditor {...props} approvalPage />);
  expect(screen.getByText('申请人信息')).toBeInTheDocument();
  expect(screen.getByText('达到报废条件')).toBeInTheDocument();
  expect(screen.getByText('已到报废期（1）')).toBeInTheDocument();
  expect(screen.getByTestId('approval-history-records')).toHaveTextContent('发起人提交');
  expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '同意' })).toBeInTheDocument();
  const layout = approval.container.firstChild.getAttribute('data-page-view-key');
  approval.unmount();

  const detail = render(<ScrapPrototypeEditor {...props} approvalPage={false} />);
  expect(detail.container.firstChild.getAttribute('data-page-view-key')).toBe(layout);
  expect(screen.getByText('申请人信息')).toBeInTheDocument();
  expect(screen.getByText('达到报废条件')).toBeInTheDocument();
  expect(screen.getByText('已到报废期（1）')).toBeInTheDocument();
  expect(screen.getByTestId('approval-history-records')).toHaveTextContent('发起人提交');
  expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '同意' })).not.toBeInTheDocument();
});
