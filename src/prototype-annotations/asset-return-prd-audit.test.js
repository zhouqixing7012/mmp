import { EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES } from './employee-self-service-expanded-annotations';
import {
  ASSET_RETURN_AUDIT_SCOPES,
  applyAssetReturnAnnotationAudit,
  applyAssetReturnCoverageAudit,
} from './asset-return-prd-audit';

function getBaseModule() {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((item) => item.id === 'asset-return');
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('资产退库第二轮深审覆盖五个员工自助页面和核心入库页', () => {
  const module = getBaseModule();
  const audited = applyAssetReturnCoverageAudit(module.coverageByScope);

  expect(Object.keys(audited)).toEqual(expect.arrayContaining(Object.values(ASSET_RETURN_AUDIT_SCOPES)));
  expect(Object.keys(audited)).toHaveLength(6);
  expect(flatten(audited)).toHaveLength(110);
});

test('核心库存管理入库页作为退库正式复用页面进入标注体系', () => {
  const module = getBaseModule();
  const audited = applyAssetReturnAnnotationAudit(module.annotationsByScope);

  expect(audited[ASSET_RETURN_AUDIT_SCOPES.inbound]?.length).toBeGreaterThan(0);
  expect(audited[ASSET_RETURN_AUDIT_SCOPES.inbound].some((item) => item.id === 'asset-return-audit-inbound-print')).toBe(true);
});

test('第一轮过度乐观的锁、领导动作、仓库权限、入库和扫码必须保持review', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  [
    'RT-AP-003',
    'RT-AP-004',
    'RT-LD-002',
    'RT-LD-003',
    'RT-MI-001',
    'RT-MI-004',
    'RT-HD-001',
    'RT-HD-004',
    'RT-HD-005',
    'RT-CF-001',
    'RT-CF-002',
  ].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
    expect(byId.get(id)?.reason).toBeTruthy();
  });
});

test('21天超期、ES补鉴定、真实入库和关联耗材台账均独立审计', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  [
    'RT2-HD-008',
    'RT2-HD-019',
    'RT2-HD-021',
    'RT2-HD-022',
    'RT2-HD-026',
    'RT2-IN-004',
    'RT2-IN-005',
    'RT2-IN-007',
  ].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
  });
});

test('员工确认保留工号校验但狐小e真实身份和入库执行时点单独review', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetReturnCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  expect(byId.get('RT2-CF-006')?.status).toBe('bound');
  expect(byId.get('RT2-CF-007')?.status).toBe('review');
  expect(byId.get('RT2-CF-010')?.status).toBe('review');
});
