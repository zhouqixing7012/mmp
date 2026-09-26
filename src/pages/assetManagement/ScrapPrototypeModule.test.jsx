import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScrapPrototypeModule from './ScrapPrototypeModule';
import {
  getAccountingCandidates,
  getDisposalCandidates,
  getScrapPrototypeRecords,
  saveScrapPrototypeRecords,
} from '../../services/scrapPrototypeService';
import { SCRAP_ASSET_POOL } from './scrapPrototypeData';

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
        <button type="button" onClick={() => onExecute(records.find((record) => record.documentStatus === '待提单人确认'))}>
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
    return <div>
      {approvalPage && <span>跨公司转移审批页面</span>}
      <button type="button" onClick={() => onSave(initialForm, initialAssets, false)}>保存草稿</button>
      <button type="button" onClick={() => onSave(initialForm, initialAssets, true)}>提交申请</button>
    </div>;
  };
});

beforeEach(() => window.localStorage.clear());

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

test('资产处置展示机房自动单、办公手动单以及软件和丢失的无实物单', () => {
  render(<ScrapPrototypeModule type="disposal" />);
  const rows = getScrapPrototypeRecords('disposal');
  expect(rows.some((row) => row.assetScope === '机房资产' && row.creator === '采购专员')).toBe(true);
  expect(rows.some((row) => row.assetScope === '办公设备' && row.creator === 'ES专员')).toBe(true);
  expect(rows.some((row) => row.assetScope === '软件' && row.disposalMode === '无实物处置')).toBe(true);
  expect(rows.some((row) => row.assetsSnapshot.some((asset) => asset.scrapType === '丢失') && row.disposalMode === '无实物处置')).toBe(true);
});

test('账面报废完成时自动生成机房和无实物处置单，办公实物资产等待手动建单', () => {
  const candidates = getAccountingCandidates();
  const machine = candidates.find((asset) => asset.scope === '机房资产' && asset.scrapMethod !== '调账');
  const software = candidates.find((asset) => asset.scope === '软件');
  const lost = candidates.find((asset) => asset.scrapType === '丢失');
  const office = candidates.find((asset) => asset.scope === '办公设备' && asset.scrapType !== '丢失');
  saveScrapPrototypeRecords('disposal', []);
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-auto-disposal', applicationNo: 'ZMBF20260926000099', documentStatus: '待提单人确认',
    assetScope: '混合', currentNode: '提单人确认',
    assetsSnapshot: [machine, software, lost, office],
  }]);
  render(<ScrapPrototypeModule type="accounting" />);
  fireEvent.click(screen.getByRole('button', { name: '执行账面报废' }));
  const rows = getScrapPrototypeRecords('disposal');
  expect(rows).toHaveLength(3);
  expect(rows.map((row) => row.disposalMode)).toEqual(['实物处置', '无实物处置', '无实物处置']);
  expect(rows.every((row) => row.creator === '系统自动')).toBe(true);
});

test('跨公司转移提交后直接进入审批页面，不返回列表', async () => {
  render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '创建跨公司转移申请单' }));
  fireEvent.click(screen.getByRole('button', { name: '提交申请' }));

  expect(await screen.findByText('跨公司转移审批页面')).toBeInTheDocument();
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
  render(<ScrapPrototypeModule type="crossCompany" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));

  await waitFor(() => expect(getScrapPrototypeRecords('crossCompany')[0].documentStatus).toBe('已完成'));
  expect(getScrapPrototypeRecords('crossCompany')[0].approvalHistory[0].opinion).toBe('同意');
  expect(getAccountingCandidates().find((item) => item.tagNo === asset.tagNo).sourceBusinessNo).toBe('CT-CASE-001');
  expect(getDisposalCandidates().some((item) => item.tagNo === asset.tagNo)).toBe(false);
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

test('账面报废按条件审批后才允许提单人执行', () => {
  const record = getScrapPrototypeRecords('accounting')[0];
  saveScrapPrototypeRecords('accounting', [record]);
  render(<ScrapPrototypeModule type="accounting" />);

  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('accounting')[0].currentNode).toBe('NO部门7级及以上领导');
  expect(getScrapPrototypeRecords('accounting')[0].documentStatus).toBe('审批中');

  let approvals = 0;
  while (getScrapPrototypeRecords('accounting')[0].documentStatus === '审批中' && approvals < 10) {
    fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
    approvals += 1;
  }
  expect(getScrapPrototypeRecords('accounting')[0].documentStatus).toBe('待提单人确认');
  fireEvent.click(screen.getByRole('button', { name: '执行账面报废' }));
  expect(getScrapPrototypeRecords('accounting')[0].documentStatus).toBe('已完成');
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
    assetsSnapshot: [{ ...asset, scrapMethod: '全部报废' }],
    formSnapshot: { assetScope: '办公设备', currentNode: 'MIS鉴定' },
  }]);
  render(<ScrapPrototypeModule type="scrap" />);
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('scrap')[0].currentNode).toBe('ES主管确认');
  fireEvent.click(screen.getByRole('button', { name: '审批通过' }));
  expect(getScrapPrototypeRecords('scrap')[0].documentStatus).toBe('已审批');
  expect(getAccountingCandidates().find((item) => item.tagNo === asset.tagNo).sourceBusinessNo).toBe('BF-CASE-001');
});
