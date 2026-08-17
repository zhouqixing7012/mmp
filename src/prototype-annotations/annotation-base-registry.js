import contractNumberAnnotationsByScope from './contract-number-annotation-data';

const BUILT_IN_ANNOTATIONS_BY_SCOPE = {
  ...contractNumberAnnotationsByScope,
};

export function getBuiltInPrototypeAnnotations(pageScope) {
  return BUILT_IN_ANNOTATIONS_BY_SCOPE[pageScope] || [];
}
