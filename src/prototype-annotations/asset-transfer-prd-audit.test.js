import { EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES } from './employee-self-service-expanded-annotations';
import {
  ASSET_TRANSFER_AUDIT_SCOPES,
  applyAssetTransferAnnotationAudit,
  applyAssetTransferCoverageAudit,
} from './asset-transfer-prd-audit';

function getBaseModule() {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((item) => item.id === 'asset-transfer');
}

function flatten(scopeMap) {
  return Object.values(scopeMap || {}).flat();
}

test('资产转移第二轮深审把责任人变更三页纳入正式六节点映射', () => {
  const module = getBaseModule();
  const audited = applyAssetTransferCoverageAudit(module.coverageByScope);

  expect(Object.keys(audited)).toEqual(expect.arrayContaining(Object.values(ASSET_TRANSFER_AUDIT_SCOPES)));
  expect(Object.keys(audited)).toHaveLength(6);
  expect(flatten(audited)).toHaveLength(82);
});

test('申请、接收确认、实物确认不再以页面缺失作为review原因', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetTransferCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['AT-MD-001', 'AT-MD-004', 'AT-MD-006'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
    expect(byId.get(id)?.reason).toContain('页面已存在');
    expect(byId.get(id)?.reason).not.toContain('当前工作台没有');
    expect(byId.get(id)?.reason).not.toContain('当前个人工作台没有');
  });
});

test('责任人变更三个复用页面都有独立页面标注', () => {
  const module = getBaseModule();
  const audited = applyAssetTransferAnnotationAudit(module.annotationsByScope);

  expect(audited[ASSET_TRANSFER_AUDIT_SCOPES.apply]?.length).toBeGreaterThan(0);
  expect(audited[ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm]?.length).toBeGreaterThan(0);
  expect(audited[ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm]?.length).toBeGreaterThan(0);
});

test('静态审批按钮不能继续被误判为真实流程推进', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetTransferCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['AT-AU-002', 'AT-AU-003', 'AT-OM-001', 'AT-RM-001', 'AT-RM-002'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
    expect(byId.get(id)?.reason).toBeTruthy();
  });
});

test('地点只读、默认未勾选与真实转移单保持独立review', () => {
  const module = getBaseModule();
  const audited = flatten(applyAssetTransferCoverageAudit(module.coverageByScope));
  const byId = new Map(audited.map((item) => [item.id, item]));

  ['AT2-RC-003', 'AT2-RC-004', 'AT2-PC-002', 'AT2-PC-008', 'AT2-PC-013'].forEach((id) => {
    expect(byId.get(id)?.status).toBe('review');
  });
});
