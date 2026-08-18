import {
  EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES,
} from './employee-self-service-expanded-annotations';
import {
  applyAssetApplicationAnnotationAudit,
  applyAssetApplicationCoverageAudit,
  ASSET_APPLICATION_AUDIT_SCOPES,
} from './asset-application-prd-audit';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

function assetApplicationModule() {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((module) => module.id === 'asset-application');
}

describe('deep asset application PRD audit', () => {
  const module = assetApplicationModule();
  const annotationsByScope = applyAssetApplicationAnnotationAudit(module.annotationsByScope);
  const coverageByScope = applyAssetApplicationCoverageAudit(module.coverageByScope);

  test('资产申请六个页面都保持细粒度标注与coverage质量门槛', () => {
    Object.values(ASSET_APPLICATION_AUDIT_SCOPES).forEach((pageScope) => {
      expect(annotationsByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(coverageByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(validateAnnotationGranularity(annotationsByScope[pageScope])).toEqual([]);
      expect(validateRequirementCoverage(coverageByScope[pageScope], annotationsByScope[pageScope])).toEqual([]);
    });
  });

  test('第二轮深审后资产申请PRD重点从48条扩展为102条', () => {
    const requirements = Object.values(coverageByScope).flat();
    expect(requirements).toHaveLength(102);
  });

  test('申请页遗漏的须知、实习生、超标算法与二次确认都有明确去向', () => {
    const requirements = coverageByScope[ASSET_APPLICATION_AUDIT_SCOPES.apply];
    const ids = requirements.map((item) => item.id);
    expect(ids).toEqual(expect.arrayContaining([
      'AA-AP-012',
      'AA-AP-014',
      'AA-AP-015',
      'AA-AP-018',
      'AA-AP-019',
      'AA-AP-020',
      'AA-AP-021',
      'AA-AP-023',
    ]));
  });

  test('审批超时、配给拆单、采购回写、领用权限和真实出库不再被大规则概括掉', () => {
    const allIds = new Set(Object.values(coverageByScope).flat().map((item) => item.id));
    [
      'AA-AU-008',
      'AA-AU-009',
      'AA-AL-009',
      'AA-AL-015',
      'AA-SM-017',
      'AA-CL-009',
      'AA-CL-014',
      'AA-CF-009',
      'AA-CF-010',
      'AA-CF-011',
    ].forEach((id) => expect(allIds.has(id)).toBe(true));
  });

  test('库存匹配口径修正为资产大类一致', () => {
    const allocationNotes = annotationsByScope[ASSET_APPLICATION_AUDIT_SCOPES.allocation];
    const note = allocationNotes.find((item) => item.id === 'asset-allocation-asset-range');
    const text = note.sections.flatMap((section) => section.items.map((item) => item.text)).join(' ');
    expect(text).toContain('资产大类与申请资产大类一致');
    expect(text).not.toContain('资产小类匹配');
  });

  test('第一轮过度乐观的实现状态被第二轮审计纠正', () => {
    const requirements = Object.values(coverageByScope).flat();
    const byId = new Map(requirements.map((item) => [item.id, item]));
    expect(byId.get('AA-SM-005').status).toBe('review');
    expect(byId.get('AA-CL-001').status).toBe('review');
    expect(byId.get('AA-CL-008').status).toBe('review');
    expect(byId.get('AA-CF-005').status).toBe('review');
  });
});
