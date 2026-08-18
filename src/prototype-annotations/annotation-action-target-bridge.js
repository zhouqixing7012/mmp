const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
].join(', ');

const SHARED_ACTION_ATTRIBUTE = 'data-prototype-shared-action-anchor';
let registry = null;
let observer = null;
let scheduled = false;

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeActionText(value) {
  return compactText(value).replace(
    /([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF])\s+(?=[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF])/g,
    '$1'
  );
}

export function decodeActionTargetLabel(target) {
  const parts = String(target || '').split('::');
  if (parts.length !== 3 || parts[1] !== 'button') return '';
  const key = String(parts[2] || '').replace(/-\d+$/, '');
  if (!key || key.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(key)) return '';
  try {
    return decodeURIComponent(key.match(/.{2}/g).map((pair) => `%${pair}`).join(''));
  } catch {
    return '';
  }
}

function pageRoot(pageScope, root) {
  const internalScope = String(pageScope || '').split('::').slice(1).join('::');
  if (!internalScope || !root?.querySelectorAll) return root;
  return Array.from(root.querySelectorAll('[data-prototype-page-scope]'))
    .find((element) => element.getAttribute('data-prototype-page-scope') === internalScope)
    || root;
}

function isVisible(element) {
  if (!element?.isConnected || element.closest?.('[hidden], [aria-hidden="true"]')) return false;
  const style = typeof window !== 'undefined' && window.getComputedStyle
    ? window.getComputedStyle(element)
    : null;
  return style?.display !== 'none' && style?.visibility !== 'hidden';
}

function findUniqueButton(label, pageScope, root) {
  if (!label) return null;
  const searchRoot = pageRoot(pageScope, root);
  const matches = Array.from(searchRoot.querySelectorAll?.('button, [role="button"]') || [])
    .filter((element) => element instanceof Element)
    .filter((element) => !element.closest?.(ANNOTATION_UI_SELECTOR))
    .filter(isVisible)
    .filter((element) => normalizeActionText(element.innerText || element.textContent) === normalizeActionText(label));
  return matches.length === 1 ? matches[0] : null;
}

// Bridge 专用 registry：不改用户看到的标注标题，只让旧 semantic bridge 优先识别
// 当前有效 target 自己代表的动作。历史非人工 target 已由 storage v4 跟随代码基线，
// 人工重绑则 target 本身就是用户明确选择的新动作，因此这里以 target 作为桥接语义是安全的。
export function buildCanonicalActionBridgeRegistry(annotationsByScope = {}) {
  return Object.fromEntries(Object.entries(annotationsByScope).map(([pageScope, annotations]) => [
    pageScope,
    (annotations || []).map((note) => {
      if (note?.kind !== 'action-rule') return note;
      const label = decodeActionTargetLabel(note.target);
      if (!label) return note;
      return { ...note, title: `${label}｜${note.title || ''}` };
    }),
  ]));
}

export function applySharedActionTargetAnchors(pageScope, annotations, root = document) {
  if (!pageScope || !Array.isArray(annotations) || !root?.querySelectorAll) return [];

  const groups = new Map();
  annotations
    .filter((note) => note?.kind === 'action-rule' && typeof note?.target === 'string')
    .forEach((note) => {
      const label = decodeActionTargetLabel(note.target);
      if (!label) return;
      const key = note.target;
      if (!groups.has(key)) groups.set(key, { target: key, label, notes: [] });
      groups.get(key).notes.push(note);
    });

  const applied = [];
  groups.forEach((group) => {
    // 单条 action-rule 仍由原 semantic bridge 负责；这里只解决“多个PRD规则共享同一按钮”。
    if (group.notes.length < 2) return;
    const button = findUniqueButton(group.label, pageScope, root);
    if (!button) return;

    const existing = button.getAttribute('data-prototype-anchor');
    if (existing && existing !== group.target) return;

    button.setAttribute('data-prototype-anchor', group.target);
    button.setAttribute('data-prototype-label', group.label);
    button.setAttribute(SHARED_ACTION_ATTRIBUTE, group.target);
    group.notes.forEach((note) => applied.push({
      noteId: note.id,
      target: group.target,
      label: group.label,
      element: button,
    }));
  });
  return applied;
}

function currentPageScope(root) {
  const node = root.querySelector?.('[data-prototype-page-scope]');
  const internal = node?.getAttribute('data-prototype-page-scope');
  return internal ? `route:/yewurules::${internal}` : '';
}

function run(root = document) {
  const pageScope = currentPageScope(root);
  if (!pageScope || !registry) return;
  applySharedActionTargetAnchors(pageScope, registry[pageScope] || [], root);
}

export function installSharedActionTargetBridge(annotationsByScope, root = document) {
  registry = annotationsByScope || {};
  if (typeof MutationObserver === 'undefined' || !root?.body) return;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    const invoke = () => {
      scheduled = false;
      run(root);
    };
    if (typeof window !== 'undefined' && window.requestAnimationFrame) window.requestAnimationFrame(invoke);
    else setTimeout(invoke, 0);
  };

  if (!observer) {
    observer = new MutationObserver(schedule);
    observer.observe(root.body, { childList: true, subtree: true });
  }
  schedule();
}
