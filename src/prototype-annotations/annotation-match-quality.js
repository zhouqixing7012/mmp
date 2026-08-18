import {
  GENERATED_SCOPE_ATTRIBUTE,
  GENERATED_TARGET_ATTRIBUTE,
  preparePrototypeTargets,
  resolvePrototypeTarget,
} from './annotation-targeting';

function splitTarget(target) {
  const parts = String(target || '').split('::');
  if (parts.length !== 3) return null;
  return { context: parts[0], kind: parts[1], key: parts[2] };
}

function internalScopeFromPageScope(pageScope) {
  const parts = String(pageScope || '').split('::');
  return parts.length > 1 ? parts.slice(1).join('::') : '';
}

function currentPageRoot(pageScope, root) {
  const internalScope = internalScopeFromPageScope(pageScope);
  if (!internalScope || !root?.querySelectorAll) return root;
  return Array.from(root.querySelectorAll('[data-prototype-page-scope]'))
    .find((element) => element.getAttribute('data-prototype-page-scope') === internalScope)
    || root;
}

function exactAttributeMatches(searchRoot, attribute, value) {
  if (!searchRoot?.querySelectorAll || !value) return [];
  return Array.from(searchRoot.querySelectorAll(`[${attribute}]`))
    .filter((element) => element.getAttribute(attribute) === value);
}

function generatedSemanticMatches(searchRoot, wanted, pageScope) {
  if (!wanted || !searchRoot?.querySelectorAll) return [];
  return Array.from(searchRoot.querySelectorAll(`[${GENERATED_TARGET_ATTRIBUTE}]`))
    .filter((element) => element.getAttribute(GENERATED_SCOPE_ATTRIBUTE) === (pageScope || 'page'))
    .filter((element) => {
      const current = splitTarget(element.getAttribute(GENERATED_TARGET_ATTRIBUTE));
      return Boolean(current && current.kind === wanted.kind && current.key === wanted.key);
    });
}

function describeElement(element) {
  if (!(element instanceof Element)) return null;
  return {
    tag: element.tagName.toLowerCase(),
    text: String(element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim(),
    anchor: element.getAttribute('data-prototype-anchor') || '',
    generatedTarget: element.getAttribute(GENERATED_TARGET_ATTRIBUTE) || '',
  };
}

export function analyzeAnnotationMatch(note, pageScope, root = document) {
  if (!note?.target) {
    return {
      noteId: note?.id || '',
      status: 'unmatched',
      confidence: 'none',
      label: '未匹配',
      reason: '标注缺少 target',
      candidateCount: 0,
      element: null,
    };
  }

  const pageRoot = currentPageRoot(pageScope, root);
  preparePrototypeTargets(pageScope, pageRoot);

  const wanted = splitTarget(note.target);
  const exactAnchors = exactAttributeMatches(pageRoot, 'data-prototype-anchor', note.target);
  const exactGenerated = exactAttributeMatches(pageRoot, GENERATED_TARGET_ATTRIBUTE, note.target)
    .filter((element) => element.getAttribute(GENERATED_SCOPE_ATTRIBUTE) === (pageScope || 'page'));
  const semanticMatches = generatedSemanticMatches(pageRoot, wanted, pageScope);
  const resolved = resolvePrototypeTarget(note.target, pageScope, root);

  if (exactAnchors.length > 1 || exactGenerated.length > 1) {
    return {
      noteId: note.id,
      status: 'ambiguous',
      confidence: 'none',
      label: '歧义',
      reason: `发现 ${Math.max(exactAnchors.length, exactGenerated.length)} 个完全相同的 target，不能证明唯一归属`,
      candidateCount: Math.max(exactAnchors.length, exactGenerated.length),
      element: describeElement(resolved),
    };
  }

  if (exactAnchors.length === 1) {
    return {
      noteId: note.id,
      status: 'exact',
      confidence: 'high',
      label: '精确',
      reason: '当前 pageScope 内唯一显式 anchor 完全命中',
      candidateCount: 1,
      element: describeElement(exactAnchors[0]),
    };
  }

  if (exactGenerated.length === 1) {
    return {
      noteId: note.id,
      status: 'exact',
      confidence: 'high',
      label: '精确',
      reason: '当前 pageScope 内唯一 generated target 完全命中',
      candidateCount: 1,
      element: describeElement(exactGenerated[0]),
    };
  }

  if (!resolved && semanticMatches.length > 1) {
    return {
      noteId: note.id,
      status: 'ambiguous',
      confidence: 'none',
      label: '歧义',
      reason: `同类型、同语义 key 找到 ${semanticMatches.length} 个候选，系统未自动猜测`,
      candidateCount: semanticMatches.length,
      element: null,
    };
  }

  if (resolved) {
    return {
      noteId: note.id,
      status: 'semantic',
      confidence: 'medium',
      label: '语义兼容',
      reason: '未完全命中原 target，但当前 pageScope 内找到唯一兼容语义对象',
      candidateCount: Math.max(1, semanticMatches.length),
      element: describeElement(resolved),
    };
  }

  return {
    noteId: note.id,
    status: 'unmatched',
    confidence: 'none',
    label: '未匹配',
    reason: semanticMatches.length === 0
      ? '当前 pageScope 内未找到对应 target 或唯一语义候选'
      : '存在候选但 resolver 未能唯一确认',
    candidateCount: semanticMatches.length,
    element: null,
  };
}

export function analyzeAnnotationMatches(annotations = [], pageScope, root = document) {
  const items = annotations.map((note) => ({ note, match: analyzeAnnotationMatch(note, pageScope, root) }));
  const counts = items.reduce((summary, item) => {
    summary[item.match.status] = (summary[item.match.status] || 0) + 1;
    return summary;
  }, { exact: 0, semantic: 0, ambiguous: 0, unmatched: 0 });

  return { items, counts };
}
