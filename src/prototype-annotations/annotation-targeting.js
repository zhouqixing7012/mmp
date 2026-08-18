export const GENERATED_TARGET_ATTRIBUTE = 'data-prototype-generated-target';
export const GENERATED_SCOPE_ATTRIBUTE = 'data-prototype-generated-scope';
export const TARGET_KIND_ATTRIBUTE = 'data-prototype-target-kind';
export const TARGET_LABEL_ATTRIBUTE = 'data-prototype-target-label';
export const PROTOTYPE_OVERLAY_ATTRIBUTE = 'data-prototype-overlay';
export const PROTOTYPE_DISPLAY_ANCHOR_ATTRIBUTE = 'data-prototype-display-anchor';

const PRECISE_CONTROL_SELECTOR = [
  'button',
  '[role="button"]',
  'th',
  '[role="columnheader"]',
  '.ant-tabs-tab',
  '[role="tab"]',
  '.ant-radio-button-wrapper',
  '.ant-radio-wrapper',
  '[role="radio"]',
  '.ant-checkbox-wrapper',
  '[role="checkbox"]',
  '.ant-segmented-item',
  '.ant-switch',
  '[role="switch"]',
  '.ant-select',
  '.ant-picker',
  '.ant-input-affix-wrapper',
  '.ant-input-number',
  '.ant-slider',
  '.ant-rate',
  '.ant-upload',
  'input',
  'textarea',
  'select',
].join(',');

const PREPARE_SELECTOR = [
  '[data-prototype-bindable]',
  '.qw',
  PRECISE_CONTROL_SELECTOR,
  '.ant-form-item',
  '.ant-descriptions-item-label',
  '.ant-table-wrapper',
  '.ant-card',
  'form',
  'main',
  'section',
  'article',
  '[role="region"]',
  'div.bg-white',
].join(',');

const GENERIC_MODULE_SELECTOR = [
  '.ant-table-wrapper',
  '.ant-card',
  'form',
  'main',
  'section',
  'article',
  '[role="region"]',
  'div.bg-white',
].join(',');

const MODULE_BINDABLE_TYPES = new Set([
  'selection-modal',
  'selection-table',
  'module',
  'card',
  'table',
  'form',
]);

const ANNOTATION_UI_SELECTOR = [
  '.paf-annotation-panel',
  '.paf-hotspot',
  '[data-prototype-annotation-ui="true"]',
  '.ant-tooltip',
  '.ant-popover',
  '.ant-select-dropdown',
  '.ant-dropdown',
  '.ant-message',
  '.ant-notification',
].join(', ');

const BUSINESS_OVERLAY_SELECTOR = [
  `[${PROTOTYPE_OVERLAY_ATTRIBUTE}]`,
  '.ant-modal-wrap',
  '.ant-drawer',
  '.ant-image-preview-wrap',
  '[role="dialog"][aria-modal="true"]',
].join(',');

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function compactFieldLabel(value) {
  return compactText(value)
    .replace(/^[*＊]\s*/, '')
    .replace(/[:：]\s*$/, '');
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

function isNativeControlInsideComposite(element) {
  if (!element.matches('input, textarea, select')) return false;
  return Boolean(element.closest([
    '.ant-select',
    '.ant-picker',
    '.ant-input-affix-wrapper',
    '.ant-input-number',
    '.ant-radio-wrapper',
    '.ant-checkbox-wrapper',
  ].join(', ')));
}

function isRedundantContainer(element) {
  if (element.matches('.qw') && element.querySelector('[data-prototype-bindable="query-condition"]')) {
    return true;
  }
  if (isNativeControlInsideComposite(element)) return true;
  if (element.matches('div.bg-white') && element.closest('.ant-card, .ant-table-wrapper')) {
    return true;
  }
  return false;
}

function getTargetKind(element) {
  const explicitKind = element.getAttribute('data-prototype-bindable');
  if (explicitKind) return explicitKind;
  if (element.matches('.ant-descriptions-item-label')) return 'detail-field';
  if (element.matches('button, [role="button"]')) return 'button';
  if (element.matches('th, [role="columnheader"]')) return 'table-column';
  if (element.matches('.ant-tabs-tab, [role="tab"]')) return 'tab';
  if (element.matches('.ant-radio-button-wrapper, .ant-radio-wrapper, [role="radio"]')) return 'radio';
  if (element.matches('.ant-checkbox-wrapper, [role="checkbox"]')) return 'checkbox';
  if (element.matches('.ant-segmented-item')) return 'segment';
  if (element.matches('.ant-switch, [role="switch"]')) return 'switch';
  if (element.matches('.ant-select')) return 'select';
  if (element.matches('.ant-picker')) return 'date-picker';
  if (element.matches('.ant-slider')) return 'slider';
  if (element.matches('.ant-rate')) return 'rate';
  if (element.matches('.ant-upload')) return 'upload';
  if (element.matches('.ant-input-affix-wrapper, .ant-input-number, input, textarea, select')) return 'control';
  if (element.matches('.qw, .ant-form-item')) return 'field';
  if (element.matches('.ant-table-wrapper')) return 'table';
  if (element.matches('.ant-card')) return 'card';
  if (element.matches('form')) return 'form';
  return 'module';
}

function getDirectHeading(element) {
  const directHeading = Array.from(element.children || []).find((child) => (
    child.matches?.('h1, h2, h3, h4, h5, h6, [data-prototype-title]')
  ));
  if (directHeading) return compactText(directHeading.textContent);

  const nestedHeading = element.querySelector?.('h1, h2, h3, h4, h5, h6, [data-prototype-title]');
  return compactText(nestedHeading?.textContent);
}

function getPrimaryTitleAnchor(titleContainer) {
  if (!(titleContainer instanceof Element)) return null;

  const explicit = titleContainer.querySelector?.(
    `[${PROTOTYPE_DISPLAY_ANCHOR_ATTRIBUTE}], [data-prototype-title]`
  );
  if (explicit) return explicit;

  const firstSpaceItem = titleContainer.querySelector?.('.ant-space-item');
  if (firstSpaceItem) return firstSpaceItem.firstElementChild || firstSpaceItem;

  const secondary = titleContainer.querySelector?.('.ant-typography-secondary');
  if (secondary) {
    const firstStableChild = Array.from(titleContainer.children || []).find((child) => (
      !child.matches?.('.ant-typography-secondary')
    ));
    if (firstStableChild) return firstStableChild;
  }

  return titleContainer.firstElementChild || titleContainer;
}

function getPrimaryTitleText(titleContainer) {
  if (!(titleContainer instanceof Element)) return '';

  const primaryAnchor = getPrimaryTitleAnchor(titleContainer);
  if (primaryAnchor && primaryAnchor !== titleContainer) {
    const primaryText = compactText(primaryAnchor.textContent);
    if (primaryText) return primaryText;
  }

  const clone = titleContainer.cloneNode(true);
  clone.querySelectorAll?.('.ant-typography-secondary').forEach((node) => node.remove());
  return compactText(clone.textContent || titleContainer.textContent);
}

function getCardTitle(element) {
  const card = element.matches('.ant-card') ? element : element.closest('.ant-card');
  if (!card) return '';
  return getPrimaryTitleText(card.querySelector('.ant-card-head-title'));
}

function getFormLabel(element) {
  const formItem = element.matches('.ant-form-item') ? element : element.closest('.ant-form-item');
  if (!formItem) return '';
  return compactFieldLabel(formItem.querySelector('.ant-form-item-label label')?.textContent);
}

function getQueryLabel(element) {
  const queryItem = element.matches('[data-prototype-bindable="query-condition"]')
    ? element
    : element.closest('[data-prototype-bindable="query-condition"]');
  if (!queryItem) return '';
  return compactFieldLabel(queryItem.getAttribute('data-prototype-label') || queryItem.querySelector('span')?.textContent);
}

function findDescriptionsLabelElement(element) {
  if (!(element instanceof Element)) return null;
  if (element.matches('.ant-descriptions-item-label')) return element;

  const item = element.closest('.ant-descriptions-item');
  const itemLabel = item?.querySelector?.('.ant-descriptions-item-label');
  if (itemLabel) return itemLabel;

  const content = element.closest('.ant-descriptions-item-content');
  if (!content) return null;
  const previous = content.previousElementSibling;
  return previous?.matches?.('.ant-descriptions-item-label') ? previous : null;
}

function getDescriptionsLabel(element) {
  return compactFieldLabel(findDescriptionsLabelElement(element)?.textContent);
}

function getPreciseControlLabel(element) {
  if (element.matches('.ant-tabs-tab, [role="tab"]')) {
    return compactText(element.querySelector('.ant-tabs-tab-btn')?.textContent || element.textContent);
  }

  if (element.matches('.ant-radio-button-wrapper, .ant-radio-wrapper, [role="radio"]')) {
    return compactText(element.textContent) || compactText(element.getAttribute('aria-label'));
  }

  if (element.matches('.ant-checkbox-wrapper, [role="checkbox"]')) {
    return compactText(element.textContent) || compactText(element.getAttribute('aria-label'));
  }

  if (element.matches('.ant-segmented-item')) {
    return compactText(element.querySelector('.ant-segmented-item-label')?.textContent || element.textContent);
  }

  if (element.matches('.ant-select')) {
    return compactText(
      element.querySelector('.ant-select-selection-item')?.getAttribute('title')
      || element.querySelector('.ant-select-selection-item')?.textContent
      || element.querySelector('.ant-select-selection-placeholder')?.textContent
      || element.querySelector('input')?.getAttribute('placeholder')
    );
  }

  return '';
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
  const formLabel = getFormLabel(element);
  const descriptionsLabel = getDescriptionsLabel(element);
  const preciseLabel = getPreciseControlLabel(element);

  if (element.matches([
    '.ant-tabs-tab',
    '[role="tab"]',
    '.ant-radio-button-wrapper',
    '.ant-radio-wrapper',
    '[role="radio"]',
    '.ant-checkbox-wrapper',
    '[role="checkbox"]',
    '.ant-segmented-item',
  ].join(', ')) && preciseLabel) {
    const fieldLabel = queryLabel || formLabel || descriptionsLabel;
    return fieldLabel ? `${fieldLabel}-${preciseLabel}` : preciseLabel;
  }

  if (queryLabel) return queryLabel;
  if (formLabel) return formLabel;
  if (descriptionsLabel) return descriptionsLabel;
  if (preciseLabel) return preciseLabel;

  if (element.matches('.ant-card')) {
    return getCardTitle(element) || getDirectHeading(element) || '卡片区域';
  }

  if (element.matches('.ant-table-wrapper')) {
    return getCardTitle(element) || '表格';
  }

  if (element.matches('form')) {
    return getCardTitle(element) || getDirectHeading(element) || '表单';
  }

  if (element.matches('main, section, article, [role="region"], div.bg-white')) {
    return getDirectHeading(element) || getCardTitle(element) || '内容区域';
  }

  const placeholder = getControlPlaceholder(element);
  if (placeholder) return placeholder;

  if (element.matches('.ant-switch, [role="switch"]')) return '开关';
  if (element.matches('.ant-slider')) return '滑块';
  if (element.matches('.ant-rate')) return '评分';
  if (element.matches('.ant-upload')) return compactText(element.textContent) || '上传';

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

function findDetailFieldFromValue(eventTarget) {
  const valueCell = closestOutsideUi(eventTarget, '[data-prototype-detail-value]');
  if (!valueCell) return null;
  const labelCell = valueCell.previousElementSibling;
  return labelCell?.matches?.('[data-prototype-bindable="detail-field"]') ? labelCell : null;
}

function findDescriptionsFieldFromValue(eventTarget) {
  const label = findDescriptionsLabelElement(eventTarget);
  return label && !isAnnotationUi(label) ? label : null;
}

function findPreciseControl(eventTarget) {
  return closestOutsideUi(eventTarget, 'button, [role="button"]')
    || closestOutsideUi(eventTarget, '.ant-descriptions-item-label')
    || closestOutsideUi(eventTarget, 'th, [role="columnheader"]')
    || closestOutsideUi(eventTarget, '.ant-tabs-tab, [role="tab"]')
    || closestOutsideUi(eventTarget, '.ant-radio-button-wrapper, .ant-radio-wrapper, [role="radio"]')
    || closestOutsideUi(eventTarget, '.ant-checkbox-wrapper, [role="checkbox"]')
    || closestOutsideUi(eventTarget, '.ant-segmented-item')
    || closestOutsideUi(eventTarget, '.ant-switch, [role="switch"]')
    || closestOutsideUi(eventTarget, '.ant-select')
    || closestOutsideUi(eventTarget, '.ant-picker')
    || closestOutsideUi(eventTarget, '.ant-slider')
    || closestOutsideUi(eventTarget, '.ant-rate')
    || closestOutsideUi(eventTarget, '.ant-upload')
    || closestOutsideUi(eventTarget, '.ant-input-affix-wrapper, .ant-input-number')
    || closestOutsideUi(eventTarget, 'input, textarea, select');
}

export function findPrototypeBindingElement(eventTarget) {
  if (!(eventTarget instanceof Element) || isAnnotationUi(eventTarget)) return null;

  const preciseControl = findPreciseControl(eventTarget);
  if (preciseControl) return preciseControl;

  const detailField = findDetailFieldFromValue(eventTarget);
  if (detailField) return detailField;

  const descriptionsField = findDescriptionsFieldFromValue(eventTarget);
  if (descriptionsField) return descriptionsField;

  return closestOutsideUi(eventTarget, '[data-prototype-bindable]:not([data-prototype-bindable="query-condition"])')
    || closestOutsideUi(eventTarget, '[data-prototype-bindable="query-condition"], .qw')
    || closestOutsideUi(eventTarget, '.ant-form-item')
    || closestOutsideUi(eventTarget, '[data-prototype-anchor]')
    || closestOutsideUi(eventTarget, GENERIC_MODULE_SELECTOR);
}

function isModuleDisplayTarget(element) {
  if (!(element instanceof Element)) return false;
  const bindableType = element.getAttribute('data-prototype-bindable');
  return element.matches(GENERIC_MODULE_SELECTOR)
    || element.hasAttribute('data-prototype-anchor')
    || MODULE_BINDABLE_TYPES.has(bindableType);
}

function compactTitleAnchor(titleContainer) {
  if (!(titleContainer instanceof Element)) return null;
  return getPrimaryTitleAnchor(titleContainer) || titleContainer;
}

function findModuleTitleAnchor(element) {
  const explicit = element.matches(`[${PROTOTYPE_DISPLAY_ANCHOR_ATTRIBUTE}]`)
    ? element
    : element.querySelector?.(`[${PROTOTYPE_DISPLAY_ANCHOR_ATTRIBUTE}]`);
  if (explicit) return explicit;

  if (element.matches('.ant-card')) {
    const cardTitle = compactTitleAnchor(element.querySelector('.ant-card-head-title'));
    if (cardTitle) return cardTitle;
  }

  if (element.matches('.ant-modal-wrap, [role="dialog"][aria-modal="true"]')) {
    const modalTitle = element.querySelector('.ant-modal-title, [data-prototype-title], h1, h2, h3, h4');
    if (modalTitle) return compactTitleAnchor(modalTitle);
  }

  if (element.matches('.ant-drawer')) {
    const drawerTitle = element.querySelector('.ant-drawer-title, [data-prototype-title], h1, h2, h3, h4');
    if (drawerTitle) return compactTitleAnchor(drawerTitle);
  }

  const ownHeading = Array.from(element.children || []).find((child) => (
    child.matches?.('h1, h2, h3, h4, h5, h6, [data-prototype-title]')
  ));
  if (ownHeading) return compactTitleAnchor(ownHeading);

  const nestedHeading = element.querySelector?.('h1, h2, h3, h4, h5, h6, [data-prototype-title]');
  if (nestedHeading) return compactTitleAnchor(nestedHeading);

  const card = element.closest('.ant-card');
  const contextualCardTitle = compactTitleAnchor(card?.querySelector('.ant-card-head-title'));
  return contextualCardTitle || null;
}

export function getPrototypeDisplayAnchor(element) {
  if (!(element instanceof Element)) return null;
  if (!isModuleDisplayTarget(element)) return element;
  return findModuleTitleAnchor(element) || element;
}

function isOverlayVisible(element) {
  if (!element?.isConnected) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;

  const style = typeof window !== 'undefined' && window.getComputedStyle
    ? window.getComputedStyle(element)
    : null;
  if (style?.display === 'none' || style?.visibility === 'hidden') return false;

  return true;
}

function readOverlayZIndex(element) {
  const style = typeof window !== 'undefined' && window.getComputedStyle
    ? window.getComputedStyle(element)
    : null;
  const parsed = Number.parseInt(style?.zIndex || '', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getActivePrototypeOverlay(root = document) {
  const overlays = Array.from(root.querySelectorAll?.(BUSINESS_OVERLAY_SELECTOR) || [])
    .filter((element) => element instanceof Element)
    .filter((element) => !isAnnotationUi(element))
    .filter(isOverlayVisible);

  if (!overlays.length) return null;

  return overlays.reduce((active, current) => {
    if (!active) return current;
    const activeZIndex = readOverlayZIndex(active);
    const currentZIndex = readOverlayZIndex(current);
    if (currentZIndex > activeZIndex) return current;
    if (currentZIndex < activeZIndex) return active;

    const relation = active.compareDocumentPosition(current);
    return relation & Node.DOCUMENT_POSITION_FOLLOWING ? current : active;
  }, null);
}

export function isPrototypeElementInActiveLayer(element, root = document) {
  if (!(element instanceof Element)) return false;
  const overlay = getActivePrototypeOverlay(root);
  if (!overlay) return true;
  return overlay === element || overlay.contains(element);
}

export function getPrototypeTargetMetadata(element, pageScope, root = document) {
  if (!(element instanceof Element)) return null;

  const anchorTarget = element.getAttribute('data-prototype-anchor');
  if (anchorTarget) {
    return {
      target: anchorTarget,
      kind: getTargetKind(element),
      label: getTargetLabel(element) || anchorTarget,
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

function splitGeneratedTarget(target) {
  const parts = String(target || '').split('::');
  if (parts.length !== 3) return null;
  return { context: parts[0], kind: parts[1], key: parts[2] };
}

function internalScopeFromPageScope(pageScope) {
  const parts = String(pageScope || '').split('::');
  return parts.length > 1 ? parts.slice(1).join('::') : '';
}

function findCurrentPageScopeRoot(pageScope, root) {
  if (!root?.querySelectorAll) return root;
  const internalScope = internalScopeFromPageScope(pageScope);
  if (!internalScope) return root;

  if (
    typeof Element !== 'undefined'
    && root instanceof Element
    && root.getAttribute('data-prototype-page-scope') === internalScope
  ) {
    return root;
  }

  return Array.from(root.querySelectorAll('[data-prototype-page-scope]'))
    .find((element) => element.getAttribute('data-prototype-page-scope') === internalScope)
    || root;
}

function directButtonLabel(element) {
  return compactText(
    element?.getAttribute?.('aria-label')
    || element?.innerText
    || element?.textContent
  );
}

function findUniqueButtonBySemanticKey(searchRoot, wantedKey) {
  if (!searchRoot?.querySelectorAll || !wantedKey) return null;

  const buttons = Array.from(searchRoot.querySelectorAll('button, [role="button"]'))
    .filter((element) => element instanceof Element)
    .filter((element) => !isAnnotationUi(element))
    .filter(isOverlayVisible);

  const keyCandidates = [wantedKey];
  const withoutOccurrence = wantedKey.replace(/-\d+$/, '');
  if (withoutOccurrence !== wantedKey) keyCandidates.push(withoutOccurrence);

  for (const key of keyCandidates) {
    const matches = buttons.filter((element) => stableKey(directButtonLabel(element)) === key);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  return null;
}

function findDirectSemanticButtonTarget(target, pageScope, root) {
  const wanted = splitGeneratedTarget(target);
  if (!wanted || wanted.kind !== 'button') return null;

  const overlay = getActivePrototypeOverlay(root);
  if (overlay) {
    const overlayMatch = findUniqueButtonBySemanticKey(overlay, wanted.key);
    if (overlayMatch) return overlayMatch;
  }

  const pageRoot = findCurrentPageScopeRoot(pageScope, root);
  return findUniqueButtonBySemanticKey(pageRoot, wanted.key);
}

function findExactAnchorInRoot(target, searchRoot) {
  if (!searchRoot?.querySelectorAll) return null;
  return Array.from(searchRoot.querySelectorAll('[data-prototype-anchor]'))
    .find((element) => element.getAttribute('data-prototype-anchor') === target)
    || null;
}

function findCompatibleGeneratedTarget(target, pageScope, root) {
  const wanted = splitGeneratedTarget(target);
  if (!wanted) return null;

  const semanticMatches = Array.from(root.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`) || [])
    .filter((element) => element.getAttribute(GENERATED_SCOPE_ATTRIBUTE) === (pageScope || 'page'))
    .filter((element) => {
      const current = splitGeneratedTarget(element.getAttribute(GENERATED_TARGET_ATTRIBUTE));
      return Boolean(current && current.kind === wanted.kind && current.key === wanted.key);
    });

  if (wanted.kind === 'button' && semanticMatches.length === 1) {
    return semanticMatches[0];
  }

  const compatible = semanticMatches.filter((element) => {
    const current = splitGeneratedTarget(element.getAttribute(GENERATED_TARGET_ATTRIBUTE));
    if (!current) return false;
    if (current.context === wanted.context) return true;

    return current.context.startsWith(wanted.context) || wanted.context.startsWith(current.context);
  });

  return compatible.length === 1 ? compatible[0] : null;
}

export function resolvePrototypeTarget(target, pageScope, root = document) {
  if (!target) return null;

  const wanted = splitGeneratedTarget(target);
  const pageRoot = wanted?.kind === 'button'
    ? findCurrentPageScopeRoot(pageScope, root)
    : root;
  const overlay = wanted?.kind === 'button' ? getActivePrototypeOverlay(root) : null;

  // Button anchors are page scoped from the very first lookup. Different workbench pages
  // are allowed to have identical semantic targets (for example "同意" under "审批信息"),
  // so a document-wide exact-anchor lookup is unsafe for button targets.
  const anchor = wanted?.kind === 'button'
    ? (findExactAnchorInRoot(target, overlay) || findExactAnchorInRoot(target, pageRoot))
    : findExactAnchorInRoot(target, root);
  if (anchor) return anchor;

  // Button targets are resolved directly from the current page's live DOM semantics.
  // Parent Card/module context remains useful when generating a target, but is no longer
  // a runtime prerequisite. This avoids coupling approval actions to registry/bridge state,
  // stale anchors, React effect order or Card title changes.
  const directButton = findDirectSemanticButtonTarget(target, pageScope, root);
  if (directButton) return directButton;

  // Once a target is known to be a button, every fallback is also constrained to the
  // current page-scope container. This prevents prepare/compatibility fallback from
  // accidentally picking a same-label button that belongs to another workbench page.
  const resolutionRoot = wanted?.kind === 'button' ? pageRoot : root;

  const existingGenerated = Array.from(resolutionRoot.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`) || [])
    .find((element) => (
      element.getAttribute(GENERATED_TARGET_ATTRIBUTE) === target
      && element.getAttribute(GENERATED_SCOPE_ATTRIBUTE) === (pageScope || 'page')
    ));
  if (existingGenerated) return existingGenerated;

  const existingCompatible = findCompatibleGeneratedTarget(target, pageScope, resolutionRoot);
  if (existingCompatible) return existingCompatible;

  preparePrototypeTargets(pageScope, resolutionRoot);
  const generated = Array.from(resolutionRoot.querySelectorAll?.(`[${GENERATED_TARGET_ATTRIBUTE}]`) || []);
  const exact = generated.find((element) => element.getAttribute(GENERATED_TARGET_ATTRIBUTE) === target);
  return exact || findCompatibleGeneratedTarget(target, pageScope, resolutionRoot);
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
