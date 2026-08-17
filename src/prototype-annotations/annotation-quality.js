const TARGET_FRAGMENTS_BY_KIND = {
  'action-rule': ['::button::'],
  'field-rule': [
    '::detail-field::',
    '::query-condition::',
    '::form-field::',
    '::field::',
    '::control::',
    '::select::',
    '::date-picker::',
    '::upload::',
    '::radio::',
    '::checkbox::',
    '::switch::',
  ],
  'tab-rule': ['::tab::'],
  'table-column-rule': ['::table-column::'],
};

function matchesAnyFragment(target, fragments) {
  return fragments.some((fragment) => String(target || '').includes(fragment));
}

// 位置准确性检查：具体对象规则不能为了“能匹配”而回退到 Card / module。
export function validateAnnotationGranularity(annotations = []) {
  const issues = [];

  annotations.forEach((note) => {
    const expectedFragments = TARGET_FRAGMENTS_BY_KIND[note.kind];
    if (!expectedFragments) return;

    if (!matchesAnyFragment(note.target, expectedFragments)) {
      issues.push({
        type: 'granularity',
        annotationId: note.id,
        kind: note.kind,
        target: note.target,
        message: `${note.kind} 必须绑定到对应的细粒度对象，不能回退到模块级 target`,
      });
    }
  });

  return issues;
}

// 完整性检查：PRD 重点必须显式进入覆盖清单；找不到目标时标记 review，禁止静默丢弃。
// requirement: { id, annotationId, status: 'bound' | 'review' | 'skip', reason?, expectedTargetFragment? }
export function validateRequirementCoverage(requirements = [], annotations = []) {
  const issues = [];
  const annotationById = new Map(annotations.map((note) => [note.id, note]));
  const requirementIds = new Set();

  requirements.forEach((requirement) => {
    if (!requirement?.id) {
      issues.push({ type: 'coverage', message: '覆盖清单存在缺少 id 的 PRD 重点' });
      return;
    }
    if (requirementIds.has(requirement.id)) {
      issues.push({ type: 'coverage', requirementId: requirement.id, message: 'PRD 重点 id 重复' });
      return;
    }
    requirementIds.add(requirement.id);

    if (requirement.status === 'bound') {
      const note = annotationById.get(requirement.annotationId);
      if (!note) {
        issues.push({
          type: 'coverage',
          requirementId: requirement.id,
          annotationId: requirement.annotationId,
          message: 'PRD 重点标记为已绑定，但没有对应标注',
        });
        return;
      }
      if (
        requirement.expectedTargetFragment
        && !String(note.target || '').includes(requirement.expectedTargetFragment)
      ) {
        issues.push({
          type: 'coverage',
          requirementId: requirement.id,
          annotationId: requirement.annotationId,
          message: 'PRD 重点已绑定，但 target 粒度/对象与覆盖清单不一致',
        });
      }
      return;
    }

    if (!['review', 'skip'].includes(requirement.status)) {
      issues.push({
        type: 'coverage',
        requirementId: requirement.id,
        message: 'PRD 重点必须明确标记为 bound / review / skip 之一',
      });
      return;
    }

    if (!String(requirement.reason || '').trim()) {
      issues.push({
        type: 'coverage',
        requirementId: requirement.id,
        message: `${requirement.status} 状态必须说明原因，避免规则被静默遗漏`,
      });
    }
  });

  return issues;
}
