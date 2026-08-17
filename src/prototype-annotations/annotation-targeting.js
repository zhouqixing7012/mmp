export const GENERATED_TARGET_ATTRIBUTE = 'data-prototype-generated-target';
export const TARGET_KIND_ATTRIBUTE = 'data-prototype-target-kind';
export const TARGET_LABEL_ATTRIBUTE = 'data-prototype-target-label';

const BINDABLE_SELECTOR = [
  '[data-prototype-bindable]',
  '.qw',
  'button',
  '[role="button"]',
  'th',
  '[role="columnheader"]',
  '.ant-form-item',
].join(',');

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableKey(value) {
  const text = compactText(value).toLowerCase() || 'item';
  return encodeURIComponent(text)
    .replace(/%/g, '')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 56) || 'item';
}

function getTargetKind(element) {
  const explicitKind = element.getAttribute('data-prototype-bindable');
  if (explicitKind) return explicitKind;
  if (element.matches('button, [role="button"]')) return 'button';
  if (element.matches('th, [role="columnheader"]')) return 'table-column';
  if (element.matches('.qw, .ant-form-item')) return 'field';
  return element.tagName.toLowerCase();
}

function getTargetLabel(element) {
  const explicitLabel = element.getAttribute('data-prototype-label');
  if (explicitLabel) return compactText(explicitLabel);

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return compactText(ariaLabel);

  const title = element.getAttribute('title');
  if (title) return compactText(title);

  if (element.matches('.qw')) {
    const label = element.querySelector(':scope > div > span:first-child, :scope span:first-child');
    const text = compactText(label?.textContent).replace(/[:：]\s*$/, '');
    if (text) return text;
  }

  if (element.matches('.ant-form-item')) {
    const label = element.querySelector('.ant-form-item-label label');
    const text = compactText(label?.textContent).replace(/[:：]\s*$/, '');
    if (text) return text;
  }

  const placeholder = element.getAttribute('placeholder');
  if (placeholder) return compactText(placeholder);

  return compactText(element.innerText || element.textContent).slice(0, 120);
}

function getBaseTarget(element, pageKey) {
  const parentAnchor = element.closest('[data-prototype-anchor]');
  const anchorTarget = parentAnchor?.getAttribute('data-prototype-anchor');
  return anchorTarget || pageKey || 'page';
}

function isAnnotationUi(element) {
  return Boolean(element.closest('.paf-annotation-panel, .paf-hotspot, [data-prototype-annotation-ui="true"]'));
}

function isRedundantContainer(element) {
  if (!element.matches('.qw, .ant-form-item')) return false;
  return Boolean(element.querySelector('[data-prototype-bindable]'));
}

function clearGeneratedTargets(root) {
  root.querySelectorAll(`[${GENERATED_TARGET_ATTRIBUTE}]`).forEach((element) => {
    if (isAnnotationUi(element)) return;
    element.removeAttribute(GENERATED_TARGET_ATTRIBUTE);
    element.removeAttribute(TARGET_KIND_ATTRIBUTE);
    element.removeAttribute(TARGET_LABEL_ATTRIBUTE);
  });
}

export function preparePrototypeTargets(pageKey, root = document) {
  clearGeneratedTargets(root);

  const counters = new Map();
  const candidates = Array.from(root.querySelectorAll(BINDABLE_SELECTOR));
  const prepared = [];

  candidates.forEach((element) => {
    if (!(element instanceof Element) || isAnnotationUi(element)) return;
    if (element.hasAttribute('data-prototype-anchor') || isRedundantContainer(element)) return;

    const kind = getTargetKind(element);
    const label = getTargetLabel(element);
    if (!label && !element.hasAttribute('data-prototype-bindable')) return;

    const base = getBaseTarget(element, pageKey);
    const key = `${base}|${kind}|${stableKey(label)}`;
    const occurrence = (counters.get(key) || 0) + 1;
    counters.set(key, occurrence);

    const suffix = occurrence > 1 ? `-${occurrence}` : '';
    const target = `${base}::${kind}::${stableKey(label)}${suffix}`;

    element.setAttribute(GENERATED_TARGET_ATTRIBUTE, target);
    element.setAttribute(TARGET_KIND_ATTRIBUTE, kind);
    element.setAttribute(TARGET_LABEL_ATTRIBUTE, label || kind);

    prepared.push({ element, target, kind, label: label || kind, generated: true });
  });

  return prepared;
}

export function resolvePrototypeTarget(target, root = document) {
  if (!target) return null;
  const elements = root.querySelectorAll(`[data-prototype-anchor], [${GENERATED_TARGET_ATTRIBUTE}]`);
  return Array.from(elements).find((element) => (
    element.getAttribute('data-prototype-anchor') === target
    || element.getAttribute(GENERATED_TARGET_ATTRIBUTE) === target
  )) || null;
}

export function findPrototypeBindingElement(eventTarget) {
  if (!(eventTarget instanceof Element)) return null;
  if (isAnnotationUi(eventTarget)) return null;
  return eventTarget.closest(`[${GENERATED_TARGET_ATTRIBUTE}], [data-prototype-anchor]`);
}

export function getPrototypeTargetMetadata(element) {
  if (!(element instanceof Element)) return null;
  const anchorTarget = element.getAttribute('data-prototype-anchor');
  if (anchorTarget) {
    return {
      target: anchorTarget,
      kind: 'module',
      label: compactText(element.getAttribute('data-prototype-label') || anchorTarget),
      generated: false,
    };
  }

  const target = element.getAttribute(GENERATED_TARGET_ATTRIBUTE);
  if (!target) return null;
  return {
    target,
    kind: element.getAttribute(TARGET_KIND_ATTRIBUTE) || 'element',
    label: element.getAttribute(TARGET_LABEL_ATTRIBUTE) || target,
    generated: true,
  };
}

export function listPrototypeTargets(pageKey, root = document) {
  preparePrototypeTargets(pageKey, root);
  return Array.from(root.querySelectorAll(`[data-prototype-anchor], [${GENERATED_TARGET_ATTRIBUTE}]`))
    .map((element) => ({ element, ...getPrototypeTargetMetadata(element) }))
    .filter((item) => item.target);
}
