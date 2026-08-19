import {
  FOUNDATION_PRD_MODULES,
} from './employee-self-service-foundation-annotations';
import {
  PERSONAL_WORKBENCH_AUDIT_SCOPES,
  applyPersonalWorkbenchAnnotationAudit,
  applyPersonalWorkbenchCoverageAudit,
} from './personal-workbench-prd-audit';

function getBaseModule() {
  return FOUNDATION_PRD_MODULES.find((item) => item.id === 'personal-workbench');
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('个人工作台第二轮深审保持一个正式首页scope和36条规则', () => {
  const module = getBaseModule();
  const audited = applyPersonalWorkbenchCoverageAudit(module.coverageByScope);

  expect(Object.keys(audited)).toEqual(Object.values(PERSONAL_WORKBENCH_AUDIT_SCOPES));
  expect(flatten(audited)).toHaveLength(36);
});

test('责任人变更页作为资产转移正式申请入口，不再误报页面缺失', () => {
  const module = getBaseModule();
  const audited = flatten(applyPersonalWorkbenchCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(byId.get('WB-006')?.status).toBe('bound');
  expect(byId.get('WB2-007')?.status).toBe('bound');
});

test('物资申请统一入口按现行产品方案记为skip而不是缺陷', () => {
  const module = getBaseModule();
  const audited = flatten(applyPersonalWorkbenchCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(byId.get('WB-008')?.status).toBe('skip');
  expect(byId.get('WB2-016')?.status).toBe('skip');
});

test('首页新增重点规则都有对应标注', () => {
  const module = getBaseModule();
  const audited = applyPersonalWorkbenchAnnotationAudit(module.annotationsByScope);
  const annotations = audited[PERSONAL_WORKBENCH_AUDIT_SCOPES.home] || [];
  const ids = new Set(annotations.map((item) => item.id));

  [
    'workbench-audit-tab-visibility',
    'workbench-audit-lock-recheck',
    'workbench-audit-todo-pages',
    'workbench-audit-refresh',
  ].forEach((id) => expect(ids.has(id)).toBe(true));
});
