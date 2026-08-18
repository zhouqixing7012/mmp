import {
  getEmployeeSelfServiceCoverageModules,
  getPageCoverageState,
  getRequirementCoverageForScope,
} from './annotation-coverage-registry';
import { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { CONTRACT_NUMBER_SCOPES } from './contract-number-annotation-coverage';
import { ASSET_APPLICATION_AUDIT_SCOPES } from './asset-application-prd-audit';
import { NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES } from './new-employee-claim-prd-audit';

test('资产借用五个页面都能读取 PRD 覆盖账本', () => {
  Object.values(ASSET_BORROWING_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });
});

test('合约号码六个页面均使用第二轮深审覆盖结果', () => {
  Object.values(CONTRACT_NUMBER_SCOPES).forEach((scope) => {
    expect(getPageCoverageState(scope).state).toBe('audited');
    expect(getRequirementCoverageForScope(scope).length).toBeGreaterThan(0);
  });

  const modules = getEmployeeSelfServiceCoverageModules();
  const contract = modules.find((item) => item.id === 'contract-number');
  expect(contract.state).toBe('audited');
  expect(contract.auditedScopes).toBe(contract.registeredScopes);
  expect(contract.auditedScopes).toBe(6);
  expect(contract.total).toBe(78);
  expect(contract.review).toBeGreaterThan(0);
});

test('资产申请六个页面均使用第二轮深审覆盖结果', () => {
  Object.values(ASSET_APPLICATION_AUDIT_SCOPES).forEach((scope) => {
    expect(getPageCoverageState(scope).state).toBe('audited');
    expect(getRequirementCoverageForScope(scope).length).toBeGreaterThan(0);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'asset-application');
  expect(module.state).toBe('audited');
  expect(module.total).toBe(102);
});

test('新员工与实习生资产领用两个页面均使用第二轮深审覆盖结果', () => {
  Object.values(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES).forEach((scope) => {
    expect(getPageCoverageState(scope).state).toBe('audited');
    expect(getRequirementCoverageForScope(scope).length).toBeGreaterThan(0);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'new-employee-claim');
  expect(module.state).toBe('audited');
  expect(module.total).toBe(55);
  expect(module.review).toBeGreaterThan(0);
});

test('员工自助业务模块均已进入基线标注与覆盖账本', () => {
  const modules = getEmployeeSelfServiceCoverageModules();
  const expected = [
    'asset-application',
    'new-employee-claim',
    'contract-number',
    'consumables',
    'asset-borrowing',
    'asset-replacement',
    'asset-transfer',
    'asset-return',
    'contract-number-return',
  ];

  expected.forEach((id) => {
    const module = modules.find((item) => item.id === id);
    expect(module?.state).toBe('audited');
    expect(module?.total).toBeGreaterThan(0);
  });
});
