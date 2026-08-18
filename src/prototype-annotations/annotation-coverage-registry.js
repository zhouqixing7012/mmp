import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import { assetBorrowingRequirementCoverageByScope } from './asset-borrowing-annotation-coverage';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import { contractNumberRequirementCoverageByScope } from './contract-number-annotation-coverage';
import {
  EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES,
  expandedEmployeeSelfServiceAnnotationsByScope,
  expandedEmployeeSelfServiceCoverageByScope,
} from './employee-self-service-expanded-annotations';
import {
  applyAssetApplicationAnnotationAudit,
  applyAssetApplicationCoverageAudit,
} from './asset-application-prd-audit';
import {
  applyNewEmployeeClaimAnnotationAudit,
  applyNewEmployeeClaimCoverageAudit,
} from './new-employee-claim-prd-audit';
import {
  applyContractNumberAnnotationAudit,
  applyContractNumberCoverageAudit,
} from './contract-number-prd-audit';
import {
  applyConsumableAnnotationAudit,
  applyConsumableCoverageAudit,
} from './consumable-prd-audit';
import {
  applyAssetBorrowingAnnotationAudit,
  applyAssetBorrowingCoverageAudit,
} from './asset-borrowing-prd-audit';
import {
  FOUNDATION_PRD_MODULES,
  foundationAnnotationsByScope,
  foundationCoverageByScope,
} from './employee-self-service-foundation-annotations';

const MODULE_CATALOG = [
  { id: 'module-overview', name: '员工自助模块总览', prd: '00-员工自助模块总览.md' },
  { id: 'personal-workbench', name: '个人工作台', prd: '01-个人工作台.md' },
  { id: 'asset-application', name: '资产申请', prd: '02-资产申请.md' },
  { id: 'new-employee-claim', name: '新员工与实习生资产领用', prd: '03-新员工与实习生资产领用.md' },
  { id: 'contract-number', name: '合约号码申请', prd: '04-合约号码申请.md' },
  { id: 'consumables', name: '耗材申请', prd: '05-耗材申请.md' },
  { id: 'asset-borrowing', name: '资产借用', prd: '06-资产借用.md' },
  { id: 'asset-replacement', name: '资产更换', prd: '07-资产更换.md' },
  { id: 'asset-transfer', name: '资产转移', prd: '08-资产转移.md' },
  { id: 'asset-return', name: '资产退库', prd: '09-资产退库.md' },
  { id: 'contract-number-return', name: '合约号码退库', prd: '10-合约号码退库.md' },
  { id: 'appendix', name: '附录', prd: '11-附录.md' },
];

function mergeScopeMaps(...maps) {
  return maps.reduce((result, map) => {
    Object.entries(map || {}).forEach(([pageScope, values]) => {
      result[pageScope] = [...(result[pageScope] || []), ...(values || [])];
    });
    return result;
  }, {});
}

function applyExpandedAnnotationAudits(moduleId, annotationsByScope) {
  if (moduleId === 'asset-application') return applyAssetApplicationAnnotationAudit(annotationsByScope);
  if (moduleId === 'new-employee-claim') return applyNewEmployeeClaimAnnotationAudit(annotationsByScope);
  if (moduleId === 'consumables') return applyConsumableAnnotationAudit(annotationsByScope);
  return annotationsByScope;
}

function applyExpandedCoverageAudits(moduleId, coverageByScope) {
  if (moduleId === 'asset-application') return applyAssetApplicationCoverageAudit(coverageByScope);
  if (moduleId === 'new-employee-claim') return applyNewEmployeeClaimCoverageAudit(coverageByScope);
  if (moduleId === 'consumables') return applyConsumableCoverageAudit(coverageByScope);
  return coverageByScope;
}

const auditedContractNumberAnnotationsByScope = applyContractNumberAnnotationAudit(
  contractNumberAnnotationsByScope
);
const auditedContractNumberCoverageByScope = applyContractNumberCoverageAudit(
  contractNumberRequirementCoverageByScope
);

const auditedAssetBorrowingAnnotationsByScope = applyAssetBorrowingAnnotationAudit(
  assetBorrowingAnnotationsByScope
);
const auditedAssetBorrowingCoverageByScope = applyAssetBorrowingCoverageAudit(
  assetBorrowingRequirementCoverageByScope
);

const auditedExpandedEmployeeSelfServiceAnnotationsByScope = applyConsumableAnnotationAudit(
  applyNewEmployeeClaimAnnotationAudit(
    applyAssetApplicationAnnotationAudit(expandedEmployeeSelfServiceAnnotationsByScope)
  )
);
const auditedExpandedEmployeeSelfServiceCoverageByScope = applyConsumableCoverageAudit(
  applyNewEmployeeClaimCoverageAudit(
    applyAssetApplicationCoverageAudit(expandedEmployeeSelfServiceCoverageByScope)
  )
);

const ALL_ANNOTATIONS_BY_SCOPE = mergeScopeMaps(
  auditedContractNumberAnnotationsByScope,
  auditedAssetBorrowingAnnotationsByScope,
  auditedExpandedEmployeeSelfServiceAnnotationsByScope,
  foundationAnnotationsByScope
);

const ALL_COVERAGE_BY_SCOPE = mergeScopeMaps(
  auditedContractNumberCoverageByScope,
  auditedAssetBorrowingCoverageByScope,
  auditedExpandedEmployeeSelfServiceCoverageByScope,
  foundationCoverageByScope
);

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

export function getBaselineAnnotationsForScope(pageScope) {
  return ALL_ANNOTATIONS_BY_SCOPE[pageScope] || [];
}

export function getRequirementCoverageForScope(pageScope) {
  return ALL_COVERAGE_BY_SCOPE[pageScope] || [];
}

export function getPageCoverageState(pageScope) {
  const requirements = getRequirementCoverageForScope(pageScope);
  const annotations = getBaselineAnnotationsForScope(pageScope);

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
  const borrowingRequirements = flattenCoverage(auditedAssetBorrowingCoverageByScope);
  const contractRequirements = flattenCoverage(auditedContractNumberCoverageByScope);
  const expandedById = new Map(EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.map((module) => [module.id, module]));
  const foundationById = new Map(FOUNDATION_PRD_MODULES.map((module) => [module.id, module]));

  return MODULE_CATALOG.map((module) => {
    if (module.id === 'asset-borrowing') {
      return {
        ...module,
        state: 'audited',
        label: borrowingRequirements.some((item) => item.status === 'review') ? '已审计，存在PRD差异' : '已建立完整覆盖账本',
        registeredScopes: Object.keys(auditedAssetBorrowingAnnotationsByScope).length,
        auditedScopes: Object.keys(auditedAssetBorrowingCoverageByScope).length,
        ...countStatuses(borrowingRequirements),
      };
    }

    if (module.id === 'contract-number') {
      return {
        ...module,
        state: 'audited',
        label: contractRequirements.some((item) => item.status === 'review') ? '已审计，存在PRD差异' : '已建立完整覆盖账本',
        registeredScopes: Object.keys(auditedContractNumberAnnotationsByScope).length,
        auditedScopes: Object.keys(auditedContractNumberCoverageByScope).length,
        ...countStatuses(contractRequirements),
      };
    }

    const expanded = expandedById.get(module.id);
    if (expanded) {
      const annotationsByScope = applyExpandedAnnotationAudits(module.id, expanded.annotationsByScope);
      const coverageByScope = applyExpandedCoverageAudits(module.id, expanded.coverageByScope);
      const requirements = flattenCoverage(coverageByScope);
      return {
        ...module,
        state: 'audited',
        label: requirements.some((item) => item.status === 'review') ? '已审计，存在PRD差异' : '已建立完整覆盖账本',
        registeredScopes: Object.keys(annotationsByScope).length,
        auditedScopes: Object.keys(coverageByScope).length,
        ...countStatuses(requirements),
      };
    }

    const foundation = foundationById.get(module.id);
    if (foundation) {
      const requirements = [
        ...flattenCoverage(foundation.coverageByScope),
        ...(foundation.referenceCoverage || []),
      ];
      return {
        ...module,
        state: foundation.state === 'reference' ? 'audited' : (foundation.state || 'audited'),
        label: foundation.label || (requirements.some((item) => item.status === 'review') ? '已审计，存在PRD差异' : '已建立完整覆盖账本'),
        registeredScopes: Object.keys(foundation.annotationsByScope || {}).length,
        auditedScopes: Object.keys(foundation.coverageByScope || {}).length,
        ...countStatuses(requirements),
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
