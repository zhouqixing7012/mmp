import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import {
  applySemanticActionAnchors,
  installSemanticActionAnchorBridge,
} from './annotation-action-anchor-bridge';
import { installAnnotationCoverageUi } from './annotation-coverage-ui';
import { installAnnotationMatchQualityUi } from './annotation-match-quality-ui';
import { installAnnotationReviewModeUi } from './annotation-review-mode-ui';

const BUILT_IN_ANNOTATIONS_BY_SCOPE = {
  ...contractNumberAnnotationsByScope,
  ...assetBorrowingAnnotationsByScope,
};

installSemanticActionAnchorBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);
installAnnotationCoverageUi();
installAnnotationMatchQualityUi();
installAnnotationReviewModeUi();

export function getBuiltInPrototypeAnnotations(pageScope) {
  const annotations = BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
  if (typeof document !== 'undefined') {
    applySemanticActionAnchors(pageScope, annotations, document);
  }
  return annotations;
}
