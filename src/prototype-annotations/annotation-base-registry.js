import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import expandedEmployeeSelfServiceAnnotationsByScope from './employee-self-service-expanded-annotations';
import foundationAnnotationsByScope from './employee-self-service-foundation-annotations';
import { applyPersonalWorkbenchAnnotationAudit } from './personal-workbench-prd-audit';
import { applyPersonalWorkbenchReviewAnnotations } from './personal-workbench-review-resolutions';
import { applyAssetApplicationAnnotationAudit } from './asset-application-prd-audit';
import { applyNewEmployeeClaimAnnotationAudit } from './new-employee-claim-prd-audit';
import { applyContractNumberAnnotationAudit } from './contract-number-prd-audit';
import { applyContractNumberAnnotationTargetFixes } from './contract-number-annotation-target-fixes';
import { applyConsumableAnnotationAudit } from './consumable-prd-audit';
import { applyAssetBorrowingAnnotationAudit } from './asset-borrowing-prd-audit';
import { applyAssetReplacementAnnotationAudit } from './asset-replacement-prd-audit';
import { applyAssetTransferAnnotationAudit } from './asset-transfer-prd-audit';
import { applyAssetReturnAnnotationAudit } from './asset-return-prd-audit';
import { applyContractReturnAnnotationAudit } from './contract-return-prd-audit';
import {
  applySemanticActionAnchors,
  installSemanticActionAnchorBridge,
} from './annotation-action-anchor-bridge';
import {
  applySharedActionTargetAnchors,
  buildCanonicalActionBridgeRegistry,
  installSharedActionTargetBridge,
} from './annotation-action-target-bridge';
import {
  applyFieldLabelAnchors,
  installFieldLabelAnchorBridge,
} from './annotation-field-label-bridge';
import { installAnnotationCoverageUi } from './annotation-coverage-ui';
import { installAnnotationMatchQualityUi } from './annotation-match-quality-ui';
import { installAnnotationReviewModeUi } from './annotation-review-mode-ui';
import { installAnnotationHotspotCollisionAvoidance } from './annotation-hotspot-collision';
import { installAnnotationToolHubUi } from './annotation-tool-hub-ui';

function mergeScopeMaps(...maps) {
  return maps.reduce((result, map) => {
    Object.entries(map || {}).forEach(([pageScope, annotations]) => {
      result[pageScope] = [...(result[pageScope] || []), ...(annotations || [])];
    });
    return result;
  }, {});
}

const auditedContractNumberAnnotationsByScope = applyContractNumberAnnotationTargetFixes(
  applyContractNumberAnnotationAudit(contractNumberAnnotationsByScope)
);

const auditedAssetBorrowingAnnotationsByScope = applyAssetBorrowingAnnotationAudit(
  assetBorrowingAnnotationsByScope
);

const auditedExpandedEmployeeSelfServiceAnnotationsByScope = applyContractReturnAnnotationAudit(
  applyAssetReturnAnnotationAudit(
    applyAssetTransferAnnotationAudit(
      applyAssetReplacementAnnotationAudit(
        applyConsumableAnnotationAudit(
          applyNewEmployeeClaimAnnotationAudit(
            applyAssetApplicationAnnotationAudit(expandedEmployeeSelfServiceAnnotationsByScope)
          )
        )
      )
    )
  )
);

const auditedFoundationAnnotationsByScope = applyPersonalWorkbenchReviewAnnotations(
  applyPersonalWorkbenchAnnotationAudit(foundationAnnotationsByScope)
);

// 同一个工作台页面可能同时承载多个 PRD 模块（例如“物资申请”同时承载资产、耗材和附录规则）。
// 这里必须按 scope 合并数组，不能再用对象 spread 覆盖后注册模块。
const BUILT_IN_ANNOTATIONS_BY_SCOPE = mergeScopeMaps(
  auditedContractNumberAnnotationsByScope,
  auditedAssetBorrowingAnnotationsByScope,
  auditedExpandedEmployeeSelfServiceAnnotationsByScope,
  auditedFoundationAnnotationsByScope
);

// Semantic bridge 使用 target 动作生成的“桥接副本”，不修改用户在标注面板看到的标题。
// 这样可避免标注标题中出现“提交”等业务描述时误覆盖真正的“同意”按钮语义。
const ACTION_BRIDGE_REGISTRY = buildCanonicalActionBridgeRegistry(BUILT_IN_ANNOTATIONS_BY_SCOPE);

installSemanticActionAnchorBridge(ACTION_BRIDGE_REGISTRY);
installSharedActionTargetBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);
installFieldLabelAnchorBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);
installAnnotationCoverageUi();
installAnnotationMatchQualityUi();
installAnnotationReviewModeUi();
installAnnotationHotspotCollisionAvoidance();
installAnnotationToolHubUi();

export function getBuiltInPrototypeAnnotations(pageScope) {
  const annotations = BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
  if (typeof document !== 'undefined') {
    const bridgeAnnotations = ACTION_BRIDGE_REGISTRY[pageScope] || annotations;
    applySemanticActionAnchors(pageScope, bridgeAnnotations, document);
    applySharedActionTargetAnchors(pageScope, annotations, document);
    applyFieldLabelAnchors(pageScope, annotations, document);
  }
  return annotations;
}

export function getBuiltInPrototypeAnnotationRegistry() {
  return BUILT_IN_ANNOTATIONS_BY_SCOPE;
}
