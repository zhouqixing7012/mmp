import {
  getAccountingCandidates,
  getAccountingLostCandidates,
  getDisposalCandidates,
  getScrapPrototypeRecords,
  prepareScrapAsset,
  resetScrapPrototypeMemory,
  saveScrapPrototypeRecords,
  validateAccountingAssets,
  validateDisposalAssets,
  validateScrapAssets,
} from './scrapPrototypeService';

const actor = { id: 'verified-accountant' };
const authorizationScopes = [{ company: '114.新媒体', plates: ['17.Corporate'] }];
const auth = { actor, authorizationScopes };

beforeEach(() => {
  window.localStorage.clear();
  resetScrapPrototypeMemory();
  saveScrapPrototypeRecords('crossCompany', []);
});

test('accounting candidates fail closed without explicit actor authorization', () => {
  expect(getAccountingCandidates()).toEqual([]);
  expect(getAccountingLostCandidates()).toEqual([]);
  expect(validateAccountingAssets({ company: '114.新媒体' }, [{ company: '114.新媒体' }]).valid).toBe(false);
});

test('authorized user can save an empty draft, but cannot submit it', () => {
  expect(validateAccountingAssets({ company: '' }, [], { ...auth, draft: true }).valid).toBe(true);
  expect(validateAccountingAssets({ company: '' }, [], auth).valid).toBe(false);
});

test('asset-scrap quantity derives all/partial and prorated accounting values', () => {
  saveScrapPrototypeRecords('scrap', [{
    id: 'scrap-source', applicationNo: 'BF-1', documentStatus: '已审批',
    assetsSnapshot: [{
      id: 'asset-1', tagNo: 'TAG-1', company: '114.新媒体', plate: '17.Corporate',
      scope: '办公设备', requestedScrapQuantity: 2, cardQuantity: 5,
      cardOriginalValue: 1000, cardNetValue: 250, scrapType: '已到报废期',
    }],
  }]);
  saveScrapPrototypeRecords('accounting', []);

  expect(getAccountingCandidates(auth)).toEqual([expect.objectContaining({
    quantity: 2,
    requestedScrapQuantity: 2,
    cardQuantity: 5,
    detailScrapMethod: '部分报废',
    originalValue: 400,
    netValue: 100,
    scrapType: '未到报废期',
  })]);
});

test('ambiguous old source quantity is excluded instead of guessed', () => {
  saveScrapPrototypeRecords('scrap', [{
    id: 'old-source', applicationNo: 'BF-OLD', documentStatus: '已审批',
    assetsSnapshot: [{ id: 'old', tagNo: 'OLD', company: '114.新媒体', plate: '17.Corporate', quantity: 1 }],
  }]);
  saveScrapPrototypeRecords('accounting', []);
  expect(getAccountingCandidates(auth)).toEqual([]);
});

test('validation verifies source workflow and excludes only the current accounting record from occupation', () => {
  const sourceAsset = {
    id: 'asset-source', tagNo: 'TAG-SOURCE', company: '114.新媒体', plate: '17.Corporate',
    scope: '办公设备', requestedScrapQuantity: 1, cardQuantity: 2,
    cardOriginalValue: 1000, cardNetValue: 100,
  };
  saveScrapPrototypeRecords('scrap', [{
    id: 'scrap-valid', applicationNo: 'BF-VALID', documentStatus: '已审批', assetsSnapshot: [sourceAsset],
  }]);
  saveScrapPrototypeRecords('accounting', []);
  const candidate = getAccountingCandidates(auth)[0];
  saveScrapPrototypeRecords('accounting', [{
    id: 'current-accounting', applicationNo: 'ZMBF-CURRENT', documentStatus: '草稿', assetsSnapshot: [candidate],
  }]);

  expect(validateAccountingAssets(
    { company: '114.新媒体', scrapMethod: '非调账' },
    [candidate],
    { ...auth, recordId: 'current-accounting' },
  )).toEqual({ valid: true, errors: [] });
  expect(validateAccountingAssets(
    { company: '114.新媒体', scrapMethod: '非调账' },
    [candidate],
    auth,
  ).errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'ASSET_OCCUPIED' })]));
});

test('validation rejects invalid source, lost asset with prior workflow, and lost transfer', () => {
  const invalidSource = {
    tagNo: 'INVALID', company: '114.新媒体', plate: '17.Corporate', scrapMethod: '非调账',
    detailScrapMethod: '全部报废', scrapType: '未到报废期', sourceBusinessType: '资产报废',
    sourceBusinessNo: 'BF-NOT-FOUND', requestedScrapQuantity: 1, cardQuantity: 1,
  };
  const lostTransfer = {
    ...invalidSource, tagNo: 'LOST-TRANSFER', scrapMethod: '调账', detailScrapMethod: '调账',
    scrapType: '丢失', sourceBusinessType: '跨公司转移',
  };
  saveScrapPrototypeRecords('accounting', []);
  const result = validateAccountingAssets(
    { company: '114.新媒体', scrapMethod: '调账' },
    [invalidSource, lostTransfer],
    auth,
  );
  expect(result.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'INVALID_SOURCE_BUSINESS' }),
    expect.objectContaining({ code: 'TRANSFER_CANNOT_BE_LOST' }),
    expect.objectContaining({ code: 'INVALID_LOST_SOURCE' }),
  ]));
});

test('software, lost and transfer assets never enter disposal candidates', () => {
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-done', applicationNo: 'ZMBF-1', documentStatus: '已完成',
    assetsSnapshot: [
      { id: 'software', tagNo: 'SW', scope: '软件', majorCategory: '17.SOFTWARE', scrapMethod: '非调账' },
      { id: 'lost', tagNo: 'LOST', scope: '办公设备', majorCategory: '11.PC', scrapType: '丢失', scrapMethod: '非调账' },
      { id: 'transfer', tagNo: 'TRANSFER', scope: '办公设备', majorCategory: '11.PC', scrapMethod: '调账' },
      { id: 'office', tagNo: 'OFFICE', scope: '办公设备', majorCategory: '13.OFFICE EQUIPMENT', scrapMethod: '非调账' },
    ],
  }]);
  const tags = getDisposalCandidates().map((asset) => asset.tagNo);
  expect(tags).not.toContain('SW');
  expect(tags).not.toContain('LOST');
  expect(tags).not.toContain('TRANSFER');
  expect(tags).toContain('OFFICE');
});

test('unconfirmed accounting demo assets do not appear in disposal candidates', () => {
  const tags = getDisposalCandidates().map((asset) => asset.tagNo);
  expect(tags).not.toContain('FA-2026-000121');
  expect(tags).not.toContain('FA-2026-000122');
});

test('prototype records stay in memory only and reset restores latest seed data', () => {
  const initialCount = getScrapPrototypeRecords('accounting').length;
  saveScrapPrototypeRecords('accounting', [{ id: 'session-only' }]);
  expect(getScrapPrototypeRecords('accounting')).toEqual([{ id: 'session-only' }]);
  expect(window.localStorage.getItem('asset-scrap-prototype:v2:accounting')).toBeNull();

  resetScrapPrototypeMemory();
  expect(getScrapPrototypeRecords('accounting')).toHaveLength(initialCount);
  expect(getScrapPrototypeRecords('accounting').some((record) => record.id === 'session-only')).toBe(false);
});

test('legacy browser storage does not override repository mock data', () => {
  window.localStorage.setItem('asset-scrap-prototype:v2:accounting', JSON.stringify([
    { id: 'legacy-only', documentStatus: '草稿' },
  ]));
  resetScrapPrototypeMemory();

  const records = getScrapPrototypeRecords('accounting');
  expect(records.some((record) => record.id === 'legacy-only')).toBe(false);
  expect(records.some((record) => record.id === 'acc-1')).toBe(true);
});

test('demo pools keep source-backed unused candidates for manual accounting and disposal flows', () => {
  const accountingTags = getAccountingCandidates(auth).map((asset) => asset.tagNo);
  expect(accountingTags).toEqual(expect.arrayContaining([
    'DEMO-FA-000205',
    'DEMO-FA-000206',
    'DEMO-FA-000209',
    'DEMO-NW-000213',
  ]));
  expect(accountingTags.length).toBeGreaterThanOrEqual(4);

  const completedAccountingNos = new Set(
    getScrapPrototypeRecords('accounting')
      .filter((record) => record.documentStatus === '已完成')
      .map((record) => record.applicationNo),
  );
  const disposalCandidates = getDisposalCandidates();
  expect(disposalCandidates.length).toBeGreaterThanOrEqual(3);
  expect(disposalCandidates.every((asset) => completedAccountingNos.has(asset.sourceAccountingNo))).toBe(true);
});

test('partial scrap calculation keeps scrap and remaining values in one calculation', () => {
  const prepared = prepareScrapAsset({
    tagNo: 'PARTIAL-1',
    scope: '办公设备',
    quantity: 2,
    requestedScrapQuantity: 2,
    cardQuantity: 5,
    cardOriginalValue: 1000,
    cardNetValue: 250,
  });

  expect(prepared).toMatchObject({
    quantity: 2,
    detailScrapMethod: '部分报废',
    originalValue: 400,
    netValue: 100,
    remainingQuantity: 3,
    remainingOriginalValue: 600,
    remainingNetValue: 150,
  });
});

test('scrap validation rejects orphan accessories without their main asset', () => {
  const source = require('../pages/assetManagement/scrapPrototypeData').SCRAP_ASSET_POOL[0];
  const orphan = prepareScrapAsset({
    ...source,
    id: 'orphan-accessory',
    tagNo: source.tagNo,
    parentAssetTag: 'MISSING-MAIN',
    reason: '',
  });
  saveScrapPrototypeRecords('scrap', []);
  saveScrapPrototypeRecords('crossCompany', []);

  const result = validateScrapAssets(
    { assetScope: orphan.scope, assetCategory: orphan.majorCategory },
    [orphan],
    {},
  );
  expect(result.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'ORPHAN_ACCESSORY' }),
  ]));
});

test('disposal candidates require an actually completed accounting source', () => {
  const completed = getScrapPrototypeRecords('accounting')
    .filter((record) => record.documentStatus === '已完成');
  const completedNos = new Set(completed.map((record) => record.applicationNo));
  const candidates = getDisposalCandidates();

  expect(candidates.length).toBeGreaterThan(0);
  expect(candidates.every((asset) => completedNos.has(asset.sourceAccountingNo))).toBe(true);

  saveScrapPrototypeRecords('accounting', completed.map((record) => ({
    ...record,
    documentStatus: '审批中',
  })));
  expect(getDisposalCandidates()).toEqual([]);
});

test('disposal validation rejects invalid accounting source and cross-order occupation', () => {
  resetScrapPrototypeMemory();
  const candidate = getDisposalCandidates()[0];
  expect(candidate).toBeDefined();

  expect(validateDisposalAssets(
    { assetScope: candidate.scope },
    [candidate],
    { recordId: 'new-disposal' },
  )).toEqual({ valid: true, errors: [] });

  saveScrapPrototypeRecords('disposal', [{
    id: 'other-disposal',
    applicationNo: 'CZ-OCCUPIED',
    documentStatus: '草稿',
    assetsSnapshot: [candidate],
  }]);
  expect(validateDisposalAssets(
    { assetScope: candidate.scope },
    [candidate],
    { recordId: 'new-disposal' },
  ).errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'DISPOSAL_ASSET_OCCUPIED' }),
  ]));

  saveScrapPrototypeRecords('disposal', []);
  saveScrapPrototypeRecords('accounting', getScrapPrototypeRecords('accounting').map((record) => (
    record.applicationNo === candidate.sourceAccountingNo
      ? { ...record, documentStatus: '审批中' }
      : record
  )));
  expect(validateDisposalAssets(
    { assetScope: candidate.scope },
    [candidate],
    { recordId: 'new-disposal' },
  ).errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'INVALID_ACCOUNTING_SOURCE' }),
  ]));
});

