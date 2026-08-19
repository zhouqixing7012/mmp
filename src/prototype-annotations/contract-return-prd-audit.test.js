import { EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES } from './employee-self-service-expanded-annotations';
import {
  CONTRACT_RETURN_AUDIT_SCOPES,
  applyContractReturnAnnotationAudit,
  applyContractReturnCoverageAudit,
} from './contract-return-prd-audit';

function getBaseModule() {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((item) => item.id === 'contract-number-return');
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('合约号码退库第二轮深审包含三张工作台页面和核心入库页', () => {
  const module = getBaseModule();
  const audited = applyContractReturnCoverageAudit(module.coverageByScope);

  expect(Object.keys(audited)).toEqual(expect.arrayContaining(Object.values(CONTRACT_RETURN_AUDIT_SCOPES)));
  expect(Object.keys(audited)).toHaveLength(4);
  expect(flatten(audited)).toHaveLength(75);
});

test('旧coverage中仓库匹配、真实台账和扫码身份不能继续误判bound', () => {
  const module = getBaseModule();
  const audited = flatten(applyContractReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['CR-AP-001', 'CR-AP-003', 'CR-HD-001', 'CR-HD-005', 'CR-CF-001'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
    expect(byId.get(id)?.reason).toBeTruthy();
  });
});

test('一号一单和办理三阶段保持bound，真实仓库与号码入库保持review', () => {
  const module = getBaseModule();
  const audited = flatten(applyContractReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(byId.get('CR2-AP-006')?.status).toBe('bound');
  expect(byId.get('CR2-HD-010')?.status).toBe('bound');

  ['CR2-AP-008', 'CR2-AP-009', 'CR2-HD-017', 'CR2-HD-018', 'CR2-HD-020', 'CR2-HD-023', 'CR2-HD-024'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
  });
});

test('狐小e扫码仍是review，但实体卡确认文案和工号错误提示已覆盖', () => {
  const module = getBaseModule();
  const audited = flatten(applyContractReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(byId.get('CR2-CF-003')?.status).toBe('bound');
  expect(byId.get('CR2-CF-005')?.status).toBe('review');
  expect(byId.get('CR2-CF-008')?.status).toBe('bound');
});

test('核心入库页面作为号码退库正式复用scope并保留详情/套打差异', () => {
  const module = getBaseModule();
  const annotations = applyContractReturnAnnotationAudit(module.annotationsByScope);
  const audited = flatten(applyContractReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(annotations[CONTRACT_RETURN_AUDIT_SCOPES.inbound]?.length).toBeGreaterThan(0);
  expect(byId.get('CR2-IN-001')?.status).toBe('bound');
  expect(byId.get('CR2-IN-009')?.status).toBe('review');
  expect(byId.get('CR2-IN-011')?.status).toBe('review');
});
