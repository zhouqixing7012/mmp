import {
  FOUNDATION_PRD_MODULES,
} from './employee-self-service-foundation-annotations';
import {
  applyPersonalWorkbenchAnnotationAudit,
  applyPersonalWorkbenchCoverageAudit,
} from './personal-workbench-prd-audit';
import {
  PERSONAL_WORKBENCH_REVIEW_SCOPES,
  applyPersonalWorkbenchReviewAnnotations,
  applyPersonalWorkbenchReviewCoverage,
} from './personal-workbench-review-resolutions';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

function getBaseModule() {
  return FOUNDATION_PRD_MODULES.find((item) => item.id === 'personal-workbench');
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('个人工作台评审确认后36条规则不再保留review', () => {
  const module = getBaseModule();
  const coverage = applyPersonalWorkbenchReviewCoverage(
    applyPersonalWorkbenchCoverageAudit(module.coverageByScope)
  );
  const requirements = flatten(coverage);

  expect(requirements).toHaveLength(36);
  expect(requirements.filter((item) => item.status === 'review')).toHaveLength(0);
  expect(Object.keys(coverage).sort()).toEqual(Object.values(PERSONAL_WORKBENCH_REVIEW_SCOPES).sort());
});

test('人员显隐、实时锁、刷新规则保留为研发规则但不要求前端原型模拟', () => {
  const module = getBaseModule();
  const coverage = flatten(applyPersonalWorkbenchReviewCoverage(
    applyPersonalWorkbenchCoverageAudit(module.coverageByScope)
  ));
  const byId = new Map(coverage.map((item) => [item.id, item]));

  ['WB-001', 'WB-003', 'WB-005', 'WB-010', 'WB-013', 'WB2-001', 'WB2-006', 'WB2-009', 'WB2-011', 'WB2-012', 'WB2-017', 'WB2-023']
    .forEach((id) => expect(byId.get(id)?.status).toBe('bound'));
});

test('待审批、已审批、已申请进入独立页面scope并通过标注质量门', () => {
  const module = getBaseModule();
  const annotations = applyPersonalWorkbenchReviewAnnotations(
    applyPersonalWorkbenchAnnotationAudit(module.annotationsByScope)
  );
  const coverage = applyPersonalWorkbenchReviewCoverage(
    applyPersonalWorkbenchCoverageAudit(module.coverageByScope)
  );

  [
    PERSONAL_WORKBENCH_REVIEW_SCOPES.pending,
    PERSONAL_WORKBENCH_REVIEW_SCOPES.approved,
    PERSONAL_WORKBENCH_REVIEW_SCOPES.applied,
  ].forEach((scope) => {
    expect(annotations[scope]?.length).toBeGreaterThan(0);
    expect(coverage[scope]?.length).toBeGreaterThan(0);
    expect(validateAnnotationGranularity(annotations[scope])).toEqual([]);
    expect(validateRequirementCoverage(coverage[scope], annotations[scope])).toEqual([]);
  });
});
