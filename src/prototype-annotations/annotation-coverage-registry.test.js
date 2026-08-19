import {
  getEmployeeSelfServiceCoverageModules,
  getPageCoverageState,
  getRequirementCoverageForScope,
} from './annotation-coverage-registry';
import { PERSONAL_WORKBENCH_AUDIT_SCOPES } from './personal-workbench-prd-audit';
import { CONTRACT_NUMBER_SCOPES } from './contract-number-annotation-coverage';
import { ASSET_APPLICATION_AUDIT_SCOPES } from './asset-application-prd-audit';
import { NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES } from './new-employee-claim-prd-audit';
import { CONSUMABLE_AUDIT_SCOPES } from './consumable-prd-audit';
import { ASSET_BORROWING_AUDIT_SCOPES } from './asset-borrowing-prd-audit';
import { ASSET_REPLACEMENT_AUDIT_SCOPES } from './asset-replacement-prd-audit';
import { ASSET_TRANSFER_AUDIT_SCOPES } from './asset-transfer-prd-audit';
import { ASSET_RETURN_AUDIT_SCOPES } from './asset-return-prd-audit';
import { CONTRACT_RETURN_AUDIT_SCOPES } from './contract-return-prd-audit';

test('个人工作台首页使用第二轮深审覆盖结果', () => {
  Object.values(PERSONAL_WORKBENCH_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'personal-workbench');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(1);
  expect(module.auditedScopes).toBe(1);
  expect(module.total).toBe(36);
  expect(module.review).toBeGreaterThan(0);
  expect(module.skip).toBeGreaterThan(0);
});

test('资产借用五个页面均使用第二轮深审覆盖结果', () => {
  Object.values(ASSET_BORROWING_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'asset-borrowing');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(5);
  expect(module.auditedScopes).toBe(5);
  expect(module.total).toBe(106);
  expect(module.review).toBeGreaterThan(0);
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

test('耗材九个正式页面使用第二轮深审，领用方案一/二分别审计', () => {
  Object.values(CONSUMABLE_AUDIT_SCOPES).forEach((scope) => {
    expect(getPageCoverageState(scope).state).toBe('audited');
    expect(getRequirementCoverageForScope(scope).length).toBeGreaterThan(0);
  });

  expect(getPageCoverageState('route:/yewurules::个人工作台::耗材领用').state).toBe('unregistered');

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'consumables');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(9);
  expect(module.auditedScopes).toBe(9);
  expect(module.total).toBe(104);
  expect(module.review).toBeGreaterThan(0);
  expect(module.skip).toBeGreaterThan(0);
});

test('资产更换四个正式页面均使用第二轮深审覆盖结果', () => {
  Object.values(ASSET_REPLACEMENT_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'asset-replacement');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(4);
  expect(module.auditedScopes).toBe(4);
  expect(module.total).toBe(106);
  expect(module.review).toBeGreaterThan(0);
  expect(module.skip).toBeGreaterThan(0);
});

test('资产转移责任人变更三页与工作台审批页共同组成六个正式scope', () => {
  Object.values(ASSET_TRANSFER_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'asset-transfer');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(6);
  expect(module.auditedScopes).toBe(6);
  expect(module.total).toBe(82);
  expect(module.review).toBeGreaterThan(0);
});

test('资产退库五个员工自助页面与核心入库页共同组成六个正式scope', () => {
  Object.values(ASSET_RETURN_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'asset-return');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(6);
  expect(module.auditedScopes).toBe(6);
  expect(module.total).toBe(110);
  expect(module.review).toBeGreaterThan(0);
  expect(module.skip).toBeGreaterThan(0);
});

test('合约号码退库三张员工自助页面与核心入库页共同组成四个正式scope', () => {
  Object.values(CONTRACT_RETURN_AUDIT_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });

  const module = getEmployeeSelfServiceCoverageModules().find((item) => item.id === 'contract-number-return');
  expect(module.state).toBe('audited');
  expect(module.registeredScopes).toBe(4);
  expect(module.auditedScopes).toBe(4);
  expect(module.total).toBe(75);
  expect(module.review).toBeGreaterThan(0);
  expect(module.skip).toBeGreaterThan(0);
});

test('员工自助业务模块均已进入基线标注与覆盖账本', () => {
  const modules = getEmployeeSelfServiceCoverageModules();
  const expected = [
    'personal-workbench',
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
