import {
  EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES,
} from './employee-self-service-expanded-annotations';
import {
  applyNewEmployeeClaimAnnotationAudit,
  applyNewEmployeeClaimCoverageAudit,
  NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES,
} from './new-employee-claim-prd-audit';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

function newEmployeeClaimModule() {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((module) => module.id === 'new-employee-claim');
}

describe('deep new employee / intern claim PRD audit', () => {
  const module = newEmployeeClaimModule();
  const annotationsByScope = applyNewEmployeeClaimAnnotationAudit(module.annotationsByScope);
  const coverageByScope = applyNewEmployeeClaimCoverageAudit(module.coverageByScope);

  test('领用单和员工确认页都保持细粒度标注与coverage质量门槛', () => {
    Object.values(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES).forEach((pageScope) => {
      expect(annotationsByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(coverageByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(validateAnnotationGranularity(annotationsByScope[pageScope])).toEqual([]);
      expect(validateRequirementCoverage(coverageByScope[pageScope], annotationsByScope[pageScope])).toEqual([]);
    });
  });

  test('第二轮深审后PRD重点从15条扩展为55条', () => {
    const requirements = Object.values(coverageByScope).flat();
    expect(requirements).toHaveLength(55);
  });

  test('PS幂等、物料映射、资产锁、合同状态和结果回传都有独立去向', () => {
    const allIds = new Set(Object.values(coverageByScope).flat().map((item) => item.id));
    [
      'NE-CL-013',
      'NE-CL-014',
      'NE-CL-016',
      'NE-CL-019',
      'NE-CL-027',
      'NE-CL-028',
      'NE-CL-030',
      'NE-CL-036',
      'NE-CL-038',
      'NE-CF-009',
      'NE-CF-012',
      'NE-CF-016',
    ].forEach((id) => expect(allIds.has(id)).toBe(true));
  });

  test('新员工确认明确保持仅刷卡/手工工号，扫码与Pad签字属于差异', () => {
    const requirements = coverageByScope[NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm];
    const confirmMethod = requirements.find((item) => item.id === 'NE-CF-006');
    expect(confirmMethod.status).toBe('review');
    expect(confirmMethod.rule).toContain('仅刷卡确认');
    expect(confirmMethod.reason).toContain('狐小e二维码');
  });

  test('第一轮过度乐观的仓库、资产过滤、弃领和自动出库状态被纠正', () => {
    const requirements = Object.values(coverageByScope).flat();
    const byId = new Map(requirements.map((item) => [item.id, item]));
    expect(byId.get('NE-CL-001').status).toBe('review');
    expect(byId.get('NE-CL-003').status).toBe('review');
    expect(byId.get('NE-CL-008').status).toBe('review');
    expect(byId.get('NE-CF-004').status).toBe('review');
  });

  test('保存与删除分别绑定到资产锁定和解锁动作', () => {
    const notes = annotationsByScope[NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim];
    const save = notes.find((item) => item.id === 'new-employee-claim-save-lock');
    const remove = notes.find((item) => item.id === 'new-employee-claim-delete-unlock');
    expect(save.target).toContain('::button::');
    expect(remove.target).toContain('::button::');
    expect(save.sections[0].items.map((item) => item.text).join(' ')).toContain('锁定');
    expect(remove.sections[0].items.map((item) => item.text).join(' ')).toContain('解除资产锁');
  });
});
