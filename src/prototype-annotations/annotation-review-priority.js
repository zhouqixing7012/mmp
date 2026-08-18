const VALID_PRIORITIES = new Set(['P0', 'P1', 'P2']);

export function getAnnotationPriority(note) {
  if (VALID_PRIORITIES.has(note?.priority)) return note.priority;
  if (['business-rule', 'action-rule'].includes(note?.kind)) return 'P0';
  if (['field-rule', 'table-column-rule', 'tab-rule'].includes(note?.kind)) return 'P1';
  return 'P2';
}

export function filterAnnotationsForReview(annotations = [], mode = 'core') {
  if (mode === 'all') return annotations;
  return annotations.filter((note) => ['P0', 'P1'].includes(getAnnotationPriority(note)));
}
