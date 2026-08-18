import assetBorrowingAnnotationsByScope from './asset-borrowing-annotation-data';
import contractNumberAnnotationsByScope from './contract-number-annotation-data';
import { installSemanticActionAnchorBridge } from './annotation-action-anchor-bridge';

const BUILT_IN_ANNOTATIONS_BY_SCOPE = {
  ...contractNumberAnnotationsByScope,
  ...assetBorrowingAnnotationsByScope,
};

installSemanticActionAnchorBridge(BUILT_IN_ANNOTATIONS_BY_SCOPE);

export function getBuiltInPrototypeAnnotations(pageScope) {
  return BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
}
