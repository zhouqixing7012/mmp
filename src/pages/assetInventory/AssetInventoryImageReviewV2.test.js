jest.mock('antd', () => ({}));
import { buildReviewRows } from './AssetInventoryImageReviewV2';
import { savePhotoReviewResult } from './inventoryPhotoReviewStore';

beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); });

test('公共与库房待审核保持真实范围，机房不纳入人工审核', () => {
  ['公共', '库房', '机房'].forEach(range => savePhotoReviewResult('P1', {
    assetTag: 'TEST-' + range, inventoryRange: range, status: '审核中', owner: '责任人', description: '资产',
  }));
  const rows = buildReviewRows('P1', ['公共', '库房', '机房']);
  expect(rows.filter(row => row.asset.assetTag.startsWith('TEST-')).map(row => row.asset.inventoryRange)).toEqual(['公共', '库房']);
  expect(rows.some(row => row.asset.inventoryRange === '机房')).toBe(false);
  expect(buildReviewRows('P1', ['员工']).some(row => row.asset.assetTag.startsWith('TEST-'))).toBe(false);
});

test('审核记录缺少范围且标签未在PC清单中时不猜员工范围', () => {
  savePhotoReviewResult('P1', { assetTag: 'UNKNOWN', status: '审核中' });
  expect(buildReviewRows('P1', ['员工']).some(row => row.asset.assetTag === 'UNKNOWN')).toBe(false);
});

test('审核完成后再次进入仍显示结论，不重新变成待审核', () => {
  savePhotoReviewResult('P1', { assetTag: 'TEST-public', inventoryRange: '公共', status: '已盘' });
  const row = buildReviewRows('P1', ['公共']).find(row => row.asset.assetTag === 'TEST-public');
  expect(row.reviewStatus).toBe('审核通过');
  expect(row.asset.inventoryStatus).toBe('已盘');
});
