import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import { contractNumberRequirementCoverageByScope } from './contract-number-annotation-coverage';
import {
  applyContractNumberAnnotationAudit,
  applyContractNumberCoverageAudit,
  CONTRACT_NUMBER_AUDIT_SCOPES,
} from './contract-number-prd-audit';
import {
  validateAnnotationGranularity,
  validateRequirementCoverage,
} from './annotation-quality';

describe('deep contract number PRD audit', () => {
  const annotationsByScope = applyContractNumberAnnotationAudit(contractNumberAnnotationsByScope);
  const coverageByScope = applyContractNumberCoverageAudit(contractNumberRequirementCoverageByScope);

  test('合约号码六个页面都保持细粒度标注与coverage质量门槛', () => {
    Object.values(CONTRACT_NUMBER_AUDIT_SCOPES).forEach((pageScope) => {
      expect(annotationsByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(coverageByScope[pageScope]?.length).toBeGreaterThan(0);
      expect(validateAnnotationGranularity(annotationsByScope[pageScope])).toEqual([]);
      expect(validateRequirementCoverage(coverageByScope[pageScope], annotationsByScope[pageScope])).toEqual([]);
    });
  });

  test('第二轮深审后合约号码PRD重点从34条扩展为78条', () => {
    const requirements = Object.values(coverageByScope).flat();
    expect(requirements).toHaveLength(78);
  });

  test('授权、申请、号码锁、主管通知、弃领和自动出库都有独立审计点', () => {
    const ids = new Set(Object.values(coverageByScope).flat().map((item) => item.id));
    [
      'CN2-AUTH-001',
      'CN2-AP-002',
      'CN2-AP-005',
      'CN2-AL-001',
      'CN2-AL-003',
      'CN2-SV-003',
      'CN2-WH-003',
      'CN2-CF-007',
      'CN2-CF-009',
      'CN2-CF-010',
    ].forEach((id) => expect(ids.has(id)).toBe(true));
  });

  test('第一轮过度乐观的实现状态被第二轮审计纠正', () => {
    const requirements = Object.values(coverageByScope).flat();
    const byId = new Map(requirements.map((item) => [item.id, item]));
    expect(byId.get('CN-AP-001').status).toBe('review');
    expect(byId.get('CN-AL-003').status).toBe('review');
    expect(byId.get('CN-WH-005').status).toBe('review');
    expect(byId.get('CN-CF-002').status).toBe('review');
  });

  test('号码选择默认不展示与固定状态过滤不能被误判为已实现', () => {
    const allocation = coverageByScope[CONTRACT_NUMBER_AUDIT_SCOPES.allocation];
    const byId = new Map(allocation.map((item) => [item.id, item]));
    expect(byId.get('CN2-AL-001').status).toBe('review');
    expect(byId.get('CN2-AL-002').status).toBe('review');
    expect(byId.get('CN2-AL-003').status).toBe('review');
  });

  test('员工确认后的出库、台账和操作历史保持review直到真实联动实现', () => {
    const confirmation = coverageByScope[CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm];
    const byId = new Map(confirmation.map((item) => [item.id, item]));
    ['CN2-CF-007', 'CN2-CF-008', 'CN2-CF-009', 'CN2-CF-010', 'CN2-CF-011']
      .forEach((id) => expect(byId.get(id).status).toBe('review'));
  });
});
