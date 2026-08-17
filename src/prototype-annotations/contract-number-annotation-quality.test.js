import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import {
  CONTRACT_WAREHOUSE_SCOPE,
  contractWarehouseRequirementCoverage,
} from './contract-number-annotation-coverage';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

describe('contract number annotation quality gate', () => {
  test('库管员领用确认和弃领分别绑定到对应按钮', () => {
    const annotations = contractNumberAnnotationsByScope[CONTRACT_WAREHOUSE_SCOPE];
    const claim = annotations.find((note) => note.id === 'contract-warehouse-claim-action');
    const abandon = annotations.find((note) => note.id === 'contract-warehouse-abandon-action');

    expect(claim.kind).toBe('action-rule');
    expect(claim.target).toContain('::button::e9a286e794a8e7a1aee8aea4');
    expect(abandon.kind).toBe('action-rule');
    expect(abandon.target).toContain('::button::e5bc83e9a286');
  });

  test('具体规则不存在模块级误绑定', () => {
    const annotations = contractNumberAnnotationsByScope[CONTRACT_WAREHOUSE_SCOPE];
    expect(validateAnnotationGranularity(annotations)).toEqual([]);
  });

  test('库管员 PRD 重点全部有明确覆盖状态', () => {
    const annotations = contractNumberAnnotationsByScope[CONTRACT_WAREHOUSE_SCOPE];
    expect(validateRequirementCoverage(contractWarehouseRequirementCoverage, annotations)).toEqual([]);
  });

  test('当前待确认项不会被静默当成已完成', () => {
    const reviewItems = contractWarehouseRequirementCoverage.filter((item) => item.status === 'review');
    expect(reviewItems.map((item) => item.id)).toEqual(expect.arrayContaining(['CN-WH-002', 'CN-WH-003']));
    reviewItems.forEach((item) => expect(item.reason).toBeTruthy());
  });
});
