import { filterAnnotationsForReview, getAnnotationPriority } from './annotation-review-priority';

test('流程/动作规则默认作为 P0 研发评审重点', () => {
  expect(getAnnotationPriority({ kind: 'business-rule' })).toBe('P0');
  expect(getAnnotationPriority({ kind: 'action-rule' })).toBe('P0');
});

test('字段和表头规则默认作为 P1，展示类对象为 P2', () => {
  expect(getAnnotationPriority({ kind: 'field-rule' })).toBe('P1');
  expect(getAnnotationPriority({ kind: 'table-column-rule' })).toBe('P1');
  expect(getAnnotationPriority({ kind: 'module' })).toBe('P2');
});

test('显式 priority 优先，核心评审模式只保留 P0/P1', () => {
  const notes = [
    { id: 'a', kind: 'module', priority: 'P0' },
    { id: 'b', kind: 'field-rule' },
    { id: 'c', kind: 'module' },
  ];

  expect(getAnnotationPriority(notes[0])).toBe('P0');
  expect(filterAnnotationsForReview(notes, 'core').map((item) => item.id)).toEqual(['a', 'b']);
  expect(filterAnnotationsForReview(notes, 'all')).toEqual(notes);
});
