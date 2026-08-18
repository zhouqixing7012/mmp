import {
  EMPLOYEE_WORKBENCH_SCOPE,
  FOUNDATION_PRD_MODULES,
  foundationAnnotationsByScope,
  foundationCoverageByScope,
} from './employee-self-service-foundation-annotations';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

describe('employee self-service foundation PRD annotation quality gate', () => {
  test('00总览、01个人工作台、11附录都有明确审计去向', () => {
    expect(FOUNDATION_PRD_MODULES.map((module) => module.id)).toEqual([
      'module-overview',
      'personal-workbench',
      'appendix',
    ]);
    const overview = FOUNDATION_PRD_MODULES.find((module) => module.id === 'module-overview');
    expect(overview.referenceCoverage?.every((item) => item.status === 'skip')).toBe(true);
  });

  test('个人工作台具体字段/按钮/表头标注粒度合法', () => {
    expect(validateAnnotationGranularity(foundationAnnotationsByScope[EMPLOYEE_WORKBENCH_SCOPE] || [])).toEqual([]);
  });

  test('基础层每个页面的PRD重点都有bound/review/skip去向', () => {
    Object.entries(foundationCoverageByScope).forEach(([pageScope, requirements]) => {
      const annotations = foundationAnnotationsByScope[pageScope] || [];
      expect(validateRequirementCoverage(requirements, annotations)).toEqual([]);
    });
  });

  test('工作台缺失的待审批/已审批/已申请能力不能被静默当成已完成', () => {
    const reviews = foundationCoverageByScope[EMPLOYEE_WORKBENCH_SCOPE]
      .filter((item) => item.status === 'review');
    expect(reviews.map((item) => item.id)).toContain('WB-012');
    reviews.forEach((item) => expect(item.reason).toBeTruthy());
  });

  test('附录技术/设计/视频编辑映射已进入物资申请标注', () => {
    const applyScope = 'route:/yewurules::个人工作台::物资申请';
    const note = (foundationAnnotationsByScope[applyScope] || [])
      .find((item) => item.id === 'appendix-personnel-mapping-rule');
    expect(note).toBeTruthy();
    expect(note.title).toContain('技术/设计/视频编辑');
  });
});
