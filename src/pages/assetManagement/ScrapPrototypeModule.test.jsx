import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScrapPrototypeModule from './ScrapPrototypeModule';
import {
  getAccountingCandidates,
  getAccountingLostCandidates,
  getDisposalCandidates,
  getScrapPrototypeRecords,
  resetScrapPrototypeMemory,
  saveScrapPrototypeRecords,
} from '../../services/scrapPrototypeService';
import { ACCOUNTING_DEMO_ACCESS, SCRAP_ASSET_POOL } from './scrapPrototypeData';
import { getAccountingApprovalSteps, getDisposalApprovalNodes } from './scrapPrototypeWorkflow';

const accountingAccess = {
  actor: { id: 'verified-accountant' },
  authorizationScopes: [{ company: '114.新媒体', plates: '*' }],
};

jest.mock('antd', () => ({
  message: { error: jest.fn(), warning: jest.fn(), success: jest.fn() },
}));

jest.mock('./ScrapPrototypeList', () => {
  const React = require('react');
  return function TestList({ type, config, records, onCreate, onApprove, onExecute }) {
    return <div>
      <button type="button" onClick={() => onCreate()}>{config.createLabel}</button>
      {['crossCompany', 'scrap', 'accounting'].includes(type) && (
        <button type="button" onClick={() => onApprove(records.find((record) => record.documentStatus === '审批中'), '通过', '同意')}>
          审批通过
        </button>
      )}
      {type === 'accounting' && (
        <button type="button" onClick={() => onApprove(records.find((record) => record.documentStatus === '审批中' && record.currentNode === '提单人确认'), '驳回', '请修改')}>
          提单人驳回
        </button>
      )}
      {type === 'accounting' && (
        <button type="button" onClick={() => onExecute(records.find((record) => record.documentStatus === '审批中' && record.currentNode === '提单人确认'))}>
          执行账面报废
        </button>
      )}
      {records.map((record) => <span key={record.id}>{record.applicationNo || record.disposalStatus}</span>)}
    </div>;
  };
});

jest.mock('./ScrapPrototypeEditor', () => {
  const React = require('react');
  return function TestEditor({ initialForm, initialAssets, onSave, approvalPage }) {
    const [localForm] = React.useState(initialForm);
    return <div>
      {approvalPage && (
        <>
          <span>跨公司转移审批页面</span>
          <span data-testid="approval-document-status">{localForm.documentStatus}</span>
          <span data-testid="approval-record-count">{localForm.approvalHistory?.length || 0}</span>
        </>
      )}
      <button type="button" onClick={() => onSave(initialForm, initialAssets, false)}>保存草稿</button>
      <button type="button" onClick={() => onSave(initialForm, initialAssets, true)}>提交申请</button>
    </div>;
  };
});

beforeEach(() => {
  window.localStorage.clear();
  resetScrapPrototypeMemory();
});

test('114.新媒体有可选的调账与非调账演示资产，均来自已完成的前置单据', () => {
  const assets = getAccountingCandidates({ ...ACCOUNTING_DEMO_ACCESS, company: '114.新媒体' });
  expect(assets.filter((item) => item.scrapMethod === '调账')).toEqual([
    expect.objectContaining({ tagNo: 'SW-2026-000021', sourceBusinessType: '跨公司转移', sourceBusinessNo: 'CT20260921000004' }),
  ]);
  expect(assets.filter((item) => item.scrapMethod === '非调账')).toEqual([
    expect.objectContaining({ tagNo: 'FA-2026-000122', sourceBusinessType: '资产报废', sourceBusinessNo: 'BF20260921000012' }),
  ]);
});

test('四类原型主模块可加载，跨公司转移草稿保存后可以重新打开', async () => {
  const types = [
    ['crossCompany', '创建跨公司转移申请单'],
    ['scrap', '创建资产报废申请单'],
    ['accounting', '创建账面报废申请单'],
    ['disposal', '创建资产处置申请单'],
  ];

  for (const [type, label] of types) {
    const view = render(<ScrapPrototypeModule type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    view.unmount();
  }

  const initialCount = getScrapPrototypeRecords('crossCompany').length;
  const view = render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '创建跨公司转移申请单' }));
  fireEvent.click(screen.getByRole('button', { name: '保存草稿' }));

  await waitFor(() => expect(getScrapPrototypeRecords('crossCompany')).toHaveLength(initialCount + 1));
  const newDraft = getScrapPrototypeRecords('crossCompany')[0];
  expect(newDraft.documentStatus).toBe('草稿');
  view.unmount();

  render(<ScrapPrototypeModule type="crossCompany" />);
  expect(screen.getByText(newDraft.applicationNo)).toBeInTheDocument();
});

test('资产处置有多张可查看单据，覆盖不同资产范围、状态和带报价的明细', () => {
  render(<ScrapPrototypeModule type="disposal" />);
  const rows = getScrapPrototypeRecords('disposal');
  expect(rows).toHaveLength(6);
  expect(rows.some((row) => row.assetScope === '机房资产' && row.documentStatus === '审批中')).toBe(true);
  expect(rows.some((row) => row.assetScope === '办公设备' && row.documentStatus === '审批中')).toBe(true);
  expect(rows.some((row) => row.assetScope === '办公设备' && row.currentNode === 'ES专员处理' && row.documentStatus === '审批中')).toBe(true);
  expect(rows.some((row) => row.documentStatus === '处理中')).toBe(false);
  expect(rows.some((row) => row.assetScope === '软件' || row.disposalMode === '无实物处置')).toBe(false);
  expect(rows.some((row) => row.assetsSnapshot.some((asset) => asset.scrapType === '丢失'))).toBe(false);
  expect(rows.every((row) => row.assetsSnapshot?.length > 0)).toBe(true);

  const physicalAssets = rows
    .filter((row) => row.assetScope === '办公设备')
    .flatMap((row) => row.assetsSnapshot);
  expect(physicalAssets.length).toBeGreaterThan(3);
  expect(physicalAssets.some((asset) => asset.recycler1 >= 1000)).toBe(true);
  expect(physicalAssets.every((asset) => (
    typeof asset.recycler1 === 'number'
    && typeof asset.recycler2 === 'number'
    && typeof asset.recycler3 === 'number'
  ))).toBe(true);
  expect(rows.filter((row) => row.assetScope === '机房资产')
    .every((row) => !row.recycler1Name && row.assetsSnapshot.every((asset) => asset.recycler1 == null))).toBe(true);
});

test('旧资产处置办理状态刷新后统一迁移为审批中，保留节点与历史', () => {
  const legacyRows = [
    { id: 'legacy-disposal-1', documentStatus: '处理中', currentNode: 'ES专员处理',
      approvalHistory: [{ node: '财务审批', result: '通过' }],
      formSnapshot: { documentStatus: '待 ES 专员处理', currentNode: 'ES专员处理' } },
    { id: 'legacy-disposal-2', documentStatus: '办理中', assetScope: '机房资产',
      assetsSnapshot: [{ scope: '机房资产', dataCleaning: '是' }], currentNode: '采购专员协办',
      formSnapshot: { documentStatus: '办理中', currentNode: '采购专员协办' } },
  ];
  window.localStorage.setItem('asset-scrap-prototype:v2:disposal', JSON.stringify(legacyRows));
  const migrated = getScrapPrototypeRecords('disposal');
  expect(migrated.map((record) => record.documentStatus)).toEqual(['审批中', '审批中']);
  expect(migrated.map((record) => record.formSnapshot.documentStatus)).toEqual(['审批中', '审批中']);
  expect(migrated[0].currentNode).toBe('ES专员处理');
  expect(migrated[0].approvalHistory).toEqual(legacyRows[0].approvalHistory);
  expect(migrated[1].needsCleaning).toBe('是');
  expect(JSON.parse(window.localStorage.getItem('asset-scrap-prototype:v2:disposal'))).toEqual(migrated);
});

test('账面报废完成仅自动生成机房实物处置单，软件和丢失直接完成', () => {
  const sourceAssets = ['scrap-machine-114', 'scrap-soft-1', 'scrap-office-114-accounting']
    .map((id) => SCRAP_ASSET_POOL.find((asset) => asset.id === id))
    .map((asset) => ({ ...asset, cardQuantity: asset.quantity, requestedScrapQuantity: asset.quantity,
      cardOriginalValue: asset.originalValue, cardNetValue: asset.netValue }));
  saveScrapPrototypeRecords('scrap', [{ id: 'scrap-approved-for-accounting', applicationNo: 'BF-CASE-APPROVED',
    documentStatus: '已审批', assetsSnapshot: sourceAssets }]);
  saveScrapPrototypeRecords('crossCompany', []);
  saveScrapPrototypeRecords('accounting', []);
  const candidates = getAccountingCandidates({ ...accountingAccess, company: '114.新媒体' });
  const lost = getAccountingLostCandidates({ ...accountingAccess, company: '114.新媒体' })
    .find((asset) => asset.id === 'scrap-furniture-1');
  expect(candidates).toHaveLength(3);
  expect(lost).toBeDefined();
  saveScrapPrototypeRecords('disposal', []);
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-auto-disposal', applicationNo: 'ZMBF20260926000099', documentStatus: '审批中',
    company: '114.新媒体', assetScope: '混合', currentNode: '提单人确认',
    assetsSnapshot: [...candidates, lost],
  }]);
  render(<ScrapPrototypeModule type="accounting" accountingActor={accountingAccess.actor}
    accountingAuthorizationScopes={accountingAccess.authorizationScopes} />);
  fireEvent.click(screen.getByRole('button', { name: '执行账面报废' }));
  const rows = getScrapPrototypeRecords('disposal');
  expect(rows).toHaveLength(1);
  expect(rows.map((row) => row.disposalMode)).toEqual(['实物处置']);
  expect(rows.every((row) => row.creator === '系统自动')).toBe(true);
  const completed = getScrapPrototypeRecords('accounting')[0];
  expect(completed.documentStatus).toBe('已完成');
  expect(completed.assetsSnapshot.filter((asset) => asset.scope === '软件' || asset.scrapType === '丢失')
    .every((asset) => asset.status === '已报废-已处置')).toBe(true);
});

test.each([
  ['否', 0, '已报废-已处置'],
  ['是', 1, '在用-使用中'],
])('非北京机房清洗结果为%s时自动处置单数量为%i', (dataCleaning, expectedCount, expectedStatus) => {
  const machine = SCRAP_ASSET_POOL.find((asset) => asset.id === 'scrap-machine-114');
  const source = { ...machine, city: '上海', dataCleaning, disposalRequired: '是', cardQuantity: machine.quantity,
    requestedScrapQuantity: machine.quantity, cardOriginalValue: machine.originalValue, cardNetValue: machine.netValue };
  saveScrapPrototypeRecords('scrap', [{ id: 'scrap-approved-shanghai', applicationNo: 'BF-CASE-SH',
    documentStatus: '已审批', assetsSnapshot: [source] }]);
  saveScrapPrototypeRecords('crossCompany', []);
  saveScrapPrototypeRecords('accounting', []);
  const candidate = getAccountingCandidates({ ...accountingAccess, company: source.company })
    .find((asset) => asset.tagNo === source.tagNo);
  saveScrapPrototypeRecords('disposal', []);
  saveScrapPrototypeRecords('accounting', [{ id: 'accounting-shanghai', applicationNo: 'ZMBF-CASE-SH',
    documentStatus: '审批中', company: source.company, assetScope: '机房资产', currentNode: '提单人确认',
    assetsSnapshot: [candidate] }]);
  render(<ScrapPrototypeModule type="accounting" accountingActor={accountingAccess.actor}
    accountingAuthorizationScopes={accountingAccess.authorizationScopes} />);
  fireEvent.click(screen.getByRole('button', { name: '执行账面报废' }));
  expect(getScrapPrototypeRecords('disposal')).toHaveLength(expectedCount);
  expect(getScrapPrototypeRecords('accounting')[0].assetsSnapshot[0].status).toBe(expectedStatus);
  expect(getDisposalCandidates().some((asset) => asset.tagNo === source.tagNo)).toBe(dataCleaning === '是');
});

test('机房处置节点只包含实际协办，非北京无需清洗不允许创建流程', () => {
  expect(getDisposalApprovalNodes({ assetScope: '机房资产', region: '北京', needsCleaning: '否' }))
    .toEqual(['采购专员协办', 'ES专员协办']);
  expect(getDisposalApprovalNodes({ assetScope: '机房资产', region: '非北京', needsCleaning: '是' }))
    .toEqual(['数据清洗']);
  expect(() => getDisposalApprovalNodes({ assetScope: '机房资产', region: '非北京', needsCleaning: '否' }))
    .toThrow('不生成处置单');
  expect(() => getDisposalApprovalNodes({ assetScope: '软件' })).toThrow('不生成处置单');
});

test('跨公司转移提交后直接进入审批页面，不返回列表', async () => {
  render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '创建跨公司转移申请单' }));
  fireEvent.click(screen.getByRole('button', { name: '提交申请' }));

  expect(await screen.findByText('跨公司转移审批页面')).toBeInTheDocument();
  expect(screen.getByTestId('approval-document-status')).toHaveTextContent('审批中');
  expect(screen.getByTestId('approval-record-count')).toHaveTextContent('1');
  expect(screen.queryByRole('button', { name: '创建跨公司转移申请单' })).not.toBeInTheDocument();
  const submitted = getScrapPrototypeRecords('crossCompany')[0];
  expect(submitted.documentStatus).toBe('审批中');
  expect(submitted.approvalHistory).toHaveLength(1);
  expect(submitted.approvalHistory[0]).toMatchObject({ node: '发起人提交', result: '提交' });
});

test('跨公司转移审批完成后进入待报废池，调账资产进入账面报废候选', async () => {
  const asset = SCRAP_ASSET_POOL.find((item) => item.scope === '办公设备');
  const record = {
    id: 'cross-company-case',
    applicationNo: 'CT-CASE-001',
    documentStatus: '审批中',
    assetScope: '办公设备',
    currentNode: 'ES主管确认',
    assetsSnapshot: [{ ...asset, newCompany: '115.新媒体-上海', scrapMethod: '调账' }],
    formSnapshot: { assetScope: '办公设备', currentNode: 'ES主管确认' },
  };
  saveScrapPrototypeRecords('crossCompany', [record]);
  const sourceAccess = { actor: accountingAccess.actor,
    authorizationScopes: [{ company: asset.company, plates: '*' }], company: asset.company };
  expect(getAccountingCandidates(sourceAccess).some((item) => item.tagNo === asset.tagNo)).toBe(false);
  render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));

  await waitFor(() => expect(getScrapPrototypeRecords('crossCompany')[0].documentStatus).toBe('已完成'));
  expect(getScrapPrototypeRecords('crossCompany')[0].approvalHistory[0].opinion).toBe('同意');
  expect(getScrapPrototypeRecords('crossCompany')[0].serviceNotification).toMatchObject({
    channel: '服务号',
    recipientRole: '对应账面报废发起人',
    trigger: '跨公司转移审批完成',
  });
  expect(getAccountingCandidates(sourceAccess).find((item) => item.tagNo === asset.tagNo).sourceBusinessNo).toBe('CT-CASE-001');
  expect(getDisposalCandidates().some((item) => item.tagNo === asset.tagNo)).toBe(false);
});

test('机房跨公司转移完成后通知申请人及审批人', async () => {
  const asset = SCRAP_ASSET_POOL.find((item) => item.scope === '机房资产');
  saveScrapPrototypeRecords('crossCompany', [{
    id: 'machine-transfer-notice',
    applicationNo: 'CT-MACHINE-NOTICE',
    documentStatus: '审批中',
    assetScope: '机房资产',
    currentNode: '责任人7级及以上直属领导',
    assetsSnapshot: [{ ...asset, newCompany: '115.新媒体-上海', scrapMethod: '调账' }],
    formSnapshot: { assetScope: '机房资产', currentNode: '责任人7级及以上直属领导' },
  }]);

  render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));

  await waitFor(() => expect(getScrapPrototypeRecords('crossCompany')[0].documentStatus).toBe('已完成'));
  expect(getScrapPrototypeRecords('crossCompany')[0].serviceNotification).toMatchObject({
    channel: '服务号',
    recipientRole: '申请人及审批人',
    trigger: '跨公司转移审批完成',
  });
});

test('非调账资产完成账面报废后进入待处置池', () => {
  const asset = SCRAP_ASSET_POOL.find((item) => item.scope === '办公设备');
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-case',
    applicationNo: 'ZMBF-CASE-001',
    documentStatus: '已完成',
    lastModifiedAt: '2026-09-23 12:00:00',
    assetsSnapshot: [{ ...asset, scrapMethod: '全部报废', disposedComplete: '否', disposalRequired: '是' }],
  }]);

  const disposal = getDisposalCandidates().find((item) => item.tagNo === asset.tagNo);
  expect(disposal.sourceAccountingNo).toBe('ZMBF-CASE-001');
  expect(disposal.disposalStatus).toBe('待处置');
});

test('账面报废财务审批为单人串行，普通范围固定冯丽婷张洁徐博，上海广州非视频走特殊映射', () => {
  const ordinary = getAccountingApprovalSteps([{
    company: '114.新媒体',
    plate: '17.Corporate',
    majorCategory: 'OFFICE EQUIPMENT',
    scrapMethod: '非调账',
    scrapType: '未到报废期',
  }]);
  const ordinaryFinance = ordinary.filter((step) => step.node.startsWith('财务'));
  expect(ordinaryFinance).toEqual([
    expect.objectContaining({ node: '财务初审', approverName: '冯丽婷', skipped: false }),
    expect.objectContaining({ node: '财务三级审批', approverName: '冯丽婷', skipped: false }),
    expect.objectContaining({ node: '财务二级审批', approverName: '张洁', skipped: false }),
    expect.objectContaining({ node: '财务一级审批', approverName: '徐博', skipped: false }),
  ]);

  const sh = getAccountingApprovalSteps([{
    company: '115.新媒体-上海',
    plate: '17.Corporate',
    majorCategory: 'OFFICE EQUIPMENT',
    scrapMethod: '非调账',
    scrapType: '未到报废期',
  }]).filter((step) => step.node.startsWith('财务'));
  expect(sh).toEqual([
    expect.objectContaining({ node: '财务初审', approverName: '姜艳' }),
    expect.objectContaining({ node: '财务三级审批', approverName: '姜艳' }),
    expect.objectContaining({ node: '财务二级审批', approverName: '包亦未' }),
  ]);
  expect(sh.some((step) => step.node === '财务一级审批')).toBe(false);

  const gz = getAccountingApprovalSteps([{
    company: '116.新媒体-广州',
    plate: '17.Corporate',
    majorCategory: 'OFFICE EQUIPMENT',
    scrapMethod: '非调账',
    scrapType: '未到报废期',
  }]).filter((step) => step.node.startsWith('财务'));
  expect(gz.map((step) => [step.node, step.approverName])).toEqual([
    ['财务初审', '黄青华'],
    ['财务三级审批', '黄青华'],
    ['财务二级审批', '易志群'],
  ]);

  const shVideo = getAccountingApprovalSteps([{
    company: '115.新媒体-上海',
    plate: '16.视频',
    majorCategory: 'PC',
    scrapMethod: '非调账',
    scrapType: '未到报废期',
  }]).filter((step) => step.node.startsWith('财务'));
  expect(shVideo.map((step) => step.approverName)).toEqual(['冯丽婷', '冯丽婷', '张洁', '徐博']);
});

test('缺少真实审批人映射时账面报废流程停在当前节点，不虚构审批通过', () => {
  const record = getScrapPrototypeRecords('accounting')[0];
  saveScrapPrototypeRecords('accounting', [record]);
  render(<ScrapPrototypeModule type="accounting" />);

  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('accounting')[0].currentNode).toBe(record.currentNode);
  expect(getScrapPrototypeRecords('accounting')[0].documentStatus).toBe('审批中');
  expect(getScrapPrototypeRecords('accounting')[0].approvalHistory).toEqual(record.approvalHistory);
});

test('财务终审后仍是审批中，提单人确认可驳回或确认执行', () => {
  const approved = getAccountingCandidates({ ...ACCOUNTING_DEMO_ACCESS, company: '114.新媒体' })
    .find((item) => item.scrapMethod === '非调账');
  const record = {
    id: 'accounting-final-approval', applicationNo: 'ZMBF-FINAL-001', documentStatus: '审批中',
    currentNode: '财务一级审批', company: '114.新媒体', creator: '演示提单人',
    assetsSnapshot: [approved], approvalHistory: [],
  };
  saveScrapPrototypeRecords('accounting', [record]);
  const mapping = { '财务一级审批': 'finance-1' };
  render(<ScrapPrototypeModule type="accounting" accountingActor={ACCOUNTING_DEMO_ACCESS.actor}
    accountingAuthorizationScopes={ACCOUNTING_DEMO_ACCESS.authorizationScopes}
    accountingApproverMappings={mapping} />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('accounting')[0]).toMatchObject({
    documentStatus: '审批中', currentNode: '提单人确认',
  });
  fireEvent.click(screen.getByRole('button', { name: '执行账面报废' }));
  expect(getScrapPrototypeRecords('accounting')[0]).toMatchObject({
    documentStatus: '已完成', currentNode: '流程结束',
  });
  expect(getScrapPrototypeRecords('accounting')[0].approvalHistory).toEqual(expect.arrayContaining([
    expect.objectContaining({ node: '提单人确认', result: '确认并执行' }),
  ]));
});

test('提单人确认驳回后退回发起人，保留审批意见', () => {
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-confirm-reject', applicationNo: 'ZMBF-REJECT-001',
    company: '114.新媒体', creator: '演示提单人', documentStatus: '审批中',
    currentNode: '提单人确认', assetsSnapshot: [], approvalHistory: [],
  }]);
  render(<ScrapPrototypeModule type="accounting" />);
  fireEvent.click(screen.getByRole('button', { name: '提单人驳回' }));
  expect(getScrapPrototypeRecords('accounting')[0]).toMatchObject({
    documentStatus: '已驳回', currentNode: '发起人修改',
    approvalHistory: [expect.objectContaining({ node: '提单人确认', person: '演示提单人', opinion: '请修改' })],
  });
});

test('办公设备报废经过鉴定和主管确认后进入账面报废候选', () => {
  const asset = SCRAP_ASSET_POOL.find((item) => item.scope === '办公设备' && item.majorCategory === 'PC');
  expect(asset).toBeDefined();
  saveScrapPrototypeRecords('scrap', [{
    id: 'scrap-case',
    applicationNo: 'BF-CASE-001',
    documentStatus: '审批中',
    assetScope: '办公设备',
    currentNode: 'MIS鉴定',
    assetsSnapshot: [{ ...asset, scrapMethod: '全部报废', cardQuantity: asset.quantity,
      requestedScrapQuantity: asset.quantity, cardOriginalValue: asset.originalValue,
      cardNetValue: asset.netValue }],
    formSnapshot: { assetScope: '办公设备', currentNode: 'MIS鉴定' },
  }]);
  render(<ScrapPrototypeModule type="scrap" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('scrap')[0].currentNode).toBe('ES主管确认');
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('scrap')[0].documentStatus).toBe('已审批');
  expect(getScrapPrototypeRecords('scrap')[0].serviceNotification).toMatchObject({
    channel: '服务号',
    recipientRole: '对应账面报废发起人',
    trigger: '资产报废审批完成',
  });
  const sourceAccess = { actor: accountingAccess.actor,
    authorizationScopes: [{ company: asset.company, plates: '*' }], company: asset.company };
  expect(getAccountingCandidates(sourceAccess).find((item) => item.tagNo === asset.tagNo).sourceBusinessNo).toBe('BF-CASE-001');
});

test('软件资产报废流程结束后通知对应账面报废发起人', async () => {
  const asset = SCRAP_ASSET_POOL.find((item) => item.scope === '软件');
  saveScrapPrototypeRecords('scrap', [{
    id: 'scrap-software-notification',
    applicationNo: 'BF-SOFTWARE-NOTIFY',
    documentStatus: '审批中',
    assetScope: '软件',
    currentNode: '7级及以上直属领导',
    assetsSnapshot: [{ ...asset, scrapMethod: '全部报废' }],
    formSnapshot: { assetScope: '软件', currentNode: '7级及以上直属领导' },
    approvalHistory: [],
  }]);

  render(<ScrapPrototypeModule type="scrap" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));

  await waitFor(() => expect(getScrapPrototypeRecords('scrap')[0].documentStatus).toBe('已审批'));
  expect(getScrapPrototypeRecords('scrap')[0].serviceNotification).toMatchObject({
    channel: '服务号',
    recipientRole: '对应账面报废发起人',
    trigger: '资产报废审批完成',
  });
});

test('模拟刷新后恢复初始Mock数据并忽略旧版本地缓存', () => {
  const initial = getScrapPrototypeRecords('crossCompany');
  const submittedTestRecord = {
    ...initial[0],
    id: 'crossCompany-refresh-test',
    applicationNo: 'CT-TEST-ONLY',
    documentStatus: '审批中',
  };
  window.localStorage.setItem(
    'asset_scrap_prototype_crossCompany_v1',
    JSON.stringify([submittedTestRecord]),
  );

  resetScrapPrototypeMemory();

  const refreshed = getScrapPrototypeRecords('crossCompany');
  expect(refreshed.map((record) => record.applicationNo))
    .toEqual(initial.map((record) => record.applicationNo));
  expect(refreshed.some((record) => record.applicationNo === 'CT-TEST-ONLY')).toBe(false);
});
