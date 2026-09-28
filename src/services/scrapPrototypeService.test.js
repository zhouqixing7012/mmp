import {
  getAccountingCandidates,
  getAccountingLostCandidates,
  getDisposalCandidates,
  getScrapPrototypeRecords,
  resetScrapPrototypeMemory,
  saveScrapPrototypeRecords,
  validateAccountingAssets,
} from './scrapPrototypeService';

const actor = { id: 'verified-accountant' };
const authorizationScopes = [{ company: '114.新媒体', plates: ['17_Corporate'] }];
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
      id: 'asset-1', tagNo: 'TAG-1', company: '114.新媒体', plate: '17_Corporate',
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
    assetsSnapshot: [{ id: 'old', tagNo: 'OLD', company: '114.新媒体', plate: '17_Corporate', quantity: 1 }],
  }]);
  saveScrapPrototypeRecords('accounting', []);
  expect(getAccountingCandidates(auth)).toEqual([]);
});

test('validation verifies source workflow and excludes only the current accounting record from occupation', () => {
  const sourceAsset = {
    id: 'asset-source', tagNo: 'TAG-SOURCE', company: '114.新媒体', plate: '17_Corporate',
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
    tagNo: 'INVALID', company: '114.新媒体', plate: '17_Corporate', scrapMethod: '非调账',
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

test('software and lost assets never enter disposal candidates', () => {
  saveScrapPrototypeRecords('accounting', [{
    id: 'accounting-done', applicationNo: 'ZMBF-1', documentStatus: '已完成',
    assetsSnapshot: [
      { id: 'software', tagNo: 'SW', scope: '软件', scrapMethod: '非调账', disposalRequired: '是' },
      { id: 'lost', tagNo: 'LOST', scope: '办公设备', scrapType: '丢失', scrapMethod: '非调账', disposalRequired: '是' },
    ],
  }]);
  const tags = getDisposalCandidates().map((asset) => asset.tagNo);
  expect(tags).not.toContain('SW');
  expect(tags).not.toContain('LOST');
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

test('demo pools keep enough unused candidates for manual accounting and disposal flows', () => {
  saveScrapPrototypeRecords('accounting', []);
  const accountingTags = getAccountingCandidates(auth).map((asset) => asset.tagNo);
  expect(accountingTags).toEqual(expect.arrayContaining([
    'DEMO-FA-000201',
    'DEMO-FA-000202',
    'DEMO-SV-000210',
    'DEMO-NW-000212',
  ]));
  expect(accountingTags.length).toBeGreaterThanOrEqual(7);

  const disposalTags = getDisposalCandidates().map((asset) => asset.tagNo);
  expect(disposalTags.filter((tagNo) => String(tagNo).startsWith('DEMO-')).length)
    .toBeGreaterThanOrEqual(10);
});

