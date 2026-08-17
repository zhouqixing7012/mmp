export const GENERATED_TARGET_ATTRIBUTE = 'data-prototype-generated-target';
export const GENERATED_SCOPE_ATTRIBUTE = 'data-prototype-generated-scope';
export const TARGET_KIND_ATTRIBUTE = 'data-prototype-target-kind';
export const TARGET_LABEL_ATTRIBUTE = 'data-prototype-target-label';

const PREPARE_SELECTOR = [
  '[data-prototype-bindable]',
  '.qw',
  'button',
  '[role="button"]',
  'th',
  '[role="columnheader"]',
  '.ant-form-item',
  '.ant-select',
  '.ant-picker',
  '.ant-input-affix-wrapper',
  '.ant-input-number',
  'input',
  'textarea',
  'select',
  '.ant-table-wrapper',
  '.ant-card',
  'form',
].join(',');

const CONTROL_SELECTOR = [
  '.ant-select',
  '.ant-picker',
  '.ant-input-affix-wrapper',
  '.ant-input-number',
  'input',
  'textarea',
  'select',
].join(',');

const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
  '.ant-tooltip',
  '.ant-popover',
  '.ant-select-dropdown',
  '.ant-message',
].join(', ');

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableKey(value) {
  const text = compactText(value).toLowerCase() || 'item';
  return encodeURIComponent(text)
    .replace(/%/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 72) || 'item';
}

function isAnnotationUi(element) {
  return Boolean(element?.closest?.(ANNOTATION_UI_SELECTOR));
}

function isControl(element) {
  return element.matches(CONTROL_SELECTOR);
}

function isRedundantContainer(element) {
  if (element.matches('.qw') && element.querySelector('[data-prototype-bindable="query-condition"]')) {
    return true;
  }
  if (isControl(element) && element.closest('[data-prototype-bindable="query-condition"], .ant-form-item')) {
    return true;
  }
  return false;
}

function getTargetKind(element) {
  const explicitKind = element.getAttribute('data-prototype-bindable');
  if (explicitKind) return explicitKind;
  if (element.matches('button, [role="button"]')) return 'button';
  if (element.matches('th, [role="columnheader"]')) return 'table-column';
  if (element.matches('.qw, .ant-form-item')) return 'field';
  if (isControl(element)) return 'control';
  if (element.matches('.ant-table-wrapper')) return 'table';
  if (element.matches('.ant-card')) return 'card';
  if (element.matches('form')) return 'form';
  return element.tagName.toLowerCase();
}

function getCardTitle(element) {
  const card = element.matches('.ant-card') ? element : element.closest('.ant-card');
  if (!card) return '';
  return compactText(card.querySelector('.ant-card-head-title')?.textContent);
}

function getFormLabel(element) {
  const formItem = element.matches('.ant-form-item') ? element : element.closest('.ant-form-item');
  if (!formItem) return '';
  return compactText(formItem.querySelector('.ant-form-item-label label')?.textContent).replace(/[:：]\s*$/, '');
}

function getQueryLabel(element) {
  const queryItem = element.matches('[data-prototype-bindable="query-condition"]')
    ? element
    : element.closest('[data-prototype-bindable="query-condition"]');
  if (!queryItem) return '';
  return compactText(queryItem.getAttribute('data-prototype-label') || queryItem.querySelector('span')?.textContent)
    .replace(/[:：]\s*$/, '');
}

function getControlPlaceholder(element) {
  if (element.matches('input, textarea, select')) {
    return compactText(
      element.getAttribute('placeholder')
      || element.getAttribute('aria-label')
      || element.getAttribute('name')
    );
  }

  return compactText(
    element.getAttribute('aria-label')
    || element.querySelector?.('input')?.getAttribute('placeholder')
    || element.querySelector?.('.ant-select-selection-placeholder')?.textContent
  );
}

function getTargetLabel(element) {
  const explicitLabel = compactText(element.getAttribute('data-prototype-label'));
  if (explicitLabel) return explicitLabel;

  const ariaLabel = compactText(element.getAttribute('aria-label'));
  if (ariaLabel) return ariaLabel;

  const title = compactText(element.getAttribute('title'));
  if (title) return title;

  const queryLabel = getQueryLabel(element);
  if (queryLabel) return queryLabel;

  const formLabel = getFormLabel(element);
  if (formLabel) return formLabel;

  if (element.matches('.ant-card')) {
    return getCardTitle(element) || '卡片区域';
  }

  if (element.matches('.ant-table-wrapper')) {
    return getCardTitle(element) || '表格';
  }

  if (element.matches('form')) {
    return getCardTitle(element) || '表单';
  }

  const placeholder = getControlPlaceholder(element);
  if (placeholder) return placeholder;

  return compactText(element.innerText || element.textContent).slice(0, 120);
}

function getSemanticContext(element, pageScope) {
  const parentAnchor = element.closest('[data-prototype-anchor]');
  const anchorTarget = parentAnchor?.getAttribute('data-prototype-anchor');
  if (anchorTarget && parentAnchor !== element) return anchorTarget;

  const cardTitle = getCardTitle(element);
  if (cardTitle && !element.matches('.ant-card')) return `card-${stableKey(cardTitle)}`;

  return `scope-${stableKey(pageScope || 'page')}`;
}

function clearGeneratedTargets(root) {
  root.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`).forEach((element) => {
    if (isAnnotationUi(element)) return;
    element.removeAttribute(GENERATED_TARGET_ATTRIBUTE);
    element.removeAttribute(GENERATED_SCOPE_ATTRIBUTE);
    element.removeAttribute(TARGET_KIND_ATTRIBUTE);
    element.removeAttribute(TARGET_LABEL_ATTRIBUTE);
  });
}

function collectCandidates(root) {
  return Array.from(root.querySelectorAll?.(PREPARE_SELECTOR) || [])
    .filter((element) => element instanceof Element)
    .filter((element) => !isAnnotationUi(element))
    .filter((element) => !element.hasAttribute('data-prototype-anchor'))
    .filter((element) => !isRedundantContainer(element));
}

export function preparePrototypeTargets(pageScope, root = document) {
  clearGeneratedTargets(root);

  const counters = new Map();
  const prepared = [];

  collectCandidates(root).forEach((element) => {
    const kind = getTargetKind(element);
    const label = getTargetLabel(element);
    if (!label && !element.hasAttribute('data-prototype-bindable')) return;

    const context = getSemanticContext(element, pageScope);
    const key = `${context}|${kind}|${stableKey(label)}`;
    const occurrence = (counters.get(key) || 0) + 1;
    counters.set(key, occurrence);

    const suffix = occurrence > 1 ? `-${occurrence}` : '';
    const target = `${context}::${kind}::${stableKey(label)}${suffix}`;

    element.setAttribute(GENERATED_TARGET_ATTRIBUTE, target);
    element.setAttribute(GENERATED_SCOPE_ATTRIBUTE, pageScope || 'page');
    element.setAttribute(TARGET_KIND_ATTRIBUTE, kind);
    element.setAttribute(TARGET_LABEL_ATTRIBUTE, label || kind);

    prepared.push({ element, target, kind, label: label || kind, generated: true });
  });

  return prepared;
}

function closestOutsideUi(eventTarget, selector) {
  const candidate = eventTarget?.closest?.(selector);
  return candidate && !isAnnotationUi(candidate) ? candidate : null;
}

export function findPrototypeBindingElement(eventTarget) {
  if (!(eventTarget instanceof Element) || isAnnotationUi(eventTarget)) return null;

  // 优先命中真正的操作对象，再逐级回退到字段和模块。
  return closestOutsideUi(eventTarget, '[data-prototype-bindable]:not([data-prototype-bindable="query-condition"])')
    || closestOutsideUi(eventTarget, 'button, [role="button"]')
    || closestOutsideUi(eventTarget, 'th, [role="columnheader"]')
    || closestOutsideUi(eventTarget, '[data-prototype-bindable="query-condition"], .qw')
    || closestOutsideUi(eventTarget, '.ant-form-item')
    || closestOutsideUi(eventTarget, CONTROL_SELECTOR)
    || closestOutsideUi(eventTarget, '[data-prototype-anchor]')
    || closestOutsideUi(eventTarget, '.ant-table-wrapper')
    || closestOutsideUi(eventTarget, '.ant-card')
    || closestOutsideUi(eventTarget, 'form');
}

export function getPrototypeTargetMetadata(element, pageScope, root = document) {
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

  if (
    !element.getAttribute(GENERATED_TARGET_ATTRIBUTE)
    || element.getAttribute(GENERATED_SCOPE_ATTRIBUTE) !== (pageScope || 'page')
  ) {
    preparePrototypeTargets(pageScope, root);
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

export function resolvePrototypeTarget(target, pageScope, root = document) {
  if (!target) return null;

  const anchors = Array.from(root.querySelectorAll?.('[data-prototype-anchor]') || []);
  const anchor = anchors.find((element) => element.getAttribute('data-prototype-anchor') === target);
  if (anchor) return anchor;

  preparePrototypeTargets(pageScope, root);
  const generated = Array.from(root.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`) || []);
  return generated.find((element) => element.getAttribute(GENERATED_TARGET_ATTRIBUTE) === target) || null;
}

export function listPrototypeTargets(pageScope, root = document) {
  preparePrototypeTargets(pageScope, root);

  const anchors = Array.from(root.querySelectorAll?.('[data-prototype-anchor]') || [])
    .filter((element) => !isAnnotationUi(element))
    .map((element) => ({ element, ...getPrototypeTargetMetadata(element, pageScope, root) }));

  const generated = Array.from(root.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`) || [])
    .filter((element) => !isAnnotationUi(element))
    .map((element) => ({ element, ...getPrototypeTargetMetadata(element, pageScope, root) }));

  return [...anchors, ...generated].filter((item) => item.target);
}
