import {
  ASSET_REPLACEMENT_SCOPES,
  expandedEmployeeSelfServiceAnnotationsByScope,
  expandedEmployeeSelfServiceCoverageByScope,
} from './employee-self-service-expanded-annotations';
import {
  applyAssetReplacementAnnotationAudit,
  applyAssetReplacementCoverageAudit,
} from './asset-replacement-prd-audit';

function pickScopes(source) {
  return Object.fromEntries(
    Object.values(ASSET_REPLACEMENT_SCOPES).map((scope) => [scope, source[scope] || []])
  );
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('资产更换第二轮深审覆盖四个正式页面并保持106条最小规则', () => {
  const audited = applyAssetReplacementCoverageAudit(
    pickScopes(expandedEmployeeSelfServiceCoverageByScope)
  );

  expect(Object.keys(audited)).toEqual(expect.arrayContaining(Object.values(ASSET_REPLACEMENT_SCOPES)));
  expect(flatten(audited)).toHaveLength(106);
});

test('第一轮过度乐观的组合校验、锁和真实副作用会降级为review', () => {
  const audited = flatten(applyAssetReplacementCoverageAudit(
    pickScopes(expandedEmployeeSelfServiceCoverageByScope)
  ));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['AR-AP-001', 'AR-AP-004', 'AR-MI-003', 'AR-MI-004', 'AR-HD-003', 'AR-HD-007', 'AR-CF-001', 'AR-CF-002']
    .forEach((id) => {
      expect(byId.get(id)?.status).toBe('review');
      expect(byId.get(id)?.reason).toBeTruthy();
    });
});

test('MIS组合、真实入出库、资产锁和台账更新均保留为独立review规则', () => {
  const audited = flatten(applyAssetReplacementCoverageAudit(
    pickScopes(expandedEmployeeSelfServiceCoverageByScope)
  ));
  const byId = new Map(audited.map((item) => [item.id, item]));

  [
    'AR2-MI-002', 'AR2-MI-006', 'AR2-MI-007',
    'AR2-HD-015', 'AR2-HD-016', 'AR2-HD-018', 'AR2-HD-019',
    'AR2-HD-027', 'AR2-HD-028',
    'AR2-HD-038', 'AR2-HD-039', 'AR2-HD-041', 'AR2-HD-042',
    'AR2-CF-006',
  ].forEach((id) => expect(byId.get(id)?.status).toBe('review'));
});

test('第二轮新增标注仍绑定到具体字段、按钮或业务Card', () => {
  const audited = applyAssetReplacementAnnotationAudit(
    pickScopes(expandedEmployeeSelfServiceAnnotationsByScope)
  );
  const annotations = flatten(audited);
  const byId = new Map(annotations.map((item) => [item.id, item]));

  expect(byId.get('replacement-audit-return-inbound')?.target).toContain('::button::');
  expect(byId.get('replacement-audit-new-asset-lock')?.target).toContain('::detail-field::');
  expect(byId.get('replacement-audit-confirm-record')?.target).toContain('::button::');
  expect(byId.get('replacement-audit-mis-result')?.target).toContain('::card::');
});
