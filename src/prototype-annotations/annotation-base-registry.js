import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import {
  applySemanticActionAnchors,
  installSemanticActionAnchorBridge,
} from './annotation-action-anchor-bridge';

const BUILT_IN_ANNOTATIONS_BY_SCOPE = {
  ...contractNumberAnnotationsByScope,
  ...assetBorrowingAnnotationsByScope,
};

installSemanticActionAnchorBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);

export function getBuiltInPrototypeAnnotations(pageScope) {
  const annotations = BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
  if (typeof document !== 'undefined') {
    applySemanticActionAnchors(pageScope, annotations, document);
  }
  return annotations;
}
