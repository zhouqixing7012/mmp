import {
  getEmployeeSelfServiceCoverageModules,
  getPageCoverageState,
  getRequirementCoverageForScope,
} from './annotation-coverage-registry';
import { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { CONTRACT_WAREHOUSE_SCOPE } from './contract-number-annotation-coverage';

test('资产借用五个页面都能读取 PRD 覆盖账本', () => {
  Object.values(ASSET_BORROWING_SCOPES).forEach((scope) => {
    const state = getPageCoverageState(scope);
    expect(state.state).toBe('audited');
    expect(state.counts.total).toBeGreaterThan(0);
    expect(state.counts.total).toBe(state.counts.bound + state.counts.review + state.counts.skip);
  });
});

test('合约号码库管员页已审计，其他合约号码页面不会被误报为完整覆盖', () => {
  expect(getPageCoverageState(CONTRACT_WAREHOUSE_SCOPE).state).toBe('audited');
  expect(getRequirementCoverageForScope(CONTRACT_WAREHOUSE_SCOPE).length).toBeGreaterThan(0);

  const modules = getEmployeeSelfServiceCoverageModules();
  const contract = modules.find((item) => item.id === 'contract-number');
  expect(contract.state).toBe('partial');
  expect(contract.registeredScopes).toBeGreaterThan(contract.auditedScopes);
});

test('员工自助未建立基线标注的模块必须在覆盖中心明确显示为未接入', () => {
  const modules = getEmployeeSelfServiceCoverageModules();
  const expected = [
    'asset-application',
    'new-employee-claim',
    'consumables',
    'asset-replacement',
    'asset-transfer',
    'asset-return',
    'contract-number-return',
  ];

  expected.forEach((id) => {
    expect(modules.find((item) => item.id === id)?.state).toBe('unregistered');
  });
});
