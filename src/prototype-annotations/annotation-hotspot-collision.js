const HOTSPOT_SELECTOR = '.paf-hotspot';
const ANNOTATION_PANEL_SELECTOR = '.paf-annotation-panel';
const MIN_GAP = 4;
const STEP = 26;
const MAX_SHIFT_STEPS = 8;
let timer = null;
let observer = null;

function visibleHotspots(root) {
  return Array.from(root.querySelectorAll?.(HOTSPOT_SELECTOR) || [])
    .filter((element) => element instanceof Element)
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
    });
}

function resetAutoOffset(element) {
  if (element.style.getPropertyValue('--paf-auto-offset-x') !== '0px') {
    element.style.setProperty('--paf-auto-offset-x', '0px');
  }
  if (element.style.getPropertyValue('--paf-auto-offset-y') !== '0px') {
    element.style.setProperty('--paf-auto-offset-y', '0px');
  }
  element.style.marginLeft = 'var(--paf-auto-offset-x, 0px)';
  element.style.marginTop = 'var(--paf-auto-offset-y, 0px)';
}

function overlaps(a, b) {
  return !(
    a.right + MIN_GAP <= b.left
    || a.left >= b.right + MIN_GAP
    || a.bottom + MIN_GAP <= b.top
    || a.top >= b.bottom + MIN_GAP
  );
}

function shiftedRect(rect, dx, dy) {
  return {
    left: rect.left + dx,
    right: rect.right + dx,
    top: rect.top + dy,
    bottom: rect.bottom + dy,
  };
}

function candidateOffsets() {
  const offsets = [{ x: 0, y: 0 }];
  for (let step = 1; step <= MAX_SHIFT_STEPS; step += 1) {
    const distance = STEP * step;
    offsets.push(
      { x: 0, y: distance },
      { x: 0, y: -distance },
      { x: distance, y: 0 },
      { x: -distance, y: 0 }
    );
  }
  return offsets;
}

export function layoutAnnotationHotspots(root = document) {
  if (typeof window === 'undefined') return [];
  const hotspots = visibleHotspots(root);
  hotspots.forEach(resetAutoOffset);

  const measured = hotspots
    .map((element, index) => ({ element, index, rect: element.getBoundingClientRect() }))
    .filter((item) => item.rect.width > 0 && item.rect.height > 0)
    .sort((left, right) => (
      left.rect.top - right.rect.top
      || left.rect.left - right.rect.left
      || left.index - right.index
    ));

  const placed = [];
  const result = [];
  const offsets = candidateOffsets();

  measured.forEach((item) => {
    const found = offsets.find((offset) => {
      const rect = shiftedRect(item.rect, offset.x, offset.y);
      if (rect.left < 4 || rect.top < 4 || rect.right > window.innerWidth - 4 || rect.bottom > window.innerHeight - 4) {
        return false;
      }
      return placed.every((previous) => !overlaps(rect, previous.rect));
    }) || { x: 0, y: 0 };

    if (found.x !== 0) item.element.style.setProperty('--paf-auto-offset-x', `${found.x}px`);
    if (found.y !== 0) item.element.style.setProperty('--paf-auto-offset-y', `${found.y}px`);

    const rect = shiftedRect(item.rect, found.x, found.y);
    placed.push({ element: item.element, rect });
    result.push({ element: item.element, offsetX: found.x, offsetY: found.y });
  });

  return result;
}

function run(root) {
  const annotationPanelVisible = Boolean(root.querySelector?.(ANNOTATION_PANEL_SELECTOR));
  if (!annotationPanelVisible) return;
  layoutAnnotationHotspots(root);
}

export function installAnnotationHotspotCollisionAvoidance(root = document) {
  if (typeof window === 'undefined' || !root?.body) return;
  if (timer !== null) return;

  const schedule = () => window.requestAnimationFrame(() => run(root));
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);

  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(schedule);
    observer.observe(root.body, { childList: true, subtree: true });
  }

  timer = window.setInterval(() => run(root), 300);
  schedule();
}
