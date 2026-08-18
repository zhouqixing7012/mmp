const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
].join(', ');

const FIELD_LABEL_ANCHOR_ATTRIBUTE = 'data-prototype-field-label-anchor';
let registry = null;
let observer = null;
let scheduled = false;

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().replace(/[:：]\s*$/, '');
}

function decodeTargetLabel(target) {
  const parts = String(target || '').split('::');
  if (parts.length !== 3 || !['control', 'field', 'form-field'].includes(parts[1])) return '';
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

function nearbyLabel(element) {
  if (!(element instanceof Element)) return '';

  const explicit = compactText(element.getAttribute('aria-label') || element.getAttribute('data-prototype-label'));
  if (explicit) return explicit;

  // DetailGrid / Form.Item 已由 targeting 原生识别，这里只补普通“文字标题 + Input/TextArea”组合。
  const directPrevious = element.previousElementSibling;
  if (directPrevious?.matches?.('label, .ant-typography, strong, [data-prototype-title]')) {
    const value = compactText(directPrevious.textContent);
    if (value && value.length <= 40) return value;
  }

  const parent = element.parentElement;
  const previous = parent?.previousElementSibling;
  if (previous?.matches?.('label, .ant-typography, strong, [data-prototype-title]')) {
    const value = compactText(previous.textContent);
    if (value && value.length <= 40) return value;
  }

  // AntD TextArea/Input 有时被一层 wrapper 包住；在同一父容器中找位于控件之前、最近的简短文字标签。
  const siblings = Array.from(parent?.children || []);
  const index = siblings.indexOf(element);
  if (index > 0) {
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const sibling = siblings[cursor];
      if (!sibling?.matches?.('label, .ant-typography, strong')) continue;
      const value = compactText(sibling.textContent);
      if (value && value.length <= 40) return value;
    }
  }

  return '';
}

function candidateControls(searchRoot, label) {
  if (!label || !searchRoot?.querySelectorAll) return [];
  const selector = [
    'textarea',
    'input:not([type="hidden"])',
    '.ant-input-affix-wrapper',
    '.ant-input-number',
  ].join(',');
  return Array.from(searchRoot.querySelectorAll(selector))
    .filter((element) => element instanceof Element)
    .filter((element) => !element.closest?.(ANNOTATION_UI_SELECTOR))
    .filter(isVisible)
    .filter((element) => compactText(nearbyLabel(element)) === compactText(label));
}

export function applyFieldLabelAnchors(pageScope, annotations, root = document) {
  if (!pageScope || !Array.isArray(annotations) || !root?.querySelectorAll) return [];
  const searchRoot = pageRoot(pageScope, root);
  const applied = [];

  annotations
    .filter((note) => note?.kind === 'field-rule' && typeof note?.target === 'string')
    .forEach((note) => {
      const label = decodeTargetLabel(note.target);
      if (!label) return;
      const matches = candidateControls(searchRoot, label);
      if (matches.length !== 1) return;
      const control = matches[0];
      const existing = control.getAttribute('data-prototype-anchor');
      if (existing && existing !== note.target) return;

      control.setAttribute('data-prototype-anchor', note.target);
      control.setAttribute('data-prototype-label', label);
      control.setAttribute(FIELD_LABEL_ANCHOR_ATTRIBUTE, note.target);
      applied.push({ noteId: note.id, target: note.target, label, element: control });
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
  applyFieldLabelAnchors(pageScope, registry[pageScope] || [], root);
}

export function installFieldLabelAnchorBridge(annotationsByScope, root = document) {
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
