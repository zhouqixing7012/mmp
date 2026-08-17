export function buildAnnotationNumberMap(annotations = []) {
  return new Map(
    annotations.map((annotation, index) => [annotation.id, index + 1])
  );
}
