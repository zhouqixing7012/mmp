import {
  EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES,
  expandedEmployeeSelfServiceAnnotationsByScope,
  expandedEmployeeSelfServiceCoverageByScope,
} from './employee-self-service-expanded-annotations';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

function flatten(map = {}) {
  return Object.values(map).flat();
}

describe('expanded employee self-service annotation quality gate', () => {
  test('七个新增员工自助PRD模块均已建立基线标注和覆盖账本', () => {
    expect(EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.map((module) => module.id)).toEqual([
      'asset-application',
      'new-employee-claim',
      'consumables',
      'asset-replacement',
      'asset-transfer',
      'asset-return',
      'contract-number-return',
    ]);

    EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.forEach((module) => {
      expect(Object.keys(module.annotationsByScope).length).toBeGreaterThan(0);
      expect(Object.keys(module.coverageByScope).length).toBeGreaterThan(0);
      expect(flatten(module.annotationsByScope).length).toBeGreaterThan(0);
      expect(flatten(module.coverageByScope).length).toBeGreaterThan(0);
    });
  });

  test('具体字段、按钮和表头规则不允许回退到模块级target', () => {
    expect(validateAnnotationGranularity(flatten(expandedEmployeeSelfServiceAnnotationsByScope))).toEqual([]);
  });

  test('每个pageScope的bound/review/skip均有合法去向', () => {
    Object.entries(expandedEmployeeSelfServiceCoverageByScope).forEach(([pageScope, requirements]) => {
      const annotations = expandedEmployeeSelfServiceAnnotationsByScope[pageScope] || [];
      expect(requirements.length).toBeGreaterThan(0);
      expect(validateRequirementCoverage(requirements, annotations)).toEqual([]);
    });
  });

  test('review差异必须写明当前实现差异，不得静默当成已实现', () => {
    const reviews = flatten(expandedEmployeeSelfServiceCoverageByScope)
      .filter((item) => item.status === 'review');
    expect(reviews.length).toBeGreaterThan(0);
    reviews.forEach((item) => {
      expect(item.reason).toBeTruthy();
      expect(item.rule).toBeTruthy();
    });
  });

  test('关键审批/确认动作全部绑定到按钮', () => {
    const actionNotes = flatten(expandedEmployeeSelfServiceAnnotationsByScope)
      .filter((note) => note.kind === 'action-rule');
    expect(actionNotes.length).toBeGreaterThan(20);
    actionNotes.forEach((note) => expect(note.target).toContain('::button::'));
  });

  test('共享物资申请scope同时保留资产与耗材规则', () => {
    const scope = 'route:/yewurules::个人工作台::物资申请';
    const annotations = expandedEmployeeSelfServiceAnnotationsByScope[scope] || [];
    const ids = annotations.map((note) => note.id);
    expect(ids).toContain('asset-apply-entry-rules');
    expect(ids).toContain('consumable-apply-main-asset');
    expect(new Set(ids).size).toBe(ids.length);
  });
});
