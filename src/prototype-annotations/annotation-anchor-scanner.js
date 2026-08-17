function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
}

export function scanPrototypeAnchors(root = document) {
  return Array.from(root.querySelectorAll('[data-prototype-anchor]')).map((element, index) => ({
    index,
    target: element.getAttribute('data-prototype-anchor'),
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute('role') || '',
    ariaLabel: element.getAttribute('aria-label') || '',
    text: compactText(element.innerText || element.textContent).slice(0, 1600),
    visible: isElementVisible(element),
  }));
}

export function buildPrototypeAnchorContext(pageKey, pathname = window.location.pathname) {
  return {
    version: 1,
    pageKey,
    pathname,
    capturedAt: new Date().toISOString(),
    anchors: scanPrototypeAnchors(document),
  };
}

export function serializePrototypeAnchorContext(pageKey, pathname) {
  return JSON.stringify(buildPrototypeAnchorContext(pageKey, pathname), null, 2);
}
