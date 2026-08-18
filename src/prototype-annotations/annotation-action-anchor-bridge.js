import { readPrototypePageScope } from './annotation-page-scope';

const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
].join(', ');

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
  } catch (error) {
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

function getButtonText(element) {
  return compactText(element?.innerText || element?.textContent);
}

function findUniqueActionButton(label, root) {
  if (!label) return null;

  const matches = Array.from(root.querySelectorAll?.('button, [role="button"]') || [])
    .filter((element) => element instanceof Element)
    .filter((element) => !isAnnotationUi(element))
    .filter((element) => getButtonText(element) === label);

  return matches.length === 1 ? matches[0] : null;
}

export function applySemanticActionAnchors(pageScope, annotations, root = document) {
  if (!pageScope || !Array.isArray(annotations) || !root?.querySelectorAll) return [];

  const applied = [];

  annotations
    .filter((note) => note?.kind === 'action-rule' && typeof note?.target === 'string')
    .forEach((note) => {
      const label = inferActionLabel(note);
      const button = findUniqueActionButton(label, root);
      if (!button) return;

      const existingAnchor = button.getAttribute('data-prototype-anchor');
      if (existingAnchor && existingAnchor !== note.target) return;

      button.setAttribute('data-prototype-anchor', note.target);
      button.setAttribute('data-prototype-label', label);
      applied.push({ noteId: note.id, target: note.target, label, element: button });
    });

  return applied;
}

function applyCurrentScope(root = document) {
  if (!bridgeRegistry || typeof window === 'undefined' || !root?.querySelector) return;

  const pageScope = readPrototypePageScope(window.location.pathname, root);
  const annotations = bridgeRegistry[pageScope] || [];
  applySemanticActionAnchors(pageScope, annotations, root);
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
