import assetBorrowingAnnotationsByScope, { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { assetBorrowingRequirementCoverageByScope } from './asset-borrowing-annotation-coverage';
import {
  applyAssetBorrowingAnnotationAudit,
  applyAssetBorrowingCoverageAudit,
} from './asset-borrowing-prd-audit';

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('资产借用第二轮深审覆盖五个页面并保持106条最小规则', () => {
  const audited = applyAssetBorrowingCoverageAudit(assetBorrowingRequirementCoverageByScope);
  expect(Object.keys(audited)).toEqual(expect.arrayContaining(Object.values(ASSET_BORROWING_SCOPES)));
  expect(flatten(audited)).toHaveLength(106);
});

test('第一轮过度乐观的真实副作用规则会降级为review', () => {
  const audited = flatten(applyAssetBorrowingCoverageAudit(assetBorrowingRequirementCoverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['BA-AP-003', 'BA-AP-015', 'BA-AU-005', 'BA-AU-006', 'BA-IS-013', 'BA-IS-015'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
    expect(byId.get(id)?.reason).toBeTruthy();
  });
});

test('到期提醒与真实出库副作用均保留为独立review规则', () => {
  const audited = flatten(applyAssetBorrowingCoverageAudit(assetBorrowingRequirementCoverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['BA2-AP-009', 'BA2-AP-010', 'BA2-AP-011', 'BA2-AP-012'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
  });

  ['BA2-IS-007', 'BA2-IS-008', 'BA2-IS-009', 'BA2-IS-010', 'BA2-IS-011'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
  });
});

test('第二轮新增标注仍使用细粒度页面目标', () => {
  const audited = applyAssetBorrowingAnnotationAudit(assetBorrowingAnnotationsByScope);
  const annotations = flatten(audited);
  const byId = new Map(annotations.map((item) => [item.id, item]));

  expect(byId.get('borrowing-audit-outbound-effects')?.target).toContain('::button::');
  expect(byId.get('borrowing-audit-confirm-manual')?.target).toContain('::button::');
  expect(byId.get('borrowing-audit-reminder-schedule')?.target).toContain('::table-column::');
});
