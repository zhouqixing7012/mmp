import assetBorrowingAnnotationsByScope, { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { assetBorrowingRequirementCoverageByScope } from './asset-borrowing-annotation-coverage';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import {
  CONTRACT_WAREHOUSE_SCOPE,
  contractWarehouseRequirementCoverage,
} from './contract-number-annotation-coverage';

const MODULE_CATALOG = [
  { id: 'asset-application', name: '资产申请', prd: '02-资产申请.md' },
  { id: 'new-employee-claim', name: '新员工与实习生资产领用', prd: '03-新员工与实习生资产领用.md' },
  { id: 'contract-number', name: '合约号码申请', prd: '04-合约号码申请.md' },
  { id: 'consumables', name: '耗材申请', prd: '05-耗材申请.md' },
  { id: 'asset-borrowing', name: '资产借用', prd: '06-资产借用.md' },
  { id: 'asset-replacement', name: '资产更换', prd: '07-资产更换.md' },
  { id: 'asset-transfer', name: '资产转移', prd: '08-资产转移.md' },
  { id: 'asset-return', name: '资产退库', prd: '09-资产退库.md' },
  { id: 'contract-number-return', name: '合约号码退库', prd: '10-合约号码退库.md' },
];

const BORROWING_SCOPES = new Set(Object.values(ASSET_BORROWING_SCOPES));
const CONTRACT_SCOPES = new Set(Object.keys(contractNumberAnnotationsByScope));

function countStatuses(requirements = []) {
  return requirements.reduce((counts, item) => {
    if (item?.status === 'bound') counts.bound += 1;
    else if (item?.status === 'review') counts.review += 1;
    else if (item?.status === 'skip') counts.skip += 1;
    return counts;
  }, { total: requirements.length, bound: 0, review: 0, skip: 0 });
}

function flattenCoverage(coverageByScope = {}) {
  return Object.values(coverageByScope).flat();
}

export function getRequirementCoverageForScope(pageScope) {
  if (assetBorrowingRequirementCoverageByScope[pageScope]) {
    return assetBorrowingRequirementCoverageByScope[pageScope];
  }
  if (pageScope === CONTRACT_WAREHOUSE_SCOPE) {
    return contractWarehouseRequirementCoverage;
  }
  return [];
}

export function getPageCoverageState(pageScope) {
  const requirements = getRequirementCoverageForScope(pageScope);
  const annotations = BORROWING_SCOPES.has(pageScope)
    ? (assetBorrowingAnnotationsByScope[pageScope] || [])
    : (contractNumberAnnotationsByScope[pageScope] || []);

  if (requirements.length) {
    return {
      state: 'audited',
      label: '已建立覆盖账本',
      requirements,
      annotations,
      counts: countStatuses(requirements),
    };
  }

  if (annotations.length) {
    return {
      state: 'annotations-only',
      label: '已有标注，未建立覆盖账本',
      requirements: [],
      annotations,
      counts: { total: 0, bound: 0, review: 0, skip: 0 },
    };
  }

  return {
    state: 'unregistered',
    label: '尚未接入标注体系',
    requirements: [],
    annotations: [],
    counts: { total: 0, bound: 0, review: 0, skip: 0 },
  };
}

export function getEmployeeSelfServiceCoverageModules() {
  const borrowingRequirements = flattenCoverage(assetBorrowingRequirementCoverageByScope);
  const borrowingCounts = countStatuses(borrowingRequirements);
  const contractCounts = countStatuses(contractWarehouseRequirementCoverage);

  return MODULE_CATALOG.map((module) => {
    if (module.id === 'asset-borrowing') {
      return {
        ...module,
        state: 'audited',
        label: '已建立完整覆盖账本',
        registeredScopes: Object.keys(assetBorrowingAnnotationsByScope).length,
        auditedScopes: Object.keys(assetBorrowingRequirementCoverageByScope).length,
        ...borrowingCounts,
      };
    }

    if (module.id === 'contract-number') {
      return {
        ...module,
        state: 'partial',
        label: '部分页面已审计',
        registeredScopes: Object.keys(contractNumberAnnotationsByScope).length,
        auditedScopes: 1,
        ...contractCounts,
      };
    }

    return {
      ...module,
      state: 'unregistered',
      label: '尚未建立基线标注',
      registeredScopes: 0,
      auditedScopes: 0,
      total: 0,
      bound: 0,
      review: 0,
      skip: 0,
    };
  });
}

export function getCoverageReviewItems(pageScope) {
  return getRequirementCoverageForScope(pageScope)
    .filter((item) => item.status === 'review');
}
