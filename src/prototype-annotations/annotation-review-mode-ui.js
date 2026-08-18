import { readPrototypePageScope } from './annotation-page-scope';
import { getBaselineAnnotationsForScope } from './annotation-coverage-registry';
import { filterAnnotationsForReview, getAnnotationPriority } from './annotation-review-priority';
import { resolvePrototypeTarget } from './annotation-targeting';

const LAUNCHER_ID = 'paf-review-mode-launcher';
const TOOLBAR_ID = 'paf-review-mode-toolbar';
let observer = null;
let mode = 'core';
let currentIndex = 0;

function tag(label, background, color) {
  const node = document.createElement('span');
  node.textContent = label;
  Object.assign(node.style, {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 7px',
    borderRadius: '10px',
    background,
    color,
    fontSize: '11px',
    lineHeight: '18px',
  });
  return node;
}

function priorityTag(priority) {
  if (priority === 'P0') return tag('P0', '#fff1f0', '#cf1322');
  if (priority === 'P1') return tag('P1', '#fffbe6', '#d48806');
  return tag('P2', '#f5f5f5', '#8c8c8c');
}

function currentScope(root) {
  return typeof window !== 'undefined'
    ? readPrototypePageScope(window.location.pathname, root)
    : '';
}

function currentReviewNotes(root) {
  const scope = currentScope(root);
  return filterAnnotationsForReview(getBaselineAnnotationsForScope(scope), mode);
}

function clearHighlight(root) {
  root.querySelectorAll?.('.paf-review-focus').forEach((element) => {
    element.classList.remove('paf-review-focus');
  });
}

function ensureReviewStyle(root) {
  if (root.getElementById?.('paf-review-mode-style')) return;
  const style = document.createElement('style');
  style.id = 'paf-review-mode-style';
  style.setAttribute('data-prototype-annotation-ui', 'true');
  style.textContent = `
    .paf-review-focus {
      outline: 3px solid #722ed1 !important;
      outline-offset: 3px !important;
      border-radius: 4px !important;
      box-shadow: 0 0 0 5px rgba(114,46,209,.12) !important;
    }
  `;
  document.head.appendChild(style);
}

function expandPanelNote(noteId, root) {
  const row = Array.from(root.querySelectorAll?.('[data-annotation-note-id]') || [])
    .find((element) => element.getAttribute('data-annotation-note-id') === noteId);
  if (!row) return;
  const alreadyExpanded = row.children.length > 1;
  if (!alreadyExpanded) {
    row.querySelector('.paf-note-item')?.click();
  }
}

function focusNote(note, root) {
  if (!note) return;
  clearHighlight(root);
  const scope = currentScope(root);
  const element = resolvePrototypeTarget(note.target, scope, root);
  if (element) {
    element.classList.add('paf-review-focus');
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }
  expandPanelNote(note.id, root);
}

function button(label, onClick, options = {}) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = label;
  Object.assign(node.style, {
    border: options.primary ? '1px solid #722ed1' : '1px solid #d9d9d9',
    borderRadius: '5px',
    background: options.primary ? '#722ed1' : '#fff',
    color: options.primary ? '#fff' : '#595959',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: options.primary ? '600' : '400',
  });
  node.onclick = onClick;
  return node;
}

function renderToolbar(root = document) {
  root.getElementById?.(TOOLBAR_ID)?.remove();
  ensureReviewStyle(root);

  const notes = currentReviewNotes(root);
  if (!notes.length) currentIndex = 0;
  else currentIndex = Math.max(0, Math.min(currentIndex, notes.length - 1));
  const current = notes[currentIndex] || null;

  const bar = document.createElement('div');
  bar.id = TOOLBAR_ID;
  bar.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(bar.style, {
    position: 'fixed',
    left: '50%',
    bottom: '20px',
    transform: 'translateX(-50%)',
    minWidth: 'min(680px, calc(100vw - 32px))',
    maxWidth: 'calc(100vw - 32px)',
    zIndex: '22100',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0,1fr) auto',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '10px',
    boxShadow: '0 10px 32px rgba(0,0,0,.18)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  });

  const left = document.createElement('div');
  Object.assign(left.style, { display: 'flex', gap: '6px', alignItems: 'center' });
  const core = button('P0+P1', () => {
    mode = 'core';
    currentIndex = 0;
    renderToolbar(root);
    focusNote(currentReviewNotes(root)[0], root);
  }, { primary: mode === 'core' });
  const all = button('全部', () => {
    mode = 'all';
    currentIndex = 0;
    renderToolbar(root);
    focusNote(currentReviewNotes(root)[0], root);
  }, { primary: mode === 'all' });
  left.append(core, all);

  const center = document.createElement('div');
  Object.assign(center.style, { minWidth: 0 });
  if (current) {
    const titleRow = document.createElement('div');
    Object.assign(titleRow.style, { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 });
    titleRow.appendChild(priorityTag(getAnnotationPriority(current)));
    const index = document.createElement('span');
    index.textContent = `${currentIndex + 1} / ${notes.length}`;
    Object.assign(index.style, { fontSize: '11px', color: '#8c8c8c', flexShrink: 0 });
    const title = document.createElement('strong');
    title.textContent = current.title || current.id;
    Object.assign(title.style, { fontSize: '13px', color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
    titleRow.append(index, title);
    const summary = document.createElement('div');
    summary.textContent = current.summary || '';
    Object.assign(summary.style, { marginTop: '3px', fontSize: '11px', color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
    center.append(titleRow, summary);
  } else {
    center.textContent = '当前页面没有可评审的基线标注';
    Object.assign(center.style, { fontSize: '12px', color: '#8c8c8c' });
  }

  const right = document.createElement('div');
  Object.assign(right.style, { display: 'flex', gap: '6px', alignItems: 'center' });
  const prev = button('← 上一条', () => {
    const list = currentReviewNotes(root);
    if (!list.length) return;
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    renderToolbar(root);
    focusNote(list[currentIndex], root);
  });
  const next = button('下一条 →', () => {
    const list = currentReviewNotes(root);
    if (!list.length) return;
    currentIndex = (currentIndex + 1) % list.length;
    renderToolbar(root);
    focusNote(list[currentIndex], root);
  }, { primary: true });
  const close = button('结束', () => {
    clearHighlight(root);
    bar.remove();
  });
  right.append(prev, next, close);

  bar.append(left, center, right);
  document.body.appendChild(bar);

  if (current) focusNote(current, root);
}

function ensureLauncher(root = document) {
  const annotationPanelVisible = Boolean(root.querySelector?.('.paf-annotation-panel'));
  const existing = root.getElementById?.(LAUNCHER_ID);
  if (!annotationPanelVisible) {
    existing?.remove();
    root.getElementById?.(TOOLBAR_ID)?.remove();
    clearHighlight(root);
    return;
  }
  if (existing) return;

  const launcher = document.createElement('button');
  launcher.id = LAUNCHER_ID;
  launcher.type = 'button';
  launcher.textContent = '评审模式';
  launcher.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(launcher.style, {
    position: 'fixed',
    left: '16px',
    bottom: '124px',
    zIndex: '22055',
    border: '1px solid #13c2c2',
    borderRadius: '16px',
    background: '#e6fffb',
    color: '#08979c',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,.12)',
  });
  launcher.onclick = () => {
    currentIndex = 0;
    renderToolbar(root);
  };
  document.body.appendChild(launcher);
}

export function installAnnotationReviewModeUi(root = document) {
  if (typeof MutationObserver === 'undefined' || !root?.body) return;
  ensureLauncher(root);
  if (observer) return;
  observer = new MutationObserver(() => ensureLauncher(root));
  observer.observe(root.body, { childList: true, subtree: true });
}
