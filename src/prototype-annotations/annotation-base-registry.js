import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import expandedEmployeeSelfServiceAnnotationsByScope from './employee-self-service-expanded-annotations';
import {
  applySemanticActionAnchors,
  installSemanticActionAnchorBridge,
} from './annotation-action-anchor-bridge';
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

// 同一个工作台页面可能同时承载多个 PRD 模块（例如“物资申请”同时承载资产和耗材）。
// 这里必须按 scope 合并数组，不能再用对象 spread 覆盖后注册模块。
const BUILT_IN_ANNOTATIONS_BY_SCOPE = mergeScopeMaps(
  contractNumberAnnotationsByScope,
  assetBorrowingAnnotationsByScope,
  expandedEmployeeSelfServiceAnnotationsByScope
);

installSemanticActionAnchorBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);
installAnnotationCoverageUi();
installAnnotationMatchQualityUi();
installAnnotationReviewModeUi();
installAnnotationHotspotCollisionAvoidance();
installAnnotationToolHubUi();

export function getBuiltInPrototypeAnnotations(pageScope) {
  const annotations = BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
  if (typeof document !== 'undefined') {
    applySemanticActionAnchors(pageScope, annotations, document);
  }
  return annotations;
}

export function getBuiltInPrototypeAnnotationRegistry() {
  return BUILT_IN_ANNOTATIONS_BY_SCOPE;
}
