import { readPrototypePageScope } from './annotation-page-scope';

const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
].join(', ');

export const SEMANTIC_ACTION_ANCHOR_ATTRIBUTE = 'data-prototype-semantic-action-anchor';

const COMMON_ACTION_LABELS = [
  '领用确认',
  '确认加签',
  '执行出库',
  '已阅读',
  '不同意',
  '鉴定不通过',
  '鉴定通过',
  '同意',
  '驳回',
  '返回',
  '加签',
  '弃领',
  '退回',
  '通过',
  '不通过',
  '确认',
  '取消',
  '提交',
  '保存',
].sort((left, right) => right.length - left.length);

let bridgeObserver = null;
let bridgeRegistry = null;
let scheduled = false;
let activePageScope = '';
let activeAnnotations = [];

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeHexSemanticKey(target) {
  const parts = String(target || '').split('::');
  if (parts.length !== 3 || parts[1] !== 'button') return '';

  const key = String(parts[2] || '').replace(/-\d+$/, '');
  if (!key || key.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(key)) return '';

  try {
    const encoded = key.match(/.{2}/g).map((pair) => `%${pair}`).join('');
    return decodeURIComponent(encoded);
  } catch {
    return '';
  }
}

function inferActionLabel(note) {
  const decoded = decodeHexSemanticKey(note?.target);
  if (decoded) return compactText(decoded);

  const semanticText = [
    note?.title,
    note?.summary,
    ...(note?.sections || []).flatMap((section) => [
      section?.title,
      ...(section?.items || []).map((item) => item?.text),
    ]),
  ].filter(Boolean).join(' ');

  return COMMON_ACTION_LABELS.find((label) => semanticText.includes(label)) || '';
}

function isAnnotationUi(element) {
  return Boolean(element?.closest?.(ANNOTATION_UI_SELECTOR));
}

function isHiddenActionButton(element) {
  if (!element?.isConnected) return true;
  if (element.closest?.('[aria-hidden="true"], [hidden]')) return true;

  const style = typeof window !== 'undefined' && window.getComputedStyle
    ? window.getComputedStyle(element)
    : null;
  return style?.display === 'none' || style?.visibility === 'hidden';
}

function getButtonText(element) {
  return compactText(element?.innerText || element?.textContent);
}

function findUniqueActionButton(label, root) {
  if (!label) return null;

  const matches = Array.from(root.querySelectorAll?.('button, [role="button"]') || [])
    .filter((element) => element instanceof Element)
    .filter((element) => !isAnnotationUi(element))
    .filter((element) => !isHiddenActionButton(element))
    .filter((element) => getButtonText(element) === label);

  return matches.length === 1 ? matches[0] : null;
}

function actionNotesWithLabels(annotations) {
  return (Array.isArray(annotations) ? annotations : [])
    .filter((note) => note?.kind === 'action-rule' && typeof note?.target === 'string')
    .map((note) => ({ note, label: inferActionLabel(note) }))
    .filter((item) => item.label);
}

function clearStaleSemanticActionAnchors(pageScope, annotations, root) {
  const activeOwners = new Set(
    actionNotesWithLabels(annotations).map(({ note }) => `${pageScope}::${note.id}`)
  );

  Array.from(root.querySelectorAll?.(`[${SEMANTIC_ACTION_ANCHOR_ATTRIBUTE}]`) || [])
    .forEach((element) => {
      const owner = element.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);
      if (activeOwners.has(owner)) return;

      // 只清理桥接器自己写入的运行时 anchor；JSX 中显式 data-prototype-anchor 没有该标记，绝不动。
      element.removeAttribute('data-prototype-anchor');
      element.removeAttribute('data-prototype-label');
      element.removeAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);
    });
}

export function applySemanticActionAnchors(pageScope, annotations, root = document) {
  if (!pageScope || !Array.isArray(annotations) || !root?.querySelectorAll) return [];

  clearStaleSemanticActionAnchors(pageScope, annotations, root);

  const actionItems = actionNotesWithLabels(annotations);
  const labelCounts = actionItems.reduce((counts, { label }) => {
    counts.set(label, (counts.get(label) || 0) + 1);
    return counts;
  }, new Map());
  const applied = [];

  actionItems.forEach(({ note, label }) => {
    // 同一页若两条 action-rule 都声称属于同一个按钮文案，不自动猜测归属。
    if (labelCounts.get(label) !== 1) return;

    const button = findUniqueActionButton(label, root);
    if (!button) return;

    const owner = `${pageScope}::${note.id}`;
    const existingAnchor = button.getAttribute('data-prototype-anchor');
    const existingSemanticOwner = button.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);

    // 显式 JSX anchor 始终优先；但桥接器自己在上一个页面留下的 stale anchor 必须允许覆盖。
    if (existingAnchor && existingAnchor !== note.target && !existingSemanticOwner) return;

    button.setAttribute('data-prototype-anchor', note.target);
    button.setAttribute('data-prototype-label', label);
    button.setAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE, owner);
    applied.push({ noteId: note.id, target: note.target, label, element: button });
  });

  return applied;
}

export function setActiveSemanticActionAnnotations(pageScope, annotations, root = document) {
  activePageScope = typeof pageScope === 'string' ? pageScope : '';
  activeAnnotations = Array.isArray(annotations) ? annotations : [];

  if (activePageScope && root?.querySelectorAll) {
    applySemanticActionAnchors(activePageScope, activeAnnotations, root);
  }
}

function applyCurrentScope(root = document) {
  if (typeof window === 'undefined' || !root?.querySelector) return;

  const currentScope = readPrototypePageScope(window.location.pathname, root);
  if (activePageScope === currentScope) {
    applySemanticActionAnchors(currentScope, activeAnnotations, root);
    return;
  }

  // 页面切换时 activeNotes 的 React effect 可能晚于 DOM 更新一拍。
  // 先清掉旧页运行时 semantic anchor，再用当前 scope 的代码基线兜底；
  // 等 activeNotes 更新后会自动切换到最终有效标注集合。
  clearStaleSemanticActionAnchors(currentScope, [], root);
  const annotations = bridgeRegistry?.[currentScope] || [];
  applySemanticActionAnchors(currentScope, annotations, root);
}

function scheduleApply(root = document) {
  if (scheduled || typeof window === 'undefined') return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyCurrentScope(root);
  });
}

export function installSemanticActionAnchorBridge(registry, root = document) {
  bridgeRegistry = registry || {};
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined' || !root?.body) return;

  applyCurrentScope(root);

  if (bridgeObserver) return;

  // 业务页在同一路由内切换、异步渲染按钮、弹窗出现时都可能晚于第一次标注扫描。
  // Observer 始终基于“当前 active annotations”重放 semantic anchor，避免时序依赖。
  bridgeObserver = new MutationObserver(() => scheduleApply(root));
  bridgeObserver.observe(root.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-prototype-page-scope'],
  });

  window.addEventListener('popstate', () => scheduleApply(root));
}
