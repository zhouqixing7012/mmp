import {
  CONSUMABLE_AUDIT_SCOPES,
  applyConsumableAnnotationAudit,
  applyConsumableCoverageAudit,
} from './consumable-prd-audit';
import { getExpandedEmployeeSelfServiceModule } from './employee-self-service-expanded-annotations';

const LEGACY_SCOPE = 'route:/yewurules::个人工作台::耗材领用';

function flatten(map) {
  return Object.values(map || {}).flat();
}

test('耗材第二轮深审使用方案一普通耗材和方案二低值耐用品作为正式领用页', () => {
  const module = getExpandedEmployeeSelfServiceModule('consumables');
  const annotations = applyConsumableAnnotationAudit(module.annotationsByScope);
  const coverage = applyConsumableCoverageAudit(module.coverageByScope);

  expect(annotations[LEGACY_SCOPE]).toBeUndefined();
  expect(coverage[LEGACY_SCOPE]).toBeUndefined();
  expect(annotations[CONSUMABLE_AUDIT_SCOPES.claimOrdinary]?.length).toBeGreaterThan(0);
  expect(annotations[CONSUMABLE_AUDIT_SCOPES.claimLowValue]?.length).toBeGreaterThan(0);
  expect(coverage[CONSUMABLE_AUDIT_SCOPES.claimOrdinary]?.length).toBe(8);
  expect(coverage[CONSUMABLE_AUDIT_SCOPES.claimLowValue]?.length).toBe(10);
});

test('耗材深审形成九个正式页面和104条最小规则', () => {
  const module = getExpandedEmployeeSelfServiceModule('consumables');
  const coverage = applyConsumableCoverageAudit(module.coverageByScope);
  const requirements = flatten(coverage);

  expect(Object.keys(coverage)).toHaveLength(9);
  expect(requirements).toHaveLength(104);
  expect(requirements.some((item) => item.status === 'review')).toBe(true);
  expect(requirements.some((item) => item.status === 'skip')).toBe(true);
});

test('耗材二审纠正共享申请路由和驳回类型的旧判定', () => {
  const module = getExpandedEmployeeSelfServiceModule('consumables');
  const coverage = flatten(applyConsumableCoverageAudit(module.coverageByScope));
  const byId = new Map(coverage.map((item) => [item.id, item]));

  expect(byId.get('CO-AP-003')?.status).toBe('review');
  expect(byId.get('CO-AL-004')?.status).toBe('skip');
  expect(byId.get('CO-CF-004')?.status).toBe('review');
  expect(byId.get('CO2-AP-010')?.status).toBe('review');
  expect(byId.get('CO2-LV-006')?.status).toBe('review');
});

test('所有新增bound规则均绑定到实际标注', () => {
  const module = getExpandedEmployeeSelfServiceModule('consumables');
  const annotations = flatten(applyConsumableAnnotationAudit(module.annotationsByScope));
  const annotationsById = new Map(annotations.map((item) => [item.id, item]));
  const coverage = flatten(applyConsumableCoverageAudit(module.coverageByScope));

  coverage
    .filter((item) => item.id.startsWith('CO2-') && item.status === 'bound')
    .forEach((item) => {
      expect(item.annotationId).toBeTruthy();
      expect(annotationsById.has(item.annotationId)).toBe(true);
    });
});
