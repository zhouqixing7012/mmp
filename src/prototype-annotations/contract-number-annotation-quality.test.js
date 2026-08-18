import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import {
  CONTRACT_NUMBER_SCOPES,
  CONTRACT_WAREHOUSE_SCOPE,
  contractNumberRequirementCoverageByScope,
} from './contract-number-annotation-coverage';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

describe('contract number annotation quality gate', () => {
  test('合约号码申请六个页面均已注册基线标注', () => {
    Object.values(CONTRACT_NUMBER_SCOPES).forEach((pageScope) => {
      expect(contractNumberAnnotationsByScope[pageScope]?.length).toBeGreaterThan(0);
    });
  });

  test('库管员领用确认和弃领分别绑定到对应按钮', () => {
    const annotations = contractNumberAnnotationsByScope[CONTRACT_WAREHOUSE_SCOPE];
    const claim = annotations.find((note) => note.id === 'contract-warehouse-claim-action');
    const abandon = annotations.find((note) => note.id === 'contract-warehouse-abandon-action');

    expect(claim.kind).toBe('action-rule');
    expect(claim.target).toContain('::button::e9a286e794a8e7a1aee8aea4');
    expect(abandon.kind).toBe('action-rule');
    expect(abandon.target).toContain('::button::e5bc83e9a286');
  });

  test('备注规则绑定到备注字段而不是模块', () => {
    const annotations = contractNumberAnnotationsByScope[CONTRACT_WAREHOUSE_SCOPE];
    const noteRule = annotations.find((note) => note.id === 'contract-warehouse-note-rule');

    expect(noteRule.kind).toBe('field-rule');
    expect(noteRule.target).toContain('::detail-field::e5a487e6b3a8');
  });

  test('所有页面具体规则不存在模块级误绑定', () => {
    Object.values(CONTRACT_NUMBER_SCOPES).forEach((pageScope) => {
      expect(validateAnnotationGranularity(contractNumberAnnotationsByScope[pageScope] || [])).toEqual([]);
    });
  });

  test('六个页面的 PRD 重点全部有 bound/review/skip 明确去向', () => {
    Object.values(CONTRACT_NUMBER_SCOPES).forEach((pageScope) => {
      const annotations = contractNumberAnnotationsByScope[pageScope] || [];
      const coverage = contractNumberRequirementCoverageByScope[pageScope] || [];
      expect(coverage.length).toBeGreaterThan(0);
      expect(validateRequirementCoverage(coverage, annotations)).toEqual([]);
    });
  });

  test('当前实现差异不会被静默当成已完成', () => {
    const reviewItems = Object.values(contractNumberRequirementCoverageByScope)
      .flat()
      .filter((item) => item.status === 'review');

    expect(reviewItems.length).toBeGreaterThan(0);
    reviewItems.forEach((item) => {
      expect(item.reason).toBeTruthy();
      expect(item.rule).toBeTruthy();
    });
  });
});
