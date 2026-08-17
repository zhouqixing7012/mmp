import { listPrototypeTargets } from './annotation-targeting';

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
}

export function scanPrototypeAnchors(root = document, pageKey = 'page') {
  return listPrototypeTargets(pageKey, root).map((item, index) => ({
    index,
    target: item.target,
    generated: item.generated,
    kind: item.kind,
    label: item.label,
    tagName: item.element.tagName.toLowerCase(),
    role: item.element.getAttribute('role') || '',
    ariaLabel: item.element.getAttribute('aria-label') || '',
    text: compactText(item.element.innerText || item.element.textContent).slice(0, 1600),
    visible: isElementVisible(item.element),
  }));
}

export function buildPrototypeAnchorContext(pageKey, pathname = window.location.pathname) {
  return {
    version: 2,
    pageKey,
    pathname,
    capturedAt: new Date().toISOString(),
    anchors: scanPrototypeAnchors(document, pageKey),
  };
}

export function serializePrototypeAnchorContext(pageKey, pathname) {
  return JSON.stringify(buildPrototypeAnchorContext(pageKey, pathname), null, 2);
}
