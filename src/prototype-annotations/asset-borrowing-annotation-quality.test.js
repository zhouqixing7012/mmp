import assetBorrowingAnnotationsByScope, { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { assetBorrowingRequirementCoverageByScope } from './asset-borrowing-annotation-coverage';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

const EXPECTED_REVIEW_IDS = [
  'BA-AP-005',
  'BA-AP-010',
  'BA-AP-013',
  'BA-AP-016',
  'BA-AL-002',
  'BA-AL-005',
  'BA-AL-006',
  'BA-AL-007',
  'BA-AU-002',
  'BA-AU-003',
  'BA-IS-001',
  'BA-IS-007',
  'BA-IS-008',
  'BA-IS-009',
  'BA-IS-011',
  'BA-IS-012',
  'BA-IS-014',
  'BA-CF-002',
  'BA-CF-005',
  'BA-CF-006',
];

describe('asset borrowing annotation quality gate', () => {
  test('五个借用页面都已注册基线标注', () => {
    Object.values(ASSET_BORROWING_SCOPES).forEach((scope) => {
      expect(assetBorrowingAnnotationsByScope[scope]?.length).toBeGreaterThan(0);
    });
  });

  test('字段/按钮/表头规则都绑定到对应细粒度对象', () => {
    Object.values(ASSET_BORROWING_SCOPES).forEach((scope) => {
      expect(validateAnnotationGranularity(assetBorrowingAnnotationsByScope[scope])).toEqual([]);
    });
  });

  test('每个页面的 PRD 重点都有 bound/review/skip 明确去向', () => {
    Object.values(ASSET_BORROWING_SCOPES).forEach((scope) => {
      const annotations = assetBorrowingAnnotationsByScope[scope] || [];
      const coverage = assetBorrowingRequirementCoverageByScope[scope] || [];
      expect(coverage.length).toBeGreaterThan(0);
      expect(validateRequirementCoverage(coverage, annotations)).toEqual([]);
    });
  });

  test('当前识别出的实现差异不会被静默当成已完成', () => {
    const reviewItems = Object.values(assetBorrowingRequirementCoverageByScope)
      .flat()
      .filter((item) => item.status === 'review');

    expect(reviewItems.map((item) => item.id)).toEqual(expect.arrayContaining(EXPECTED_REVIEW_IDS));
    EXPECTED_REVIEW_IDS.forEach((id) => {
      const item = reviewItems.find((record) => record.id === id);
      expect(item?.reason).toBeTruthy();
    });
  });

  test('关键操作分别绑定到自身按钮，不回退到审批或模块标题', () => {
    const apply = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.apply];
    const allocation = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.allocation];
    const approval = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.approval];
    const issue = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.issue];
    const confirm = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.confirm];

    expect(apply.find((note) => note.id === 'borrowing-apply-submit').target).toContain('::button::e68f90e4baa4');
    expect(allocation.find((note) => note.id === 'borrowing-allocation-agree').target).toContain('::button::e5908ce6848f');
    expect(allocation.find((note) => note.id === 'borrowing-allocation-reject').target).toContain('::button::e9a9b3e59b9e');
    expect(approval.find((note) => note.id === 'borrowing-approval-agree').target).toContain('::button::e5908ce6848f');
    expect(approval.find((note) => note.id === 'borrowing-approval-reject').target).toContain('::button::e9a9b3e59b9e');
    expect(issue.find((note) => note.id === 'borrowing-issue-confirm').target).toContain('::button::e5809fe794a8e7a1aee8aea4');
    expect(issue.find((note) => note.id === 'borrowing-issue-abandon').target).toContain('::button::e58f96e6b688');
    expect(issue.find((note) => note.id === 'borrowing-issue-outbound').target).toContain('::button::e689a7e8a18ce587bae5ba93');
    expect(confirm.find((note) => note.id === 'borrowing-confirm-manual-action').target).toContain('::button::e7a1aee8aea4');
    expect(confirm.find((note) => note.id === 'borrowing-confirm-qr-action').target).toContain('::button::e6a8a1e68b9fe689abe7a081e7a1aee8aea4');
  });

  test('发放页 Descriptions 字段规则使用字段语义 target', () => {
    const issue = assetBorrowingAnnotationsByScope[ASSET_BORROWING_SCOPES.issue];
    expect(issue.find((note) => note.id === 'borrowing-issue-warehouse').target).toContain('::select::e5bd93e5898de4bb93e5ba93');
    expect(issue.find((note) => note.id === 'borrowing-issue-usage-note').target).toContain('::control::e4bdbfe794a8e8afb4e6988e');
    expect(issue.find((note) => note.id === 'borrowing-issue-inventory').target).toContain('::detail-field::e5ae9ee99985e79b98e782b9e4baba');
  });
});
