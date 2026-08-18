import { readPrototypePageScope } from './annotation-page-scope';

const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
].join(', ');

export const SEMANTIC_ACTION_ANCHOR_ATTRIBUTE = 'data-prototype-semantic-action-anchor';
const SEMANTIC_ACTION_REFRESH_ATTRIBUTE = 'data-prototype-semantic-action-refresh';

const COMMON_ACTION_LABELS = [
  '发送领用通知',
  '领用确认',
  '确认加签',
  '执行出库',
  '鉴定不通过',
  '鉴定通过',
  '已阅读',
  '不同意',
  '同意',
  '驳回',
  '返回',
  '加签',
  '转签',
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

function findKnownActionLabel(value) {
  const text = compactText(value);
  return COMMON_ACTION_LABELS.find((label) => text.includes(label)) || '';
}

function inferActionLabel(note) {
  // action-rule 的业务语义必须以标注内容为准，而不是以历史 target 为准。
  // target 可能来自旧页面结构、旧 Card 上下文或用户历史覆盖；只要它还能被解码，
  // 旧逻辑就会错误地短路到旧按钮，导致“标注明明写同意，但始终匹配不上同意按钮”。
  // 因此优先级固定为：标题 > 说明/规则正文 > target 最后兜底。
  const titleLabel = findKnownActionLabel(note?.title);
  if (titleLabel) return titleLabel;

  const semanticText = [
    note?.summary,
    ...(note?.sections || []).flatMap((section) => [
      section?.title,
      ...(section?.items || []).map((item) => item?.text),
    ]),
  ].filter(Boolean).join(' ');
  const semanticLabel = findKnownActionLabel(semanticText);
  if (semanticLabel) return semanticLabel;

  return compactText(decodeHexSemanticKey(note?.target));
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

function findCurrentPageRoot(pageScope, root) {
  if (!root?.querySelectorAll || !pageScope) return root;

  const scopeValue = String(pageScope).replace(/^route:\/yewurules::/, '');
  const candidates = Array.from(root.querySelectorAll('[data-prototype-page-scope]'));
  return candidates.find((element) => element.getAttribute('data-prototype-page-scope') === scopeValue) || root;
}

function findUniqueActionButton(label, pageScope, root) {
  if (!label) return null;

  const searchRoot = findCurrentPageRoot(pageScope, root);
  const matches = Array.from(searchRoot.querySelectorAll?.('button, [role="button"]') || [])
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

function notifyAnnotationLayerRescan(root) {
  const host = root?.body || root?.documentElement;
  if (!host || typeof document === 'undefined') return;

  const marker = document.createElement('span');
  marker.setAttribute('data-prototype-annotation-ui', 'true');
  marker.setAttribute(SEMANTIC_ACTION_REFRESH_ATTRIBUTE, 'true');
  marker.hidden = true;
  host.appendChild(marker);
  marker.remove();
}

function clearStaleSemanticActionAnchors(pageScope, annotations, root) {
  const activeOwners = new Set(
    actionNotesWithLabels(annotations).map(({ note }) => `${pageScope}::${note.id}`)
  );
  let changed = false;

  Array.from(root.querySelectorAll?.(`[${SEMANTIC_ACTION_ANCHOR_ATTRIBUTE}]`) || [])
    .forEach((element) => {
      const owner = element.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);
      if (activeOwners.has(owner)) return;

      element.removeAttribute('data-prototype-anchor');
      element.removeAttribute('data-prototype-label');
      element.removeAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);
      changed = true;
    });

  return changed;
}

export function applySemanticActionAnchors(pageScope, annotations, root = document) {
  if (!pageScope || !Array.isArray(annotations) || !root?.querySelectorAll) return [];

  let changed = clearStaleSemanticActionAnchors(pageScope, annotations, root);

  const actionItems = actionNotesWithLabels(annotations);
  const labelCounts = actionItems.reduce((counts, { label }) => {
    counts.set(label, (counts.get(label) || 0) + 1);
    return counts;
  }, new Map());
  const applied = [];

  actionItems.forEach(({ note, label }) => {
    if (labelCounts.get(label) !== 1) return;

    const button = findUniqueActionButton(label, pageScope, root);
    if (!button) return;

    const owner = `${pageScope}::${note.id}`;
    const existingAnchor = button.getAttribute('data-prototype-anchor');
    const existingSemanticOwner = button.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE);

    if (existingAnchor && !existingSemanticOwner) {
      if (existingAnchor === note.target) {
        applied.push({ noteId: note.id, target: note.target, label, element: button });
      }
      return;
    }

    const needsWrite = (
      existingAnchor !== note.target
      || existingSemanticOwner !== owner
      || button.getAttribute('data-prototype-label') !== label
    );

    if (needsWrite) {
      button.setAttribute('data-prototype-anchor', note.target);
      button.setAttribute('data-prototype-label', label);
      button.setAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE, owner);
      changed = true;
    }

    applied.push({ noteId: note.id, target: note.target, label, element: button });
  });

  if (changed) notifyAnnotationLayerRescan(root);
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

  const cleared = clearStaleSemanticActionAnchors(currentScope, [], root);
  if (cleared) notifyAnnotationLayerRescan(root);
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

  bridgeObserver = new MutationObserver(() => scheduleApply(root));
  bridgeObserver.observe(root.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-prototype-page-scope'],
  });

  window.addEventListener('popstate', () => scheduleApply(root));
}
